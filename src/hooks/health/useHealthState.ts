import { useState, useEffect } from "react";
import { AppState } from "../../types/health";
import { LocalStorage } from "../../utils/localStorage";
import { getCurrentDateString } from "../../utils/healthCalculations";

const initialState: AppState = {
  userProfile: null,
  userMedications: [],
  measurements: {
    glucose: [],
    pressure: [],
    insulin: [],
  },
  dailyEntries: [],
  currentDate: getCurrentDateString(),
};

export function useHealthState() {
  const [state, setState] = useState<AppState>(initialState);

  // Cargar datos al inicializar
  useEffect(() => {
    const loadData = () => {
      const userProfile = LocalStorage.loadUserProfile();
      const dailyEntries = LocalStorage.loadDailyEntries() || [];
      const userMedications = LocalStorage.loadUserMedications() || [];
      const glucoseMeasurements = LocalStorage.loadGlucoseMeasurements() || [];
      const pressureMeasurements =
        LocalStorage.loadPressureMeasurements() || [];
      const insulinEntries = LocalStorage.loadInsulinEntries() || [];

      setState({
        userProfile,
        userMedications,
        measurements: {
          glucose: glucoseMeasurements,
          pressure: pressureMeasurements,
          insulin: insulinEntries,
        },
        dailyEntries,
        currentDate: getCurrentDateString(),
      });
    };

    loadData();
  }, []);

  // Guardar datos cuando el estado cambie
  useEffect(() => {
    if (state.userProfile) {
      LocalStorage.saveUserProfile(state.userProfile);
    }
    LocalStorage.saveDailyEntries(state.dailyEntries);
    LocalStorage.saveUserMedications(state.userMedications);
    LocalStorage.saveGlucoseMeasurements(state.measurements.glucose);
    LocalStorage.savePressureMeasurements(state.measurements.pressure);
    LocalStorage.saveInsulinEntries(state.measurements.insulin);
  }, [state]);

  return { state, setState };
}
