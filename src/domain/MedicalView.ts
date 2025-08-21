import { UserProfile } from "./UserProfile";
import { GlucoseMeasurement } from "./GlucoseMeasurement";
import { PressureMeasurement } from "./PressureMeasurement";
import { FoodEntry } from "./FoodEntry";

export interface GlucoseSummary {
  totalMeasurements: number;
  normalCount: number;
  warningCount: number;
  criticalCount: number;
  normalPercentage: number;
  warningPercentage: number;
  criticalPercentage: number;
  averageValue: number;
  minValue: number;
  maxValue: number;
  byContext: {
    fasting: GlucoseMeasurement[];
    postPrandial: GlucoseMeasurement[];
    custom: GlucoseMeasurement[];
  };
}

export interface PressureSummary {
  totalMeasurements: number;
  normalCount: number;
  warningCount: number;
  criticalCount: number;
  normalPercentage: number;
  warningPercentage: number;
  criticalPercentage: number;
  averageSystolic: number;
  averageDiastolic: number;
  minSystolic: number;
  maxSystolic: number;
  minDiastolic: number;
  maxDiastolic: number;
}

export interface NutritionalSummary {
  totalEntries: number;
  totalCalories: number;
  byType: {
    carbohydrates: FoodEntry[];
    proteins: FoodEntry[];
    vegetables: FoodEntry[];
    eggs: FoodEntry[];
    dairy: FoodEntry[];
  };
  caloriesByType: {
    carbohydrates: number;
    proteins: number;
    vegetables: number;
    eggs: number;
    dairy: number;
  };
  quantitiesByType: {
    carbohydrates: number;
    proteins: number;
    vegetables: number;
    eggs: number;
    dairy: number;
  };
}

export interface MedicalViewData {
  id?: string;
  userId: string;
  date: Date;
  userProfile: UserProfile;
  glucoseMeasurements: GlucoseMeasurement[];
  pressureMeasurements: PressureMeasurement[];
  foodEntries: FoodEntry[];
}

export class MedicalView {
  public readonly id?: string;
  public readonly userId: string;
  public readonly date: Date;
  public readonly userProfile: UserProfile;
  public glucoseMeasurements: GlucoseMeasurement[];
  public pressureMeasurements: PressureMeasurement[];
  public foodEntries: FoodEntry[];

  constructor(data: MedicalViewData) {
    this.id = data.id;
    this.userId = data.userId;
    this.date = data.date;
    this.userProfile = data.userProfile;
    this.glucoseMeasurements = data.glucoseMeasurements;
    this.pressureMeasurements = data.pressureMeasurements;
    this.foodEntries = data.foodEntries;
  }

  public getGlucoseSummary(): GlucoseSummary {
    const total = this.glucoseMeasurements.length;
    const normal = this.glucoseMeasurements.filter(
      (m) => m.status === "normal"
    ).length;
    const warning = this.glucoseMeasurements.filter(
      (m) => m.status === "warning"
    ).length;
    const critical = this.glucoseMeasurements.filter(
      (m) => m.status === "critical"
    ).length;

    const values = this.glucoseMeasurements.map((m) => m.value);
    const average =
      values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    const byContext = {
      fasting: this.glucoseMeasurements.filter((m) => m.context === "fasting"),
      postPrandial: this.glucoseMeasurements.filter(
        (m) => m.context === "postPrandial"
      ),
      custom: this.glucoseMeasurements.filter((m) => m.context === "custom"),
    };

    return {
      totalMeasurements: total,
      normalCount: normal,
      warningCount: warning,
      criticalCount: critical,
      normalPercentage: total > 0 ? (normal / total) * 100 : 0,
      warningPercentage: total > 0 ? (warning / total) * 100 : 0,
      criticalPercentage: total > 0 ? (critical / total) * 100 : 0,
      averageValue: average,
      minValue: values.length > 0 ? Math.min(...values) : 0,
      maxValue: values.length > 0 ? Math.max(...values) : 0,
      byContext,
    };
  }

