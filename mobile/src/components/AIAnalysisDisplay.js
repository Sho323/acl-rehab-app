import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import {
  Text,
  Card,
  ProgressBar,
  Chip,
  List,
  Icon,
} from 'react-native-paper';

const AIAnalysisDisplay = ({ 
  analysisResult, 
  isAnalyzing = false, 
  style 
}) => {
  const [scoreAnimation] = useState(new Animated.Value(0));
  const [fadeAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (analysisResult) {
      // スコアアニメーション
      Animated.timing(scoreAnimation, {
        toValue: analysisResult.overallScore / 100,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      // フェードインアニメーション
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [analysisResult]);

  if (!analysisResult && !isAnalyzing) {
    return null;
  }

  if (isAnalyzing) {
    return (
      <Card style={[styles.container, style]}>
        <Card.Content style={styles.analyzingContent}>
          <View style={styles.analyzingHeader}>
            <Icon source="camera" size={24} color="#2196F3" />
            <Text style={styles.analyzingText}>AI分析中...</Text>
          </View>
          <ProgressBar 
            indeterminate 
            color="#2196F3" 
            style={styles.loadingBar} 
          />
        </Card.Content>
      </Card>
    );
  }

  const getFeedbackColor = (level) => {
    switch (level) {
      case 'good': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'poor': return '#F44336';
      default: return '#757575';
    }
  };

  const getFeedbackIcon = (level) => {
    switch (level) {
      case 'good': return 'check-circle';
      case 'moderate': return 'alert-circle';
      case 'poor': return 'alert';
      default: return 'information';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  return (
    <Animated.View style={[{ opacity: fadeAnimation }, style]}>
      <Card style={styles.container}>
        <Card.Content>
          {/* AI分析ヘッダー */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Icon source="robot" size={20} color="#2196F3" />
              <Text style={styles.headerTitle}>AI動作分析</Text>
            </View>
            <Chip
              mode="outlined"
              style={[styles.feedbackChip, { borderColor: getFeedbackColor(analysisResult.feedback.level) }]}
              textStyle={{ color: getFeedbackColor(analysisResult.feedback.level) }}
              icon={getFeedbackIcon(analysisResult.feedback.level)}
            >
              {analysisResult.feedback.level === 'good' ? '良好' : 
               analysisResult.feedback.level === 'moderate' ? '注意' : '要改善'}
            </Chip>
          </View>

          {/* 総合スコア */}
          <View style={styles.scoreSection}>
            <Text style={styles.scoreLabel}>総合スコア</Text>
            <View style={styles.scoreContainer}>
              <Animated.View style={styles.scoreCircle}>
                <Text style={[styles.scoreText, { color: getScoreColor(analysisResult.overallScore) }]}>
                  {analysisResult.overallScore}
                </Text>
                <Text style={styles.scoreUnit}>点</Text>
              </Animated.View>
              <View style={styles.scoreDetails}>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreItemLabel}>Knee-in問題</Text>
                  <Text style={[styles.scoreItemValue, { color: getScoreColor(100 - analysisResult.kneeInToeOutScore) }]}>
                    {analysisResult.kneeInToeOutScore}%
                  </Text>
                </View>
                <Animated.View style={styles.progressContainer}>
                  <ProgressBar
                    progress={scoreAnimation}
                    color={getScoreColor(analysisResult.overallScore)}
                    style={styles.scoreProgress}
                  />
                </Animated.View>
              </View>
            </View>
          </View>

          {/* 膝の位置関係分析 */}
          <View style={styles.alignmentSection}>
            <Text style={styles.sectionTitle}>膝の位置関係</Text>
            <View style={styles.alignmentGrid}>
              <View style={styles.alignmentItem}>
                <Text style={styles.alignmentLabel}>左膝</Text>
                <Chip
                  mode="outlined"
                  compact
                  style={[styles.alignmentChip, { borderColor: getAlignmentColor(analysisResult.alignment.leftKneeAlignment) }]}
                  textStyle={{ color: getAlignmentColor(analysisResult.alignment.leftKneeAlignment) }}
                >
                  {getAlignmentText(analysisResult.alignment.leftKneeAlignment)}
                </Chip>
              </View>
              <View style={styles.alignmentItem}>
                <Text style={styles.alignmentLabel}>右膝</Text>
                <Chip
                  mode="outlined"
                  compact
                  style={[styles.alignmentChip, { borderColor: getAlignmentColor(analysisResult.alignment.rightKneeAlignment) }]}
                  textStyle={{ color: getAlignmentColor(analysisResult.alignment.rightKneeAlignment) }}
                >
                  {getAlignmentText(analysisResult.alignment.rightKneeAlignment)}
                </Chip>
              </View>
            </View>
            <View style={styles.ratioContainer}>
              <Text style={styles.ratioLabel}>
                膝幅/足首幅比率: {analysisResult.alignment.kneeAnkleRatio}
              </Text>
              <Text style={styles.ratioNote}>
                (理想値: 0.8-1.2)
              </Text>
            </View>
          </View>

          {/* フィードバックメッセージ */}
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackMessage}>
              {analysisResult.feedback.message}
            </Text>
          </View>

          {/* 改善提案 */}
          {analysisResult.feedback.suggestions.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.sectionTitle}>改善提案</Text>
              {analysisResult.feedback.suggestions.map((suggestion, index) => (
                <List.Item
                  key={index}
                  title={suggestion}
                  left={() => <Icon source="lightbulb-outline" size={20} color="#FF9800" />}
                  titleStyle={styles.suggestionText}
                  style={styles.suggestionItem}
                />
              ))}
            </View>
          )}

          {/* タイムスタンプ */}
          <Text style={styles.timestamp}>
            分析時刻: {new Date(analysisResult.timestamp).toLocaleTimeString('ja-JP')}
          </Text>
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

// ヘルパー関数
const getAlignmentColor = (alignment) => {
  switch (alignment) {
    case 'good': return '#4CAF50';
    case 'moderate': return '#FF9800';
    case 'poor': return '#F44336';
    default: return '#757575';
  }
};

const getAlignmentText = (alignment) => {
  switch (alignment) {
    case 'good': return '良好';
    case 'moderate': return '注意';
    case 'poor': return '要改善';
    default: return '不明';
  }
};

const styles = StyleSheet.create({
  container: {
    margin: 8,
    elevation: 4,
    backgroundColor: '#fff',
  },
  analyzingContent: {
    paddingVertical: 20,
  },
  analyzingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  analyzingText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  loadingBar: {
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  feedbackChip: {
    borderWidth: 1,
  },
  scoreSection: {
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreUnit: {
    fontSize: 12,
    color: '#666',
  },
  scoreDetails: {
    flex: 1,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreItemLabel: {
    fontSize: 12,
    color: '#666',
  },
  scoreItemValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 8,
  },
  scoreProgress: {
    height: 6,
    borderRadius: 3,
  },
  alignmentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  alignmentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  alignmentItem: {
    alignItems: 'center',
  },
  alignmentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  alignmentChip: {
    borderWidth: 1,
  },
  ratioContainer: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  ratioLabel: {
    fontSize: 12,
    color: '#333',
  },
  ratioNote: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  feedbackSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  feedbackMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  suggestionsSection: {
    marginBottom: 16,
  },
  suggestionItem: {
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  suggestionText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
});

export default AIAnalysisDisplay;