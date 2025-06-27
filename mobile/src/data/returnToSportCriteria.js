/**
 * 競技復帰チェックリスト
 * 術後6ヶ月以降の競技復帰評価項目
 */

export const returnToSportCriteria = {
  title: '競技復帰チェックリスト',
  description: '術後6ヶ月以降の競技復帰に向けた総合評価項目。すべての基準をクリアしてから競技復帰を検討してください。',
  evaluationPeriod: '術後6ヶ月以降',
  
  categories: [
    {
      id: 'medical_clearance',
      title: '医学的クリアランス',
      description: '医療従事者による評価と許可',
      criteria: [
        {
          id: 'surgeon_clearance',
          title: '執刀医の復帰許可',
          description: '手術を行った医師からの競技復帰許可',
          type: 'medical_approval',
          required: true,
          measurementMethod: '医師による診察・評価',
          passingCriteria: '執刀医による競技復帰許可',
          icon: '👨‍⚕️',
          weight: 10, // 最重要
        },
        {
          id: 'pt_clearance',
          title: '理学療法士の評価クリア',
          description: '理学療法士による機能評価の合格',
          type: 'medical_approval',
          required: true,
          measurementMethod: '理学療法士による機能評価',
          passingCriteria: '理学療法士による復帰推奨',
          icon: '🤸‍♂️',
          weight: 8,
        }
      ]
    },
    {
      id: 'physical_function',
      title: '身体機能評価',
      description: '筋力・可動域・バランス等の身体機能',
      criteria: [
        {
          id: 'knee_rom',
          title: '膝関節可動域（完全回復）',
          description: '膝関節の屈曲・伸展可動域が健側と同等',
          type: 'rom_measurement',
          required: true,
          measurementMethod: 'ゴニオメーター測定',
          passingCriteria: '健側との差2°以内',
          icon: '📐',
          weight: 7,
        },
        {
          id: 'quadriceps_strength',
          title: '大腿四頭筋筋力（90%以上）',
          description: '大腿四頭筋筋力が健側の90%以上',
          type: 'strength_test',
          required: true,
          measurementMethod: '等尺性筋力測定',
          passingCriteria: '健側の90%以上',
          icon: '💪',
          weight: 9,
        },
        {
          id: 'hamstring_strength',
          title: 'ハムストリングス筋力（90%以上）',
          description: 'ハムストリングス筋力が健側の90%以上',
          type: 'strength_test',
          required: true,
          measurementMethod: '等尺性筋力測定',
          passingCriteria: '健側の90%以上',
          icon: '🦵',
          weight: 8,
        },
        {
          id: 'hamstring_quad_ratio',
          title: 'H/Q比（60%以上）',
          description: 'ハムストリングス/大腿四頭筋比が適正範囲',
          type: 'ratio_calculation',
          required: true,
          measurementMethod: '筋力測定値から算出',
          passingCriteria: '60%以上',
          icon: '⚖️',
          weight: 7,
        }
      ]
    },
    {
      id: 'functional_tests',
      title: '機能的テスト',
      description: 'ホップテスト・動作パフォーマンス評価',
      criteria: [
        {
          id: 'single_hop',
          title: 'シングルホップテスト（90%以上）',
          description: '片脚ホップ距離が健側の90%以上',
          type: 'hop_test',
          required: true,
          measurementMethod: '最大跳躍距離測定（3回の平均）',
          passingCriteria: '健側の90%以上',
          icon: '🦘',
          weight: 8,
        },
        {
          id: 'triple_hop',
          title: 'トリプルホップテスト（90%以上）',
          description: '3回連続ホップ距離が健側の90%以上',
          type: 'hop_test',
          required: true,
          measurementMethod: '3回連続跳躍距離測定',
          passingCriteria: '健側の90%以上',
          icon: '🏃‍♂️',
          weight: 8,
        },
        {
          id: 'crossover_hop',
          title: 'クロスオーバーホップテスト（90%以上）',
          description: '左右交互ホップ距離が健側の90%以上',
          type: 'hop_test',
          required: true,
          measurementMethod: '左右交互跳躍距離測定',
          passingCriteria: '健側の90%以上',
          icon: '↔️',
          weight: 8,
        },
        {
          id: 'timed_hop',
          title: '6mタイムドホップテスト（90%以上）',
          description: '6m片脚ホップタイムが健側の110%以内',
          type: 'hop_test',
          required: true,
          measurementMethod: '6m片脚ホップの時間測定',
          passingCriteria: '健側の110%以内（時間が短いほど良い）',
          icon: '⏱️',
          weight: 8,
        }
      ]
    },
    {
      id: 'movement_quality',
      title: '動作の質',
      description: '着地動作・動的バランス・協調性',
      criteria: [
        {
          id: 'landing_technique',
          title: '着地動作の質',
          description: 'ドロップジャンプでの適切な着地フォーム',
          type: 'movement_analysis',
          required: true,
          measurementMethod: '動作分析・観察評価',
          passingCriteria: '膝外反なし、体幹安定',
          icon: '🎯',
          weight: 9,
        },
        {
          id: 'cutting_movement',
          title: 'カッティング動作',
          description: '方向転換動作の適切な実施',
          type: 'movement_analysis',
          required: true,
          measurementMethod: '45°カッティング動作評価',
          passingCriteria: '膝外反なし、スムーズな動作',
          icon: '🔄',
          weight: 8,
        },
        {
          id: 'single_leg_squat_quality',
          title: '片脚スクワットの質',
          description: '片脚スクワット60°での動作品質',
          type: 'movement_analysis',
          required: true,
          measurementMethod: '片脚スクワット動作観察',
          passingCriteria: '膝外反なし、20回連続実施可能',
          icon: '🏋️‍♂️',
          weight: 7,
        }
      ]
    },
    {
      id: 'psychological_readiness',
      title: '心理的準備度',
      description: '競技復帰への心理的準備と恐怖心評価',
      criteria: [
        {
          id: 'acl_rsi_score',
          title: 'ACL-RSIスコア（≥56点）',
          description: 'ACL復帰スポーツ心理準備度評価',
          type: 'psychological_test',
          required: true,
          measurementMethod: 'ACL-RSI質問票（12項目）',
          passingCriteria: '56点以上（満点84点）',
          icon: '🧠',
          weight: 8,
        },
        {
          id: 'fear_avoidance',
          title: '恐怖回避行動の評価',
          description: '競技特異的動作への恐怖心の程度',
          type: 'psychological_assessment',
          required: true,
          measurementMethod: '心理的評価・面談',
          passingCriteria: '競技特異的動作への恐怖心が minimal',
          icon: '😰',
          weight: 7,
        },
        {
          id: 'confidence_level',
          title: '自信レベル',
          description: '競技復帰への自信と意欲',
          type: 'psychological_assessment',
          required: true,
          measurementMethod: 'VASスケール（0-10）',
          passingCriteria: '8/10以上',
          icon: '💪',
          weight: 6,
        }
      ]
    },
    {
      id: 'sport_specific',
      title: '競技特異的能力',
      description: '各競技に特化した技能と体力',
      criteria: [
        {
          id: 'sport_specific_skills',
          title: '競技特異的技能',
          description: '各競技の基本的な技術動作',
          type: 'skill_assessment',
          required: true,
          measurementMethod: '競技特異的動作評価',
          passingCriteria: '受傷前レベルの80%以上',
          icon: '⚽',
          weight: 8,
        },
        {
          id: 'agility_performance',
          title: 'アジリティパフォーマンス',
          description: 'T-test、505アジリティテスト等',
          type: 'performance_test',
          required: true,
          measurementMethod: 'アジリティテスト実施',
          passingCriteria: '健側の95%以上',
          icon: '🏃‍♀️',
          weight: 8,
        },
        {
          id: 'plyometric_performance',
          title: 'プライオメトリック能力',
          description: '爆発的パワー・反応時間',
          type: 'performance_test',
          required: true,
          measurementMethod: 'プライオメトリックテスト',
          passingCriteria: '健側の90%以上',
          icon: '💥',
          weight: 7,
        }
      ]
    },
    {
      id: 'injury_prevention',
      title: '再損傷予防',
      description: '継続的なトレーニングと予防策',
      criteria: [
        {
          id: 'prevention_program',
          title: '予防プログラムの理解',
          description: 'FIFA11+等の予防プログラムの習得',
          type: 'education_assessment',
          required: true,
          measurementMethod: 'プログラム実技チェック',
          passingCriteria: '適切な実施が可能',
          icon: '🛡️',
          weight: 7,
        },
        {
          id: 'maintenance_plan',
          title: '維持トレーニング計画',
          description: '復帰後の継続的トレーニング計画',
          type: 'plan_assessment',
          required: true,
          measurementMethod: 'トレーニング計画書作成',
          passingCriteria: '具体的な計画が策定済み',
          icon: '📋',
          weight: 6,
        }
      ]
    }
  ],
  
  // 総合評価の算出
  getOverallEvaluation: (results) => {
    const allCriteria = returnToSportCriteria.categories.flatMap(cat => cat.criteria);
    const totalWeight = allCriteria.reduce((sum, criterion) => sum + criterion.weight, 0);
    
    let achievedWeight = 0;
    let passedCount = 0;
    let totalCount = allCriteria.length;
    
    allCriteria.forEach(criterion => {
      const result = results.find(r => r.id === criterion.id);
      if (result && result.passed) {
        achievedWeight += criterion.weight;
        passedCount++;
      }
    });
    
    const weightedScore = (achievedWeight / totalWeight) * 100;
    const passRate = (passedCount / totalCount) * 100;
    
    return {
      totalCriteria: totalCount,
      passedCriteria: passedCount,
      passRate,
      weightedScore,
      canReturnToSport: weightedScore >= 85 && passRate >= 90,
      recommendation: getReturnRecommendation(weightedScore, passRate)
    };
  }
};

