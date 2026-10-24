# Golden Arrow Odyssey — gerar APK (Android)

O projeto já está com Capacitor configurado e a pasta `android/` criada.
Tudo por comando. Rode na raiz do projeto.

## 1. Pré-requisitos (uma vez só)
- Node 20+ e Bun (`npm i -g bun`)
- JDK 21 (`java -version`)
- Android Studio (instala o SDK) **ou** só o SDK por linha de comando:
  ```bash
  # Linux/macOS — depois de baixar "commandline-tools" em developer.android.com/studio
  export ANDROID_HOME=$HOME/Android/Sdk
  mkdir -p $ANDROID_HOME/cmdline-tools
  # descompacte em $ANDROID_HOME/cmdline-tools/latest
  export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
  yes | sdkmanager --licenses
  sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0"
  ```
- Crie `android/local.properties` com: `sdk.dir=/caminho/do/Android/Sdk`
  (no Android Studio isso é criado sozinho ao abrir a pasta `android`).

## 2. Instalar, buildar e sincronizar
```bash
bun install
bun run cap:sync        # build do jogo + copia para o Android
```

## 3. APK de teste (debug)
```bash
cd android
./gradlew assembleDebug          # Windows: gradlew.bat assembleDebug
```
APK em: `android/app/build/outputs/apk/debug/app-debug.apk`
Instalar no celular (USB, depuração ativada): `adb install -r app/build/outputs/apk/debug/app-debug.apk`

## 4. Abrir no Android Studio
```bash
bun run cap:open
```

## 5. APK de release (assinado)
```bash
keytool -genkey -v -keystore meu.keystore -alias jogo -keyalg RSA -keysize 2048 -validity 10000
cd android && ./gradlew assembleRelease
$ANDROID_HOME/build-tools/36.0.0/apksigner sign --ks ../meu.keystore \
  --out app-release-assinado.apk app/build/outputs/apk/release/app-release-unsigned.apk
```
Para Play Store use `./gradlew bundleRelease` (gera .aab).

## 6. Ícone do app (opcional)
Coloque `assets/icon.png` (1024x1024) e `assets/splash.png` (2732x2732) e rode:
```bash
npx capacitor-assets generate --android
```

## Observações
- Fontes e imagens já ficam dentro do APK (funciona offline).
- Progresso do jogo fica no armazenamento do app (como no navegador).
- Login com Google/conta (Supabase/Lovable Cloud) exige internet e pode não completar o redirect dentro do APK; o jogo em si roda offline.
