import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Timer, Flame } from 'lucide-react';

/**
 * ニア（Nia）アバター＆セリフ演出コンポーネント
 * - 通常時/セット中: 褐色肌・黒髪ロング・赤眼・黒T・白ショーパンの立ち絵 + 表情切替
 * - インターバル中: メガホン・ポンポン・ストップウォッチを持った2頭身SDちびキャラ
 */
export default function NiaAvatar({
  mode = 'standing', // 'standing' | 'chibi'
  emotion = 'serious', // 'normal' | 'serious' | 'smile' | 'happy' | 'blush' | 'surprise'
  dialogue = '',
  voiceEnabled = true,
  onToggleVoice,
  onReplayVoice,
  intervalRemaining = null,
  compact = false
}) {
  const [imgError, setImgError] = useState(false);

  const expressionMap = {
    normal: './assets/nia_exp_normal.jpg',
    serious: './assets/nia_exp_serious.jpg',
    smile: './assets/nia_exp_smile.jpg',
    happy: './assets/nia_exp_happy.jpg',
    blush: './assets/nia_exp_blush.jpg',
    surprise: './assets/nia_exp_surprise.jpg'
  };

  const emotionLabelMap = {
    normal: '通常',
    serious: '熱血指導',
    smile: '不敵',
    happy: 'ご機嫌',
    blush: 'ツンデレ',
    surprise: '喝！'
  };

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-br from-[#191824] via-[#13131C] to-[#1D1118] border border-rose-500/30 shadow-xl overflow-hidden p-3.5">
      {/* 背景アクセント装飾 */}
      <div className="pointer-events-none absolute -right-8 -top-8 w-36 h-36 rounded-full bg-rose-600/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-8 -bottom-8 w-36 h-36 rounded-full bg-purple-600/10 blur-2xl" />

      <div className="relative flex items-center gap-3.5">
        {/* 左側：アバター表示領域（立ち絵 or 2頭身ちびキャラ） */}
        <div className="relative shrink-0">
          {mode === 'chibi' ? (
            /* インターバル中：2頭身SDちびキャラ（メガホン・ポンポン・ストップウォッチ装備） */
            <div className="relative w-28 h-32 flex items-center justify-center rounded-xl bg-gradient-to-b from-rose-950/60 to-zinc-900/90 border border-rose-500/40 overflow-hidden shadow-inner">
              <div className="animate-cheer flex flex-col items-center">
                <svg
                  viewBox="0 0 180 200"
                  className="w-28 h-32 drop-shadow-[0_4px_10px_rgba(225,29,72,0.45)]"
                >
                  {/* 後ろ髪（黒髪ロング） */}
                  <path
                    d="M48 45 C36 85, 38 140, 46 168 L134 168 C142 140, 144 85, 132 45 Z"
                    fill="#16141A"
                  />
                  {/* 左手ポンポン（チア応援） */}
                  <g transform="translate(22, 104)">
                    <circle cx="0" cy="0" r="15" fill="#E11D48" />
                    <circle cx="-6" cy="-6" r="8" fill="#FB7185" />
                    <circle cx="7" cy="-5" r="7" fill="#F43F5E" />
                    <circle cx="4" cy="7" r="7" fill="#FDA4AF" />
                  </g>
                  {/* ちびボディ（黒VネックTシャツ＋赤ロゴ） */}
                  <path
                    d="M66 104 L114 104 L120 144 L60 144 Z"
                    fill="#222028"
                    stroke="#3F3B4B"
                    strokeWidth="2"
                  />
                  {/* Vネックの肌 */}
                  <polygon points="82,104 98,104 90,115" fill="#B57B5B" />
                  {/* Tシャツの赤ロゴ */}
                  <rect x="74" y="118" width="32" height="6" rx="2" fill="#E11D48" />
                  {/* 白ショートパンツ */}
                  <path
                    d="M62 142 L118 142 L115 158 L93 158 L90 151 L87 158 L65 158 Z"
                    fill="#F8FAFC"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                  />
                  {/* 褐色肌の脚 */}
                  <rect x="69" y="158" width="12" height="22" rx="5" fill="#B57B5B" />
                  <rect x="99" y="158" width="12" height="22" rx="5" fill="#B57B5B" />
                  {/* 黒×ピンク差し色スニーカー */}
                  <rect x="65" y="177" width="18" height="10" rx="4" fill="#1E1B24" />
                  <rect x="65" y="184" width="18" height="3" rx="1.5" fill="#E879F9" />
                  <rect x="97" y="177" width="18" height="10" rx="4" fill="#1E1B24" />
                  <rect x="97" y="184" width="18" height="3" rx="1.5" fill="#E879F9" />
                  {/* 首元のストップウォッチ（インターバル計測） */}
                  <path d="M80 105 Q90 128 100 105" fill="none" stroke="#FBBF24" strokeWidth="2" />
                  <circle cx="90" cy="130" r="9" fill="#1E293B" stroke="#FBBF24" strokeWidth="2.5" />
                  <line x1="90" y1="130" x2="90" y2="124" stroke="#38BDF8" strokeWidth="2" />
                  <line x1="90" y1="130" x2="95" y2="130" stroke="#F43F5E" strokeWidth="2" />
                  {/* 右腕＋メガホン */}
                  <path d="M114 110 L135 96" stroke="#B57B5B" strokeWidth="9" strokeLinecap="round" />
                  <g transform="translate(132, 76) rotate(-18)">
                    <polygon points="0,16 32,2 32,30" fill="#E11D48" stroke="#F8FAFC" strokeWidth="2" />
                    <rect x="-4" y="12" width="6" height="8" rx="2" fill="#F8FAFC" />
                    <path d="M36 8 Q44 16 36 24" fill="none" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
                  </g>
                  {/* 2頭身の大きな頭部（褐色肌） */}
                  <rect x="50" y="26" width="80" height="74" rx="34" fill="#B57B5B" />
                  {/* 髪のツヤ・前髪 */}
                  <path
                    d="M46 56 C44 22, 72 14, 90 14 C108 14, 136 22, 134 56 C126 40, 118 52, 110 60 C104 42, 96 55, 90 62 C84 52, 76 42, 70 60 C62 50, 54 42, 46 56 Z"
                    fill="#18161D"
                  />
                  {/* 髪のハイライト */}
                  <path d="M62 34 Q90 26 118 34" fill="none" stroke="#524C61" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                  {/* ツンデレ眉 */}
                  <path d="M62 56 L80 62" stroke="#18161D" strokeWidth="3.2" strokeLinecap="round" />
                  <path d="M118 56 L100 62" stroke="#18161D" strokeWidth="3.2" strokeLinecap="round" />
                  {/* 赤眼（ルビーアイ） */}
                  <ellipse cx="71" cy="70" rx="9" ry="10" fill="#FFFFFF" />
                  <ellipse cx="71" cy="71" rx="6.5" ry="8" fill="#BE123C" />
                  <circle cx="71" cy="73" r="4" fill="#FB7185" />
                  <circle cx="68" cy="67" r="2.3" fill="#FFFFFF" />

                  <ellipse cx="109" cy="70" rx="9" ry="10" fill="#FFFFFF" />
                  <ellipse cx="109" cy="71" rx="6.5" ry="8" fill="#BE123C" />
                  <circle cx="109" cy="73" r="4" fill="#FB7185" />
                  <circle cx="106" cy="67" r="2.3" fill="#FFFFFF" />
                  {/* チーク＆元気な口 */}
                  <ellipse cx="59" cy="80" rx="5" ry="2.5" fill="#F43F5E" opacity="0.55" />
                  <ellipse cx="121" cy="80" rx="5" ry="2.5" fill="#F43F5E" opacity="0.55" />
                  <path d="M84 83 L96 83 L90 92 Z" fill="#E11D48" />
                </svg>
              </div>
              <span className="absolute bottom-1 inset-x-1 text-center text-[10px] font-bold bg-rose-600/90 text-white rounded px-1 py-0.5 shadow">
                📣 SD応援モード
              </span>
            </div>
          ) : (
            /* 通常・セット中：等身大立ち絵 ＋ 表情ワイプ */
            <div className="relative flex items-end gap-1.5">
              <div
                className={`relative ${
                  compact ? 'w-20 h-28' : 'w-24 h-36'
                } rounded-xl bg-zinc-900 border border-zinc-700/80 overflow-hidden shadow-lg`}
              >
                {!imgError ? (
                  <img
                    src="./assets/nia_stand_angle.jpg"
                    alt="ニア立ち絵"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover object-top scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-xs text-rose-400 font-bold">
                    NIA
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-1.5 py-0.5 flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-wider text-rose-400">NIA</span>
                  <span className="text-[9px] text-zinc-300">{emotionLabelMap[emotion] || '熱血'}</span>
                </div>
              </div>

              {/* 表情クローズアップバッジ */}
              {!imgError && (
                <div className="w-12 h-12 rounded-xl border-2 border-rose-500/80 overflow-hidden shadow-md bg-zinc-900 shrink-0 -ml-5 z-10">
                  <img
                    src={expressionMap[emotion] || expressionMap.serious}
                    alt="ニア表情"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* 右側：セリフ吹き出し＆音声コントロール */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-600/20 text-rose-400 border border-rose-500/30">
                <Flame className="w-3 h-3 fill-rose-500 text-rose-500" />
                専属トレーナー ニア
              </span>
              {mode === 'chibi' && intervalRemaining !== null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 animate-pulse">
                  <Timer className="w-3 h-3" />
                  残り{intervalRemaining}秒
                </span>
              )}
            </div>

            {/* Web Speech API ボイス読み上げ ON/OFF & リプレイ */}
            <div className="flex items-center gap-1">
              {onReplayVoice && (
                <button
                  type="button"
                  onClick={onReplayVoice}
                  title="セリフを再生"
                  className="px-2 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold border border-zinc-700 active:scale-95 transition"
                >
                  再生
                </button>
              )}
              {onToggleVoice && (
                <button
                  type="button"
                  onClick={onToggleVoice}
                  title={voiceEnabled ? 'ボイス読み上げ ON' : 'ボイス読み上げ OFF'}
                  className={`p-1.5 rounded-lg border transition active:scale-95 ${
                    voiceEnabled
                      ? 'bg-rose-600/20 border-rose-500/50 text-rose-300'
                      : 'bg-zinc-800/70 border-zinc-700 text-zinc-500'
                  }`}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* セリフテキストボックス */}
          <div className="relative rounded-xl bg-zinc-950/90 border border-zinc-800/90 p-3 shadow-inner">
            <p className="text-xs sm:text-sm font-bold leading-relaxed text-zinc-100">
              「{dialogue}」
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
