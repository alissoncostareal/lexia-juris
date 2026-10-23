$ErrorActionPreference = "Stop"

$BUILD_TOOLS = "C:\Users\aliss\AppData\Local\Android\Sdk\build-tools\35.0.0"
$ANDROID_JAR = "C:\Users\aliss\AppData\Local\Android\Sdk\platforms\android-35\android.jar"
$ROOT = "c:\dev\projetos\leis-estudo-app"
$APK_DIR = "$ROOT\android-apk"
$BUILD_DIR = "$APK_DIR\build"
$ASSETS_DIR = "$APK_DIR\assets"

Write-Host "=== 1. Limpando diretórios de build ===" -ForegroundColor Cyan
if (Test-Path "$BUILD_DIR") { Remove-Item -Recurse -Force "$BUILD_DIR" }
if (Test-Path "$ASSETS_DIR") { Remove-Item -Recurse -Force "$ASSETS_DIR" }
New-Item -ItemType Directory -Path "$BUILD_DIR\classes" | Out-Null
New-Item -ItemType Directory -Path "$BUILD_DIR\gen" | Out-Null
New-Item -ItemType Directory -Path "$ASSETS_DIR" | Out-Null

Write-Host "=== 2. Copiando index.html inlined para assets ===" -ForegroundColor Cyan
Copy-Item "$ROOT\docs\index.html" "$ASSETS_DIR\index.html" -Force
if (Test-Path "$ROOT\public\icon.svg") { Copy-Item "$ROOT\public\icon.svg" "$ASSETS_DIR\icon.svg" -Force }
if (Test-Path "$ROOT\public\manifest.json") { Copy-Item "$ROOT\public\manifest.json" "$ASSETS_DIR\manifest.json" -Force }

Write-Host "=== 3. Compilando Java com javac ===" -ForegroundColor Cyan
& javac -source 8 -target 8 -d "$BUILD_DIR\classes" -cp "$ANDROID_JAR" "$APK_DIR\src\br\leis\estudo\MainActivity.java"

Write-Host "=== 4. Gerando classes.dex com D8 ===" -ForegroundColor Cyan
& "$BUILD_TOOLS\d8.bat" --release --min-api 24 --output "$BUILD_DIR" "$BUILD_DIR\classes\br\leis\estudo\MainActivity.class" "$BUILD_DIR\classes\br\leis\estudo\MainActivity`$1.class" "$BUILD_DIR\classes\br\leis\estudo\MainActivity`$2.class"

Write-Host "=== 5. Empacotando com AAPT (Manifest + Assets) ===" -ForegroundColor Cyan
& "$BUILD_TOOLS\aapt.exe" package -f -m `
    -J "$BUILD_DIR\gen" `
    -M "$APK_DIR\AndroidManifest.xml" `
    -I "$ANDROID_JAR" `
    -A "$ASSETS_DIR" `
    -F "$BUILD_DIR\unaligned.apk"

Write-Host "=== 6. Adicionando classes.dex ao unaligned.apk ===" -ForegroundColor Cyan
Push-Location "$BUILD_DIR"
& "$BUILD_TOOLS\aapt.exe" add "unaligned.apk" "classes.dex"
Pop-Location

Write-Host "=== 7. Alinhando APK com zipalign 4 ===" -ForegroundColor Cyan
& "$BUILD_TOOLS\zipalign.exe" -p -f 4 "$BUILD_DIR\unaligned.apk" "$BUILD_DIR\aligned.apk"

Write-Host "=== 8. Assinando com apksigner (v1, v2, v3, v4) ===" -ForegroundColor Cyan
& "$BUILD_TOOLS\apksigner.bat" sign `
    --ks "$APK_DIR\debug.keystore" `
    --ks-pass pass:android `
    --key-pass pass:android `
    --ks-key-alias androiddebugkey `
    --out "$BUILD_DIR\leisbr-estudo-signed.apk" `
    "$BUILD_DIR\aligned.apk"

Write-Host "=== 9. Verificando assinatura com apksigner ===" -ForegroundColor Cyan
& "$BUILD_TOOLS\apksigner.bat" verify --verbose "$BUILD_DIR\leisbr-estudo-signed.apk"

Write-Host "=== 10. Copiando APK assinado para docs/, public/ e frontend/ ===" -ForegroundColor Cyan
Copy-Item "$BUILD_DIR\leisbr-estudo-signed.apk" "$APK_DIR\leisbr-estudo.apk" -Force
Copy-Item "$BUILD_DIR\leisbr-estudo-signed.apk" "$ROOT\docs\leisbr-estudo.apk" -Force
Copy-Item "$BUILD_DIR\leisbr-estudo-signed.apk" "$ROOT\public\leisbr-estudo.apk" -Force
Copy-Item "$BUILD_DIR\leisbr-estudo-signed.apk" "$ROOT\frontend\public\leisbr-estudo.apk" -Force

$stat = Get-Item "$ROOT\docs\leisbr-estudo.apk"
Write-Host "`nAPK construído e assinado com sucesso! Tamanho: $($stat.Length) bytes" -ForegroundColor Green
