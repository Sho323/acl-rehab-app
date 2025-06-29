exports.seed = async function(knex) {
  // Delete all existing entries
  await knex('patients').del();
  
  // Get hospital ID
  const hospitals = await knex('hospitals').select('id').first();
  const hospitalId = hospitals?.id;
  
  // Use bcrypt hash for password
  const hashedPassword = '$2a$12$moO7Xu0mCqJNGvXGt4KY3etQNZL5DFbCJfbZl0lTEZtdOd6bt0BFm';
  
  // Insert seed entries
  await knex('patients').insert([
    {
      id: knex.raw('gen_random_uuid()'),
      hospital_id: hospitalId,
      patient_number: 'P001',
      name: '山田太郎',
      email: 'yamada@example.com',
      phone: '090-1234-5678',
      date_of_birth: '1990-01-15',
      gender: 'male',
      surgery_date: '2024-02-15',
      current_phase: 'phase_3_3', // 機能訓練期
      password_hash: hashedPassword,
      is_active: true,
    },
    {
      id: knex.raw('gen_random_uuid()'),
      hospital_id: hospitalId,
      patient_number: 'P002',
      name: '佐藤花子',
      email: 'sato@example.com',
      phone: '090-9876-5432',
      date_of_birth: '1995-03-22',
      gender: 'female',
      surgery_date: '2024-03-25',
      current_phase: 'phase_3_4', // 競技復帰期
      password_hash: hashedPassword,
      is_active: true,
    },
    {
      id: knex.raw('gen_random_uuid()'),
      hospital_id: hospitalId,
      patient_number: 'P003',
      name: '田中一郎',
      email: 'tanaka@example.com',
      phone: '090-5555-7777',
      date_of_birth: '1992-07-08',
      gender: 'male',
      surgery_date: '2024-04-05',
      current_phase: 'pre_surgery', // 術前期
      password_hash: hashedPassword,
      is_active: true,
    }
  ]);
};