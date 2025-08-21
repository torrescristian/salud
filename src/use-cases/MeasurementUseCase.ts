import { GlucoseMeasurement, determineGlucoseStatus } from '../domain/GlucoseMeasurement';
import { PressureMeasurement, determinePressureStatus } from '../domain/PressureMeasurement';
import { UserProfile } from '../domain/UserProfile';
import { GlucoseMeasurementRepository } from '../domain/repositories/GlucoseMeasurementRepository';
import { PressureMeasurementRepository } from '../domain/repositories/PressureMeasurementRepository';
import { UserProfileRepository } from '../domain/repositories/UserProfileRepository';

export interface CreateGlucoseMeasurementData {
  userId: string;
  value: number;
  context: 'fasting' | 'postPrandial' | 'custom';
}

export interface CreatePressureMeasurementData {
  userId: string;
  systolic: number;
  diastolic: number;
}

export interface UpdateGlucoseMeasurementData {
  value?: number;
  context?: 'fasting' | 'postPrandial' | 'custom';
}

export interface UpdatePressureMeasurementData {
  systolic?: number;
  diastolic?: number;
}

export interface MeasurementStatistics {
  totalMeasurements: number;
  averageValue?: number;
  averageSystolic?: number;
  averageDiastolic?: number;
  normalCount: number;
  warningCount: number;
  criticalCount: number;
}

export class MeasurementUseCase {
  constructor(
    private glucoseRepository: GlucoseMeasurementRepository,
    private pressureRepository: PressureMeasurementRepository,
    private userProfileRepository: UserProfileRepository
  ) {}

  async createGlucoseMeasurement(data: CreateGlucoseMeasurementData): Promise<GlucoseMeasurement> {
    if (data.value <= 0) {
      throw new Error('Glucose value must be positive');
    }

    const userProfile = await this.userProfileRepository.findById(data.userId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    const limits = userProfile.glucoseLimits[data.context] || userProfile.glucoseLimits.fasting;
    const status = determineGlucoseStatus(data.value, limits);

    const measurement = new GlucoseMeasurement({
      id: this.generateId(),
      ...data,
      status
    });

    return await this.glucoseRepository.save(measurement);
  }

  async createPressureMeasurement(data: CreatePressureMeasurementData): Promise<PressureMeasurement> {
    if (data.systolic <= 0) {
      throw new Error('Systolic pressure must be positive');
    }
    if (data.diastolic <= 0) {
      throw new Error('Diastolic pressure must be positive');
    }
    if (data.diastolic > data.systolic) {
      throw new Error('Diastolic pressure cannot be higher than systolic');
    }

    const userProfile = await this.userProfileRepository.findById(data.userId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    const limits = userProfile.pressureLimits;
    const status = determinePressureStatus(data.systolic, data.diastolic, limits);

    const measurement = new PressureMeasurement({
      id: this.generateId(),
      ...data,
      status
    });

    return await this.pressureRepository.save(measurement);
  }

  async getGlucoseMeasurements(userId: string): Promise<GlucoseMeasurement[]> {
    return await this.glucoseRepository.findByUserId(userId);
  }

  async getPressureMeasurements(userId: string): Promise<PressureMeasurement[]> {
    return await this.pressureRepository.findByUserId(userId);
  }

  async getMeasurementsByDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<{
    glucoseMeasurements: GlucoseMeasurement[];
    pressureMeasurements: PressureMeasurement[];
  }> {
    const glucoseMeasurements = await this.glucoseRepository.findByUserIdAndDate(userId, startDate, endDate);
    const pressureMeasurements = await this.pressureRepository.findByUserIdAndDate(userId, startDate, endDate);

    return {
      glucoseMeasurements,
      pressureMeasurements
    };
  }

  async updateGlucoseMeasurement(
    id: string, 
    data: UpdateGlucoseMeasurementData
  ): Promise<GlucoseMeasurement> {
    const existingMeasurement = await this.glucoseRepository.findById(id);
    if (!existingMeasurement) {
      throw new Error('Glucose measurement not found');
    }

    const userProfile = await this.userProfileRepository.findById(existingMeasurement.userId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    if (data.value !== undefined) {
      const limits = userProfile.glucoseLimits[existingMeasurement.context] || userProfile.glucoseLimits.fasting;
      existingMeasurement.updateValue(data.value, limits);
    }

    if (data.context !== undefined) {
      existingMeasurement.updateContext(data.context);
    }

    return await this.glucoseRepository.update(id, existingMeasurement);
  }

  async updatePressureMeasurement(
    id: string, 
    data: UpdatePressureMeasurementData
  ): Promise<PressureMeasurement> {
    const existingMeasurement = await this.pressureRepository.findById(id);
    if (!existingMeasurement) {
      throw new Error('Pressure measurement not found');
    }

    const userProfile = await this.userProfileRepository.findById(existingMeasurement.userId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    if (data.systolic !== undefined || data.diastolic !== undefined) {
      const newSystolic = data.systolic ?? existingMeasurement.systolic;
      const newDiastolic = data.diastolic ?? existingMeasurement.diastolic;
      existingMeasurement.updateValues(newSystolic, newDiastolic, userProfile.pressureLimits);
    }

    return await this.pressureRepository.update(id, existingMeasurement);
  }

  async deleteGlucoseMeasurement(id: string): Promise<boolean> {
    const existingMeasurement = await this.glucoseRepository.findById(id);
    if (!existingMeasurement) {
      throw new Error('Glucose measurement not found');
    }

    return await this.glucoseRepository.delete(id);
  }

  async deletePressureMeasurement(id: string): Promise<boolean> {
    const existingMeasurement = await this.pressureRepository.findById(id);
    if (!existingMeasurement) {
      throw new Error('Pressure measurement not found');
    }

    return await this.pressureRepository.delete(id);
  }

  async getGlucoseStatistics(userId: string): Promise<MeasurementStatistics> {
    const measurements = await this.glucoseRepository.findByUserId(userId);
    
    const totalMeasurements = measurements.length;
    const normalCount = measurements.filter(m => m.status === 'normal').length;
    const warningCount = measurements.filter(m => m.status === 'warning').length;
    const criticalCount = measurements.filter(m => m.status === 'critical').length;
    
    const values = measurements.map(m => m.value);
    const averageValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    return {
      totalMeasurements,
      averageValue,
      normalCount,
      warningCount,
      criticalCount
    };
  }

  async getPressureStatistics(userId: string): Promise<MeasurementStatistics> {
    const measurements = await this.pressureRepository.findByUserId(userId);
    
    const totalMeasurements = measurements.length;
    const normalCount = measurements.filter(m => m.status === 'normal').length;
    const warningCount = measurements.filter(m => m.status === 'warning').length;
    const criticalCount = measurements.filter(m => m.status === 'critical').length;
    
    const systolicValues = measurements.map(m => m.systolic);
    const diastolicValues = measurements.map(m => m.diastolic);
    
    const averageSystolic = systolicValues.length > 0 ? systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length : 0;
    const averageDiastolic = diastolicValues.length > 0 ? diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length : 0;

    return {
      totalMeasurements,
      averageSystolic,
      averageDiastolic,
      normalCount,
      warningCount,
      criticalCount
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
