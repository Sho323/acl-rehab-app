/**
 * ランニング開始基準評価項目
 * 術後3ヶ月時点での評価項目
 */

export const runningStartCriteria = {
  title: 'ランニング開始基準評価',
  description: '術後3ヶ月時点での評価項目。すべての基準をクリアしてからランニングを開始してください。',
  evaluationPeriod: '術後12週以降',
  
  criteria: [
    {
      id: 'period',
      category: '期間',
      title: '術後12週以上経過していること',
      description: '手術から最低12週間が経過している必要があります',
      type: 'period_check',
      required: true,
      measurementMethod: '手術日からの経過日数',
      passingCriteria: '84日以上（12週間）',
      icon: '📅',
    },
    {
      id: 'pain_swelling',
      category: '症状',
      title: '日常活動で痛みや腫れがないこと',
      description: '歩行、階段昇降、日常動作において痛みや腫れが認められない',
      type: 'symptom_check',
      required: true,
      measurementMethod: 'VASスケール評価',
      passingCriteria: 'VAS 0-1/10（日常活動時）',
      icon: '🚫',
    },
    {
      id: 'knee_extension',
      category: 'ROM',
      title: '完全な膝伸展ROM',
      description: '膝関節の完全伸展（0°）が達成されている',
      type: 'rom_measurement',
      required: true,
      measurementMethod: 'ゴニオメーター測定',
      passingCriteria: '0°（完全伸展）',
      icon: '📐',
    },
    {
      id: 'knee_flexion',
      category: 'ROM',
      title: '膝屈曲ROM（健側との差）',
      description: '膝屈曲可動域が健側との差が許容範囲内である',
      type: 'rom_measurement',
      required: true,
      measurementMethod: 'ゴニオメーター測定（両側比較）',
      passingCriteria: '健側との差が5°から10°以内',
      icon: '📏',
    },
    {
      id: 'quadriceps_strength',
      category: '筋力',
      title: '大腿四頭筋筋力（健側の80%以上）',
      description: '大腿四頭筋の筋力が健側と比較して十分回復している',
      type: 'strength_test',
      required: true,
      measurementMethod: '筋力測定器または5RMレッグプレス',
      passingCriteria: '健側の80%以上',
      icon: '💪',
    },
    {
      id: 'single_leg_squat',
      category: '機能評価',
      title: '片脚スクワット（45°-60°、外反なし）',
      description: '良好なコントロールで片脚スクワットを実施できる',
      type: 'functional_test',
      required: true,
      measurementMethod: '動作観察・分析',
      passingCriteria: '45°-60°の範囲で外反なく10回実施可能',
      icon: '🏃',
    }
  ],
  
  // 評価結果の判定
  getEvaluationResult: (results) => {
    const totalCriteria = runningStartCriteria.criteria.length;
    const passedCriteria = results.filter(result => result.passed).length;
    const passRate = (passedCriteria / totalCriteria) * 100;
    
    return {
      totalCriteria,
      passedCriteria,
      passRate,
      canStartRunning: passedCriteria === totalCriteria,
      recommendation: getRecommendation(passedCriteria, totalCriteria)
    };
  }
};

const getRecommendation = (passed, total) => {
  if (passed === total) {
    return {
      level: 'success',
      title: 'ランニング開始可能',
      message: 'すべての基準をクリアしています。医療従事者の許可を得てランニングを開始できます。',
      nextSteps: [
        'トレッドミルでのウォーキングから開始',
        '段階的にランニング強度を上げる',
        '症状の変化を注意深く観察する'
      ]
    };
  } else if (passed >= total * 0.8) {
    return {
      level: 'warning',
      title: 'もう少しで開始可能',
      message: 'ほとんどの基準をクリアしています。未達成の項目を重点的に改善してください。',
      nextSteps: [
        '未達成項目の集中的なトレーニング',
        '2週間後の再評価',
        '医療従事者との相談'
      ]
    };
  } else {
    return {
      level: 'danger',
      title: 'ランニング開始は時期尚早',
      message: 'まだ多くの基準が未達成です。基礎的なトレーニングを継続してください。',
      nextSteps: [
        '基礎的な筋力・可動域訓練の継続',
        '4週間後の再評価',
        'リハビリテーション計画の見直し'
      ]
    };
  }
};

// 各基準の詳細情報
export const criteriaDetails = {
  period: {
    rationale: '組織の治癒と強度回復には最低12週間が必要とされています。',
    tips: '焦らず段階的な回復を心がけてください。',
  },
  pain_swelling: {
    rationale: '炎症や痛みがある状態でのランニングは再損傷のリスクを高めます。',
    tips: 'アイシング、適切な休息、抗炎症対策を継続してください。',
  },
  knee_extension: {
    rationale: '完全伸展の欠如は歩行やランニングの効率性を著しく低下させます。',
    tips: 'ヒールプロップス、膝裏伸展ストレッチを継続してください。',
  },
  knee_flexion: {
    rationale: 'ランニングには最低120°の屈曲可動域が必要とされています。',
    tips: 'ヒールスライド、自転車エクササイズを継続してください。',
  },
  quadriceps_strength: {
    rationale: '大腿四頭筋の筋力不足は膝の不安定性と再損傷リスクを高めます。',
    tips: 'レッグエクステンション、スクワット、レッグプレスを継続してください。',
  },
  single_leg_squat: {
    rationale: '片脚スクワットは機能的な筋力と動的安定性を評価する重要な指標です。',
    tips: '鏡を見ながらフォームを確認し、徐々に深く行ってください。',
  }
};

export default runningStartCriteria;