import { useHealthState } from "./useHealthState";
import { useHealthActions } from "./useHealthActions";
import { useMeasurements } from "./useMeasurements";
import { useHealthEdit } from "./useHealthEdit";

export function useHealthApp() {
  const { state, setState } = useHealthState();

  const {
    updateUserProfile,
    takeMedication,
    getMedicationSuggestions,
    getTodayEntries,
    setCurrentDate,
  } = useHealthActions(state, setState);

  const { addGlucoseMeasurement, addPressureMeasurement, addInsulinEntry } =
    useMeasurements(state, setState);

  const {
    editGlucoseMeasurement,
    editPressureMeasurement,
    editInsulinEntry,
    editMedication,
  } = useHealthEdit(state, setState);

  return {
    state,
    updateUserProfile,
    takeMedication,
    getMedicationSuggestions,
    addGlucoseMeasurement,
    addPressureMeasurement,
    addInsulinEntry,
    editGlucoseMeasurement,
    editPressureMeasurement,
    editInsulinEntry,
    editMedication,
    getTodayEntries,
    setCurrentDate,
  };
}
