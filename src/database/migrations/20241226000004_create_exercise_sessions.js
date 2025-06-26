exports.up = function(knex) {
  return knex.schema.createTable('exercise_sessions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('patient_id').references('id').inTable('patients').onDelete('CASCADE');
    table.string('phase', 20).notNullable();
    table.timestamp('start_time').notNullable();
    table.timestamp('end_time');
    table.integer('pain_level').checkBetween([0, 10]);
    table.integer('borg_scale').checkBetween([6, 20]);
    table.string('location', 50);
    table.text('notes');
    table.boolean('completed').defaultTo(false);
    table.timestamps(true, true);
    
    table.index(['patient_id']);
    table.index(['phase']);
    table.index(['start_time']);
    table.index(['completed']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('exercise_sessions');
};