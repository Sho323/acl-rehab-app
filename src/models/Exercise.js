const db = require('../config/database');

class Exercise {
  // 全ての運動カテゴリーを取得
  static async getCategories(phase = null) {
    let query = db('exercise_categories')
      .where('is_active', true)
      .orderBy('order_index');
    
    if (phase) {
      query = query.where('phase', phase);
    }
    
    return await query;
  }

  // 特定カテゴリーの運動を取得
  static async getExercisesByCategory(categoryId) {
    return await db('exercises')
      .where('category_id', categoryId)
      .where('is_active', true)
      .orderBy('order_index');
  }

  // フェーズ別の全運動を取得
  static async getExercisesByPhase(phase) {
    return await db('exercises')
      .join('exercise_categories', 'exercises.category_id', 'exercise_categories.id')
      .where('exercise_categories.phase', phase)
      .where('exercises.is_active', true)
      .where('exercise_categories.is_active', true)
      .select('exercises.*', 'exercise_categories.name as category_name')
      .orderBy('exercise_categories.order_index')
      .orderBy('exercises.order_index');
  }

  // 患者の運動プランを取得
  static async getPatientExercisePlan(patientId, phase) {
    return await db('patient_exercise_plans')
      .join('exercises', 'patient_exercise_plans.exercise_id', 'exercises.id')
      .join('exercise_categories', 'exercises.category_id', 'exercise_categories.id')
      .where('patient_exercise_plans.patient_id', patientId)
      .where('patient_exercise_plans.current_phase', phase)
      .where('patient_exercise_plans.is_unlocked', true)
      .select(
        'patient_exercise_plans.*',
        'exercises.name as exercise_name',
        'exercises.description',
        'exercises.instructions',
        'exercises.difficulty_level',
        'exercises.image_url',
        'exercises.video_url',
        'exercises.precautions',
        'exercises.contraindications',
        'exercises.requires_ai_analysis',
        'exercise_categories.name as category_name'
      )
      .orderBy('exercise_categories.order_index')
      .orderBy('exercises.order_index');
  }

  // 患者に運動を割り当て
  static async assignExerciseToPatient(patientId, exerciseId, phase, sets, reps, duration = 0, notes = null) {
    return await db('patient_exercise_plans').insert({
      patient_id: patientId,
      exercise_id: exerciseId,
      current_phase: phase,
      assigned_sets: sets,
      assigned_reps: reps,
      assigned_duration_seconds: duration,
      start_date: new Date(),
      is_unlocked: true,
      medical_staff_notes: notes
    });
  }

  // 運動の詳細を取得
  static async getExerciseById(exerciseId) {
    return await db('exercises')
      .join('exercise_categories', 'exercises.category_id', 'exercise_categories.id')
      .where('exercises.id', exerciseId)
      .select('exercises.*', 'exercise_categories.name as category_name')
      .first();
  }

  // 運動セッションの記録
  static async recordExerciseSession(sessionData) {
    const trx = await db.transaction();
    try {
      const [sessionId] = await trx('exercise_sessions').insert({
        patient_id: sessionData.patient_id,
        phase: sessionData.phase,
        start_time: sessionData.start_time,
        end_time: sessionData.end_time,
        pain_level: sessionData.pain_level,
        borg_scale: sessionData.borg_scale,
        location: sessionData.location,
        notes: sessionData.notes,
        completed: sessionData.completed
      });

      if (sessionData.exercises && sessionData.exercises.length > 0) {
        const exerciseRecords = sessionData.exercises.map(exercise => ({
          session_id: sessionId,
          exercise_id: exercise.exercise_id,
          exercise_type: exercise.exercise_type,
          sets_completed: exercise.sets_completed,
          reps_completed: exercise.reps_completed,
          duration_seconds: exercise.duration_seconds,
          ai_score: exercise.ai_score,
          video_url: exercise.video_url,
          video_file_path: exercise.video_file_path,
          exercise_data: exercise.exercise_data
        }));

        await trx('exercise_records').insert(exerciseRecords);
      }

      await trx.commit();
      return sessionId;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

module.exports = Exercise;