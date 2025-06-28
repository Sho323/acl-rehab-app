const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../utils/auth');
const db = require('../config/database');
const logger = require('../utils/logger');

// 患者プロフィール取得
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;

    const query = `
      SELECT 
        p.*,
        h.name as hospital_name,
        h.address as hospital_address,
        h.phone as hospital_phone
      FROM patients p
      JOIN hospitals h ON p.hospital_id = h.id
      WHERE p.id = ?
    `;

    const [patients] = await db.execute(query, [patientId]);

    if (patients.length === 0) {
      return res.status(404).json({ message: '患者データが見つかりません' });
    }

    const patient = patients[0];
    
    // パスワードを除外
    delete patient.password;

    res.json({
      success: true,
      data: patient
    });

  } catch (error) {
    logger.error('患者プロフィール取得エラー:', error);
    res.status(500).json({ 
      message: 'プロフィール情報の取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 患者プロフィール更新
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { 
      name, 
      email, 
      phone, 
      date_of_birth, 
      gender, 
      height, 
      weight, 
      sport, 
      target_return_date, 
      emergency_contact_name,
      emergency_contact_phone 
    } = req.body;

    const updateQuery = `
      UPDATE patients 
      SET 
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        date_of_birth = COALESCE(?, date_of_birth),
        gender = COALESCE(?, gender),
        height = COALESCE(?, height),
        weight = COALESCE(?, weight),
        sport = COALESCE(?, sport),
        target_return_date = COALESCE(?, target_return_date),
        emergency_contact_name = COALESCE(?, emergency_contact_name),
        emergency_contact_phone = COALESCE(?, emergency_contact_phone),
        updated_at = NOW()
      WHERE id = ?
    `;

    await db.execute(updateQuery, [
      name,
      email,
      phone,
      date_of_birth,
      gender,
      height,
      weight,
      sport,
      target_return_date,
      emergency_contact_name,
      emergency_contact_phone,
      patientId
    ]);

    logger.info(`患者プロフィール更新: patient_id=${patientId}`);

    res.json({
      success: true,
      message: 'プロフィールが更新されました'
    });

  } catch (error) {
    logger.error('患者プロフィール更新エラー:', error);
    res.status(500).json({ 
      message: 'プロフィールの更新に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 現在のリハビリフェーズ取得
router.get('/phase', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;

    const query = `
      SELECT 
        current_phase,
        surgery_date,
        target_return_date,
        updated_at
      FROM patients 
      WHERE id = ?
    `;

    const [patients] = await db.execute(query, [patientId]);

    if (patients.length === 0) {
      return res.status(404).json({ message: '患者データが見つかりません' });
    }

    const patient = patients[0];
    const phaseInfo = calculatePhaseInfo(patient.current_phase, patient.surgery_date);

    res.json({
      success: true,
      data: {
        currentPhase: patient.current_phase,
        surgeryDate: patient.surgery_date,
        targetReturnDate: patient.target_return_date,
        phaseInfo,
        lastUpdated: patient.updated_at
      }
    });

  } catch (error) {
    logger.error('フェーズ情報取得エラー:', error);
    res.status(500).json({ 
      message: 'フェーズ情報の取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// リハビリフェーズ更新（通常は医療従事者が行うが、デモ用に患者も可能）
router.put('/phase', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { phase } = req.body;

    const validPhases = [
      'pre_surgery',
      'post_surgery_early',
      'phase_3_1',
      'phase_3_2',
      'phase_3_3',
      'phase_3_4',
      'completed'
    ];

    if (!validPhases.includes(phase)) {
      return res.status(400).json({ message: '無効なフェーズです' });
    }

    const updateQuery = `
      UPDATE patients 
      SET current_phase = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await db.execute(updateQuery, [phase, patientId]);

    // フェーズ変更履歴を記録
    const historyQuery = `
      INSERT INTO phase_progression_history (
        patient_id,
        from_phase,
        to_phase,
        changed_by_type,
        changed_by_id,
        notes
      ) VALUES (?, (SELECT current_phase FROM patients WHERE id = ?), ?, 'patient', ?, 'Patient self-updated')
    `;

    await db.execute(historyQuery, [patientId, patientId, phase, patientId]);

    logger.info(`フェーズ更新: patient_id=${patientId}, new_phase=${phase}`);

    res.json({
      success: true,
      message: 'リハビリフェーズが更新されました',
      data: {
        newPhase: phase,
        updatedAt: new Date()
      }
    });

  } catch (error) {
    logger.error('フェーズ更新エラー:', error);
    res.status(500).json({ 
      message: 'フェーズの更新に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 患者の目標設定
router.get('/goals', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;

    const query = `
      SELECT *
      FROM patient_goals
      WHERE patient_id = ? AND is_active = true
      ORDER BY target_date ASC
    `;

    const [goals] = await db.execute(query, [patientId]);

    res.json({
      success: true,
      data: goals
    });

  } catch (error) {
    logger.error('目標取得エラー:', error);
    res.status(500).json({ 
      message: '目標の取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 目標設定
router.post('/goals', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { title, description, target_date, category } = req.body;

    if (!title || !target_date) {
      return res.status(400).json({ message: 'タイトルと目標日は必須です' });
    }

    const insertQuery = `
      INSERT INTO patient_goals (
        patient_id,
        title,
        description,
        target_date,
        category,
        status
      ) VALUES (?, ?, ?, ?, ?, 'active')
    `;

    const [result] = await db.execute(insertQuery, [
      patientId,
      title,
      description,
      target_date,
      category || 'general'
    ]);

    logger.info(`目標設定: patient_id=${patientId}, goal_id=${result.insertId}`);

    res.json({
      success: true,
      data: {
        goalId: result.insertId,
        message: '目標が設定されました'
      }
    });

  } catch (error) {
    logger.error('目標設定エラー:', error);
    res.status(500).json({ 
      message: '目標の設定に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 目標更新
router.put('/goals/:goalId', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { goalId } = req.params;
    const { title, description, target_date, status, progress } = req.body;

    const updateQuery = `
      UPDATE patient_goals 
      SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        target_date = COALESCE(?, target_date),
        status = COALESCE(?, status),
        progress = COALESCE(?, progress),
        updated_at = NOW()
      WHERE id = ? AND patient_id = ?
    `;

    const [result] = await db.execute(updateQuery, [
      title,
      description,
      target_date,
      status,
      progress,
      goalId,
      patientId
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '目標が見つかりません' });
    }

    logger.info(`目標更新: patient_id=${patientId}, goal_id=${goalId}`);

    res.json({
      success: true,
      message: '目標が更新されました'
    });

  } catch (error) {
    logger.error('目標更新エラー:', error);
    res.status(500).json({ 
      message: '目標の更新に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 患者設定取得
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;

    const query = `
      SELECT settings
      FROM patient_preferences
      WHERE patient_id = ?
    `;

    const [preferences] = await db.execute(query, [patientId]);

    let settings = {};
    if (preferences.length > 0) {
      try {
        settings = JSON.parse(preferences[0].settings);
      } catch (error) {
        logger.warn('設定データのパースに失敗:', error);
      }
    }

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    logger.error('設定取得エラー:', error);
    res.status(500).json({ 
      message: '設定の取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 患者設定更新
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const settings = req.body;

    const upsertQuery = `
      INSERT INTO patient_preferences (patient_id, settings)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        settings = VALUES(settings),
        updated_at = NOW()
    `;

    await db.execute(upsertQuery, [patientId, JSON.stringify(settings)]);

    logger.info(`設定更新: patient_id=${patientId}`);

    res.json({
      success: true,
      message: '設定が更新されました'
    });

  } catch (error) {
    logger.error('設定更新エラー:', error);
    res.status(500).json({ 
      message: '設定の更新に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// フェーズ情報計算
function calculatePhaseInfo(currentPhase, surgeryDate) {
  const phaseMap = {
    'pre_surgery': {
      title: '術前期',
      description: '手術前の準備期間',
      order: 0,
      color: '#FF9800',
      expectedDuration: null
    },
    'post_surgery_early': {
      title: '術直後期',
      description: '手術直後〜2週間',
      order: 1,
      color: '#F44336',
      expectedDuration: 14
    },
    'phase_3_1': {
      title: '基礎回復期',
      description: '2〜6週間',
      order: 2,
      color: '#2196F3',
      expectedDuration: 28
    },
    'phase_3_2': {
      title: '筋力強化期',
      description: '6〜12週間',
      order: 3,
      color: '#4CAF50',
      expectedDuration: 42
    },
    'phase_3_3': {
      title: '機能訓練期',
      description: '3〜6ヶ月',
      order: 4,
      color: '#9C27B0',
      expectedDuration: 90
    },
    'phase_3_4': {
      title: '競技復帰期',
      description: '6〜12ヶ月',
      order: 5,
      color: '#E91E63',
      expectedDuration: 180
    },
    'completed': {
      title: '完了',
      description: '競技復帰達成',
      order: 6,
      color: '#4CAF50',
      expectedDuration: null
    }
  };

  const phase = phaseMap[currentPhase] || phaseMap['pre_surgery'];
  const totalPhases = 7;
  const progress = phase.order / (totalPhases - 1);

  let daysSinceSurgery = null;
  if (surgeryDate) {
    daysSinceSurgery = Math.floor((Date.now() - new Date(surgeryDate).getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    ...phase,
    progress,
    daysSinceSurgery,
    totalPhases
  };
}

module.exports = router;