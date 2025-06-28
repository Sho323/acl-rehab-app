exports.up = function(knex) {
  return knex.schema.createTable('patient_exercise_plans', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('patient_id').references('id').inTable('patients').onDelete('CASCADE');
    table.uuid('exercise_id').references('id').inTable('exercises').onDelete('CASCADE');
    table.string('current_phase', 20).notNullable();
    table.integer('assigned_sets').notNullable();
    table.integer('assigned_reps').notNullable();
    table.integer('assigned_duration_seconds').defaultTo(0);
    table.date('start_date').notNullable();
    table.date('end_date');
    table.boolean('is_completed').defaultTo(false);
    table.boolean('is_unlocked').defaultTo(false); // 患者がアクセス可能かどうか
    table.text('medical_staff_notes'); // 医療従事者からの注意事項
    table.timestamps(true, true);
    
    table.index(['patient_id']);
    table.index(['exercise_id']);
    table.index(['current_phase']);
    table.index(['is_completed']);
    table.index(['is_unlocked']);
    table.unique(['patient_id', 'exercise_id', 'current_phase']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('patient_exercise_plans');
};