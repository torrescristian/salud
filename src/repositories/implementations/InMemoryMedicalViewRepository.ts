import { MedicalView } from '../../domain/MedicalView';
import { MedicalViewRepository } from '../MedicalViewRepository';

export class InMemoryMedicalViewRepository implements MedicalViewRepository {
  private views: MedicalView[] = [];

  async save(view: MedicalView): Promise<MedicalView> {
    const existingIndex = this.views.findIndex(v => v.id === view.id);
    
    if (existingIndex >= 0) {
      this.views[existingIndex] = view;
    } else {
      this.views.push(view);
    }
    
    return view;
  }

  async findById(id: string): Promise<MedicalView | null> {
    return this.views.find(v => v.id === id) || null;
  }

  async findByUserId(userId: string): Promise<MedicalView[]> {
    return this.views.filter(v => v.userId === userId);
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MedicalView[]> {
    return this.views.filter(v => 
      v.userId === userId &&
      v.timestamp >= startDate &&
      v.timestamp <= endDate
    );
  }

  async update(id: string, view: Partial<MedicalView>): Promise<MedicalView> {
    const existingIndex = this.views.findIndex(v => v.id === id);
    
    if (existingIndex === -1) {
      throw new Error(`Medical view with id ${id} not found`);
    }
    
    this.views[existingIndex] = { ...this.views[existingIndex], ...view };
    return this.views[existingIndex];
  }

  async delete(id: string): Promise<void> {
    const index = this.views.findIndex(v => v.id === id);
    if (index !== -1) {
      this.views.splice(index, 1);
    }
  }

  async findLatestByUserId(userId: string): Promise<MedicalView | null> {
    const userViews = this.views.filter(v => v.userId === userId);
    if (userViews.length === 0) return null;
    
    return userViews.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
  }

  async findByAlertLevel(userId: string, alertLevel: 'low' | 'medium' | 'high'): Promise<MedicalView[]> {
    return this.views.filter(v => 
      v.userId === userId && v.alerts.some(alert => alert.level === alertLevel)
    );
  }

  async findTrendsByUserId(userId: string, days: number): Promise<MedicalView[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.views.filter(v => 
      v.userId === userId && v.timestamp >= cutoffDate
    );
  }
}
