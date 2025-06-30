// ACL リハビリエクササイズデータ（ローカル版）
const exercises = {
  pre_surgery: {
    title: '術前期',
    description: '手術前の準備期間',
    exercises: [
      {
        id: 'pre_1',
        name: '階段昇降練習',
        category: '基本動作訓練',
        description: '手術後の日常生活動作に備え、階段昇降の基本動作を練習します。',
        instructions: {
          preparation: '手すりのある階段または段差を用意。滑り止めの靴を着用し、必要に応じて補助者を配置。',
          execution: '【昇り】患側足から踏み出し、健側足で体重を支えながらゆっくりと昇る。【降り】健側足から降り、患側足をゆっくりと下ろす。',
          tips: '急がずゆっくりと。体重は健側足メインで支え、患側足は軽く踏み出す程度。',
          cautions: '痛みが強い場合は中止。手すりを必ず使用し、無理をしない。',
          progression: '1段ずつ → 2-3段連続 → 手すりなし（症状に応じて）',
          effects: '下肢筋力維持、バランス能力向上、手術後の階段動作準備'
        },
        sets: 3,
        reps: 10,
        duration: 5,
        difficulty: 'beginner',
        equipment: '階段または段差',
        videoUrl: null,
        requiresAI: false
      },
      {
        id: 'pre_2',
        name: '大腿四頭筋セッティング',
        category: '筋力維持',
        description: '膝を伸ばす筋肉（大腿四頭筋）の収縮練習。手術後の筋力低下を予防します。',
        instructions: {
          preparation: '仰向けまたは座位で膝を伸ばした状態。タオルを膝下に置いても可。',
          execution: '膝を床に押し付けるように大腿前面に力を入れ、5秒間キープ。ゆっくりと力を抜く。',
          tips: '膝の皿が上に引き上がる感覚を意識。呼吸を止めずに行う。',
          cautions: '痛みが強い場合は無理をしない。炎症がある場合は医師に相談。',
          progression: '5秒 → 10秒キープ、軽負荷 → 中負荷（症状に応じて）',
          effects: '大腿四頭筋の筋力維持、手術後の筋萎縮予防'
        },
        sets: 3,
        reps: 15,
        duration: 3,
        difficulty: 'beginner',
        equipment: 'なし',
        videoUrl: null,
        requiresAI: false
      },
      {
        id: 'pre_3',
        name: 'ハムストリングス強化',
        category: '筋力維持',
        description: '太もも裏の筋肉を強化し、膝関節の安定性を向上させます。',
        instructions: {
          preparation: 'うつ伏せまたは立位で壁に手をつく姿勢。',
          execution: 'うつ伏せ：踵をお尻に近づけるように膝を曲げる。立位：膝を後方に曲げる。',
          tips: '太もも裏の筋肉の収縮を意識。ゆっくりとした動作で行う。',
          cautions: '腰痛がある場合は立位で実施。無理のない範囲で行う。',
          progression: '自重 → 軽いウェイト → チューブ使用（段階的に）',
          effects: 'ハムストリングス筋力強化、膝関節安定性向上'
        },
        sets: 3,
        reps: 12,
        duration: 4,
        difficulty: 'beginner',
        equipment: 'なし',
        videoUrl: null,
        requiresAI: false
      },
      {
        id: 'pre_4',
        name: '足首の運動',
        category: '筋力維持',
        description: '足首の柔軟性と筋力を維持し、血液循環を促進します。',
        instructions: {
          preparation: '座位または仰向けで足を楽な位置に。',
          execution: '【底屈】つま先を下に向ける。【背屈】つま先を上に向ける。【内外返し】足首を内側・外側に回す。',
          tips: 'ゆっくりと大きく動かす。足首の可動域を最大限使う。',
          cautions: '痛みがある場合は無理をしない。腫れがある場合は医師に相談。',
          progression: '基本動作 → 抵抗運動 → 重り使用（段階的に）',
          effects: '足関節可動域維持、下肢血液循環促進、深部静脈血栓予防'
        },
        sets: 3,
        reps: 20,
        duration: 3,
        difficulty: 'beginner',
        equipment: 'なし',
        videoUrl: null,
        requiresAI: false
      }
    ]
  },
  post_surgery_early: {
    title: '術直後期',
    description: '手術直後〜2週間',
    exercises: [
      {
        id: 'post_1',
        name: 'ヒールスライド',
        category: '可動域改善',
        description: '膝の曲げ伸ばし運動で、術後の可動域回復を促進します。',
        instructions: {
          preparation: '仰向けで患側足をベッドまたは床に。滑りやすい靴下着用または床にタオル。',
          execution: '踵を滑らせながらゆっくりと膝を曲げ、痛みのない範囲で最大まで。ゆっくりと元の位置に戻す。',
          tips: '無理をせず、痛みのない範囲で実施。呼吸を止めずに行う。',
          cautions: '激痛がある場合は中止。腫脹が強い場合は医師に相談。',
          progression: '小さな動き → 徐々に可動域拡大（医師の指示に従い）',
          effects: '膝関節可動域回復、関節拘縮の予防'
        },
        sets: 3,
        reps: 10,
        duration: 5,
        difficulty: 'beginner',
        equipment: 'タオルまたは滑りやすい靴下',
        videoUrl: null,
        requiresAI: false
      },
      {
        id: 'post_2',
        name: '大腿四頭筋セッティング',
        category: '可動域改善',
        description: '手術後早期の筋力回復運動。膝伸展機能の早期回復を図ります。',
        instructions: {
          preparation: '仰向けまたは座位で膝を伸ばした状態。患側足に集中。',
          execution: '膝を床に押し付けるように大腿前面に力を入れ、3-5秒間キープ。ゆっくりと力を抜く。',
          tips: '術後の腫れや痛みに注意しながら、無理のない範囲で実施。',
          cautions: '激痛がある場合は中止。医師の許可を得てから開始。',
          progression: '軽い収縮 → 徐々に強い収縮（段階的に）',
          effects: '大腿四頭筋の早期活性化、筋萎縮の予防'
        },
        sets: 5,
        reps: 10,
        duration: 3,
        difficulty: 'beginner',
        equipment: 'なし',
        videoUrl: null,
        requiresAI: false
      },
      {
        id: 'post_3',
        name: '膝蓋骨モビライゼーション',
        category: '可動域改善',
        description: 'お皿（膝蓋骨）の動きを改善し、膝の可動域回復を促進します。',
        instructions: {
          preparation: '仰向けで膝を伸ばした状態。リラックスして大腿四頭筋の力を抜く。',
          execution: 'お皿を上下・左右に優しく動かす。各方向3-5秒ずつ。',
          tips: '力を入れすぎず、優しく動かす。お皿が硬い場合は無理をしない。',
          cautions: '激痛がある場合は中止。腫脹が強い場合は控える。',
          progression: '軽い動き → 徐々に可動域拡大（痛みに応じて）',
          effects: '膝蓋骨周囲の癒着防止、膝関節可動域改善'
        },
        sets: 3,
        reps: 5,
        duration: 3,
        difficulty: 'beginner',
        equipment: 'なし',
        videoUrl: null,
        requiresAI: false
      },
      {
        id: 'post_4',
        name: 'アイシング（冷却療法）',
        category: '腫脹・疼痛管理',
        description: '手術部位の腫れと痛みを軽減するための冷却療法です。',
        instructions: {
          preparation: 'アイスパック、冷却パッド、または氷嚢を用意。タオルで包んで直接肌に当てない。',
          execution: '患部に15-20分間冷却。1-2時間間隔を空けて繰り返し。',
          tips: '冷却しすぎないよう時間を守る。感覚がなくなったら一時中断。',
          cautions: '凍傷に注意。糖尿病や循環障害がある場合は医師に相談。',
          progression: '術直後：頻回実施 → 腫脹改善に従い回数減少',
          effects: '疼痛軽減、腫脹抑制、炎症反応の制御'
        },
        sets: 6,
        reps: 1,
        duration: 20,
        difficulty: 'beginner',
        equipment: 'アイスパック、タオル',
        videoUrl: null,
        requiresAI: false
      },
      {
        id: 'post_5',
        name: '挙上（エレベーション）',
        category: '腫脹・疼痛管理',
        description: '患肢を心臓より高く上げて、腫れの軽減を図ります。',
        instructions: {
          preparation: 'クッションや枕を用意。仰向けまたは座位で準備。',
          execution: '患側足を心臓より高い位置に15-30分間保持。快適な姿勢で実施。',
          tips: '長時間同じ姿勢を避ける。血流が悪くならないよう注意。',
          cautions: '足のしびれや色が変わった場合は位置を変える。',
          progression: '短時間 → 長時間（快適さに応じて）',
          effects: '下肢浮腫の軽減、静脈還流の促進'
        },
        sets: 4,
        reps: 1,
        duration: 30,
        difficulty: 'beginner',
        equipment: 'クッション、枕',
        videoUrl: null,
        requiresAI: false
      },
      {
        id: 'post_6',
        name: '足首ポンプ運動',
        category: '腫脹・疼痛管理',
        description: '足首の運動により血液循環を促進し、腫れや血栓の予防を行います。',
        instructions: {
          preparation: '仰向けまたは座位で足を楽な位置に。',
          execution: 'つま先を上下にゆっくりと動かす。足首のポンプ作用を意識。',
          tips: 'リズミカルに、疲れない程度で継続する。',
          cautions: '痛みが強い場合は無理をしない。ふくらはぎに痛みがある場合は医師に相談。',
          progression: '基本動作 → 抵抗を加えた運動（段階的に）',
          effects: '血液循環促進、深部静脈血栓の予防、浮腫軽減'
        },
        sets: '頻回',
        reps: 30,
        duration: 2,
        difficulty: 'beginner',
        equipment: 'なし',
        videoUrl: null,
        requiresAI: false
      }
    ]
  },
  phase_3_1: {
    title: '基礎回復期',
    description: '2〜6週間',
    exercises: [
      {
        id: 'phase1_1',
        name: '正常歩行練習',
        category: '歩行訓練',
        description: '正常な歩行パターンの再獲得を目指します。',
        instructions: {
          preparation: '平坦で滑らない床面、必要に応じて歩行補助具を用意。',
          execution: '踵接地→足底接地→つま先離地の順で、左右対称な歩行を意識。',
          tips: '歩幅は無理せず、徐々に正常な歩行パターンに近づける。',
          cautions: '痛みや不安定感がある場合は歩行補助具を使用。',
          progression: '歩行補助具あり → 補助具なし → 歩行距離延長',
          effects: '正常歩行パターンの回復、下肢筋力向上'
        },
        sets: 3,
        reps: 10,
        duration: 10,
        difficulty: 'beginner',
        equipment: '歩行補助具（必要に応じて）',
        videoUrl: null,
        requiresAI: false
      },
      {
        id: 'phase1_2',
        name: '片脚立位',
        category: '歩行訓練',
        description: 'バランス能力と下肢筋力の向上を図ります。',
        instructions: {
          preparation: '平坦な床面、必要に応じて手すりや壁を用意。',
          execution: '患側脚で立ち、5-30秒間6つける。バランスを保ちながら実施。',
          tips: '最初は壁や手すりを使用し、徐々に独立で実施。',
          cautions: '転倒のリスクがあるため、必ず安全な環境で実施。',
          progression: '手すりあり5秒 → 手すりなしで長時間',
          effects: 'バランス能力向上、固有受容器の活性化'
        },
        sets: 3,
        reps: 5,
        duration: 5,
        difficulty: 'beginner',
        equipment: 'なし',
        videoUrl: null,
        requiresAI: false
      },
      {
        id: 'phase1_3',
        name: '大腿四頭筋セッティング（進階）',
        category: '基礎筋力強化',
        description: '荷重をかけた大腿四頭筋の強化運動です。',
        instructions: {
          preparation: '長座位でタオルを膝下に置く。必要に応じて設重を足首に装着。',
          execution: 'タオルを膝で潰すように大腿前面に力を入5-10秒キープ。',
          tips: '呼吸を止めずに行い、膝の皿が上に引き上がる感覚を意識。',
          cautions: '痛みが強い場合は無理をしない。徐々に負荷を増加。',
          progression: '自重 → 軽い重り → 中程度の重り',
          effects: '大腿四頭筋強化、膝関節安定性向上'
        },
        sets: 3,
        reps: 12,
        duration: 4,
        difficulty: 'intermediate',
        equipment: 'タオル、設重（任意）',
        videoUrl: null,
        requiresAI: false
      }
    ]
  },
  phase_3_2: {
    title: '筋力強化期',
    description: '6〜12週間',
    exercises: [
      {
        id: 'phase2_1',
        name: 'ウォールスクワット',
        category: '筋力強化',
        description: '壁を使った安全なスクワット練習です。',
        instructions: {
          preparation: '壁に背中をつけ、足を壁から少し離した位置に置く。',
          execution: '壁に背中をつけたまま、ゲームボールを挿んでスクワット。',
          tips: '膝がつま先より前に出ないよう注意。背筋を伸ばしたまま実施。',
          cautions: '膝に痛みがある場合は深く源りすぎない。',
          progression: '浅い角度 → 90度 → 深い角度',
          effects: '下肢筋力強化、正しいスクワットフォームの習得'
        },
        sets: 3,
        reps: 10,
        duration: 5,
        difficulty: 'intermediate',
        equipment: '壁、ゲームボール（任意）',
        videoUrl: null,
        requiresAI: true
      },
      {
        id: 'phase2_2',
        name: 'ミニスクワット',
        category: '筋力強化',
        description: '小さな可動域でのスクワット練習です。',
        instructions: {
          preparation: '足を肩幅に開き、つま先を略々外側に向ける。',
          execution: 'お尻を後ろに突き出すように腰を落とし、膝を軽く曲げる。',
          tips: '膝が内側に入らないよう意識。背筋を伸ばしたまま実施。',
          cautions: '無理に深く源らず、痛みのない範囲で実施。',
          progression: '浅い角度 → 45度 → 90度',
          effects: '下肢筋力強化、正しいスクワットフォームの習得'
        },
        sets: 3,
        reps: 15,
        duration: 4,
        difficulty: 'intermediate',
        equipment: 'なし',
        videoUrl: null,
        requiresAI: true
      }
    ]
  },
  phase_3_3: {
    title: '機能訓練期',
    description: '3〜6ヶ月',
    exercises: [
      {
        id: 'phase3_1',
        name: '両足ジャンプ着地',
        category: 'スポーツ動作訓練',
        description: 'ジャンプ着地の基本動作を習得します。',
        instructions: {
          preparation: '平坦で安全な床面。足を肩幅に開く。',
          execution: '軽くジャンプし、両足同時に柔らかく着地。膝を軽く曲げて衝撃を吸収。',
          tips: '着地時の音を小さくするよう意識。膝が内側に入らないよう注意。',
          cautions: '着地時の痛みや不安定感がある場合は中止。',
          progression: '低いジャンプ → 高いジャンプ → 連続ジャンプ',
          effects: '着地技術の向上、下肢筋力強化'
        },
        sets: 3,
        reps: 8,
        duration: 5,
        difficulty: 'advanced',
        equipment: 'なし',
        videoUrl: null,
        requiresAI: true
      }
    ]
  },
  phase_3_4: {
    title: '競技復帰期',
    description: '6〜12ヶ月',
    exercises: [
      {
        id: 'phase4_1',
        name: 'カッティング動作（基礎）',
        category: '競技特異的訓練',
        description: 'スポーツ復帰のための方向転換練習です。',
        instructions: {
          preparation: '幅約3メートルのコーンを置く。安全な床面で実施。',
          execution: '中央からスタートし、左右のコーンに向かって素早く移動。',
          tips: '膝が内側に入らないよう注意。体幹を安定させる。',
          cautions: '最初はゲームスピードではなく、正確性を重視。',
          progression: 'ゲームスピード → 中速度 → 高速度',
          effects: '方向転換能力向上、アジリティ向上'
        },
        sets: 3,
        reps: 6,
        duration: 8,
        difficulty: 'advanced',
        equipment: 'コーンまたはマーカー',
        videoUrl: null,
        requiresAI: true
      }
    ]
  }
};

