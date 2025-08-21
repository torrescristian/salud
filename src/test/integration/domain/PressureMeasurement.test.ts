import { describe, it, expect, beforeEach } from 'vitest'
import { PressureMeasurement, determinePressureStatus } from '../../../domain/PressureMeasurement'

describe('PressureMeasurement Domain Integration Tests', () => {
  let pressureMeasurement: PressureMeasurement

  beforeEach(() => {
    pressureMeasurement = new PressureMeasurement({
      id: '1',
      userId: 'user1',
      timestamp: new Date('2024-01-15T08:00:00Z'),
      systolic: 120,
      diastolic: 80,
      status: 'normal'
    })
  })

  describe('PressureMeasurement Creation', () => {
    it('should create a valid pressure measurement', () => {
      expect(pressureMeasurement.id).toBe('1')
      expect(pressureMeasurement.userId).toBe('user1')
      expect(pressureMeasurement.systolic).toBe(120)
      expect(pressureMeasurement.diastolic).toBe(80)
      expect(pressureMeasurement.status).toBe('normal')
    })

    it('should set timestamp to current time if not provided', () => {
      const measurement = new PressureMeasurement({
        id: '2',
        userId: 'user1',
        systolic: 110,
        diastolic: 70
      })

      expect(measurement.timestamp).toBeInstanceOf(Date)
      expect(measurement.timestamp.getTime()).toBeCloseTo(Date.now(), -2)
    })
  })

  describe('Status Determination', () => {
    it('should determine normal status for pressure within limits', () => {
      const limits = {
        systolic: { min: 110, max: 120 },
        diastolic: { min: 70, max: 80 }
      }
      const status = determinePressureStatus(115, 75, limits)
      
      expect(status).toBe('normal')
    })

    it('should determine warning status for systolic above normal', () => {
      const limits = {
        systolic: { min: 110, max: 120 },
        diastolic: { min: 70, max: 80 }
      }
      const status = determinePressureStatus(125, 75, limits)
      
      expect(status).toBe('warning')
    })

    it('should determine warning status for diastolic above normal', () => {
      const limits = {
        systolic: { min: 110, max: 120 },
        diastolic: { min: 70, max: 80 }
      }
      const status = determinePressureStatus(115, 85, limits)
      
      expect(status).toBe('warning')
    })

    it('should determine critical status for very high systolic', () => {
      const limits = {
        systolic: { min: 110, max: 120 },
        diastolic: { min: 70, max: 80 }
      }
      const status = determinePressureStatus(160, 75, limits)
      
      expect(status).toBe('critical')
    })

    it('should determine critical status for very high diastolic', () => {
      const limits = {
        systolic: { min: 110, max: 120 },
        diastolic: { min: 70, max: 80 }
      }
      const status = determinePressureStatus(115, 100, limits)
      
      expect(status).toBe('critical')
    })

    it('should determine critical status for very low systolic', () => {
      const limits = {
        systolic: { min: 110, max: 120 },
        diastolic: { min: 70, max: 80 }
      }
      const status = determinePressureStatus(90, 75, limits)
      
      expect(status).toBe('critical')
    })
  })

  describe('Value Validation', () => {
    it('should accept valid pressure values', () => {
      const measurement = new PressureMeasurement({
        id: '3',
        userId: 'user1',
        systolic: 140,
        diastolic: 90
      })
      
      expect(measurement.systolic).toBe(140)
      expect(measurement.diastolic).toBe(90)
    })

    it('should throw error for negative systolic values', () => {
      expect(() => {
        new PressureMeasurement({
          id: '4',
          userId: 'user1',
          systolic: -50,
          diastolic: 80
        })
      }).toThrow('Systolic pressure must be positive')
    })

    it('should throw error for negative diastolic values', () => {
      expect(() => {
        new PressureMeasurement({
          id: '5',
          userId: 'user1',
          systolic: 120,
          diastolic: -30
        })
      }).toThrow('Diastolic pressure must be positive')
    })

    it('should throw error when diastolic is higher than systolic', () => {
      expect(() => {
        new PressureMeasurement({
          id: '6',
          userId: 'user1',
          systolic: 100,
          diastolic: 120
        })
      }).toThrow('Diastolic pressure cannot be higher than systolic')
    })
  })

  describe('Measurement Updates', () => {
    it('should update pressure values and recalculate status', () => {
      const limits = {
        systolic: { min: 110, max: 120 },
        diastolic: { min: 70, max: 80 }
      }
      pressureMeasurement.updateValues(130, 85, limits)
      
      expect(pressureMeasurement.systolic).toBe(130)
      expect(pressureMeasurement.diastolic).toBe(85)
      expect(pressureMeasurement.status).toBe('warning')
    })

    it('should update timestamp', () => {
      const newTimestamp = new Date('2024-01-15T12:00:00Z')
      pressureMeasurement.updateTimestamp(newTimestamp)
      
      expect(pressureMeasurement.timestamp).toBe(newTimestamp)
    })
  })

  describe('Pressure Categories', () => {
    it('should categorize normal pressure correctly', () => {
      const measurement = new PressureMeasurement({
        id: '7',
        userId: 'user1',
        systolic: 115,
        diastolic: 75
      })
      
      expect(measurement.getCategory()).toBe('normal')
    })

    it('should categorize prehypertension correctly', () => {
      const measurement = new PressureMeasurement({
        id: '8',
        userId: 'user1',
        systolic: 125,
        diastolic: 85
      })
      
      expect(measurement.getCategory()).toBe('prehypertension')
    })

    it('should categorize stage 1 hypertension correctly', () => {
      const measurement = new PressureMeasurement({
        id: '9',
        userId: 'user1',
        systolic: 145,
        diastolic: 95
      })
      
      expect(measurement.getCategory()).toBe('stage1_hypertension')
    })

    it('should categorize stage 2 hypertension correctly', () => {
      const measurement = new PressureMeasurement({
        id: '10',
        userId: 'user1',
        systolic: 165,
        diastolic: 105
      })
      
      expect(measurement.getCategory()).toBe('stage2_hypertension')
    })
  })

  describe('Data Export', () => {
    it('should export measurement data correctly', () => {
      const exported = pressureMeasurement.export()
      
      expect(exported).toEqual({
        id: '1',
        userId: 'user1',
        timestamp: new Date('2024-01-15T08:00:00Z'),
        systolic: 120,
        diastolic: 80,
        status: 'normal'
      })
    })
  })
})
