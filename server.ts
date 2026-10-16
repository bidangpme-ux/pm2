import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to construct Nextcloud WebDAV URL and headers
function getWebDavConfig(serverUrl: string, username: string, appToken: string) {
  const cleanUrl = serverUrl.replace(/\/+$/, '');
  const authHeader = 'Basic ' + Buffer.from(`${username}:${appToken}`).toString('base64');
  const davBase = `${cleanUrl}/remote.php/dav/files/${encodeURIComponent(username)}`;
  return { cleanUrl, authHeader, davBase };
}

// Safely encode relative path segments preserving '/' separators and correctly escaping '#', '+', '?' etc.
function encodeDavPath(relativePath: string): string {
  return relativePath
    .replace(/^\/+/, '')
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
}

// 1. Test Connection Endpoint
app.post('/api/nextcloud/test', async (req: Request, res: Response) => {
  const { serverUrl, username, appPassword } = req.body;
  if (!serverUrl || !username || !appPassword) {
    return res.status(400).json({ success: false, message: 'Server URL, Username, dan App Password wajib diisi.' });
  }

  try {
    const { davBase, authHeader } = getWebDavConfig(serverUrl, username, appPassword);
    
    // Check WebDAV endpoint with PROPFIND Depth: 0
    const davRes = await fetch(`${davBase}/`, {
      method: 'PROPFIND',
      headers: {
        Authorization: authHeader,
        Depth: '0',
        'Content-Type': 'application/xml',
      },
    });

    if (davRes.status === 401 || davRes.status === 403) {
      return res.status(401).json({
        success: false,
        message: 'Otentikasi gagal (HTTP 401/403). Periksa kembali username dan App Password/Token Nextcloud Anda.',
      });
    }

    if (davRes.status === 207 || davRes.status === 200) {
      // Also try to query status.php for server info if available
      let version = 'Nextcloud Hub';
      try {
        const statusRes = await fetch(`${serverUrl.replace(/\/+$/, '')}/status.php`);
        if (statusRes.ok) {
          const statusJson = await statusRes.json();
          if (statusJson.versionstring) {
            version = `Nextcloud v${statusJson.versionstring}`;
          }
        }
      } catch (err) {
        // ignore status check failure
      }

      return res.json({
        success: true,
        message: 'Koneksi ke Nextcloud WebDAV berhasil!',
        serverVersion: version,
        username,
        endpoint: davBase,
      });
    }

    return res.status(davRes.status).json({
      success: false,
      message: `Nextcloud merespon dengan status HTTP ${davRes.status} (${davRes.statusText}).`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: `Gagal menghubungi server Nextcloud: ${error?.message || 'Network error'}`,
    });
  }
});

// 2. Initialize Standard Folder Structure on Nextcloud
app.post('/api/nextcloud/init-structure', async (req: Request, res: Response) => {
  const { serverUrl, username, appPassword, userAccounts = [] } = req.body;
  if (!serverUrl || !username || !appPassword) {
    return res.status(400).json({ success: false, message: 'Kredensial tidak lengkap.' });
  }

  const { davBase, authHeader } = getWebDavConfig(serverUrl, username, appPassword);

  const baseFolders = [
    'ArsipCloud',
    'ArsipCloud/File_Saya',
    'ArsipCloud/Folder_Publik',
    'ArsipCloud/Menu_Bidang',
    'ArsipCloud/Menu_Bidang/Bidang PME',
    'ArsipCloud/Menu_Bidang/Bidang Infrastruktur',
    'ArsipCloud/Menu_Bidang/Bidang Tata Ruang',
    'ArsipCloud/Manajemen_Surat',
    'ArsipCloud/Indikator_Kinerja_Utama',
  ];


  // Default accounts + any dynamic user accounts provided by frontend
  const defaultAccounts = ['admin', 'ahmad_fauzi', 'bidang_pme', 'budi_santoso'];
  const allAccounts = Array.from(
    new Set([
      ...defaultAccounts,
      ...(Array.isArray(userAccounts) ? userAccounts : []).map((a: string) =>
        String(a).toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_')
      ),
    ])
  );

  // Each user has their own private subfolder inside ArsipCloud/File_Saya/[nama_akun]
  const userFolders = allAccounts.map((acc) => `ArsipCloud/File_Saya/${acc}`);
  const foldersToCreate = [...baseFolders, ...userFolders];

  const results: { folder: string; status: number }[] = [];

  for (const folder of foldersToCreate) {
    try {
      const url = `${davBase}/${encodeDavPath(folder)}`;
      const mkcolRes = await fetch(url, {
        method: 'MKCOL',
        headers: { Authorization: authHeader },
      });
      // 201 Created or 405 Method Not Allowed (already exists)
      results.push({ folder, status: mkcolRes.status });
    } catch (err: any) {
      results.push({ folder, status: 500 });
    }
  }

  return res.json({
    success: true,
    message: `Struktur folder ArsipCloud di Nextcloud siap digunakan! Terpisah ${allAccounts.length} folder akun user untuk kemudahan backup.`,
    details: results,
    userFolders: allAccounts,
  });
});

