const express = require('express');
const router = express.Router();
const { getExercisesByPhase, getAllPhases, getExerciseById } = require('../data/exercises');
const logger = require('../utils/logger');

// パブリック: フェーズ別運動一覧の取得（認証不要）
router.get('/public/phase/:phase', (req, res) => {
  try {
    const { phase } = req.params;
    const exercises = getExercisesByPhase(phase);
    res.json(exercises);
  } catch (error) {
    logger.error('Error fetching public exercises by phase:', { error: error.message, phase });
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// すべてのフェーズ一覧の取得
router.get('/phases', (req, res) => {
  try {
    const phases = getAllPhases();
    res.json(phases);
  } catch (error) {
    logger.error('Error fetching phases:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch phases' });
  }
});

// フェーズ別運動一覧の取得
router.get('/phase/:phase', (req, res) => {
  try {
    const { phase } = req.params;
    const exercises = getExercisesByPhase(phase);
    res.json(exercises);
  } catch (error) {
    logger.error('Error fetching exercises by phase:', { error: error.message, phase });
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// 運動詳細の取得
router.get('/detail/:exerciseId', (req, res) => {
  try {
    const { exerciseId } = req.params;
    const exercise = getExerciseById(exerciseId);
    
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    
    res.json(exercise);
  } catch (error) {
    logger.error('Error fetching exercise details:', { error: error.message, exerciseId });
    res.status(500).json({ error: 'Failed to fetch exercise details' });
  }
});


module.exports = router;