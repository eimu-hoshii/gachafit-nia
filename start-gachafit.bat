@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo ===================================================
echo   GachaFit with ニア - 起動中 (Port: 5188)
echo   スマホから開く場合は下に表示される Network URL にアクセスしてください
echo ===================================================
if not exist "node_modules" (
    echo 初回パッケージをインストールしています...
    call npm install
)
start http://localhost:5188
call npm run dev
pause
