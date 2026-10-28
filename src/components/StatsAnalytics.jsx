import React, { useState, useMemo } from 'react';
import {
  Activity,
  HeartPulse,
  PieChart as PieChartIcon,
  TrendingUp,
  Sparkles,
  ChevronDown,
  Info,
  Calendar,
  Flame,
  Award,
  Dumbbell
} from 'lucide-react';

// 部位の定義
const BODY_PARTS = [
  { id: 'chest', name: '胸', color: '#F43F5E', bgClass: 'bg-rose-500', textClass: 'text-rose-400', borderClass: 'border-rose-500/40' },
  { id: 'back', name: '背中', color: '#0EA5E9', bgClass: 'bg-sky-500', textClass: 'text-sky-400', borderClass: 'border-sky-500/40' },
  { id: 'shoulder', name: '肩', color: '#F59E0B', bgClass: 'bg-amber-500', textClass: 'text-amber-400', borderClass: 'border-amber-500/40' },
  { id: 'arm', name: '腕', color: '#A855F7', bgClass: 'bg-purple-500', textClass: 'text-purple-400', borderClass: 'border-purple-500/40' },
  { id: 'core', name: '脚・体幹', color: '#10B981', bgClass: 'bg-emerald-500', textClass: 'text-emerald-400', borderClass: 'border-emerald-500/40' }
];

// 種目名やターゲットから部位を自動判定
function detectBodyPart(ex) {
  const name = (ex.name || '').toLowerCase();
  const target = (ex.target || '').toLowerCase();

  if (target.includes('胸') || name.includes('プレス') || name.includes('フライ') || name.includes('プッシュアップ') || name.includes('チェスト') || name.includes('ベンチプレス')) {
    if (!name.includes('ショルダー') && !name.includes('レッグ') && !name.includes('インクラインショルダー')) {
      return 'chest';
    }
  }
  if (target.includes('背中') || name.includes('懸垂') || name.includes('チンニング') || name.includes('ロー') || name.includes('ラット') || name.includes('プルダウン')) {
    return 'back';
  }
  if (target.includes('肩') || name.includes('レイズ') || name.includes('ショルダー') || name.includes('フェイスプル') || name.includes('リア')) {
    return 'shoulder';
  }
  if (target.includes('腕') || target.includes('力こぶ') || target.includes('三頭') || target.includes('二頭') || name.includes('カール') || name.includes('プッシュダウン') || name.includes('ディップス') || name.includes('フレンチプレス') || name.includes('biseps') || name.includes('traiseps')) {
    return 'arm';
  }
  if (target.includes('腹') || target.includes('体幹') || target.includes('脚') || name.includes('レッグ') || name.includes('スクワット') || name.includes('腹筋')) {
    return 'core';
  }
  return 'chest';
}

// 重量とRepを抽出（recordsがあればそれを使用、なければgear_settingからパース）
function extractWorkoutMetrics(ex) {
  if (Array.isArray(ex.records) && ex.records.length > 0) {
    let maxWeight = 0;
    let totalVolume = 0;
    let best1RM = 0;

    ex.records.forEach((r) => {
      const rep = parseInt(r.reps, 10) || 10;
      let w = 10; // デフォルト10kg
      if (typeof r.weight === 'string') {
        const match = r.weight.match(/(\d+(?:\.\d+)?)/);
        if (match) w = parseFloat(match[1]);
        else if (r.weight.includes('自重')) w = 35; // 自重換算の推定負荷
        else if (r.weight.includes('チューブ')) w = 15;
      } else if (typeof r.weight === 'number') {
        w = r.weight;
      }
      const volume = w * rep;
      const oneRM = Math.round(w * (1 + rep / 40));

      if (w > maxWeight) maxWeight = w;
      if (oneRM > best1RM) best1RM = oneRM;
      totalVolume += volume;
    });

    return { maxWeight, totalVolume, best1RM };
  }

  // 旧データや手動記録の文字列パース
  const gearStr = ex.gear_setting || '';
  let w = 10;
  const wMatch = gearStr.match(/(\d+(?:\.\d+)?)\s*kg/i);
  if (wMatch) {
    w = parseFloat(wMatch[1]);
  } else if (gearStr.includes('自重')) {
    w = 35;
  } else if (gearStr.includes('チューブ')) {
    w = 15;
  }

  let rep = 10;
  const rMatch = gearStr.match(/(\d+)\s*回/);
  if (rMatch) {
    rep = parseInt(rMatch[1], 10);
  }

  const sets = ex.sets || 3;
  const totalVolume = Math.round(w * rep * sets);
  const best1RM = Math.round(w * (1 + rep / 40));

  return { maxWeight: w, totalVolume, best1RM };
}

