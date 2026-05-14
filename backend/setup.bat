@echo off
REM Patient Hub Backend Installation Script (Windows)

echo.
echo ========================================
echo Patient Hub Backend Setup Script
echo ========================================

REM Check if PostgreSQL is installed
echo.
echo Checking PostgreSQL installation...
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X PostgreSQL is not installed!
    echo   Please install from: https://www.postgresql.org/download/
    pause
    exit /b 1
)
echo OK PostgreSQL found

REM Check if Node.js is installed
echo.
echo Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed!
    echo   Please install from: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo OK Node.js %NODE_VERSION% found

REM Create .env file if not exists
echo.
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo OK .env created. Please edit with your database credentials.
) else (
    echo OK .env already exists
)

REM Install dependencies
echo.
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo X Failed to install dependencies
    pause
    exit /b 1
)
echo OK Dependencies installed

REM Generate Prisma client
echo.
echo Generating Prisma client...
call npm run prisma:generate
if %ERRORLEVEL% NEQ 0 (
    echo X Failed to generate Prisma client
    pause
    exit /b 1
)
echo OK Prisma client generated

REM Push schema to database
echo.
echo Setting up database schema...
call npm run db:push
if %ERRORLEVEL% NEQ 0 (
    echo X Failed to push schema to database
    echo   Make sure your DATABASE_URL in .env is correct
    pause
    exit /b 1
)
echo OK Database schema created

REM Success
echo.
echo ========================================
echo OK Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start the server: npm run dev
echo 2. View database: npm run db:studio
echo 3. API docs: See API_DOCUMENTATION.md
echo.
echo Server will run at: http://localhost:5000
echo.
pause
