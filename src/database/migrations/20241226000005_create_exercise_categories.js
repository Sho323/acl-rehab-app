exports.up = function(knex) {
  return knex.schema.createTable('exercise_categories', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.text('description');
    table.string('phase', 20).notNullable(); // 'pre_surgery', 'post_surgery_phase1', 'post_surgery_phase2', etc.
    table.integer('order_index').notNullable(); // カテゴリー内での順序
    table.string('icon_name', 50); // アイコン名
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['phase']);
    table.index(['order_index']);
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('exercise_categories');
};