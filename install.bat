@echo off
setlocal

rem Banner
echo.
echo @ Hugo Ramos 2024. All rights reserved.
echo +------------------------------------------------------+
echo +                Hugo-Utils Installer                  +
echo +------------------------------------------------------+

rem Change to script directory
cd /d "%~dp0"

rem Check if Chocolatey is installed
echo.
echo Chocolatey installation check...
choco -v >nul 2>&1
if %errorlevel% neq 0 (
    rem Chocolatey is not installed, install it
    echo Chocolatey is not installed, installing Chocolatey...
    @powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
) else (
    echo Chocolatey is already installed.
)

rem Verify if Node.js is installed
echo.
echo Node.js installation check...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Node.js...
    @powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
    choco install nodejs-lts -y
) else (
    echo Node.js is already installed.
)

rem Install pip and setuptools if Python is installed
echo.
echo Python installation check...
python -c "import platform; print(platform.python_version())" >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed.
    pause
    goto :eof
) else (
    echo Python is already installed.
    echo Installing pip and setuptools...
    python -m ensurepip --upgrade
    python -m pip install --upgrade setuptools
)

rem Install node-gyp global
echo.
echo Installing node-gyp global dependence...
call npm install -g node-gyp@latest

rem Install npm dependencies
echo.
echo Installing npm dependencies...
call npm install

rem Check if there were any errors during npm install
if %errorlevel% neq 0 (
    echo.
    echo There was an error during npm install. Please check the logs.
    echo.
    pause
    goto :eof
)

rem Execute electron-rebuild
echo.
echo Executing electron-rebuild...
call .\node_modules\.bin\electron-rebuild.cmd

rem Create Hugo-Utils.exe shortcut with custom icon
echo.
set "absolute_path=%~dp0"
set "lnk_path=%absolute_path%Hugo-Utils.lnk"
set "target_path=%absolute_path%RunNHide.exe"
set "arguments=%absolute_path%start.bat"
set "icon_path=%absolute_path%src\img\icons\icon_64px.ico"

echo Creating shortcut to Hugo-Utils.exe...
powershell -Command "$WScriptShell = New-Object -ComObject WScript.Shell; $Shortcut = $WScriptShell.CreateShortcut('%lnk_path%'); $Shortcut.TargetPath = '%target_path%'; $Shortcut.Arguments = '%arguments%'; $Shortcut.IconLocation = '%icon_path%'; $Shortcut.WorkingDirectory = '%absolute_path%'; $Shortcut.Save()"
if exist "%lnk_path%" (
    echo Shortcut to Hugo-Utils.exe created successfully.
) else (
    echo Failed to create the shortcut.
    pause
    goto :eof
)

rem Copy the shortcut to the user directory
for /d %%i in (C:\Users\*) do (
    if exist "%%i\AppData\Roaming" (
        copy /y "%lnk_path%" "%%i\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\" >nul
        if %errorlevel% neq 0 (
            echo Failed to copy the shortcut to %%i\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\
        )
    )
)

rem Ask the user if they want the program to run at Windows startup
echo.
set /p "startup=Do you want the program to run at Windows startup? (Y/N): "
if /i "%startup%"=="Y" (
    echo Adding Hugo-Utils to Windows startup...
    copy /y "%lnk_path%" "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp" >nul
    if %errorlevel% neq 0 (
        echo Failed to add to Windows startup.
    ) else (
	echo Succesfully added to Windows startup.
    )
)

rem Ask the user if they want to run the program now
echo.
set /p "response=Do you want to run the program now? (Y/N): "
if /i "%response%"=="Y" (
    echo Running the program... [it will take a few seconds]
    start "" "%lnk_path%"
)

echo.
echo All tasks completed successfully. Please press [ENTER] to exit...
pause >nul
endlocal
