/**
 * User preferences (persisted to localStorage).
 */
export interface UserSettings {
  /** Respect prefers-reduced-motion */
  reducedMotion: boolean;
  /** Reading language (MVP: 'zh-CN' only) */
  language: 'zh-CN';
  /** BGM volume (0-1) — Nice to have, default 0.6 */
  bgmVolume: number;
  /** SFX volume (0-1) — Nice to have, default 0.8 */
  sfxVolume: number;
  /** Show disclaimer on every result */
  showDisclaimer: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  reducedMotion: false,
  language: 'zh-CN',
  bgmVolume: 0.6,
  sfxVolume: 0.8,
  showDisclaimer: true,
};

/**
 * API error envelope.
 */
export interface ApiError {
  code: string;
  message: string;
  retryable: boolean;
}
