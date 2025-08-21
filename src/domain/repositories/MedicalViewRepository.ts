import { MedicalView } from '../MedicalView';

export interface MedicalViewRepository {
  save(medicalView: MedicalView): Promise<MedicalView>;
  findById(id: string): Promise<MedicalView | null>;
  update(id: string, data: Partial<MedicalView>): Promise<MedicalView>;
  delete(id: string): Promise<boolean>;
  findByUserIdAndDate(userId: string, date: Date): Promise<MedicalView | null>;
  findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<MedicalView[]>;
}
