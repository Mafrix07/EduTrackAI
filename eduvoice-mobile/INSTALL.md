# ⚡ Installation EduVoice Mobile — SDK 51 (Expo Go compatible)

## Pourquoi SDK 51 ?
Expo Go sur le store supporte jusqu'au SDK 51.
SDK 52/53/56 nécessitent de compiler l'app soi-même (EAS Build).

## Commandes (PowerShell Administrateur)

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
npx expo start --clear
```

Le `.npmrc` gère `legacy-peer-deps` et `ignore-scripts` automatiquement.

## Sur téléphone
Installez **Expo Go** depuis le store puis scannez le QR.
Si "failed to download" : `npx expo start --tunnel`

## Mode Demo
Onglet Vocal → 3 taps sur "EduVoice" → badge DEMO
