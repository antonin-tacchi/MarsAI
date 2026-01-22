@echo off
REM Script to initialize environment files for Windows

if not exist "Front-end\.env.local" (
    echo Creating Front-end\.env.local...
    copy "Front-end\.env.local.example" "Front-end\.env.local"
    echo Created Front-end\.env.local
) else (
    echo Front-end\.env.local already exists
)

if not exist "back-end\.env" (
    echo Creating back-end\.env...
    copy "back-end\.env.example" "back-end\.env"
    echo Created back-end\.env
) else (
    echo back-end\.env already exists
)

echo.
echo Setup complete! You can now run: docker-compose up -d
