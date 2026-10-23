// 保有ハードウェア・プリセット仕様（4WDダンベル / Readaeerチューブ / アイリスプラザベンチ / Wolfyok 7in1懸垂スタンド）

export const DUMBBELL_PRESETS = [
  {
    weight: '3.0kg',
    label: '約3.0kg',
    platesPerSide: ['1.25kg'],
    formula: 'シャフト(0.5kg) + 1.25kg×2（各側1枚）',
    color: 'from-sky-500 to-cyan-500'
  },
  {
    weight: '3.5kg',
    label: '約3.5kg',
    platesPerSide: ['1.5kg'],
    formula: 'シャフト(0.5kg) + 1.5kg×2（各側1枚）',
    color: 'from-cyan-500 to-teal-500'
  },
  {
    weight: '4.5kg',
    label: '約4.5kg',
    platesPerSide: ['2.0kg'],
    formula: 'シャフト(0.5kg) + 2.0kg×2（各側1枚）',
    color: 'from-emerald-500 to-green-500'
  },
  {
    weight: '6.0kg',
    label: '約6.0kg',
    platesPerSide: ['1.25kg', '1.5kg'],
    formula: 'シャフト(0.5kg) + (1.25kg + 1.5kg)×各2',
    color: 'from-amber-500 to-orange-500'
  },
  {
    weight: '7.0kg',
    label: '約7.0kg',
    platesPerSide: ['1.25kg', '2.0kg'],
    formula: 'シャフト(0.5kg) + (1.25kg + 2.0kg)×各2',
    color: 'from-orange-500 to-red-500'
  },
  {
    weight: '7.5kg',
    label: '約7.5kg',
    platesPerSide: ['1.5kg', '2.0kg'],
    formula: 'シャフト(0.5kg) + (1.5kg + 2.0kg)×各2',
    color: 'from-rose-500 to-pink-600'
  },
  {
    weight: '10.0kg',
    label: '約10.0kg (MAX)',
    platesPerSide: ['1.25kg', '1.5kg', '2.0kg'],
    formula: 'シャフト(0.5kg) + (1.25 + 1.5 + 2.0kg)×各2 フル装着',
    color: 'from-rose-600 via-red-600 to-purple-600'
  }
];

export const TUBE_PRESETS = [
  {
    id: 'yellow',
    emoji: '🟡',
    name: '黄',
    lbs: '10 LBS',
    kg: '4.6 kg',
    usage: '肩リア・ウォーミングアップ',
    badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50',
    dotClass: 'bg-yellow-400'
  },
  {
    id: 'red',
    emoji: '🔴',
    name: '赤',
    lbs: '20 LBS',
    kg: '9.0 kg',
    usage: 'フェイスプル・サイドレイズ補助',
    badgeClass: 'bg-red-500/20 text-red-300 border-red-400/50',
    dotClass: 'bg-red-500'
  },
  {
    id: 'blue',
    emoji: '🔵',
    name: '青',
    lbs: '30 LBS',
    kg: '13.6 kg',
    usage: 'チェストフライ・アームカール',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-400/50',
    dotClass: 'bg-blue-500'
  },
  {
    id: 'green',
    emoji: '🟢',
    name: '緑',
    lbs: '40 LBS',
    kg: '18.2 kg',
    usage: 'プッシュダウン・ローイング',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50',
    dotClass: 'bg-emerald-500'
  },
  {
    id: 'black',
    emoji: '⚫',
    name: '黒',
    lbs: '50 LBS',
    kg: '22.8 kg',
    usage: '高強度コンパウンド・2本連結可',
    badgeClass: 'bg-zinc-700/60 text-zinc-100 border-zinc-400/60',
    dotClass: 'bg-zinc-900 ring-2 ring-zinc-300'
  }
];

// チューブ2本重ね（連結・束ね持ち）ハイパワー組み合わせ
export const COMBINED_TUBE_PRESETS = [
  {
    name: '黒 + 緑',
    emoji: '⚫+🟢',
    lbs: '90 LBS',
    kg: '約41.0 kg',
    usage: '超高強度プッシュダウン / アシスト懸垂 / パワーローイング'
  },
  {
    name: '黒 + 青',
    emoji: '⚫+🔵',
    lbs: '80 LBS',
    kg: '約36.4 kg',
    usage: '高強度プッシュダウン / アシスト懸垂'
  },
  {
    name: '緑 + 青',
    emoji: '🟢+🔵',
    lbs: '70 LBS',
    kg: '約31.8 kg',
    usage: 'ヘビーチェストフライ / アームカール'
  },
  {
    name: '青 + 赤',
    emoji: '🔵+🔴',
    lbs: '50 LBS',
    kg: '約22.6 kg',
    usage: '中高強度フライ / 上部フェイスプル / アームカール'
  },
  {
    name: '赤 + 黄',
    emoji: '🔴+🟡',
    lbs: '30 LBS',
    kg: '約13.6 kg',
    usage: 'サイドレイズ / リアレイズ'
  }
];

