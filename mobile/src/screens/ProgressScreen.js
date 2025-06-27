import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  Card,
  ProgressBar,
  Chip,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { setDummyData } from '../store/slices/progressSlice';

const ProgressScreen = () => {
  const dispatch = useDispatch();
  const {
    weeklyGoal,
    monthlyStats,
    recentSessions,
    isLoading,
    error,
  } = useSelector((state) => state.progress);

  useEffect(() => {
    // デモ用ダミーデータを設定
    dispatch(setDummyData());
  }, [dispatch]);

  const getPainLevelColor = (level) => {
    if (level <= 3) return '#4CAF50';
    if (level <= 6) return '#FF9800';
    return '#F44336';
  };

  const getBorgScaleColor = (scale) => {
    if (scale <= 11) return '#4CAF50';
    if (scale <= 15) return '#FF9800';
    return '#F44336';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>進捗データを読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 週間目標 */}
      <Card style={styles.goalCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>今週の目標</Text>
          <View style={styles.goalContent}>
            <Text style={styles.goalText}>
              {weeklyGoal.completed} / {weeklyGoal.total} セッション完了
            </Text>
            <ProgressBar
              progress={weeklyGoal.completed / weeklyGoal.total}
              color="#2E7D32"
              style={styles.goalProgress}
            />
            <Text style={styles.goalPercentage}>
              {Math.round((weeklyGoal.completed / weeklyGoal.total) * 100)}%
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* 月間統計 */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>今月の統計</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{monthlyStats.sessionsCompleted}</Text>
              <Text style={styles.statLabel}>セッション数</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{monthlyStats.totalExercises}</Text>
              <Text style={styles.statLabel}>総運動回数</Text>
            </View>
          </View>

          <Divider style={styles.statsDivider} />

          <View style={styles.averageStats}>
            <View style={styles.averageStat}>
              <Text style={styles.averageLabel}>平均痛みレベル</Text>
              <View style={styles.averageValue}>
                <Text style={[styles.averageNumber, { color: getPainLevelColor(monthlyStats.averagePainLevel) }]}>
                  {monthlyStats.averagePainLevel}
                </Text>
                <Text style={styles.averageUnit}>/10</Text>
              </View>
            </View>
            
            <View style={styles.averageStat}>
              <Text style={styles.averageLabel}>平均疲労度</Text>
              <View style={styles.averageValue}>
                <Text style={[styles.averageNumber, { color: getBorgScaleColor(monthlyStats.averageBorgScale) }]}>
                  {monthlyStats.averageBorgScale}
                </Text>
                <Text style={styles.averageUnit}>/20</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* 最近のセッション */}
      <Card style={styles.sessionsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>最近のセッション</Text>
          
          {recentSessions.map((session, index) => (
            <View key={index} style={styles.sessionItem}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionDate}>
                  {new Date(session.date).toLocaleDateString('ja-JP', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Chip
                  mode="outlined"
                  style={[styles.painChip, { borderColor: getPainLevelColor(session.painLevel) }]}
                  textStyle={{ color: getPainLevelColor(session.painLevel) }}
                >
                  痛み {session.painLevel}
                </Chip>
              </View>
              
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionDetail}>
                  {session.exercises}種目 • {session.duration}分
                </Text>
              </View>
              
              {index < recentSessions.length - 1 && (
                <Divider style={styles.sessionDivider} />
              )}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* 評価指標の説明 */}
      <Card style={styles.legendCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>評価指標</Text>
          
          <View style={styles.legendSection}>
            <Text style={styles.legendTitle}>痛みレベル (VAS)</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>0-3: 軽度</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.legendText}>4-6: 中等度</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
                <Text style={styles.legendText}>7-10: 重度</Text>
              </View>
            </View>
          </View>

          <View style={styles.legendSection}>
            <Text style={styles.legendTitle}>疲労度 (Borgスケール)</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>6-11: 楽</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.legendText}>12-15: やや〜きつい</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
                <Text style={styles.legendText}>16-20: 非常にきつい</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  goalCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  goalContent: {
    alignItems: 'center',
  },
  goalText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  goalProgress: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  goalPercentage: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statsDivider: {
    marginBottom: 16,
  },
  averageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  averageStat: {
    alignItems: 'center',
  },
  averageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  averageValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  averageNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  averageUnit: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  sessionsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
  },
  sessionItem: {
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  painChip: {
    borderWidth: 1,
  },
  sessionDetails: {
    marginLeft: 4,
  },
  sessionDetail: {
    fontSize: 12,
    color: '#666',
  },
  sessionDivider: {
    marginTop: 12,
  },
  legendCard: {
    margin: 16,
    marginTop: 8,
    elevation: 1,
    backgroundColor: '#FAFAFA',
  },
  legendSection: {
    marginBottom: 12,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
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
});

export default ProgressScreen;