// フェーズ別エクササイズ取得
const getExercisesByPhase = (phase) => {
  return exercises[phase] || { title: 'Unknown Phase', description: '', exercises: [] };
};

// すべてのフェーズ取得
const getAllPhases = () => {
  return Object.keys(exercises).map(phase => ({
    id: phase,
    title: exercises[phase].title,
    description: exercises[phase].description,
    exerciseCount: exercises[phase].exercises.length
  }));
};

// 運動詳細取得
const getExerciseById = (exerciseId) => {
  for (const phase in exercises) {
    const exercise = exercises[phase].exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      return {
        ...exercise,
        phase: phase,
        phaseTitle: exercises[phase].title
      };
    }
  }
  return null;
};

// カテゴリ別エクササイズ取得
const getExercisesByCategory = (category) => {
  const result = [];
  for (const phase in exercises) {
    const phaseExercises = exercises[phase].exercises.filter(ex => ex.category === category);
    result.push(...phaseExercises.map(ex => ({
      ...ex,
      phase: phase,
      phaseTitle: exercises[phase].title
    })));
  }
  return result;
};

// AI分析対応エクササイズ取得
const getAIAnalysisExercises = () => {
  const result = [];
  for (const phase in exercises) {
    const aiExercises = exercises[phase].exercises.filter(ex => ex.requiresAI);
    result.push(...aiExercises.map(ex => ({
      ...ex,
      phase: phase,
      phaseTitle: exercises[phase].title
    })));
  }
  return result;
};

module.exports = {
  exercises,
  getExercisesByPhase,
  getAllPhases,
  getExerciseById,
  getExercisesByCategory,
  getAIAnalysisExercises
};