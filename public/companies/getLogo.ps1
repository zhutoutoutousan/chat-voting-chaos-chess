# Create companies directory if it doesn't exist
$outputPath = "."

# Company logo URLs
$logos = @{
    "apple"     = "https://www.apple.com/ac/globalnav/7/en_US/images/be15095f-5a20-57d0-ad14-cf4c638e223a/globalnav_apple_image__b5er5ngrzxqq_large.svg"
    "microsoft" = "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31"
    "amazon"    = "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
    "google"    = "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
    "meta"      = "https://about.meta.com/brand/resources/facebookapp/logo/logo-black.png"
    "tesla"     = "https://www.tesla.com/themes/custom/tesla_frontend/assets/logos/tesla-logo-red.svg"
}

# Download each logo
foreach ($company in $logos.Keys) {
    $url = $logos[$company]
    $outputFile = Join-Path $outputPath "$company.png"
    
    try {
        Write-Host "Downloading $company logo..."
        
        # Use Invoke-WebRequest to download the image
        Invoke-WebRequest -Uri $url -OutFile $outputFile
        
        # If it's an SVG, convert to PNG (requires ImageMagick)
        if ($url -match "\.svg") {
            magick convert $outputFile -background none -resize 200x200 $outputFile
        }
        else {
            # Resize PNG/JPG to consistent size
            magick convert $outputFile -resize 200x200 $outputFile
        }
        
        Write-Host "Successfully downloaded and processed $company logo"
    }
    catch {
        Write-Host "Failed to download $company logo: $_"
    }
}

Write-Host "Done downloading logos!"
