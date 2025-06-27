exports.seed = async function(knex) {
  // Delete all existing entries
  await knex('exercise_categories').del();
  
  // Insert seed entries
  await knex('exercise_categories').insert([
    // 術前期
    {
      id: knex.raw('gen_random_uuid()'),
      name: '基本動作訓練',
      description: '術前の基本的な動作を身につける',
      phase: 'pre_surgery',
      order_index: 1,
      icon_name: 'walk',
      is_active: true,
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: '筋力維持',
      description: '手術前の筋力を維持する',
      phase: 'pre_surgery',
      order_index: 2,
      icon_name: 'dumbbell',
      is_active: true,
    },
    
    // 術直後期
    {
      id: knex.raw('gen_random_uuid()'),
      name: '可動域改善',
      description: '膝関節の可動域を徐々に改善',
      phase: 'post_surgery_early',
      order_index: 1,
      icon_name: 'rotate-360',
      is_active: true,
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: '腫脹・疼痛管理',
      description: '腫れと痛みの管理',
      phase: 'post_surgery_early',
      order_index: 2,
      icon_name: 'snowflake',
      is_active: true,
    },
    
    // 基礎回復期 (2-6週間)
    {
      id: knex.raw('gen_random_uuid()'),
      name: '歩行訓練',
      description: '正常歩行の獲得',
      phase: 'phase_3_1',
      order_index: 1,
      icon_name: 'walk',
      is_active: true,
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: '基礎筋力強化',
      description: '基本的な筋力の回復',
      phase: 'phase_3_1',
      order_index: 2,
      icon_name: 'arm-flex',
      is_active: true,
    },
    
    // 筋力強化期 (6-12週間)
    {
      id: knex.raw('gen_random_uuid()'),
      name: '筋力強化',
      description: '体重負荷での筋力強化',
      phase: 'phase_3_2',
      order_index: 1,
      icon_name: 'weight-lifter',
      is_active: true,
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'バランス訓練',
      description: 'バランス感覚の改善',
      phase: 'phase_3_2',
      order_index: 2,
      icon_name: 'balance-scale',
      is_active: true,
    },
    
    // 機能訓練期 (3-6ヶ月)
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'スポーツ動作訓練',
      description: 'スポーツ特異的な動作の習得',
      phase: 'phase_3_3',
      order_index: 1,
      icon_name: 'basketball',
      is_active: true,
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'アジリティ訓練',
      description: '敏捷性の向上',
      phase: 'phase_3_3',
      order_index: 2,
      icon_name: 'run-fast',
      is_active: true,
    },
    
    // 競技復帰期 (6-12ヶ月)
    {
      id: knex.raw('gen_random_uuid()'),
      name: '競技特異的訓練',
      description: '競技に特化した動作訓練',
      phase: 'phase_3_4',
      order_index: 1,
      icon_name: 'soccer',
      is_active: true,
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: '外傷予防訓練',
      description: '再受傷予防のための訓練',
      phase: 'phase_3_4',
      order_index: 2,
      icon_name: 'shield-check',
      is_active: true,
    },
  ]);
};