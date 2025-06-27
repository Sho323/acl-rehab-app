// ACL-RSI (ACL Return to Sport after Injury) 質問項目
// スポーツ復帰に向けた心理的準備度を評価する標準化された質問票

export const ACL_RSI_QUESTIONS = [
  {
    id: 1,
    category: 'emotion',
    question: 'スポーツに復帰することを考えると緊張しますか？',
    type: 'scale',
    scale: {
      min: 0,
      max: 10,
      minLabel: '全く緊張しない',
      maxLabel: '非常に緊張する'
    },
    reverse: true // スコア計算時に反転
  },
  {
    id: 2,
    category: 'confidence',
    question: '怪我をした動きでも、以前と同じようにできる自信がありますか？',
    type: 'scale',
    scale: {
      min: 0,
      max: 10,
      minLabel: '全く自信がない',
      maxLabel: '非常に自信がある'
    },
    reverse: false
  },
  {
    id: 3,
    category: 'emotion',
    question: 'スポーツに復帰することを考えると怖いですか？',
    type: 'scale',
    scale: {
      min: 0,
      max: 10,
      minLabel: '全く怖くない',
      maxLabel: '非常に怖い'
    },
    reverse: true
  },
  {
    id: 4,
    category: 'confidence',
    question: '怪我をする前と同じレベルでプレーできる自信がありますか？',
    type: 'scale',
    scale: {
      min: 0,
      max: 10,
      minLabel: '全く自信がない',
      maxLabel: '非常に自信がある'
    },
    reverse: false
  },
  {
    id: 5,
    category: 'confidence',
    question: '膝の調子について心配していますか？',
    type: 'scale',
    scale: {
      min: 0,
      max: 10,
      minLabel: '全く心配していない',
      maxLabel: '非常に心配している'
    },
    reverse: true
  },
  {
    id: 6,
    category: 'confidence',
    question: '膝に負担のかかる動作ができる自信がありますか？',
    type: 'scale',
    scale: {
      min: 0,
      max: 10,
      minLabel: '全く自信がない',
      maxLabel: '非常に自信がある'
    },
    reverse: false
  },
  {
    id: 7,
    category: 'emotion',
    question: '膝を再び怪我することを心配していますか？',
    type: 'scale',
    scale: {
      min: 0,
      max: 10,
      minLabel: '全く心配していない',
      maxLabel: '非常に心配している'
    },
    reverse: true
  },
  {
    id: 8,
    category: 'confidence',
    question: '思いっきりプレーができる自信がありますか？',
    type: 'scale',
    scale: {
      min: 0,
      max: 10,
      minLabel: '全く自信がない',
      maxLabel: '非常に自信がある'
    },
    reverse: false
  },
  {
    id: 9,
    category: 'confidence',
    question: 'スポーツの技術的な部分で以前と同じようにできる自信がありますか？',
    type: 'scale',
    scale: {
      min: 0,
      max: 10,
      minLabel: '全く自信がない',
      maxLabel: '非常に自信がある'
    },
    reverse: false
  },
  {
    id: 10,
    category: 'emotion',
    question: 'スポーツに復帰することを考えると不安になりますか？',
    type: 'scale',
    scale: {
      min: 0,
      max: 10,
      minLabel: '全く不安にならない',
      maxLabel: '非常に不安になる'
    },
    reverse: true
  },
  {
    id: 11,
    category: 'confidence',
    question: '競技中に膝について考えずにプレーできる自信がありますか？',
    type: 'scale',
    scale: {
      min: 0,
      max: 10,
      minLabel: '全く自信がない',
      maxLabel: '非常に自信がある'
    },
    reverse: false
  },
  {
    id: 12,
    category: 'confidence',
    question: '以前と同じように競技に集中できる自信がありますか？',
    type: 'scale',
    scale: {
      min: 0,
      max: 10,
      minLabel: '全く自信がない',
      maxLabel: '非常に自信がある'
    },
    reverse: false
  }
];

