import { PressureMeasurement } from '../PressureMeasurement';

export interface PressureMeasurementRepository {
  save(measurement: PressureMeasurement): Promise<PressureMeasurement>;
  findById(id: string): Promise<PressureMeasurement | null>;
  update(id: string, data: Partial<PressureMeasurement>): Promise<PressureMeasurement>;
  delete(id: string): Promise<boolean>;
  findByUserId(userId: string): Promise<PressureMeasurement[]>;
  findByUserIdAndDate(userId: string, startDate: Date, endDate: Date): Promise<PressureMeasurement[]>;
}
