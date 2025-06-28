const express = require('express');
const Joi = require('joi');
const { hashPassword, verifyPassword, generateToken, authenticateToken } = require('../utils/auth');
const Patient = require('../models/Patient');
const logger = require('../utils/logger');

const router = express.Router();

// バリデーションスキーマ
const loginSchema = Joi.object({
  patientNumber: Joi.string().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  patientNumber: Joi.string().required(),
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).required(),
  dateOfBirth: Joi.date().required(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  hospitalId: Joi.string().uuid().required()
});

/**
 * 患者ログイン
 * POST /auth/login
 */
router.post('/login', async (req, res) => {
  try {
    // リクエストデータの検証
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const { patientNumber, password } = value;

    // 患者の検索
    const patient = await Patient.findByPatientNumber(patientNumber);
    if (!patient) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // パスワード検証
    const isValidPassword = await verifyPassword(password, patient.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // JWTトークン生成
    const token = generateToken({
      id: patient.id,
      patientNumber: patient.patient_number,
      name: patient.name,
      role: 'patient',
      hospitalId: patient.hospital_id
    });

    // 最終ログイン時刻を更新
    await Patient.updateLastLogin(patient.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: patient.id,
        patientNumber: patient.patient_number,
        name: patient.name,
        currentPhase: patient.current_phase,
        surgeryDate: patient.surgery_date
      }
    });

  } catch (error) {
    logger.error('Login error:', { 
      error: error.message, 
      patientNumber,
      ip: req.ip 
    });
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * 患者登録（管理者用）
 * POST /auth/register
 */
router.post('/register', async (req, res) => {
  try {
    // リクエストデータの検証
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const { patientNumber, name, email, password, dateOfBirth, gender, hospitalId } = value;

    // 既存患者の確認
    const existingPatient = await Patient.findByPatientNumber(patientNumber);
    if (existingPatient) {
      return res.status(409).json({
        error: 'Patient number already exists'
      });
    }

    if (email) {
      const existingEmail = await Patient.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({
          error: 'Email already exists'
        });
      }
    }

    // パスワードのハッシュ化
    const passwordHash = await hashPassword(password);

    // 患者の作成
    const newPatient = await Patient.create({
      patient_number: patientNumber,
      name,
      email: email || null,
      password_hash: passwordHash,
      date_of_birth: dateOfBirth,
      gender: gender || null,
      hospital_id: hospitalId,
      current_phase: 'pre_surgery'
    });

    res.status(201).json({
      message: 'Patient registered successfully',
      patient: {
        id: newPatient.id,
        patientNumber: newPatient.patient_number,
        name: newPatient.name,
        currentPhase: newPatient.current_phase
      }
    });

  } catch (error) {
    logger.error('Registration error:', { 
      error: error.message, 
      patientNumber,
      ip: req.ip 
    });
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * プロフィール取得
 * GET /auth/profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({
        error: 'Patient not found'
      });
    }

    res.json({
      user: patient
    });

  } catch (error) {
    logger.error('Profile error:', { 
      error: error.message, 
      userId: req.user?.id,
      ip: req.ip 
    });
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * ログアウト
 * POST /auth/logout
 */
router.post('/logout', authenticateToken, (req, res) => {
  // JWTはステートレスなので、クライアント側でトークンを削除
  res.json({
    message: 'Logout successful'
  });
});

module.exports = router;