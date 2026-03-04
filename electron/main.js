// ========================================
// RepairHub — Electron Main Process
// ========================================
// Creates the browser window and manages the Python backend lifecycle.

const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

let mainWindow = null;
let pythonProcess = null;
const isDev = (process.env.NODE_ENV || '').trim() === 'development';
const PYTHON_PORT = 8000;
const NEXT_PORT = 3001;

// ===== Python Backend =====
function startPythonBackend() {
  const backendDir = path.join(__dirname, '..', '..', 'backend-local-python');
  const venvPython = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');

  // Try venv python first, fallback to system
  const pythonPath = require('fs').existsSync(venvPython) ? venvPython : 'python';

  console.log(`[Electron] Starting Python backend from: ${backendDir}`);
  console.log(`[Electron] Using Python: ${pythonPath}`);

  pythonProcess = spawn(pythonPath, ['main.py'], {
    cwd: backendDir,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, REPAIRHUB_PORT: String(PYTHON_PORT) },
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`[Backend Error] ${data.toString().trim()}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`[Electron] Python backend exited with code ${code}`);
  });
}

function stopPythonBackend() {
  if (pythonProcess) {
    console.log('[Electron] Stopping Python backend...');
    pythonProcess.kill();
    pythonProcess = null;
  }
}

// ===== Wait for server =====
function waitForServer(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) resolve();
        else setTimeout(check, 300);
      }).on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error(`Server timeout: ${url}`));
        } else {
          setTimeout(check, 300);
        }
      });
    };
    check();
  });
}

// ===== Window =====
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'TechBoard',
    backgroundColor: '#0f1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Remove default menu
  mainWindow.setMenu(null);

  if (isDev) {
    mainWindow.loadURL(`http://localhost:${NEXT_PORT}`);
  } else {
    const exportDir = path.join(__dirname, '..', 'out', 'index.html');
    mainWindow.loadFile(exportDir);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ===== App Lifecycle =====
app.whenReady().then(async () => {
  // Start Python backend
  startPythonBackend();

  try {
    console.log(`[Electron] Waiting for Python backend on port ${PYTHON_PORT}...`);
    await waitForServer(`http://localhost:${PYTHON_PORT}/health`);
    console.log('[Electron] Python backend is ready!');
  } catch (e) {
    console.error('[Electron] Python backend failed to start:', e.message);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  stopPythonBackend();
});
