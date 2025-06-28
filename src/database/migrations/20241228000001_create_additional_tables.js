exports.up = function(knex) {
  return Promise.all([
    // 動画アップロードテーブル
    knex.schema.createTable('video_uploads', function(table) {
      table.increments('id').primary();
      table.integer('patient_id').unsigned().notNullable();
      table.integer('exercise_id').unsigned().nullable();
      table.integer('session_id').unsigned().nullable();
      table.string('filename').notNullable();
      table.string('original_name').notNullable();
      table.string('file_path').notNullable();
      table.bigInteger('file_size').notNullable();
      table.string('mime_type').notNullable();
      table.text('notes').nullable();
      table.enum('upload_status', ['uploaded', 'processing', 'completed', 'failed']).defaultTo('uploaded');
      table.timestamps(true, true);
      
      table.foreign('patient_id').references('id').inTable('patients').onDelete('CASCADE');
      table.foreign('exercise_id').references('id').inTable('exercises').onDelete('SET NULL');
      table.index(['patient_id', 'created_at']);
    }),

    // AI分析結果テーブル
    knex.schema.createTable('ai_analysis_results', function(table) {
      table.increments('id').primary();
      table.integer('video_id').unsigned().notNullable();
      table.integer('patient_id').unsigned().notNullable();
      table.string('analysis_type').defaultTo('knee_in_toe_out');
      table.enum('analysis_status', ['processing', 'completed', 'failed']).defaultTo('processing');
      table.decimal('knee_in_score', 5, 2).nullable();
      table.decimal('toe_out_score', 5, 2).nullable();
      table.decimal('overall_score', 5, 2).nullable();
      table.text('feedback').nullable();
      table.json('recommendations').nullable();
      table.json('analysis_data').nullable();
      table.text('error_message').nullable();
      table.timestamp('started_at').nullable();
      table.timestamp('analyzed_at').nullable();
      table.timestamps(true, true);
      
      table.foreign('video_id').references('id').inTable('video_uploads').onDelete('CASCADE');
      table.foreign('patient_id').references('id').inTable('patients').onDelete('CASCADE');
      table.unique(['video_id']);
      table.index(['patient_id', 'analysis_status']);
    }),

    // メッセージテーブル
    knex.schema.createTable('messages', function(table) {
      table.increments('id').primary();
      table.enum('sender_type', ['patient', 'medical_staff']).notNullable();
      table.integer('sender_id').unsigned().notNullable();
      table.enum('recipient_type', ['patient', 'medical_staff']).notNullable();
      table.integer('recipient_id').unsigned().notNullable();
      table.string('subject').notNullable();
      table.text('message').notNullable();
      table.enum('priority', ['low', 'normal', 'high', 'urgent']).defaultTo('normal');
      table.json('attachments').nullable();
      table.enum('status', ['sent', 'read', 'archived']).defaultTo('sent');
      table.timestamp('read_at').nullable();
      table.timestamps(true, true);
      
      table.index(['recipient_type', 'recipient_id', 'status']);
      table.index(['sender_type', 'sender_id']);
      table.index(['created_at']);
    }),

    // レポートテーブル
    knex.schema.createTable('reports', function(table) {
      table.increments('id').primary();
      table.integer('patient_id').unsigned().notNullable();
      table.integer('medical_staff_id').unsigned().notNullable();
      table.enum('report_type', ['weekly', 'monthly', 'phase_completion', 'custom']).notNullable();
      table.string('period').notNullable();
      table.json('report_data').notNullable();
      table.text('notes').nullable();
      table.enum('status', ['sent', 'read', 'acknowledged']).defaultTo('sent');
      table.timestamp('read_at').nullable();
      table.timestamps(true, true);
      
      table.foreign('patient_id').references('id').inTable('patients').onDelete('CASCADE');
      table.foreign('medical_staff_id').references('id').inTable('medical_staff').onDelete('CASCADE');
      table.index(['patient_id', 'created_at']);
      table.index(['medical_staff_id', 'status']);
    }),

    // 通知テーブル
    knex.schema.createTable('notifications', function(table) {
      table.increments('id').primary();
      table.enum('sender_type', ['system', 'patient', 'medical_staff']).notNullable();
      table.integer('sender_id').unsigned().nullable();
      table.enum('recipient_type', ['patient', 'medical_staff']).notNullable();
      table.integer('recipient_id').unsigned().notNullable();
      table.string('title').notNullable();
      table.text('message').notNullable();
      table.enum('type', ['info', 'warning', 'reminder', 'achievement', 'system']).defaultTo('info');
      table.enum('status', ['unread', 'read']).defaultTo('unread');
      table.timestamp('read_at').nullable();
      table.json('data').nullable();
      table.timestamps(true, true);
      
      table.index(['recipient_type', 'recipient_id', 'status']);
      table.index(['created_at']);
    }),

    // フェーズ進行履歴テーブル
    knex.schema.createTable('phase_progression_history', function(table) {
      table.increments('id').primary();
      table.integer('patient_id').unsigned().notNullable();
      table.string('from_phase').nullable();
      table.string('to_phase').notNullable();
      table.enum('changed_by_type', ['patient', 'medical_staff', 'system']).notNullable();
      table.integer('changed_by_id').unsigned().nullable();
      table.text('notes').nullable();
      table.timestamps(true, true);
      
      table.foreign('patient_id').references('id').inTable('patients').onDelete('CASCADE');
      table.index(['patient_id', 'created_at']);
    }),

    // 患者目標テーブル
    knex.schema.createTable('patient_goals', function(table) {
      table.increments('id').primary();
      table.integer('patient_id').unsigned().notNullable();
      table.string('title').notNullable();
      table.text('description').nullable();
      table.date('target_date').notNullable();
      table.enum('category', ['strength', 'mobility', 'balance', 'sport_specific', 'general']).defaultTo('general');
      table.enum('status', ['active', 'completed', 'cancelled']).defaultTo('active');
      table.integer('progress').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table.timestamp('completed_at').nullable();
      table.timestamps(true, true);
      
      table.foreign('patient_id').references('id').inTable('patients').onDelete('CASCADE');
      table.index(['patient_id', 'status']);
      table.index(['target_date']);
    }),

    // 患者設定テーブル
    knex.schema.createTable('patient_preferences', function(table) {
      table.increments('id').primary();
      table.integer('patient_id').unsigned().notNullable();
      table.json('settings').notNullable();
      table.timestamps(true, true);
      
      table.foreign('patient_id').references('id').inTable('patients').onDelete('CASCADE');
      table.unique(['patient_id']);
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTableIfExists('patient_preferences'),
    knex.schema.dropTableIfExists('patient_goals'),
    knex.schema.dropTableIfExists('phase_progression_history'),
    knex.schema.dropTableIfExists('notifications'),
    knex.schema.dropTableIfExists('reports'),
    knex.schema.dropTableIfExists('messages'),
    knex.schema.dropTableIfExists('ai_analysis_results'),
    knex.schema.dropTableIfExists('video_uploads')
  ]);
};