const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../utils/auth');
const db = require('../config/database');
const logger = require('../utils/logger');

// 医療従事者一覧を取得
router.get('/staff', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;

    // 患者に割り当てられた医療従事者を取得
    const query = `
      SELECT 
        ms.id,
        ms.name,
        ms.role,
        ms.department,
        ms.email,
        ms.phone,
        ms.specialization,
        h.name as hospital_name,
        h.phone as hospital_phone,
        h.address as hospital_address
      FROM medical_staff ms
      JOIN patients p ON ms.hospital_id = p.hospital_id
      JOIN hospitals h ON ms.hospital_id = h.id
      WHERE p.id = ?
      ORDER BY 
        CASE ms.role 
          WHEN 'doctor' THEN 1
          WHEN 'physiotherapist' THEN 2
          WHEN 'nurse' THEN 3
          ELSE 4
        END,
        ms.name
    `;

    const [staff] = await db.execute(query, [patientId]);

    res.json({
      success: true,
      data: staff
    });

  } catch (error) {
    logger.error('医療従事者一覧取得エラー:', error);
    res.status(500).json({ 
      message: '医療従事者情報の取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// メッセージ送信
router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { recipientId, subject, message, priority = 'normal', attachments } = req.body;

    if (!recipientId || !message) {
      return res.status(400).json({ message: '受信者とメッセージ内容は必須です' });
    }

    // 受信者が患者の担当医療従事者かチェック
    const staffQuery = `
      SELECT ms.id, ms.name, ms.role
      FROM medical_staff ms
      JOIN patients p ON ms.hospital_id = p.hospital_id
      WHERE ms.id = ? AND p.id = ?
    `;

    const [staffResult] = await db.execute(staffQuery, [recipientId, patientId]);

    if (staffResult.length === 0) {
      return res.status(403).json({ message: '指定された医療従事者にメッセージを送信する権限がありません' });
    }

    // メッセージを保存
    const insertQuery = `
      INSERT INTO messages (
        sender_type,
        sender_id,
        recipient_type,
        recipient_id,
        subject,
        message,
        priority,
        attachments,
        status
      ) VALUES ('patient', ?, 'medical_staff', ?, ?, ?, ?, ?, 'sent')
    `;

    const [result] = await db.execute(insertQuery, [
      patientId,
      recipientId,
      subject,
      message,
      priority,
      attachments ? JSON.stringify(attachments) : null
    ]);

    const messageId = result.insertId;

    logger.info(`メッセージ送信: patient_id=${patientId}, recipient_id=${recipientId}, message_id=${messageId}`);

    res.json({
      success: true,
      data: {
        messageId,
        recipient: staffResult[0],
        sentAt: new Date()
      }
    });

  } catch (error) {
    logger.error('メッセージ送信エラー:', error);
    res.status(500).json({ 
      message: 'メッセージの送信に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// メッセージ履歴を取得
router.get('/messages', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { limit = 20, offset = 0, staffId } = req.query;

    let query = `
      SELECT 
        m.*,
        CASE 
          WHEN m.sender_type = 'patient' THEN p.name
          WHEN m.sender_type = 'medical_staff' THEN ms_sender.name
        END as sender_name,
        CASE 
          WHEN m.recipient_type = 'patient' THEN p.name
          WHEN m.recipient_type = 'medical_staff' THEN ms_recipient.name
        END as recipient_name,
        ms_sender.role as sender_role,
        ms_recipient.role as recipient_role
      FROM messages m
      LEFT JOIN patients p ON (m.sender_type = 'patient' AND m.sender_id = p.id) 
                           OR (m.recipient_type = 'patient' AND m.recipient_id = p.id)
      LEFT JOIN medical_staff ms_sender ON m.sender_type = 'medical_staff' AND m.sender_id = ms_sender.id
      LEFT JOIN medical_staff ms_recipient ON m.recipient_type = 'medical_staff' AND m.recipient_id = ms_recipient.id
      WHERE (m.sender_type = 'patient' AND m.sender_id = ?)
         OR (m.recipient_type = 'patient' AND m.recipient_id = ?)
    `;

    const params = [patientId, patientId];

    if (staffId) {
      query += ` AND ((m.sender_type = 'medical_staff' AND m.sender_id = ?)
                     OR (m.recipient_type = 'medical_staff' AND m.recipient_id = ?))`;
      params.push(staffId, staffId);
    }

    query += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [messages] = await db.execute(query, params);

    // 未読メッセージを既読にマーク
    const unreadIds = messages
      .filter(msg => msg.recipient_type === 'patient' && msg.recipient_id === patientId && msg.status === 'sent')
      .map(msg => msg.id);

    if (unreadIds.length > 0) {
      const updateQuery = `
        UPDATE messages 
        SET status = 'read', read_at = NOW()
        WHERE id IN (${unreadIds.map(() => '?').join(',')})
      `;
      await db.execute(updateQuery, unreadIds);
    }

    // 総数を取得
    let countQuery = `
      SELECT COUNT(*) as total
      FROM messages m
      WHERE (m.sender_type = 'patient' AND m.sender_id = ?)
         OR (m.recipient_type = 'patient' AND m.recipient_id = ?)
    `;
    const countParams = [patientId, patientId];

    if (staffId) {
      countQuery += ` AND ((m.sender_type = 'medical_staff' AND m.sender_id = ?)
                          OR (m.recipient_type = 'medical_staff' AND m.recipient_id = ?))`;
      countParams.push(staffId, staffId);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < total
        }
      }
    });

  } catch (error) {
    logger.error('メッセージ履歴取得エラー:', error);
    res.status(500).json({ 
      message: 'メッセージ履歴の取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 進捗レポート送信
router.post('/reports', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { recipientIds, reportType, period, includeExercises, includeAI, includeProgress, notes } = req.body;

    if (!recipientIds || recipientIds.length === 0) {
      return res.status(400).json({ message: '送信先を選択してください' });
    }

    // レポートデータを生成
    const reportData = await generateProgressReport(patientId, reportType, period, {
      includeExercises,
      includeAI,
      includeProgress
    });

    // 各受信者にレポートを送信
    const reportPromises = recipientIds.map(async (recipientId) => {
      const insertQuery = `
        INSERT INTO reports (
          patient_id,
          medical_staff_id,
          report_type,
          period,
          report_data,
          notes,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, 'sent')
      `;

      const [result] = await db.execute(insertQuery, [
        patientId,
        recipientId,
        reportType,
        period,
        JSON.stringify(reportData),
        notes
      ]);

      return result.insertId;
    });

    const reportIds = await Promise.all(reportPromises);

    logger.info(`進捗レポート送信: patient_id=${patientId}, report_ids=[${reportIds.join(', ')}]`);

    res.json({
      success: true,
      data: {
        reportIds,
        recipientCount: recipientIds.length,
        sentAt: new Date()
      }
    });

  } catch (error) {
    logger.error('進捗レポート送信エラー:', error);
    res.status(500).json({ 
      message: '進捗レポートの送信に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 送信済みレポート一覧を取得
router.get('/reports', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { limit = 10, offset = 0 } = req.query;

    const query = `
      SELECT 
        r.*,
        ms.name as recipient_name,
        ms.role as recipient_role
      FROM reports r
      JOIN medical_staff ms ON r.medical_staff_id = ms.id
      WHERE r.patient_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [reports] = await db.execute(query, [patientId, parseInt(limit), parseInt(offset)]);

    // 総数を取得
    const countQuery = 'SELECT COUNT(*) as total FROM reports WHERE patient_id = ?';
    const [countResult] = await db.execute(countQuery, [patientId]);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < total
        }
      }
    });

  } catch (error) {
    logger.error('レポート一覧取得エラー:', error);
    res.status(500).json({ 
      message: 'レポート一覧の取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 通知を取得
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    let query = `
      SELECT 
        n.*,
        ms.name as sender_name,
        ms.role as sender_role
      FROM notifications n
      LEFT JOIN medical_staff ms ON n.sender_id = ms.id AND n.sender_type = 'medical_staff'
      WHERE n.recipient_type = 'patient' AND n.recipient_id = ?
    `;

    const params = [patientId];

    if (unreadOnly === 'true') {
      query += ' AND n.status = ?';
      params.push('unread');
    }

    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [notifications] = await db.execute(query, params);

    res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    logger.error('通知取得エラー:', error);
    res.status(500).json({ 
      message: '通知の取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 通知を既読にする
router.put('/notifications/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { notificationId } = req.params;

    const updateQuery = `
      UPDATE notifications 
      SET status = 'read', read_at = NOW()
      WHERE id = ? AND recipient_type = 'patient' AND recipient_id = ?
    `;

    const [result] = await db.execute(updateQuery, [notificationId, patientId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '通知が見つかりません' });
    }

    res.json({
      success: true,
      message: '通知を既読にしました'
    });

  } catch (error) {
    logger.error('通知既読エラー:', error);
    res.status(500).json({ 
      message: '通知の更新に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 進捗レポート生成
async function generateProgressReport(patientId, reportType, period, options) {
  const reportData = {
    patientInfo: {},
    summary: {},
    exercises: [],
    aiAnalysis: [],
    progress: {}
  };

  // 患者情報を取得
  const patientQuery = `
    SELECT name, current_phase, surgery_date, target_return_date
    FROM patients 
    WHERE id = ?
  `;
  const [patientResult] = await db.execute(patientQuery, [patientId]);
  reportData.patientInfo = patientResult[0];

  // 期間の設定
  const periodDays = {
    '1w': 7,
    '2w': 14,
    '1m': 30,
    '3m': 90
  };
  const days = periodDays[period] || 30;

  // サマリー情報
  const summaryQuery = `
    SELECT 
      COUNT(*) as total_sessions,
      AVG(pain_level) as avg_pain,
      AVG(fatigue_level) as avg_fatigue,
      SUM(duration_minutes) as total_duration
    FROM exercise_records
    WHERE patient_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
  `;
  const [summaryResult] = await db.execute(summaryQuery, [patientId, days]);
  reportData.summary = summaryResult[0];

  // 運動データ（オプション）
  if (options.includeExercises) {
    const exerciseQuery = `
      SELECT 
        e.name,
        COUNT(er.id) as completion_count,
        AVG(er.pain_level) as avg_pain,
        AVG(er.fatigue_level) as avg_fatigue
      FROM exercise_records er
      JOIN exercises e ON er.exercise_id = e.id
      WHERE er.patient_id = ? AND er.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY e.id, e.name
      ORDER BY completion_count DESC
    `;
    const [exerciseResult] = await db.execute(exerciseQuery, [patientId, days]);
    reportData.exercises = exerciseResult;
  }

  // AI分析データ（オプション）
  if (options.includeAI) {
    const aiQuery = `
      SELECT 
        overall_score,
        knee_in_score,
        toe_out_score,
        analyzed_at
      FROM ai_analysis_results
      WHERE patient_id = ? AND analysis_status = 'completed'
        AND analyzed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY analyzed_at DESC
    `;
    const [aiResult] = await db.execute(aiQuery, [patientId, days]);
    reportData.aiAnalysis = aiResult;
  }

  return reportData;
}

module.exports = router;