  public getPressureSummary(): PressureSummary {
    const total = this.pressureMeasurements.length;
    const normal = this.pressureMeasurements.filter(
      (m) => m.status === "normal"
    ).length;
    const warning = this.pressureMeasurements.filter(
      (m) => m.status === "warning"
    ).length;
    const critical = this.pressureMeasurements.filter(
      (m) => m.status === "critical"
    ).length;

    const systolicValues = this.pressureMeasurements.map((m) => m.systolic);
    const diastolicValues = this.pressureMeasurements.map((m) => m.diastolic);

    const averageSystolic =
      systolicValues.length > 0
        ? systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length
        : 0;
    const averageDiastolic =
      diastolicValues.length > 0
        ? diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length
        : 0;

    return {
      totalMeasurements: total,
      normalCount: normal,
      warningCount: warning,
      criticalCount: critical,
      normalPercentage: total > 0 ? (normal / total) * 100 : 0,
      warningPercentage: total > 0 ? (warning / total) * 100 : 0,
      criticalPercentage: total > 0 ? (critical / total) * 100 : 0,
      averageSystolic,
      averageDiastolic,
      minSystolic: systolicValues.length > 0 ? Math.min(...systolicValues) : 0,
      maxSystolic: systolicValues.length > 0 ? Math.max(...systolicValues) : 0,
      minDiastolic:
        diastolicValues.length > 0 ? Math.min(...diastolicValues) : 0,
      maxDiastolic:
        diastolicValues.length > 0 ? Math.max(...diastolicValues) : 0,
    };
  }

  public getNutritionalSummary(): NutritionalSummary {
    const byType = {
      carbohydrates: this.foodEntries.filter(
        (f) => f.foodType === "carbohydrates"
      ),
      proteins: this.foodEntries.filter((f) => f.foodType === "proteins"),
      vegetables: this.foodEntries.filter((f) => f.foodType === "vegetables"),
      eggs: this.foodEntries.filter((f) => f.foodType === "eggs"),
      dairy: this.foodEntries.filter((f) => f.foodType === "dairy"),
    };

    const caloriesByType = {
      carbohydrates: byType.carbohydrates.reduce(
        (sum, f) => sum + f.calculateCalories(),
        0
      ),
      proteins: byType.proteins.reduce(
        (sum, f) => sum + f.calculateCalories(),
        0
      ),
      vegetables: byType.vegetables.reduce(
        (sum, f) => sum + f.calculateCalories(),
        0
      ),
      eggs: byType.eggs.reduce((sum, f) => sum + f.calculateCalories(), 0),
      dairy: byType.dairy.reduce((sum, f) => sum + f.calculateCalories(), 0),
    };

    const quantitiesByType = {
      carbohydrates: byType.carbohydrates.reduce(
        (sum, f) => sum + f.quantity,
        0
      ),
      proteins: byType.proteins.reduce((sum, f) => sum + f.quantity, 0),
      vegetables: byType.vegetables.reduce((sum, f) => sum + f.quantity, 0),
      eggs: byType.eggs.reduce((sum, f) => sum + f.quantity, 0),
      dairy: byType.dairy.reduce((sum, f) => sum + f.quantity, 0),
    };

    return {
      totalEntries: this.foodEntries.length,
      totalCalories: Object.values(caloriesByType).reduce(
        (sum, calories) => sum + calories,
        0
      ),
      byType,
      caloriesByType,
      quantitiesByType,
    };
  }

  public calculateHealthScore(): number {
    const glucoseSummary = this.getGlucoseSummary();
    const pressureSummary = this.getPressureSummary();

    let score = 100;

    // Deduct points for critical measurements
    score -= glucoseSummary.criticalCount * 20;
    score -= pressureSummary.criticalCount * 20;

    // Deduct points for warning measurements
    score -= glucoseSummary.warningCount * 10;
    score -= pressureSummary.warningCount * 10;

    return Math.max(0, score);
  }

