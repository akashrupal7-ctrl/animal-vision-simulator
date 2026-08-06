# 🛠️ Android Build Instructions (APK & AAB)

This guide provides step-by-step instructions to compile, build, sign, and export Debug APK, Release APK, and Android App Bundle (.aab) for **Animal Vision Simulator** using Android Studio or Gradle Command Line Interface (CLI).

---

## 📋 Prerequisites

1. **Node.js**: v18.x or v20.x+
2. **JDK**: Java Development Kit 17 or 21
3. **Android Studio**: Ladybug / Jellyfish or latest stable release with Android SDK API 34+ (Android 14/15)
4. **Capacitor CLI**: `@capacitor/cli@8.x` (pre-configured)

---

## 🚀 Option A: Build via Android Studio (Recommended)

### Step 1: Open the Project
1. Launch **Android Studio**.
2. Click **Open** (or `File -> Open`).
3. Select the `Animal Vision Simulator/Android` folder (or sync root via `npx cap open android`).
4. Wait for Gradle sync to complete automatically.

### Step 2: Build Debug APK
1. In Android Studio top menu, navigate to `Build -> Build Bundle(s) / APK(s) -> Build APK(s)`.
2. Once complete, click **locate** in the popup notification.
3. Your Debug APK will be located at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 3: Build Release APK / Signed AAB for Google Play Store
1. Go to `Build -> Generate Signed Bundle / APK`.
2. Select **Android App Bundle** (for Google Play) or **APK** (for direct distribution).
3. Choose your Keystore path (or click *Create new...* if generating a new release key).
4. Select `release` build variant with V1/V2 signature schemes checked.
5. Click **Finish**.
6. Output path:
   - Signed APK: `android/app/release/app-release.apk`
   - Signed AAB: `android/app/release/app-release.aab`

---

## 💻 Option B: Build via Gradle CLI (Command Line)

Run the following commands in your terminal from the project directory:

```bash
# 1. Install dependencies & build Web assets
npm install
npm run build

# 2. Sync web build to Capacitor Android project
npx cap sync android

# 3. Navigate into android directory
cd android

# 4. Build Debug APK
./gradlew assembleDebug

# Output APK path:
# android/app/build/outputs/apk/debug/app-debug.apk

# 5. Build Release APK
./gradlew assembleRelease

# Output APK path:
# android/app/build/outputs/apk/release/app-release-unsigned.apk

# 6. Build Android App Bundle (.aab) for Google Play Store
./gradlew bundleRelease

# Output AAB path:
# android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🔒 Environment & API Key Verification

Ensure the `.env` file contains valid credentials before production build:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
NODE_ENV=production
```
