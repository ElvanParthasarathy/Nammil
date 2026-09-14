const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

function getGitToken() {
  try {
    const credInput = 'protocol=https\nhost=github.com\n\n';
    const out = execSync('git credential fill', { input: credInput, encoding: 'utf8' });
    const match = out.match(/^password=(.+)$/m);
    if (match) return match[1].trim();
  } catch (e) {
    console.error('Error getting token from git credential:', e.message);
  }
  return null;
}

const token = process.env.GITHUB_TOKEN || getGitToken();
if (!token) {
  console.error('No GitHub token found');
  process.exit(1);
}

const owner = 'ElvanParthasarathy';
const repo = 'Nammil';
const tag = 'v1.2.9';

async function api(endpoint, method = 'GET', body = null, headers = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`;
  const u = new URL(url);
  const options = {
    hostname: u.hostname,
    path: u.pathname + u.search,
    method: method,
    headers: {
      'User-Agent': 'Nammil-Release-Script',
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      ...headers
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: json });
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${JSON.stringify(json)}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: data });
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${data}`));
          }
        }
      });
    });
    req.on('error', reject);
    if (body) {
      if (Buffer.isBuffer(body)) {
        req.write(body);
      } else if (typeof body === 'string') {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

async function uploadFile(uploadUrlTemplate, filePath, assetName) {
  const uploadUrl = uploadUrlTemplate.replace(/\{(\?.*?)\}/, '') + `?name=${encodeURIComponent(assetName)}`;
  console.log(`Uploading ${assetName} (${(fs.statSync(filePath).size / (1024*1024)).toFixed(2)} MB)...`);
  
  const stats = fs.statSync(filePath);
  const u = new URL(uploadUrl);
  
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'User-Agent': 'Nammil-Release-Script',
        'Authorization': `token ${token}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': stats.size
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`Successfully uploaded ${assetName}!`);
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Upload failed ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(req);
  });
}

async function main() {
  console.log(`Checking existing release for ${tag}...`);
  let release = null;
  try {
    const res = await api(`/repos/${owner}/${repo}/releases/tags/${tag}`);
    release = res.data;
    console.log(`Release found: ID ${release.id}`);
  } catch (e) {
    console.log(`Release ${tag} not found. Creating new release...`);
    const createRes = await api(`/repos/${owner}/${repo}/releases`, 'POST', {
      tag_name: tag,
      target_commitish: 'main',
      name: `Nammil ${tag}`,
      body: `### ✨ What's New in v1.2.9\n\n- **Voice Message Audio Fix**: Intelligent audio stream routing ensures incoming and outgoing voice notes, voice messages, and audio attachments play at full volume with zero distortion.\n- **Silent Native Notifications**: WhatsApp native notification dings are silenced to prevent audio collisions with Nammil's custom notification chimes (*Kumizhi*, *Minnal*, *Alai*, *Thendral*, *Thuli*, *Thullal*).\n- **Performance & Stability**: Smoother tab rendering and font loading improvements.\n\n### 📥 Installation\nDownload \`Nammil-Setup.exe\` below and run the installer. Zero admin rights required.`,
      draft: false,
      prerelease: false
    }, { 'Content-Type': 'application/json' });
    release = createRes.data;
    console.log(`Release created: ID ${release.id}`);
  }

  const installerPath = path.join(__dirname, '..', 'build-release', 'Nammil-Setup.exe');
  if (!fs.existsSync(installerPath)) {
    throw new Error(`Installer not found at ${installerPath}`);
  }

  // Delete existing asset if present
  if (release.assets && release.assets.length > 0) {
    for (const a of release.assets) {
      if (a.name === 'Nammil-Setup.exe' || a.name === 'Nammil Setup.exe') {
        console.log(`Deleting existing asset ${a.name} (ID ${a.id})...`);
        try {
          await api(`/repos/${owner}/${repo}/releases/assets/${a.id}`, 'DELETE');
          console.log(`Deleted asset ${a.id}`);
        } catch (delErr) {
          console.warn(`Could not delete asset ${a.id}:`, delErr.message);
        }
      }
    }
  }

  await uploadFile(release.upload_url, installerPath, 'Nammil-Setup.exe');
  console.log(`All done! Release ${tag} is live with Nammil-Setup.exe`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
