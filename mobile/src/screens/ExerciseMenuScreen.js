import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  List,
  Chip,
  ActivityIndicator,
  Divider,
  Badge,
  IconButton,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchPatientExercisePlan,
  setCurrentPhase,
  startLocalSession,
  clearError,
} from '../store/slices/exerciseSlice';

const { width } = Dimensions.get('window');

const ExerciseMenuScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { 
    patientPlan, 
    isLoading, 
    error, 
    currentPhase,
    currentSession 
  } = useSelector((state) => state.exercise);

  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    // ユーザーの現在のフェーズを設定（デフォルトは術前期）
    const userPhase = user?.currentPhase || 'pre_surgery';
    dispatch(setCurrentPhase(userPhase));
    
    // 常に実際のAPIから運動プランを取得
    if (user && token) {
      // 認証済みユーザーの場合：患者の運動プランを取得
      dispatch(fetchPatientExercisePlan({
        patientId: user.id,
        phase: userPhase,
        token: token
      }));
    } else {
      // ゲストアクセスまたは未認証の場合：公開APIから運動データを取得
      fetchPublicExerciseData(userPhase);
    }
  }, [dispatch, user, token]);

  const [localPatientPlan, setLocalPatientPlan] = useState([]);

  // 公開APIから運動データを取得
  const fetchPublicExerciseData = async (phase) => {
    try {
      // exerciseAPI.getExercisesByPhaseを使用してAPIからデータを取得
      const { exerciseAPI } = await import('../services/api');
      const phaseData = await exerciseAPI.getExercisesByPhase(phase);
      
      console.log('Fetched phase data:', phaseData); // デバッグログ
      
      if (phaseData && phaseData.exercises) {
        // データを適切なフォーマットに変換
        const exerciseList = phaseData.exercises.map(exercise => ({
          id: exercise.id,
          exercise_name: exercise.name,
          description: exercise.description,
          instructions: exercise.instructions,
          category_name: exercise.category || 'その他',
          assigned_sets: exercise.sets,
          assigned_reps: exercise.reps,
          duration: exercise.duration ? `${exercise.duration}分` : '',
          difficulty_level: exercise.difficulty,
          requires_ai_analysis: exercise.requiresAI,
          is_completed: false,
        }));
        console.log('Converted exercise list:', exerciseList); // デバッグログ
        setLocalPatientPlan(exerciseList);
      } else {
        console.log('No exercises in phase data, using dummy data');
        // フォールバックとしてダミーデータを使用
        const dummyPlan = getDummyExercisePlan(phase);
        setLocalPatientPlan(dummyPlan);
      }
    } catch (error) {
      console.error('Error fetching exercise data:', error);
      // エラー時はダミーデータを使用
      const dummyPlan = getDummyExercisePlan(phase);
      setLocalPatientPlan(dummyPlan);
    }
  };

  // ダミーデータ生成関数
  const getDummyExercisePlan = (phase) => {
    const phaseExercises = {
      'pre_surgery': [
        // ROM改善
        {
          id: '1',
          exercise_name: 'ヒールプロップス',
          description: '膝裏に空間を作り、重力で自然に伸びるようにする。最優先事項',
          category_name: 'ROM改善',
          assigned_sets: 1,
          assigned_reps: 1,
          duration: '10-20分',
          frequency: '1日数回',
          difficulty_level: 'beginner',
          requires_ai_analysis: false,
          is_completed: false,
        },
        {
          id: '2',
          exercise_name: 'ヒールスライド',
          description: 'タオルで補助し、痛みのない範囲でゆっくり曲げる',
          category_name: 'ROM改善',
          assigned_sets: 5,
          assigned_reps: 20,
          difficulty_level: 'beginner',
          requires_ai_analysis: false,
          is_completed: false,
        },
        {
          id: '3',
          exercise_name: 'パテラモビライゼーション',
          description: '膝のお皿を上下左右に優しく動かす',
          category_name: 'ROM改善',
          assigned_sets: 1,
          assigned_reps: 1,
          duration: '5分程度',
          frequency: '1日数回',
          difficulty_level: 'beginner',
          requires_ai_analysis: false,
          is_completed: false,
        },
        
        // 筋力（患側）
        {
          id: '4',
          exercise_name: 'クワッドセッティング',
          description: '膝裏のタオルを押しつぶす意識。ハムストリングスも同時に収縮させる（同時収縮）',
          category_name: '筋力（患側）',
          assigned_sets: 3,
          assigned_reps: 12,
          hold_time: '5秒保持',
          difficulty_level: 'beginner',
          requires_ai_analysis: false,
          is_completed: false,
        },
        {
          id: '5',
          exercise_name: 'SLR（ストレートレッグレイズ）',
          description: '膝が曲がり落ちないように（ラグ無し）。股関節ではなく大腿四頭筋で上げる意識',
          category_name: '筋力（患側）',
          assigned_sets: 3,
          assigned_reps: 12,
          difficulty_level: 'beginner',
          requires_ai_analysis: true,
          is_completed: false,
        },
        {
          id: '6',
          exercise_name: 'グルートブリッジ',
          description: '股関節をしっかり伸展させる。お尻の筋肉を意識する',
          category_name: '筋力（患側）',
          assigned_sets: 3,
          assigned_reps: 15,
          difficulty_level: 'beginner',
          requires_ai_analysis: false,
          is_completed: false,
        },
        
        // 筋力（患部外）
        {
          id: '7',
          exercise_name: '健側の片脚トレーニング',
          description: '片脚スクワット、片脚カーフレイズ、片脚RDLなど。クロス・エデュケーション効果を狙う',
          category_name: '筋力（患部外）',
          assigned_sets: 3,
          assigned_reps: 15,
          difficulty_level: 'intermediate',
          requires_ai_analysis: true,
          is_completed: false,
        },
        {
          id: '8',
          exercise_name: '体幹トレーニング',
          description: 'プランク、サイドプランク。体幹の安定は全ての動作の基礎',
          category_name: '筋力（患部外）',
          assigned_sets: 3,
          assigned_reps: 1,
          duration: '30-60秒',
          difficulty_level: 'intermediate',
          requires_ai_analysis: false,
          is_completed: false,
        },
        {
          id: '9',
          exercise_name: '上半身トレーニング',
          description: 'プレス系、プル系など、膝に負担のかからない種目をバランス良く行う',
          category_name: '筋力（患部外）',
          assigned_sets: 3,
          assigned_reps: 12,
          difficulty_level: 'intermediate',
          requires_ai_analysis: false,
          is_completed: false,
        },
        
        // 有酸素運動
        {
          id: '10',
          exercise_name: 'エアロバイク',
          description: 'サドルの高さを調整し、伸展・屈曲両方の可動域改善にも活用する',
          category_name: '有酸素運動',
          assigned_sets: 1,
          assigned_reps: 1,
          duration: '20-30分',
          difficulty_level: 'beginner',
          requires_ai_analysis: false,
          is_completed: false,
        },
      ],
      'post_surgery_early': [
        // アイシング・挙上
        {
          id: '101',
          exercise_name: 'アイシング・挙上',
          description: '痛みと腫れの管理が最優先。挙上時は膝裏に枕を入れない',
          category_name: 'アイシング・挙上',
          assigned_sets: 1,
          assigned_reps: 1,
          duration: '20分',
          frequency: '頻回',
          difficulty_level: 'beginner',
          requires_ai_analysis: false,
          is_completed: false,
        },
        
        // ROM
        {
          id: '102',
          exercise_name: 'ヒールプロップス',
          description: '完全伸展（0°）の達成と維持が最重要目標',
          category_name: 'ROM',
          assigned_sets: 1,
          assigned_reps: 1,
          duration: '20-30分',
          frequency: '1日数回',
          difficulty_level: 'beginner',
          requires_ai_analysis: false,
          is_completed: false,
        },
        {
          id: '103',
          exercise_name: 'ヒールスライド',
          description: '痛みのない範囲で優しく行う。目標は90°屈曲',
          category_name: 'ROM',
          assigned_sets: 3,
          assigned_reps: 15,
          note: '10-20回の範囲で調整',
          difficulty_level: 'beginner',
          requires_ai_analysis: false,
          is_completed: false,
        },
        {
          id: '104',
          exercise_name: 'アンクルポンプ',
          description: 'DVT予防のために積極的に行う',
          category_name: 'ROM',
          assigned_sets: 1,
          assigned_reps: 15,
          frequency: '毎時',
          difficulty_level: 'beginner',
          requires_ai_analysis: false,
          is_completed: false,
        },
        
        // 筋力（患側）
        {
          id: '105',
          exercise_name: 'クワッドセッティング',
          description: '強い収縮を意識する。NMESが有効な場合もある',
          category_name: '筋力（患側）',
          assigned_sets: 3,
          assigned_reps: 12,
          hold_time: '5秒保持',
          difficulty_level: 'beginner',
          requires_ai_analysis: false,
          is_completed: false,
        },
        {
          id: '106',
          exercise_name: 'SLR（伸展ラグ無し）',
          description: '膝が完全に伸びたまま上げられる場合のみ実施',
          category_name: '筋力（患側）',
          assigned_sets: 3,
          assigned_reps: 10,
          difficulty_level: 'beginner',
          requires_ai_analysis: true,
          is_completed: false,
        },
        
        // 筋力（健側）
        {
          id: '107',
          exercise_name: '片脚ブリッジ',
          description: '健側のお尻とハムストリングスを強化',
          category_name: '筋力（健側）',
          assigned_sets: 3,
          assigned_reps: 12,
          note: '10-15回の範囲で調整',
          difficulty_level: 'beginner',
          requires_ai_analysis: false,
          is_completed: false,
        },
        {
          id: '108',
          exercise_name: '片脚カーフレイズ',
          description: '健側のふくらはぎを強化',
          category_name: '筋力（健側）',
          assigned_sets: 3,
          assigned_reps: 17,
          note: '15-20回の範囲で調整',
          difficulty_level: 'beginner',
          requires_ai_analysis: false,
          is_completed: false,
        },
      ],
      'post_surgery_1_4weeks': [
        // ROM
        {
          id: '201',
          exercise_name: 'エアロバイク',
          description: '最初は揺らす動きから。完全な回転ができるようになったら徐々に時間を延ばす',
          category_name: 'ROM',
          assigned_sets: 1,
          assigned_reps: 1,
          duration: '10-20分',
          difficulty_level: 'beginner',
          requires_ai_analysis: false,
          is_completed: false,
        },
        
        // 歩行
        {
          id: '202',
          exercise_name: '歩行訓練',
          description: '鏡を見ながら、左右対称で滑らかな歩行を意識する。質を重視',
          category_name: '歩行',
          assigned_sets: 1,
          assigned_reps: 1,
          note: '質を重視',
          difficulty_level: 'beginner',
          requires_ai_analysis: true,
          is_completed: false,
        },
        
        // 筋力（患側）
        {
          id: '203',
          exercise_name: '両脚ミニスクワット',
          description: '膝屈曲45°まで。膝がつま先より前に出過ぎないように注意',
          category_name: '筋力（患側）',
          assigned_sets: 3,
          assigned_reps: 17,
          note: '15-20回の範囲で調整',
          difficulty_level: 'intermediate',
          requires_ai_analysis: true,
          is_completed: false,
        },
        {
          id: '204',
          exercise_name: 'レッグプレス（両脚）',
          description: '軽い負荷から開始し、左右均等に力を入れる',
          category_name: '筋力（患側）',
          assigned_sets: 3,
          assigned_reps: 17,
          note: '15-20回の範囲で調整',
          difficulty_level: 'intermediate',
          requires_ai_analysis: false,
          is_completed: false,
        },
        {
          id: '205',
          exercise_name: 'OKC膝伸展（4週目以降）',
          description: '抵抗なしで、90°から45°の範囲のみ。痛みに注意',
          category_name: '筋力（患側）',
          assigned_sets: 2,
          assigned_reps: 12,
          note: '10-15回×2-3セット',
          difficulty_level: 'intermediate',
          requires_ai_analysis: true,
          is_completed: false,
        },
        
        // 筋力（健側）
        {
          id: '206',
          exercise_name: '片脚レッグプレス',
          description: '健側の筋力を積極的に向上させる',
          category_name: '筋力（健側）',
          assigned_sets: 3,
          assigned_reps: 11,
          note: '10-12回の範囲で調整',
          difficulty_level: 'intermediate',
          requires_ai_analysis: false,
          is_completed: false,
        },
        {
          id: '207',
          exercise_name: '片脚RDL',
          description: 'フォームを重視し、ハムストリングスと殿筋を鍛える',
          category_name: '筋力（健側）',
          assigned_sets: 3,
          assigned_reps: 11,
          note: '10-12回の範囲で調整',
          difficulty_level: 'intermediate',
          requires_ai_analysis: true,
          is_completed: false,
        },
        
        // 体幹
        {
          id: '208',
          exercise_name: 'プランク（動的バリエーション）',
          description: '腕や脚を交互に上げるなど、安定性を保ちながら動きを加える',
          category_name: '体幹',
          assigned_sets: 3,
          assigned_reps: 1,
          duration: '30-60秒',
          difficulty_level: 'intermediate',
          requires_ai_analysis: false,
          is_completed: false,
        },
      ],
      'post_surgery_1_2months': [
        // 筋力（CKC）
        {
          id: '301',
          exercise_name: 'スクワット',
          description: '屈曲角度を90°に近づける。フォームを最優先',
          category_name: '筋力（CKC）',
          assigned_sets: 3,
          assigned_reps: 13,
          note: '12-15回の範囲で調整',
          difficulty_level: 'intermediate',
          requires_ai_analysis: true,
          is_completed: false,
        },
        {
          id: '302',
          exercise_name: 'ステップアップ（前方・側方）',
          description: '低い台から始める。体幹がぶれないように',
          category_name: '筋力（CKC）',
          assigned_sets: 3,
          assigned_reps: 12,
          note: '10-15回の範囲で調整',
          difficulty_level: 'intermediate',
          requires_ai_analysis: true,
          is_completed: false,
        },
        {
          id: '303',
          exercise_name: '片脚レッグプレス',
          description: '患側の脚でコントロールしながら押す',
          category_name: '筋力（CKC）',
          assigned_sets: 3,
          assigned_reps: 12,
          note: '10-15回の範囲で調整',
          difficulty_level: 'intermediate',
          requires_ai_analysis: false,
          is_completed: false,
        },
        
        // バランス
        {
          id: '304',
          exercise_name: '片脚立ち（不安定面上）',
          description: 'BOSUやフォームパッド上で。視線を動かしたり、ボールを扱ったりして難易度を上げる',
          category_name: 'バランス',
          assigned_sets: 3,
          assigned_reps: 1,
          duration: '30-60秒保持',
          difficulty_level: 'intermediate',
          requires_ai_analysis: true,
          is_completed: false,
        },
        
        // 体幹
        {
          id: '305',
          exercise_name: 'バードドッグ',
          description: '体幹を一直線に保ち、ゆっくりと手足を伸ばす',
          category_name: '体幹',
          assigned_sets: 3,
          assigned_reps: 10,
          difficulty_level: 'intermediate',
          requires_ai_analysis: false,
          is_completed: false,
        },
      ],
      'post_surgery_2_3months': [
        // 筋力
        {
          id: '401',
          exercise_name: 'ランジ（前方・側方）',
          description: '踏み出した膝が内側に入らないように。体幹は直立を保つ',
          category_name: '筋力',
          assigned_sets: 3,
          assigned_reps: 11,
          note: '10-12回の範囲で調整',
          difficulty_level: 'intermediate',
          requires_ai_analysis: true,
          is_completed: false,
        },
        {
          id: '402',
          exercise_name: '片脚スクワット（支持あり）',
          description: '鏡でフォームを確認しながら、徐々に深く。膝とつま先の向きを揃える',
          category_name: '筋力',
          assigned_sets: 3,
          assigned_reps: 10,
          note: '8-12回の範囲で調整',
          difficulty_level: 'intermediate',
          requires_ai_analysis: true,
          is_completed: false,
        },
        {
          id: '403',
          exercise_name: 'フィジオボール・ハムストリングカール',
          description: 'お尻を高く保ち、ハムストリングスでボールを引き寄せる',
          category_name: '筋力',
          assigned_sets: 3,
          assigned_reps: 12,
          note: '10-15回の範囲で調整',
          difficulty_level: 'intermediate',
          requires_ai_analysis: false,
          is_completed: false,
        },
        
        // 有酸素運動
        {
          id: '404',
          exercise_name: 'バイク/エリプティカル',
          description: '強度を上げて心拍数を高める。ランニングへの準備',
          category_name: '有酸素運動',
          assigned_sets: 1,
          assigned_reps: 1,
          duration: '20-30分',
          difficulty_level: 'intermediate',
          requires_ai_analysis: false,
          is_completed: false,
        },
        
        // 体幹
        {
          id: '405',
          exercise_name: 'フィジオボール・プランク',
          description: '不安定なボールの上で体幹を固める',
          category_name: '体幹',
          assigned_sets: 3,
          assigned_reps: 1,
          duration: '30-60秒',
          difficulty_level: 'intermediate',
          requires_ai_analysis: false,
          is_completed: false,
        },
      ],
      'post_surgery_3_4months': [
        // 有酸素
        {
          id: '501',
          exercise_name: 'ジョグ/ウォークプログラム',
          description: '基準を満たした場合のみ開始。痛みや腫れが出たら中止',
          category_name: '有酸素',
          assigned_sets: 1,
          assigned_reps: 1,
          duration: '20分から開始',
          difficulty_level: 'intermediate',
          requires_ai_analysis: false,
          is_completed: false,
          note: 'ランニング開始基準をクリアしてから実施',
        },
        
        // プライオメトリクス
        {
          id: '502',
          exercise_name: '両脚ラインホップ',
          description: '軽く、静かに着地する。膝のアライメントに集中',
          category_name: 'プライオメトリクス',
          assigned_sets: 3,
          assigned_reps: 1,
          duration: '30秒',
          difficulty_level: 'advanced',
          requires_ai_analysis: true,
          is_completed: false,
        },
        {
          id: '503',
          exercise_name: '両脚ボックスジャンプ（低）',
          description: '低い台（15-30cm）へ跳び乗り、静かに降りる。着地をコントロール',
          category_name: 'プライオメトリクス',
          assigned_sets: 3,
          assigned_reps: 9,
          note: '8-10回の範囲で調整',
          difficulty_level: 'advanced',
          requires_ai_analysis: true,
          is_completed: false,
        },
        
        // 筋力
        {
          id: '504',
          exercise_name: 'ゴブレットスクワット',
          description: '重量を増やし、パワー（挙上速度）を意識する',
          category_name: '筋力',
          assigned_sets: 3,
          assigned_reps: 10,
          note: '8-12回の範囲で調整',
          difficulty_level: 'intermediate',
          requires_ai_analysis: true,
          is_completed: false,
        },
        {
          id: '505',
          exercise_name: 'ウォーキングランジ',
          description: '安定したフォームで一歩ずつ進む',
          category_name: '筋力',
          assigned_sets: 3,
          assigned_reps: 10,
          note: '10歩',
          difficulty_level: 'intermediate',
          requires_ai_analysis: true,
          is_completed: false,
        },
        
        // 体幹
        {
          id: '506',
          exercise_name: 'メディシンボールツイスト',
          description: '座位で体幹を回旋させる。スポーツ動作への準備',
          category_name: '体幹',
          assigned_sets: 3,
          assigned_reps: 15,
          difficulty_level: 'intermediate',
          requires_ai_analysis: false,
          is_completed: false,
        },
      ],
      'post_surgery_4_6months': [
        // プライオメトリクス
        {
          id: '601',
          exercise_name: '片脚着地ドリル',
          description: '低い台から片脚で着地し、3秒静止。膝と股関節で衝撃を吸収',
          category_name: 'プライオメトリクス',
          assigned_sets: 3,
          assigned_reps: 9,
          note: '8-10回の範囲で調整',
          difficulty_level: 'advanced',
          requires_ai_analysis: true,
          is_completed: false,
        },
        {
          id: '602',
          exercise_name: 'スケーターホップ',
          description: '左右に跳び、片脚でバランスを保つ。着地の安定性を重視',
          category_name: 'プライオメトリクス',
          assigned_sets: 3,
          assigned_reps: 11,
          note: '10-12回の範囲で調整',
          difficulty_level: 'advanced',
          requires_ai_analysis: true,
          is_completed: false,
        },
        {
          id: '603',
          exercise_name: '片脚ホップ（距離）',
          description: '距離よりもフォームと着地の質を優先する',
          category_name: 'プライオメトリクス',
          assigned_sets: 3,
          assigned_reps: 6,
          note: '5-8回の範囲で調整',
          difficulty_level: 'advanced',
          requires_ai_analysis: true,
          is_completed: false,
        },
        
        // アジリティ
        {
          id: '604',
          exercise_name: 'ラダードリル',
          description: '素早い足の動きを練習。最初はゆっくり正確に',
          category_name: 'アジリティ',
          assigned_sets: 2,
          assigned_reps: 1,
          note: '各ドリル × 2-3セット',
          difficulty_level: 'advanced',
          requires_ai_analysis: true,
          is_completed: false,
        },
        {
          id: '605',
          exercise_name: 'Tドリル／ボックスドリル',
          description: '計画された前後左右への移動。減速と加速のコントロール',
          category_name: 'アジリティ',
          assigned_sets: 3,
          assigned_reps: 4,
          note: '3-5往復',
          difficulty_level: 'advanced',
          requires_ai_analysis: true,
          is_completed: false,
        },
        
        // 筋力
        {
          id: '606',
          exercise_name: 'バーベルスクワット／デッドリフト',
          description: '最大筋力向上のため高重量・低回数で。フォームは絶対に崩さない',
          category_name: '筋力',
          assigned_sets: 3,
          assigned_reps: 5,
          note: '3-8回 × 3-4セット',
          difficulty_level: 'advanced',
          requires_ai_analysis: true,
          is_completed: false,
        },
      ],
      'phase_3_1': [
        {
          id: '4',
          exercise_name: '片脚立位',
          description: '患側での片脚立位練習',
          category_name: '歩行訓練',
          assigned_sets: 3,
          assigned_reps: 5,
          difficulty_level: 'intermediate',
          requires_ai_analysis: true,
          is_completed: false,
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
          is_completed: false,
        },
        {
          id: '6',
          exercise_name: 'バランスボード',
          description: 'バランスボードを使った安定性訓練',
          category_name: 'バランス訓練',
          assigned_sets: 3,
          assigned_reps: 1,
          difficulty_level: 'intermediate',
          requires_ai_analysis: true,
          is_completed: false,
        },
      ],
      'phase_3_3': [
        {
          id: '7',
          exercise_name: 'ジャンプ着地',
          description: '両足でのジャンプ着地練習',
          category_name: 'スポーツ動作訓練',
          assigned_sets: 3,
          assigned_reps: 10,
          difficulty_level: 'advanced',
          requires_ai_analysis: true,
          is_completed: false,
        },
      ],
      'phase_3_4': [
        {
          id: '8',
          exercise_name: 'カッティング動作',
          description: '方向転換動作の練習',
          category_name: '競技特異的訓練',
          assigned_sets: 3,
          assigned_reps: 5,
          difficulty_level: 'advanced',
          requires_ai_analysis: true,
          is_completed: false,
        },
      ],
    };
    
    return phaseExercises[phase] || [];
  };

  const getPhaseInfo = (phase) => {
    const phaseMap = {
      'pre_surgery': {
        title: '術前期',
        description: '手術前の準備期間',
        color: '#FF9800',
      },
      'post_surgery_early': {
        title: '術直後期',
        description: '手術直後〜1週間',
        color: '#F44336',
      },
      'post_surgery_1_4weeks': {
        title: '術後1-4週間',
        description: '術後1〜4週間',
        color: '#E91E63',
      },
      'post_surgery_1_2months': {
        title: '術後1-2ヶ月',
        description: '術後1〜2ヶ月',
        color: '#9C27B0',
      },
      'post_surgery_2_3months': {
        title: '術後2-3ヶ月',
        description: '術後2〜3ヶ月',
        color: '#673AB7',
      },
      'post_surgery_3_4months': {
        title: '術後3-4ヶ月',
        description: '術後3〜4ヶ月',
        color: '#3F51B5',
      },
      'post_surgery_4_6months': {
        title: '術後4-6ヶ月',
        description: '術後4〜6ヶ月',
        color: '#2196F3',
      },
      'phase_3_1': {
        title: '基礎回復期',
        description: '2〜6週間',
        color: '#2196F3',
      },
      'phase_3_2': {
        title: '筋力強化期',
        description: '6〜12週間',
        color: '#4CAF50',
      },
      'phase_3_3': {
        title: '機能訓練期',
        description: '3〜6ヶ月',
        color: '#9C27B0',
      },
      'phase_3_4': {
        title: '競技復帰期',
        description: '6〜12ヶ月',
        color: '#E91E63',
      },
    };
    return phaseMap[phase] || phaseMap['pre_surgery'];
  };

  const groupExercisesByCategory = (exercises) => {
    const grouped = {};
    exercises.forEach(exercise => {
      const categoryName = exercise.category_name || 'その他';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(exercise);
    });
    return grouped;
  };

  const handleStartSession = () => {
    const planToUse = token ? patientPlan : localPatientPlan;
    
    if (currentSession) {
      Alert.alert(
        '進行中のセッション',
        'すでに進行中のセッションがあります。継続しますか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: '継続', onPress: () => navigation.navigate('ExerciseSession') },
        ]
      );
      return;
    }

    if (planToUse.length === 0) {
      Alert.alert('お知らせ', '現在利用可能な運動メニューがありません。');
      return;
    }

    // セッション開始
    dispatch(startLocalSession({
      patientId: user?.id || 'guest',
      phase: currentPhase,
    }));

    Alert.alert(
      'セッション開始',
      `${planToUse.length}個の運動メニューでトレーニングを開始します。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '開始', onPress: () => navigation.navigate('ExerciseSession') }
      ]
    );
  };

  const handleExercisePress = async (exercise) => {
    try {
      // 詳細な運動情報をAPIから取得
      const { exerciseAPI } = await import('../services/api');
      const detailedExercise = await exerciseAPI.getExerciseDetails(exercise.id);
      
      const instructions = detailedExercise.instructions;
      const instructionText = instructions ? [
        `【準備】${instructions.preparation || ''}`,
        `【実施方法】${instructions.execution || ''}`,
        `【コツ】${instructions.tips || ''}`,
        `【注意点】${instructions.cautions || ''}`,
        `【進行方法】${instructions.progression || ''}`,
        `【効果】${instructions.effects || ''}`,
      ].filter(text => text.length > 4).join('\n\n') : '';

      Alert.alert(
        exercise.exercise_name,
        `${detailedExercise.description}\n\n${instructionText}\n\n【トレーニング設定】\nセット数: ${exercise.assigned_sets}\n回数: ${exercise.assigned_reps}\n難易度: ${getDifficultyLabel(exercise.difficulty_level)}\n${detailedExercise.equipment ? `器具: ${detailedExercise.equipment}` : ''}`,
        [
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Error fetching exercise details:', error);
      // フォールバック：基本情報のみ表示
      Alert.alert(
        exercise.exercise_name,
        `詳細: ${exercise.description}\n\nセット数: ${exercise.assigned_sets}\n回数: ${exercise.assigned_reps}\n難易度: ${getDifficultyLabel(exercise.difficulty_level)}`,
        [
          { text: 'OK' }
        ]
      );
    }
  };

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const getDifficultyColor = (level) => {
    const colorMap = {
      'beginner': '#4CAF50',
      'intermediate': '#FF9800',
      'advanced': '#F44336',
    };
    return colorMap[level] || '#757575';
  };

  const getDifficultyLabel = (level) => {
    const labelMap = {
      'beginner': '初級',
      'intermediate': '中級',
      'advanced': '上級',
    };
    return labelMap[level] || level;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>運動メニューを読み込み中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>エラーが発生しました</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Button mode="contained" onPress={() => dispatch(clearError())}>
          再試行
        </Button>
      </View>
    );
  }

  const phaseInfo = getPhaseInfo(currentPhase);
  // APIからのデータまたはダミーデータを使用
  const currentPlan = token ? patientPlan : localPatientPlan;
  const groupedExercises = groupExercisesByCategory(currentPlan);

  return (
    <ScrollView style={styles.container}>
      {/* フェーズ情報 */}
      <Card style={styles.phaseCard}>
        <Card.Content>
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseTitle}>現在のリハビリ段階</Text>
            <Chip
              mode="outlined"
              style={[styles.phaseChip, { borderColor: phaseInfo.color }]}
              textStyle={{ color: phaseInfo.color }}
            >
              {phaseInfo.title}
            </Chip>
          </View>
          <Text style={styles.phaseDescription}>{phaseInfo.description}</Text>
        </Card.Content>
      </Card>

      {/* セッション開始ボタン */}
      <Card style={styles.sessionCard}>
        <Card.Content>
          <Text style={styles.sessionTitle}>今日のトレーニング</Text>
          <Text style={styles.sessionDescription}>
            {currentPlan.length}個の運動メニューが利用可能です
          </Text>
          <Button
            mode="contained"
            onPress={handleStartSession}
            style={styles.startButton}
            disabled={currentPlan.length === 0}
          >
            {currentSession ? 'セッションを継続' : 'セッションを開始'}
          </Button>
        </Card.Content>
      </Card>

      {/* 運動メニュー一覧 */}
      {Object.keys(groupedExercises).length > 0 ? (
        Object.entries(groupedExercises).map(([categoryName, exercises]) => (
          <Card key={categoryName} style={styles.categoryCard}>
            <List.Section>
              <List.Subheader style={styles.categoryHeader}>
                <View style={styles.categoryHeaderContent}>
                  <Text style={styles.categoryTitle}>{categoryName}</Text>
                  <Badge size={24}>{exercises.length}</Badge>
                </View>
              </List.Subheader>
              <Divider />
              {exercises.map((exercise, index) => (
                <List.Item
                  key={exercise.id}
                  title={exercise.exercise_name}
                  description={`${exercise.assigned_sets}セット × ${exercise.assigned_reps}回`}
                  left={() => (
                    <View style={styles.exerciseIcon}>
                      <IconButton
                        icon={exercise.requires_ai_analysis ? "camera" : "dumbbell"}
                        size={24}
                        iconColor={phaseInfo.color}
                      />
                    </View>
                  )}
                  right={() => (
                    <View style={styles.exerciseInfo}>
                      <Chip
                        mode="outlined"
                        compact
                        style={[
                          styles.difficultyChip,
                          { borderColor: getDifficultyColor(exercise.difficulty_level) }
                        ]}
                        textStyle={{ 
                          color: getDifficultyColor(exercise.difficulty_level),
                          fontSize: 10
                        }}
                      >
                        {getDifficultyLabel(exercise.difficulty_level)}
                      </Chip>
                      {exercise.is_completed && (
                        <IconButton
                          icon="check-circle"
                          size={20}
                          iconColor="#4CAF50"
                          style={styles.completedIcon}
                        />
                      )}
                    </View>
                  )}
                  onPress={() => handleExercisePress(exercise)}
                  style={styles.exerciseItem}
                />
              ))}
            </List.Section>
          </Card>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyTitle}>運動メニューがありません</Text>
            <Text style={styles.emptyDescription}>
              現在利用可能な運動メニューがありません。
              医療従事者にご相談ください。
            </Text>
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
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  phaseCard: {
    margin: 16,
    elevation: 2,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  phaseChip: {
    borderWidth: 1,
  },
  phaseDescription: {
    fontSize: 14,
    color: '#666',
  },
  sessionCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sessionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  startButton: {
    borderRadius: 8,
  },
  categoryCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  categoryHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  exerciseItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  exerciseIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyChip: {
    borderWidth: 1,
    marginRight: 4,
  },
  completedIcon: {
    margin: 0,
  },
  emptyCard: {
    margin: 16,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ExerciseMenuScreen;