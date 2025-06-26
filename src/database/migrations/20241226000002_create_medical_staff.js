exports.up = function(knex) {
  return knex.schema.createTable('medical_staff', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('staff_number', 20).unique().notNullable();
    table.string('name', 100).notNullable();
    table.string('email', 100).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.enum('role', ['doctor', 'physiotherapist', 'nurse', 'admin']).notNullable();
    table.uuid('hospital_id').references('id').inTable('hospitals').onDelete('CASCADE');
    table.string('phone', 20);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login_at');
    table.timestamps(true, true);
    
    table.index(['staff_number']);
    table.index(['email']);
    table.index(['hospital_id']);
    table.index(['role']);
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('medical_staff');
};