export interface GlucoseLimits {
  fasting: { min: number; max: number };
  postPrandial: { min: number; max: number };
  custom: Array<{ min: number; max: number }>;
}

export interface PressureLimits {
  systolic: { min: number; max: number };
  diastolic: { min: number; max: number };
}

export interface MeasurementFrequency {
  glucose: number;
  pressure: number;
}

export interface UserProfileData {
  id: string;
  name: string;
  birthDate: Date;
  weight: number;
  height: number;
  medicalConditions: string[];
  glucoseLimits: GlucoseLimits;
  pressureLimits: PressureLimits;
  measurementFrequency: MeasurementFrequency;
}

export class UserProfile {
  public readonly id: string;
  public readonly name: string;
  public readonly birthDate: Date;
  public weight: number;
  public height: number;
  public readonly medicalConditions: string[];
  public glucoseLimits: GlucoseLimits;
  public pressureLimits: PressureLimits;
  public measurementFrequency: MeasurementFrequency;

  constructor(data: UserProfileData) {
    this.validateData(data);

    this.id = data.id;
    this.name = data.name;
    this.birthDate = data.birthDate;
    this.weight = data.weight;
    this.height = data.height;
    this.medicalConditions = data.medicalConditions;
    this.glucoseLimits = data.glucoseLimits;
    this.pressureLimits = data.pressureLimits;
    this.measurementFrequency = data.measurementFrequency;
  }

  private validateData(data: UserProfileData): void {
    if (!data.name || data.name.trim() === "") {
      throw new Error("Name is required");
    }
    if (data.weight <= 0) {
      throw new Error("Weight must be positive");
    }
    if (data.height <= 0) {
      throw new Error("Height must be positive");
    }
    if (!data.birthDate) {
      throw new Error("Birth date is required");
    }
  }

  public calculateBMI(): number {
    const heightInMeters = this.height / 100;
    return this.weight / (heightInMeters * heightInMeters);
  }

  public getAge(): number {
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  public updateWeight(newWeight: number): void {
    if (newWeight <= 0) {
      throw new Error("Weight must be positive");
    }
    this.weight = newWeight;
  }

  public updateHeight(newHeight: number): void {
    if (newHeight <= 0) {
      throw new Error("Height must be positive");
    }
    this.height = newHeight;
  }

  public updateMeasurementFrequency(
    type: "glucose" | "pressure",
    frequency: number
  ): void {
    if (frequency <= 0) {
      throw new Error("Frequency must be positive");
    }
    this.measurementFrequency[type] = frequency;
  }

  public updateGlucoseLimits(
    context: "fasting" | "postPrandial",
    limits: { min: number; max: number }
  ): void {
    if (limits.min >= limits.max) {
      throw new Error("Min value must be less than max value");
    }
    this.glucoseLimits[context] = limits;
  }

  public export(): UserProfileData {
    return {
      id: this.id,
      name: this.name,
      birthDate: this.birthDate,
      weight: this.weight,
      height: this.height,
      medicalConditions: this.medicalConditions,
      glucoseLimits: this.glucoseLimits,
      pressureLimits: this.pressureLimits,
      measurementFrequency: this.measurementFrequency,
    };
  }
}

export function calculateDefaultGlucoseLimits(
  age: number,
  weight: number,
  height: number
): GlucoseLimits {
  const bmi = weight / (height / 100) ** 2;

  let fastingMin = 70;
  let fastingMax = 100;

  if (age > 50) {
    fastingMax += 10;
  }
  if (bmi > 25) {
    fastingMin += 5;
    fastingMax += 15;
  }

  return {
    fasting: { min: fastingMin, max: fastingMax },
    postPrandial: { min: fastingMin + 30, max: fastingMax + 40 },
    custom: [],
  };
}

export function calculateDefaultPressureLimits(
  age: number,
  weight: number,
  height: number
): PressureLimits {
  const bmi = weight / (height / 100) ** 2;

  let systolicMin = 110;
  let systolicMax = 120;
  let diastolicMin = 70;
  let diastolicMax = 80;

  if (age > 50) {
    systolicMax += 15;
    diastolicMax += 10;
  }

  if (bmi > 25) {
    systolicMin += 5;
    systolicMax += 10;
    diastolicMin += 5;
    diastolicMax += 5;
  }

  return {
    systolic: { min: systolicMin, max: systolicMax },
    diastolic: { min: diastolicMin, max: diastolicMax },
  };
}
