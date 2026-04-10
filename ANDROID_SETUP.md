# Android App Setup Guide

This guide will help you build APK and AAB files for the Ascend web app using Capacitor.

## Prerequisites

1. **Node.js 20+** and npm
2. **Android Studio** with Android SDK installed
3. **Java JDK 17** or higher
4. **Git** for version control

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Web App
```bash
npm run build
```

### 3. Setup Capacitor (First time only)
```bash
npx cap init "Ascend" "com.ascend.game" --web-dir="dist/public"
npx cap add android
```

### 4. Sync Web Assets to Android
```bash
npm run android:build
```

### 5. Open in Android Studio
```bash
npm run android:open
```

## Building APK and AAB

### Debug APK (For testing)
```bash
npm run android:apk:debug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (For distribution)
```bash
npm run android:apk:release
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

### Release AAB (For Google Play Store)
```bash
npm run android:aab:release
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

## App Signing Configuration

### For Unsigned Builds (Testing)
The builds will work without signing configuration for testing purposes.

### For Signed Release Builds

1. **Create a keystore:**
```bash
cd android
mkdir -p keystore
keytool -genkey -v -keystore keystore/release.keystore -storetype PKCS12 -keyalg RSA -keysize 2048 -validity 10000 -alias release
```

2. **Configure signing:**
```bash
cd android
cp keystore.properties.example keystore.properties
```

3. **Edit `keystore.properties` with your values:**
```properties
storeFile=../keystore/release.keystore
storePassword=your_store_password
keyAlias=release
keyPassword=your_key_password
```

## GitHub Actions CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/android-build.yml`) that automatically:

- Builds debug APK, release APK, and release AAB
- Uploads artifacts to GitHub Actions
- Creates releases when tags are pushed

### Triggering Builds

- **On push to main/develop**: Builds all variants
- **On tags (v*)**: Creates GitHub release with artifacts
- **Manual trigger**: Use "workflow_dispatch" in GitHub Actions

### Environment Variables for Signing

To enable signed builds in GitHub Actions, add these secrets to your repository:

- `KEYSTORE_FILE`: Base64 encoded keystore file
- `KEYSTORE_PASSWORD`: Keystore password
- `KEY_ALIAS`: Key alias
- `KEY_PASSWORD`: Key password

## Running on Device

### Using Android Studio
1. Open the project with `npm run android:open`
2. Connect your Android device via USB
3. Click the "Run" button in Android Studio

### Using Command Line
```bash
npm run android:run
```

## Project Structure

```
android/
  app/
    build.gradle          # App-level build configuration
    src/main/
      AndroidManifest.xml # Android app manifest
      assets/public/       # Web app assets (auto-synced)
  build.gradle            # Project-level build configuration
  keystore/               # Signing keys (create manually)
  keystore.properties     # Signing configuration
  gradlew                 # Gradle wrapper script

.github/workflows/
  android-build.yml       # GitHub Actions workflow
```

## Troubleshooting

### Build Issues
- Ensure Android SDK and build tools are up to date
- Check that Java JDK 17+ is installed and configured
- Verify `ANDROID_HOME` environment variable is set

### Sync Issues
- Always run `npm run build` before `npx cap sync`
- Check that `dist/public` directory exists and contains `index.html`

### Signing Issues
- Verify keystore file exists and permissions are correct
- Check that keystore.properties values match the keystore
- Ensure passwords don't contain special characters

## App Information

- **Package Name**: `com.ascend.game`
- **App Name**: `Ascend`
- **Minimum SDK**: 21 (Android 5.0)
- **Target SDK**: 34 (Android 14)
- **Compile SDK**: 34

## Permissions

The app requires these permissions (defined in AndroidManifest.xml):
- `android.permission.INTERNET` - For web functionality
