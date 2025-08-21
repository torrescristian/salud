import { describe, it, expect, beforeEach } from 'vitest'
import { GlucoseMeasurement, determineGlucoseStatus } from '../../../domain/GlucoseMeasurement'

describe('GlucoseMeasurement Domain Integration Tests', () => {
  let glucoseMeasurement: GlucoseMeasurement

  beforeEach(() => {
    glucoseMeasurement = new GlucoseMeasurement({
      id: '1',
      userId: 'user1',
      timestamp: new Date('2024-01-15T08:00:00Z'),
      value: 95,
      context: 'fasting',
      status: 'normal'
    })
  })

  describe('GlucoseMeasurement Creation', () => {
    it('should create a valid glucose measurement', () => {
      expect(glucoseMeasurement.id).toBe('1')
      expect(glucoseMeasurement.userId).toBe('user1')
      expect(glucoseMeasurement.value).toBe(95)
      expect(glucoseMeasurement.context).toBe('fasting')
      expect(glucoseMeasurement.status).toBe('normal')
    })

    it('should set timestamp to current time if not provided', () => {
      const measurement = new GlucoseMeasurement({
        id: '2',
        userId: 'user1',
        value: 100,
        context: 'postPrandial'
      })

      expect(measurement.timestamp).toBeInstanceOf(Date)
      expect(measurement.timestamp.getTime()).toBeCloseTo(Date.now(), -2)
    })
  })

  describe('Status Determination', () => {
    it('should determine normal status for fasting glucose within limits', () => {
      const limits = { min: 70, max: 100 }
      const status = determineGlucoseStatus(85, limits)
      
      expect(status).toBe('normal')
    })

    it('should determine warning status for fasting glucose below normal', () => {
      const limits = { min: 70, max: 100 }
      const status = determineGlucoseStatus(65, limits)
      
      expect(status).toBe('warning')
    })

    it('should determine warning status for fasting glucose above normal', () => {
      const limits = { min: 70, max: 100 }
      const status = determineGlucoseStatus(110, limits)
      
      expect(status).toBe('warning')
    })

    it('should determine critical status for very low glucose', () => {
      const limits = { min: 70, max: 100 }
      const status = determineGlucoseStatus(50, limits)
      
      expect(status).toBe('critical')
    })

    it('should determine critical status for very high glucose', () => {
      const limits = { min: 70, max: 100 }
      const status = determineGlucoseStatus(150, limits)
      
      expect(status).toBe('critical')
    })
  })

  describe('Context Validation', () => {
    it('should accept valid context values', () => {
      const validContexts = ['fasting', 'postPrandial', 'custom']
      
      validContexts.forEach(context => {
        const measurement = new GlucoseMeasurement({
          id: '3',
          userId: 'user1',
          value: 90,
          context: context as any
        })
        
        expect(measurement.context).toBe(context)
      })
    })

    it('should throw error for invalid context', () => {
      expect(() => {
        new GlucoseMeasurement({
          id: '4',
          userId: 'user1',
          value: 90,
          context: 'invalid' as any
        })
      }).toThrow('Invalid context value')
    })
  })

  describe('Value Validation', () => {
    it('should accept positive glucose values', () => {
      const measurement = new GlucoseMeasurement({
        id: '5',
        userId: 'user1',
        value: 200,
        context: 'postPrandial'
      })
      
      expect(measurement.value).toBe(200)
    })

    it('should throw error for negative glucose values', () => {
      expect(() => {
        new GlucoseMeasurement({
          id: '6',
          userId: 'user1',
          value: -50,
          context: 'fasting'
        })
      }).toThrow('Glucose value must be positive')
    })

    it('should throw error for zero glucose values', () => {
      expect(() => {
        new GlucoseMeasurement({
          id: '7',
          userId: 'user1',
          value: 0,
          context: 'fasting'
        })
      }).toThrow('Glucose value must be positive')
    })
  })

  describe('Measurement Updates', () => {
    it('should update glucose value and recalculate status', () => {
      const limits = { min: 70, max: 100 }
      glucoseMeasurement.updateValue(120, limits)
      
      expect(glucoseMeasurement.value).toBe(120)
      expect(glucoseMeasurement.status).toBe('warning')
    })

    it('should update context', () => {
      glucoseMeasurement.updateContext('postPrandial')
      
      expect(glucoseMeasurement.context).toBe('postPrandial')
    })

    it('should update timestamp', () => {
      const newTimestamp = new Date('2024-01-15T12:00:00Z')
      glucoseMeasurement.updateTimestamp(newTimestamp)
      
      expect(glucoseMeasurement.timestamp).toBe(newTimestamp)
    })
  })

  describe('Data Export', () => {
    it('should export measurement data correctly', () => {
      const exported = glucoseMeasurement.export()
      
      expect(exported).toEqual({
        id: '1',
        userId: 'user1',
        timestamp: new Date('2024-01-15T08:00:00Z'),
        value: 95,
        context: 'fasting',
        status: 'normal'
      })
    })
  })
})
