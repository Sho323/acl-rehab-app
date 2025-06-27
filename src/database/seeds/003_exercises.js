exports.seed = async function(knex) {
  // Delete all existing entries
  await knex('exercises').del();
  
  // Get category IDs
  const categories = await knex('exercise_categories').select('id', 'name', 'phase');
  
  const getCategory = (name) => categories.find(cat => cat.name === name);

  // Insert seed entries
  await knex('exercises').insert([
    // 術前期 - 基本動作訓練
    {
      id: knex.raw('gen_random_uuid()'),
      category_id: getCategory('基本動作訓練')?.id,
      name: '立ち上がり練習',
      description: '椅子からの立ち上がり動作の練習',
      instructions: '1. 椅子に深く座る\n2. 両手を胸の前で組む\n3. 前傾しながらゆっくり立ち上がる\n4. 膝に痛みがない範囲で行う',
      difficulty_level: 'beginner',
      default_sets: 3,
      default_reps: 10,
      default_duration_seconds: 0,
      rest_time_seconds: 30,
      order_index: 1,
      precautions: JSON.stringify(['膝に痛みを感じた場合は中止', '転倒に注意']),
      contraindications: JSON.stringify(['急性期の強い痛み', '腫脹が著明な場合']),
      requires_ai_analysis: false,
      is_active: true,
    },
    {
      id: knex.raw('gen_random_uuid()'),
      category_id: getCategory('基本動作訓練')?.id,
      name: '階段昇降練習',
      description: '手すりを使った階段の昇り降り練習',
      instructions: '1. 手すりをしっかり握る\n2. 健側足から上る\n3. 患側足から降りる\n4. 無理をせず一段ずつ',
      difficulty_level: 'intermediate',
      default_sets: 2,
      default_reps: 5,
      default_duration_seconds: 0,
      rest_time_seconds: 60,
      order_index: 2,
      precautions: JSON.stringify(['必ず手すりを使用', '転倒防止に細心の注意']),
      contraindications: JSON.stringify(['バランス感覚に問題がある場合']),
      requires_ai_analysis: false,
      is_active: true,
    },

    // 術前期 - 筋力維持
    {
      id: knex.raw('gen_random_uuid()'),
      category_id: getCategory('筋力維持')?.id,
      name: '大腿四頭筋セッティング',
      description: '膝を伸ばした状態で太ももの前の筋肉を収縮',
      instructions: '1. 仰向けまたは長座位\n2. 膝を完全に伸ばす\n3. 太ももの前に力を入れる\n4. 5秒間保持してリラックス',
      difficulty_level: 'beginner',
      default_sets: 3,
      default_reps: 15,
      default_duration_seconds: 5,
      rest_time_seconds: 10,
      order_index: 1,
      precautions: JSON.stringify(['痛みの範囲内で実施']),
      contraindications: JSON.stringify(['急性炎症期']),
      requires_ai_analysis: false,
      is_active: true,
    },

    // 術直後期 - 可動域改善
    {
      id: knex.raw('gen_random_uuid()'),
      category_id: getCategory('可動域改善')?.id,
      name: 'ヒールスライド',
      description: 'かかとを滑らせながら膝の屈曲練習',
      instructions: '1. 仰向けに寝る\n2. かかとを床につけたまま\n3. ゆっくり膝を曲げる\n4. 可能な範囲で曲げて戻す',
      difficulty_level: 'beginner',
      default_sets: 3,
      default_reps: 10,
      default_duration_seconds: 0,
      rest_time_seconds: 30,
      order_index: 1,
      precautions: JSON.stringify(['痛みが強い場合は中止', '無理に曲げない']),
      contraindications: JSON.stringify(['医師の許可がない場合']),
      requires_ai_analysis: false,
      is_active: true,
    },

    // 基礎回復期 - 歩行訓練
    {
      id: knex.raw('gen_random_uuid()'),
      category_id: getCategory('歩行訓練')?.id,
      name: '片脚立位',
      description: '患側での片脚立位練習',
      instructions: '1. 安全な場所で実施\n2. 壁や手すりの近くに立つ\n3. 患側足で立つ\n4. バランスを保つ',
      difficulty_level: 'intermediate',
      default_sets: 3,
      default_reps: 5,
      default_duration_seconds: 10,
      rest_time_seconds: 30,
      order_index: 1,
      precautions: JSON.stringify(['転倒防止', '支持物の準備']),
      contraindications: JSON.stringify(['著明な不安定性']),
      requires_ai_analysis: true,
      is_active: true,
    },

    // 筋力強化期 - 筋力強化
    {
      id: knex.raw('gen_random_uuid()'),
      category_id: getCategory('筋力強化')?.id,
      name: 'ミニスクワット',
      description: '膝屈曲30度までの浅いスクワット',
      instructions: '1. 足を肩幅に開く\n2. 膝を30度まで曲げる\n3. 3秒保持\n4. ゆっくり戻る',
      difficulty_level: 'intermediate',
      default_sets: 3,
      default_reps: 10,
      default_duration_seconds: 3,
      rest_time_seconds: 45,
      order_index: 1,
      precautions: JSON.stringify(['膝がつま先より前に出ない', '痛みのない範囲']),
      contraindications: JSON.stringify(['膝蓋大腿関節症状が強い場合']),
      requires_ai_analysis: true,
      is_active: true,
    },

    // 筋力強化期 - バランス訓練
    {
      id: knex.raw('gen_random_uuid()'),
      category_id: getCategory('バランス訓練')?.id,
      name: 'バランスボード',
      description: 'バランスボードを使った安定性訓練',
      instructions: '1. バランスボードの上に立つ\n2. 両足で体重を支える\n3. バランスを保つ\n4. 慣れてきたら片足で実施',
      difficulty_level: 'intermediate',
      default_sets: 3,
      default_reps: 1,
      default_duration_seconds: 30,
      rest_time_seconds: 60,
      order_index: 1,
      precautions: JSON.stringify(['転倒防止対策', '段階的に難易度アップ']),
      contraindications: JSON.stringify(['重度のバランス障害']),
      requires_ai_analysis: true,
      is_active: true,
    },

    // 機能訓練期 - スポーツ動作訓練
    {
      id: knex.raw('gen_random_uuid()'),
      category_id: getCategory('スポーツ動作訓練')?.id,
      name: 'ジャンプ着地',
      description: '両足でのジャンプ着地練習',
      instructions: '1. 両足で軽くジャンプ\n2. 膝を軽く曲げて着地\n3. バランスを保つ\n4. 着地音を小さく',
      difficulty_level: 'advanced',
      default_sets: 3,
      default_reps: 10,
      default_duration_seconds: 0,
      rest_time_seconds: 60,
      order_index: 1,
      precautions: JSON.stringify(['適切な着地フォーム', 'Knee in Toe out注意']),
      contraindications: JSON.stringify(['膝の不安定性が残存']),
      requires_ai_analysis: true,
      is_active: true,
    },

    // 機能訓練期 - アジリティ訓練
    {
      id: knex.raw('gen_random_uuid()'),
      category_id: getCategory('アジリティ訓練')?.id,
      name: 'ラテラルステップ',
      description: '横方向への素早いステップ動作',
      instructions: '1. 足を肩幅に開く\n2. 横方向に素早くステップ\n3. 膝の向きに注意\n4. 反対側も同様に実施',
      difficulty_level: 'advanced',
      default_sets: 3,
      default_reps: 10,
      default_duration_seconds: 0,
      rest_time_seconds: 45,
      order_index: 1,
      precautions: JSON.stringify(['膝の内反動作を避ける', '適切なフォーム維持']),
      contraindications: JSON.stringify(['競技復帰許可が出ていない場合']),
      requires_ai_analysis: true,
      is_active: true,
    },

    // 競技復帰期 - 競技特異的訓練
    {
      id: knex.raw('gen_random_uuid()'),
      category_id: getCategory('競技特異的訓練')?.id,
      name: 'カッティング動作',
      description: '方向転換動作の練習',
      instructions: '1. 前方に走る\n2. マーカーで方向転換\n3. 膝の位置に注意\n4. 段階的にスピードアップ',
      difficulty_level: 'advanced',
      default_sets: 3,
      default_reps: 5,
      default_duration_seconds: 0,
      rest_time_seconds: 90,
      order_index: 1,
      precautions: JSON.stringify(['十分なウォームアップ', '適切なカッティングフォーム']),
      contraindications: JSON.stringify(['医師の競技復帰許可がない場合']),
      requires_ai_analysis: true,
      is_active: true,
    },

    // 競技復帰期 - 外傷予防訓練
    {
      id: knex.raw('gen_random_uuid()'),
      category_id: getCategory('外傷予防訓練')?.id,
      name: 'FIFA 11+準備運動',
      description: 'FIFA推奨の外傷予防プログラム',
      instructions: '1. 動的ストレッチ\n2. 筋力強化運動\n3. プライオメトリクス\n4. アジリティ運動',
      difficulty_level: 'advanced',
      default_sets: 1,
      default_reps: 1,
      default_duration_seconds: 900, // 15分
      rest_time_seconds: 0,
      order_index: 1,
      precautions: JSON.stringify(['段階的な負荷増加', '正しいフォームの維持']),
      contraindications: JSON.stringify(['急性期の症状がある場合']),
      requires_ai_analysis: false,
      is_active: true,
    },
  ]);
};