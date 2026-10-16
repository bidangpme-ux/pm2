import { SecurityConfig, User } from '../types';
import { AuditLogService } from './auditLogService';

const STORAGE_KEY_SECURITY_CONFIG = 'arsipcloud_security_config_v1';

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  antiInspectEnabled: true,
  blockContextMenu: true,
  blockKeyboardShortcuts: true,
  detectDevTools: true,
  showWarningToast: true,
  maskAccessCodes: true,
};

type SecurityAlertListener = (alert: {
  title: string;
  message: string;
  reason: string;
  timestamp: string;
}) => void;

class SecurityManager {
  private config: SecurityConfig = DEFAULT_SECURITY_CONFIG;
  private listeners: Set<SecurityAlertListener> = new Set();
  private isInitialized = false;
  private currentUser: User | null = null;
  private lastAlertTime = 0;

  constructor() {
    this.loadConfig();
  }

  public loadConfig(): SecurityConfig {
    if (typeof window === 'undefined') return DEFAULT_SECURITY_CONFIG;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SECURITY_CONFIG);
      if (raw) {
        this.config = { ...DEFAULT_SECURITY_CONFIG, ...JSON.parse(raw) };
      } else {
        this.config = DEFAULT_SECURITY_CONFIG;
        localStorage.setItem(STORAGE_KEY_SECURITY_CONFIG, JSON.stringify(DEFAULT_SECURITY_CONFIG));
      }
    } catch {
      this.config = DEFAULT_SECURITY_CONFIG;
    }
    return this.config;
  }

  public saveConfig(newConfig: Partial<SecurityConfig>): SecurityConfig {
    this.config = { ...this.config, ...newConfig };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SECURITY_CONFIG, JSON.stringify(this.config));
    }
    AuditLogService.logSecurity({
      action: 'CONFIG_CHANGE',
      description: 'Pengaturan keamanan dan anti-inspeksi diperbarui oleh Administrator.',
      user: this.currentUser,
      status: 'warning',
      metadata: { newConfig: this.config },
    });
    return this.config;
  }

  public getConfig(): SecurityConfig {
    return this.config;
  }

  public setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  public subscribe(listener: SecurityAlertListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyAlert(reason: string, actionDetail: string) {
    const now = Date.now();
    // Throttle notifications to prevent spamming
    if (now - this.lastAlertTime < 1500) {
      return;
    }
    this.lastAlertTime = now;

    const alert = {
      title: 'Perlindungan Keamanan Aktif',
      message: 'Inspeksi elemen & akses kode sumber dibatasi oleh sistem untuk menjaga keamanan kredensial dan kerahasiaan data instansi.',
      reason,
      timestamp: new Date().toLocaleTimeString('id-ID'),
    };

    if (this.config.showWarningToast) {
      this.listeners.forEach((l) => l(alert));
    }

    // Log this attempt in the system audit trail
    AuditLogService.logSecurity({
      action: reason.includes('F12') || reason.includes('Ctrl') ? 'INSPECT_SHORTCUT_BLOCKED' : 'RIGHT_CLICK_BLOCKED',
      description: `Upaya inspeksi dicegah: ${reason} (${actionDetail})`,
      user: this.currentUser,
      status: 'warning',
      metadata: { reason, actionDetail },
    });
  }

  public init() {
    if (typeof window === 'undefined' || this.isInitialized) return;
    this.isInitialized = true;

    // 1. Console deterrent warning message
    try {
      const bannerStyle = 'color: #dc2626; font-size: 20px; font-weight: 900; background: #fee2e2; padding: 4px 8px; border-radius: 4px;';
      const warningStyle = 'color: #1e293b; font-size: 12px; font-weight: 600;';
      console.log('%c⚠️ PERINGATAN KEAMANAN SISTEM E-PMPED', bannerStyle);
      console.log(
        '%cAplikasi ini dilengkapi dengan modul audit pemantauan aktivitas dan perlindungan kode akses. Segala aktivitas inspeksi dan manipulasi dicatat dalam log keamanan resmi administrator.',
        warningStyle
      );
    } catch {}

    // 2. Block Context Menu (Right Click)
    window.addEventListener(
      'contextmenu',
      (e) => {
        if (!this.config.antiInspectEnabled || !this.config.blockContextMenu) return;
        // Check if inside standard inputs/textareas to allow normal paste if needed,
        // but block right-click inspect anywhere on document
        const target = e.target as HTMLElement;
        const isEditable = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

        // Allow selection copy/paste inside input if strictly typing, but prevent on passwords & sensitive areas
        if (target && target.getAttribute('type') === 'password') {
          e.preventDefault();
          this.notifyAlert('Klik Kanan pada Kolom Kredensial Terproteksi', 'Akses Menu Konteks Dihalau');
          return;
        }

        e.preventDefault();
        this.notifyAlert('Menu Konteks / Klik Kanan Dinonaktifkan', 'Percobaan Inspect Element');
      },
      { capture: true }
    );

    // 3. Block DevTools Shortcuts (F12, Ctrl+Shift+I, etc.)
    window.addEventListener(
      'keydown',
      (e) => {
        if (!this.config.antiInspectEnabled || !this.config.blockKeyboardShortcuts) return;

        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? e.metaKey : e.ctrlKey;

        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
          e.preventDefault();
          e.stopPropagation();
          this.notifyAlert('Tombol F12 (Developer Tools) Dihalau', 'Shortcut DevTools');
          return;
        }

        // Ctrl + Shift + I (Inspect)
        if (modifier && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
          e.preventDefault();
          e.stopPropagation();
          this.notifyAlert('Shortcut Inspect Element (Ctrl+Shift+I) Dihalau', 'Shortcut DevTools');
          return;
        }

        // Ctrl + Shift + J (Console)
        if (modifier && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
          e.preventDefault();
          e.stopPropagation();
          this.notifyAlert('Shortcut Konsol Pengembang (Ctrl+Shift+J) Dihalau', 'Shortcut Console');
          return;
        }

        // Ctrl + Shift + C (Inspect Element Picker)
        if (modifier && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
          // Allow normal copy (Ctrl+C without Shift)
          e.preventDefault();
          e.stopPropagation();
          this.notifyAlert('Shortcut Pemilih Elemen (Ctrl+Shift+C) Dihalau', 'Shortcut Element Picker');
          return;
        }

        // Ctrl + U (View Source)
        if (modifier && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
          e.preventDefault();
          e.stopPropagation();
          this.notifyAlert('Pintasan Lihat Sumber Halaman (Ctrl+U) Dihalau', 'Shortcut View Source');
          return;
        }

        // Ctrl + S (Save Page / Offline Inspect)
        if (modifier && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
          e.preventDefault();
          e.stopPropagation();
          this.notifyAlert('Penyimpanan Kode Sumber Halaman (Ctrl+S) Dihalau', 'Shortcut Save Page');
          return;
        }
      },
      { capture: true }
    );

    // 4. Subtle DevTools viewport / resize detection
    if (typeof window !== 'undefined') {
      let devtoolsOpen = false;
      const threshold = 160;

      const checkDevTools = () => {
        if (!this.config.antiInspectEnabled || !this.config.detectDevTools) return;
        const widthDiff = window.outerWidth - window.innerWidth > threshold;
        const heightDiff = window.outerHeight - window.innerHeight > threshold;

        if (widthDiff || heightDiff) {
          if (!devtoolsOpen) {
            devtoolsOpen = true;
            this.notifyAlert('Jendela Developer Tools / Inspeksi Terdeteksi Terbuka', 'DevTools Docked');
          }
        } else {
          devtoolsOpen = false;
        }
      };

      window.addEventListener('resize', checkDevTools);
    }
  }
}

export const SecurityService = new SecurityManager();
