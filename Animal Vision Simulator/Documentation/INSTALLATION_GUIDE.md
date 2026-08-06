# 📱 Mobile Installation Guide (Android Phone)

This guide covers how to install **Animal Vision Simulator** on physical Android smartphones and tablets using direct APK sideloading, USB Debugging (ADB), or Android Studio.

---

## 📲 Method 1: Sideload APK directly on Android Device (Easiest)

### Step 1: Enable Installation from Unknown Sources
1. On your Android device, open **Settings**.
2. Go to **Apps & Notifications** (or **Security & Privacy**).
3. Tap **Special App Access** -> **Install Unknown Apps**.
4. Select your file manager, Chrome, or Google Drive, and toggle **Allow from this source** to **ON**.

### Step 2: Transfer & Install APK
1. Copy `app-debug.apk` or `app-release.apk` to your phone via USB cable, Bluetooth, or Google Drive link.
2. Open your device's **Files** app and locate the `.apk` file.
3. Tap on the `.apk` file and select **Install**.
4. When prompted by Android Play Protect, tap **Install Anyway**.
5. Launch **Animal Vision Simulator** from your home screen or app drawer!

---

## 🔌 Method 2: Install via USB Debugging (ADB CLI)

### Step 1: Enable Developer Options & USB Debugging
1. Open **Settings** -> **About Phone**.
2. Tap **Build Number** 7 times until you see *"You are now a developer!"*.
3. Go back to **Settings** -> **System** -> **Developer Options**.
4. Toggle **USB Debugging** to **ON**.

### Step 2: Connect via USB & Install via ADB
1. Connect your Android phone to your PC/Mac using a USB cable.
2. Allow USB Debugging prompt on phone screen when prompted (*"Always allow from this computer"*).
3. Open terminal/command prompt and run:
   ```bash
   adb devices
   ```
   *(Ensure your device appears in the connected list)*
4. Run:
   ```bash
   adb install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```
5. App will instantly install and open on your device.

---

## 🎥 Camera Permissions Setup
Upon first opening the application on your Android device:
1. Tap **Allow** when requested for Camera permissions (`android.permission.CAMERA`).
2. The real-time camera preview will feed directly into the custom WebGL shader pipeline for instant animal sight simulation!
