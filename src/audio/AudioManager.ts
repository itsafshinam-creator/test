class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private sfxVolume = 0.7;
  private musicVolume = 0.5;
  private isMuted = false;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying = false;
  private ambientInterval: number | null = null;
  private isAlertMusic = false;

  private constructor() {
    // Initialized lazily on first user interaction
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(sfx: number, music: number) {
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    this.musicVolume = Math.max(0, Math.min(1, music));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.musicVolume * 0.25, this.ctx.currentTime);
    }
  }

  public setAlertState(alert: boolean) {
    this.isAlertMusic = alert;
  }

  public startAmbient() {
    if (this.isAmbientPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isAmbientPlaying = true;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.musicVolume * 0.2, this.ctx.currentTime);
    this.ambientGain.connect(this.ctx.destination);

    // Procedural Dark Fantasy Ambient Chord Loop
    const baseFreqs = [110, 130.81, 164.81, 196]; // A2, C3, E3, G3 (A minor 7)
    const alertFreqs = [116.54, 138.59, 174.61, 233.08]; // Bb minor (dissonant tense)

    const playChordNote = () => {
      if (!this.ctx || !this.ambientGain || !this.isAmbientPlaying) return;
      const freqs = this.isAlertMusic ? alertFreqs : baseFreqs;
      const freq = freqs[Math.floor(Math.random() * freqs.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = this.isAlertMusic ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(this.isAlertMusic ? 800 : 400, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      const dur = this.isAlertMusic ? 1.5 : 4.0;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + dur * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      osc.start(now);
      osc.stop(now + dur);
    };

    playChordNote();
    this.ambientInterval = window.setInterval(playChordNote, 2500);
  }

  public stopAmbient() {
    this.isAmbientPlaying = false;
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }

  public playFootstep(isCrouching = false) {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isCrouching ? 65 : 85, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isCrouching ? 150 : 250, now);

    const vol = (isCrouching ? 0.04 : 0.12) * this.sfxVolume;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playSlash(isHeavy = false) {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;

    // White noise swoosh
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isHeavy ? 600 : 1200, now);
    filter.frequency.exponentialRampToValueAtTime(isHeavy ? 200 : 400, now + 0.14);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(now);
  }

  public playHit() {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playParry() {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;

    // Metallic high clang
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(1860, now);
    osc2.frequency.setValueAtTime(2450, now);

    gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  public playStealthTakedown() {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;

    // Swift muffled slice + thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.25);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playAlert() {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;

    // Sharp stinger
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.15);

    gain.gain.setValueAtTime(0.28 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playPickup() {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  }

  public playQuestComplete() {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  public playUI() {
    this.initContext();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.04);

    gain.gain.setValueAtTime(0.1 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }
}

export const audio = AudioManager.getInstance();
