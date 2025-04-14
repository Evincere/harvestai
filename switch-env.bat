@echo off
echo Cambiando configuración de entorno...

if exist .env.local (
    findstr /C:"ENTERPRISE_ENV=true" .env.local > nul
    if errorlevel 1 (
        echo Cambiando a entorno empresarial...
        powershell -Command "(Get-Content .env.local) -replace 'ENTERPRISE_ENV=false', 'ENTERPRISE_ENV=true' | Set-Content .env.local"
        echo Configuración cambiada a entorno empresarial.
    ) else (
        echo Cambiando a entorno normal...
        powershell -Command "(Get-Content .env.local) -replace 'ENTERPRISE_ENV=true', 'ENTERPRISE_ENV=false' | Set-Content .env.local"
        echo Configuración cambiada a entorno normal.
    )
) else (
    echo Creando archivo .env.local con configuración de entorno normal...
    echo ENTERPRISE_ENV=false > .env.local
    echo NEXT_PUBLIC_ENABLE_CLIENT_AI=true >> .env.local
    echo NEXT_PUBLIC_ENABLE_GEOLOCATION=true >> .env.local
    echo Archivo .env.local creado.
)

echo Hecho.
pause