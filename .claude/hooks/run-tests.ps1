# Stop hook: 応答完了後にテスト一式を実行し、失敗時は Claude に decision:block でフィードバックする
# 失敗時の挙動: stdout に {"decision":"block","reason":"..."} を出力 -> Claude が次ターンで読み取り修正
# 成功時の挙動: 無出力 + exit 0
# 暴走防止: stop_hook_active=true の入力なら何もせず終了 (Claude が既にループ中)

$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$projectRoot = (Resolve-Path "$PSScriptRoot\..\..").Path
Set-Location -LiteralPath $projectRoot

$rawInput = ''
try { $rawInput = [Console]::In.ReadToEnd() } catch { }
if ($rawInput) {
  try {
    $hookInput = $rawInput | ConvertFrom-Json -ErrorAction Stop
    if ($hookInput.stop_hook_active -eq $true) { exit 0 }
  } catch { }
}

function Test-HasDep($name) {
  return (Test-Path -LiteralPath (Join-Path $projectRoot "node_modules\$name"))
}

function Invoke-Step {
  param([string]$Label, [scriptblock]$Action)
  Write-Host "[hook] running: $Label" -ForegroundColor Cyan
  $output = & $Action 2>&1 | Out-String
  $code = $LASTEXITCODE
  if ($code -ne 0) {
    return @{ ok = $false; label = $Label; output = $output.TrimEnd() }
  }
  return @{ ok = $true }
}

$failures = @()

if (Test-Path -LiteralPath (Join-Path $projectRoot 'tsconfig.json')) {
  $r = Invoke-Step 'tsc --noEmit' { npx --no-install tsc --noEmit }
  if (-not $r.ok) { $failures += $r }
}

$r = Invoke-Step 'next lint' { npx --no-install next lint }
if (-not $r.ok) { $failures += $r }

if (Test-HasDep 'vitest') {
  $r = Invoke-Step 'vitest run' { npx --no-install vitest run --reporter=default --passWithNoTests }
  if (-not $r.ok) { $failures += $r }
} else {
  Write-Host '[hook] vitest not installed, skipping' -ForegroundColor DarkGray
}

if ($failures.Count -eq 0) {
  Write-Host '[hook] all checks passed' -ForegroundColor Green
  exit 0
}

$sections = foreach ($f in $failures) {
  $body = $f.output
  if ($body.Length -gt 4000) { $body = $body.Substring(0, 4000) + "`n...(truncated)" }
  "## [$($f.label)] FAILED`n$body"
}
$reason = "Stop hookが自動テストの失敗を検出しました。以下のエラーを修正してください。`n`n" + ($sections -join "`n`n")

$payload = [pscustomobject]@{
  decision = 'block'
  reason   = $reason
}
$payload | ConvertTo-Json -Compress -Depth 5
exit 0
