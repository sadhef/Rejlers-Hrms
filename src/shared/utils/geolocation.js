/** Resolves the device's current coordinates for an attendance punch, or rejects with a user-facing message. */
export const getCurrentCoords = () =>
  new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Location is not supported on this device.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
          reject(new Error('A valid location is required to punch attendance.'));
          return;
        }
        resolve({ latitude, longitude });
      },
      () => reject(new Error('Location permission is mandatory for check-in and check-out.')),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
    );
  });
