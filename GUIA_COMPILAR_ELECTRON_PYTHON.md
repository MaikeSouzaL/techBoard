# TechBoard — Guia: Compilar Electron com Python Embarcado

## Situação Atual
O Electron (`main.js`) já inicia o Python automaticamente como servidor HTTP.
Em dev, o frontend faz `fetch('http://localhost:8000/api/remove-bg')`.

---

## Passos para Compilar para Produção

### 1. Compilar o Python em `.exe`

```bash
cd backend-local-python
pip install pyinstaller
pyinstaller --onefile main.py --name techboard-engine --hidden-import=cv2 --hidden-import=numpy
```

O `.exe` gerado fica em `backend-local-python/dist/techboard-engine.exe`.

### 2. Copiar o `.exe` para o projeto Electron

```bash
mkdir pcb-mapper/engine
copy backend-local-python\dist\techboard-engine.exe pcb-mapper\engine\
```

### 3. Configurar o Electron Build (`package.json`)

```json
"build": {
  "extraResources": [
    { "from": "engine/techboard-engine.exe", "to": "techboard-engine.exe" }
  ]
}
```

### 4. Ajustar `electron/main.js`

Trocar o caminho do Python para usar o `.exe` em produção:

```javascript
// Em startPythonBackend():
const pythonPath = isDev
  ? (require('fs').existsSync(venvPython) ? venvPython : 'python')
  : path.join(process.resourcesPath, 'techboard-engine.exe');

const args = isDev ? ['main.py'] : [];

pythonProcess = spawn(pythonPath, args, { ... });
```

### 5. Compilar o Electron

```bash
cd pcb-mapper
npx electron-builder --win
```

---

## Resultado Final
- Usuário instala o `.exe` do TechBoard
- Ao abrir, o Electron inicia o `techboard-engine.exe` automaticamente
- Sem necessidade de Python instalado no PC do usuário
- Tudo funciona offline
