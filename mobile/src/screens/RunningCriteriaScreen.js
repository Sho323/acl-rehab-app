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
  List,
  Chip,
  ProgressBar,
  IconButton,
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import { runningStartCriteria, criteriaDetails } from '../data/runningCriteria';

const { width } = Dimensions.get('window');

const RunningCriteriaScreen = ({ navigation }) => {
  const [evaluationResults, setEvaluationResults] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState(null);
  const [overallResult, setOverallResult] = useState(null);

  useEffect(() => {
    // 初期化：すべての基準を未評価に設定
    const initialResults = runningStartCriteria.criteria.map(criteria => ({
      id: criteria.id,
      passed: false,
      evaluated: false,
      value: null,
      notes: ''
    }));
    setEvaluationResults(initialResults);
  }, []);

  useEffect(() => {
    // 評価結果が更新されたら総合判定を計算
    if (evaluationResults.length > 0) {
      const result = runningStartCriteria.getEvaluationResult(evaluationResults);
      setOverallResult(result);
    }
  }, [evaluationResults]);

  const handleCriteriaEvaluation = (criteriaId, passed, value = null, notes = '') => {
    setEvaluationResults(prev => 
      prev.map(result => 
        result.id === criteriaId 
          ? { ...result, passed, evaluated: true, value, notes }
          : result
      )
    );
  };

  const showCriteriaDetail = (criteria) => {
    setSelectedCriteria(criteria);
    setShowDetailModal(true);
  };

  const getStatusColor = (result) => {
    if (!result.evaluated) return '#9E9E9E';
    return result.passed ? '#4CAF50' : '#F44336';
  };

  const getStatusIcon = (result) => {
    if (!result.evaluated) return 'help-circle-outline';
    return result.passed ? 'check-circle' : 'close-circle';
  };

  const getRecommendationColor = (level) => {
    switch (level) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'danger': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const renderCriteriaCard = (criteria) => {
    const result = evaluationResults.find(r => r.id === criteria.id);
    if (!result) return null;

    return (
      <Card key={criteria.id} style={styles.criteriaCard}>
        <Card.Content>
          <View style={styles.criteriaHeader}>
            <View style={styles.criteriaInfo}>
              <Text style={styles.criteriaIcon}>{criteria.icon}</Text>
              <View style={styles.criteriaText}>
                <Text style={styles.criteriaCategory}>{criteria.category}</Text>
                <Text style={styles.criteriaTitle}>{criteria.title}</Text>
              </View>
            </View>
            <IconButton
              icon={getStatusIcon(result)}
              iconColor={getStatusColor(result)}
              size={24}
              onPress={() => showCriteriaDetail(criteria)}
            />
          </View>
          
          <Text style={styles.criteriaDescription}>{criteria.description}</Text>
          
          <View style={styles.measurementInfo}>
            <Text style={styles.measurementLabel}>測定方法:</Text>
            <Text style={styles.measurementText}>{criteria.measurementMethod}</Text>
          </View>
          
          <View style={styles.passingCriteria}>
            <Text style={styles.passingLabel}>合格基準:</Text>
            <Text style={styles.passingText}>{criteria.passingCriteria}</Text>
          </View>

          <View style={styles.evaluationButtons}>
            <Button
              mode={result.passed && result.evaluated ? "contained" : "outlined"}
              onPress={() => handleCriteriaEvaluation(criteria.id, true)}
              style={[styles.evalButton, { marginRight: 8 }]}
              buttonColor={result.passed && result.evaluated ? '#4CAF50' : undefined}
              compact
            >
              合格
            </Button>
            <Button
              mode={!result.passed && result.evaluated ? "contained" : "outlined"}
              onPress={() => handleCriteriaEvaluation(criteria.id, false)}
              style={styles.evalButton}
              buttonColor={!result.passed && result.evaluated ? '#F44336' : undefined}
              compact
            >
              未達成
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderOverallResult = () => {
    if (!overallResult) return null;

    return (
      <Card style={[styles.resultCard, { borderLeftColor: getRecommendationColor(overallResult.recommendation.level) }]}>
        <Card.Content>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>総合評価結果</Text>
            <Chip 
              mode="outlined" 
              style={[styles.resultChip, { borderColor: getRecommendationColor(overallResult.recommendation.level) }]}
              textStyle={{ color: getRecommendationColor(overallResult.recommendation.level) }}
            >
              {overallResult.passedCriteria}/{overallResult.totalCriteria}項目
            </Chip>
          </View>
          
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>
              達成率: {Math.round(overallResult.passRate)}%
            </Text>
            <ProgressBar 
              progress={overallResult.passRate / 100} 
              color={getRecommendationColor(overallResult.recommendation.level)}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.recommendationSection}>
            <Text style={[styles.recommendationTitle, { color: getRecommendationColor(overallResult.recommendation.level) }]}>
              {overallResult.recommendation.title}
            </Text>
            <Text style={styles.recommendationMessage}>
              {overallResult.recommendation.message}
            </Text>
            
            <Text style={styles.nextStepsTitle}>推奨される次のステップ:</Text>
            {overallResult.recommendation.nextSteps.map((step, index) => (
              <Text key={index} style={styles.nextStepItem}>
                • {step}
              </Text>
            ))}
          </View>

          {overallResult.canStartRunning && (
            <Button
              mode="contained"
              onPress={() => Alert.alert('注意', '医療従事者の最終確認を得てからランニングを開始してください。')}
              style={styles.startRunningButton}
              buttonColor="#4CAF50"
            >
              ランニング開始準備完了
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* ヘッダー情報 */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.screenTitle}>{runningStartCriteria.title}</Text>
          <Text style={styles.screenDescription}>{runningStartCriteria.description}</Text>
          <Chip mode="outlined" style={styles.periodChip}>
            評価時期: {runningStartCriteria.evaluationPeriod}
          </Chip>
        </Card.Content>
      </Card>

      {/* 総合結果 */}
      {renderOverallResult()}

      {/* 評価項目リスト */}
      <Text style={styles.sectionTitle}>評価項目</Text>
      {runningStartCriteria.criteria.map(renderCriteriaCard)}

      {/* 詳細モーダル */}
      <Portal>
        <Modal
          visible={showDetailModal}
          onDismiss={() => setShowDetailModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedCriteria && (
            <View>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedCriteria.title}</Text>
                <IconButton
                  icon="close"
                  onPress={() => setShowDetailModal(false)}
                />
              </View>
              <Divider />
              <View style={styles.modalContent}>
                <Text style={styles.modalDescription}>
                  {selectedCriteria.description}
                </Text>
                
                <Text style={styles.detailSectionTitle}>根拠・理由</Text>
                <Text style={styles.detailText}>
                  {criteriaDetails[selectedCriteria.id]?.rationale}
                </Text>
                
                <Text style={styles.detailSectionTitle}>改善のためのヒント</Text>
                <Text style={styles.detailText}>
                  {criteriaDetails[selectedCriteria.id]?.tips}
                </Text>
                
                <Text style={styles.detailSectionTitle}>測定方法</Text>
                <Text style={styles.detailText}>
                  {selectedCriteria.measurementMethod}
                </Text>
                
                <Text style={styles.detailSectionTitle}>合格基準</Text>
                <Text style={[styles.detailText, styles.passingCriteriaText]}>
                  {selectedCriteria.passingCriteria}
                </Text>
              </View>
            </View>
          )}
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    elevation: 2,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  screenDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  periodChip: {
    alignSelf: 'flex-start',
  },
  resultCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
    borderLeftWidth: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultChip: {
    borderWidth: 1,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  recommendationSection: {
    marginTop: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recommendationMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  nextStepsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nextStepItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 8,
  },
  startRunningButton: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  criteriaCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  criteriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  criteriaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  criteriaIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  criteriaText: {
    flex: 1,
  },
  criteriaCategory: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  criteriaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  criteriaDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  measurementInfo: {
    marginBottom: 8,
  },
  measurementLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  measurementText: {
    fontSize: 12,
    color: '#333',
  },
  passingCriteria: {
    marginBottom: 12,
  },
  passingLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  passingText: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  evaluationButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  evalButton: {
    minWidth: 70,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  modalContent: {
    padding: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  passingCriteriaText: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default RunningCriteriaScreen;