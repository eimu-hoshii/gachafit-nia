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
    title: '4WD 可変式ダンベル（最大片手10kg×2）',
    sub: 'シャフト0.5kg / 1.25kg×4・1.5kg×4・2.0kg×4',
    image: './assets/gear_dumbbell.jpg'
  },
  {
    id: 'tubes',
    title: 'Readaeer レジスタンスチューブ 5段階',
    sub: '黄(4.6kg)・赤(9.0kg)・青(13.6kg)・緑(18.2kg)・黒(22.8kg)',
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
    sub: '上部チンニングバー / 中段ディップスバー / チューブ支柱固定',
    image: './assets/gear_tower.jpg'
  }
];

// ニアのキャラクターセリフプリセット
export const NIA_LINES = {
  boot: [
    '来たわね。…べ、別に待ってないし。サッサと今日のメニュー回して追い込むわよ！',
    '遅い！筋肉が待ちくたびれて泣いてるわよ。ほら、1タップでガチャ回しなさい！'
  ],
  gachaReady: [
    '器具のセットはできた？サボらずやりなさいよ！',
    '今日の厳選メニューよ。プレートと角度を合わせたら即スタートしなさい！',
    '引き直しばっかりしてないで、覚悟決めて始めなさいよね！'
  ],
  activeSet: [
    'プレートと角度、ちゃんと合わせた？肘開かない！胸張る！あと3回！',
    '反動使わないの！ターゲットの筋肉に負荷を乗せ続けなさい！',
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
