// Web Audio APIによる効果音合成 & Web Speech APIによるニアの日本語ボイス読み上げモジュール

class SoundAndSpeechManager {
  constructor() {
    this.audioCtx = null;
  }

  // AudioContextの遅延初期化（ユーザー操作後に有効化）
  initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // 端末バイブレーション実行
  vibrate(pattern = [200, 100, 200]) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // 非対応端末では無視
      }
    }
  }

  // 単音ビープ生成
  playTone(freq = 880, duration = 0.12, type = 'sine', gainVal = 0.18, delay = 0) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime + delay;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // オーディオエラー時は無視
    }
  }

  // ガチャ回転時のスロット音
  playGachaTick(step = 0) {
    const freqs = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    const freq = freqs[step % freqs.length];
    this.playTone(freq, 0.06, 'triangle', 0.12);
  }

  // ガチャ確定時のファンファーレ
  playGachaReveal() {
    this.playTone(523.25, 0.1, 'triangle', 0.18, 0);
    this.playTone(659.25, 0.1, 'triangle', 0.18, 0.08);
    this.playTone(783.99, 0.12, 'triangle', 0.2, 0.16);
    this.playTone(1046.5, 0.28, 'sine', 0.24, 0.25);
    this.vibrate([80, 50, 120]);
  }

  // セット完了ボタン押下音
  playSetDone() {
    this.playTone(659.25, 0.09, 'sine', 0.2, 0);
    this.playTone(880, 0.18, 'sine', 0.22, 0.09);
    this.vibrate([100]);
  }

  // インターバル残り10秒・5秒カウント音 + バイブレーション
  playCountdownAlert(secondsLeft) {
    if (secondsLeft === 10) {
      this.playTone(784, 0.12, 'square', 0.15, 0);
      this.playTone(784, 0.12, 'square', 0.15, 0.16);
      this.vibrate([200, 100, 200]);
    } else if (secondsLeft === 5) {
      this.playTone(880, 0.14, 'sawtooth', 0.16, 0);
      this.vibrate([200, 100, 200]);
    } else if (secondsLeft <= 3 && secondsLeft > 0) {
      this.playTone(880, 0.1, 'sine', 0.15, 0);
    } else if (secondsLeft === 0) {
      // 0秒ゴング（次のセット開始合図）
      this.playTone(1046.5, 0.15, 'triangle', 0.25, 0);
      this.playTone(1318.5, 0.35, 'triangle', 0.28, 0.14);
      this.vibrate([200, 100, 200]);
    }
  }

  // 全ワークアウト完了ファンファーレ
  playWorkoutComplete() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    const times = [0, 0.1, 0.2, 0.32, 0.46, 0.58];
    const durs = [0.1, 0.1, 0.12, 0.14, 0.12, 0.45];
    notes.forEach((n, i) => {
      this.playTone(n, durs[i], 'triangle', 0.22, times[i]);
    });
    this.vibrate([200, 100, 200, 100, 350]);
  }

  // Web Speech API によるニアのセリフ読み上げ
  speak(text, enabled = true) {
    if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      // 絵文字や記号を読み上げ用にクリーンアップ
      const cleanText = text.replace(/[🟡🔴🔵🟢⚫📐🏋️🔥⚡]/gu, '');
      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.lang = 'ja-JP';
      // ツンデレ×熱血少女らしい少し高め・テンポ良しのピッチと速度
      utter.pitch = 1.25;
      utter.rate = 1.12;
      utter.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const jaVoice =
        voices.find((v) => v.lang.includes('ja') && (v.name.includes('Kyoko') || v.name.includes('Haruka') || v.name.includes('Nanami') || v.name.includes('Google'))) ||
        voices.find((v) => v.lang.includes('ja'));
      if (jaVoice) {
        utter.voice = jaVoice;
      }
      window.speechSynthesis.speak(utter);
    } catch {
      // SpeechSynthesis未対応環境では無視
    }
  }
}

export const soundManager = new SoundAndSpeechManager();
