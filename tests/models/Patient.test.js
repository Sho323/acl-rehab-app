const Patient = require('../../src/models/Patient');

// データベースモックを取得
const db = require('../../src/config/database');

describe('Patient Model', () => {
  
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find patient by id', async () => {
      const mockPatient = {
        id: 'test-id',
        patient_number: 'P001',
        name: 'Test Patient',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        is_active: true
      };

      db.first.mockResolvedValue(mockPatient);

      const result = await Patient.findById('test-id');

      expect(db).toHaveBeenCalledWith('patients');
      expect(db.select).toHaveBeenCalledWith('*');
      expect(db.where).toHaveBeenCalledWith({ id: 'test-id', is_active: true });
      expect(result).toEqual({
        id: 'test-id',
        patient_number: 'P001',
        name: 'Test Patient',
        email: 'test@example.com',
        is_active: true
        // password_hash should be removed
      });
      expect(result.password_hash).toBeUndefined();
    });

    it('should return null when patient not found', async () => {
      db.first.mockResolvedValue(null);

      const result = await Patient.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByPatientNumber', () => {
    it('should find patient by patient number', async () => {
      const mockPatient = {
        id: 'test-id',
        patient_number: 'P001',
        name: 'Test Patient',
        password_hash: 'hashed_password',
        is_active: true
      };

      db.first.mockResolvedValue(mockPatient);

      const result = await Patient.findByPatientNumber('P001');

      expect(db).toHaveBeenCalledWith('patients');
      expect(db.where).toHaveBeenCalledWith({ patient_number: 'P001', is_active: true });
      expect(result).toEqual(mockPatient);
    });
  });

  describe('create', () => {
    it('should create new patient', async () => {
      const patientData = {
        patient_number: 'P002',
        name: 'New Patient',
        email: 'new@example.com',
        password_hash: 'hashed_password',
        hospital_id: 'hospital-id'
      };

      const mockCreatedPatient = {
        id: 'new-patient-id',
        ...patientData,
        created_at: new Date(),
        updated_at: new Date()
      };

      db.returning.mockResolvedValue([mockCreatedPatient]);

      const result = await Patient.create(patientData);

      expect(db).toHaveBeenCalledWith('patients');
      expect(db.insert).toHaveBeenCalledWith(patientData);
      expect(db.returning).toHaveBeenCalledWith('*');
      expect(result.password_hash).toBeUndefined();
      expect(result.id).toBe('new-patient-id');
    });
  });

  describe('update', () => {
    it('should update patient information', async () => {
      const updates = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const mockUpdatedPatient = {
        id: 'test-id',
        patient_number: 'P001',
        name: 'Updated Name',
        email: 'updated@example.com',
        password_hash: 'hashed_password',
        is_active: true
      };

      db.returning.mockResolvedValue([mockUpdatedPatient]);

      const result = await Patient.update('test-id', updates);

      expect(db).toHaveBeenCalledWith('patients');
      expect(db.where).toHaveBeenCalledWith({ id: 'test-id', is_active: true });
      expect(db.update).toHaveBeenCalledWith({
        ...updates,
        updated_at: expect.any(Date)
      });
      expect(result.password_hash).toBeUndefined();
    });

    it('should return null when patient not found', async () => {
      db.returning.mockResolvedValue([]);

      const result = await Patient.update('non-existent-id', { name: 'New Name' });

      expect(result).toBeUndefined();
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      await Patient.updateLastLogin('test-id');

      expect(db).toHaveBeenCalledWith('patients');
      expect(db.where).toHaveBeenCalledWith({ id: 'test-id' });
      expect(db.update).toHaveBeenCalledWith({
        last_login_at: expect.any(Date)
      });
    });
  });

  describe('findByHospitalId', () => {
    it('should find patients by hospital id with pagination', async () => {
      const mockPatients = [
        {
          id: 'patient-1',
          patient_number: 'P001',
          name: 'Patient One',
          current_phase: 'pre_surgery',
          surgery_date: '2024-01-15',
          last_login_at: new Date()
        },
        {
          id: 'patient-2',
          patient_number: 'P002',
          name: 'Patient Two',
          current_phase: 'phase_3_1',
          surgery_date: '2024-02-01',
          last_login_at: new Date()
        }
      ];

      db.limit.mockReturnValue({ offset: jest.fn().mockResolvedValue(mockPatients) });

      const result = await Patient.findByHospitalId('hospital-id', 50, 0);

      expect(db).toHaveBeenCalledWith('patients');
      expect(db.select).toHaveBeenCalledWith([
        'id', 'patient_number', 'name', 'current_phase', 'surgery_date', 'last_login_at'
      ]);
      expect(db.where).toHaveBeenCalledWith({ hospital_id: 'hospital-id', is_active: true });
      expect(db.orderBy).toHaveBeenCalledWith('created_at', 'desc');
      expect(db.limit).toHaveBeenCalledWith(50);
      expect(db.offset).toHaveBeenCalledWith(0);
      expect(result).toEqual(mockPatients);
    });
  });
});