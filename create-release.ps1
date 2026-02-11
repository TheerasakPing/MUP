$ErrorActionPreference = "Stop"

# Configuration
$owner = "TheerasakPing"
$repo = "MUP"
$tag = "v0.17.4"
$branch = "main"
$token = $env:GITHUB_TOKEN

# Validation
if (-not $token) {
    Write-Host "Error: GITHUB_TOKEN environment variable is not set."
    Write-Host "Please set it using: `$env:GITHUB_TOKEN = 'your_token_here'"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept"        = "application/vnd.github.v3+json"
}

# 1. Check if release already exists
try {
    $existingReleaseUrl = "https://api.github.com/repos/$owner/$repo/releases/tags/$tag"
    $existingRelease = Invoke-RestMethod -Uri $existingReleaseUrl -Headers $headers -ErrorAction Stop
    
    Write-Host "✅ Release '$tag' already exists!"
    Write-Host "Release URL: $($existingRelease.html_url)"
    Write-Host "Status: $(if($existingRelease.draft) {'Draft'} else {'Published'})"
    exit 0
}
catch {
    if ($_.Exception.Response.StatusCode -ne 404) {
        Write-Host "❌ Error checking for existing release:"
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
        Write-Host $_.Exception.Message
        exit 1
    }
}

# 2. Prepare Release Body
$releaseNotes = @"
## 🚀 Features

- **Custom Model Presets**: Save and load model configurations.
- **Model Health & Validation**: Built-in checks for model endpoints.
- **Realtime Agent Status Monitor**: Visual dashboard of agent activity.

## 🐛 Bug Fixes

- Fixed build system stability across Linux, macOS, and Windows.
- Fixed TypeScript build errors in cost tracking service.
- Resolved styling glitches in settings modal.
"@

$body = @{
    tag_name         = $tag
    target_commitish = $branch
    name             = $tag
    body             = $releaseNotes
    draft            = $false
    prerelease       = $false
} | ConvertTo-Json

# 3. Create Release
Write-Host "Creating release '$tag'..."
try {
    $createUrl = "https://api.github.com/repos/$owner/$repo/releases"
    $response = Invoke-RestMethod -Uri $createUrl -Method Post -Headers $headers -Body $body -ContentType "application/json"
    
    Write-Host "✅ Release created successfully!"
    Write-Host "Release URL: $($response.html_url)"
    exit 0
}
catch {
    Write-Host "❌ Failed to create release:"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errBody"
    }
    else {
        Write-Host $_.Exception.Message
    }
    exit 1
}
