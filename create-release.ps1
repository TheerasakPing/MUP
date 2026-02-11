$ErrorActionPreference = "Stop"

# Configuration
$owner = "TheerasakPing"
$repo = "MUP"
$tag = "v0.17.3"
$branch = "main" # Or the branch you want to release from
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
    
    # Optional: If it's a draft, publish it?
    # For now, we assume if it exists, we are good.
    exit 0
}
catch {
    # 404 means it doesn't exist, proceed.
    # Other errors are real errors.
    if ($_.Exception.Response.StatusCode -ne 404) {
        Write-Host "❌ Error checking for existing release:"
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
        Write-Host $_.Exception.Message
        exit 1
    }
}

# 2. Prepare Release Body
# Read from RELEASE_NOTES.md or use a generated one.
# For simplicity, using the notes we drafted earlier.
$releaseNotes = @"
## 🚀 Features

- **Custom Model Presets**: Define and save your own model configurations for quick access.
- **Model Health & Validation**: Built-in checks to ensure model parameters are valid and endpoints are reachable.
- **Realtime Agent Status Monitor**: Visual indicator of agent activity and status in the sidebar.

## 🐛 Bug Fixes

- Fixed build system stability across Linux, macOS, and Windows.
- Fixed an issue where the model list wouldn't update after adding a new provider.
- Resolved styling glitches in the settings modal.
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
