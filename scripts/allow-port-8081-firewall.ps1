# Uruchom w PowerShell jako Administrator (prawy przycisk -> Uruchom jako administrator).
# Otwiera port 8081 w Windows Firewall, żeby telefon w Wi-Fi mógł łączyć się z backendem.

$ruleName = "Backend API 8081 (mobile dev)"
$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Regula juz istnieje: $ruleName"
    exit 0
}

New-NetFirewallRule -DisplayName $ruleName `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 8081 `
    -Action Allow `
    -Profile Private, Domain

Write-Host "Dodano regule zapory. Port 8081 jest otwarty dla sieci lokalnej."
