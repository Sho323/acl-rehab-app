const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../utils/auth');
const db = require('../config/database');
const logger = require('../utils/logger');

// 患者の進捗データを取得
router.get('/', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;

    // 基本の進捗情報
    const progressQuery = `
      SELECT 
        p.id,
        p.name,
        p.current_phase,
        p.surgery_date,
        p.target_return_date,
        COUNT(er.id) as total_sessions,
        AVG(er.pain_level) as avg_pain_level,
        AVG(er.fatigue_level) as avg_fatigue_level,
        MAX(er.created_at) as last_session_date
      FROM patients p
      LEFT JOIN exercise_records er ON p.id = er.patient_id
      WHERE p.id = ?
      GROUP BY p.id
    `;

    const [progressRows] = await db.execute(progressQuery, [patientId]);
    
    if (progressRows.length === 0) {
      return res.status(404).json({ message: '患者データが見つかりません' });
    }

    const progressData = progressRows[0];

    // 週次統計を取得
    const weeklyStatsQuery = `
      SELECT 
        DATE(created_at) as session_date,
        COUNT(*) as sessions_count,
        AVG(pain_level) as avg_pain,
        AVG(fatigue_level) as avg_fatigue,
        SUM(duration_minutes) as total_minutes
      FROM exercise_records 
      WHERE patient_id = ? 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 8 WEEK)
      GROUP BY DATE(created_at)
      ORDER BY session_date DESC
    `;

    const [weeklyStats] = await db.execute(weeklyStatsQuery, [patientId]);

    // 運動カテゴリ別統計
    const categoryStatsQuery = `
      SELECT 
        ec.name as category_name,
        COUNT(er.id) as session_count,
        AVG(er.pain_level) as avg_pain,
        SUM(er.duration_minutes) as total_minutes
      FROM exercise_records er
      JOIN exercises e ON er.exercise_id = e.id
      JOIN exercise_categories ec ON e.category_id = ec.id
      WHERE er.patient_id = ?
        AND er.created_at >= DATE_SUB(NOW(), INTERVAL 4 WEEK)
      GROUP BY ec.id, ec.name
      ORDER BY session_count DESC
    `;

    const [categoryStats] = await db.execute(categoryStatsQuery, [patientId]);

    // フェーズ進捗の計算
    const phaseProgress = calculatePhaseProgress(progressData.current_phase, progressData.surgery_date);

    res.json({
      success: true,
      data: {
        patient: progressData,
        phaseProgress,
        weeklyStats,
        categoryStats,
        summary: {
          totalSessions: progressData.total_sessions || 0,
          avgPainLevel: progressData.avg_pain_level || 0,
          avgFatigueLevel: progressData.avg_fatigue_level || 0,
          lastSessionDate: progressData.last_session_date,
        }
      }
    });

  } catch (error) {
    logger.error('進捗データ取得エラー:', error);
    res.status(500).json({ 
      message: '進捗データの取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 患者の詳細統計を取得
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { period = '4w' } = req.query; // 4w, 8w, 3m, 6m

    const periodDays = {
      '1w': 7,
      '4w': 28,
      '8w': 56,
      '3m': 90,
      '6m': 180
    };

    const days = periodDays[period] || 28;

    // 詳細統計クエリ
    const statsQuery = `
      SELECT 
        DATE(er.created_at) as date,
        COUNT(er.id) as sessions,
        AVG(er.pain_level) as avg_pain,
        AVG(er.fatigue_level) as avg_fatigue,
        SUM(er.duration_minutes) as total_duration,
        COUNT(DISTINCT er.exercise_id) as unique_exercises
      FROM exercise_records er
      WHERE er.patient_id = ?
        AND er.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(er.created_at)
      ORDER BY date ASC
    `;

    const [stats] = await db.execute(statsQuery, [patientId, days]);

    // 運動別統計
    const exerciseStatsQuery = `
      SELECT 
        e.name as exercise_name,
        COUNT(er.id) as completed_count,
        AVG(er.pain_level) as avg_pain,
        AVG(er.fatigue_level) as avg_fatigue,
        MAX(er.created_at) as last_completed
      FROM exercise_records er
      JOIN exercises e ON er.exercise_id = e.id
      WHERE er.patient_id = ?
        AND er.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY e.id, e.name
      ORDER BY completed_count DESC
    `;

    const [exerciseStats] = await db.execute(exerciseStatsQuery, [patientId, days]);

    res.json({
      success: true,
      data: {
        period,
        dailyStats: stats,
        exerciseStats,
        trends: calculateTrends(stats)
      }
    });

  } catch (error) {
    logger.error('統計データ取得エラー:', error);
    res.status(500).json({ 
      message: '統計データの取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 進捗履歴を取得
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { limit = 50, offset = 0 } = req.query;

    const historyQuery = `
      SELECT 
        er.*,
        e.name as exercise_name,
        ec.name as category_name
      FROM exercise_records er
      JOIN exercises e ON er.exercise_id = e.id
      JOIN exercise_categories ec ON e.category_id = ec.id
      WHERE er.patient_id = ?
      ORDER BY er.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [history] = await db.execute(historyQuery, [patientId, parseInt(limit), parseInt(offset)]);

    // 総レコード数を取得
    const countQuery = `
      SELECT COUNT(*) as total
      FROM exercise_records 
      WHERE patient_id = ?
    `;

    const [countResult] = await db.execute(countQuery, [patientId]);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        history,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < total
        }
      }
    });

  } catch (error) {
    logger.error('履歴データ取得エラー:', error);
    res.status(500).json({ 
      message: '履歴データの取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// フェーズ進捗の計算
function calculatePhaseProgress(currentPhase, surgeryDate) {
  const phaseMap = {
    'pre_surgery': { order: 0, duration: null },
    'post_surgery_early': { order: 1, duration: 14 },
    'phase_3_1': { order: 2, duration: 28 },
    'phase_3_2': { order: 3, duration: 42 },
    'phase_3_3': { order: 4, duration: 90 },
    'phase_3_4': { order: 5, duration: 180 },
    'completed': { order: 6, duration: null }
  };

  const phase = phaseMap[currentPhase] || phaseMap['pre_surgery'];
  
  if (!surgeryDate || !phase.duration) {
    return {
      phase: currentPhase,
      progress: phase.order / 6,
      daysInPhase: null,
      expectedDuration: phase.duration
    };
  }

  const daysSinceSurgery = Math.floor((Date.now() - new Date(surgeryDate).getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    phase: currentPhase,
    progress: phase.order / 6,
    daysInPhase: daysSinceSurgery,
    expectedDuration: phase.duration
  };
}

// トレンド計算
function calculateTrends(stats) {
  if (stats.length < 2) {
    return {
      painTrend: 'stable',
      fatigueTrend: 'stable',
      sessionTrend: 'stable'
    };
  }

  const recent = stats.slice(-7); // 最近7日
  const previous = stats.slice(-14, -7); // 前の7日

  const recentPain = recent.reduce((sum, day) => sum + (day.avg_pain || 0), 0) / recent.length;
  const previousPain = previous.length > 0 ? previous.reduce((sum, day) => sum + (day.avg_pain || 0), 0) / previous.length : recentPain;

  const recentFatigue = recent.reduce((sum, day) => sum + (day.avg_fatigue || 0), 0) / recent.length;
  const previousFatigue = previous.length > 0 ? previous.reduce((sum, day) => sum + (day.avg_fatigue || 0), 0) / previous.length : recentFatigue;

  const recentSessions = recent.reduce((sum, day) => sum + (day.sessions || 0), 0) / recent.length;
  const previousSessions = previous.length > 0 ? previous.reduce((sum, day) => sum + (day.sessions || 0), 0) / previous.length : recentSessions;

  return {
    painTrend: recentPain < previousPain ? 'improving' : recentPain > previousPain ? 'worsening' : 'stable',
    fatigueTrend: recentFatigue < previousFatigue ? 'improving' : recentFatigue > previousFatigue ? 'worsening' : 'stable',
    sessionTrend: recentSessions > previousSessions ? 'increasing' : recentSessions < previousSessions ? 'decreasing' : 'stable'
  };
}

module.exports = router;