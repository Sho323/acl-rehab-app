const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../utils/auth');
const db = require('../config/database');
const logger = require('../utils/logger');

// AI分析を開始
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { videoId, analysisType = 'knee_in_toe_out' } = req.body;

    if (!videoId) {
      return res.status(400).json({ message: '動画IDが必要です' });
    }

    // 動画の存在確認
    const videoQuery = `
      SELECT id, filename, file_path 
      FROM video_uploads 
      WHERE id = ? AND patient_id = ?
    `;

    const [videos] = await db.execute(videoQuery, [videoId, patientId]);

    if (videos.length === 0) {
      return res.status(404).json({ message: '動画が見つかりません' });
    }

    // 既存の分析結果をチェック
    const existingQuery = `
      SELECT id, analysis_status 
      FROM ai_analysis_results 
      WHERE video_id = ?
    `;

    const [existing] = await db.execute(existingQuery, [videoId]);

    if (existing.length > 0) {
      const analysisId = existing[0].id;
      
      if (existing[0].analysis_status === 'processing') {
        return res.json({
          success: true,
          data: {
            analysisId,
            status: 'processing',
            message: '分析が既に進行中です'
          }
        });
      }
    }

    // 新しい分析レコードを作成
    const insertQuery = `
      INSERT INTO ai_analysis_results (
        video_id, 
        patient_id, 
        analysis_type, 
        analysis_status,
        started_at
      ) VALUES (?, ?, ?, 'processing', NOW())
      ON DUPLICATE KEY UPDATE
        analysis_status = 'processing',
        started_at = NOW(),
        error_message = NULL
    `;

    const [result] = await db.execute(insertQuery, [videoId, patientId, analysisType]);
    const analysisId = existing.length > 0 ? existing[0].id : result.insertId;

    // AI分析をバックグラウンドで実行（実際の実装では非同期処理）
    processAIAnalysis(analysisId, videos[0].file_path, analysisType)
      .catch(error => {
        logger.error('AI分析エラー:', error);
      });

    logger.info(`AI分析開始: analysis_id=${analysisId}, video_id=${videoId}, patient_id=${patientId}`);

    res.json({
      success: true,
      data: {
        analysisId,
        status: 'processing',
        message: 'AI分析を開始しました'
      }
    });

  } catch (error) {
    logger.error('AI分析開始エラー:', error);
    res.status(500).json({ 
      message: 'AI分析の開始に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// AI分析結果を取得
router.get('/results/:analysisId', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { analysisId } = req.params;

    const query = `
      SELECT 
        aar.*,
        vu.filename,
        vu.original_name,
        e.name as exercise_name
      FROM ai_analysis_results aar
      JOIN video_uploads vu ON aar.video_id = vu.id
      LEFT JOIN exercises e ON vu.exercise_id = e.id
      WHERE aar.id = ? AND aar.patient_id = ?
    `;

    const [results] = await db.execute(query, [analysisId, patientId]);

    if (results.length === 0) {
      return res.status(404).json({ message: '分析結果が見つかりません' });
    }

    const result = results[0];

    // JSONフィールドをパース
    let analysisData = null;
    if (result.analysis_data) {
      try {
        analysisData = JSON.parse(result.analysis_data);
      } catch (error) {
        logger.warn('分析データのパースに失敗:', error);
      }
    }

    res.json({
      success: true,
      data: {
        ...result,
        analysis_data: analysisData
      }
    });

  } catch (error) {
    logger.error('AI分析結果取得エラー:', error);
    res.status(500).json({ 
      message: '分析結果の取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 患者のAI分析履歴を取得
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { limit = 20, offset = 0, status } = req.query;

    let query = `
      SELECT 
        aar.*,
        vu.filename,
        vu.original_name,
        e.name as exercise_name
      FROM ai_analysis_results aar
      JOIN video_uploads vu ON aar.video_id = vu.id
      LEFT JOIN exercises e ON vu.exercise_id = e.id
      WHERE aar.patient_id = ?
    `;

    const params = [patientId];

    if (status) {
      query += ' AND aar.analysis_status = ?';
      params.push(status);
    }

    query += ' ORDER BY aar.started_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [history] = await db.execute(query, params);

    // 総数を取得
    let countQuery = 'SELECT COUNT(*) as total FROM ai_analysis_results WHERE patient_id = ?';
    const countParams = [patientId];

    if (status) {
      countQuery += ' AND analysis_status = ?';
      countParams.push(status);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        history,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < total
        }
      }
    });

  } catch (error) {
    logger.error('AI分析履歴取得エラー:', error);
    res.status(500).json({ 
      message: '分析履歴の取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// AI分析フィードバックを取得
router.get('/feedback/:analysisId', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { analysisId } = req.params;

    const query = `
      SELECT 
        aar.feedback,
        aar.knee_in_score,
        aar.toe_out_score,
        aar.overall_score,
        aar.recommendations,
        aar.analysis_status,
        vu.original_name
      FROM ai_analysis_results aar
      JOIN video_uploads vu ON aar.video_id = vu.id
      WHERE aar.id = ? AND aar.patient_id = ?
    `;

    const [results] = await db.execute(query, [analysisId, patientId]);

    if (results.length === 0) {
      return res.status(404).json({ message: '分析結果が見つかりません' });
    }

    const result = results[0];

    if (result.analysis_status !== 'completed') {
      return res.json({
        success: true,
        data: {
          status: result.analysis_status,
          message: result.analysis_status === 'processing' ? '分析中です' : '分析に失敗しました'
        }
      });
    }

    // レコメンデーションをパース
    let recommendations = null;
    if (result.recommendations) {
      try {
        recommendations = JSON.parse(result.recommendations);
      } catch (error) {
        logger.warn('レコメンデーションのパースに失敗:', error);
      }
    }

    res.json({
      success: true,
      data: {
        feedback: result.feedback,
        scores: {
          kneeIn: result.knee_in_score,
          toeOut: result.toe_out_score,
          overall: result.overall_score
        },
        recommendations,
        videoName: result.original_name
      }
    });

  } catch (error) {
    logger.error('AI分析フィードバック取得エラー:', error);
    res.status(500).json({ 
      message: 'フィードバックの取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// AI分析処理（実際の実装では外部AI APIまたはMLモデルを使用）
async function processAIAnalysis(analysisId, filePath, analysisType) {
  try {
    // より現実的な分析時間（3-8秒）
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 5000));

    // より現実的な分析結果を生成
    const kneeInScore = generateRealisticScore('knee_in');
    const toeOutScore = generateRealisticScore('toe_out');
    const overallScore = (kneeInScore + toeOutScore) / 2;

    const feedback = generateFeedback(kneeInScore, toeOutScore, overallScore);
    const recommendations = generateRecommendations(kneeInScore, toeOutScore);

    const analysisData = {
      keyPoints: generateKeyPoints(),
      movementPattern: generateMovementPattern(),
      frameAnalysis: generateFrameAnalysis()
    };

    // 結果をデータベースに保存
    const updateQuery = `
      UPDATE ai_analysis_results 
      SET 
        analysis_status = 'completed',
        knee_in_score = ?,
        toe_out_score = ?,
        overall_score = ?,
        feedback = ?,
        recommendations = ?,
        analysis_data = ?,
        analyzed_at = NOW()
      WHERE id = ?
    `;

    await db.execute(updateQuery, [
      kneeInScore,
      toeOutScore,
      overallScore,
      feedback,
      JSON.stringify(recommendations),
      JSON.stringify(analysisData),
      analysisId
    ]);

    logger.info(`AI分析完了: analysis_id=${analysisId}, overall_score=${overallScore.toFixed(2)}`);

  } catch (error) {
    logger.error('AI分析処理エラー:', error);

    // エラー状態を更新
    const errorQuery = `
      UPDATE ai_analysis_results 
      SET 
        analysis_status = 'failed',
        error_message = ?,
        analyzed_at = NOW()
      WHERE id = ?
    `;

    await db.execute(errorQuery, [error.message, analysisId]);
  }
}

// フィードバック生成
function generateFeedback(kneeInScore, toeOutScore, overallScore) {
  let feedback = '';

  if (overallScore >= 80) {
    feedback = '素晴らしい動作です！膝の内側への傾きと足先の外向きが適切にコントロールされています。';
  } else if (overallScore >= 60) {
    feedback = '良い動作ですが、さらに改善の余地があります。';
  } else if (overallScore >= 40) {
    feedback = '動作に改善が必要です。';
  } else {
    feedback = '動作パターンに大きな問題があります。理学療法士にご相談ください。';
  }

  if (kneeInScore < 50) {
    feedback += ' 膝が内側に入りすぎています。';
  }

  if (toeOutScore < 50) {
    feedback += ' 足先の向きに注意が必要です。';
  }

  return feedback;
}

// レコメンデーション生成
function generateRecommendations(kneeInScore, toeOutScore) {
  const recommendations = [];

  if (kneeInScore < 60) {
    recommendations.push({
      category: 'knee_alignment',
      title: '膝のアライメント改善',
      description: '膝が内側に入らないよう意識しましょう',
      exercises: ['ヒップアブダクション', 'サイドステップ', 'クラムシェル']
    });
  }

  if (toeOutScore < 60) {
    recommendations.push({
      category: 'foot_position',
      title: '足部ポジション改善',
      description: '足先の向きを適切に保ちましょう',
      exercises: ['アンクルモビリティ', 'カーフレイズ', 'バランストレーニング']
    });
  }

  recommendations.push({
    category: 'general',
    title: '全体的な動作改善',
    description: 'ゆっくりとした動作から始めて、正確性を重視しましょう',
    exercises: ['スクワット基礎練習', 'ミラートレーニング', 'スローモーション練習']
  });

  return recommendations;
}

// キーポイント生成
function generateKeyPoints() {
  return [
    { frame: 10, point: 'knee', x: 150, y: 200, confidence: 0.95 },
    { frame: 10, point: 'ankle', x: 145, y: 300, confidence: 0.92 },
    { frame: 20, point: 'knee', x: 148, y: 195, confidence: 0.93 },
    { frame: 20, point: 'ankle', x: 142, y: 295, confidence: 0.91 }
  ];
}

// 動作パターン生成
function generateMovementPattern() {
  return {
    phases: [
      { name: '開始姿勢', startFrame: 0, endFrame: 10, quality: 'good' },
      { name: '下降局面', startFrame: 10, endFrame: 25, quality: 'fair' },
      { name: '最下点', startFrame: 25, endFrame: 30, quality: 'good' },
      { name: '上昇局面', startFrame: 30, endFrame: 45, quality: 'fair' },
      { name: '終了姿勢', startFrame: 45, endFrame: 50, quality: 'good' }
    ]
  };
}

// フレーム分析生成
function generateFrameAnalysis() {
  const frames = [];
  for (let i = 0; i < 50; i += 5) {
    frames.push({
      frame: i,
      kneeAngle: 90 + Math.sin(i * 0.1) * 30,
      ankleAngle: 85 + Math.cos(i * 0.1) * 15,
      stability: Math.random() * 100
    });
  }
  return frames;
}

// より現実的なスコア生成
function generateRealisticScore(type) {
  // 正規分布に近い値を生成（平均75、標準偏差15）
  const random1 = Math.random();
  const random2 = Math.random();
  const normalRandom = Math.sqrt(-2 * Math.log(random1)) * Math.cos(2 * Math.PI * random2);
  
  let score = 75 + normalRandom * 15;
  
  // type別の調整
  if (type === 'knee_in') {
    // knee-inは少し低めの傾向
    score = score - 5;
  } else if (type === 'toe_out') {
    // toe-outは比較的良好
    score = score + 3;
  }
  
  // 0-100の範囲に制限
  return Math.max(0, Math.min(100, Math.round(score)));
}

module.exports = router;