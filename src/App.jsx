import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Dumbbell,
  Flame,
  Calendar as CalendarIcon,
  RotateCcw,
  Play,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Trophy,
  Zap,
  SkipForward,
  Plus,
  Wrench,
  FileJson,
  Cloud,
  UploadCloud,
  DownloadCloud,
  Download,
  Upload,
  X
} from 'lucide-react';
import defaultExercises from './data/exercises.json';
import { INITIAL_PAST_HISTORY } from './data/pastHistory';
import {
  DUMBBELL_PRESETS,
  TUBE_PRESETS,
  COMBINED_TUBE_PRESETS,
  HARDWARE_GALLERY,
  NIA_LINES
} from './data/hardware';
import { soundManager } from './utils/soundAndSpeech';
import { cloudSync } from './utils/cloudSync';
import NiaAvatar from './components/NiaAvatar';
import GearVisualizer from './components/GearVisualizer';

const STORAGE_KEY = 'gachafit_nia_state_v3';
const LEGACY_KEYS = ['gachafit_nia_state_v2', 'gachafit_nia_state_v1'];

// 今日の日付キー (YYYY-MM-DD)
function getDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 連続達成日数（ストリーク）の算出
function calculateStreak(historyMap) {
  let streak = 0;
  const cursor = new Date();
  const todayKey = getDateKey(cursor);

  if (!historyMap[todayKey]) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = getDateKey(cursor);
    if (historyMap[key]) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export default function App() {
  // LocalStorageからの初期状態復元（旧バージョンからの履歴・設定シームレス引き継ぎ）
  const [savedState, setSavedState] = useState(() => {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      let legacyData = {};
      if (!raw) {
        // 旧キーから履歴と設定を探索して引き継ぐ
        for (const lk of LEGACY_KEYS) {
          const lRaw = localStorage.getItem(lk);
          if (lRaw) {
            legacyData = JSON.parse(lRaw);
            break;
          }
        }
      }
      const source = raw ? JSON.parse(raw) : legacyData;
      if (source && Object.keys(source).length > 0) {
        return {
          syncProvider: source.syncProvider || 'gist',
          githubToken: source.githubToken || '',
          gistId: source.gistId || '57407a144f486faa900e00818e389a0b',
          cfSyncKey: source.cfSyncKey || '',
          lastSyncedAt: source.lastSyncedAt || null,
          voiceEnabled: source.voiceEnabled !== undefined ? source.voiceEnabled : true,
          menuCount: source.menuCount || 4,
          customExercises: null, // 最新の10kg固定＆チューブ2本＆懸垂アシスト版を即時適用
          history: { ...INITIAL_PAST_HISTORY, ...(source.history || {}) }
        };
      }
    } catch {
      // パース失敗時はデフォルト値を使用
    }
    return {
      history: { ...INITIAL_PAST_HISTORY },
      voiceEnabled: true,
      menuCount: 4,
      customExercises: null,
      syncProvider: 'gist',
      githubToken: '',
      gistId: '57407a144f486faa900e00818e389a0b',
      cfSyncKey: '',
      lastSyncedAt: null
    };
  });

  // 状態変更時にLocalStorageへ自動保存
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
    } catch {
      // ストレージ上限エラー時は無視
    }
  }, [savedState]);

  // 有効な種目マスターデータ（カスタム変更があれば優先）
  const exercisesMaster = useMemo(() => {
    if (Array.isArray(savedState.customExercises) && savedState.customExercises.length > 0) {
      return savedState.customExercises;
    }
    return defaultExercises;
  }, [savedState.customExercises]);

  // ナビゲーションタブ: 'home' | 'workout' | 'calendar' | 'gear'
  const [activeTab, setActiveTab] = useState('home');

  // ガチャモード: 'push' | 'pull' | 'all'
  const [gachaMode, setGachaMode] = useState('all');
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningPreview, setSpinningPreview] = useState([]);
  const [todaysMenu, setTodaysMenu] = useState([]);

  // ニアの状態（セリフ＆表情＆モード）
  const [niaDialogue, setNiaDialogue] = useState(NIA_LINES.boot[0]);
  const [niaEmotion, setNiaEmotion] = useState('blush');

  // ワークアウト進行管理
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSetsLog, setCompletedSetsLog] = useState({});
  const [isInterval, setIsInterval] = useState(false);
  const [intervalSecLeft, setIntervalSecLeft] = useState(0);
  const [intervalTotalSec, setIntervalTotalSec] = useState(90);
  const [workoutFinished, setWorkoutFinished] = useState(false);

  // カレンダー表示月と選択日
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState(getDateKey());

  // JSONマスターデータ編集モーダル
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonDraft, setJsonDraft] = useState('');
  const [jsonError, setJsonError] = useState('');

  // クラウド同期モーダル管理
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const streakCount = useMemo(
    () => calculateStreak(savedState.history || {}),
    [savedState.history]
  );
  const totalDaysCount = useMemo(
    () => Object.keys(savedState.history || {}).length,
    [savedState.history]
  );
  const todayCompleted = Boolean(savedState.history?.[getDateKey()]);
  const isCloudConfigured = Boolean(
    (savedState.syncProvider === 'gist' && savedState.githubToken) ||
      (savedState.syncProvider === 'cf_kv' && savedState.cfSyncKey)
  );

  // セリフ変更＆音声読み上げヘルパー
  const triggerNiaLine = (line, emotion = 'serious', speakNow = true) => {
    setNiaDialogue(line);
    setNiaEmotion(emotion);
    if (speakNow) {
      soundManager.speak(line, savedState.voiceEnabled);
    }
  };

  // クラウドへ保存（Push）
  const handleCloudPush = async (overrideHistory = null, silent = false) => {
    const targetHistory = overrideHistory || savedState.history;
    const payload = {
      history: targetHistory,
      customExercises: savedState.customExercises,
      menuCount: savedState.menuCount
    };

    try {
      setSyncBusy(true);
      if (!silent) setSyncStatusMsg('クラウドへ送信中...');

      if (savedState.syncProvider === 'gist') {
        const res = await cloudSync.pushToGist({
          token: savedState.githubToken,
          gistId: savedState.gistId,
          payload
        });
        setSavedState((prev) => ({
          ...prev,
          gistId: res.gistId,
          lastSyncedAt: res.updatedAt || new Date().toISOString()
        }));
        if (!silent) {
          setSyncStatusMsg(`✅ GitHub Gistへ同期完了 (Gist ID: ${res.gistId})`);
        }
      } else {
        const res = await cloudSync.pushToCloudflareKV({
          syncKey: savedState.cfSyncKey,
          payload
        });
        setSavedState((prev) => ({
          ...prev,
          lastSyncedAt: res.updatedAt || new Date().toISOString()
        }));
        if (!silent) {
          setSyncStatusMsg('✅ Cloudflare KVへ同期完了！');
        }
      }
    } catch (err) {
      if (!silent) setSyncStatusMsg(`❌ ${err.message}`);
    } finally {
      setSyncBusy(false);
    }
  };

  // クラウドから取得＆マージ（Pull）
  const handleCloudPull = async () => {
    try {
      setSyncBusy(true);
      setSyncStatusMsg('クラウドから履歴を取得中...');

      const remoteData =
        savedState.syncProvider === 'gist'
          ? await cloudSync.pullFromGist({
              token: savedState.githubToken,
              gistId: savedState.gistId
            })
          : await cloudSync.pullFromCloudflareKV({
              syncKey: savedState.cfSyncKey
            });

      const mergedHistory = {
        ...INITIAL_PAST_HISTORY,
        ...(savedState.history || {}),
        ...(remoteData.history || {})
      };

      setSavedState((prev) => ({
        ...prev,
        history: mergedHistory,
        customExercises: remoteData.customExercises || prev.customExercises,
        lastSyncedAt: new Date().toISOString()
      }));

      setSyncStatusMsg(
        `✅ 同期完了！全 ${Object.keys(mergedHistory).length} 日分の記録を統合しました`
      );
      triggerNiaLine(
        'クラウドから最新の筋トレ記録を同期したわよ！これでスマホでもPCでもサボれないわね！',
        'smile',
        true
      );
    } catch (err) {
      setSyncStatusMsg(`❌ ${err.message}`);
    } finally {
      setSyncBusy(false);
    }
  };

  // ローカルJSONファイルとしてバックアップ書き出し
  const handleExportBackupFile = () => {
    const dataStr = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        history: savedState.history,
        customExercises: savedState.customExercises
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gachafit_backup_${getDateKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ローカルJSONファイルからインポート＆マージ
  const handleImportBackupFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const mergedHistory = {
          ...INITIAL_PAST_HISTORY,
          ...(savedState.history || {}),
          ...(parsed.history || {})
        };
        setSavedState((prev) => ({
          ...prev,
          history: mergedHistory,
          customExercises: parsed.customExercises || prev.customExercises
        }));
        setSyncStatusMsg(
          `✅ ファイルから全 ${Object.keys(mergedHistory).length} 日分の履歴を統合しました`
        );
      } catch (err) {
        setSyncStatusMsg(`❌ ファイル読み込み失敗: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // ガチャ抽選実行（1タップで3〜4種目をランダム選出）
  const handleRollGacha = (isReroll = false) => {
    if (isSpinning) return;
    soundManager.initAudio();

    const pool =
      gachaMode === 'all'
        ? exercisesMaster
        : exercisesMaster.filter((ex) => ex.category === gachaMode);

    const count = Math.min(savedState.menuCount || 4, pool.length);

    setIsSpinning(true);
    setWorkoutFinished(false);

    let tick = 0;
    const spinInterval = setInterval(() => {
      tick += 1;
      soundManager.playGachaTick(tick);
      const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
      setSpinningPreview(shuffled);

      if (tick >= 8) {
        clearInterval(spinInterval);
        const finalPicked = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
        setTodaysMenu(finalPicked);
        setIsSpinning(false);
        setCurrentExIndex(0);
        setCurrentSet(1);
        setCompletedSetsLog({});
        setIsInterval(false);
        soundManager.playGachaReveal();

        const line = isReroll
          ? NIA_LINES.gachaReady[2]
          : NIA_LINES.gachaReady[0];
        triggerNiaLine(line, isReroll ? 'surprise' : 'serious', true);
      }
    }, 85);
  };

  // ワークアウト開始
  const startWorkout = (startIndex = 0) => {
    if (todaysMenu.length === 0) return;
    setCurrentExIndex(startIndex);
    setCurrentSet(1);
    setIsInterval(false);
    setWorkoutFinished(false);
    setActiveTab('workout');
    triggerNiaLine(NIA_LINES.activeSet[0], 'serious', true);
  };

  // インターバルタイマーのカウントダウン処理（10秒・5秒・0秒で効果音＆バイブ＆セリフ連動）
  useEffect(() => {
    if (!isInterval) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setIntervalSecLeft((prev) => {
        const next = prev - 1;
        if (next === 10) {
          soundManager.playCountdownAlert(10);
          triggerNiaLine(NIA_LINES.interval10Sec, 'surprise', true);
        } else if (next === 5) {
          soundManager.playCountdownAlert(5);
          setNiaDialogue(NIA_LINES.interval5Sec);
        } else if (next <= 3 && next > 0) {
          soundManager.playCountdownAlert(next);
        } else if (next <= 0) {
          clearInterval(timerRef.current);
          soundManager.playCountdownAlert(0);
          handleAdvanceAfterInterval();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isInterval, currentExIndex, currentSet, todaysMenu]);

  // インターバル終了後、次セットまたは次種目へ自動進行
  const handleAdvanceAfterInterval = () => {
    setIsInterval(false);
    const currentExercise = todaysMenu[currentExIndex];
    if (!currentExercise) return;

    if (currentSet < currentExercise.sets) {
      const nextSet = currentSet + 1;
      setCurrentSet(nextSet);
      const line =
        nextSet === currentExercise.sets
          ? `ラスト${nextSet}セット目よ！プレートと角度、ちゃんと合わせた？肘開かない！胸張る！あと3回！`
          : `${nextSet}セット目スタート！${NIA_LINES.activeSet[0]}`;
      triggerNiaLine(line, 'serious', true);
    } else if (currentExIndex < todaysMenu.length - 1) {
      const nextExIdx = currentExIndex + 1;
      const nextEx = todaysMenu[nextExIdx];
      setCurrentExIndex(nextExIdx);
      setCurrentSet(1);
      triggerNiaLine(
        `次は「${nextEx.name}」よ！ベンチ角度は${nextEx.bench_angle}、ギアを素早くセットしなさい！`,
        'serious',
        true
      );
    }
  };

  // 「セット完了」1タップ処理
  const handleCompleteSet = () => {
    const currentExercise = todaysMenu[currentExIndex];
    if (!currentExercise) return;

    const updatedLog = {
      ...completedSetsLog,
      [currentExercise.id]: (completedSetsLog[currentExercise.id] || 0) + 1
    };
    setCompletedSetsLog(updatedLog);

    const isLastSetOfEx = currentSet >= currentExercise.sets;
    const isLastEx = currentExIndex >= todaysMenu.length - 1;

    if (isLastSetOfEx && isLastEx) {
      completeEntireWorkout(updatedLog);
      return;
    }

    soundManager.playSetDone();
    const sec = currentExercise.interval_sec || 90;
    setIntervalTotalSec(sec);
    setIntervalSecLeft(sec);
    setIsInterval(true);
    triggerNiaLine(NIA_LINES.intervalStart[0], 'normal', true);
  };

  // 全ワークアウト完了＆LocalStorage保存＆自動クラウド同期処理
  const completeEntireWorkout = (finalLog) => {
    setIsInterval(false);
    setWorkoutFinished(true);
    soundManager.playWorkoutComplete();

    const todayKey = getDateKey();
    const totalSets = todaysMenu.reduce((acc, ex) => acc + (ex.sets || 3), 0);

    const nextHistory = {
      ...(savedState.history || {}),
      [todayKey]: {
        completedAt: new Date().toISOString(),
        mode: gachaMode,
        exercises: todaysMenu.map((ex) => ({
          id: ex.id,
          name: ex.name,
          target: ex.target,
          gear_setting: ex.gear_setting,
          sets: finalLog[ex.id] || ex.sets
        })),
        totalSets
      }
    };

    setSavedState((prev) => ({
      ...prev,
      history: nextHistory
    }));

    // クラウド同期設定済みの場合はバックグラウンドで自動Push
    if (isCloudConfigured) {
      handleCloudPush(nextHistory, true);
    }

    triggerNiaLine(NIA_LINES.complete[0], 'blush', true);
  };

  // カレンダーグリッド生成
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      cells.push({
        day: d,
        dateKey: getDateKey(dateObj)
      });
    }
    return cells;
  }, [calendarMonth]);

  const currentExercise = todaysMenu[currentExIndex] || null;

  return (
    <div className="min-h-screen bg-[#0B0B10] text-zinc-100 pb-24 max-w-md mx-auto relative shadow-2xl border-x border-zinc-900/80">
      {/* トップヘッダー：アプリタイトル＆クラウド同期＆連続ストリーク表示 */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0B0B10]/90 border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-purple-700 flex items-center justify-center shadow-md shadow-rose-600/30">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black tracking-tight text-white">
                GachaFit
              </h1>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                with ニア
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">
              1タップ自宅トレ（胸・肩・腕・背中）
            </p>
          </div>
        </div>

        {/* クラウド同期ボタン ＆ ストリークバッジ */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSyncStatusMsg('');
              setShowSyncModal(true);
            }}
            title="PC・スマホ間の履歴クラウド同期"
            className={`p-2 rounded-xl border transition ${
              isCloudConfigured
                ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 transition"
          >
            <Flame
              className={`w-4 h-4 ${
                streakCount > 0 ? 'text-orange-500 fill-orange-500' : 'text-zinc-500'
              }`}
            />
            <div className="text-left">
              <div className="text-[9px] text-zinc-400 leading-none">連続 / 累計</div>
              <div className="text-xs font-black text-white leading-tight">
                {streakCount}日 <span className="text-[10px] text-zinc-400">({totalDaysCount})</span>
              </div>
            </div>
          </button>
        </div>
      </header>

      {/* メインコンテンツ領域 */}
      <main className="px-4 pt-3 space-y-4">
        {/* ニアの常駐アバター＆ボイスバー */}
        <NiaAvatar
          mode={activeTab === 'workout' && isInterval ? 'chibi' : 'standing'}
          emotion={niaEmotion}
          dialogue={niaDialogue}
          voiceEnabled={savedState.voiceEnabled}
          onToggleVoice={() =>
            setSavedState((prev) => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))
          }
          onReplayVoice={() => soundManager.speak(niaDialogue, true)}
          intervalRemaining={isInterval ? intervalSecLeft : null}
          compact={activeTab !== 'home'}
        />

        {/* ==================== ① ホーム（ルーレット／ガチャ画面） ==================== */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#151520] border border-zinc-800/90 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-rose-500" />
                  1. ターゲット部位モードを選択
                </span>
                <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                  {[3, 4].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() =>
                        setSavedState((prev) => ({ ...prev, menuCount: cnt }))
                      }
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition ${
                        (savedState.menuCount || 4) === cnt
                          ? 'bg-rose-600 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {cnt}種目
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'push',
                    title: 'Push',
                    sub: '胸・肩前・三頭',
                    badge: '押す日'
                  },
                  {
                    id: 'pull',
                    title: 'Pull',
                    sub: '背中・二頭・肩後',
                    badge: '引く日'
                  },
                  {
                    id: 'all',
                    title: 'オールスター',
                    sub: '上半身まんべんなく',
                    badge: `全${exercisesMaster.length}種目`
                  }
                ].map((m) => {
                  const selected = gachaMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setGachaMode(m.id)}
                      className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition active:scale-95 ${
                        selected
                          ? 'bg-gradient-to-br from-rose-600/25 to-purple-700/20 border-rose-500 text-white shadow-lg shadow-rose-950/50'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded mb-1 ${
                          selected
                            ? 'bg-rose-600 text-white'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {m.badge}
                      </span>
                      <span className="text-xs font-black text-zinc-100">
                        {m.title}
                      </span>
                      <span className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                        {m.sub}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={() => handleRollGacha(false)}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-black text-sm shadow-lg shadow-rose-600/30 active:scale-[0.98] transition flex items-center justify-center gap-2"
                >
                  <Sparkles className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                  {isSpinning
                    ? 'ガチャ抽選中...'
                    : todaysMenu.length > 0
                    ? '今日のメニューを再抽選'
                    : '今日のメニューを生成（1タップ）'}
                </button>

                {todaysMenu.length > 0 && !isSpinning && (
                  <button
                    type="button"
                    onClick={() => handleRollGacha(true)}
                    title="リロール（引き直し）"
                    className="px-3.5 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-xs flex items-center gap-1 active:scale-95 transition shrink-0"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-400" />
                    リロール
                  </button>
                )}
              </div>
            </div>

            {isSpinning && (
              <div className="space-y-2.5">
                {spinningPreview.map((ex, i) => (
                  <div
                    key={`${ex.id}-${i}`}
                    className="animate-slotSpin rounded-2xl bg-zinc-900/90 border border-rose-500/40 p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-rose-400">
                        SLOT #{i + 1}
                      </span>
                      <div className="text-sm font-black text-white">{ex.name}</div>
                      <div className="text-xs text-zinc-400">{ex.gear_setting}</div>
                    </div>
                    <div className="text-xs font-extrabold text-amber-300">
                      {ex.bench_angle}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isSpinning && todaysMenu.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="text-xs font-black text-zinc-200 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    本日の確定メニュー（全{todaysMenu.length}種目）
                  </div>
                  <button
                    type="button"
                    onClick={() => startWorkout(0)}
                    className="text-xs font-extrabold text-rose-400 hover:text-rose-300 flex items-center gap-0.5"
                  >
                    すぐ開始 <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {todaysMenu.map((ex, idx) => {
                  const doneSets = completedSetsLog[ex.id] || 0;
                  return (
                    <div
                      key={ex.id}
                      onClick={() => startWorkout(idx)}
                      className="group cursor-pointer rounded-2xl bg-[#151520] hover:bg-[#1B1B29] border border-zinc-800 hover:border-rose-500/50 p-3.5 transition shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                                  ex.category === 'push'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-sky-500/20 text-sky-300'
                                }`}
                              >
                                {ex.category.toUpperCase()}
                              </span>
                              <span className="text-[11px] font-bold text-zinc-400">
                                {ex.target}
                              </span>
                            </div>
                            <h3 className="text-sm font-black text-white mt-1 group-hover:text-rose-300 transition leading-snug break-words">
                              {ex.name}
                            </h3>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-2">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-[11px] font-extrabold text-zinc-200 whitespace-nowrap">
                            {ex.sets}セット × {ex.reps}
                          </span>
                          {doneSets > 0 && (
                            <div className="text-[10px] font-bold text-emerald-400 mt-1">
                              {doneSets}/{ex.sets} 完了
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                          📐 {ex.bench_angle}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-200 font-bold">
                          🏋️ {ex.gear_setting}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-zinc-400">
                        🔧 {ex.setup_detail}
                      </p>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => startWorkout(0)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-black text-base shadow-xl shadow-emerald-600/25 active:scale-[0.99] transition flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-zinc-950" />
                  このメニューでトレーニング開始！
                </button>
              </div>
            )}

            {!isSpinning && todaysMenu.length === 0 && (
              <div className="rounded-2xl bg-[#151520]/70 border border-dashed border-zinc-800 p-6 text-center space-y-2">
                <p className="text-xs font-bold text-zinc-300">
                  上の「今日のメニューを生成」を1タップ！
                </p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  保有器具（4WD 10kgダンベル・Readaeer 5色チューブ・インクラインベンチ・7in1懸垂スタンド）と過去22回のトレーニング実績に完全最適化したメニューを即座に提示します。
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================== ② ワークアウト実行画面（現場特化） ==================== */}
        {activeTab === 'workout' && (
          <div className="space-y-4">
            {todaysMenu.length === 0 ? (
              <div className="rounded-2xl bg-[#151520] border border-zinc-800 p-6 text-center space-y-3">
                <p className="text-sm font-bold text-zinc-300">
                  まだ今日のメニューが生成されていません
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('home');
                    handleRollGacha(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black"
                >
                  ガチャを回して即スタート
                </button>
              </div>
            ) : workoutFinished ? (
              <div className="rounded-2xl bg-gradient-to-b from-[#1E1524] to-[#151520] border border-rose-500/50 p-5 text-center space-y-4 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-rose-600/20 border-2 border-rose-500 mx-auto flex items-center justify-center">
                  <Trophy className="w-9 h-9 text-amber-400" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-rose-400">
                    WORKOUT COMPLETE!
                  </span>
                  <h2 className="text-xl font-black text-white mt-1">
                    本日の全セット完遂！
                  </h2>
                  <p className="text-xs text-zinc-300 mt-1">
                    カレンダーにニアの達成スタンプを刻印しました（累計 {totalDaysCount} 日達成🔥）
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 p-3 text-left space-y-1.5">
                  <div className="text-[11px] font-bold text-zinc-400">
                    達成メニュー内訳
                  </div>
                  {todaysMenu.map((ex) => (
                    <div
                      key={ex.id}
                      className="flex items-center justify-between text-xs py-1 border-b border-zinc-900 last:border-none"
                    >
                      <span className="font-bold text-zinc-200">{ex.name}</span>
                      <span className="text-emerald-400 font-extrabold">
                        {ex.sets}セット完了 ✓
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('calendar')}
                    className="py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-1.5"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    スタンプ帳を見る
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('home')}
                    className="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs"
                  >
                    ホームへ戻る
                  </button>
                </div>
              </div>
            ) : (
              currentExercise && (
                <>
                  {/* 種目ステップインジケーター（横はみ出し完全防止・均等グリッド） */}
                  <div
                    className="grid gap-1.5 w-full"
                    style={{
                      gridTemplateColumns: `repeat(${todaysMenu.length}, minmax(0, 1fr))`
                    }}
                  >
                    {todaysMenu.map((ex, idx) => {
                      const active = idx === currentExIndex;
                      const done = idx < currentExIndex;
                      return (
                        <button
                          key={ex.id}
                          type="button"
                          onClick={() => {
                            setIsInterval(false);
                            setCurrentExIndex(idx);
                            setCurrentSet(1);
                          }}
                          className={`min-w-0 overflow-hidden py-1.5 px-1.5 rounded-xl border text-center transition ${
                            active
                              ? 'bg-rose-600/25 border-rose-500 text-white font-black'
                              : done
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-500 font-semibold'
                          }`}
                        >
                          <div className="text-[10px] leading-tight">
                            種目 {idx + 1}/{todaysMenu.length}
                          </div>
                          <div className="text-[11px] truncate w-full mt-0.5">
                            {ex.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* 現在実行中の種目ヘッダーカード */}
                  <div className="rounded-2xl bg-[#151520] border border-zinc-800 p-4 space-y-3 shadow-lg">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[11px] font-extrabold">
                          🎯 {currentExercise.target}
                        </span>
                        <h2 className="text-lg font-black text-white mt-1 leading-snug break-words">
                          {currentExercise.name}
                        </h2>
                      </div>
                      <div className="text-right shrink-0 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 ml-2">
                        <div className="text-[10px] text-zinc-400 font-bold">
                          現在セット
                        </div>
                        <div className="text-lg font-black text-rose-400 leading-none">
                          {currentSet}{' '}
                          <span className="text-xs text-zinc-400">
                            / {currentExercise.sets}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 px-3 py-2 flex items-center justify-between">
                        <span className="text-xs text-zinc-400 font-bold">目標回数</span>
                        <span className="text-sm font-black text-emerald-400">
                          {currentExercise.reps}
                        </span>
                      </div>
                      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 px-3 py-2 flex items-center justify-between">
                        <span className="text-xs text-zinc-400 font-bold">休憩設定</span>
                        <span className="text-sm font-black text-sky-400">
                          {currentExercise.interval_sec}秒
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs font-bold text-amber-200 leading-relaxed">
                      💡 フォーム極意：{currentExercise.tips}
                    </div>
                  </div>

                  {/* 現場特化：器具セッティングUIカード */}
                  <GearVisualizer exercise={currentExercise} />

                  {/* インターバル中：自動カウントダウンタイマーUI / 動作中：1タップセット完了ボタン */}
                  {isInterval ? (
                    <div className="rounded-2xl bg-gradient-to-b from-rose-950/60 to-[#151520] border-2 border-rose-500 p-4 space-y-3 shadow-2xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                          ⏱️ 自動インターバルタイマー稼働中
                        </span>
                        <span className="text-[11px] font-bold text-zinc-400">
                          10秒・5秒・0秒で音＆バイブ通知
                        </span>
                      </div>

                      <div className="text-center py-2">
                        <div
                          className={`text-5xl font-black tabular-nums tracking-tight ${
                            intervalSecLeft <= 10
                              ? 'text-rose-400 animate-pulse'
                              : 'text-white'
                          }`}
                        >
                          {intervalSecLeft}
                          <span className="text-lg font-bold text-zinc-400 ml-1">
                            秒
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden mt-3 border border-zinc-800">
                          <div
                            className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-500"
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(100, (intervalSecLeft / intervalTotalSec) * 100)
                              )}%`
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIntervalSecLeft((s) => s + 15)}
                          className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> 15秒延長
                        </button>
                        <button
                          type="button"
                          onClick={handleAdvanceAfterInterval}
                          className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg"
                        >
                          <SkipForward className="w-4 h-4" />
                          休憩をスキップして次セットへ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCompleteSet}
                      className="w-full py-5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-black text-lg shadow-xl shadow-rose-600/30 active:scale-[0.98] transition flex items-center justify-center gap-2.5"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      セット完了！（{currentSet}/{currentExercise.sets}セット目）
                    </button>
                  )}
                </>
              )
            )}
          </div>
        )}

        {/* ==================== ③ カレンダー・継続記録 ==================== */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            {/* ストリーク統計＆クラウド同期バー */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#151520] border border-zinc-800 p-3.5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
                  <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-zinc-400">
                    現在の連続ストリーク
                  </div>
                  <div className="text-xl font-black text-white">
                    {streakCount} <span className="text-xs text-zinc-400">日連続</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#151520] border border-zinc-800 p-3.5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                  <Trophy className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-zinc-400">
                    累計ワークアウト日数
                  </div>
                  <div className="text-xl font-black text-white">
                    {totalDaysCount} <span className="text-xs text-zinc-400">日達成</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PC・スマホ間クラウド履歴同期カード */}
            <div className="rounded-2xl bg-[#151520] border border-sky-500/30 p-3.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-black text-sky-300 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4" />
                  クラウド履歴同期（GitHub Gist / Cloudflare KV）
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
                  {savedState.lastSyncedAt
                    ? `最終同期: ${new Date(savedState.lastSyncedAt).toLocaleString('ja-JP')}`
                    : 'PCとスマホでトレーニング履歴・種目JSONを共有できます'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSyncStatusMsg('');
                  setShowSyncModal(true);
                }}
                className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black shrink-0"
              >
                同期設定
              </button>
            </div>

            {/* カレンダー本体（達成日にニアのスタンプ表示） */}
            <div className="rounded-2xl bg-[#151520] border border-zinc-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                    )
                  }
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-sm font-black text-white">
                  {calendarMonth.getFullYear()}年 {calendarMonth.getMonth() + 1}月
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                    )
                  }
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-500">
                {['日', '月', '火', '水', '木', '金', '土'].map((w) => (
                  <div key={w} className="py-1">
                    {w}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((cell, idx) => {
                  if (!cell) {
                    return <div key={`empty-${idx}`} className="h-12" />;
                  }
                  const record = savedState.history?.[cell.dateKey];
                  const isSelected = selectedDateKey === cell.dateKey;
                  const isToday = cell.dateKey === getDateKey();

                  return (
                    <button
                      key={cell.dateKey}
                      type="button"
                      onClick={() => setSelectedDateKey(cell.dateKey)}
                      className={`relative h-12 rounded-xl border flex flex-col items-center justify-between p-1 transition ${
                        isSelected
                          ? 'border-rose-500 bg-rose-600/20'
                          : record
                          ? 'border-rose-500/40 bg-zinc-900'
                          : 'border-zinc-800/80 bg-zinc-950/60'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold leading-none ${
                          isToday ? 'text-rose-400 font-black' : 'text-zinc-400'
                        }`}
                      >
                        {cell.day}
                      </span>

                      {record ? (
                        <div className="relative w-6 h-6 rounded-full border border-rose-400 overflow-hidden shadow">
                          <img
                            src="./assets/nia_exp_happy.jpg"
                            alt="済"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-rose-600/35 text-[8px] font-black text-white">
                            済
                          </span>
                        </div>
                      ) : (
                        <span className="text-[9px] text-zinc-700">-</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 選択した日のトレーニング履歴詳細 */}
            <div className="rounded-2xl bg-[#151520] border border-zinc-800 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-zinc-200">
                  📅 {selectedDateKey} の記録
                </span>
                {!todayCompleted && selectedDateKey === getDateKey() && (
                  <button
                    type="button"
                    onClick={() => {
                      const todayKey = getDateKey();
                      const nextHistory = {
                        ...(savedState.history || {}),
                        [todayKey]: {
                          completedAt: new Date().toISOString(),
                          mode: gachaMode,
                          exercises:
                            todaysMenu.length > 0
                              ? todaysMenu
                              : defaultExercises.slice(0, 3),
                          totalSets: 9
                        }
                      };
                      setSavedState((prev) => ({
                        ...prev,
                        history: nextHistory
                      }));
                      if (isCloudConfigured) {
                        handleCloudPush(nextHistory, true);
                      }
                      soundManager.playWorkoutComplete();
                      triggerNiaLine(NIA_LINES.complete[0], 'blush', true);
                    }}
                    className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/40"
                  >
                    ＋ 今日のスタンプを押す
                  </button>
                )}
              </div>

              {savedState.history?.[selectedDateKey] ? (
                <div className="space-y-1.5">
                  {savedState.history[selectedDateKey].exercises?.map((ex, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2"
                    >
                      <div>
                        <div className="font-black text-white">{ex.name}</div>
                        <div className="text-[11px] text-zinc-400">
                          {ex.gear_setting}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[11px] shrink-0">
                        {ex.sets}セット完了
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-2">
                  この日の完了記録はまだありません。
                </p>
              )}
            </div>
          </div>
        )}

        {/* ==================== ④ 保有ギア仕様＆種目マスターJSON管理 ==================== */}
        {activeTab === 'gear' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#151520] border border-rose-500/40 p-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  <FileJson className="w-4 h-4 text-rose-400" />
                  種目マスターデータ（JSON）カスタマイズ
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  現在 {exercisesMaster.length} 種目登録中。重量やレップ数、新規種目を自由に編集できます。
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setJsonDraft(JSON.stringify(exercisesMaster, null, 2));
                  setJsonError('');
                  setShowJsonModal(true);
                }}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shrink-0"
              >
                JSONを編集
              </button>
            </div>

            <div className="rounded-2xl bg-[#151520] border border-zinc-800 p-4 space-y-3">
              <div>
                <h3 className="text-sm font-black text-white">
                  ① 4WD 可変式ダンベル（最大片手10kg）組み合わせ表
                </h3>
                <p className="text-[11px] text-zinc-400">
                  シャフト＋カラー：約0.5kg ／ プレート：1.25kg×4、1.5kg×4、2.0kg×4
                </p>
              </div>
              <div className="space-y-1.5">
                {DUMBBELL_PRESETS.map((d) => (
                  <div
                    key={d.weight}
                    className="flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs"
                  >
                    <span
                      className={`px-2 py-0.5 rounded font-black text-white bg-gradient-to-r ${d.color}`}
                    >
                      {d.label}
                    </span>
                    <span className="font-bold text-zinc-300 text-[11px]">
                      {d.formula}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#151520] border border-zinc-800 p-4 space-y-3">
              <h3 className="text-sm font-black text-white">
                ② Readaeer レジスタンスチューブ（5段階）
              </h3>
              <div className="space-y-1.5">
                {TUBE_PRESETS.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs"
                  >
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-extrabold border ${t.badgeClass}`}
                    >
                      {t.emoji} {t.name} ({t.lbs} / {t.kg})
                    </span>
                    <span className="text-[11px] font-bold text-zinc-300">
                      {t.usage}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* チューブ2本重ねハイパワー組み合わせ */}
            <div className="rounded-2xl bg-[#151520] border border-amber-500/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                  ⚡ チューブ2本重ね（束ね持ち・2本連結）ハイパワー設定
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  最大41kg
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                2本を束ねてハンドルを通すか、カラビナ連結でジムのマシンと同等〜それ以上の高負荷を実現！
              </p>
              <div className="space-y-1.5">
                {COMBINED_TUBE_PRESETS.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-zinc-900/90 border border-zinc-800 px-3 py-2 text-xs"
                  >
                    <span className="inline-flex items-center gap-1.5 font-black text-white">
                      <span>{c.emoji}</span>
                      <span>{c.name}</span>
                      <span className="text-amber-400 text-[11px]">({c.kg} / {c.lbs})</span>
                    </span>
                    <span className="text-[11px] font-bold text-zinc-300">
                      {c.usage}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#151520] border border-zinc-800 p-4 space-y-3">
              <h3 className="text-sm font-black text-white">
                ③④ 保有ハードウェア実機リファレンス
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {HARDWARE_GALLERY.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col"
                  >
                    <div className="h-36 bg-white flex items-center justify-center p-1">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="p-2.5">
                      <div className="text-xs font-black text-white leading-snug">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {item.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* クラウド履歴同期モーダル（GitHub Gist / Cloudflare KV / JSONファイル入出力） */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#151520] border border-zinc-700 p-4 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-sky-400" />
                クラウド履歴同期（PC ⇄ スマホ）
              </h3>
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 同期プロバイダー選択 */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setSavedState((p) => ({ ...p, syncProvider: 'gist' }))
                }
                className={`py-2 px-3 rounded-xl border text-xs font-black transition ${
                  savedState.syncProvider === 'gist'
                    ? 'bg-sky-600/20 border-sky-500 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                GitHub Gist 同期
                <div className="text-[10px] font-normal text-zinc-400">
                  GitHub / CF Pages 両対応
                </div>
              </button>
              <button
                type="button"
                onClick={() =>
                  setSavedState((p) => ({ ...p, syncProvider: 'cf_kv' }))
                }
                className={`py-2 px-3 rounded-xl border text-xs font-black transition ${
                  savedState.syncProvider === 'cf_kv'
                    ? 'bg-sky-600/20 border-sky-500 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                Cloudflare KV 同期
                <div className="text-[10px] font-normal text-zinc-400">
                  CF Pages Functions用
                </div>
              </button>
            </div>

            {savedState.syncProvider === 'gist' ? (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                    GitHub Personal Access Token (`gist` スコープ権限)
                  </label>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={savedState.githubToken || ''}
                    onChange={(e) =>
                      setSavedState((p) => ({ ...p, githubToken: e.target.value }))
                    }
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                    Gist ID（初回は空欄のままでOK → 保存時に自動発行）
                  </label>
                  <input
                    type="text"
                    placeholder="自動発行されたGist IDをスマホ側にも入力"
                    value={savedState.gistId || ''}
                    onChange={(e) =>
                      setSavedState((p) => ({ ...p, gistId: e.target.value }))
                    }
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-emerald-300 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                  同期用シークレットキー（PCとスマホで同じ合言葉を入力）
                </label>
                <input
                  type="password"
                  placeholder="例: nia-secret-key-2026"
                  value={savedState.cfSyncKey || ''}
                  onChange={(e) =>
                    setSavedState((p) => ({ ...p, cfSyncKey: e.target.value }))
                  }
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            )}

            {/* Push / Pull 実行ボタン */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                disabled={syncBusy}
                onClick={() => handleCloudPush(null, false)}
                className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-black flex items-center justify-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4" />
                クラウドへ保存
              </button>
              <button
                type="button"
                disabled={syncBusy}
                onClick={handleCloudPull}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black flex items-center justify-center gap-1.5"
              >
                <DownloadCloud className="w-4 h-4" />
                クラウドから取得
              </button>
            </div>

            {syncStatusMsg && (
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-xs font-bold text-zinc-200 break-all">
                {syncStatusMsg}
              </div>
            )}

            {/* ローカルJSONバックアップ入出力 */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-zinc-400">
                JSONファイル直接バックアップ:
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handleExportBackupFile}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> 書き出し
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" /> 読み込み
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  onChange={handleImportBackupFile}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JSONマスターデータ編集モーダル */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#151520] border border-zinc-700 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <FileJson className="w-4 h-4 text-rose-400" />
                種目マスターデータ（JSON）編集
              </h3>
              <button
                type="button"
                onClick={() => setShowJsonModal(false)}
                className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={jsonDraft}
              onChange={(e) => setJsonDraft(e.target.value)}
              rows={12}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-rose-500"
            />
            {jsonError && (
              <p className="text-xs font-bold text-rose-400">{jsonError}</p>
            )}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setSavedState((prev) => ({ ...prev, customExercises: null }));
                  setShowJsonModal(false);
                }}
                className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
              >
                初期JSONに戻す
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(jsonDraft);
                    if (!Array.isArray(parsed) || parsed.length === 0) {
                      setJsonError('配列形式のJSONを入力してください');
                      return;
                    }
                    setSavedState((prev) => ({
                      ...prev,
                      customExercises: parsed
                    }));
                    setShowJsonModal(false);
                  } catch (err) {
                    setJsonError(`JSON構文エラー: ${err.message}`);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-black"
              >
                保存して反映
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ボトムナビゲーションバー（親指1タップ操作） */}
      <nav className="fixed bottom-0 inset-x-0 z-30 max-w-md mx-auto backdrop-blur-xl bg-[#0B0B10]/95 border-t border-zinc-800/90 px-3 py-2 grid grid-cols-4 gap-1">
        {[
          { id: 'home', label: 'ガチャ', icon: Sparkles },
          { id: 'workout', label: '実践トレ', icon: Dumbbell },
          { id: 'calendar', label: 'スタンプ帳', icon: CalendarIcon },
          { id: 'gear', label: '保有ギア/JSON', icon: Wrench }
        ].map((item) => {
          const IconComponent = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
                active
                  ? 'bg-rose-600/20 text-rose-400 font-black'
                  : 'text-zinc-500 hover:text-zinc-300 font-semibold'
              }`}
            >
              <IconComponent className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
