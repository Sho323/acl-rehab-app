const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/auth');
const { hashPassword } = require('../../src/utils/auth');

// Patient modelのモック
jest.mock('../../src/models/Patient');
const Patient = require('../../src/models/Patient');

// アプリのセットアップ
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const hashedPassword = await hashPassword('password123');
      const mockPatient = {
        id: 'patient-id',
        patient_number: 'P001',
        name: 'Test Patient',
        password_hash: hashedPassword,
        current_phase: 'pre_surgery',
        surgery_date: '2024-01-15',
        hospital_id: 'hospital-id'
      };

      Patient.findByPatientNumber.mockResolvedValue(mockPatient);
      Patient.updateLastLogin.mockResolvedValue();

      const response = await request(app)
        .post('/auth/login')
        .send({
          patientNumber: 'P001',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toEqual({
        id: 'patient-id',
        patientNumber: 'P001',
        name: 'Test Patient',
        currentPhase: 'pre_surgery',
        surgeryDate: '2024-01-15'
      });
      expect(Patient.updateLastLogin).toHaveBeenCalledWith('patient-id');
    });

    it('should reject invalid patient number', async () => {
      Patient.findByPatientNumber.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({
          patientNumber: 'INVALID',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject invalid password', async () => {
      const hashedPassword = await hashPassword('password123');
      const mockPatient = {
        id: 'patient-id',
        patient_number: 'P001',
        password_hash: hashedPassword
      };

      Patient.findByPatientNumber.mockResolvedValue(mockPatient);

      const response = await request(app)
        .post('/auth/login')
        .send({
          patientNumber: 'P001',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          patientNumber: 'P001'
          // missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should validate minimum password length', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          patientNumber: 'P001',
          password: '123' // too short
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('POST /auth/register', () => {
    it('should register new patient', async () => {
      Patient.findByPatientNumber.mockResolvedValue(null);
      Patient.findByEmail.mockResolvedValue(null);
      
      const mockCreatedPatient = {
        id: 'new-patient-id',
        patient_number: 'P002',
        name: 'New Patient',
        current_phase: 'pre_surgery'
      };
      
      Patient.create.mockResolvedValue(mockCreatedPatient);

      const response = await request(app)
        .post('/auth/register')
        .send({
          patientNumber: 'P002',
          name: 'New Patient',
          email: 'new@example.com',
          password: 'password123',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          hospitalId: 'hospital-id'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Patient registered successfully');
      expect(response.body.patient).toEqual({
        id: 'new-patient-id',
        patientNumber: 'P002',
        name: 'New Patient',
        currentPhase: 'pre_surgery'
      });
    });

    it('should reject duplicate patient number', async () => {
      const existingPatient = {
        id: 'existing-id',
        patient_number: 'P002'
      };
      
      Patient.findByPatientNumber.mockResolvedValue(existingPatient);

      const response = await request(app)
        .post('/auth/register')
        .send({
          patientNumber: 'P002',
          name: 'New Patient',
          email: 'new@example.com',
          password: 'password123',
          dateOfBirth: '1990-01-01',
          hospitalId: 'hospital-id'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Patient number already exists');
    });

    it('should reject duplicate email', async () => {
      Patient.findByPatientNumber.mockResolvedValue(null);
      
      const existingPatient = {
        id: 'existing-id',
        email: 'existing@example.com'
      };
      
      Patient.findByEmail.mockResolvedValue(existingPatient);

      const response = await request(app)
        .post('/auth/register')
        .send({
          patientNumber: 'P003',
          name: 'New Patient',
          email: 'existing@example.com',
          password: 'password123',
          dateOfBirth: '1990-01-01',
          hospitalId: 'hospital-id'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          patientNumber: 'P002',
          // missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      // 有効なJWTトークンを生成
      const { generateToken } = require('../../src/utils/auth');
      const token = generateToken({
        id: 'patient-id',
        patientNumber: 'P001',
        role: 'patient'
      });

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });
});