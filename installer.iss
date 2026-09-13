#define MyAppName "Nammil"
#define MyAppVersion "1.2.8"
#define MyAppPublisher "Elvan Navil"
#define MyAppExeName "Nammil.exe"
#define MyOutputDir "build-release"
#define MyAppURL "https://elvannavil.vercel.app"
#define MyAppId "com.nammil.app"

[Setup]
AppId={{5A8C4A9D-2F38-4F43-A1C2-8B1E4A35B9D1}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={localappdata}\Programs\{#MyAppName}
PrivilegesRequired=lowest
DisableProgramGroupPage=yes

; Modern Theme Settings
WizardStyle=modern
SetupIconFile=build\icon.ico
UninstallDisplayIcon={app}\{#MyAppExeName}
Compression=lzma2/normal
SolidCompression=yes
OutputDir={#MyOutputDir}
OutputBaseFilename=Nammil Setup
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
CloseApplications=force
RestartApplications=no

; Custom UI Images (Branding)
WizardImageFile=build\setup_sidebar.bmp
WizardSmallImageFile=build\setup_icon.bmp

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "build-release\win-unpacked\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "build-release\win-unpacked\resources\app-update.yml"; DestDir: "{app}\resources"; Flags: ignoreversion skipifsourcedoesntexist
Source: "build-release\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[InstallDelete]
Type: files; Name: "{app}\Elvan Nammil.exe"
Type: files; Name: "{autoprograms}\Elvan Nammil.lnk"
Type: files; Name: "{autodesktop}\Elvan Nammil.lnk"
Type: files; Name: "{userprograms}\Elvan Nammil.lnk"
Type: files; Name: "{userdesktop}\Elvan Nammil.lnk"
Type: files; Name: "{userstartup}\Elvan Nammil.lnk"
Type: files; Name: "{commonprograms}\{#MyAppName}.lnk"
Type: files; Name: "{commondesktop}\{#MyAppName}.lnk"
Type: files; Name: "{commonstartup}\{#MyAppName}.lnk"
Type: files; Name: "{userstartup}\{#MyAppName}.lnk"

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; AppUserModelID: "{#MyAppId}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
Filename: "{app}\{#MyAppExeName}"; Flags: nowait skipifnotsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}"
Type: files; Name: "{autoprograms}\{#MyAppName}.lnk"
Type: files; Name: "{autodesktop}\{#MyAppName}.lnk"
Type: files; Name: "{userstartup}\{#MyAppName}.lnk"

[Code]
function InitializeSetup(): Boolean;
var
  ResultCode: Integer;
begin
  Exec('taskkill.exe', '/F /IM Nammil.exe /T', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  Exec('taskkill.exe', '/F /IM "Elvan Nammil.exe" /T', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  Result := True;
end;

function InitializeUninstall(): Boolean;
var
  ResultCode: Integer;
begin
  Exec('taskkill.exe', '/F /IM Nammil.exe /T', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  Exec('taskkill.exe', '/F /IM "Elvan Nammil.exe" /T', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  Result := True;
end;

function PrepareToInstall(var NeedsRestart: Boolean): String;
var
  ResultCode: Integer;
begin
  Exec('taskkill.exe', '/F /IM Nammil.exe /T', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  Exec('taskkill.exe', '/F /IM "Elvan Nammil.exe" /T', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  Result := '';
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  AppDataPath: String;
begin
  if CurUninstallStep = usPostUninstall then
  begin
    AppDataPath := ExpandConstant('{userappdata}\{#MyAppName}');
    if DirExists(AppDataPath) then
    begin
      if MsgBox('Do you want to remove all app data (WhatsApp session, settings, cache)?'#13#10#13#10'Click Yes for a clean uninstall.'#13#10'Click No to keep your data for future reinstalls.',
        mbConfirmation, MB_YESNO) = IDYES then
      begin
        DelTree(AppDataPath, True, True, True);
      end;
    end;
  end;
end;
