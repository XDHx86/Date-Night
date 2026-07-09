import { useEffect } from "react";

/**
 * Hook to detect device shake and trigger a callback
 * @param callback - Function to call when shake is detected
 * @param threshold - Shake sensitivity (default: 15)
 */
export function useShakeEffect(callback: () => void, threshold = 15) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastTime = 0;
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const { accelerationIncludingGravity } = event;
      if (!accelerationIncludingGravity) return;

      const { x, y, z } = accelerationIncludingGravity;
      const currentTime = Date.now();
      if ((currentTime - lastTime) < 100) return; // Limit to once every 100ms
      const diffTime = Math.abs(currentTime - lastTime);
      const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;

      if (speed > threshold) {
        callback();
        lastTime = currentTime;
        lastX = x;
        lastY = y;
        lastZ = z;
      }
    };

    window.addEventListener("devicemotion", handleDeviceMotion, true);
    return () => {
      window.removeEventListener("devicemotion", handleDeviceMotion, true);
    };
  }, [callback, threshold]);
}