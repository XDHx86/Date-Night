import { useEffect } from "react";

/**
 * Hook to detect device shake and trigger a callback
 * @param callback - Function to call when shake is detected
 * @param options - Configuration options for shake detection
 * @param options.threshold - Shake sensitivity (default: 20)
 * @param options.timeout - Time between allowed shakes in ms (default: 100)
 */
export function useShakeEffect(
  callback: () => void,
  options: { threshold?: number; timeout?: number } = {},
) {
  const { threshold = 20, timeout = 100 } = options;

  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastTime = 0;
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const accelerationIncludingGravity = event.accelerationIncludingGravity;
      if (!accelerationIncludingGravity) return;

      const x = accelerationIncludingGravity.x ?? 0;
      const y = accelerationIncludingGravity.y ?? 0;
      const z = accelerationIncludingGravity.z ?? 0;
      const currentTime = Date.now();
      if (currentTime - lastTime < timeout) return; // Limit frequency
      const diffTime = Math.abs(currentTime - lastTime);
      const speed = (Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime) * 10000;

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
  }, [callback, threshold, timeout]);
}