  public getOverallHealthStatus(): "excellent" | "good" | "fair" | "poor" {
    const score = this.calculateHealthScore();

    if (score >= 90) return "excellent";
    if (score >= 70) return "good";
    if (score >= 50) return "fair";
    return "poor";
  }

  public getCriticalAlerts(): Array<{
    type: string;
    value: number;
    severity: string;
  }> {
    const alerts: Array<{ type: string; value: number; severity: string }> = [];

    this.glucoseMeasurements
      .filter((m) => m.status === "critical")
      .forEach((m) =>
        alerts.push({ type: "glucose", value: m.value, severity: "critical" })
      );

    this.pressureMeasurements
      .filter((m) => m.status === "critical")
      .forEach((m) =>
        alerts.push({
          type: "pressure",
          value: m.systolic,
          severity: "critical",
        })
      );

    return alerts;
  }

  public analyzeGlucoseTrends(): {
    direction: string;
    volatility: number;
    recommendation: string;
  } {
    if (this.glucoseMeasurements.length < 2) {
      return {
        direction: "insufficient_data",
        volatility: 0,
        recommendation: "Need more measurements for trend analysis",
      };
    }

    const sortedMeasurements = [...this.glucoseMeasurements].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    const values = sortedMeasurements.map((m) => m.value);

    const firstHalf = values.slice(0, Math.ceil(values.length / 2));
    const secondHalf = values.slice(Math.ceil(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const direction =
      secondAvg > firstAvg
        ? "increasing"
        : secondAvg < firstAvg
        ? "decreasing"
        : "stable";
    const volatility = Math.sqrt(
      values.reduce(
        (sum, val) =>
          sum +
          Math.pow(val - values.reduce((a, b) => a + b, 0) / values.length, 2),
        0
      ) / values.length
    );

    let recommendation = "";
    if (direction === "increasing") {
      recommendation =
        "Consider reducing carbohydrate intake and increasing physical activity";
    } else if (direction === "decreasing") {
      recommendation = "Glucose levels are improving, maintain current routine";
    } else {
      recommendation = "Glucose levels are stable, continue current management";
    }

    return { direction, volatility, recommendation };
  }

  public analyzePressureTrends(): {
    systolicDirection: string;
    diastolicDirection: string;
    recommendation: string;
  } {
    if (this.pressureMeasurements.length < 2) {
      return {
        systolicDirection: "insufficient_data",
        diastolicDirection: "insufficient_data",
        recommendation: "Need more measurements for trend analysis",
      };
    }

    const sortedMeasurements = [...this.pressureMeasurements].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    const systolicValues = sortedMeasurements.map((m) => m.systolic);
    const diastolicValues = sortedMeasurements.map((m) => m.diastolic);

    const systolicDirection = this.getTrendDirection(systolicValues);
    const diastolicDirection = this.getTrendDirection(diastolicValues);

    let recommendation = "";
    if (
      systolicDirection === "increasing" ||
      diastolicDirection === "increasing"
    ) {
      recommendation =
        "Consider reducing salt intake, increasing exercise, and stress management";
    } else if (
      systolicDirection === "decreasing" &&
      diastolicDirection === "decreasing"
    ) {
      recommendation =
        "Pressure levels are improving, maintain current routine";
    } else {
      recommendation =
        "Pressure levels are relatively stable, continue current management";
    }

    return { systolicDirection, diastolicDirection, recommendation };
  }

  private getTrendDirection(values: number[]): string {
    const firstHalf = values.slice(0, Math.ceil(values.length / 2));
    const secondHalf = values.slice(Math.ceil(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 2) return "increasing";
    if (secondAvg < firstAvg - 2) return "decreasing";
    return "stable";
  }

  public getMeasurementsInRange(
    startDate: Date,
    endDate: Date
  ): {
    glucoseMeasurements: GlucoseMeasurement[];
    pressureMeasurements: PressureMeasurement[];
    foodEntries: FoodEntry[];
  } {
    return {
      glucoseMeasurements: this.glucoseMeasurements.filter(
        (m) => m.timestamp >= startDate && m.timestamp <= endDate
      ),
      pressureMeasurements: this.pressureMeasurements.filter(
        (m) => m.timestamp >= startDate && m.timestamp <= endDate
      ),
      foodEntries: this.foodEntries.filter(
        (f) => f.timestamp >= startDate && f.timestamp <= endDate
      ),
    };
  }

  public export(): MedicalViewData {
    return {
      id: this.id,
      userId: this.userId,
      date: this.date,
      userProfile: this.userProfile,
      glucoseMeasurements: this.glucoseMeasurements,
      pressureMeasurements: this.pressureMeasurements,
      foodEntries: this.foodEntries,
    };
  }

  public exportSummary(): {
    date: Date;
    glucoseSummary: GlucoseSummary;
    pressureSummary: PressureSummary;
    nutritionalSummary: NutritionalSummary;
    healthScore: number;
    alerts: Array<{ type: string; value: number; severity: string }>;
  } {
    return {
      date: this.date,
      glucoseSummary: this.getGlucoseSummary(),
      pressureSummary: this.getPressureSummary(),
      nutritionalSummary: this.getNutritionalSummary(),
      healthScore: this.calculateHealthScore(),
      alerts: this.getCriticalAlerts(),
    };
  }
}

export function generateMedicalSummary(medicalView: MedicalView): {
  date: Date;
  patientName: string;
  glucoseSummary: GlucoseSummary;
  pressureSummary: PressureSummary;
  nutritionalSummary: NutritionalSummary;
  overallStatus: string;
  recommendations: Array<{
    priority: string;
    description: string;
    action: string;
  }>;
} {
  const glucoseSummary = medicalView.getGlucoseSummary();
  const pressureSummary = medicalView.getPressureSummary();
  const nutritionalSummary = medicalView.getNutritionalSummary();
  const overallStatus = medicalView.getOverallHealthStatus();
  const alerts = medicalView.getCriticalAlerts();

  const recommendations = [];

  // High priority recommendations for critical alerts
  alerts.forEach((alert) => {
    if (alert.type === "glucose") {
      recommendations.push({
        priority: "high",
        description: `Critical glucose level: ${alert.value}`,
        action: "Immediate medical attention required",
      });
    } else if (alert.type === "pressure") {
      recommendations.push({
        priority: "high",
        description: `Critical blood pressure: ${alert.value}`,
        action: "Immediate medical attention required",
      });
    }
  });

  // Medium priority recommendations for warnings
  if (glucoseSummary.warningCount > 0) {
    recommendations.push({
      priority: "medium",
      description: `${glucoseSummary.warningCount} glucose measurements in warning range`,
      action: "Monitor diet and consider adjusting medication",
    });
  }

  if (pressureSummary.warningCount > 0) {
    recommendations.push({
      priority: "medium",
      description: `${pressureSummary.warningCount} blood pressure measurements in warning range`,
      action: "Reduce salt intake and increase physical activity",
    });
  }

  // Low priority general recommendations
  if (nutritionalSummary.totalCalories < 1200) {
    recommendations.push({
      priority: "low",
      description: "Low daily calorie intake",
      action: "Consider increasing food portions or adding healthy snacks",
    });
  }

  if (nutritionalSummary.byType.vegetables.length === 0) {
    recommendations.push({
      priority: "low",
      description: "No vegetables recorded today",
      action: "Include vegetables in your next meal",
    });
  }

  return {
    date: medicalView.date,
    patientName: medicalView.userProfile.name,
    glucoseSummary,
    pressureSummary,
    nutritionalSummary,
    overallStatus,
    recommendations,
  };
}
