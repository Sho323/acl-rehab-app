exports.up = function(knex) {
  return knex.schema.createTable('exercises', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('category_id').references('id').inTable('exercise_categories').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.text('description');
    table.text('instructions'); // 実施方法の詳細
    table.string('difficulty_level', 20).notNullable(); // 'beginner', 'intermediate', 'advanced'
    table.integer('default_sets').defaultTo(1);
    table.integer('default_reps').defaultTo(1);
    table.integer('default_duration_seconds').defaultTo(0);
    table.integer('rest_time_seconds').defaultTo(30);
    table.string('image_url', 500);
    table.string('video_url', 500);
    table.jsonb('precautions'); // 注意事項
    table.jsonb('contraindications'); // 禁忌事項
    table.integer('order_index').notNullable(); // カテゴリー内での順序
    table.boolean('requires_ai_analysis').defaultTo(false); // AI動作分析が必要か
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['category_id']);
    table.index(['difficulty_level']);
    table.index(['order_index']);
    table.index(['is_active']);
    table.index(['requires_ai_analysis']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('exercises');
};