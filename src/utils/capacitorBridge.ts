import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface CameraPermissionState {
  granted: boolean;
  isNative: boolean;
  platform: string;
}

export async function checkAndRequestCameraPermissions(): Promise<boolean> {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    try {
      const status = await Camera.checkPermissions();
      if (status.camera !== 'granted') {
        const req = await Camera.requestPermissions({ permissions: ['camera'] });
        return req.camera === 'granted';
      }
      return true;
    } catch (err) {
      console.warn('Capacitor native camera permission check failed:', err);
      return false;
    }
  }

  // Web Browser fallback
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop temporary track
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err) {
      console.warn('Web camera permission rejected or unavailable:', err);
      return false;
    }
  }

  return false;
}

export async function takeNativePhoto(): Promise<string | null> {
  if (Capacitor.isNativePlatform()) {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });
      return photo.dataUrl || null;
    } catch (err) {
      console.warn('Native photo capture cancelled or failed:', err);
      return null;
    }
  }
  return null;
}

export function getAppPlatform(): { isNative: boolean; platformName: string } {
  const platformName = Capacitor.getPlatform();
  const isNative = Capacitor.isNativePlatform();
  return { isNative, platformName };
}