export const BENCH_ANGLES = [
  {
    angle: 0,
    name: 'フラット（0°）',
    usage: '通常プレス、フライ'
  },
  {
    angle: 38,
    name: 'インクライン低（30°〜45°）',
    usage: '大胸筋上部、インクラインカール'
  },
  {
    angle: 78,
    name: '直角寄り（75°〜80°）',
    usage: 'ショルダープレス'
  }
];

export const HARDWARE_GALLERY = [
  {
    id: 'dumbbell',
    title: '4WD 可変式ダンベル（片手10kgフル装着固定）',
    sub: 'シャフト0.5kg + 1.25kg×2 + 1.5kg×2 + 2.0kg×2（付替え不要！）',
    image: './assets/gear_dumbbell.jpg'
  },
  {
    id: 'tubes',
    title: 'Readaeer レジスタンスチューブ 5段階（2本重ね対応）',
    sub: '黄(4.6kg)・赤(9.0kg)・青(13.6kg)・緑(18.2kg)・黒(22.8kg) / 2本連結で最大41kg超',
    image: './assets/gear_tubes.jpg'
  },
  {
    id: 'bench',
    title: 'アイリスプラザ インクラインベンチ台',
    sub: 'フラット(0°) / インクライン(30°〜60°) / 直角寄り(75°〜80°)',
    image: './assets/gear_bench.jpg'
  },
  {
    id: 'tower',
    title: 'Wolfyok fitness 7in1 懸垂スタンド',
    sub: '上部チンニングバー(足掛けチューブアシスト対応) / 中段ディップスバー / チューブ固定支柱',
    image: './assets/gear_tower.jpg'
  }
];

// ニアのキャラクターセリフプリセット
export const NIA_LINES = {
  boot: [
    '来たわね。…べ、別に待ってないし。サッサと今日のメニュー回して追い込むわよ！',
    '遅い！筋肉が待ちくたびれて泣いてるわよ。ほら、1タップでガチャ回しなさい！',
    'ダンベルは10kg固定だから迷わず即セット完了よ！サボる言い訳はナシよ！'
  ],
  gachaReady: [
    '器具のセットはできた？ダンベルは10kg固定、チューブは2本重ねで一瞬よ！',
    '今日の厳選メニューよ。プレート付け替えの手間ゼロでテンポよく追い込みなさい！',
    'ワイド懸垂が0回でも気にしないの！バーに黒チューブ掛けて足を乗せなさい、羽が生えたみたいに上がるわよ！'
  ],
  activeSet: [
    '肘開かない！胸張る！反動使わずターゲットに負荷乗せなさい！あと3回！',
    'チューブのテンション緩めない！トップで1秒絞り切る！',
    'いい軌道よ…って、まだ気を抜くんじゃないわよ！最後の一押し！'
  ],
  intervalStart: [
    'ちょっと、肩落ちてる！深呼吸！水飲んだら次構えなさい！',
    'インターバル開始！ダラダラスマホ見ないの！呼吸を整えなさい！'
  ],
  interval10Sec: 'ちょっと、肩落ちてる！深呼吸！残り10秒…水飲んだら次構えなさい！',
  interval5Sec: '残り5秒！グリップ握って、フォームに入る準備しなさい！',
  complete: [
    '全セット終了！…ま、今日のフォームは合格点あげてもいいかもね。明日もやりなさいよ？',
    'お、お疲れ様…。最後までやり切るなんて、少しは見直してあげたわよ。プロテイン飲みなさいよね！'
  ]
};

// 部位集中特化コース（資料ベース厳選プリセット）
export const SPECIALIZED_COURSES = [
  {
    id: 'shoulder_focus',
    title: '肩集中フォーカス',
    subtitle: '三角筋前・中・後を全方位攻略',
    badge: '3種目',
    color: 'from-amber-600/20 to-orange-600/20 border-amber-500/50 text-amber-300',
    exerciseIds: [
      'incline_shoulder_press',
      'db_side_raise',
      'incline_rear_delt_or_high_facepull'
    ]
  },
  {
    id: 'chest_focus',
    title: '胸集中フォーカス',
    subtitle: '上部・外側ストレッチ・自重追い込み',
    badge: '4種目',
    color: 'from-rose-600/20 to-pink-600/20 border-rose-500/50 text-rose-300',
    exerciseIds: [
      'incline_db_press',
      'low_anchor_chest_fly',
      'db_bench_press',
      'pushups_finisher'
    ]
  },
  {
    id: 'arms_focus',
    title: '腕集中パンプ',
    subtitle: '二頭（力こぶ）＆三頭（二の腕裏）',
    badge: '4種目',
    color: 'from-violet-600/20 to-purple-600/20 border-violet-500/50 text-violet-300',
    exerciseIds: [
      'incline_db_curl',
      'tube_pushdown',
      'db_hammer_curl',
      'db_overhead_triceps'
    ]
  },
  {
    id: 'back_focus',
    title: '背中・引く力強化',
    subtitle: '逆三角形の広背筋＆厚み',
    badge: '3種目',
    color: 'from-sky-600/20 to-cyan-600/20 border-sky-500/50 text-sky-300',
    exerciseIds: [
      'pullup_wide',
      'inverted_row_or_chest_supported',
      'chinup_close'
    ]
  }
];
