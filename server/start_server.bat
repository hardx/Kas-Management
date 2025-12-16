@echo off
setlocal enabledelayedexpansion

rem Start Node.js server di background dengan window minimize
set "NODE=E:\laragon\bin\nodejs\node-v24\node.exe"
set "APP_DIR=E:\laragon\www\notes-new\server"

cd /d "%APP_DIR%" || exit /b 1

rem Jalankan node.exe LANGSUNG (bukan /B)
start "NotesNewServer" /MIN "%NODE%" index.js

rem Exit script ini (node tetap berjalan di background)
timeout /t 2 /nobreak >nul
exit /b 0
