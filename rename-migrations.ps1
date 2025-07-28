# PowerShell script to rename Supabase migration files
# Changes <timestamp>-<name>.sql to <timestamp>_<name>.sql

Write-Host "Migration File Renaming Script" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow

# Change to migrations directory
Set-Location -Path "supabase\migrations"

# Count files before renaming
$totalFiles = (Get-ChildItem -Filter "*.sql" | Measure-Object).Count
Write-Host "Found $totalFiles migration files to process." -ForegroundColor Green

# Process each .sql file
$renamedCount = 0
Get-ChildItem -Filter "*.sql" | ForEach-Object {
    # Check if the file matches the incorrect pattern (has a hyphen after the timestamp)
    if ($_.Name -match "^(\d{14})-(.+\.sql)$") {
        $timestamp = $matches[1]
        $rest = $matches[2]
        $newFileName = "${timestamp}_${rest}"
        
        Write-Host "Renaming: $($_.Name) to $newFileName" -ForegroundColor Green
        Rename-Item -Path $_.FullName -NewName $newFileName
        $renamedCount++
    } else {
        Write-Host "Skipping $($_.Name) - already in correct format or doesn't match expected pattern." -ForegroundColor Yellow
    }
}

# Count files after renaming
Write-Host "`nRenamed $renamedCount out of $totalFiles migration files." -ForegroundColor Green
Write-Host "Migration files are now in the correct format for Supabase." -ForegroundColor Yellow
Write-Host "`nYou can now run 'supabase db push' to apply these migrations."

# Return to original directory
Set-Location -Path "..\.."