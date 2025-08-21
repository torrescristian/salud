import { MedicalView, generateMedicalSummary } from "../domain/MedicalView";
import { GlucoseMeasurement } from "../domain/GlucoseMeasurement";
import { PressureMeasurement } from "../domain/PressureMeasurement";
import { FoodEntry } from "../domain/FoodEntry";
import { UserProfile } from "../domain/UserProfile";
import { MedicalViewRepository } from "../domain/repositories/MedicalViewRepository";
import { GlucoseMeasurementRepository } from "../domain/repositories/GlucoseMeasurementRepository";
import { PressureMeasurementRepository } from "../domain/repositories/PressureMeasurementRepository";
import { FoodEntryRepository } from "../domain/repositories/FoodEntryRepository";
import { UserProfileRepository } from "../domain/repositories/UserProfileRepository";

export interface CreateMedicalViewData {
  userId: string;
  date: Date;
}

export interface HealthSummary {
  date: Date;
  patientName: string;
  glucoseSummary: {
    totalMeasurements: number;
    averageValue: number;
    normalCount: number;
    warningCount: number;
    criticalCount: number;
  };
  pressureSummary: {
    totalMeasurements: number;
    averageSystolic: number;
    averageDiastolic: number;
    normalCount: number;
    warningCount: number;
    criticalCount: number;
  };
  nutritionalSummary: {
    totalEntries: number;
    totalCalories: number;
    caloriesByType: Record<string, number>;
  };
  overallHealthScore: number;
  overallStatus: "excellent" | "good" | "fair" | "poor";
  recommendations: string[];
  alerts: Array<{ message: string; severity: "info" | "warning" | "critical" }>;
}

export interface TrendsAnalysis {
  glucoseTrend: "improving" | "stable" | "worsening";
  pressureTrend: "improving" | "stable" | "worsening";
  nutritionalTrend: "improving" | "stable" | "worsening";
  overallTrend: "improving" | "stable" | "worsening";
}

export interface MedicalReport {
  userId: string;
  reportDate: Date;
  period: string;
  healthSummary: HealthSummary;
  trendsAnalysis: TrendsAnalysis;
  criticalAlerts: string[];
  recommendations: string[];
  medicalSummary: string;
}

export class MedicalViewUseCase {
  constructor(
    private medicalViewRepository: MedicalViewRepository,
    private glucoseRepository: GlucoseMeasurementRepository,
    private pressureRepository: PressureMeasurementRepository,
    private foodRepository: FoodEntryRepository,
    private userProfileRepository: UserProfileRepository
  ) {}

  async generateMedicalView(data: CreateMedicalViewData): Promise<MedicalView> {
    const userProfile = await this.userProfileRepository.findById(data.userId);
    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Get data for the specified date
    const glucoseMeasurements =
      await this.glucoseRepository.findByUserIdAndDate(
        data.userId,
        data.date,
        data.date
      );
    const pressureMeasurements =
      await this.pressureRepository.findByUserIdAndDate(
        data.userId,
        data.date,
        data.date
      );
    const foodEntries = await this.foodRepository.findByUserIdAndDate(
      data.userId,
      data.date
    );

    const medicalView = new MedicalView({
      id: this.generateId(),
      userId: data.userId,
      date: data.date,
      glucoseMeasurements,
      pressureMeasurements,
      foodEntries,
      userProfile,
    });

    return await this.medicalViewRepository.save(medicalView);
  }

  async getMedicalView(id: string): Promise<MedicalView> {
    const medicalView = await this.medicalViewRepository.findById(id);
    if (!medicalView) {
      throw new Error("Medical view not found");
    }
    return medicalView;
  }

  async getMedicalViewsByUser(userId: string): Promise<MedicalView[]> {
    return await this.medicalViewRepository.findByUserId(userId);
  }

  async getMedicalViewsByDate(
    userId: string,
    date: Date
  ): Promise<MedicalView[]> {
    return await this.medicalViewRepository.findByUserIdAndDate(userId, date);
  }

  async getMedicalViewByDate(
    userId: string,
    date: Date
  ): Promise<MedicalView | null> {
    const views = await this.medicalViewRepository.findByUserIdAndDate(
      userId,
      date
    );
    return views.length > 0 ? views[0] : null;
  }

