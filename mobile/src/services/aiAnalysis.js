import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

// AI動作分析サービス
class AIAnalysisService {
  constructor() {
    this.model = null;
    this.isInitialized = false;
    this.analysisResults = [];
  }

  // モデル初期化
  async initializeModel() {
    try {
      // 実際の環境では事前訓練されたモデルを読み込み
      // この例ではダミーのモデル構造を示す
      console.log('AI分析モデルを初期化中...');
      
      // TensorFlow.js プラットフォーム設定
      await tf.ready();
      
      // ダミーモデル（実際の実装では外部モデルファイルを読み込み）
      this.model = await this.createDummyModel();
      
      this.isInitialized = true;
      console.log('AI分析モデルの初期化が完了しました');
      
      return true;
    } catch (error) {
      console.error('AI分析モデルの初期化に失敗:', error);
      return false;
    }
  }

  // ダミーモデル作成（実際の実装では外部モデルを使用）
  async createDummyModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [68], units: 128, activation: 'relu' }), // 34キーポイント × 2座標
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' }) // Knee-in-toe-out検出（0-1）
      ]
    });
    
    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    return model;
  }

  // フレーム分析
  async analyzeFrame(keypoints, exerciseType = 'squat') {
    if (!this.isInitialized || !this.model) {
      return this.getDummyAnalysisResult(exerciseType);
    }

    try {
      // キーポイント前処理
      const normalizedKeypoints = this.preprocessKeypoints(keypoints);
      
      // テンソル作成
      const inputTensor = tf.tensor2d([normalizedKeypoints], [1, 68]);
      
      // 推論実行
      const prediction = await this.model.predict(inputTensor);
      const score = await prediction.data();
      
      // リソース解放
      inputTensor.dispose();
      prediction.dispose();
      
      // 結果分析
      const analysisResult = this.interpretResults(score[0], exerciseType, keypoints);
      
      // 結果履歴に追加
      this.analysisResults.push({
        timestamp: Date.now(),
        exerciseType: exerciseType,
        ...analysisResult
      });
      
      return analysisResult;
    } catch (error) {
      console.error('フレーム分析エラー:', error);
      return this.getDummyAnalysisResult(exerciseType);
    }
  }

  // キーポイント前処理
  preprocessKeypoints(keypoints) {
    if (!keypoints || keypoints.length === 0) {
      return new Array(68).fill(0);
    }

    const normalized = [];
    
    // 主要な関節点のインデックス（COCO形式）
    const keyJoints = [
      0,  // nose
      5,  // left_shoulder
      6,  // right_shoulder
      7,  // left_elbow
      8,  // right_elbow
      9,  // left_wrist
      10, // right_wrist
      11, // left_hip
      12, // right_hip
      13, // left_knee
      14, // right_knee
      15, // left_ankle
      16, // right_ankle
      17, // left_big_toe
      18, // right_big_toe
      19, // left_small_toe
      20, // right_small_toe
      21, // left_heel
      22, // right_heel
    ];

    // 正規化：股関節の中点を基準とした相対座標
    const leftHip = keypoints[11] || { x: 0, y: 0 };
    const rightHip = keypoints[12] || { x: 0, y: 0 };
    const hipCenter = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    };

    // 各関節の相対位置を計算
    for (let i = 0; i < 34; i++) {
      const keypoint = keypoints[i];
      if (keypoint && keypoint.score > 0.5) {
        normalized.push((keypoint.x - hipCenter.x) / 100); // X座標
        normalized.push((keypoint.y - hipCenter.y) / 100); // Y座標
      } else {
        normalized.push(0);
        normalized.push(0);
      }
    }

    return normalized;
  }

  // 結果解釈
  interpretResults(score, exerciseType, keypoints) {
    const kneeInToeOutScore = score;
    
    // 膝とつま先の位置関係を詳細分析
    const detailedAnalysis = this.analyzeKneeAlignment(keypoints);
    
    // 総合評価
    const overallScore = this.calculateOverallScore(kneeInToeOutScore, detailedAnalysis);
    
    // フィードバック生成
    const feedback = this.generateFeedback(overallScore, detailedAnalysis, exerciseType);
    
    return {
      kneeInToeOutScore: Math.round(kneeInToeOutScore * 100),
      overallScore: Math.round(overallScore * 100),
      alignment: detailedAnalysis,
      feedback: feedback,
      timestamp: Date.now(),
      exerciseType: exerciseType
    };
  }

  // 膝の位置関係詳細分析
  analyzeKneeAlignment(keypoints) {
    if (!keypoints || keypoints.length < 23) {
      return {
        leftKneeAlignment: 'unknown',
        rightKneeAlignment: 'unknown',
        kneeWidth: 0,
        ankleWidth: 0,
        kneeAnkleRatio: 1
      };
    }

    const leftKnee = keypoints[13];
    const rightKnee = keypoints[14];
    const leftAnkle = keypoints[15];
    const rightAnkle = keypoints[16];

    if (!leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
      return {
        leftKneeAlignment: 'unknown',
        rightKneeAlignment: 'unknown',
        kneeWidth: 0,
        ankleWidth: 0,
        kneeAnkleRatio: 1
      };
    }

    // 膝と足首の幅を計算
    const kneeWidth = Math.abs(rightKnee.x - leftKnee.x);
    const ankleWidth = Math.abs(rightAnkle.x - leftAnkle.x);
    const kneeAnkleRatio = kneeWidth / ankleWidth;

    // 各膝の位置評価
    const leftKneeAlignment = this.evaluateKneePosition(leftKnee, leftAnkle, 'left');
    const rightKneeAlignment = this.evaluateKneePosition(rightKnee, rightAnkle, 'right');

    return {
      leftKneeAlignment,
      rightKneeAlignment,
      kneeWidth,
      ankleWidth,
      kneeAnkleRatio: Math.round(kneeAnkleRatio * 100) / 100
    };
  }

  // 個別膝位置評価
  evaluateKneePosition(knee, ankle, side) {
    if (!knee || !ankle) return 'unknown';

    const horizontalDiff = Math.abs(knee.x - ankle.x);
    const threshold = 20; // ピクセル単位の閾値

    if (horizontalDiff < threshold) {
      return 'good';
    } else if (horizontalDiff < threshold * 2) {
      return 'moderate';
    } else {
      return 'poor';
    }
  }

  // 総合スコア計算
  calculateOverallScore(kneeInToeOutScore, alignment) {
    let score = (1 - kneeInToeOutScore) * 0.6; // knee-in-toe-out問題がない場合は高スコア
    
    // 膝の位置関係を考慮
    const leftAlignmentScore = this.getAlignmentScore(alignment.leftKneeAlignment);
    const rightAlignmentScore = this.getAlignmentScore(alignment.rightKneeAlignment);
    const alignmentScore = (leftAlignmentScore + rightAlignmentScore) / 2;
    
    score += alignmentScore * 0.3;
    
    // 膝と足首の幅比率を考慮
    const ratioScore = this.getRatioScore(alignment.kneeAnkleRatio);
    score += ratioScore * 0.1;
    
    return Math.max(0, Math.min(1, score));
  }

  // 位置関係スコア
  getAlignmentScore(alignment) {
    switch (alignment) {
      case 'good': return 1.0;
      case 'moderate': return 0.6;
      case 'poor': return 0.2;
      default: return 0.5;
    }
  }

  // 比率スコア
  getRatioScore(ratio) {
    // 理想的な比率は0.8-1.2
    if (ratio >= 0.8 && ratio <= 1.2) return 1.0;
    if (ratio >= 0.6 && ratio <= 1.4) return 0.7;
    return 0.3;
  }

  // フィードバック生成
  generateFeedback(overallScore, alignment, exerciseType) {
    const feedback = {
      level: 'good',
      message: '',
      suggestions: []
    };

    if (overallScore >= 0.8) {
      feedback.level = 'good';
      feedback.message = '素晴らしいフォームです！この調子で続けましょう。';
      feedback.suggestions = ['現在のフォームを維持してください'];
    } else if (overallScore >= 0.6) {
      feedback.level = 'moderate';
      feedback.message = '概ね良好ですが、改善の余地があります。';
      feedback.suggestions = this.getModerateAdvice(alignment, exerciseType);
    } else {
      feedback.level = 'poor';
      feedback.message = 'フォームに問題があります。安全のため注意してください。';
      feedback.suggestions = this.getPoorAdvice(alignment, exerciseType);
    }

    return feedback;
  }

  // 中程度の問題に対するアドバイス
  getModerateAdvice(alignment, exerciseType) {
    const advice = [];
    
    if (alignment.kneeAnkleRatio > 1.2) {
      advice.push('膝が外側に開きすぎています。つま先の方向を意識しましょう');
    } else if (alignment.kneeAnkleRatio < 0.8) {
      advice.push('膝が内側に入りすぎています。膝をつま先の方向に向けましょう');
    }
    
    if (alignment.leftKneeAlignment === 'moderate' || alignment.rightKneeAlignment === 'moderate') {
      advice.push('膝の位置をつま先の真上に保ちましょう');
    }
    
    if (exerciseType === 'squat') {
      advice.push('スクワット時は膝とつま先を同じ向きにしてください');
    }
    
    return advice.length > 0 ? advice : ['フォームを少し調整してみましょう'];
  }

  // 問題のあるフォームに対するアドバイス
  getPoorAdvice(alignment, exerciseType) {
    const advice = [];
    
    if (alignment.kneeAnkleRatio > 1.4) {
      advice.push('膝が大きく外側に開いています。怪我の危険があります');
      advice.push('つま先の向きと膝の向きを揃えてください');
    } else if (alignment.kneeAnkleRatio < 0.6) {
      advice.push('膝が内側に大きく入っています（knee-in）');
      advice.push('膝をつま先の方向に向けて、股関節から動かしましょう');
    }
    
    if (alignment.leftKneeAlignment === 'poor') {
      advice.push('左膝の位置を修正してください');
    }
    
    if (alignment.rightKneeAlignment === 'poor') {
      advice.push('右膝の位置を修正してください');
    }
    
    advice.push('動作をゆっくり行い、正しいフォームを意識してください');
    
    return advice;
  }

  // ダミー分析結果（モデル未初期化時）
  getDummyAnalysisResult(exerciseType) {
    // リアルなダミーデータを生成
    const scenarios = [
      {
        kneeInToeOutScore: 15,
        overallScore: 85,
        alignment: {
          leftKneeAlignment: 'good',
          rightKneeAlignment: 'good',
          kneeWidth: 45,
          ankleWidth: 48,
          kneeAnkleRatio: 0.94
        },
        feedback: {
          level: 'good',
          message: '素晴らしいフォームです！この調子で続けましょう。',
          suggestions: ['現在のフォームを維持してください']
        }
      },
      {
        kneeInToeOutScore: 35,
        overallScore: 65,
        alignment: {
          leftKneeAlignment: 'moderate',
          rightKneeAlignment: 'good',
          kneeWidth: 35,
          ankleWidth: 45,
          kneeAnkleRatio: 0.78
        },
        feedback: {
          level: 'moderate',
          message: '概ね良好ですが、改善の余地があります。',
          suggestions: [
            '左膝の位置をつま先の真上に保ちましょう',
            '膝が内側に入りすぎています。膝をつま先の方向に向けましょう'
          ]
        }
      },
      {
        kneeInToeOutScore: 60,
        overallScore: 40,
        alignment: {
          leftKneeAlignment: 'poor',
          rightKneeAlignment: 'moderate',
          kneeWidth: 28,
          ankleWidth: 48,
          kneeAnkleRatio: 0.58
        },
        feedback: {
          level: 'poor',
          message: 'フォームに問題があります。安全のため注意してください。',
          suggestions: [
            '膝が内側に大きく入っています（knee-in）',
            '膝をつま先の方向に向けて、股関節から動かしましょう',
            '左膝の位置を修正してください',
            '動作をゆっくり行い、正しいフォームを意識してください'
          ]
        }
      }
    ];
    
    // ランダムにシナリオを選択
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    const result = scenarios[randomIndex];
    
    return {
      ...result,
      timestamp: Date.now(),
      exerciseType: exerciseType,
      isDummy: true
    };
  }

  // セッション分析サマリー
  getSessionSummary() {
    if (this.analysisResults.length === 0) {
      return {
        totalFrames: 0,
        averageScore: 0,
        issueCount: 0,
        improvements: []
      };
    }

    const totalFrames = this.analysisResults.length;
    const averageScore = this.analysisResults.reduce((sum, result) => sum + result.overallScore, 0) / totalFrames;
    const issueCount = this.analysisResults.filter(result => result.overallScore < 60).length;
    
    const improvements = this.generateSessionImprovements();
    
    return {
      totalFrames,
      averageScore: Math.round(averageScore),
      issueCount,
      improvements
    };
  }

  // セッション改善提案
  generateSessionImprovements() {
    const improvements = [];
    const poorResults = this.analysisResults.filter(result => result.overallScore < 60);
    
    if (poorResults.length > this.analysisResults.length * 0.3) {
      improvements.push('フォームの基本を見直すことをお勧めします');
    }
    
    const kneeInIssues = this.analysisResults.filter(result => result.kneeInToeOutScore > 50);
    if (kneeInIssues.length > 0) {
      improvements.push('膝が内側に入る傾向があります。股関節の動きを意識してください');
    }
    
    return improvements;
  }

  // 分析結果リセット
  resetAnalysis() {
    this.analysisResults = [];
  }

  // リソース解放
  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.analysisResults = [];
    this.isInitialized = false;
  }
}

// シングルトンインスタンス
const aiAnalysisService = new AIAnalysisService();

export default aiAnalysisService;