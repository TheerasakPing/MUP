$headers = @{
    "Accept" = "application/vnd.github+json"
    "Authorization" = "Bearer $env:GITHUB_TOKEN"
}

$body = @{
    tag_name = "v0.17.2"
    name = "v0.17.2"
    body = @"
## ✨ New Features

### 1. Custom Model Presets
- Full-stack system to save and load model configurations
- Import/Export presets as JSON for easy sharing
- Persistent storage for custom model sets

### 2. Model Health & Validation
- Automated health check service to ping and validate model endpoints
- Visual health indicators in the model settings UI
- Detailed health reports with error diagnostics

### 3. Realtime Agent Status Monitor
- Live dashboard in the sidebar showing agent activity
- Visual streaming metrics (TPS, token counts, elapsed time)
- Session cost tracking and per-model performance breakdown
"@
    draft = $false
    prerelease = $false
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/TheerasakPing/MUP/releases" -Method Post -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "✅ Release created successfully!"
    Write-Host "Release URL: $($response.html_url)"
    exit 0
} catch {
    Write-Host "❌ Failed to create release:"
    Write-Host $_.Exception.Message
    exit 1
}
