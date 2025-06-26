import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  ProgressBar,
  IconButton,
  Divider,
  Surface,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { fetchExercisesByPhase, startExerciseSession } from '../store/slices/exerciseSlice';

const ExerciseScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { exercises, currentSession, isLoading } = useSelector((state) => state.exercise);
  
  const [selectedDifficulty, setSelectedDifficulty] = useState('basic');

  useEffect(() => {
    if (user?.currentPhase) {
      dispatch(fetchExercisesByPhase(user.currentPhase));
    }
  }, [user?.currentPhase, dispatch]);

  // サンプル運動データ（実際のAPIから取得される予定）
  const sampleExercises = [
    {
      id: 1,
      name: '大腿四頭筋セッティング',
      description: '膝を伸ばした状態で太ももの前の筋肉を収縮させる',
      duration: '5秒保持',
      sets: 3,
      reps: 10,
      difficulty: 'basic',
      videoUrl: null,
      instructions: [
        '仰向けに寝て、膝を伸ばします',
        '太ももの前の筋肉に力を入れます',
        '5秒間保持してからゆっくり力を抜きます',
        '痛みが出ない範囲で行ってください'
      ],
    },
    {
      id: 2,
      name: '足首ポンプ運動',
      description: '足首を上下に動かして血流を促進する',
      duration: '連続動作',
      sets: 3,
      reps: 50,
      difficulty: 'basic',
      videoUrl: null,
      instructions: [
        '座った状態または仰向けで行います',
        'つま先を上に向けて足首を曲げます',
        'つま先を下に向けて足首を伸ばします',
        'ゆっくりとリズミカルに行います'
      ],
    },
    {
      id: 3,
      name: 'ミニスクワット',
      description: '膝屈曲30度までの浅いスクワット',
      duration: '3秒保持',
      sets: 3,
      reps: 8,
      difficulty: 'intermediate',
      videoUrl: null,
      instructions: [
        '足を肩幅に開いて立ちます',
        '膝を30度まで曲げてください',
        '3秒間その姿勢を保持します',
        '膝がつま先より前に出ないよう注意'
      ],
    },
  ];

  const currentExercises = sampleExercises.filter(ex => ex.difficulty === selectedDifficulty);

  const handleStartSession = () => {
    const sessionData = {
      phase: user.currentPhase,
      plannedExercises: currentExercises.map(ex => ex.id),
    };
    
    dispatch(startExerciseSession(sessionData));
    
    Alert.alert(
      'セッション開始',
      'トレーニングセッションを開始しました。頑張ってください！',
      [{ text: 'OK' }]
    );
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      basic: '#4CAF50',
      intermediate: '#FF9800',
      advanced: '#F44336',
    };
    return colors[difficulty] || colors.basic;
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      basic: '基本',
      intermediate: '中級',
      advanced: '上級',
    };
    return labels[difficulty] || labels.basic;
  };

  return (
    <ScrollView style={styles.container}>
      {/* セッション状態 */}
      {currentSession && (
        <Surface style={styles.sessionBanner}>
          <View style={styles.sessionContent}>
            <Text style={styles.sessionText}>トレーニング中</Text>
            <Chip icon="play" mode="flat" style={styles.sessionChip}>
              実施中
            </Chip>
          </View>
        </Surface>
      )}

      {/* レベル選択 */}
      <Card style={styles.levelCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>運動レベル選択</Text>
          <View style={styles.chipContainer}>
            {['basic', 'intermediate', 'advanced'].map((level) => (
              <Chip
                key={level}
                mode={selectedDifficulty === level ? 'flat' : 'outlined'}
                selected={selectedDifficulty === level}
                onPress={() => setSelectedDifficulty(level)}
                style={[
                  styles.levelChip,
                  selectedDifficulty === level && {
                    backgroundColor: getDifficultyColor(level) + '20',
                  },
                ]}
                textStyle={{
                  color: selectedDifficulty === level 
                    ? getDifficultyColor(level) 
                    : '#666',
                }}
              >
                {getDifficultyLabel(level)}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* 運動一覧 */}
      <View style={styles.exercisesList}>
        <Text style={styles.exercisesTitle}>
          今日の運動メニュー ({currentExercises.length}種目)
        </Text>
        
        {currentExercises.map((exercise, index) => (
          <Card key={exercise.id} style={styles.exerciseCard}>
            <Card.Content>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDescription}>
                    {exercise.description}
                  </Text>
                </View>
                <Chip
                  mode="outlined"
                  style={{
                    borderColor: getDifficultyColor(exercise.difficulty),
                  }}
                  textStyle={{
                    color: getDifficultyColor(exercise.difficulty),
                  }}
                >
                  {getDifficultyLabel(exercise.difficulty)}
                </Chip>
              </View>

              <Divider style={styles.exerciseDivider} />

              <View style={styles.exerciseDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>セット数</Text>
                  <Text style={styles.detailValue}>{exercise.sets}セット</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>回数</Text>
                  <Text style={styles.detailValue}>{exercise.reps}回</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>保持時間</Text>
                  <Text style={styles.detailValue}>{exercise.duration}</Text>
                </View>
              </View>

              <Text style={styles.instructionsTitle}>実施方法</Text>
              {exercise.instructions.map((instruction, idx) => (
                <Text key={idx} style={styles.instructionText}>
                  {idx + 1}. {instruction}
                </Text>
              ))}
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* セッション開始ボタン */}
      {!currentSession && (
        <View style={styles.startButtonContainer}>
          <Button
            mode="contained"
            onPress={handleStartSession}
            style={styles.startButton}
            labelStyle={styles.startButtonLabel}
            icon="play"
            disabled={currentExercises.length === 0}
          >
            トレーニング開始
          </Button>
          <Text style={styles.startButtonNote}>
            運動前に必ずウォームアップを行ってください
          </Text>
        </View>
      )}

      {/* 注意事項 */}
      <Card style={styles.cautionCard}>
        <Card.Content>
          <View style={styles.cautionHeader}>
            <IconButton
              icon="alert-circle"
              size={20}
              iconColor="#FF9800"
              style={styles.cautionIcon}
            />
            <Text style={styles.cautionTitle}>注意事項</Text>
          </View>
          <Text style={styles.cautionText}>
            • 痛みが強い場合は運動を中止してください{'\n'}
            • 腫れや熱感がある場合は担当医師に相談してください{'\n'}
            • 無理をせず、自分のペースで行ってください{'\n'}
            • 運動前後のアイシングを忘れずに
          </Text>
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
  sessionBanner: {
    margin: 16,
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    elevation: 1,
  },
  sessionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  sessionChip: {
    backgroundColor: '#4CAF50',
  },
  levelCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  levelChip: {
    borderWidth: 1,
  },
  exercisesList: {
    padding: 16,
    paddingTop: 8,
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  exerciseCard: {
    marginBottom: 12,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 12,
    color: '#666',
  },
  exerciseDivider: {
    marginBottom: 12,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
    color: '#333',
  },
  startButtonContainer: {
    padding: 16,
  },
  startButton: {
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
  },
  startButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButtonNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  cautionCard: {
    margin: 16,
    elevation: 1,
    backgroundColor: '#FFF8E1',
  },
  cautionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cautionIcon: {
    margin: 0,
    marginRight: 4,
  },
  cautionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57C00',
  },
  cautionText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#333',
  },
});

export default ExerciseScreen;