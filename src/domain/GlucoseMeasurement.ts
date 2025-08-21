export type GlucoseContext = 'fasting' | 'postPrandial' | 'custom';
export type GlucoseStatus = 'normal' | 'warning' | 'critical';

export interface GlucoseMeasurementData {
  id: string;
  userId: string;
  timestamp: Date;
  value: number;
  context: GlucoseContext;
  status: GlucoseStatus;
}

export class GlucoseMeasurement {
  public readonly id: string;
  public readonly userId: string;
  public timestamp: Date;
  public value: number;
  public context: GlucoseContext;
  public status: GlucoseStatus;

  constructor(data: Partial<GlucoseMeasurementData> & { id: string; userId: string; value: number; context: GlucoseContext }) {
    this.validateData(data);
    
    this.id = data.id;
    this.userId = data.userId;
    this.timestamp = data.timestamp || new Date();
    this.value = data.value;
    this.context = data.context;
    this.status = data.status || 'normal';
  }

  private validateData(data: Partial<GlucoseMeasurementData> & { id: string; userId: string; value: number; context: GlucoseContext }): void {
    if (data.value <= 0) {
      throw new Error('Glucose value must be positive');
    }
    if (!this.isValidContext(data.context)) {
      throw new Error('Invalid context value');
    }
  }

  private isValidContext(context: string): context is GlucoseContext {
    return ['fasting', 'postPrandial', 'custom'].includes(context);
  }

  public updateValue(newValue: number, limits: { min: number; max: number }): void {
    if (newValue <= 0) {
      throw new Error('Glucose value must be positive');
    }
    this.value = newValue;
    this.status = determineGlucoseStatus(newValue, limits);
  }

  public updateContext(newContext: GlucoseContext): void {
    this.context = newContext;
  }

  public updateTimestamp(newTimestamp: Date): void {
    this.timestamp = newTimestamp;
  }

  public export(): GlucoseMeasurementData {
    return {
      id: this.id,
      userId: this.userId,
      timestamp: this.timestamp,
      value: this.value,
      context: this.context,
      status: this.status,
    };
  }
}

export function determineGlucoseStatus(value: number, limits: { min: number; max: number }): GlucoseStatus {
  if (value >= limits.min && value <= limits.max) {
    return 'normal';
  } else if (
    (value >= limits.min * 0.9 && value < limits.min) || 
    (value > limits.max && value <= limits.max * 1.2)
  ) {
    return 'warning';
  } else {
    return 'critical';
  }
}
