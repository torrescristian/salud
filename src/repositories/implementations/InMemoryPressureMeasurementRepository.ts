import { PressureMeasurement } from '../../domain/PressureMeasurement';
import { PressureMeasurementRepository } from '../PressureMeasurementRepository';

export class InMemoryPressureMeasurementRepository implements PressureMeasurementRepository {
  private measurements: PressureMeasurement[] = [];

  async save(measurement: PressureMeasurement): Promise<PressureMeasurement> {
    const existingIndex = this.measurements.findIndex(m => m.id === measurement.id);
    
    if (existingIndex >= 0) {
      this.measurements[existingIndex] = measurement;
    } else {
      this.measurements.push(measurement);
    }
    
    return measurement;
  }

  async findById(id: string): Promise<PressureMeasurement | null> {
    return this.measurements.find(m => m.id === id) || null;
  }

  async findByUserId(userId: string): Promise<PressureMeasurement[]> {
    return this.measurements.filter(m => m.userId === userId);
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PressureMeasurement[]> {
    return this.measurements.filter(m => 
      m.userId === userId &&
      m.timestamp >= startDate &&
      m.timestamp <= endDate
    );
  }

  async update(id: string, measurement: Partial<PressureMeasurement>): Promise<PressureMeasurement> {
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

  async findLatestByUserId(userId: string): Promise<PressureMeasurement | null> {
    const userMeasurements = this.measurements.filter(m => m.userId === userId);
    if (userMeasurements.length === 0) return null;
    
    return userMeasurements.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
  }

  async findAverageByUserIdAndPeriod(userId: string, days: number): Promise<{ systolic: number; diastolic: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentMeasurements = this.measurements.filter(m => 
      m.userId === userId && m.timestamp >= cutoffDate
    );
    
    if (recentMeasurements.length === 0) {
      return { systolic: 0, diastolic: 0 };
    }
    
    const systolicTotal = recentMeasurements.reduce((sum, m) => sum + m.systolic, 0);
    const diastolicTotal = recentMeasurements.reduce((sum, m) => sum + m.diastolic, 0);
    
    return {
      systolic: systolicTotal / recentMeasurements.length,
      diastolic: diastolicTotal / recentMeasurements.length,
    };
  }
}