// カテゴリー別の質問数
export const CATEGORY_QUESTIONS = {
  emotion: ACL_RSI_QUESTIONS.filter(q => q.category === 'emotion'),
  confidence: ACL_RSI_QUESTIONS.filter(q => q.category === 'confidence')
};

// スコア解釈ガイドライン
export const SCORE_INTERPRETATION = {
  ranges: [
    {
      min: 0,
      max: 30,
      level: 'low',
      title: '準備度が低い',
      description: 'スポーツ復帰への心理的準備が不十分です',
      color: '#F44336',
      recommendations: [
        '心理的サポートが必要です',
        '段階的な復帰プログラムを検討してください',
        '不安や恐怖感について医療従事者と相談してください',
        '自信を回復するための特別なトレーニングが推奨されます'
      ]
    },
    {
      min: 31,
      max: 55,
      level: 'moderate_low',
      title: '準備度がやや低い',
      description: '心理的準備にまだ改善の余地があります',
      color: '#FF9800',
      recommendations: [
        '段階的な復帰を心がけてください',
        '不安な動作については十分な練習を積んでください',
        '医療従事者と定期的な相談を続けてください',
        'メンタルトレーニングを取り入れることを検討してください'
      ]
    },
    {
      min: 56,
      max: 75,
      level: 'moderate',
      title: '準備度が中程度',
      description: '基本的な心理的準備はできています',
      color: '#2196F3',
      recommendations: [
        '慎重にスポーツ復帰を進めてください',
        '不安な要素については重点的に取り組んでください',
        '医療従事者と復帰計画を詳細に検討してください',
        '競技特異的な練習を段階的に増やしてください'
      ]
    },
    {
      min: 76,
      max: 89,
      level: 'moderate_high',
      title: '準備度が高い',
      description: '心理的準備が良好な状態です',
      color: '#4CAF50',
      recommendations: [
        'スポーツ復帰に向けて良好な準備状態です',
        '最終的な身体機能評価を受けてください',
        '復帰後も定期的なフォローアップを継続してください',
        '段階的な競技レベルの向上を図ってください'
      ]
    },
    {
      min: 90,
      max: 100,
      level: 'high',
      title: '準備度が非常に高い',
      description: '心理的準備が十分に整っています',
      color: '#2E7D32',
      recommendations: [
        '心理的準備は十分に整っています',
        '医療従事者の最終確認を受けてスポーツ復帰してください',
        '復帰後も継続的なコンディション管理を行ってください',
        '他の選手への心理的サポートも検討してください'
      ]
    }
  ],
  
  // カテゴリー別の重み
  categoryWeights: {
    emotion: 0.4,
    confidence: 0.6
  }
};

