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
  Badge,
} from 'react-native-paper';
import { returnToSportCriteria, categoryImportance } from '../data/returnToSportCriteria';

const { width } = Dimensions.get('window');

const ReturnToSportScreen = ({ navigation }) => {
  const [evaluationResults, setEvaluationResults] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState(null);
  const [overallResult, setOverallResult] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    // 初期化：すべての基準を未評価に設定
    const allCriteria = returnToSportCriteria.categories.flatMap(cat => cat.criteria);
    const initialResults = allCriteria.map(criteria => ({
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
      const result = returnToSportCriteria.getOverallEvaluation(evaluationResults);
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

  const getCategoryProgress = (categoryId) => {
    const category = returnToSportCriteria.categories.find(cat => cat.id === categoryId);
    if (!category) return { passed: 0, total: 0, percentage: 0 };

    const total = category.criteria.length;
    const passed = category.criteria.filter(criterion => {
      const result = evaluationResults.find(r => r.id === criterion.id);
      return result && result.passed;
    }).length;

    return {
      passed,
      total,
      percentage: total > 0 ? (passed / total) * 100 : 0
    };
  };

  const getStatusColor = (result) => {
    if (!result.evaluated) return '#9E9E9E';
    return result.passed ? '#4CAF50' : '#F44336';
  };

  const getStatusIcon = (result) => {
    if (!result.evaluated) return 'help-circle-outline';
    return result.passed ? 'check-circle' : 'close-circle';
  };

  const getImportanceColor = (categoryId) => {
    const importance = categoryImportance[categoryId]?.importance;
    switch (importance) {
      case 'critical': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const getImportanceLabel = (categoryId) => {
    const importance = categoryImportance[categoryId]?.importance;
    switch (importance) {
      case 'critical': return '必須';
      case 'high': return '重要';
      case 'medium': return '推奨';
      default: return '標準';
    }
  };

  const renderCategoryCard = (category) => {
    const progress = getCategoryProgress(category.id);
    const importance = categoryImportance[category.id];

    return (
      <Card key={category.id} style={styles.categoryCard}>
        <Card.Content>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
            <View style={styles.categoryBadges}>
              <Chip 
                mode="outlined" 
                compact
                style={[styles.importanceChip, { borderColor: getImportanceColor(category.id) }]}
                textStyle={{ color: getImportanceColor(category.id), fontSize: 10 }}
              >
                {getImportanceLabel(category.id)}
              </Chip>
              <Badge size={24} style={styles.progressBadge}>
                {progress.passed}/{progress.total}
              </Badge>
            </View>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>
              進捗: {progress.passed}/{progress.total} ({Math.round(progress.percentage)}%)
            </Text>
            <ProgressBar 
              progress={progress.percentage / 100} 
              color={getImportanceColor(category.id)}
              style={styles.progressBar}
            />
          </View>

          {importance?.description && (
            <Text style={styles.importanceDescription}>
              {importance.description}
            </Text>
          )}

          <View style={styles.criteriaList}>
            {category.criteria.map(criterion => {
              const result = evaluationResults.find(r => r.id === criterion.id);
              return (
                <List.Item
                  key={criterion.id}
                  title={criterion.title}
                  description={criterion.passingCriteria}
                  left={() => (
                    <View style={styles.criteriaIcon}>
                      <Text style={styles.criteriaEmoji}>{criterion.icon}</Text>
                    </View>
                  )}
                  right={() => (
                    <View style={styles.criteriaActions}>
                      <IconButton
                        icon={getStatusIcon(result)}
                        iconColor={getStatusColor(result)}
                        size={20}
                        onPress={() => showCriteriaDetail(criterion)}
                      />
                      <View style={styles.evaluationButtons}>
                        <IconButton
                          icon="check"
                          iconColor={result?.passed && result?.evaluated ? '#4CAF50' : '#ccc'}
                          size={16}
                          onPress={() => handleCriteriaEvaluation(criterion.id, true)}
                          style={styles.miniButton}
                        />
                        <IconButton
                          icon="close"
                          iconColor={!result?.passed && result?.evaluated ? '#F44336' : '#ccc'}
                          size={16}
                          onPress={() => handleCriteriaEvaluation(criterion.id, false)}
                          style={styles.miniButton}
                        />
                      </View>
                    </View>
                  )}
                  onPress={() => showCriteriaDetail(criterion)}
                  style={styles.criteriaItem}
                />
              );
            })}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderOverallResult = () => {
    if (!overallResult) return null;

    const getResultColor = () => {
      if (overallResult.canReturnToSport) return '#4CAF50';
      if (overallResult.weightedScore >= 75) return '#FF9800';
      if (overallResult.weightedScore >= 60) return '#2196F3';
      return '#F44336';
    };

    return (
      <Card style={[styles.resultCard, { borderLeftColor: getResultColor() }]}>
        <Card.Content>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>総合評価結果</Text>
            <View style={styles.resultScores}>
              <Chip 
                mode="outlined" 
                style={[styles.scoreChip, { borderColor: getResultColor() }]}
                textStyle={{ color: getResultColor() }}
              >
                {Math.round(overallResult.weightedScore)}点
              </Chip>
            </View>
          </View>
          
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>
              重み付けスコア: {Math.round(overallResult.weightedScore)}/100点
            </Text>
            <ProgressBar 
              progress={overallResult.weightedScore / 100} 
              color={getResultColor()}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>
              達成率: {overallResult.passedCriteria}/{overallResult.totalCriteria}項目 ({Math.round(overallResult.passRate)}%)
            </Text>
            <ProgressBar 
              progress={overallResult.passRate / 100} 
              color={getResultColor()}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.recommendationSection}>
            <Text style={[styles.recommendationTitle, { color: getResultColor() }]}>
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

          {overallResult.canReturnToSport && (
            <Button
              mode="contained"
              onPress={() => Alert.alert('注意', '医療従事者の最終確認を得てから段階的な競技復帰を開始してください。')}
              style={styles.returnButton}
              buttonColor="#4CAF50"
            >
              競技復帰準備完了
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
          <Text style={styles.screenTitle}>{returnToSportCriteria.title}</Text>
          <Text style={styles.screenDescription}>{returnToSportCriteria.description}</Text>
          <Chip mode="outlined" style={styles.periodChip}>
            評価時期: {returnToSportCriteria.evaluationPeriod}
          </Chip>
        </Card.Content>
      </Card>

      {/* 総合結果 */}
      {renderOverallResult()}

      {/* カテゴリ別評価 */}
      <Text style={styles.sectionTitle}>カテゴリ別評価</Text>
      {returnToSportCriteria.categories.map(renderCategoryCard)}

      {/* 詳細モーダル */}
      <Portal>
        <Modal
          visible={showDetailModal}
          onDismiss={() => setShowDetailModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedCriteria && (
            <ScrollView style={styles.modalScroll}>
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
                
                <Text style={styles.detailSectionTitle}>測定方法</Text>
                <Text style={styles.detailText}>
                  {selectedCriteria.measurementMethod}
                </Text>
                
                <Text style={styles.detailSectionTitle}>合格基準</Text>
                <Text style={[styles.detailText, styles.passingCriteriaText]}>
                  {selectedCriteria.passingCriteria}
                </Text>
                
                <Text style={styles.detailSectionTitle}>重要度</Text>
                <Text style={styles.detailText}>
                  重み: {selectedCriteria.weight}/10
                </Text>

                <View style={styles.modalEvaluation}>
                  <Text style={styles.modalEvaluationTitle}>評価結果</Text>
                  <View style={styles.modalEvaluationButtons}>
                    <Button
                      mode="contained"
                      onPress={() => {
                        handleCriteriaEvaluation(selectedCriteria.id, true);
                        setShowDetailModal(false);
                      }}
                      style={styles.modalEvalButton}
                      buttonColor="#4CAF50"
                    >
                      合格
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => {
                        handleCriteriaEvaluation(selectedCriteria.id, false);
                        setShowDetailModal(false);
                      }}
                      style={styles.modalEvalButton}
                      buttonColor="#F44336"
                    >
                      未達成
                    </Button>
                  </View>
                </View>
              </View>
            </ScrollView>
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
  resultScores: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreChip: {
    borderWidth: 1,
  },
  progressSection: {
    marginBottom: 12,
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
  returnButton: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  categoryCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  categoryBadges: {
    alignItems: 'flex-end',
  },
  importanceChip: {
    marginBottom: 4,
    borderWidth: 1,
  },
  progressBadge: {
    backgroundColor: '#2196F3',
  },
  importanceDescription: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  criteriaList: {
    marginTop: 8,
  },
  criteriaItem: {
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  criteriaIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  criteriaEmoji: {
    fontSize: 20,
  },
  criteriaActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  evaluationButtons: {
    flexDirection: 'row',
  },
  miniButton: {
    margin: 0,
    width: 32,
    height: 32,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  modalScroll: {
    maxHeight: '100%',
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
  modalEvaluation: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalEvaluationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalEvaluationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalEvalButton: {
    minWidth: 100,
  },
});

export default ReturnToSportScreen;