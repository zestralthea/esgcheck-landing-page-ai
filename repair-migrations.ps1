# PowerShell script to mark all migrations as applied in Supabase migration history

Write-Host "Migration Repair Script - Mark as Applied" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow

# List of migration timestamps
$migrations = @(
    "20250716220808",
    "20250718075207",
    "20250720124749",
    "20250720131423",
    "20250720131745",
    "20250720132617",
    "20250720133014",
    "20250723142310",
    "20250723142410",
    "20250723142547",
    "20250723144040",
    "20250723144122",
    "20250723144642",
    "20250723145308",
    "20250723145334",
    "20250723150043",
    "20250723150307",
    "20250723151032",
    "20250723151550",
    "20250723151608",
    "20250724064028",
    "20250724070717",
    "20250724070748",
    "20250724070820",
    "20250724072941",
    "20250724073430",
    "20250724135643",
    "20250724135707",
    "20250726191550",
    "20250727055746",
    "20250728000000"
)

$total = $migrations.Count
$counter = 0

foreach ($migration in $migrations) {
    $counter++
    Write-Host "[$counter/$total] Marking migration $migration as applied..." -ForegroundColor Green
    
    # Run the repair command
    supabase migration repair --status applied $migration
    
    # Check if the command was successful
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Successfully marked $migration as applied" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Failed to mark $migration as applied" -ForegroundColor Red
    }
}

Write-Host "`nAll migrations have been processed." -ForegroundColor Yellow
Write-Host "You can now run 'supabase db push' to apply any remaining migrations." -ForegroundColor Yellow