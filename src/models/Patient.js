const db = require('../config/database');

class Patient {
  /**
   * 患者IDで患者情報を取得
   */
  static async findById(id) {
    const patient = await db('patients')
      .select('*')
      .where({ id, is_active: true })
      .first();
    
    if (patient) {
      // パスワードハッシュを除外
      delete patient.password_hash;
    }
    
    return patient;
  }

  /**
   * 患者番号で患者情報を取得
   */
  static async findByPatientNumber(patientNumber) {
    return await db('patients')
      .select('*')
      .where({ patient_number: patientNumber, is_active: true })
      .first();
  }

  /**
   * メールアドレスで患者情報を取得
   */
  static async findByEmail(email) {
    return await db('patients')
      .select('*')
      .where({ email, is_active: true })
      .first();
  }

  /**
   * 新しい患者を作成
   */
  static async create(patientData) {
    const [patient] = await db('patients')
      .insert(patientData)
      .returning('*');
    
    // パスワードハッシュを除外
    delete patient.password_hash;
    return patient;
  }

  /**
   * 患者情報を更新
   */
  static async update(id, updates) {
    const [patient] = await db('patients')
      .where({ id, is_active: true })
      .update({
        ...updates,
        updated_at: db.fn.now()
      })
      .returning('*');
    
    if (patient) {
      delete patient.password_hash;
    }
    
    return patient;
  }

  /**
   * 最終ログイン時刻を更新
   */
  static async updateLastLogin(id) {
    await db('patients')
      .where({ id })
      .update({ last_login_at: db.fn.now() });
  }

  /**
   * 病院IDで患者一覧を取得（医療従事者用）
   */
  static async findByHospitalId(hospitalId, limit = 50, offset = 0) {
    return await db('patients')
      .select('id', 'patient_number', 'name', 'current_phase', 'surgery_date', 'last_login_at')
      .where({ hospital_id: hospitalId, is_active: true })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }
}

module.exports = Patient;