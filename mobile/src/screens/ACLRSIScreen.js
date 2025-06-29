import React, { useState, useEffect } from 'react';
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
  ProgressBar,
  RadioButton,
  Chip,
  IconButton,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import {
  startNewAssessment,
  answerQuestion,
  nextQuestion,
  previousQuestion,
  goToQuestion,
  completeAssessment,
  resetAssessment,
  setDummyData,
} from '../store/slices/aclRsiSlice';
import {
  ACL_RSI_QUESTIONS,
  calculateScore,
  calculateCategoryScores,
  getScoreInterpretation,
  getActionPlan,
  calculateProgress,
} from '../data/aclRsiQuestions';

const { width } = Dimensions.get('window');

const ACLRSIScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { 
    currentAssessment, 
    assessmentHistory, 
    stats,
    isLoading,
    error 
  } = useSelector((state) => state.aclRsi);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const currentQuestion = ACL_RSI_QUESTIONS[currentAssessment.currentQuestionIndex];
  const isLastQuestion = currentAssessment.currentQuestionIndex === ACL_RSI_QUESTIONS.length - 1;
  const progress = calculateProgress(currentAssessment.currentQuestionIndex);

  useEffect(() => {
    // デモ用のダミーデータを設定
    dispatch(setDummyData());
  }, [dispatch]);

  useEffect(() => {
    // 現在の質問の既存回答を設定
    if (currentQuestion && currentAssessment.answers[currentQuestion.id] !== undefined) {
      setSelectedAnswer(currentAssessment.answers[currentQuestion.id]);
    } else {
      setSelectedAnswer(null);
    }
  }, [currentAssessment.currentQuestionIndex, currentQuestion]);

  const handleStartAssessment = () => {
    if (currentAssessment.isCompleted || !currentAssessment.id) {
      dispatch(startNewAssessment());
    }
    setShowResults(false);
    setShowHistory(false);
  };

  const handleAnswerSelect = (value) => {
    setSelectedAnswer(value);
    if (currentQuestion) {
      dispatch(answerQuestion({
        questionId: currentQuestion.id,
        answer: value
      }));
    }
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      Alert.alert('回答が必要です', 'この質問にお答えください。');
      return;
    }

    if (isLastQuestion) {
      // 評価完了
      completeCurrentAssessment();
    } else {
      dispatch(nextQuestion());
    }
  };

  const handlePrevious = () => {
    dispatch(previousQuestion());
  };

  const completeCurrentAssessment = () => {
    const totalScore = calculateScore(currentAssessment.answers);
    const categoryScores = calculateCategoryScores(currentAssessment.answers);
    const interpretation = getScoreInterpretation(totalScore);
    const actionPlan = getActionPlan(totalScore);

    dispatch(completeAssessment({
      totalScore,
      categoryScores,
      interpretation,
      actionPlan
    }));

    setShowResults(true);
  };

  const handleQuestionJump = (index) => {
    dispatch(goToQuestion(index));
  };

  const getScoreColor = (score) => {
    if (score >= 75) return '#4CAF50';
    if (score >= 55) return '#2196F3';
    if (score >= 30) return '#FF9800';
    return '#F44336';
  };

  const renderScaleButtons = () => {
    if (!currentQuestion) return null;

    const { scale } = currentQuestion;
    const buttons = [];

    for (let i = scale.min; i <= scale.max; i++) {
      buttons.push(
        <View key={i} style={styles.scaleButton}>
          <RadioButton
            value={i}
            status={selectedAnswer === i ? 'checked' : 'unchecked'}
            onPress={() => handleAnswerSelect(i)}
            color="#2196F3"
          />
          <Text style={styles.scaleButtonText}>{i}</Text>
        </View>
      );
    }

    return (
      <View style={styles.scaleContainer}>
        <Text style={styles.scaleLabel}>{scale.minLabel}</Text>
        <View style={styles.scaleButtons}>
          {buttons}
        </View>
        <Text style={styles.scaleLabel}>{scale.maxLabel}</Text>
      </View>
    );
  };

  const renderProgressIndicator = () => {
    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          質問 {currentAssessment.currentQuestionIndex + 1} / {ACL_RSI_QUESTIONS.length}
        </Text>
        <ProgressBar
          progress={progress / 100}
          color="#2196F3"
          style={styles.progressBar}
        />
        <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
      </View>
    );
  };

  const renderQuestionNavigation = () => {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.questionNav}>
        {ACL_RSI_QUESTIONS.map((_, index) => {
          const isAnswered = currentAssessment.answers[ACL_RSI_QUESTIONS[index].id] !== undefined;
          const isCurrent = index === currentAssessment.currentQuestionIndex;
          
          return (
            <Chip
              key={index}
              mode={isCurrent ? "flat" : "outlined"}
              selected={isCurrent}
              onPress={() => handleQuestionJump(index)}
              style={[
                styles.questionNavChip,
                isAnswered && styles.answeredChip,
                isCurrent && styles.currentChip
              ]}
              textStyle={[
                styles.questionNavText,
                isAnswered && styles.answeredText,
                isCurrent && styles.currentText
              ]}
            >
              {index + 1}
            </Chip>
          );
        })}
      </ScrollView>
    );
  };

  const renderResults = () => {
    if (!currentAssessment.isCompleted) return null;

    const { totalScore, categoryScores, interpretation, actionPlan } = currentAssessment;

    return (
      <ScrollView style={styles.resultsContainer}>
        {/* スコア表示 */}
        <Card style={styles.scoreCard}>
          <Card.Content>
            <Text style={styles.resultsTitle}>ACL-RSI評価結果</Text>
            
            <View style={styles.scoreDisplay}>
              <View style={styles.totalScoreContainer}>
                <Text style={[styles.totalScore, { color: getScoreColor(totalScore) }]}>
                  {totalScore}
                </Text>
                <Text style={styles.scoreUnit}>点</Text>
              </View>
              
              <View style={styles.categoryScores}>
                <View style={styles.categoryScore}>
                  <Text style={styles.categoryLabel}>感情面</Text>
                  <Text style={[styles.categoryValue, { color: getScoreColor(categoryScores.emotion) }]}>
                    {categoryScores.emotion}点
                  </Text>
                </View>
                <View style={styles.categoryScore}>
                  <Text style={styles.categoryLabel}>自信面</Text>
                  <Text style={[styles.categoryValue, { color: getScoreColor(categoryScores.confidence) }]}>
                    {categoryScores.confidence}点
                  </Text>
                </View>
              </View>
            </View>

            <Chip
              mode="outlined"
              style={[styles.interpretationChip, { borderColor: interpretation.color }]}
              textStyle={{ color: interpretation.color }}
            >
              {interpretation.title}
            </Chip>
            
            <Text style={styles.interpretationDescription}>
              {interpretation.description}
            </Text>
          </Card.Content>
        </Card>

        {/* 推奨アクション */}
        <Card style={styles.actionCard}>
          <Card.Content>
            <Text style={styles.actionTitle}>推奨アクション</Text>
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>
                優先度: {actionPlan.priority === 'high' ? '高' : 
                         actionPlan.priority === 'medium' ? '中' : '低'}
              </Text>
            </View>
            
            {actionPlan.actions.map((action, index) => (
              <View key={index} style={styles.actionItem}>
                <Text style={styles.actionItemTitle}>{action.title}</Text>
                <Text style={styles.actionItemDescription}>{action.description}</Text>
                <Text style={styles.actionItemTimeline}>実施目安: {action.timeline}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* アクションボタン */}
        <View style={styles.resultActions}>
          <Button
            mode="outlined"
            onPress={() => setShowHistory(true)}
            style={styles.actionButton}
          >
            履歴を見る
          </Button>
          <Button
            mode="contained"
            onPress={handleStartAssessment}
            style={styles.actionButton}
          >
            新しい評価
          </Button>
        </View>
      </ScrollView>
    );
  };

  const renderHistory = () => {
    if (!showHistory) return null;

    return (
      <ScrollView style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>評価履歴</Text>
          <IconButton
            icon="close"
            size={24}
            onPress={() => setShowHistory(false)}
          />
        </View>

        {/* 統計サマリー */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.statsTitle}>統計サマリー</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalAssessments}</Text>
                <Text style={styles.statLabel}>総評価回数</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: getScoreColor(stats.averageScore) }]}>
                  {stats.averageScore}
                </Text>
                <Text style={styles.statLabel}>平均スコア</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[
                  styles.statValue, 
                  { color: stats.scoreImprovement >= 0 ? '#4CAF50' : '#F44336' }
                ]}>
                  {stats.scoreImprovement >= 0 ? '+' : ''}{stats.scoreImprovement}
                </Text>
                <Text style={styles.statLabel}>前回からの変化</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 履歴リスト */}
        {assessmentHistory.map((assessment, index) => (
          <Card key={assessment.id} style={styles.historyItem}>
            <Card.Content>
              <View style={styles.historyItemHeader}>
                <Text style={styles.historyDate}>
                  {new Date(assessment.completedAt).toLocaleDateString('ja-JP')}
                </Text>
                <Chip
                  mode="outlined"
                  compact
                  style={[styles.historyScore, { borderColor: getScoreColor(assessment.totalScore) }]}
                  textStyle={{ color: getScoreColor(assessment.totalScore) }}
                >
                  {assessment.totalScore}点
                </Chip>
              </View>
              
              <View style={styles.historyDetails}>
                <Text style={styles.historyLevel}>{assessment.interpretation.title}</Text>
                <View style={styles.historyCategoryScores}>
                  <Text style={styles.historyCategoryScore}>
                    感情: {assessment.categoryScores.emotion}点
                  </Text>
                  <Text style={styles.historyCategoryScore}>
                    自信: {assessment.categoryScores.confidence}点
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>データを読み込み中...</Text>
      </View>
    );
  }

  // 結果表示
  if (showResults && currentAssessment.isCompleted) {
    return renderResults();
  }

  // 履歴表示
  if (showHistory) {
    return renderHistory();
  }

  // 評価セッション中
  if (currentAssessment.id && !currentAssessment.isCompleted) {
    return (
      <ScrollView style={styles.container}>
        {/* ヘッダー */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Text style={styles.assessmentTitle}>ACL-RSI 心理的準備度評価</Text>
            <Text style={styles.assessmentSubtitle}>
              スポーツ復帰に向けた心理的準備度を評価します
            </Text>
          </Card.Content>
        </Card>

        {/* 進捗表示 */}
        <Card style={styles.progressCard}>
          <Card.Content>
            {renderProgressIndicator()}
            {renderQuestionNavigation()}
          </Card.Content>
        </Card>

        {/* 質問表示 */}
        {currentQuestion && (
          <Card style={styles.questionCard}>
            <Card.Content>
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>質問 {currentQuestion.id}</Text>
                <Chip
                  mode="outlined"
                  compact
                  style={styles.categoryChip}
                >
                  {currentQuestion.category === 'emotion' ? '感情面' : '自信面'}
                </Chip>
              </View>
              
              <Text style={styles.questionText}>{currentQuestion.question}</Text>
              
              {renderScaleButtons()}
            </Card.Content>
          </Card>
        )}

        {/* ナビゲーションボタン */}
        <View style={styles.navigationButtons}>
          <Button
            mode="outlined"
            onPress={handlePrevious}
            disabled={currentAssessment.currentQuestionIndex === 0}
            style={styles.navButton}
          >
            前の質問
          </Button>
          <Button
            mode="contained"
            onPress={handleNext}
            disabled={selectedAnswer === null}
            style={styles.navButton}
          >
            {isLastQuestion ? '評価完了' : '次の質問'}
          </Button>
        </View>
      </ScrollView>
    );
  }

  // 開始画面
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.introCard}>
        <Card.Content>
          <Text style={styles.introTitle}>ACL-RSI評価</Text>
          <Text style={styles.introSubtitle}>心理的準備度テスト</Text>
          
          <Text style={styles.introDescription}>
            ACL-RSI（ACL Return to Sport after Injury）は、ACL損傷後のスポーツ復帰に向けた心理的準備度を評価する標準化された質問票です。
          </Text>
          
          <View style={styles.introFeatures}>
            <View style={styles.introFeature}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>12の質問で総合評価</Text>
            </View>
            <View style={styles.introFeature}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureText}>感情面と自信面を個別分析</Text>
            </View>
            <View style={styles.introFeature}>
              <Text style={styles.featureIcon}>💡</Text>
              <Text style={styles.featureText}>個別化された改善提案</Text>
            </View>
            <View style={styles.introFeature}>
              <Text style={styles.featureIcon}>📈</Text>
              <Text style={styles.featureText}>経時的な変化を追跡</Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleStartAssessment}
            style={styles.startAssessmentButton}
          >
            評価を開始
          </Button>

          {assessmentHistory.length > 0 && (
            <Button
              mode="outlined"
              onPress={() => setShowHistory(true)}
              style={styles.historyButton}
            >
              過去の評価を見る
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* 最新結果（あれば） */}
      {assessmentHistory.length > 0 && (
        <Card style={styles.latestResultCard}>
          <Card.Content>
            <Text style={styles.latestResultTitle}>最新の評価結果</Text>
            <View style={styles.latestResultContent}>
              <View style={styles.latestScoreContainer}>
                <Text style={[styles.latestScore, { color: getScoreColor(stats.latestScore) }]}>
                  {stats.latestScore}
                </Text>
                <Text style={styles.latestScoreUnit}>点</Text>
              </View>
              <View style={styles.latestResultDetails}>
                <Text style={styles.latestResultDate}>
                  {new Date(assessmentHistory[0].completedAt).toLocaleDateString('ja-JP')}
                </Text>
                <Text style={styles.latestResultLevel}>
                  {assessmentHistory[0].interpretation.title}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  headerCard: {
    margin: 16,
    elevation: 2,
  },
  assessmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  assessmentSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  progressCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  questionNav: {
    marginTop: 8,
  },
  questionNavChip: {
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  answeredChip: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  currentChip: {
    backgroundColor: '#2196F3',
  },
  questionNavText: {
    fontSize: 12,
  },
  answeredText: {
    color: '#4CAF50',
  },
  currentText: {
    color: '#fff',
  },
  questionCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  categoryChip: {
    borderColor: '#666',
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    color: '#333',
  },
  scaleContainer: {
    alignItems: 'center',
  },
  scaleLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  scaleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 16,
  },
  scaleButton: {
    alignItems: 'center',
    flex: 1,
  },
  scaleButtonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
    marginTop: 8,
  },
  navButton: {
    flex: 0.45,
  },
  // 結果画面のスタイル
  resultsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scoreCard: {
    margin: 16,
    elevation: 4,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  totalScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  totalScore: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  categoryScores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  categoryScore: {
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  categoryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  interpretationChip: {
    borderWidth: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  interpretationDescription: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
  // アクションカード
  actionCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  priorityBadge: {
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  priorityText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: 'bold',
  },
  actionItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionItemDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  actionItemTimeline: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 16,
  },
  actionButton: {
    flex: 0.45,
  },
  // 履歴画面
  historyContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsCard: {
    margin: 16,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    textAlign: 'center',
  },
  historyItem: {
    margin: 16,
    marginTop: 8,
    elevation: 1,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyScore: {
    borderWidth: 1,
  },
  historyDetails: {
    marginTop: 8,
  },
  historyLevel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  historyCategoryScores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyCategoryScore: {
    fontSize: 10,
    color: '#999',
  },
  // 開始画面
  introCard: {
    margin: 16,
    elevation: 2,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  introDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 20,
  },
  introFeatures: {
    marginBottom: 24,
  },
  introFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
  },
  startAssessmentButton: {
    marginBottom: 12,
  },
  historyButton: {
    borderColor: '#666',
  },
  latestResultCard: {
    margin: 16,
    marginTop: 8,
    elevation: 1,
    backgroundColor: '#f9f9f9',
  },
  latestResultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  latestResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  latestScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 20,
  },
  latestScore: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  latestScoreUnit: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  latestResultDetails: {
    flex: 1,
  },
  latestResultDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  latestResultLevel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ACLRSIScreen;