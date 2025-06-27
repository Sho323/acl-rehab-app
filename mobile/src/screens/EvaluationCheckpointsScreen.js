import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  List,
  Chip,
  Divider,
  IconButton,
  Portal,
  Modal,
} from 'react-native-paper';
import { runningStartCriteria } from '../data/runningCriteria';
import { returnToSportCriteria } from '../data/returnToSportCriteria';

const { width } = Dimensions.get('window');

const EvaluationCheckpointsScreen = ({ navigation }) => {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const evaluationCheckpoints = [
    {
      id: 'month_3',
      title: '術後3ヶ月評価',
      subtitle: 'ランニング開始基準',
      description: 'ランニングを安全に開始するための必須評価項目',
      timeline: '術後12週以降',
      icon: '🏃‍♂️',
      color: '#FF9800',
      data: runningStartCriteria,
      totalCriteria: runningStartCriteria.criteria.length,
      nextStep: 'ランニング・プライオメトリクス開始',
      screen: 'RunningCriteria'
    },
    {
      id: 'month_6_plus',
      title: '術後6ヶ月以降評価',
      subtitle: '競技復帰チェックリスト',
      description: '競技への安全な復帰のための包括的評価項目',
      timeline: '術後6ヶ月以降',
      icon: '⚽',
      color: '#4CAF50',
      data: returnToSportCriteria,
      totalCriteria: returnToSportCriteria.categories.reduce((sum, cat) => sum + cat.criteria.length, 0),
      nextStep: '段階的競技復帰開始',
      screen: 'ReturnToSport'
    }
  ];

  const handleCheckpointPress = (checkpoint) => {
    if (checkpoint.screen === 'RunningCriteria') {
      navigation.navigate('RunningCriteria');
    } else if (checkpoint.screen === 'ReturnToSport') {
      navigation.navigate('ReturnToSport');
    }
  };

  const showCheckpointDetail = (checkpoint) => {
    setSelectedCheckpoint(checkpoint);
    setShowDetailModal(true);
  };

  const renderCheckpointCard = (checkpoint) => {
    return (
      <Card key={checkpoint.id} style={[styles.checkpointCard, { borderLeftColor: checkpoint.color }]}>
        <Card.Content>
          <View style={styles.checkpointHeader}>
            <View style={styles.checkpointInfo}>
              <Text style={styles.checkpointIcon}>{checkpoint.icon}</Text>
              <View style={styles.checkpointText}>
                <Text style={styles.checkpointTitle}>{checkpoint.title}</Text>
                <Text style={styles.checkpointSubtitle}>{checkpoint.subtitle}</Text>
              </View>
            </View>
            <IconButton
              icon="information-outline"
              iconColor={checkpoint.color}
              size={24}
              onPress={() => showCheckpointDetail(checkpoint)}
            />
          </View>

          <Text style={styles.checkpointDescription}>{checkpoint.description}</Text>

          <View style={styles.checkpointDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>評価時期:</Text>
              <Chip mode="outlined" style={[styles.timelineChip, { borderColor: checkpoint.color }]}>
                {checkpoint.timeline}
              </Chip>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>評価項目数:</Text>
              <Text style={styles.detailValue}>{checkpoint.totalCriteria}項目</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>次のステップ:</Text>
              <Text style={styles.detailValue}>{checkpoint.nextStep}</Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={() => handleCheckpointPress(checkpoint)}
            style={[styles.evaluationButton, { backgroundColor: checkpoint.color }]}
            icon="clipboard-check"
          >
            評価を開始
          </Button>
        </Card.Content>
      </Card>
    );
  };

  const renderCheckpointOverview = (checkpoint) => {
    if (checkpoint.id === 'month_3') {
      return (
        <View style={styles.overviewSection}>
          <Text style={styles.overviewTitle}>主要評価項目:</Text>
          {checkpoint.data.criteria.map((criterion, index) => (
            <View key={criterion.id} style={styles.overviewItem}>
              <Text style={styles.overviewIcon}>{criterion.icon}</Text>
              <View style={styles.overviewText}>
                <Text style={styles.overviewItemTitle}>{criterion.title}</Text>
                <Text style={styles.overviewItemCriteria}>{criterion.passingCriteria}</Text>
              </View>
            </View>
          ))}
        </View>
      );
    } else {
      return (
        <View style={styles.overviewSection}>
          <Text style={styles.overviewTitle}>評価カテゴリ:</Text>
          {checkpoint.data.categories.map((category, index) => (
            <View key={category.id} style={styles.overviewCategory}>
              <Text style={styles.overviewCategoryTitle}>{category.title}</Text>
              <Text style={styles.overviewCategoryDesc}>{category.description}</Text>
              <Text style={styles.overviewCategoryCount}>
                {category.criteria.length}項目の評価
              </Text>
            </View>
          ))}
        </View>
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* ヘッダー */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.screenTitle}>評価チェックポイント</Text>
          <Text style={styles.screenDescription}>
            ACLリハビリテーションの重要な評価時期における必須チェック項目です。
            各段階で適切な評価を行い、安全な回復と競技復帰を目指しましょう。
          </Text>
        </Card.Content>
      </Card>

      {/* タイムライン概要 */}
      <Card style={styles.timelineCard}>
        <Card.Content>
          <Text style={styles.timelineTitle}>評価タイムライン</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineMarker, { backgroundColor: '#FF9800' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineItemTitle}>術後3ヶ月</Text>
                <Text style={styles.timelineItemDesc}>ランニング開始基準評価</Text>
              </View>
            </View>
            <View style={styles.timelineLine} />
            <View style={styles.timelineItem}>
              <View style={[styles.timelineMarker, { backgroundColor: '#4CAF50' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineItemTitle}>術後6ヶ月以降</Text>
                <Text style={styles.timelineItemDesc}>競技復帰チェックリスト</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* 評価チェックポイント */}
      <Text style={styles.sectionTitle}>評価チェックポイント</Text>
      {evaluationCheckpoints.map(renderCheckpointCard)}

      {/* 詳細モーダル */}
      <Portal>
        <Modal
          visible={showDetailModal}
          onDismiss={() => setShowDetailModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedCheckpoint && (
            <ScrollView style={styles.modalScroll}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedCheckpoint.title}</Text>
                <IconButton
                  icon="close"
                  onPress={() => setShowDetailModal(false)}
                />
              </View>
              <Divider />
              
              <View style={styles.modalContent}>
                <Text style={styles.modalDescription}>
                  {selectedCheckpoint.description}
                </Text>

                <View style={styles.modalDetailSection}>
                  <Text style={styles.modalDetailTitle}>評価の目的</Text>
                  <Text style={styles.modalDetailText}>
                    {selectedCheckpoint.id === 'month_3' 
                      ? 'ランニングを安全に開始するための身体機能と症状の評価を行います。すべての基準をクリアすることで、より高強度の訓練に進むことができます。'
                      : '競技への完全復帰に向けた包括的な評価を行います。身体機能、動作の質、心理的準備度など多角的な視点から復帰可能性を判定します。'
                    }
                  </Text>
                </View>

                <View style={styles.modalDetailSection}>
                  <Text style={styles.modalDetailTitle}>評価のタイミング</Text>
                  <Text style={styles.modalDetailText}>
                    {selectedCheckpoint.timeline}に実施してください。
                    {selectedCheckpoint.id === 'month_3' 
                      ? '術後12週間が経過し、基礎的なリハビリテーションが完了した時点で評価を行います。'
                      : '術後6ヶ月以降で、高強度トレーニングを十分に実施した後に評価を行います。'
                    }
                  </Text>
                </View>

                {renderCheckpointOverview(selectedCheckpoint)}

                <View style={styles.modalDetailSection}>
                  <Text style={styles.modalDetailTitle}>注意事項</Text>
                  <Text style={styles.modalDetailText}>
                    • すべての評価は医療従事者の指導の下で実施してください{'\n'}
                    • 痛みや不快感がある場合は評価を中止してください{'\n'}
                    • 基準に達しない場合は、さらなるトレーニングを継続してください{'\n'}
                    • 個人差があるため、医師との相談を欠かさないでください
                  </Text>
                </View>

                <Button
                  mode="contained"
                  onPress={() => {
                    setShowDetailModal(false);
                    handleCheckpointPress(selectedCheckpoint);
                  }}
                  style={[styles.modalButton, { backgroundColor: selectedCheckpoint.color }]}
                >
                  評価を開始する
                </Button>
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
    color: '#333',
  },
  screenDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  timelineCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  timeline: {
    paddingHorizontal: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  timelineContent: {
    flex: 1,
  },
  timelineItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timelineItemDesc: {
    fontSize: 14,
    color: '#666',
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: '#ddd',
    marginLeft: 5,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
    color: '#333',
  },
  checkpointCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
    borderLeftWidth: 4,
  },
  checkpointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkpointInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkpointIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  checkpointText: {
    flex: 1,
  },
  checkpointTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  checkpointSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  checkpointDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 16,
  },
  checkpointDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  timelineChip: {
    borderWidth: 1,
  },
  evaluationButton: {
    borderRadius: 8,
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
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
  },
  modalContent: {
    padding: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalDetailSection: {
    marginBottom: 20,
  },
  modalDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalDetailText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  overviewSection: {
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  overviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 8,
  },
  overviewIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  overviewText: {
    flex: 1,
  },
  overviewItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  overviewItemCriteria: {
    fontSize: 12,
    color: '#666',
  },
  overviewCategory: {
    marginBottom: 16,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ddd',
    paddingVertical: 8,
  },
  overviewCategoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  overviewCategoryDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  overviewCategoryCount: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  modalButton: {
    marginTop: 16,
    borderRadius: 8,
  },
});

export default EvaluationCheckpointsScreen;