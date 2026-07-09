@echo off
echo ====================================================
echo   Decree 30 Document Generator - Backend API
echo ====================================================
echo.

cd /d "%~dp0"

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt -q

echo.
echo ========================================================
echo   LUU Y: Ban can dang nhap NotebookLM truoc khi dung.
echo   Neu chua dang nhap, mo terminal khac va chay:
echo     cd backend
echo     venv\Scripts\activate
echo     notebooklm login
echo ========================================================
echo.

echo Starting FastAPI server on http://localhost:8000 ...
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