// 3. List files and folders via WebDAV PROPFIND
app.post('/api/nextcloud/list', async (req: Request, res: Response) => {
  const { serverUrl, username, appPassword, folderPath = '' } = req.body;
  const { davBase, authHeader } = getWebDavConfig(serverUrl, username, appPassword);

  const cleanPath = folderPath.replace(/^\/+/, '').replace(/\/+$/, '');
  const targetUrl = cleanPath ? `${davBase}/${encodeDavPath(cleanPath)}/` : `${davBase}/`;

  try {
    const propfindRes = await fetch(targetUrl, {
      method: 'PROPFIND',
      headers: {
        Authorization: authHeader,
        Depth: '1',
        'Content-Type': 'application/xml',
      },
    });

    if (!propfindRes.ok && propfindRes.status !== 207) {
      return res.status(propfindRes.status).json({
        success: false,
        message: `WebDAV PROPFIND gagal dengan kode status ${propfindRes.status}`,
      });
    }

    const xmlText = await propfindRes.text();

    // Parse XML responses into list of items
    const items: Array<{
      href: string;
      name: string;
      isFolder: boolean;
      size: number;
      lastModified: string;
      mimeType: string;
    }> = [];

    // Flexible regex parser for WebDAV multi-status XML (handles any namespace prefix like <d:>, <D:>, or default)
    const responseRegex = /<(?:[a-zA-Z0-9_-]+:)?response[\s\S]*?<\/(?:[a-zA-Z0-9_-]+:)?response>/gi;
    let match: RegExpExecArray | null;

    while ((match = responseRegex.exec(xmlText)) !== null) {
      const block = match[0];
      const hrefMatch = /<(?:[a-zA-Z0-9_-]+:)?href>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?href>/i.exec(block);
      if (!hrefMatch) continue;

      const href = decodeURIComponent(hrefMatch[1].trim());
      const isCollection = /<(?:[a-zA-Z0-9_-]+:)?resourcetype[^>]*>\s*<(?:[a-zA-Z0-9_-]+:)?collection\s*\/?>/i.test(block);

      const lengthMatch = /<(?:[a-zA-Z0-9_-]+:)?getcontentlength>(\d+)<\/(?:[a-zA-Z0-9_-]+:)?getcontentlength>/i.exec(block);
      const size = lengthMatch ? parseInt(lengthMatch[1], 10) : 0;

      const modifiedMatch = /<(?:[a-zA-Z0-9_-]+:)?getlastmodified>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?getlastmodified>/i.exec(block);
      const lastModified = modifiedMatch ? modifiedMatch[1].trim() : new Date().toISOString();

      const typeMatch = /<(?:[a-zA-Z0-9_-]+:)?getcontenttype>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?getcontenttype>/i.exec(block);
      const mimeType = typeMatch ? typeMatch[1].trim() : isCollection ? 'httpd/unix-directory' : 'application/octet-stream';

      // Extract file/folder name
      const cleanHref = href.replace(/\/+$/, '');
      const parts = cleanHref.split('/');
      const name = parts[parts.length - 1] || 'root';

      // Avoid returning the target folder itself
      const isTargetFolder =
        cleanPath && (href.endsWith(cleanPath) || href.endsWith(cleanPath + '/'));
      const isRoot = !cleanPath && (href.endsWith(`files/${username}`) || href.endsWith(`files/${username}/`));

      if (isTargetFolder || isRoot) {
        continue;
      }

      items.push({
        href,
        name,
        isFolder: isCollection,
        size,
        lastModified,
        mimeType,
      });
    }

    return res.json({ success: true, path: cleanPath, items });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: `Gagal membaca isi folder Nextcloud: ${err?.message || err}`,
    });
  }
});

