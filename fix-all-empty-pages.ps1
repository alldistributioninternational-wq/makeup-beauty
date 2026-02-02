$projectPath = "C:\Users\Utilisateur\Desktop\site web make up\makeup-beauty\src\app"

Write-Host ""
Write-Host "========================================"
Write-Host "Correction des fichiers page.tsx vides"
Write-Host "========================================"
Write-Host ""

$pageFiles = Get-ChildItem -Path $projectPath -Filter "page.tsx" -Recurse

$emptyCount = 0
$okCount = 0

foreach ($file in $pageFiles) {
    $relativePath = $file.FullName.Replace($projectPath, "").TrimStart('\')
    
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        
        if ([string]::IsNullOrWhiteSpace($content) -or $content.Length -lt 20) {
            Write-Host "VIDE: $relativePath" -ForegroundColor Yellow
            
            $folderName = $file.Directory.Name
            
            if ($folderName -match '^\[.*\]$') {
                $parentFolder = $file.Directory.Parent.Name
                $componentName = (Get-Culture).TextInfo.ToTitleCase($parentFolder) + "DetailPage"
            } else {
                $componentName = (Get-Culture).TextInfo.ToTitleCase($folderName) + "Page"
            }
            
            $minimalContent = "export default function " + $componentName + "() {`n  return (`n    <div className=`"p-8`">`n      <h1 className=`"text-2xl font-bold`">" + $componentName + "</h1>`n      <p className=`"mt-4 text-gray-600`">Cette page est en cours de developpement.</p>`n    </div>`n  )`n}"
            
            Set-Content -Path $file.FullName -Value $minimalContent -Encoding UTF8
            Write-Host "  Corrige avec: $componentName" -ForegroundColor Green
            $emptyCount++
        } else {
            Write-Host "OK: $relativePath" -ForegroundColor Green
            $okCount++
        }
    } catch {
        Write-Host "ERREUR: $relativePath" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "Resume:"
Write-Host "  - Fichiers OK: $okCount"
Write-Host "  - Fichiers corriges: $emptyCount"
Write-Host "========================================"
Write-Host ""

if ($emptyCount -gt 0) {
    Write-Host "Tous les fichiers vides ont ete corriges!" -ForegroundColor Green
}
