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
  IconButton,
  ProgressBar,
  Chip,
  Divider,
  Surface,
  Portal,
  Modal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import {
  endLocalSession,
  completeExercise,
  updateSessionInfo,
  pauseSession,
  resumeSession,
  setCurrentExercise,
} from '../store/slices/exerciseSlice';

const { width } = Dimensions.get('window');

const ExerciseSessionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { 
    currentSession, 
    patientPlan, 
    currentPhase,
    exerciseProgress 
  } = useSelector((state) => state.exercise);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [exerciseTimeElapsed, setExerciseTimeElapsed] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [painLevel, setPainLevel] = useState(0);
  const [borgScale, setBorgScale] = useState(6);

  const intervalRef = useRef(null);
  const restIntervalRef = useRef(null);

  // 使用するプランを取得（APIまたはダミーデータ）
  const exercises = token ? patientPlan : getDummyExercisePlan(currentPhase);
  const currentExercise = exercises[currentExerciseIndex];

  // ダミーデータ（ExerciseMenuScreenと同じ）
  const getDummyExercisePlan = (phase) => {
    const phaseExercises = {
      'pre_surgery': [
        {
          id: '1',
          exercise_name: '大腿四頭筋セッティング',
          description: '膝を伸ばした状態で太ももの前の筋肉を収縮',
          category_name: '筋力維持',
          assigned_sets: 3,
          assigned_reps: 15,
          difficulty_level: 'beginner',
          requires_ai_analysis: false,
          rest_time_seconds: 30,
          assigned_duration_seconds: 5,
        },
        {
          id: '2',
          exercise_name: '立ち上がり練習',
          description: '椅子からの立ち上がり動作の練習',
          category_name: '基本動作訓練',
          assigned_sets: 3,
          assigned_reps: 10,
          difficulty_level: 'beginner',
          requires_ai_analysis: false,
          rest_time_seconds: 60,
          assigned_duration_seconds: 0,
        },
      ],
      'phase_3_2': [
        {
          id: '5',
          exercise_name: 'ミニスクワット',
          description: '膝屈曲30度までの浅いスクワット',
          category_name: '筋力強化',
          assigned_sets: 3,
          assigned_reps: 10,
          difficulty_level: 'intermediate',
          requires_ai_analysis: true,
          rest_time_seconds: 60,
          assigned_duration_seconds: 3,
        },
      ],
    };
    
    return phaseExercises[phase] || phaseExercises['pre_surgery'];
  };

  useEffect(() => {
    if (currentExercise) {
      dispatch(setCurrentExercise(currentExercise));
    }
  }, [currentExercise, dispatch]);

  useEffect(() => {
    // 運動時間カウンター
    if (!isResting && !currentSession?.isPaused) {
      intervalRef.current = setInterval(() => {
        setExerciseTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isResting, currentSession?.isPaused]);

  useEffect(() => {
    // 休憩時間カウンター
    if (isResting && restTimeLeft > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(restIntervalRef.current);
    }

    return () => clearInterval(restIntervalRef.current);
  }, [isResting, restTimeLeft]);

  const handleNextRep = () => {
    if (currentRep < currentExercise.assigned_reps) {
      setCurrentRep(prev => prev + 1);
    } else {
      // セット完了
      handleSetComplete();
    }
  };

  const handleSetComplete = () => {
    if (currentSet < currentExercise.assigned_sets) {
      // 次のセットへ
      setCurrentSet(prev => prev + 1);
      setCurrentRep(0);
      
      // 休憩開始
      const restTime = currentExercise.rest_time_seconds || 30;
      setRestTimeLeft(restTime);
      setIsResting(true);
    } else {
      // 運動完了
      handleExerciseComplete();
    }
  };

  const handleExerciseComplete = () => {
    const exerciseData = {
      exerciseId: currentExercise.id,
      sets_completed: currentExercise.assigned_sets,
      reps_completed: currentExercise.assigned_reps * currentExercise.assigned_sets,
      duration_seconds: exerciseTimeElapsed,
      pain_level: painLevel,
      borg_scale: borgScale,
      notes: sessionNotes,
    };

    dispatch(completeExercise({
      exerciseId: currentExercise.id,
      sessionData: exerciseData,
    }));

    // 次の運動へ
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setCurrentRep(0);
      setExerciseTimeElapsed(0);
      setPainLevel(0);
      setBorgScale(6);
    } else {
      // 全運動完了
      setShowCompletionModal(true);
    }
  };

  const handleSessionComplete = () => {
    dispatch(updateSessionInfo({
      painLevel,
      borgScale,
      notes: sessionNotes,
    }));
    dispatch(endLocalSession());
    
    Alert.alert(
      'セッション完了',
      'お疲れ様でした！トレーニングが完了しました。',
      [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]
    );
  };

  const handlePauseResume = () => {
    if (currentSession?.isPaused) {
      dispatch(resumeSession());
    } else {
      dispatch(pauseSession());
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalExercises = exercises.length;
    const completedExercises = currentExerciseIndex;
    const currentExerciseProgress = currentSet / currentExercise?.assigned_sets || 0;
    return ((completedExercises + currentExerciseProgress) / totalExercises) * 100;
  };

  if (!currentSession || !currentExercise) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>セッションが見つかりません</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          戻る
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* セッション進捗 */}
      <Card style={styles.progressCard}>
        <Card.Content>
          <Text style={styles.progressTitle}>セッション進捗</Text>
          <ProgressBar 
            progress={getProgressPercentage() / 100} 
            color="#4CAF50"
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            {currentExerciseIndex + 1} / {exercises.length} 運動完了
          </Text>
        </Card.Content>
      </Card>

      {/* 現在の運動情報 */}
      <Card style={styles.exerciseCard}>
        <Card.Content>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseName}>{currentExercise.exercise_name}</Text>
            {currentExercise.requires_ai_analysis && (
              <Chip 
                icon="camera" 
                mode="outlined" 
                compact
                onPress={() => navigation.navigate('AIAnalysis', {
                  exerciseType: currentExercise.exercise_name.includes('スクワット') ? 'squat' : 'general',
                  exerciseName: currentExercise.exercise_name
                })}
              >
                AI分析
              </Chip>
            )}
          </View>
          <Text style={styles.exerciseDescription}>
            {currentExercise.description}
          </Text>
          <Text style={styles.exerciseCategory}>
            カテゴリー: {currentExercise.category_name}
          </Text>
        </Card.Content>
      </Card>

      {/* 休憩中の表示 */}
      {isResting && (
        <Surface style={styles.restSurface}>
          <Text style={styles.restTitle}>休憩中</Text>
          <Text style={styles.restTime}>{formatTime(restTimeLeft)}</Text>
          <Button mode="outlined" onPress={handleSkipRest}>
            休憩をスキップ
          </Button>
        </Surface>
      )}

      {/* セット・レップ情報 */}
      {!isResting && (
        <Card style={styles.setCard}>
          <Card.Content>
            <View style={styles.setHeader}>
              <Text style={styles.setTitle}>
                セット {currentSet} / {currentExercise.assigned_sets}
              </Text>
              <Text style={styles.repTitle}>
                {currentRep} / {currentExercise.assigned_reps} 回
              </Text>
            </View>
            
            <View style={styles.setProgress}>
              <ProgressBar 
                progress={currentRep / currentExercise.assigned_reps} 
                color="#2196F3"
                style={styles.setProgressBar}
              />
            </View>

            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>運動時間</Text>
              <Text style={styles.timerValue}>{formatTime(exerciseTimeElapsed)}</Text>
            </View>

            <View style={styles.controlButtons}>
              <Button
                mode="contained"
                onPress={handleNextRep}
                style={styles.nextButton}
                disabled={currentSession?.isPaused}
              >
                {currentRep < currentExercise.assigned_reps ? '次の回数' : 'セット完了'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* コントロールボタン */}
      <Card style={styles.controlCard}>
        <Card.Content>
          <View style={styles.controlRow}>
            <Button
              mode={currentSession?.isPaused ? "contained" : "outlined"}
              onPress={handlePauseResume}
              style={styles.controlButton}
            >
              {currentSession?.isPaused ? '再開' : '一時停止'}
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => setShowCompletionModal(true)}
              style={styles.controlButton}
            >
              セッション終了
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* 完了モーダル */}
      <Portal>
        <Modal 
          visible={showCompletionModal} 
          onDismiss={() => setShowCompletionModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>セッション完了</Text>
          <Text style={styles.modalText}>
            お疲れ様でした！今日のトレーニングはどうでしたか？
          </Text>
          
          <Divider style={styles.modalDivider} />
          
          <Text style={styles.ratingLabel}>痛みレベル (0-10)</Text>
          <View style={styles.ratingButtons}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
              <Button
                key={level}
                mode={painLevel === level ? "contained" : "outlined"}
                onPress={() => setPainLevel(level)}
                style={styles.ratingButton}
                compact
              >
                {level}
              </Button>
            ))}
          </View>

          <Text style={styles.ratingLabel}>疲労度 (6-20)</Text>
          <View style={styles.ratingButtons}>
            {[6, 8, 10, 12, 14, 16, 18, 20].map(scale => (
              <Button
                key={scale}
                mode={borgScale === scale ? "contained" : "outlined"}
                onPress={() => setBorgScale(scale)}
                style={styles.ratingButton}
                compact
              >
                {scale}
              </Button>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowCompletionModal(false)}
              style={styles.modalButton}
            >
              キャンセル
            </Button>
            <Button
              mode="contained"
              onPress={handleSessionComplete}
              style={styles.modalButton}
            >
              完了
            </Button>
          </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  progressCard: {
    margin: 16,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  exerciseCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 12,
    color: '#888',
  },
  restSurface: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    elevation: 1,
  },
  restTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  restTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 16,
  },
  setCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  setTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  repTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  setProgress: {
    marginBottom: 16,
  },
  setProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerLabel: {
    fontSize: 14,
    color: '#666',
  },
  timerValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  controlButtons: {
    alignItems: 'center',
  },
  nextButton: {
    width: '100%',
    paddingVertical: 8,
  },
  controlCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  modalDivider: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  ratingButton: {
    marginRight: 4,
    marginBottom: 4,
    minWidth: 40,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default ExerciseSessionScreen;