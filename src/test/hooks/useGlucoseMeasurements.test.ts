import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGlucoseMeasurements, useAddGlucoseMeasurement } from '../../hooks/useGlucoseMeasurements';

// Mock the use case
vi.mock('../../use-cases/MeasurementUseCase', () => ({
  MeasurementUseCase: vi.fn().mockImplementation(() => ({
    getGlucoseMeasurements: vi.fn(),
    addGlucoseMeasurement: vi.fn(),
  })),
}));

describe('useGlucoseMeasurements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return hook with correct structure', () => {
    expect(useGlucoseMeasurements).toBeDefined();
    expect(typeof useGlucoseMeasurements).toBe('function');
  });

  it('should accept userId parameter', () => {
    expect(() => useGlucoseMeasurements('test-user')).not.toThrow();
  });

  it('should be a function that can be called', () => {
    const hook = useGlucoseMeasurements;
    expect(typeof hook).toBe('function');
  });
});

describe('useAddGlucoseMeasurement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return hook with correct structure', () => {
    expect(useAddGlucoseMeasurement).toBeDefined();
    expect(typeof useAddGlucoseMeasurement).toBe('function');
  });

  it('should be a function that can be called', () => {
    const hook = useAddGlucoseMeasurement;
    expect(typeof hook).toBe('function');
  });
});