  async getMedicalViewsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MedicalView[]> {
    return await this.medicalViewRepository.findByUserIdAndDateRange(
      userId,
      startDate,
      endDate
    );
  }

  async generateHealthSummary(
    userId: string,
    date: Date
  ): Promise<HealthSummary> {
    return await this.getHealthSummary(userId, date, date);
  }

  async getHealthSummary(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<HealthSummary> {
    const userProfile = await this.userProfileRepository.findById(userId);
    if (!userProfile) {
      throw new Error("User profile not found");
    }
    const glucoseMeasurements =
      await this.glucoseRepository.findByUserIdAndDate(
        userId,
        startDate,
        endDate
      );
    const pressureMeasurements =
      await this.pressureRepository.findByUserIdAndDate(
        userId,
        startDate,
        endDate
      );
    const foodEntries = await this.foodRepository.findByUserIdAndDate(
      userId,
      startDate
    );

    // Calculate glucose summary
    const glucoseValues = glucoseMeasurements.map((m) => m.value);
    const averageGlucose =
      glucoseValues.length > 0
        ? glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length
        : 0;

    const glucoseSummary = {
      totalMeasurements: glucoseMeasurements.length,
      averageValue: averageGlucose,
      normalCount: glucoseMeasurements.filter((m) => m.status === "normal")
        .length,
      warningCount: glucoseMeasurements.filter((m) => m.status === "warning")
        .length,
      criticalCount: glucoseMeasurements.filter((m) => m.status === "critical")
        .length,
    };

    // Calculate pressure summary
    const systolicValues = pressureMeasurements.map((m) => m.systolic);
    const diastolicValues = pressureMeasurements.map((m) => m.diastolic);
    const averageSystolic =
      systolicValues.length > 0
        ? systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length
        : 0;
    const averageDiastolic =
      diastolicValues.length > 0
        ? diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length
        : 0;

    const pressureSummary = {
      totalMeasurements: pressureMeasurements.length,
      averageSystolic,
      averageDiastolic,
      normalCount: pressureMeasurements.filter((m) => m.status === "normal")
        .length,
      warningCount: pressureMeasurements.filter((m) => m.status === "warning")
        .length,
      criticalCount: pressureMeasurements.filter((m) => m.status === "critical")
        .length,
    };

    // Calculate nutritional summary
    const totalCalories = foodEntries.reduce(
      (sum, entry) => sum + entry.calculateCalories(),
      0
    );

    const caloriesByType = {
      carbohydrates: foodEntries
        .filter((f) => f.foodType === "carbohydrates")
        .reduce((sum, f) => sum + f.calculateCalories(), 0),
      proteins: foodEntries
        .filter((f) => f.foodType === "proteins")
        .reduce((sum, f) => sum + f.calculateCalories(), 0),
      vegetables: foodEntries
        .filter((f) => f.foodType === "vegetables")
        .reduce((sum, f) => sum + f.calculateCalories(), 0),
      eggs: foodEntries
        .filter((f) => f.foodType === "eggs")
        .reduce((sum, f) => sum + f.calculateCalories(), 0),
      dairy: foodEntries
        .filter((f) => f.foodType === "dairy")
        .reduce((sum, f) => sum + f.calculateCalories(), 0),
    };

    const nutritionalSummary = {
      totalEntries: foodEntries.length,
      totalCalories,
      caloriesByType,
    };

    // Calculate overall health score (0-100)
    const glucoseScore =
      glucoseMeasurements.length > 0
        ? (glucoseSummary.normalCount / glucoseSummary.totalMeasurements) * 100
        : 50;
    const pressureScore =
      pressureMeasurements.length > 0
        ? (pressureSummary.normalCount / pressureSummary.totalMeasurements) *
          100
        : 50;
    const nutritionalScore = Math.min(
      (nutritionalSummary.totalEntries / 5) * 100,
      100
    ); // Assuming 5 entries per day is ideal

    const overallHealthScore = Math.round(
      (glucoseScore + pressureScore + nutritionalScore) / 3
    );

    // Generate alerts based on critical readings
    const alerts: Array<{
      message: string;
      severity: "info" | "warning" | "critical";
    }> = [];
    if (glucoseSummary.criticalCount > 0) {
      alerts.push({
        message: `${glucoseSummary.criticalCount} critical glucose readings detected`,
        severity: "critical",
      });
    }
    if (pressureSummary.criticalCount > 0) {
      alerts.push({
        message: `${pressureSummary.criticalCount} critical pressure readings detected`,
        severity: "critical",
      });
    }
    if (overallHealthScore < 50) {
      alerts.push({
        message: "Overall health score is critically low",
        severity: "critical",
      });
    }

    // Determine overall status
    let overallStatus: "excellent" | "good" | "fair" | "poor";
    if (overallHealthScore >= 90) {
      overallStatus = "excellent";
    } else if (overallHealthScore >= 75) {
      overallStatus = "good";
    } else if (overallHealthScore >= 60) {
      overallStatus = "fair";
    } else {
      overallStatus = "poor";
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (overallHealthScore < 70) {
      recommendations.push("Consider consulting with healthcare provider");
    }
    if (nutritionalSummary.totalEntries < 3) {
      recommendations.push("Increase meal frequency for better tracking");
    }
    if (glucoseSummary.criticalCount > 0) {
      recommendations.push("Monitor glucose levels more frequently");
    }
    if (pressureSummary.criticalCount > 0) {
      recommendations.push("Monitor blood pressure more frequently");
    }

    return {
      date: startDate,
      patientName: userProfile.name,
      glucoseSummary,
      pressureSummary,
      nutritionalSummary,
      overallHealthScore,
      overallStatus,
      recommendations,
      alerts,
    };
  }

  async getTrendsAnalysis(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TrendsAnalysis> {
    // Get measurements from two periods for comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);

    const currentGlucose = await this.glucoseRepository.findByUserIdAndDate(
      userId,
      startDate,
      endDate
    );
    const previousGlucose = await this.glucoseRepository.findByUserIdAndDate(
      userId,
      previousStartDate,
      startDate
    );

    const currentPressure = await this.pressureRepository.findByUserIdAndDate(
      userId,
      startDate,
      endDate
    );
    const previousPressure = await this.pressureRepository.findByUserIdAndDate(
      userId,
      previousStartDate,
      startDate
    );

    // Analyze glucose trend
    const currentGlucoseAvg =
      currentGlucose.length > 0
        ? currentGlucose.reduce((sum, m) => sum + m.value, 0) /
          currentGlucose.length
        : 0;
    const previousGlucoseAvg =
      previousGlucose.length > 0
        ? previousGlucose.reduce((sum, m) => sum + m.value, 0) /
          previousGlucose.length
        : 0;

    let glucoseTrend: "improving" | "stable" | "worsening";
    if (Math.abs(currentGlucoseAvg - previousGlucoseAvg) < 5) {
      glucoseTrend = "stable";
    } else if (currentGlucoseAvg < previousGlucoseAvg) {
      glucoseTrend = "improving";
    } else {
      glucoseTrend = "worsening";
    }

    // Analyze pressure trend
    const currentSystolicAvg =
      currentPressure.length > 0
        ? currentPressure.reduce((sum, m) => sum + m.systolic, 0) /
          currentPressure.length
        : 0;
    const previousSystolicAvg =
      previousPressure.length > 0
        ? previousPressure.reduce((sum, m) => sum + m.systolic, 0) /
          previousPressure.length
        : 0;

    let pressureTrend: "improving" | "stable" | "worsening";
    if (Math.abs(currentSystolicAvg - previousSystolicAvg) < 5) {
      pressureTrend = "stable";
    } else if (currentSystolicAvg < previousSystolicAvg) {
      pressureTrend = "improving";
    } else {
      pressureTrend = "worsening";
    }

    // For simplicity, nutritional trend is based on number of entries
    const nutritionalTrend: "improving" | "stable" | "worsening" = "stable";

    // Overall trend
    const trends = [glucoseTrend, pressureTrend, nutritionalTrend];
    const improvingCount = trends.filter((t) => t === "improving").length;
    const worseningCount = trends.filter((t) => t === "worsening").length;

    let overallTrend: "improving" | "stable" | "worsening";
    if (improvingCount > worseningCount) {
      overallTrend = "improving";
    } else if (worseningCount > improvingCount) {
      overallTrend = "worsening";
    } else {
      overallTrend = "stable";
    }

    return {
      glucoseTrend,
      pressureTrend,
      nutritionalTrend,
      overallTrend,
    };
  }

  async generateMedicalReport(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MedicalReport> {
    const userProfile = await this.userProfileRepository.findById(userId);
    if (!userProfile) {
      throw new Error("User profile not found");
    }

    const healthSummary = await this.getHealthSummary(
      userId,
      startDate,
      endDate
    );
    const trendsAnalysis = await this.getTrendsAnalysis(
      userId,
      startDate,
      endDate
    );

    // Generate critical alerts
    const criticalAlerts: string[] = [];
    if (healthSummary.glucoseSummary.criticalCount > 0) {
      criticalAlerts.push(
        `${healthSummary.glucoseSummary.criticalCount} critical glucose readings detected`
      );
    }
    if (healthSummary.pressureSummary.criticalCount > 0) {
      criticalAlerts.push(
        `${healthSummary.pressureSummary.criticalCount} critical pressure readings detected`
      );
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (healthSummary.overallHealthScore < 70) {
      recommendations.push("Consider consulting with healthcare provider");
    }
    if (healthSummary.nutritionalSummary.totalEntries < 3) {
      recommendations.push("Increase meal frequency for better tracking");
    }
    if (trendsAnalysis.overallTrend === "worsening") {
      recommendations.push("Review current treatment plan with doctor");
    }

    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const period = `${daysDiff} days`;

    // Generate medical summary text
    const medicalSummary = `Health report for ${daysDiff} days. Overall health score: ${healthSummary.overallHealthScore}/100. ${healthSummary.glucoseSummary.totalMeasurements} glucose measurements, ${healthSummary.pressureSummary.totalMeasurements} pressure measurements, and ${healthSummary.nutritionalSummary.totalEntries} food entries recorded.`;

    return {
      userId,
      reportDate: new Date(),
      period,
      healthSummary,
      trendsAnalysis,
      criticalAlerts,
      recommendations,
      medicalSummary,
    };
  }

  async exportMedicalReport(
    userId: string,
    startDate: Date,
    endDate: Date,
    format: "pdf" | "json" = "json"
  ): Promise<{
    report: MedicalReport;
    format: string;
    exportDate: Date;
  }> {
    const report = await this.generateMedicalReport(userId, startDate, endDate);

    // In a real implementation, this would generate actual PDF
    return {
      report,
      format,
      exportDate: new Date(),
    };
  }

  async deleteMedicalView(id: string): Promise<boolean> {
    const existingView = await this.medicalViewRepository.findById(id);
    if (!existingView) {
      throw new Error("Medical view not found");
    }

    return await this.medicalViewRepository.delete(id);
  }

  async analyzeGlucoseTrends(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TrendsAnalysis> {
    return await this.getTrendsAnalysis(userId, startDate, endDate);
  }

  async analyzePressureTrends(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TrendsAnalysis> {
    return await this.getTrendsAnalysis(userId, startDate, endDate);
  }

  async exportMedicalReportAsPDF(
    userId: string,
    date: Date
  ): Promise<{
    pdfData: string;
    filename: string;
    contentType: string;
  }> {
    const startDate = new Date(date);
    const endDate = new Date(date);
    const report = await this.generateMedicalReport(userId, startDate, endDate);

    return {
      pdfData: "base64-encoded-pdf-data", // In real implementation, generate actual PDF
      filename: `medical-report-${userId}-${
        date.toISOString().split("T")[0]
      }.pdf`,
      contentType: "application/pdf",
    };
  }

  async saveMedicalView(medicalView: MedicalView): Promise<MedicalView> {
    return await this.medicalViewRepository.save(medicalView);
  }

  async updateMedicalView(
    id: string,
    updateData: Partial<MedicalView>
  ): Promise<MedicalView> {
    const existingView = await this.medicalViewRepository.findById(id);
    if (!existingView) {
      throw new Error("Medical view not found");
    }

    // In a real implementation, you would merge the update data
    const updatedView = { ...existingView, ...updateData };
    return await this.medicalViewRepository.update(id, updatedView);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
