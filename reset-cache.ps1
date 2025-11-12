# Script para limpar cache e reiniciar o Expo
Write-Host "Limpando cache do Expo..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

Write-Host "Reiniciando Metro bundler com cache limpo..." -ForegroundColor Green
npx expo start --clear