const getReturnRecommendation = (weightedScore, passRate) => {
  if (weightedScore >= 85 && passRate >= 90) {
    return {
      level: 'success',
      title: '競技復帰可能',
      message: 'すべての主要基準をクリアしています。段階的な競技復帰を開始できます。',
      nextSteps: [
        '段階的な練習参加（練習強度50%から開始）',
        '2週間ごとの段階的強度向上',
        '4-6週間後の試合復帰検討',
        '継続的な予防トレーニング実施'
      ],
      returnPhase: 'phase_4_gradual_return'
    };
  } else if (weightedScore >= 75 && passRate >= 80) {
    return {
      level: 'warning',
      title: '条件付き復帰可能',
      message: '多くの基準をクリアしていますが、一部改善が必要です。',
      nextSteps: [
        '未達成項目の集中的改善',
        '4週間後の再評価',
        '医療従事者との詳細相談',
        '段階的復帰プログラムの調整'
      ],
      returnPhase: 'phase_3_final_preparation'
    };
  } else if (weightedScore >= 60 && passRate >= 70) {
    return {
      level: 'caution',
      title: '復帰準備継続',
      message: '基礎的な基準は満たしていますが、さらなる改善が必要です。',
      nextSteps: [
        '機能的トレーニングの強化',
        '心理的サポートの検討',
        '6-8週間後の再評価',
        '競技特異的訓練の強化'
      ],
      returnPhase: 'phase_3_advanced_training'
    };
  } else {
    return {
      level: 'danger',
      title: '復帰は時期尚早',
      message: '多くの重要な基準が未達成です。基礎的な能力向上に集中してください。',
      nextSteps: [
        '基礎的な筋力・機能訓練の継続',
        '段階的なプログラム進行',
        '8-12週間後の再評価',
        'リハビリテーション計画の見直し'
      ],
      returnPhase: 'phase_2_basic_training'
    };
  }
};

// カテゴリ別の重要度
export const categoryImportance = {
  medical_clearance: {
    importance: 'critical',
    description: '医学的許可は絶対条件です',
    mustPass: true
  },
  physical_function: {
    importance: 'high',
    description: '身体機能の回復は復帰の基礎です',
    mustPass: true
  },
  functional_tests: {
    importance: 'high',
    description: '機能的能力は競技パフォーマンスに直結します',
    mustPass: false
  },
  movement_quality: {
    importance: 'high',
    description: '動作の質は再損傷予防に重要です',
    mustPass: false
  },
  psychological_readiness: {
    importance: 'medium',
    description: '心理的準備は長期的成功に影響します',
    mustPass: false
  },
  sport_specific: {
    importance: 'medium',
    description: '競技特異的能力は段階的に改善可能です',
    mustPass: false
  },
  injury_prevention: {
    importance: 'medium',
    description: '予防知識は継続的な健康に重要です',
    mustPass: false
  }
};

export default returnToSportCriteria;