export default function StatsAnalytics({ history = {}, exercisesMaster = [] }) {
  const [selectedExerciseName, setSelectedExerciseName] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('1rm'); // '1rm' | 'volume' | 'weight'

  // 全履歴エントリーを時系列順（古い順）に平坦化
  const flatHistory = useMemo(() => {
    const list = [];
    const sortedDates = Object.keys(history).sort();

    sortedDates.forEach((dateKey) => {
      const dayData = history[dateKey];
      if (!dayData || !Array.isArray(dayData.exercises)) return;

      const dateObj = new Date(dayData.completedAt || `${dateKey}T12:00:00`);
      dayData.exercises.forEach((ex) => {
        const bodyPart = detectBodyPart(ex);
        const metrics = extractWorkoutMetrics(ex);
        list.push({
          dateKey,
          dateObj,
          name: ex.name,
          bodyPart,
          sets: ex.sets || 3,
          ...metrics
        });
      });
    });
    return list;
  }, [history]);

  // ① 回復ステータスマップの算出
  const recoveryStatusList = useMemo(() => {
    const now = new Date();
    return BODY_PARTS.map((part) => {
      // その部位の最新トレーニング日時を探索
      const matching = flatHistory
        .filter((h) => h.bodyPart === part.id)
        .sort((a, b) => b.dateObj - a.dateObj);

      let hoursSince = Infinity;
      let lastDateStr = '記録なし';

      if (matching.length > 0) {
        const latest = matching[0];
        hoursSince = (now.getTime() - latest.dateObj.getTime()) / (1000 * 60 * 60);
        lastDateStr = latest.dateKey;
      }

      let status = '全回復・準備完了';
      let statusColor = 'text-emerald-400';
      let barColor = 'bg-emerald-500';
      let percent = 100;
      let badge = '超回復◎';

      if (hoursSince < 24) {
        status = '回復中（ダメージ大）';
        statusColor = 'text-rose-400';
        barColor = 'bg-rose-500';
        percent = Math.min(100, Math.max(15, Math.round((hoursSince / 72) * 100)));
        badge = '休養推奨🔴';
      } else if (hoursSince < 48) {
        status = '筋肉痛注意（回復中）';
        statusColor = 'text-orange-400';
        barColor = 'bg-orange-500';
        percent = Math.min(100, Math.round((hoursSince / 72) * 100));
        badge = '回復進行🟠';
      } else if (hoursSince < 72) {
        status = 'ほぼ回復（軽め可）';
        statusColor = 'text-amber-300';
        barColor = 'bg-amber-400';
        percent = Math.min(100, Math.round((hoursSince / 72) * 100));
        badge = '準レディ🟡';
      } else {
        percent = 100;
      }

      return {
        ...part,
        hoursSince,
        lastDateStr,
        status,
        statusColor,
        barColor,
        percent,
        badge
      };
    });
  }, [flatHistory]);

  // ニアによる回復状況レコメンド
  const niaRecoveryAdvice = useMemo(() => {
    const readyParts = recoveryStatusList.filter((p) => p.hoursSince >= 72);
    const restingParts = recoveryStatusList.filter((p) => p.hoursSince < 24);

    if (readyParts.length > 0) {
      const topReady = readyParts[0];
      return `現在の回復診断よ！「${topReady.name}」が完全超回復（100%）に達してるわ！今日はここをメインターゲットに追い込むのが最も筋肥大効率が高いわよ！`;
    }
    if (restingParts.length > 0) {
      return `「${restingParts.map((p) => p.name).join('・')}」はまだ激しい筋繊維修復中よ！無理に負荷をかけずに、他の部位を攻めなさい！`;
    }
    return '全体的にバランスよく疲労が抜けてるわね。自分の弱点部位からガンガン攻めなさい！';
  }, [recoveryStatusList]);

  // ② 部位バランス（全期間セット数割合）
  const bodyPartBalance = useMemo(() => {
    const totalSets = flatHistory.reduce((sum, h) => sum + h.sets, 0);
    const counts = { chest: 0, back: 0, shoulder: 0, arm: 0, core: 0 };

    flatHistory.forEach((h) => {
      if (counts[h.bodyPart] !== undefined) {
        counts[h.bodyPart] += h.sets;
      }
    });

    const parts = BODY_PARTS.map((p) => {
      const count = counts[p.id] || 0;
      const ratio = totalSets > 0 ? Math.round((count / totalSets) * 100) : 0;
      return {
        ...p,
        count,
        ratio
      };
    });

    return { totalSets, parts };
  }, [flatHistory]);

  // ③ 成長推移（種目別）
  // 過去に実施したユニークな種目リスト
  const availableExercises = useMemo(() => {
    const set = new Set();
    flatHistory.forEach((h) => {
      if (h.name) set.add(h.name);
    });
    // 現在のマスターデータからも補完
    exercisesMaster.forEach((ex) => {
      if (ex.name) set.add(ex.name);
    });
    return Array.from(set);
  }, [flatHistory, exercisesMaster]);

  // 初期選択種目（最も回数が多い種目）
  const currentTargetExercise = useMemo(() => {
    if (selectedExerciseName) return selectedExerciseName;
    if (availableExercises.length > 0) return availableExercises[0];
    return 'ダンベルベンチプレス';
  }, [selectedExerciseName, availableExercises]);

  // 選択種目の推移データ
  const progressData = useMemo(() => {
    const matches = flatHistory
      .filter((h) => h.name.includes(currentTargetExercise) || currentTargetExercise.includes(h.name))
      .sort((a, b) => a.dateObj - b.dateObj);

    if (matches.length === 0) return [];

    return matches.map((m) => {
      let val = 0;
      if (selectedMetric === '1rm') val = m.best1RM;
      else if (selectedMetric === 'volume') val = m.totalVolume;
      else val = m.maxWeight;

      return {
        dateKey: m.dateKey,
        label: m.dateKey.slice(5), // MM-DD
        value: val,
        raw: m
      };
    });
  }, [flatHistory, currentTargetExercise, selectedMetric]);

  // 成長推移のサマリー（初回比・最高値）
  const progressSummary = useMemo(() => {
    if (progressData.length === 0) return null;
    const first = progressData[0].value;
    const latest = progressData[progressData.length - 1].value;
    const max = Math.max(...progressData.map((d) => d.value));
    const growth = first > 0 ? Math.round(((latest - first) / first) * 100) : 0;

    return {
      first,
      latest,
      max,
      growth,
      unit: selectedMetric === 'volume' ? 'kg' : 'kg'
    };
  }, [progressData, selectedMetric]);

  // SVG折れ線グラフの座標計算
  const chartCoordinates = useMemo(() => {
    if (progressData.length < 2) return null;

    const values = progressData.map((d) => d.value);
    const minVal = Math.max(0, Math.min(...values) * 0.85);
    const maxVal = Math.max(...values) * 1.15 || 100;
    const range = maxVal - minVal || 1;

    const width = 320;
    const height = 140;
    const paddingX = 25;
    const paddingY = 20;

    const points = progressData.map((d, idx) => {
      const x = paddingX + (idx / (progressData.length - 1)) * (width - paddingX * 2);
      const y = height - paddingY - ((d.value - minVal) / range) * (height - paddingY * 2);
      return { x, y, ...d };
    });

    const pathD = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    return { points, pathD, areaD, minVal, maxVal, width, height };
  }, [progressData]);

  return (
    <div className="space-y-4 pb-12">
      {/* トップタイトルバナー */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-[#151520] border border-purple-500/30 p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>MUSCLE ANALYTICS PRO</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-extrabold border border-purple-500/30">
                AI連動
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              超回復ステータス・部位別比率・成長曲線をリアルタイム解析
            </p>
          </div>
        </div>
      </div>

      {/* ① 回復ステータスマップ */}
      <div className="rounded-2xl bg-[#151520] border border-zinc-800 p-4 space-y-3.5 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
            部位別 回復ステータスマップ
          </h3>
          <span className="text-[10px] text-zinc-500 font-bold">
            目安: ~24h🔴 24-48h🟠 48-72h🟡 72h~🟢
          </span>
        </div>

        {/* ニアのアドバイス吹き出し */}
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-200 font-bold leading-relaxed flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>{niaRecoveryAdvice}</div>
        </div>

        {/* 各部位のプログレスバー一覧 */}
        <div className="space-y-3 pt-1">
          {recoveryStatusList.map((part) => (
            <div key={part.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-white flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${part.bgClass}`} />
                  {part.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400">
                    {part.hoursSince === Infinity ? '未実施' : `前回: ${Math.round(part.hoursSince)}h前 (${part.lastDateStr.slice(5)})`}
                  </span>
                  <span className={`text-[11px] font-black ${part.statusColor}`}>
                    {part.badge}
                  </span>
                </div>
              </div>

              {/* 回復プログレスバー */}
              <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                <div
                  className={`h-full ${part.barColor} transition-all duration-700 rounded-full`}
                  style={{ width: `${part.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ② 部位バランス（全期間セット数割合） */}
      <div className="rounded-2xl bg-[#151520] border border-zinc-800 p-4 space-y-3.5 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <PieChartIcon className="w-4 h-4 text-sky-400" />
            部位バランス（全期間セット数割合）
          </h3>
          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
            累計 {bodyPartBalance.totalSets} セット
          </span>
        </div>

        {/* 視覚的なマルチカラースタックバー */}
        <div className="space-y-2">
          <div className="w-full h-3.5 rounded-xl bg-zinc-900 overflow-hidden flex border border-zinc-800">
            {bodyPartBalance.parts.map((p) => {
              if (p.ratio === 0) return null;
              return (
                <div
                  key={p.id}
                  style={{ width: `${p.ratio}%`, backgroundColor: p.color }}
                  title={`${p.name}: ${p.ratio}%`}
                  className="h-full transition-all duration-500 first:rounded-l-xl last:rounded-r-xl"
                />
              );
            })}
          </div>

          {/* 各部位の内訳グリッド */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {bodyPartBalance.parts.map((p) => (
              <div
                key={p.id}
                className="rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-2.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="text-xs font-black text-white">{p.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-zinc-100">{p.ratio}%</span>
                  <span className="text-[10px] text-zinc-500 ml-1">({p.count}S)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ③ 成長推移（種目別） */}
      <div className="rounded-2xl bg-[#151520] border border-zinc-800 p-4 space-y-3.5 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            成長推移（種目別パフォーマンス）
          </h3>
          {progressSummary && progressSummary.growth !== 0 && (
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded ${
                progressSummary.growth > 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              初回比 {progressSummary.growth > 0 ? `+${progressSummary.growth}%🔥` : `${progressSummary.growth}%`}
            </span>
          )}
        </div>

        {/* コントロールセレクター */}
        <div className="grid grid-cols-2 gap-2">
          {/* 種目選択プルダウン */}
          <div>
            <label className="text-[10px] font-bold text-zinc-400 mb-1 block">分析対象の種目</label>
            <select
              value={currentTargetExercise}
              onChange={(e) => setSelectedExerciseName(e.target.value)}
              className="w-full text-xs font-bold bg-zinc-900 border border-zinc-700 text-white rounded-xl px-2.5 py-2 focus:outline-none focus:border-rose-500 truncate"
            >
              {availableExercises.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>
          </div>

          {/* 指標（メトリクス）選択 */}
          <div>
            <label className="text-[10px] font-bold text-zinc-400 mb-1 block">集計指標</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full text-xs font-bold bg-zinc-900 border border-zinc-700 text-white rounded-xl px-2.5 py-2 focus:outline-none focus:border-rose-500"
            >
              <option value="1rm">推定1RM (kg)</option>
              <option value="volume">総負荷量 Volume (kg)</option>
              <option value="weight">最高重量 (kg)</option>
            </select>
          </div>
        </div>

        {/* 推移サマリーバッジ */}
        {progressSummary && (
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-2">
              <div className="text-[10px] text-zinc-400 font-bold">初回値</div>
              <div className="text-xs font-black text-zinc-200 mt-0.5">
                {progressSummary.first} <span className="text-[9px] text-zinc-500">{progressSummary.unit}</span>
              </div>
            </div>
            <div className="rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-2">
              <div className="text-[10px] text-zinc-400 font-bold">最新値</div>
              <div className="text-xs font-black text-emerald-400 mt-0.5">
                {progressSummary.latest} <span className="text-[9px] text-zinc-500">{progressSummary.unit}</span>
              </div>
            </div>
            <div className="rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-2">
              <div className="text-[10px] text-zinc-400 font-bold">自己ベスト</div>
              <div className="text-xs font-black text-amber-400 mt-0.5">
                {progressSummary.max} <span className="text-[9px] text-zinc-500">{progressSummary.unit}</span>
              </div>
            </div>
          </div>
        )}

        {/* ピュアSVG折れ線グラフ */}
        {chartCoordinates ? (
          <div className="w-full bg-zinc-950/90 rounded-2xl border border-zinc-800/90 p-3 pt-4">
            <div className="relative w-full aspect-[16/7]">
              <svg
                viewBox={`0 0 ${chartCoordinates.width} ${chartCoordinates.height}`}
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* 背景ガイド線 */}
                <line
                  x1="20"
                  y1={chartCoordinates.height - 20}
                  x2={chartCoordinates.width - 20}
                  y2={chartCoordinates.height - 20}
                  stroke="#27272A"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1={20}
                  x2={chartCoordinates.width - 20}
                  y2={20}
                  stroke="#27272A"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* エリアグラデーション */}
                <path d={chartCoordinates.areaD} fill="url(#chartGradient)" />

                {/* 折れ線 */}
                <path
                  d={chartCoordinates.pathD}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 各データポイント */}
                {chartCoordinates.points.map((pt, i) => (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      fill="#0B0B10"
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                    {/* 日付ラベル（最初と最後、中間） */}
                    {(i === 0 || i === chartCoordinates.points.length - 1 || i === Math.floor(chartCoordinates.points.length / 2)) && (
                      <text
                        x={pt.x}
                        y={chartCoordinates.height - 5}
                        fill="#71717A"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {pt.label}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold px-1 mt-1">
              <span>{chartCoordinates.points[0]?.dateKey}</span>
              <span>{chartCoordinates.points[chartCoordinates.points.length - 1]?.dateKey}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-zinc-950/60 border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500 font-bold">
            「{currentTargetExercise}」の履歴データがまだ1件以下です。<br />
            トレーニングを複数回記録すると、推移グラフが自動描画されます！
          </div>
        )}
      </div>
    </div>
  );
}
