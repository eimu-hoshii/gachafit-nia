import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Check,
  Dumbbell,
  Sliders,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit3
} from 'lucide-react';
import { BENCH_ANGLES } from '../data/hardware';

// 種目設定（セット数・Rep・重量・角度）の編集モーダル
export function EditExerciseModal({
  isOpen,
  onClose,
  exercise,
  onSave
}) {
  if (!isOpen || !exercise) return null;

  const [sets, setSets] = useState(exercise.sets || 3);
  const [reps, setReps] = useState(exercise.reps || '10〜12回');
  const [gearSetting, setGearSetting] = useState(exercise.gear_setting || 'ダンベル片手 10.0kg（フル装着固定）');
  const [benchAngle, setBenchAngle] = useState(exercise.bench_angle || 'フラット（0°）');

  const repPresets = ['6〜8回', '8〜10回', '10〜12回', '12〜15回', '限界まで'];
  const weightPresets = ['バーベル 20.0kg', 'ダンベル片手 10.0kg', '自重', '自重（チューブアシスト）', 'チューブ2本重ね'];

  const handleSave = () => {
    onSave({
      ...exercise,
      sets: Math.max(1, sets),
      reps,
      gear_setting: gearSetting,
      bench_angle: benchAngle
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#151520] border border-zinc-800 rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-black text-white">種目設定のカスタマイズ</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 種目名表示 */}
        <div className="rounded-xl bg-zinc-950 p-3 border border-zinc-800">
          <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">TARGET: {exercise.target}</div>
          <div className="text-base font-black text-white mt-0.5">{exercise.name}</div>
        </div>

        {/* セット数 */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300">セット数</label>
          <div className="flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 p-2">
            <button
              type="button"
              onClick={() => setSets((s) => Math.max(1, s - 1))}
              className="w-9 h-9 rounded-lg bg-zinc-800 text-white font-black flex items-center justify-center hover:bg-zinc-700 active:scale-95 transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-lg font-black text-white">
              {sets} <span className="text-xs text-zinc-400 font-bold">セット</span>
            </span>
            <button
              type="button"
              onClick={() => setSets((s) => s + 1)}
              className="w-9 h-9 rounded-lg bg-zinc-800 text-white font-black flex items-center justify-center hover:bg-zinc-700 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 目標回数 (Rep) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300">目標回数 (Rep)</label>
          <input
            type="text"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full text-xs font-bold bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-rose-500"
            placeholder="例: 10〜12回"
          />
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {repPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setReps(preset)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition ${
                  reps === preset
                    ? 'bg-rose-600/30 text-rose-300 border-rose-500/50'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* 重量・負荷設定 */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300">使用重量・ギア設定</label>
          <input
            type="text"
            value={gearSetting}
            onChange={(e) => setGearSetting(e.target.value)}
            className="w-full text-xs font-bold bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-rose-500"
            placeholder="例: ダンベル片手 10.0kg"
          />
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {weightPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setGearSetting(preset)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition ${
                  gearSetting.includes(preset)
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* ベンチ角度 */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300">ベンチ台角度</label>
          <select
            value={benchAngle}
            onChange={(e) => setBenchAngle(e.target.value)}
            className="w-full text-xs font-bold bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-rose-500"
          >
            <option value="フラット（0°）">フラット（0°）</option>
            <option value="デクライン（またはヒップリフト）">デクライン（またはヒップリフト）</option>
            <option value="インクライン 30°〜45°">インクライン（30°〜45°）</option>
            <option value="インクライン 45°〜60°">インクライン（45°〜60°）</option>
            <option value="直角寄り（75°〜80°）">直角寄り（75°〜80°）</option>
            <option value="なし（懸垂スタンド）">なし（懸垂スタンド）</option>
            <option value="立位">立位</option>
          </select>
        </div>

        {/* 保存ボタン */}
        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30"
          >
            <Check className="w-4 h-4" />
            設定を反映
          </button>
        </div>
      </div>
    </div>
  );
}

// 種目ピッカーモーダル（手動メニュー追加・ゼロから手動編成）
export function AddExercisePickerModal({
  isOpen,
  onClose,
  exercisesMaster = [],
  onSelectExercises,
  alreadySelectedIds = []
}) {
  if (!isOpen) return null;

  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'push' | 'pull'
  const [selectedIds, setSelectedIds] = useState([]);

  const filteredExercises = exercisesMaster.filter((ex) => {
    if (categoryFilter === 'all') return true;
    return ex.category === categoryFilter;
  });

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const chosen = exercisesMaster.filter((ex) => selectedIds.includes(ex.id));
    onSelectExercises(chosen);
    setSelectedIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#151520] border border-zinc-800 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl flex flex-col max-h-[85vh]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="text-sm font-black text-white">トレーニング種目を選択</h3>
              <p className="text-[11px] text-zinc-400">タップしてメニューに追加したい種目を選択</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 部位フィルター */}
        <div className="flex items-center gap-1.5 shrink-0 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          {[
            { id: 'all', label: `すべて (${exercisesMaster.length})` },
            { id: 'push', label: 'Push (胸・肩前・三頭)' },
            { id: 'pull', label: 'Pull (背中・二頭・肩後)' }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black transition ${
                categoryFilter === cat.id
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 種目リスト */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredExercises.map((ex) => {
            const isChosen = selectedIds.includes(ex.id);
            const isAlreadyInMenu = alreadySelectedIds.includes(ex.id);

            return (
              <div
                key={ex.id}
                onClick={() => toggleSelect(ex.id)}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition flex items-center justify-between gap-3 ${
                  isChosen
                    ? 'bg-rose-600/20 border-rose-500 shadow-md shadow-rose-950/40'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                        ex.category === 'push'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-sky-500/20 text-sky-300'
                      }`}
                    >
                      {ex.category.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400">{ex.target}</span>
                    {isAlreadyInMenu && (
                      <span className="text-[9px] font-bold px-1 rounded bg-zinc-800 text-zinc-400">
                        追加済み
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-black text-white mt-1 truncate">{ex.name}</h4>
                  <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
                    {ex.sets}セット × {ex.reps} | 📐 {ex.bench_angle}
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition ${
                    isChosen
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'border-zinc-700 bg-zinc-950 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* フッターアクション */}
        <div className="shrink-0 pt-2 flex items-center justify-between gap-2 border-t border-zinc-800">
          <span className="text-xs font-bold text-zinc-400">
            選択中: <strong className="text-rose-400 font-black">{selectedIds.length}</strong> 種目
          </span>
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={handleConfirm}
            className={`py-3 px-5 rounded-xl font-black text-xs transition flex items-center gap-1.5 ${
              selectedIds.length > 0
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            メニューに追加する
          </button>
        </div>
      </div>
    </div>
  );
}
