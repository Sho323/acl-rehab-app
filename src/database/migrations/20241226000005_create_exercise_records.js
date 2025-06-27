exports.up = function(knex) {
  return knex.schema.createTable('exercise_records', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('session_id').references('id').inTable('exercise_sessions').onDelete('CASCADE');
    table.uuid('exercise_id').references('id').inTable('exercises').onDelete('CASCADE');
    table.string('exercise_type', 50).notNullable();
    table.integer('sets_completed').defaultTo(0);
    table.integer('reps_completed').defaultTo(0);
    table.integer('duration_seconds').defaultTo(0);
    table.decimal('ai_score', 5, 2);
    table.string('video_url', 500);
    table.string('video_file_path', 500);
    table.jsonb('exercise_data'); // 運動固有のデータ
    table.timestamps(true, true);
    
    table.index(['session_id']);
    table.index(['exercise_id']);
    table.index(['exercise_type']);
    table.index(['ai_score']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('exercise_records');
};