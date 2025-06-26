exports.up = function(knex) {
  return knex.schema.createTable('hospitals', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 200).notNullable();
    table.string('code', 20).unique().notNullable();
    table.string('address', 500);
    table.string('phone', 20);
    table.string('email', 100);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['code']);
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('hospitals');
};