import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Chip,
  Divider,
  IconButton,
} from 'react-native-paper';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';
import aiAnalysisService from '../services/aiAnalysis';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AIAnalysisScreen = ({ navigation, route }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const cameraRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  
  const exerciseType = route.params?.exerciseType || 'squat';
  const exerciseName = route.params?.exerciseName || 'AI動作分析';

  useEffect(() => {
    (async () => {
      // カメラ権限の取得
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      
      setHasPermission(
        cameraStatus.status === 'granted' && mediaLibraryStatus.status === 'granted'
      );

      // AI分析サービス初期化
      try {
        const initialized = await aiAnalysisService.initializeModel();
        setIsInitialized(initialized);
      } catch (error) {
        console.error('AI分析サービス初期化エラー:', error);
        setIsInitialized(false);
      }
    })();

    return () => {
      // クリーンアップ
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, []);

  const startAnalysis = async () => {
    if (!cameraRef.current || !isInitialized) {
      Alert.alert('エラー', 'カメラまたはAI分析の準備ができていません。');
      return;
    }

    setIsRecording(true);
    setIsAnalyzing(true);
    aiAnalysisService.resetAnalysis();
    setAnalysisHistory([]);
    setCurrentAnalysis(null);

    // 定期的な分析実行（実際の実装では pose estimation ライブラリと連携）
    analysisIntervalRef.current = setInterval(async () => {
      try {
        // ダミーのキーポイントデータ（実際の実装では pose estimation から取得）
        const dummyKeypoints = generateDummyKeypoints();
        
        const result = await aiAnalysisService.analyzeFrame(dummyKeypoints, exerciseType);
        
        setCurrentAnalysis(result);
        setAnalysisHistory(prev => [...prev, result].slice(-10)); // 最新10件を保持
        
      } catch (error) {
        console.error('フレーム分析エラー:', error);
      }
    }, 2000); // 2秒間隔で分析
  };

  const stopAnalysis = () => {
    setIsRecording(false);
    setIsAnalyzing(false);
    
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }

    // セッションサマリー生成
    const summary = aiAnalysisService.getSessionSummary();
    setSessionSummary(summary);

    Alert.alert(
      'AI分析完了',
      `分析フレーム数: ${summary.totalFrames}\n平均スコア: ${summary.averageScore}点\n問題検出: ${summary.issueCount}回`,
      [
        { text: '確認', onPress: () => {} }
      ]
    );
  };

  const toggleCameraType = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const retryAnalysis = () => {
    setCurrentAnalysis(null);
    setSessionSummary(null);
    setAnalysisHistory([]);
    aiAnalysisService.resetAnalysis();
  };

  // ダミーキーポイント生成（実際の実装では pose estimation ライブラリから取得）
  const generateDummyKeypoints = () => {
    const keypoints = [];
    
    // 主要な関節点をダミーで生成
    const baseX = screenWidth / 2;
    const baseY = screenHeight / 2;
    
    for (let i = 0; i < 17; i++) {
      keypoints.push({
        x: baseX + (Math.random() - 0.5) * 100,
        y: baseY + (Math.random() - 0.5) * 200,
        score: 0.8 + Math.random() * 0.2
      });
    }
    
    return keypoints;
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>カメラの準備中...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>カメラへのアクセスが必要です</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          戻る
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* カメラビュー */}
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          ratio="16:9"
        >
          {/* カメラオーバーレイ */}
          <View style={styles.cameraOverlay}>
            {/* ヘッダー */}
            <View style={styles.cameraHeader}>
              <View style={styles.exerciseInfo}>
                <Chip
                  mode="outlined"
                  style={styles.exerciseChip}
                  textStyle={styles.exerciseChipText}
                >
                  {exerciseName}
                </Chip>
              </View>
              <IconButton
                icon="camera-flip"
                size={24}
                iconColor="#fff"
                onPress={toggleCameraType}
                style={styles.flipButton}
              />
            </View>

            {/* 録画状態インジケーター */}
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>AI分析中</Text>
              </View>
            )}

            {/* コントロールボタン */}
            <View style={styles.cameraControls}>
              {!isRecording ? (
                <Button
                  mode="contained"
                  onPress={startAnalysis}
                  style={styles.startButton}
                  disabled={!isInitialized}
                >
                  分析開始
                </Button>
              ) : (
                <Button
                  mode="contained"
                  onPress={stopAnalysis}
                  style={styles.stopButton}
                  buttonColor="#F44336"
                >
                  分析停止
                </Button>
              )}
            </View>
          </View>
        </Camera>
      </View>

      {/* 分析結果表示エリア */}
      <ScrollView style={styles.analysisContainer}>
        {/* 現在の分析結果 */}
        {(currentAnalysis || isAnalyzing) && (
          <AIAnalysisDisplay
            analysisResult={currentAnalysis}
            isAnalyzing={isAnalyzing && !currentAnalysis}
            style={styles.currentAnalysis}
          />
        )}

        {/* セッションサマリー */}
        {sessionSummary && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryTitle}>セッション分析結果</Text>
              
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{sessionSummary.totalFrames}</Text>
                  <Text style={styles.statLabel}>分析フレーム</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: getScoreColor(sessionSummary.averageScore) }]}>
                    {sessionSummary.averageScore}
                  </Text>
                  <Text style={styles.statLabel}>平均スコア</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: sessionSummary.issueCount > 0 ? '#F44336' : '#4CAF50' }]}>
                    {sessionSummary.issueCount}
                  </Text>
                  <Text style={styles.statLabel}>問題検出</Text>
                </View>
              </View>

              {sessionSummary.improvements.length > 0 && (
                <View style={styles.improvementsSection}>
                  <Text style={styles.improvementsTitle}>改善提案</Text>
                  {sessionSummary.improvements.map((improvement, index) => (
                    <Text key={index} style={styles.improvementText}>
                      • {improvement}
                    </Text>
                  ))}
                </View>
              )}

              <View style={styles.summaryActions}>
                <Button
                  mode="outlined"
                  onPress={retryAnalysis}
                  style={styles.retryButton}
                >
                  再分析
                </Button>
                <Button
                  mode="contained"
                  onPress={() => navigation.goBack()}
                  style={styles.completeButton}
                >
                  完了
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* 分析履歴 */}
        {analysisHistory.length > 0 && !sessionSummary && (
          <Card style={styles.historyCard}>
            <Card.Content>
              <Text style={styles.historyTitle}>分析履歴</Text>
              <Divider style={styles.historyDivider} />
              {analysisHistory.slice(-3).map((analysis, index) => (
                <View key={analysis.timestamp} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyTime}>
                      {new Date(analysis.timestamp).toLocaleTimeString('ja-JP')}
                    </Text>
                    <Chip
                      mode="outlined"
                      compact
                      style={[styles.historyChip, { borderColor: getScoreColor(analysis.overallScore) }]}
                      textStyle={{ color: getScoreColor(analysis.overallScore) }}
                    >
                      {analysis.overallScore}点
                    </Chip>
                  </View>
                  <Text style={styles.historyFeedback}>
                    {analysis.feedback.message}
                  </Text>
                  {index < Math.min(analysisHistory.length, 3) - 1 && (
                    <Divider style={styles.historyItemDivider} />
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* 初期化エラー */}
        {!isInitialized && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text style={styles.errorTitle}>AI分析が利用できません</Text>
              <Text style={styles.errorDescription}>
                AI分析モデルの初期化に失敗しました。ネットワーク接続を確認してアプリを再起動してください。
              </Text>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.errorButton}
              >
                戻る
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

// ヘルパー関数
const getScoreColor = (score) => {
  if (score >= 80) return '#4CAF50';
  if (score >= 60) return '#FF9800';
  return '#F44336';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 20,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 0.6,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseChip: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: '#2196F3',
    borderWidth: 1,
  },
  exerciseChipText: {
    color: '#2196F3',
    fontSize: 12,
  },
  flipButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244,67,54,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cameraControls: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
  },
  stopButton: {
    paddingHorizontal: 32,
  },
  analysisContainer: {
    flex: 0.4,
    backgroundColor: '#f5f5f5',
  },
  currentAnalysis: {
    margin: 8,
  },
  summaryCard: {
    margin: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  improvementsSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  improvementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#856404',
  },
  improvementText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 18,
  },
  summaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  retryButton: {
    flex: 0.4,
  },
  completeButton: {
    flex: 0.4,
  },
  historyCard: {
    margin: 8,
    elevation: 2,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  historyDivider: {
    marginBottom: 12,
  },
  historyItem: {
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 12,
    color: '#666',
  },
  historyChip: {
    borderWidth: 1,
  },
  historyFeedback: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
  historyItemDivider: {
    marginTop: 8,
  },
  errorCard: {
    margin: 8,
    elevation: 2,
    backgroundColor: '#ffebee',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  errorButton: {
    alignSelf: 'center',
  },
});

export default AIAnalysisScreen;