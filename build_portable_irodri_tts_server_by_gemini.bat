@echo off
chcp 65001
setlocal

echo =================================================================
echo   🏆 文駿専用：ポータブル Irodori-TTS-Server 完全勝利版 v2 🏆
echo =================================================================

set BASE_DIR=D:\node\Egent_O\Irodori-TTS-Server-Portable
set PYTHON_DIR=python311
set VENV_DIR=%BASE_DIR%\venv

echo BASE_DIR   : %BASE_DIR%
echo PYTHON_DIR : %PYTHON_DIR%
echo VENV_DIR   : %VENV_DIR%
echo ---------------------------------------------------------

dir %BASE_DIR%

if not exist "%PYTHON_DIR%\python.exe" (
    echo [エラー] python311 が見つかりません。
    pause
    exit /b
)

if not exist "%VENV_DIR%" (
    echo === venv を新規作成します ===
    "%PYTHON_DIR%\python.exe" -m venv "%VENV_DIR%"
) else (
    echo === venv は既に存在するため再利用します ===
)

echo === venv を有効化 ===
call "%VENV_DIR%\Scripts\activate"

echo === pip ＆ wheel の更新 ===
python -m pip install --upgrade pip wheel setuptools

REM ---------------------------------------------------------
REM 【対策】先にリポジトリをインストールして、古い依存関係を吐き出させる
REM ---------------------------------------------------------
echo === Irodori-TTS 本体（コア）インストール ===
pip install git+https://github.com/Aratako/Irodori-TTS.git

echo === Irodori-TTS-Server（APIサーバー）インストール ===
pip install git+https://github.com/Aratako/Irodori-TTS-Server.git

REM ---------------------------------------------------------
REM 【対策】最後に本命のCUDA版とdacvaeを「上書き」で確定させる！
REM ---------------------------------------------------------
echo === 【最重要】PyTorch CUDA 12.4 を強制上書きインストール ===
pip install --upgrade --force-reinstall torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

echo === 【最重要】Meta公式 dacvae を強制上書きインストール ===
pip install --upgrade --force-reinstall git+https://github.com/facebookresearch/dacvae.git

REM ---------------------------------------------------------
REM 起動スクリプトの生成
REM ---------------------------------------------------------
echo === start_server.bat を自動生成 ===
(
echo @echo off
echo chcp 65001
echo title Irodori-TTS OpenAI Compatible Server
echo cd /d "%%~dp0"
echo call venv\Scripts\activate
echo echo === Irodori-TTS サーバーを GPU(CUDA) モードで起動します ===
echo python -m irodori_openai_tts --device cuda --host 0.0.0.0 --port 8088
echo pause
) > "%BASE_DIR%\start_server.bat"

echo =================================================================
echo   🎉 v2 修正完了！今度こそガチの完全勝利や！ 🎉
echo =================================================================
pause
