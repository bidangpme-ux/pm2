export interface NextcloudConfig {
  serverUrl: string;
  username: string;
  appPassword: string; // App Token generated in Nextcloud Settings -> Security
  isEnabled: boolean;
  autoSync: boolean;
  lastSyncTime?: string;
  customDiskCapacityGB?: number; // User can set disk size manually (e.g. 120, 256, 500, 1000 GB)
  diskTotalBytes?: number; // Real or detected disk total
  diskUsedBytes?: number;  // Real used bytes from Nextcloud
  diskFreeBytes?: number;  // Real free bytes on Nextcloud
}

const STORAGE_KEY_NEXTCLOUD_CONFIG = 'arsipcloud_nextcloud_config_v1';

export class NextcloudService {
  static getConfig(): NextcloudConfig {
    const raw = localStorage.getItem(STORAGE_KEY_NEXTCLOUD_CONFIG);
    if (!raw) {
      return {
        serverUrl: '',
        username: '',
        appPassword: '',
        isEnabled: false,
        autoSync: false,
        customDiskCapacityGB: 500,
      };
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        customDiskCapacityGB: 500,
        ...parsed,
      };
    } catch {
      return {
        serverUrl: '',
        username: '',
        appPassword: '',
        isEnabled: false,
        autoSync: false,
        customDiskCapacityGB: 500,
      };
    }
  }

  static saveConfig(cfg: NextcloudConfig): void {
    localStorage.setItem(STORAGE_KEY_NEXTCLOUD_CONFIG, JSON.stringify(cfg));
  }

  static async testConnection(serverUrl: string, username: string, appPassword: string) {
    const res = await fetch('/api/nextcloud/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverUrl, username, appPassword }),
    });
    return res.json();
  }

  static async getQuota(serverUrl: string, username: string, appPassword: string) {
    const res = await fetch('/api/nextcloud/quota', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverUrl, username, appPassword }),
    });
    return res.json();
  }

  static async initFolderStructure(
    serverUrl: string,
    username: string,
    appPassword: string,
    userAccounts?: string[]
  ) {
    const res = await fetch('/api/nextcloud/init-structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverUrl, username, appPassword, userAccounts }),
    });
    return res.json();
  }

  static async listFolder(serverUrl: string, username: string, appPassword: string, folderPath: string) {
    const res = await fetch('/api/nextcloud/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverUrl, username, appPassword, folderPath }),
    });
    return res.json();
  }

  static async createFolder(serverUrl: string, username: string, appPassword: string, folderPath: string) {
    const res = await fetch('/api/nextcloud/create-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverUrl, username, appPassword, folderPath }),
    });
    return res.json();
  }

  static async uploadFile(
    serverUrl: string,
    username: string,
    appPassword: string,
    filePath: string,
    fileDataUrl: string,
    mimeType?: string
  ) {
    const res = await fetch('/api/nextcloud/upload-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverUrl, username, appPassword, filePath, fileDataUrl, mimeType }),
    });
    return res.json();
  }

  static async deleteItem(serverUrl: string, username: string, appPassword: string, targetPath: string) {
    const res = await fetch('/api/nextcloud/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverUrl, username, appPassword, targetPath }),
    });
    return res.json();
  }

  static async syncSuratDatabase(
    serverUrl: string,
    username: string,
    appPassword: string,
    action: 'save' | 'get',
    data?: any
  ) {
    const res = await fetch('/api/nextcloud/surat-database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverUrl, username, appPassword, action, data }),
    });
    return res.json();
  }

  static async syncIKUDatabase(
    serverUrl: string,
    username: string,
    appPassword: string,
    action: 'save' | 'get',
    data?: any
  ) {
    const res = await fetch('/api/nextcloud/iku-database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverUrl, username, appPassword, action, data }),
    });
    return res.json();
  }


  static async downloadFile(serverUrl: string, username: string, appPassword: string, filePath: string) {
    const res = await fetch('/api/nextcloud/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverUrl, username, appPassword, filePath }),
    });
    return res;
  }
}

