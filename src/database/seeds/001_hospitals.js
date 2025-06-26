exports.seed = async function(knex) {
  // 既存データを削除
  await knex('hospitals').del();
  
  // サンプル病院データを挿入
  await knex('hospitals').insert([
    {
      id: knex.raw('gen_random_uuid()'),
      name: '整形外科リハビリテーション病院',
      code: 'ORTHO001',
      address: '東京都港区赤坂1-1-1',
      phone: '03-1234-5678',
      email: 'info@ortho-rehab.jp',
      is_active: true
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'スポーツ医学センター',
      code: 'SPORTS001',
      address: '東京都渋谷区神宮前1-1-1',
      phone: '03-2345-6789',
      email: 'contact@sports-med.jp',
      is_active: true
    }
  ]);
};