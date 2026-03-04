@echo off
echo Iniciando todos os servicos do RepairHub...

echo [1/4] Iniciando API Python (Processamento de Imagem)...
cd backend-local-python
start "Python Backend" cmd /c "..\.venv\Scripts\activate && python main.py"
cd ..

timeout /t 2 /nobreak >nul

echo [2/4] Iniciando API Node.js (Banco de Dados Cloud) com auto-reload...
cd backend-cloud-node
start "Node.js Backend" cmd /c "npm run dev"
cd ..

timeout /t 2 /nobreak >nul

echo [3/4] Iniciando Frontend Web (Next.js)...
cd pcb-mapper
start "Next.js Frontend" cmd /c "npm run dev"
cd ..

echo Aguardando o Frontend estar pronto antes de abrir o Electron...
timeout /t 5 /nobreak >nul

echo [4/4] Iniciando Aplicativo Desktop (Electron)...
cd pcb-mapper
start "Electron App" cmd /c "npm run electron-dev"
cd ..

echo.
echo ==================================================
echo Todos os servicos foram iniciados em janelas separadas!
echo ==================================================
echo.
pause
