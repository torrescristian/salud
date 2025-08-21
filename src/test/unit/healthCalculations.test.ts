import { describe, it, expect } from 'vitest'
import {
  calculateGlucoseStatus,
  calculatePressureStatus,
  generateId,
  formatDate,
  formatTime,
  getCurrentDateString,
  getCurrentTimeString
} from '../../utils/healthCalculations'

describe('Health Calculations', () => {
  describe('calculateGlucoseStatus', () => {
    const limits = { min: 70, max: 100 }

    it('debe retornar normal para valores dentro del rango', () => {
      expect(calculateGlucoseStatus(70, limits)).toBe('normal')
      expect(calculateGlucoseStatus(85, limits)).toBe('normal')
      expect(calculateGlucoseStatus(100, limits)).toBe('normal')
    })

    it('debe retornar warning para valores cercanos a los límites', () => {
      expect(calculateGlucoseStatus(63, limits)).toBe('warning') // 70 * 0.9
      expect(calculateGlucoseStatus(69, limits)).toBe('warning')
      expect(calculateGlucoseStatus(101, limits)).toBe('warning')
      expect(calculateGlucoseStatus(120, limits)).toBe('warning') // 100 * 1.2
    })

    it('debe retornar critical para valores muy fuera del rango', () => {
      expect(calculateGlucoseStatus(50, limits)).toBe('critical')
      expect(calculateGlucoseStatus(150, limits)).toBe('critical')
    })
  })

  describe('calculatePressureStatus', () => {
    const limits = {
      systolic: { min: 110, max: 120 },
      diastolic: { min: 70, max: 80 }
    }

    it('debe retornar normal cuando ambas presiones están en rango', () => {
      expect(calculatePressureStatus(115, 75, limits)).toBe('normal')
    })

    it('debe retornar warning cuando una presión está en warning', () => {
      expect(calculatePressureStatus(125, 75, limits)).toBe('warning') // sistólica en warning
      expect(calculatePressureStatus(115, 65, limits)).toBe('warning') // diastólica en warning
    })

    it('debe retornar critical cuando una presión está en critical', () => {
      expect(calculatePressureStatus(150, 75, limits)).toBe('critical') // sistólica en critical
      expect(calculatePressureStatus(115, 50, limits)).toBe('critical') // diastólica en critical
    })
  })

  describe('generateId', () => {
    it('debe generar IDs únicos', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
    })
  })

  describe('formatDate', () => {
    it('debe formatear fecha correctamente', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      const formatted = formatDate(date)
      
      expect(formatted).toContain('15')
      expect(formatted).toContain('enero')
      expect(formatted).toContain('2024')
    })
  })

  describe('formatTime', () => {
    it('debe formatear hora correctamente', () => {
      const date = new Date('2024-01-15T14:30:00')
      const formatted = formatTime(date)
      
      expect(formatted).toMatch(/^\d{2}:\d{2}$/)
    })
  })

  describe('getCurrentDateString', () => {
    it('debe retornar fecha en formato YYYY-MM-DD', () => {
      const dateString = getCurrentDateString()
      
      expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('getCurrentTimeString', () => {
    it('debe retornar hora en formato HH:MM', () => {
      const timeString = getCurrentTimeString()
      
      expect(timeString).toMatch(/^\d{2}:\d{2}$/)
    })
  })
})
