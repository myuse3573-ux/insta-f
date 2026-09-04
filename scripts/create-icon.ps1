Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\myuse\.gemini\antigravity-ide\brain\7736629a-b947-4634-93f6-ed417b4055af\instagram_app_icon_1788530734957.jpg"
$destPng = "d:\ALL USER\TOOL\insta f\electron\icon.png"
$destIco = "d:\ALL USER\TOOL\insta f\electron\icon.ico"

$src = [System.Drawing.Image]::FromFile($srcPath)
$bmp = New-Object System.Drawing.Bitmap 256, 256
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$cropX = [int]($src.Width * 0.17)
$cropY = [int]($src.Height * 0.17)
$cropW = [int]($src.Width * 0.66)
$cropH = [int]($src.Height * 0.66)

$srcRect = New-Object System.Drawing.Rectangle $cropX, $cropY, $cropW, $cropH
$destRect = New-Object System.Drawing.Rectangle 0, 0, 256, 256
$g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$bmp.Save($destPng, [System.Drawing.Imaging.ImageFormat]::Png)

$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream($destIco, [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()

$g.Dispose()
$src.Dispose()
$bmp.Dispose()
$icon.Dispose()

Write-Output "Icon generated successfully at $destPng and $destIco"
