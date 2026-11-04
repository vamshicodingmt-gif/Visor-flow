# Visor Flow — Windows quick start (PowerShell 5.1+)
$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Write-Host ""
Write-Host "Visor Flow — Windows setup" -ForegroundColor Cyan

# Node.js and npm are required; Git is deliberately NOT required.
try { $nodeVersion = (& node --version 2>$null) } catch { $nodeVersion = $null }
try { $npmVersion = (& npm.cmd --version 2>$null) } catch { $npmVersion = $null }
if (-not $nodeVersion -or -not $npmVersion) {
  Write-Host "Node.js and npm are required but were not found." -ForegroundColor Yellow
  Write-Host "Install the current Node.js LTS (which includes npm): https://nodejs.org/en/download"
  Write-Host "Then close and reopen PowerShell and run this setup command again."
  exit 1
}
Write-Host "Found Node $nodeVersion and npm $npmVersion."

$target = Join-Path $env:USERPROFILE "Visor-flow"
if (Test-Path $target) {
  Write-Host "The folder already exists: $target" -ForegroundColor Yellow
  Write-Host "Rename or remove that folder, then run this setup again. Nothing was overwritten."
  exit 1
}

$tempRoot = Join-Path ([IO.Path]::GetTempPath()) ("visor-flow-" + [guid]::NewGuid().ToString("N"))
$zipPath = Join-Path $tempRoot "source.zip"
$extractPath = Join-Path $tempRoot "extract"
New-Item -ItemType Directory -Path $extractPath -Force | Out-Null
try {
  Write-Host "Downloading Visor Flow from GitHub (no Git installation needed)…"
  Invoke-WebRequest -Uri "https://codeload.github.com/vamshicodingmt-gif/Visor-flow/zip/refs/heads/main" -OutFile $zipPath -UseBasicParsing
  Expand-Archive -LiteralPath $zipPath -DestinationPath $extractPath -Force
  $source = Get-ChildItem -LiteralPath $extractPath -Directory | Select-Object -First 1
  if (-not $source -or -not (Test-Path (Join-Path $source.FullName "package.json"))) {
    throw "The downloaded archive did not contain the Visor Flow project."
  }
  Move-Item -LiteralPath $source.FullName -Destination $target
  Write-Host "Project downloaded to $target" -ForegroundColor Green
} finally {
  if (Test-Path $tempRoot) { Remove-Item -LiteralPath $tempRoot -Recurse -Force }
}

Push-Location $target
try {
  Write-Host "Installing dependencies…"
  & npm.cmd install
  if ($LASTEXITCODE -ne 0) { throw "npm install failed with exit code $LASTEXITCODE." }

  Write-Host "Starting Visor Flow…"
  & npm.cmd start
  if ($LASTEXITCODE -ne 0) { throw "Visor Flow exited with code $LASTEXITCODE." }
} catch {
  Write-Host $_.Exception.Message -ForegroundColor Red
  Write-Host "You can retry from this folder with: npm.cmd install; npm.cmd start"
  exit 1
} finally {
  Pop-Location
}
