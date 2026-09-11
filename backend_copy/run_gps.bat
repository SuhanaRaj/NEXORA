@echo off
setlocal
set "VENV=%USERPROFILE%\SIH_Drone_Rescue_AI_FINAL_venv"
call "%VENV%\Scripts\activate.bat"
python simulator\gps_simulator.py
pause
