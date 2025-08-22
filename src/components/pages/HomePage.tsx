import { AllEntriesList } from "../organisms/AllEntriesList";

interface HomePageProps {
  entries: Array<{
    type: "medication" | "glucose" | "pressure" | "insulin";
    time: string;
    date: string;
    data: any;
  }>;
  onEditEntry: (
    type: "medication" | "glucose" | "pressure" | "insulin",
    data: any
  ) => void;
}

export const HomePage = ({ entries, onEditEntry }: HomePageProps) => {
  return (
    <div className="space-y-4">
      <AllEntriesList entries={entries} onEditEntry={onEditEntry} />
    </div>
  );
};
