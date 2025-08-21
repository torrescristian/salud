import { GlucoseMeasurement } from '../GlucoseMeasurement';

export interface GlucoseMeasurementRepository {
  save(measurement: GlucoseMeasurement): Promise<GlucoseMeasurement>;
  findById(id: string): Promise<GlucoseMeasurement | null>;
  update(id: string, data: Partial<GlucoseMeasurement>): Promise<GlucoseMeasurement>;
  delete(id: string): Promise<boolean>;
  findByUserId(userId: string): Promise<GlucoseMeasurement[]>;
  findByUserIdAndDate(userId: string, startDate: Date, endDate: Date): Promise<GlucoseMeasurement[]>;
}
