@echo off
title Subiendo StamPass VIP v3.1 a GitHub...
cd /d "C:\Users\NuevoNatal\Documents\antigravity\Tarjetas-VIP\stampassvip"
echo ========================================================
echo   SUBIENDO STAMPASS VIP v3.1 A GITHUB (BAR LA IGLESIA)
echo ========================================================
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   [OK] SUBIDO CON EXITO A GITHUB!
    echo   Vercel esta desplegando los cambios en stampassvip.vercel.app
    echo ========================================================
) else (
    echo [ERROR] No se pudo subir. Revisa la conexion o credenciales.
)
echo.
pause
