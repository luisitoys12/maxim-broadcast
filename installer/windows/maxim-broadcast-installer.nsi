; Maxim Broadcast v1.0.0 - NSIS Installer Script
; Copyright (c) 2026 EstacionKusMedia
; License: GNU GPL v2.0

!include "MUI2.nsh"

Name "Maxim Broadcast v1.0.0"
OutFile "maxim-broadcast-1.0.0-windows-x64-setup.exe"
InstallDir "$PROGRAMFILES64\Maxim Broadcast"
InstallDirRegKey HKLM "Software\MaximBroadcast" "InstallDir"
RequestExecutionLevel admin

!define MUI_ICON "..\..\frontend\assets\maxim-icon.ico"
!define MUI_UNICON "..\..\frontend\assets\maxim-icon.ico"
!define MUI_WELCOMEPAGE_TITLE "Bienvenido a Maxim Broadcast v1.0.0"
!define MUI_WELCOMEPAGE_TEXT "Este asistente instalara Maxim Broadcast en tu computadora.$\r$\n$\r$\nMaxim Broadcast es una plataforma profesional de produccion audiovisual basada en OBS Studio, con IA integrada, editor dual y capacidades de multi-camara avanzadas."

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "..\..\COPYING"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "Spanish"
!insertmacro MUI_LANGUAGE "English"

Section "Maxim Broadcast Core" SecCore
  SectionIn RO
  SetOutPath "$INSTDIR"
  File /r "..\..\build\Release\*.*"
  
  SetOutPath "$INSTDIR\obs-plugins"
  File /r "..\..\build\Release\obs-plugins\*.*"
  
  SetOutPath "$INSTDIR\data"
  File /r "..\..\build\Release\data\*.*"
  
  SetOutPath "$INSTDIR\frontend"
  File /r "..\..\frontend\dist\*.*"
  
  SetOutPath "$INSTDIR\backend"
  File /r "..\..\backend\dist\*.*"
  
  CreateDirectory "$SMPROGRAMS\Maxim Broadcast"
  CreateShortcut "$SMPROGRAMS\Maxim Broadcast\Maxim Broadcast.lnk" "$INSTDIR\maxim-broadcast.exe"
  CreateShortcut "$SMPROGRAMS\Maxim Broadcast\Uninstall.lnk" "$INSTDIR\uninstall.exe"
  CreateShortcut "$DESKTOP\Maxim Broadcast.lnk" "$INSTDIR\maxim-broadcast.exe"
  
  WriteRegStr HKLM "Software\MaximBroadcast" "InstallDir" "$INSTDIR"
  WriteRegStr HKLM "Software\MaximBroadcast" "Version" "1.0.0"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MaximBroadcast" "DisplayName" "Maxim Broadcast v1.0.0"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MaximBroadcast" "UninstallString" "$INSTDIR\uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MaximBroadcast" "Publisher" "EstacionKusMedia"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MaximBroadcast" "DisplayVersion" "1.0.0"
  
  WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd

Section "Uninstall"
  RMDir /r "$INSTDIR"
  RMDir /r "$SMPROGRAMS\Maxim Broadcast"
  Delete "$DESKTOP\Maxim Broadcast.lnk"
  DeleteRegKey HKLM "Software\MaximBroadcast"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\MaximBroadcast"
SectionEnd
