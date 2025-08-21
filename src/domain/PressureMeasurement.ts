export type PressureStatus = "normal" | "warning" | "critical";
export type PressureCategory =
  | "normal"
  | "prehypertension"
  | "stage1_hypertension"
  | "stage2_hypertension";

export interface PressureMeasurementData {
  id: string;
  userId: string;
  timestamp: Date;
  systolic: number;
  diastolic: number;
  status: PressureStatus;
}

export class PressureMeasurement {
  public readonly id: string;
  public readonly userId: string;
  public timestamp: Date;
  public systolic: number;
  public diastolic: number;
  public status: PressureStatus;

  constructor(
    data: Partial<PressureMeasurementData> & {
      id: string;
      userId: string;
      systolic: number;
      diastolic: number;
    }
  ) {
    this.validateData(data);

    this.id = data.id;
    this.userId = data.userId;
    this.timestamp = data.timestamp || new Date();
    this.systolic = data.systolic;
    this.diastolic = data.diastolic;
    this.status = data.status || "normal";
  }

  private validateData(
    data: Partial<PressureMeasurementData> & {
      id: string;
      userId: string;
      systolic: number;
      diastolic: number;
    }
  ): void {
    if (data.systolic <= 0) {
      throw new Error("Systolic pressure must be positive");
    }
    if (data.diastolic <= 0) {
      throw new Error("Diastolic pressure must be positive");
    }
    if (data.diastolic > data.systolic) {
      throw new Error("Diastolic pressure cannot be higher than systolic");
    }
  }

  public updateValues(
    newSystolic: number,
    newDiastolic: number,
    limits: {
      systolic: { min: number; max: number };
      diastolic: { min: number; max: number };
    }
  ): void {
    if (newSystolic <= 0) {
      throw new Error("Systolic pressure must be positive");
    }
    if (newDiastolic <= 0) {
      throw new Error("Diastolic pressure must be positive");
    }
    if (newDiastolic > newSystolic) {
      throw new Error("Diastolic pressure cannot be higher than systolic");
    }

    this.systolic = newSystolic;
    this.diastolic = newDiastolic;
    this.status = determinePressureStatus(newSystolic, newDiastolic, limits);
  }

  public updateTimestamp(newTimestamp: Date): void {
    this.timestamp = newTimestamp;
  }

  public getCategory(): PressureCategory {
    // Normal: < 120/80
    if (this.systolic < 120 && this.diastolic < 80) {
      return "normal";
    }
    // Elevated (anteriormente prehypertension): 120-129/<80
    else if (
      this.systolic >= 120 &&
      this.systolic <= 129 &&
      this.diastolic < 80
    ) {
      return "prehypertension";
    }
    // Stage 1: 130-139/80-89 o valores intermedios que no encajan en otras categorías
    else if (
      (this.systolic >= 130 && this.systolic <= 139) ||
      (this.diastolic >= 80 && this.diastolic <= 89)
    ) {
      // Caso especial: 120-129 con diastólica 80-89 se considera prehypertension
      if (
        this.systolic >= 120 &&
        this.systolic <= 129 &&
        this.diastolic >= 80
      ) {
        return "prehypertension";
      }
      return "stage1_hypertension";
    }
    // Casos intermedios entre stage 1 y stage 2
    else if (
      (this.systolic >= 140 && this.systolic <= 149) ||
      (this.diastolic >= 90 && this.diastolic <= 99)
    ) {
      return "stage1_hypertension";
    }
    // Stage 2: ≥140/≥90
    else {
      return "stage2_hypertension";
    }
  }

  public export(): PressureMeasurementData {
    return {
      id: this.id,
      userId: this.userId,
      timestamp: this.timestamp,
      systolic: this.systolic,
      diastolic: this.diastolic,
      status: this.status,
    };
  }
}

export function determinePressureStatus(
  systolic: number,
  diastolic: number,
  limits: {
    systolic: { min: number; max: number };
    diastolic: { min: number; max: number };
  }
): PressureStatus {
  const systolicNormal =
    systolic >= limits.systolic.min && systolic <= limits.systolic.max;
  const diastolicNormal =
    diastolic >= limits.diastolic.min && diastolic <= limits.diastolic.max;

  if (systolicNormal && diastolicNormal) {
    return "normal";
  } else if (
    systolic >= limits.systolic.min * 0.9 &&
    systolic <= limits.systolic.max * 1.2 &&
    diastolic >= limits.diastolic.min * 0.9 &&
    diastolic <= limits.diastolic.max * 1.2
  ) {
    return "warning";
  } else {
    return "critical";
  }
}
