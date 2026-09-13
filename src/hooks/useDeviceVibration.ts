import { useState, useEffect } from "react";

/**
 * Custom hook to manage device vibration.
 *
 * @returns {object} - Contains functions to start, stop, and manage vibration patterns.
 */
const useDeviceVibration = () => {
  const [isVibrating, setIsVibrating] = useState(false);

  const isVibrationSupported = () => "vibrate" in navigator;

  /**
   * Start device vibration with a given pattern.
   * @param {number | number[]} pattern - Single number or array of numbers defining the vibration pattern.
   */
  const startVibration = (pattern: VibratePattern) => {
    if (isVibrationSupported()) {
      navigator.vibrate(pattern);
      setIsVibrating(true);
    } else {
      console.warn("Vibration API is not supported in this browser.");
    }
  };

  /**
   * Stop the current vibration.
   */
  const stopVibration = () => {
    if (isVibrationSupported()) {
      navigator.vibrate(0);
      setIsVibrating(false);
    }
  };

  useEffect(() => {
    return () => {
      stopVibration();
    };
  }, []);

  return {
    isVibrating,
    startVibration,
    stopVibration,
    isVibrationSupported,
  };
};

export default useDeviceVibration;
