import React from 'react';
import { TUBE_PRESETS, DUMBBELL_PRESETS } from '../data/hardware';

/**
 * 現場特化・器具セッティングUIカード
 * 1. 📐 ベンチ角度ピクトグラムバッジ（フラット0° / インクライン30-60° / 直角寄り75-80° / スタンド立位）
 * 2. 🏋️ 4WDダンベルのプレート構成ビジュアル or Readaeerチューブ色付きバッジ
 */
export default function GearVisualizer({ exercise }) {
  if (!exercise) return null;

  const { bench_angle, gear_setting, setup_detail } = exercise;

  // ベンチ角度から視覚的ピクトグラム角度を算出
  const getBenchAngleDegree = (angleStr = '') => {
    if (angleStr.includes('0°') || angleStr.includes('フラット')) return 0;
    if (angleStr.includes('30°') || angleStr.includes('45°')) return 38;
    if (angleStr.includes('60°')) return 52;
    if (angleStr.includes('75°') || angleStr.includes('80°') || angleStr.includes('直角')) return 76;
    return null; // スタンドまたは立位
  };

  const angleDeg = getBenchAngleDegree(bench_angle);

  // チューブ種目かどうかの判定と該当カラー抽出
  const matchedTubes = TUBE_PRESETS.filter(
    (t) => gear_setting.includes(t.name) || gear_setting.includes(t.emoji)
  );

  // ダンベル種目かどうかの判定と該当重量抽出
  const matchedDumbbells = DUMBBELL_PRESETS.filter((d) =>
    gear_setting.includes(d.weight)
  );

  return (
    <div className="rounded-2xl bg-[#151520] border border-zinc-800 p-3.5 space-y-3 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
          ⚡ 器具セッティング・クイックガイド
        </span>
        <span className="text-[10px] text-zinc-400 font-medium shrink-0">
          迷わず10秒でセット完了
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* 📐 ベンチ角度 / ポジションカード */}
        <div className="flex items-center gap-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 p-2.5 min-w-0">
          <div className="w-11 h-11 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
            {angleDeg !== null ? (
              /* インクラインベンチ角度ピクトグラムSVG */
              <svg viewBox="0 0 64 48" className="w-9 h-7">
                <line x1="6" y1="42" x2="58" y2="42" stroke="#52525B" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="16" y1="34" x2="12" y2="42" stroke="#71717A" strokeWidth="2.5" />
                <line x1="44" y1="34" x2="48" y2="42" stroke="#71717A" strokeWidth="2.5" />
                <line x1="10" y1="34" x2="28" y2="34" stroke="#E11D48" strokeWidth="4" strokeLinecap="round" />
                <g transform={`translate(28, 34) rotate(${-angleDeg})`}>
                  <line x1="0" y1="0" x2="26" y2="0" stroke="#FB7185" strokeWidth="4.5" strokeLinecap="round" />
                </g>
                {angleDeg > 0 && (
                  <text x="36" y="28" fill="#FBBF24" fontSize="10" fontWeight="bold">
                    {angleDeg}°
                  </text>
                )}
              </svg>
            ) : (
              /* 7in1懸垂スタンド / 立位ピクトグラム */
              <svg viewBox="0 0 64 48" className="w-9 h-7">
                <line x1="12" y1="44" x2="52" y2="44" stroke="#52525B" strokeWidth="3" strokeLinecap="round" />
                <line x1="20" y1="8" x2="20" y2="44" stroke="#94A3B8" strokeWidth="3" />
                <line x1="44" y1="8" x2="44" y2="44" stroke="#94A3B8" strokeWidth="3" />
                <line x1="14" y1="8" x2="50" y2="8" stroke="#F43F5E" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="15" y1="24" x2="26" y2="24" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
                <line x1="38" y1="24" x2="49" y2="24" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold text-zinc-400">
              📐 ベンチ角度・位置
            </div>
            <div className="text-xs font-black text-amber-300 leading-snug break-words">
              {bench_angle}
            </div>
          </div>
        </div>

        {/* 🏋️ 重量・負荷セッティングカード */}
        <div className="flex items-center gap-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 p-2.5 min-w-0">
          <div className="w-11 h-11 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 text-lg">
            🏋️
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold text-zinc-400">
              🏋️ 使用ギア・目標重量
            </div>
            <div className="text-xs font-black text-white leading-snug break-words">
              {gear_setting}
            </div>
          </div>
        </div>
      </div>

      {/* チューブ種目の場合：色付きバッジを明示 */}
      {matchedTubes.length > 0 && (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-zinc-400">推奨チューブ:</span>
            {matchedTubes.map((t) => (
              <span
                key={t.id}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold border ${t.badgeClass}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${t.dotClass}`} />
                {t.emoji} {t.name} ({t.kg} / {t.lbs})
              </span>
            ))}
          </div>
          {gear_setting.includes('2本') && (
            <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
              <span>⚡ 2本重ね（束ね持ち・2本連結）でジムのマシン並みの高重量負荷を実現！</span>
            </div>
          )}
          {gear_setting.includes('アシスト') && (
            <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
              <span>💡 上部バーにチューブを掛けて足を乗せれば、体重が23〜41kg軽くなり0回でも確実に上がる！</span>
            </div>
          )}
        </div>
      )}

      {/* 4WDダンベル種目の場合：片手プレート構成バッジを明示 */}
      {matchedDumbbells.length > 0 && (
        <div className="rounded-xl bg-zinc-950/90 border border-zinc-800/90 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
            <span>🔩 4WDダンベル 片手プレート装着内訳（シャフト0.5kg）</span>
            <span className="text-amber-400 font-black">付替え不要の10kg固定！</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {matchedDumbbells.map((d) => (
              <div
                key={d.weight}
                className="flex items-center gap-2 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5"
              >
                <span className={`px-2 py-0.5 rounded text-xs font-black text-white bg-gradient-to-r ${d.color}`}>
                  片手 {d.weight}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-zinc-200">
                  <span className="text-zinc-400 text-[11px]">各側:</span>
                  {d.platesPerSide.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-extrabold"
                    >
                      {p}
                    </span>
                  ))}
                  <span className="text-[10px] text-zinc-400 ml-1">（フル装着）</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 詳細セッティング手順 */}
      <div className="rounded-xl bg-rose-950/25 border border-rose-500/30 px-3 py-2 flex items-start gap-2">
        <span className="text-xs font-black text-rose-400 shrink-0 mt-0.5">SETUP:</span>
        <p className="text-xs font-bold text-zinc-200 leading-relaxed">
          {setup_detail}
        </p>
      </div>
    </div>
  );
}
