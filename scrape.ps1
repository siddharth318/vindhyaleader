$ErrorActionPreference = "SilentlyContinue"
$resp = Invoke-WebRequest -Uri "https://vindhyaleader.com/" -UseBasicParsing -Headers @{ "User-Agent" = "Mozilla/5.0" }
$html = $resp.Content
$links = [regex]::Matches($html, 'https://vindhyaleader\.com/\d{2}/\d{2}/\d{4}/[a-zA-Z-]+/[^"''\s]+/') | ForEach-Object { $_.Value } | Select-Object -Unique
$top = $links | Select-Object -First 14
$results = @()
foreach ($u in $top) {
  $r = Invoke-WebRequest -Uri $u -UseBasicParsing -Headers @{ "User-Agent" = "Mozilla/5.0" }
  $h = $r.Content
  $title = [regex]::Match($h, '<meta property="og:title" content="([^"]+)"').Groups[1].Value
  $img = [regex]::Match($h, '<meta property="og:image" content="([^"]+)"').Groups[1].Value
  $desc = [regex]::Match($h, '<meta property="og:description" content="([^"]+)"').Groups[1].Value
  $pub = [regex]::Match($h, '"datePublished":"([^"]+)"').Groups[1].Value
  $cat = [regex]::Match($u, 'com/\d{2}/\d{2}/\d{4}/([a-zA-Z-]+)/').Groups[1].Value
  $obj = [pscustomobject]@{ url = $u; title = $title; image = $img; desc = $desc; pub = $pub; cat = $cat }
  $results += $obj
  Start-Sleep -Milliseconds 300
}
$results | ConvertTo-Json -Depth 3 | Out-File -Encoding utf8 scraped.json
Write-Output "DONE $($results.Count)"