// 4. Create Folder via WebDAV MKCOL
app.post('/api/nextcloud/create-folder', async (req: Request, res: Response) => {
  const { serverUrl, username, appPassword, folderPath } = req.body;
  if (!folderPath) {
    return res.status(400).json({ success: false, message: 'Path folder wajib diisi.' });
  }

  const { davBase, authHeader } = getWebDavConfig(serverUrl, username, appPassword);
  const cleanPath = folderPath.replace(/^\/+/, '');
  const targetUrl = `${davBase}/${encodeDavPath(cleanPath)}`;

  try {
    const mkcolRes = await fetch(targetUrl, {
      method: 'MKCOL',
      headers: { Authorization: authHeader },
    });

    if (mkcolRes.status === 201 || mkcolRes.status === 405) {
      return res.json({ success: true, message: 'Folder berhasil dibuat di Nextcloud.' });
    }

    return res.status(mkcolRes.status).json({
      success: false,
      message: `Gagal membuat folder di Nextcloud (HTTP ${mkcolRes.status})`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Error membuat folder' });
  }
});

// 5. Upload File via WebDAV PUT
app.post('/api/nextcloud/upload-file', async (req: Request, res: Response) => {
  const { serverUrl, username, appPassword, filePath, fileDataUrl, mimeType } = req.body;
  if (!filePath || !fileDataUrl) {
    return res.status(400).json({ success: false, message: 'File path dan konten file wajib dikirim.' });
  }

  const { davBase, authHeader } = getWebDavConfig(serverUrl, username, appPassword);
  const cleanPath = filePath.replace(/^\/+/, '');
  const targetUrl = `${davBase}/${encodeDavPath(cleanPath)}`;

  try {
    // Ensure parent folders exist before writing file
    const parts = cleanPath.split('/');
    if (parts.length > 1) {
      let currentDir = '';
      for (let i = 0; i < parts.length - 1; i++) {
        currentDir = currentDir ? `${currentDir}/${parts[i]}` : parts[i];
        try {
          await fetch(`${davBase}/${encodeDavPath(currentDir)}`, {
            method: 'MKCOL',
            headers: { Authorization: authHeader },
          });
        } catch {
          // ignore if folder already exists
        }
      }
    }

    // Extract base64 buffer from data URL
    const base64Data = fileDataUrl.includes('base64,')
      ? fileDataUrl.split('base64,')[1]
      : fileDataUrl;
    const buffer = Buffer.from(base64Data, 'base64');

    const putRes = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        'Content-Type': mimeType || 'application/octet-stream',
        'Content-Length': buffer.length.toString(),
      },
      body: buffer,
    });

    if (putRes.status === 201 || putRes.status === 204 || putRes.status === 200) {
      return res.json({ success: true, message: 'Berkas berhasil tersimpan di server Nextcloud!' });
    }

    return res.status(putRes.status).json({
      success: false,
      message: `Gagal menyimpan berkas ke Nextcloud (HTTP ${putRes.status} ${putRes.statusText})`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Error saat upload ke Nextcloud' });
  }
});

// 5.5 Download File via WebDAV GET
app.post('/api/nextcloud/download', async (req: Request, res: Response) => {
  const { serverUrl, username, appPassword, filePath } = req.body;
  if (!serverUrl || !username || !appPassword || !filePath) {
    return res.status(400).json({ success: false, message: 'Parameter download tidak lengkap.' });
  }

  const { davBase, authHeader } = getWebDavConfig(serverUrl, username, appPassword);
  const cleanPath = filePath.replace(/^\/+/, '');
  const targetUrl = `${davBase}/${encodeDavPath(cleanPath)}`;

  try {
    const davRes = await fetch(targetUrl, {
      method: 'GET',
      headers: { Authorization: authHeader },
    });

    if (!davRes.ok) {
      return res.status(davRes.status).json({
        success: false,
        message: `Gagal mengunduh file dari Nextcloud (HTTP ${davRes.status} ${davRes.statusText})`,
      });
    }

    const contentType = davRes.headers.get('content-type') || 'application/octet-stream';
    const buffer = Buffer.from(await davRes.arrayBuffer());
    const fileName = path.basename(cleanPath);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    return res.send(buffer);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Error saat download dari Nextcloud' });
  }
});

// 6. Delete File or Folder via WebDAV DELETE
app.post('/api/nextcloud/delete', async (req: Request, res: Response) => {
  const { serverUrl, username, appPassword, targetPath } = req.body;
  if (!targetPath) {
    return res.status(400).json({ success: false, message: 'Path target wajib diisi.' });
  }

  const { davBase, authHeader } = getWebDavConfig(serverUrl, username, appPassword);
  const cleanPath = targetPath.replace(/^\/+/, '');
  const targetUrl = `${davBase}/${encodeDavPath(cleanPath)}`;

  try {
    const delRes = await fetch(targetUrl, {
      method: 'DELETE',
      headers: { Authorization: authHeader },
    });

    if (delRes.status === 204 || delRes.status === 200) {
      return res.json({ success: true, message: 'Item berhasil dihapus dari Nextcloud.' });
    }

    return res.status(delRes.status).json({
      success: false,
      message: `Gagal menghapus item di Nextcloud (HTTP ${delRes.status})`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Error saat delete di Nextcloud' });
  }
});

// 7. Get or Save Surat Database JSON on Nextcloud
app.post('/api/nextcloud/surat-database', async (req: Request, res: Response) => {
  const { serverUrl, username, appPassword, action, data } = req.body;
  const { davBase, authHeader } = getWebDavConfig(serverUrl, username, appPassword);
  const dbUrl = `${davBase}/ArsipCloud/Manajemen_Surat/database_surat.json`;

  try {
    if (action === 'save') {
      const jsonStr = JSON.stringify(data, null, 2);
      const buffer = Buffer.from(jsonStr, 'utf-8');

      const putRes = await fetch(dbUrl, {
        method: 'PUT',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
          'Content-Length': buffer.length.toString(),
        },
        body: buffer,
      });

      if (putRes.status === 201 || putRes.status === 204 || putRes.status === 200) {
        return res.json({ success: true, message: 'Database surat berhasil disimpan di Nextcloud!' });
      }

      return res.status(putRes.status).json({
        success: false,
        message: `Gagal menyimpan database surat ke Nextcloud (HTTP ${putRes.status})`,
      });
    } else {
      // action === 'get'
      const getRes = await fetch(dbUrl, {
        method: 'GET',
        headers: { Authorization: authHeader },
      });

      if (getRes.status === 404) {
        return res.json({ success: true, data: [] });
      }

      if (getRes.ok) {
        const text = await getRes.text();
        try {
          const parsed = text.trim() ? JSON.parse(text) : [];
          return res.json({ success: true, data: Array.isArray(parsed) ? parsed : [] });
        } catch {
          return res.json({ success: true, data: [] });
        }
      }

      return res.status(getRes.status).json({
        success: false,
        message: `Gagal mengambil database surat dari Nextcloud (HTTP ${getRes.status})`,
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Error akses database Nextcloud' });
  }
});

// 7b. Get or Save IKU (Indikator Kinerja Utama) Database JSON on Nextcloud
app.post('/api/nextcloud/iku-database', async (req: Request, res: Response) => {
  const { serverUrl, username, appPassword, action, data } = req.body;
  const { davBase, authHeader } = getWebDavConfig(serverUrl, username, appPassword);
  const dbUrl = `${davBase}/ArsipCloud/Indikator_Kinerja_Utama/database_iku.json`;

  try {
    if (action === 'save') {
      const jsonStr = JSON.stringify(data, null, 2);
      const buffer = Buffer.from(jsonStr, 'utf-8');

      const putRes = await fetch(dbUrl, {
        method: 'PUT',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
          'Content-Length': buffer.length.toString(),
        },
        body: buffer,
      });

      if (putRes.status === 201 || putRes.status === 204 || putRes.status === 200) {
        return res.json({ success: true, message: 'Database IKU berhasil disimpan di Nextcloud!' });
      }

      return res.status(putRes.status).json({
        success: false,
        message: `Gagal menyimpan database IKU ke Nextcloud (HTTP ${putRes.status})`,
      });
    } else {
      // action === 'get'
      const getRes = await fetch(dbUrl, {
        method: 'GET',
        headers: { Authorization: authHeader },
      });

      if (getRes.status === 404) {
        return res.json({ success: true, data: [] });
      }

      if (getRes.ok) {
        const text = await getRes.text();
        try {
          const parsed = text.trim() ? JSON.parse(text) : [];
          return res.json({ success: true, data: Array.isArray(parsed) ? parsed : [] });
        } catch {
          return res.json({ success: true, data: [] });
        }
      }

      return res.status(getRes.status).json({
        success: false,
        message: `Gagal mengambil database IKU dari Nextcloud (HTTP ${getRes.status})`,
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Error akses database IKU Nextcloud' });
  }
});

// 8. Fetch Nextcloud Disk Quota
app.post('/api/nextcloud/quota', async (req: Request, res: Response) => {

  const { serverUrl, username, appPassword } = req.body;
  if (!serverUrl || !username || !appPassword) {
    return res.status(400).json({ success: false, message: 'Kredensial tidak lengkap.' });
  }

  const { cleanUrl, authHeader, davBase } = getWebDavConfig(serverUrl, username, appPassword);

  let detectedTotal = 0;
  let detectedUsed = 0;
  let detectedFree = 0;
  let quotaSource = 'estimated';

  // 1. Try Nextcloud OCS user API (returns rich JSON quota info)
  try {
    const ocsUrl = `${cleanUrl}/ocs/v1.php/cloud/users/${encodeURIComponent(username)}?format=json`;
    const ocsRes = await fetch(ocsUrl, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'OCS-APIREQUEST': 'true',
        Accept: 'application/json',
      },
    });

    if (ocsRes.ok) {
      const ocsData = await ocsRes.json();
      const quota = ocsData?.ocs?.data?.quota;
      if (quota) {
        detectedUsed = Number(quota.used) || 0;
        detectedFree = Number(quota.free) || 0;
        detectedTotal = Number(quota.total) || 0;

        // If total is <= 0 (unlimited quota in Nextcloud), compute from used + free
        if (detectedTotal <= 0 && detectedFree > 0) {
          detectedTotal = detectedUsed + detectedFree;
        }

        if (detectedTotal > 0 || detectedUsed > 0) {
          return res.json({
            success: true,
            source: 'ocs',
            quota: {
              totalBytes: detectedTotal > 0 ? detectedTotal : 500 * 1024 * 1024 * 1024,
              usedBytes: detectedUsed,
              freeBytes: detectedFree,
              relative: quota.relative ? Number(quota.relative) : (detectedTotal > 0 ? (detectedUsed / detectedTotal) * 100 : 0),
              rawQuota: quota.quota || 'unlimited',
            },
          });
        }
      }
    }
  } catch (ocsErr) {
    // Fall back to WebDAV
  }

  // 2. Try WebDAV PROPFIND with quota-available-bytes & quota-used-bytes
  try {
    const davRes = await fetch(`${davBase}/`, {
      method: 'PROPFIND',
      headers: {
        Authorization: authHeader,
        Depth: '0',
        'Content-Type': 'application/xml',
      },
      body: `<?xml version="1.0" encoding="utf-8" ?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:quota-available-bytes/>
    <d:quota-used-bytes/>
  </d:prop>
</d:propfind>`,
    });

    if (davRes.status === 207 || davRes.status === 200) {
      const xml = await davRes.text();
      const usedMatch = /<(?:[a-zA-Z0-9_-]+:)?quota-used-bytes>(\d+)<\/(?:[a-zA-Z0-9_-]+:)?quota-used-bytes>/i.exec(xml);
      const availMatch = /<(?:[a-zA-Z0-9_-]+:)?quota-available-bytes>(-?\d+)<\/(?:[a-zA-Z0-9_-]+:)?quota-available-bytes>/i.exec(xml);

      if (usedMatch) {
        detectedUsed = parseInt(usedMatch[1], 10);
      }
      if (availMatch) {
        const availVal = parseInt(availMatch[1], 10);
        if (availVal >= 0) {
          detectedFree = availVal;
          detectedTotal = detectedUsed + detectedFree;
          quotaSource = 'webdav';
        }
      }

      if (detectedTotal > 0 || detectedUsed > 0) {
        return res.json({
          success: true,
          source: quotaSource,
          quota: {
            totalBytes: detectedTotal > 0 ? detectedTotal : 500 * 1024 * 1024 * 1024,
            usedBytes: detectedUsed,
            freeBytes: detectedFree,
            relative: detectedTotal > 0 ? (detectedUsed / detectedTotal) * 100 : 0,
            rawQuota: 'webdav_quota',
          },
        });
      }
    }
  } catch (davErr: any) {
    // Fall back
  }

  // Fallback response with reasonable defaults
  return res.json({
    success: true,
    source: 'default',
    quota: {
      totalBytes: 500 * 1024 * 1024 * 1024, // 500 GB
      usedBytes: 0,
      freeBytes: 500 * 1024 * 1024 * 1024,
      relative: 0,
      rawQuota: 'unlimited',
    },
  });
});

// ================= SECURITY & AUDIT LOG API ENDPOINTS =================
const serverAuditLogs: any[] = [];

// 1. Client IP & Device Info endpoint
app.get('/api/security/client-info', (req: Request, res: Response) => {
  const forwarded = req.headers['x-forwarded-for'];
  const rawIp = Array.isArray(forwarded) ? forwarded[0] : (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress);
  const ip = rawIp && rawIp !== '::1' && rawIp !== '127.0.0.1' ? rawIp.replace(/^.*:/, '') : '127.0.0.1';
  res.json({
    ip,
    userAgent: req.headers['user-agent'] || '',
    secure: req.secure,
    timestamp: new Date().toISOString(),
  });
});

// 2. Receive and record audit log on server
app.post('/api/security/audit-log', (req: Request, res: Response) => {
  try {
    const entry = req.body;
    if (entry && entry.id) {
      serverAuditLogs.unshift({
        ...entry,
        serverReceivedAt: new Date().toISOString(),
      });
      // Keep only last 1000 logs in memory
      if (serverAuditLogs.length > 1000) {
        serverAuditLogs.pop();
      }
    }
    res.json({ success: true, count: serverAuditLogs.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

// 3. Get server audit logs
app.get('/api/security/audit-logs', (_req: Request, res: Response) => {
  res.json({ success: true, logs: serverAuditLogs });
});

// 4. Clear server audit logs
app.post('/api/security/clear-logs', (_req: Request, res: Response) => {
  serverAuditLogs.length = 0;
  res.json({ success: true, message: 'Server audit logs cleared.' });
});

// 5. Download complete update ZIP file for CasaOS deployment
app.get('/api/download-zip', (_req: Request, res: Response) => {
  const zipPath = path.resolve(__dirname, 'epmped-terbaru-lengkap.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'epmped-terbaru-lengkap.zip');
  } else {
    res.status(404).send('File zip belum dibuat.');
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`ArsipCloud server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
