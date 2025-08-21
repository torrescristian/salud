import { GlucoseMeasurement } from '../../domain/GlucoseMeasurement';
import { GlucoseMeasurementRepository } from '../GlucoseMeasurementRepository';

export class InMemoryGlucoseMeasurementRepository implements GlucoseMeasurementRepository {
  private measurements: GlucoseMeasurement[] = [];

  async save(measurement: GlucoseMeasurement): Promise<GlucoseMeasurement> {
    const existingIndex = this.measurements.findIndex(m => m.id === measurement.id);
    
    if (existingIndex >= 0) {
      this.measurements[existingIndex] = measurement;
    } else {
      this.measurements.push(measurement);
    }
    
    return measurement;
  }

  async findById(id: string): Promise<GlucoseMeasurement | null> {
    return this.measurements.find(m => m.id === id) || null;
  }

  async findByUserId(userId: string): Promise<GlucoseMeasurement[]> {
    return this.measurements.filter(m => m.userId === userId);
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<GlucoseMeasurement[]> {
    return this.measurements.filter(m => 
      m.userId === userId &&
      m.timestamp >= startDate &&
      m.timestamp <= endDate
    );
  }

  async update(id: string, measurement: Partial<GlucoseMeasurement>): Promise<GlucoseMeasurement> {
    const existingIndex = this.measurements.findIndex(m => m.id === id);
    
    if (existingIndex === -1) {
      throw new Error(`Measurement with id ${id} not found`);
    }
    
    this.measurements[existingIndex] = { ...this.measurements[existingIndex], ...measurement };
    return this.measurements[existingIndex];
  }

  async delete(id: string): Promise<void> {
    const index = this.measurements.findIndex(m => m.id === id);
    if (index !== -1) {
      this.measurements.splice(index, 1);
    }
  }

  async findLatestByUserId(userId: string): Promise<GlucoseMeasurement | null> {
    const userMeasurements = this.measurements.filter(m => m.userId === userId);
    if (userMeasurements.length === 0) return null;
    
    return userMeasurements.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
  }

  async findAverageByUserIdAndPeriod(userId: string, days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentMeasurements = this.measurements.filter(m => 
      m.userId === userId && m.timestamp >= cutoffDate
    );
    
    if (recentMeasurements.length === 0) return 0;
    
    const total = recentMeasurements.reduce((sum, m) => sum + m.value, 0);
    return total / recentMeasurements.length;
  }
}
