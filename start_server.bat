@echo off
setlocal
set NO_PAUSE=1
chcp 65001
call venv\Scripts\activate
python -m irodori_openai_tts --host localhost --port 8088
if not defined NO_PAUSE pause
