exports.up = function(knex) {
  return knex.schema.createTable('patients', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('patient_number', 20).unique().notNullable();
    table.string('name', 100).notNullable();
    table.string('email', 100).unique();
    table.string('password_hash', 255).notNullable();
    table.date('date_of_birth').notNullable();
    table.enum('gender', ['male', 'female', 'other']);
    table.date('surgery_date');
    table.enum('current_phase', ['pre_surgery', 'post_surgery_early', 'phase_3_1', 'phase_3_2', 'phase_3_3', 'phase_3_4', 'completed']).defaultTo('pre_surgery');
    table.uuid('hospital_id').references('id').inTable('hospitals').onDelete('CASCADE');
    table.uuid('attending_doctor_id').references('id').inTable('medical_staff');
    table.uuid('physiotherapist_id').references('id').inTable('medical_staff');
    table.string('phone', 20);
    table.text('medical_notes');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login_at');
    table.timestamps(true, true);
    
    table.index(['patient_number']);
    table.index(['email']);
    table.index(['hospital_id']);
    table.index(['current_phase']);
    table.index(['attending_doctor_id']);
    table.index(['physiotherapist_id']);
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('patients');
};