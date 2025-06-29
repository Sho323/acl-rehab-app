const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authenticateToken } = require('../utils/auth');
const db = require('../config/database');
const logger = require('../utils/logger');

// アップロードディレクトリの設定
const uploadDir = path.join(__dirname, '../../uploads/videos');

// アップロードディレクトリが存在しない場合は作成
const ensureUploadDir = async () => {
  try {
    await fs.access(uploadDir);
  } catch (error) {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

// multerの設定
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const patientId = req.user.patientId;
    const ext = path.extname(file.originalname);
    cb(null, `patient_${patientId}_${timestamp}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // ビデオファイルのみ許可
  const allowedMimeTypes = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('サポートされていないファイル形式です。MP4、MOV、AVI、WebMファイルのみアップロード可能です。'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB制限
  }
});

// 動画アップロード
router.post('/upload', authenticateToken, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '動画ファイルが選択されていません' });
    }

    const patientId = req.user.patientId;
    const { exerciseId, sessionId, notes } = req.body;

    // データベースに動画情報を保存
    const insertQuery = `
      INSERT INTO video_uploads (
        patient_id, 
        exercise_id, 
        session_id, 
        filename, 
        original_name, 
        file_path, 
        file_size, 
        mime_type,
        notes,
        upload_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'uploaded')
    `;

    const [result] = await db.execute(insertQuery, [
      patientId,
      exerciseId || null,
      sessionId || null,
      req.file.filename,
      req.file.originalname,
      req.file.path,
      req.file.size,
      req.file.mimetype,
      notes || null
    ]);

    const videoId = result.insertId;

    logger.info(`動画アップロード完了: patient_id=${patientId}, video_id=${videoId}, filename=${req.file.filename}`);

    res.json({
      success: true,
      data: {
        videoId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        uploadedAt: new Date()
      }
    });

  } catch (error) {
    logger.error('動画アップロードエラー:', error);
    
    // アップロードされたファイルを削除
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (deleteError) {
        logger.error('一時ファイル削除エラー:', deleteError);
      }
    }

    res.status(500).json({ 
      message: '動画のアップロードに失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 患者の動画一覧を取得
router.get('/', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { limit = 20, offset = 0, exerciseId } = req.query;

    let query = `
      SELECT 
        vu.*,
        e.name as exercise_name,
        aar.analysis_status,
        aar.knee_in_score,
        aar.toe_out_score,
        aar.overall_score
      FROM video_uploads vu
      LEFT JOIN exercises e ON vu.exercise_id = e.id
      LEFT JOIN ai_analysis_results aar ON vu.id = aar.video_id
      WHERE vu.patient_id = ?
    `;

    const params = [patientId];

    if (exerciseId) {
      query += ' AND vu.exercise_id = ?';
      params.push(exerciseId);
    }

    query += ' ORDER BY vu.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [videos] = await db.execute(query, params);

    // 総数を取得
    let countQuery = 'SELECT COUNT(*) as total FROM video_uploads WHERE patient_id = ?';
    const countParams = [patientId];

    if (exerciseId) {
      countQuery += ' AND exercise_id = ?';
      countParams.push(exerciseId);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < total
        }
      }
    });

  } catch (error) {
    logger.error('動画一覧取得エラー:', error);
    res.status(500).json({ 
      message: '動画一覧の取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 特定の動画情報を取得
router.get('/:videoId', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { videoId } = req.params;

    const query = `
      SELECT 
        vu.*,
        e.name as exercise_name,
        aar.analysis_status,
        aar.knee_in_score,
        aar.toe_out_score,
        aar.overall_score,
        aar.feedback,
        aar.analyzed_at
      FROM video_uploads vu
      LEFT JOIN exercises e ON vu.exercise_id = e.id
      LEFT JOIN ai_analysis_results aar ON vu.id = aar.video_id
      WHERE vu.id = ? AND vu.patient_id = ?
    `;

    const [videos] = await db.execute(query, [videoId, patientId]);

    if (videos.length === 0) {
      return res.status(404).json({ message: '動画が見つかりません' });
    }

    res.json({
      success: true,
      data: videos[0]
    });

  } catch (error) {
    logger.error('動画情報取得エラー:', error);
    res.status(500).json({ 
      message: '動画情報の取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 動画を削除
router.delete('/:videoId', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { videoId } = req.params;

    // 動画情報を取得
    const selectQuery = `
      SELECT file_path 
      FROM video_uploads 
      WHERE id = ? AND patient_id = ?
    `;

    const [videos] = await db.execute(selectQuery, [videoId, patientId]);

    if (videos.length === 0) {
      return res.status(404).json({ message: '動画が見つかりません' });
    }

    const filePath = videos[0].file_path;

    // データベースから削除
    const deleteQuery = `
      DELETE FROM video_uploads 
      WHERE id = ? AND patient_id = ?
    `;

    await db.execute(deleteQuery, [videoId, patientId]);

    // ファイルを削除
    try {
      await fs.unlink(filePath);
    } catch (fileError) {
      logger.warn('ファイル削除に失敗:', fileError);
    }

    logger.info(`動画削除完了: patient_id=${patientId}, video_id=${videoId}`);

    res.json({
      success: true,
      message: '動画が削除されました'
    });

  } catch (error) {
    logger.error('動画削除エラー:', error);
    res.status(500).json({ 
      message: '動画の削除に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 動画ファイルをストリーミング
router.get('/:videoId/stream', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { videoId } = req.params;

    // 動画情報を取得
    const query = `
      SELECT file_path, mime_type, original_name
      FROM video_uploads 
      WHERE id = ? AND patient_id = ?
    `;

    const [videos] = await db.execute(query, [videoId, patientId]);

    if (videos.length === 0) {
      return res.status(404).json({ message: '動画が見つかりません' });
    }

    const { file_path, mime_type, original_name } = videos[0];

    // ファイルの存在確認
    try {
      await fs.access(file_path);
    } catch (error) {
      logger.error('動画ファイルが見つかりません:', file_path);
      return res.status(404).json({ message: '動画ファイルが見つかりません' });
    }

    // ファイル情報を取得
    const stat = await fs.stat(file_path);
    const fileSize = stat.size;

    // Range request support
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mime_type,
      });

      const stream = require('fs').createReadStream(file_path, { start, end });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mime_type,
        'Content-Disposition': `inline; filename="${original_name}"`,
      });

      const stream = require('fs').createReadStream(file_path);
      stream.pipe(res);
    }

  } catch (error) {
    logger.error('動画ストリーミングエラー:', error);
    res.status(500).json({ 
      message: '動画の再生に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// パブリック動画アップロード（デモ用）
const publicStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const publicUploadDir = path.join(__dirname, '../../uploads/public-videos');
    try {
      await fs.access(publicUploadDir);
    } catch (error) {
      await fs.mkdir(publicUploadDir, { recursive: true });
    }
    cb(null, publicUploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname);
    cb(null, `demo_${timestamp}_${randomId}${ext}`);
  }
});

const publicUpload = multer({
  storage: publicStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB制限
  }
});

// パブリック動画アップロード
router.post('/public/upload', publicUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '動画ファイルが必要です' });
    }

    const { exerciseType = 'squat', description = '' } = req.body;
    
    const videoData = {
      id: Math.random().toString(36).substring(2, 15),
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      filePath: req.file.path,
      exerciseType: exerciseType,
      description: description,
      uploadedAt: new Date(),
      isPublic: true
    };

    // デモ用の簡易保存（実際の実装ではデータベースに保存）
    const demoVideosFile = path.join(__dirname, '../../uploads/demo-videos.json');
    let demoVideos = [];
    
    try {
      const existingData = await fs.readFile(demoVideosFile, 'utf8');
      demoVideos = JSON.parse(existingData);
    } catch (error) {
      // ファイルが存在しない場合は空配列で開始
    }
    
    demoVideos.push(videoData);
    await fs.writeFile(demoVideosFile, JSON.stringify(demoVideos, null, 2));

    logger.info(`パブリック動画アップロード完了: ${req.file.filename}`);

    res.json({
      success: true,
      data: {
        id: videoData.id,
        filename: videoData.filename,
        originalName: videoData.originalName,
        size: videoData.size,
        exerciseType: videoData.exerciseType,
        message: 'アップロード完了'
      }
    });

  } catch (error) {
    logger.error('パブリック動画アップロードエラー:', error);
    
    // エラー時はアップロードされたファイルを削除
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.error('ファイル削除エラー:', unlinkError);
      }
    }

    res.status(500).json({ 
      message: '動画のアップロードに失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// パブリック動画分析開始
router.post('/public/:videoId/analyze', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { analysisType = 'motion_analysis' } = req.body;

    // デモ動画情報を取得
    const demoVideosFile = path.join(__dirname, '../../uploads/demo-videos.json');
    let demoVideos = [];
    
    try {
      const existingData = await fs.readFile(demoVideosFile, 'utf8');
      demoVideos = JSON.parse(existingData);
    } catch (error) {
      return res.status(404).json({ message: '動画が見つかりません' });
    }
    
    const videoData = demoVideos.find(v => v.id === videoId);
    if (!videoData) {
      return res.status(404).json({ message: '動画が見つかりません' });
    }

    // AI分析を開始（バックグラウンド処理）
    const analysisId = Math.random().toString(36).substring(2, 15);
    processPublicVideoAnalysis(analysisId, videoData, analysisType)
      .catch(error => {
        logger.error('パブリック動画分析エラー:', error);
      });

    res.json({
      success: true,
      data: {
        analysisId: analysisId,
        status: 'processing',
        message: 'AI分析を開始しました'
      }
    });

  } catch (error) {
    logger.error('パブリック動画分析開始エラー:', error);
    res.status(500).json({ 
      message: 'AI分析の開始に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// パブリック分析結果取得
router.get('/public/analysis/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;
    
    // デモ分析結果を取得
    const analysisFile = path.join(__dirname, '../../uploads/demo-analysis.json');
    let analysisResults = [];
    
    try {
      const existingData = await fs.readFile(analysisFile, 'utf8');
      analysisResults = JSON.parse(existingData);
    } catch (error) {
      return res.status(404).json({ message: '分析結果が見つかりません' });
    }
    
    const result = analysisResults.find(r => r.id === analysisId);
    if (!result) {
      return res.status(404).json({ message: '分析結果が見つかりません' });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('パブリック分析結果取得エラー:', error);
    res.status(500).json({ 
      message: '分析結果の取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// パブリック動画分析処理
async function processPublicVideoAnalysis(analysisId, videoData, analysisType) {
  try {
    // 分析時間をシミュレート
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 5000));

    // より詳細な分析結果を生成
    const frameCount = Math.floor(Math.random() * 50) + 20; // 20-70フレーム
    const analysisResults = [];
    
    for (let i = 0; i < frameCount; i++) {
      const kneeInScore = Math.max(30, Math.min(100, 75 + (Math.random() - 0.5) * 40));
      const toeOutScore = Math.max(40, Math.min(100, 80 + (Math.random() - 0.5) * 30));
      const overallScore = (kneeInScore * 0.6) + (toeOutScore * 0.4);
      
      analysisResults.push({
        frame: i,
        timestamp: i * 0.5, // 0.5秒間隔
        kneeInScore: Math.round(kneeInScore),
        toeOutScore: Math.round(toeOutScore),
        overallScore: Math.round(overallScore),
        alignment: {
          leftKneeAlignment: overallScore > 75 ? 'good' : overallScore > 55 ? 'moderate' : 'poor',
          rightKneeAlignment: overallScore > 70 ? 'good' : overallScore > 50 ? 'moderate' : 'poor'
        }
      });
    }
    
    const avgKneeScore = analysisResults.reduce((sum, r) => sum + r.kneeInScore, 0) / frameCount;
    const avgToeScore = analysisResults.reduce((sum, r) => sum + r.toeOutScore, 0) / frameCount;
    const avgOverallScore = analysisResults.reduce((sum, r) => sum + r.overallScore, 0) / frameCount;
    const issueCount = analysisResults.filter(r => r.overallScore < 60).length;

    const finalResult = {
      id: analysisId,
      videoId: videoData.id,
      exerciseType: videoData.exerciseType,
      status: 'completed',
      frameCount: frameCount,
      avgScores: {
        kneeIn: Math.round(avgKneeScore),
        toeOut: Math.round(avgToeScore),
        overall: Math.round(avgOverallScore)
      },
      issueCount: issueCount,
      issueRate: Math.round((issueCount / frameCount) * 100),
      feedback: generateDetailedFeedback(avgOverallScore, avgKneeScore, avgToeScore, issueCount, frameCount),
      frameAnalysis: analysisResults,
      analyzedAt: new Date(),
      duration: frameCount * 0.5
    };

    // 結果を保存
    const analysisFile = path.join(__dirname, '../../uploads/demo-analysis.json');
    let allResults = [];
    
    try {
      const existingData = await fs.readFile(analysisFile, 'utf8');
      allResults = JSON.parse(existingData);
    } catch (error) {
      // ファイルが存在しない場合は空配列
    }
    
    allResults.push(finalResult);
    await fs.writeFile(analysisFile, JSON.stringify(allResults, null, 2));

    logger.info(`パブリック動画分析完了: analysisId=${analysisId}, overall_score=${avgOverallScore.toFixed(2)}`);

  } catch (error) {
    logger.error('パブリック動画分析処理エラー:', error);
    
    // エラー結果を保存
    const errorResult = {
      id: analysisId,
      status: 'failed',
      error: error.message,
      analyzedAt: new Date()
    };
    
    const analysisFile = path.join(__dirname, '../../uploads/demo-analysis.json');
    let allResults = [];
    
    try {
      const existingData = await fs.readFile(analysisFile, 'utf8');
      allResults = JSON.parse(existingData);
    } catch (readError) {
      // ファイルが存在しない場合は空配列
    }
    
    allResults.push(errorResult);
    await fs.writeFile(analysisFile, JSON.stringify(allResults, null, 2));
  }
}

// 詳細フィードバック生成
function generateDetailedFeedback(overallScore, kneeScore, toeScore, issueCount, frameCount) {
  const feedback = {
    level: 'good',
    message: '',
    suggestions: [],
    strengths: [],
    improvements: []
  };

  if (overallScore >= 80) {
    feedback.level = 'good';
    feedback.message = '素晴らしい動作パフォーマンスです！';
    feedback.strengths = [
      '膝のアライメントが適切に保たれています',
      '動作が安定しており、怪我のリスクが低いです',
      '現在のフォームを維持することで効果的なトレーニングが可能です'
    ];
    feedback.suggestions = ['このフォームを維持して、徐々に負荷を増やしてみましょう'];
  } else if (overallScore >= 60) {
    feedback.level = 'moderate';
    feedback.message = '良好な動作ですが、いくつか改善点があります。';
    
    if (kneeScore < 70) {
      feedback.improvements.push('膝の内側への傾きが見られます');
      feedback.suggestions.push('膝をつま先の方向に向けることを意識してください');
    }
    
    if (issueCount > frameCount * 0.3) {
      feedback.improvements.push('動作の一貫性に課題があります');
      feedback.suggestions.push('よりゆっくりとした動作で正確性を重視してください');
    }
    
    if (toeScore >= 75) {
      feedback.strengths.push('足部のポジションは良好です');
    }
  } else {
    feedback.level = 'poor';
    feedback.message = '動作フォームに重要な問題があります。安全のため、専門家の指導を受けることをお勧めします。';
    
    if (kneeScore < 50) {
      feedback.improvements.push('膝が内側に大きく入っています（knee-in）');
      feedback.suggestions.push('股関節の筋力強化とモビリティ改善が必要です');
    }
    
    if (issueCount > frameCount * 0.5) {
      feedback.improvements.push('動作パターンが不安定です');
      feedback.suggestions.push('基本的な動作から練習を始めることをお勧めします');
    }
    
    feedback.suggestions.push('理学療法士との相談を強く推奨します');
  }

  return feedback;
}

module.exports = router;