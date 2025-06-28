const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const { authenticateToken } = require('../utils/auth');
const logger = require('../utils/logger');

// 運動カテゴリー一覧の取得
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const { phase } = req.query;
    const categories = await Exercise.getCategories(phase);
    res.json(categories);
  } catch (error) {
    logger.error('Error fetching exercise categories:', { error: error.message, phase, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to fetch exercise categories' });
  }
});

// フェーズ別運動一覧の取得
router.get('/phase/:phase', authenticateToken, async (req, res) => {
  try {
    const { phase } = req.params;
    const exercises = await Exercise.getExercisesByPhase(phase);
    res.json(exercises);
  } catch (error) {
    logger.error('Error fetching exercises by phase:', { error: error.message, phase, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// カテゴリー別運動一覧の取得
router.get('/category/:categoryId', authenticateToken, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const exercises = await Exercise.getExercisesByCategory(categoryId);
    res.json(exercises);
  } catch (error) {
    logger.error('Error fetching exercises by category:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// 患者の運動プラン取得
router.get('/patient/:patientId/plan', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { phase } = req.query;
    
    if (!phase) {
      return res.status(400).json({ error: 'Phase parameter is required' });
    }

    const exercisePlan = await Exercise.getPatientExercisePlan(patientId, phase);
    res.json(exercisePlan);
  } catch (error) {
    logger.error('Error fetching patient exercise plan:', error);
    res.status(500).json({ error: 'Failed to fetch exercise plan' });
  }
});

// 運動の詳細取得
router.get('/:exerciseId', authenticateToken, async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const exercise = await Exercise.getExerciseById(exerciseId);
    
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    
    res.json(exercise);
  } catch (error) {
    logger.error('Error fetching exercise details:', error);
    res.status(500).json({ error: 'Failed to fetch exercise details' });
  }
});

// 患者への運動割り当て（医療従事者用）
router.post('/assign', authenticateToken, async (req, res) => {
  try {
    const { patient_id, exercise_id, phase, sets, reps, duration, notes } = req.body;
    
    if (!patient_id || !exercise_id || !phase || !sets || !reps) {
      return res.status(400).json({ 
        error: 'Required fields: patient_id, exercise_id, phase, sets, reps' 
      });
    }

    await Exercise.assignExerciseToPatient(patient_id, exercise_id, phase, sets, reps, duration || 0, notes);
    res.status(201).json({ message: 'Exercise assigned successfully' });
  } catch (error) {
    logger.error('Error assigning exercise:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'Exercise already assigned to patient for this phase' });
    } else {
      res.status(500).json({ error: 'Failed to assign exercise' });
    }
  }
});

// 運動セッションの記録
router.post('/session', authenticateToken, async (req, res) => {
  try {
    const sessionData = req.body;
    
    if (!sessionData.patient_id || !sessionData.phase || !sessionData.start_time) {
      return res.status(400).json({ 
        error: 'Required fields: patient_id, phase, start_time' 
      });
    }

    const sessionId = await Exercise.recordExerciseSession(sessionData);
    res.status(201).json({ 
      message: 'Exercise session recorded successfully',
      session_id: sessionId 
    });
  } catch (error) {
    logger.error('Error recording exercise session:', error);
    res.status(500).json({ error: 'Failed to record exercise session' });
  }
});

module.exports = router;