// 評価完了後のアクションプラン
export const ACTION_PLANS = {
  low: {
    priority: 'high',
    actions: [
      {
        type: 'psychological_support',
        title: '心理的サポート',
        description: 'スポーツ心理学者またはカウンセラーとの面談を推奨',
        timeline: '即座に'
      },
      {
        type: 'gradual_program',
        title: '段階的復帰プログラム',
        description: '低強度から始める段階的なリハビリテーション',
        timeline: '数週間〜数ヶ月'
      },
      {
        type: 'confidence_building',
        title: '自信回復プログラム',
        description: '成功体験を積み重ねる特別なトレーニング',
        timeline: '継続的'
      }
    ]
  },
  moderate_low: {
    priority: 'medium_high',
    actions: [
      {
        type: 'mental_training',
        title: 'メンタルトレーニング',
        description: 'イメージトレーニングやリラクゼーション技法の習得',
        timeline: '4-6週間'
      },
      {
        type: 'specific_practice',
        title: '特定動作の反復練習',
        description: '不安な動作の段階的な習得',
        timeline: '継続的'
      },
      {
        type: 'regular_consultation',
        title: '定期相談',
        description: '医療従事者との定期的な面談',
        timeline: '週1回'
      }
    ]
  },
  moderate: {
    priority: 'medium',
    actions: [
      {
        type: 'sport_specific_training',
        title: '競技特異的トレーニング',
        description: '実際の競技に近い環境での練習',
        timeline: '2-4週間'
      },
      {
        type: 'return_planning',
        title: '復帰計画の策定',
        description: '詳細な段階的復帰スケジュールの作成',
        timeline: '1-2週間'
      },
      {
        type: 'peer_support',
        title: '仲間からのサポート',
        description: 'チームメイトや経験者との交流',
        timeline: '継続的'
      }
    ]
  },
  moderate_high: {
    priority: 'low_medium',
    actions: [
      {
        type: 'final_assessment',
        title: '最終評価',
        description: '身体機能と心理状態の最終チェック',
        timeline: '復帰前'
      },
      {
        type: 'return_monitoring',
        title: '復帰後モニタリング',
        description: '復帰後の状態継続観察',
        timeline: '復帰後3ヶ月'
      },
      {
        type: 'performance_optimization',
        title: 'パフォーマンス最適化',
        description: '競技パフォーマンスの段階的向上',
        timeline: '復帰後継続'
      }
    ]
  },
  high: {
    priority: 'low',
    actions: [
      {
        type: 'medical_clearance',
        title: '医療クリアランス',
        description: '医療従事者による最終許可',
        timeline: '復帰前'
      },
      {
        type: 'maintenance_program',
        title: '維持プログラム',
        description: '良好な状態を維持するためのプログラム',
        timeline: '継続的'
      },
      {
        type: 'mentorship',
        title: 'メンターシップ',
        description: '他の選手への心理的サポート提供',
        timeline: '可能な範囲で'
      }
    ]
  }
};

// 質問の進行状況計算
export const calculateProgress = (completedQuestions) => {
  return (completedQuestions / ACL_RSI_QUESTIONS.length) * 100;
};

// スコア計算
export const calculateScore = (answers) => {
  let totalScore = 0;
  let answeredQuestions = 0;

  ACL_RSI_QUESTIONS.forEach(question => {
    const answer = answers[question.id];
    if (answer !== undefined && answer !== null) {
      let score = answer;
      
      // 逆転項目の処理
      if (question.reverse) {
        score = question.scale.max - answer;
      }
      
      totalScore += score;
      answeredQuestions++;
    }
  });

  if (answeredQuestions === 0) return 0;
  
  // 0-100スケールに変換
  const maxPossibleScore = ACL_RSI_QUESTIONS.length * 10;
  return Math.round((totalScore / maxPossibleScore) * 100);
};

// カテゴリー別スコア計算
export const calculateCategoryScores = (answers) => {
  const categoryScores = {};
  
  Object.keys(CATEGORY_QUESTIONS).forEach(category => {
    const categoryQuestions = CATEGORY_QUESTIONS[category];
    let categoryTotal = 0;
    let answeredQuestions = 0;
    
    categoryQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer !== undefined && answer !== null) {
        let score = answer;
        
        if (question.reverse) {
          score = question.scale.max - answer;
        }
        
        categoryTotal += score;
        answeredQuestions++;
      }
    });
    
    if (answeredQuestions > 0) {
      const maxCategoryScore = categoryQuestions.length * 10;
      categoryScores[category] = Math.round((categoryTotal / maxCategoryScore) * 100);
    } else {
      categoryScores[category] = 0;
    }
  });
  
  return categoryScores;
};

// スコア解釈の取得
export const getScoreInterpretation = (score) => {
  return SCORE_INTERPRETATION.ranges.find(range => 
    score >= range.min && score <= range.max
  ) || SCORE_INTERPRETATION.ranges[0];
};

// アクションプランの取得
export const getActionPlan = (score) => {
  const interpretation = getScoreInterpretation(score);
  return ACTION_PLANS[interpretation.level] || ACTION_PLANS.low;
};