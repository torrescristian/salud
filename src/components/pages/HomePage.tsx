import { AllEntriesList } from "../organisms/AllEntriesList";

import { UserMedication, GlucoseMeasurement, PressureMeasurement, InsulinEntry } from "../../types/health";

interface HomePageProps {
  entries: Array<{
    type: "medication" | "glucose" | "pressure" | "insulin";
    time: string;
    date: string;
    data: UserMedication | GlucoseMeasurement | PressureMeasurement | InsulinEntry;
  }>;
  onEditEntry: (
    type: "medication" | "glucose" | "pressure" | "insulin",
    data: UserMedication | GlucoseMeasurement | PressureMeasurement | InsulinEntry
  ) => void;
}

export const HomePage = ({ entries, onEditEntry }: HomePageProps) => {
  return (
    <div className="space-y-4">
      <AllEntriesList entries={entries} onEditEntry={onEditEntry} />
    </div>
  );
};
