# Phase 7 verification: build both base scenarios and check asset reachability (T7.3)
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File .automation\verify-base.ps1
# NOTE: stop any running docs:preview process first (it locks dist and node_modules).
# This file is intentionally ASCII-only: Windows PowerShell 5.1 reads .ps1 as ANSI
# unless a BOM is present, which would corrupt non-ASCII comments.

$ErrorActionPreference = 'Continue'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

function Invoke-BuildCheck {
  param([string]$Label, [string]$Prefix)

  # Write-Host keeps progress output on screen; the return value is only the boolean.
  Write-Host "=============================================="
  Write-Host "Scenario: $Label"
  Write-Host "=============================================="

  if (Test-Path '.\docs\.vitepress\dist') { Remove-Item -Recurse -Force '.\docs\.vitepress\dist' }

  if ($Prefix -eq '/') { $env:VITEPRESS_BASE = $null } else { $env:VITEPRESS_BASE = $Prefix }

  # npm writes progress to stderr; redirect to a temp file to avoid tripping
  # PowerShell's native-command error handling.
  $logFile = Join-Path $env:TEMP 'vitepress-build.log'
  & npm run docs:build *> $logFile
  $code = $LASTEXITCODE
  Get-Content $logFile -Encoding UTF8 | Select-String -Pattern 'build complete|Build failed|build error' | Select-Object -First 3 | ForEach-Object { Write-Host "  $($_.Line.Trim())" }
  if ($code -ne 0) { Write-Host "  RESULT: FAIL (build exit code $code)"; return $false }

  $dist = '.\docs\.vitepress\dist'
  $html = Get-ChildItem $dist -Recurse -Filter '*.html'
  Write-Host "  pages: $($html.Count)"

  $refTotal = 0
  $refBadPrefix = 0
  $refMissing = 0

  # Match any root-absolute asset reference. The base prefix is validated separately
  # so that base '/' (refs like /assets/x.css) and base '/ckj_blog/' both work.
  # The middle segment must be OPTIONAL, otherwise '/assets/...' is not matched.
  $pattern = '(?:href|src)="(/[^"]*?(?:assets|images)/[^"]*?)"'

  foreach ($page in $html) {
    $content = Get-Content $page.FullName -Raw -Encoding UTF8
    foreach ($m in [regex]::Matches($content, $pattern)) {
      $ref = $m.Groups[1].Value
      $refTotal++

      if (-not $ref.StartsWith($Prefix)) {
        $refBadPrefix++
        Write-Host "    wrong base prefix: $ref"
        continue
      }

      $rel = $ref.Substring($Prefix.Length)
      $full = Join-Path $dist ($rel -replace '/', '\')
      if (-not (Test-Path $full)) {
        $refMissing++
        Write-Host "    missing asset: $ref"
      }
    }
  }

  Write-Host "  asset refs checked : $refTotal"
  Write-Host "  wrong base prefix  : $refBadPrefix"
  Write-Host "  missing on disk    : $refMissing"
  $pass = ($refBadPrefix -eq 0) -and ($refMissing -eq 0) -and ($refTotal -gt 0)
  Write-Host "  RESULT: $(if ($pass) { 'PASS' } else { 'FAIL' })"
  Write-Host ""
  return $pass
}

$r1 = Invoke-BuildCheck -Label 'local / user page / custom domain (base = /)' -Prefix '/'
$r2 = Invoke-BuildCheck -Label 'GitHub project page (base = /ckj_blog/ as injected by workflow)' -Prefix '/ckj_blog/'

# restore local default
$env:VITEPRESS_BASE = $null

Write-Host "=============================================="
Write-Host "OVERALL: $(if ($r1 -and $r2) { 'PASS' } else { 'FAIL' })"
exit $(if ($r1 -and $r2) { 0 } else { 1 })

