const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authenticateToken } = require('../utils/auth');
const db = require('../config/database');
const logger = require('../utils/logger');

// アップロードディレクトリの設定
const uploadDir = path.join(__dirname, '../../uploads/videos');

// アップロードディレクトリが存在しない場合は作成
const ensureUploadDir = async () => {
  try {
    await fs.access(uploadDir);
  } catch (error) {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

// multerの設定
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const patientId = req.user.patientId;
    const ext = path.extname(file.originalname);
    cb(null, `patient_${patientId}_${timestamp}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // ビデオファイルのみ許可
  const allowedMimeTypes = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('サポートされていないファイル形式です。MP4、MOV、AVI、WebMファイルのみアップロード可能です。'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB制限
  }
});

// 動画アップロード
router.post('/upload', authenticateToken, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '動画ファイルが選択されていません' });
    }

    const patientId = req.user.patientId;
    const { exerciseId, sessionId, notes } = req.body;

    // データベースに動画情報を保存
    const insertQuery = `
      INSERT INTO video_uploads (
        patient_id, 
        exercise_id, 
        session_id, 
        filename, 
        original_name, 
        file_path, 
        file_size, 
        mime_type,
        notes,
        upload_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'uploaded')
    `;

    const [result] = await db.execute(insertQuery, [
      patientId,
      exerciseId || null,
      sessionId || null,
      req.file.filename,
      req.file.originalname,
      req.file.path,
      req.file.size,
      req.file.mimetype,
      notes || null
    ]);

    const videoId = result.insertId;

    logger.info(`動画アップロード完了: patient_id=${patientId}, video_id=${videoId}, filename=${req.file.filename}`);

    res.json({
      success: true,
      data: {
        videoId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        uploadedAt: new Date()
      }
    });

  } catch (error) {
    logger.error('動画アップロードエラー:', error);
    
    // アップロードされたファイルを削除
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (deleteError) {
        logger.error('一時ファイル削除エラー:', deleteError);
      }
    }

    res.status(500).json({ 
      message: '動画のアップロードに失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 患者の動画一覧を取得
router.get('/', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { limit = 20, offset = 0, exerciseId } = req.query;

    let query = `
      SELECT 
        vu.*,
        e.name as exercise_name,
        aar.analysis_status,
        aar.knee_in_score,
        aar.toe_out_score,
        aar.overall_score
      FROM video_uploads vu
      LEFT JOIN exercises e ON vu.exercise_id = e.id
      LEFT JOIN ai_analysis_results aar ON vu.id = aar.video_id
      WHERE vu.patient_id = ?
    `;

    const params = [patientId];

    if (exerciseId) {
      query += ' AND vu.exercise_id = ?';
      params.push(exerciseId);
    }

    query += ' ORDER BY vu.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [videos] = await db.execute(query, params);

    // 総数を取得
    let countQuery = 'SELECT COUNT(*) as total FROM video_uploads WHERE patient_id = ?';
    const countParams = [patientId];

    if (exerciseId) {
      countQuery += ' AND exercise_id = ?';
      countParams.push(exerciseId);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < total
        }
      }
    });

  } catch (error) {
    logger.error('動画一覧取得エラー:', error);
    res.status(500).json({ 
      message: '動画一覧の取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 特定の動画情報を取得
router.get('/:videoId', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { videoId } = req.params;

    const query = `
      SELECT 
        vu.*,
        e.name as exercise_name,
        aar.analysis_status,
        aar.knee_in_score,
        aar.toe_out_score,
        aar.overall_score,
        aar.feedback,
        aar.analyzed_at
      FROM video_uploads vu
      LEFT JOIN exercises e ON vu.exercise_id = e.id
      LEFT JOIN ai_analysis_results aar ON vu.id = aar.video_id
      WHERE vu.id = ? AND vu.patient_id = ?
    `;

    const [videos] = await db.execute(query, [videoId, patientId]);

    if (videos.length === 0) {
      return res.status(404).json({ message: '動画が見つかりません' });
    }

    res.json({
      success: true,
      data: videos[0]
    });

  } catch (error) {
    logger.error('動画情報取得エラー:', error);
    res.status(500).json({ 
      message: '動画情報の取得に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 動画を削除
router.delete('/:videoId', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { videoId } = req.params;

    // 動画情報を取得
    const selectQuery = `
      SELECT file_path 
      FROM video_uploads 
      WHERE id = ? AND patient_id = ?
    `;

    const [videos] = await db.execute(selectQuery, [videoId, patientId]);

    if (videos.length === 0) {
      return res.status(404).json({ message: '動画が見つかりません' });
    }

    const filePath = videos[0].file_path;

    // データベースから削除
    const deleteQuery = `
      DELETE FROM video_uploads 
      WHERE id = ? AND patient_id = ?
    `;

    await db.execute(deleteQuery, [videoId, patientId]);

    // ファイルを削除
    try {
      await fs.unlink(filePath);
    } catch (fileError) {
      logger.warn('ファイル削除に失敗:', fileError);
    }

    logger.info(`動画削除完了: patient_id=${patientId}, video_id=${videoId}`);

    res.json({
      success: true,
      message: '動画が削除されました'
    });

  } catch (error) {
    logger.error('動画削除エラー:', error);
    res.status(500).json({ 
      message: '動画の削除に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 動画ファイルをストリーミング
router.get('/:videoId/stream', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.patientId;
    const { videoId } = req.params;

    // 動画情報を取得
    const query = `
      SELECT file_path, mime_type, original_name
      FROM video_uploads 
      WHERE id = ? AND patient_id = ?
    `;

    const [videos] = await db.execute(query, [videoId, patientId]);

    if (videos.length === 0) {
      return res.status(404).json({ message: '動画が見つかりません' });
    }

    const { file_path, mime_type, original_name } = videos[0];

    // ファイルの存在確認
    try {
      await fs.access(file_path);
    } catch (error) {
      logger.error('動画ファイルが見つかりません:', file_path);
      return res.status(404).json({ message: '動画ファイルが見つかりません' });
    }

    // ファイル情報を取得
    const stat = await fs.stat(file_path);
    const fileSize = stat.size;

    // Range request support
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mime_type,
      });

      const stream = require('fs').createReadStream(file_path, { start, end });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mime_type,
        'Content-Disposition': `inline; filename="${original_name}"`,
      });

      const stream = require('fs').createReadStream(file_path);
      stream.pipe(res);
    }

  } catch (error) {
    logger.error('動画ストリーミングエラー:', error);
    res.status(500).json({ 
      message: '動画の再生に失敗しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;