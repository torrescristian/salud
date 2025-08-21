import { describe, it, expect, beforeEach } from 'vitest'
import { FoodEntry, getFoodEmoji, categorizeFood } from '../../../domain/FoodEntry'

describe('FoodEntry Domain Integration Tests', () => {
  let foodEntry: FoodEntry

  beforeEach(() => {
    foodEntry = new FoodEntry({
      id: '1',
      userId: 'user1',
      timestamp: new Date('2024-01-15T08:00:00Z'),
      foodType: 'carbohydrates',
      description: 'Pan integral',
      quantity: 100,
      emoji: '🍞'
    })
  })

  describe('FoodEntry Creation', () => {
    it('should create a valid food entry', () => {
      expect(foodEntry.id).toBe('1')
      expect(foodEntry.userId).toBe('user1')
      expect(foodEntry.foodType).toBe('carbohydrates')
      expect(foodEntry.description).toBe('Pan integral')
      expect(foodEntry.quantity).toBe(100)
      expect(foodEntry.emoji).toBe('🍞')
    })

    it('should set timestamp to current time if not provided', () => {
      const entry = new FoodEntry({
        id: '2',
        userId: 'user1',
        foodType: 'proteins',
        description: 'Pollo',
        quantity: 150
      })

      expect(entry.timestamp).toBeInstanceOf(Date)
      expect(entry.timestamp.getTime()).toBeCloseTo(Date.now(), -2)
    })

    it('should auto-assign emoji if not provided', () => {
      const entry = new FoodEntry({
        id: '3',
        userId: 'user1',
        foodType: 'proteins',
        description: 'Pescado',
        quantity: 200
      })

      expect(entry.emoji).toBe('🍗')
    })
  })

  describe('Food Type Validation', () => {
    it('should accept valid food types', () => {
      const validTypes = ['carbohydrates', 'proteins', 'vegetables', 'eggs', 'dairy']
      
      validTypes.forEach(type => {
        const entry = new FoodEntry({
          id: `4-${type}`,
          userId: 'user1',
          foodType: type as any,
          description: 'Test food',
          quantity: 100
        })
        
        expect(entry.foodType).toBe(type)
      })
    })

    it('should throw error for invalid food type', () => {
      expect(() => {
        new FoodEntry({
          id: '5',
          userId: 'user1',
          foodType: 'invalid' as any,
          description: 'Test food',
          quantity: 100
        })
      }).toThrow('Invalid food type')
    })
  })

  describe('Quantity Validation', () => {
    it('should accept positive quantities', () => {
      const entry = new FoodEntry({
        id: '6',
        userId: 'user1',
        foodType: 'vegetables',
        description: 'Brócoli',
        quantity: 250
      })
      
      expect(entry.quantity).toBe(250)
    })

    it('should throw error for negative quantities', () => {
      expect(() => {
        new FoodEntry({
          id: '7',
          userId: 'user1',
          foodType: 'vegetables',
          description: 'Brócoli',
          quantity: -50
        })
      }).toThrow('Quantity must be positive')
    })

    it('should throw error for zero quantities', () => {
      expect(() => {
        new FoodEntry({
          id: '8',
          userId: 'user1',
          foodType: 'vegetables',
          description: 'Brócoli',
          quantity: 0
        })
      }).toThrow('Quantity must be positive')
    })
  })

  describe('Food Categorization', () => {
    it('should categorize carbohydrates correctly', () => {
      const carbs = ['pan', 'arroz', 'pasta', 'papas', 'tortilla']
      
      carbs.forEach(food => {
        const category = categorizeFood(food)
        expect(category).toBe('carbohydrates')
      })
    })

    it('should categorize proteins correctly', () => {
      const proteins = ['pollo', 'pescado', 'carne', 'cerdo', 'pavo']
      
      proteins.forEach(food => {
        const category = categorizeFood(food)
        expect(category).toBe('proteins')
      })
    })

    it('should categorize vegetables correctly', () => {
      const vegetables = ['brócoli', 'espinaca', 'lechuga', 'zanahoria', 'tomate']
      
      vegetables.forEach(food => {
        const category = categorizeFood(food)
        expect(category).toBe('vegetables')
      })
    })

    it('should categorize eggs correctly', () => {
      const eggs = ['huevo', 'huevos', 'omelette']
      
      eggs.forEach(food => {
        const category = categorizeFood(food)
        expect(category).toBe('eggs')
      })
    })

    it('should categorize dairy correctly', () => {
      const dairy = ['leche', 'queso', 'yogur', 'mantequilla']
      
      dairy.forEach(food => {
        const category = categorizeFood(food)
        expect(category).toBe('dairy')
      })
    })

    it('should default to carbohydrates for unknown foods', () => {
      const unknown = ['galleta', 'dulce', 'postre']
      
      unknown.forEach(food => {
        const category = categorizeFood(food)
        expect(category).toBe('carbohydrates')
      })
    })
  })

  describe('Emoji Assignment', () => {
    it('should assign correct emojis for each food type', () => {
      const emojiMap = {
        carbohydrates: '🍞',
        proteins: '🍗',
        vegetables: '🥦',
        eggs: '🥚',
        dairy: '🥛'
      }

      Object.entries(emojiMap).forEach(([type, emoji]) => {
        const assignedEmoji = getFoodEmoji(type as any)
        expect(assignedEmoji).toBe(emoji)
      })
    })

    it('should return default emoji for unknown food type', () => {
      const emoji = getFoodEmoji('unknown' as any)
      expect(emoji).toBe('🍽️')
    })
  })

  describe('Food Entry Updates', () => {
    it('should update food type and emoji', () => {
      foodEntry.updateFoodType('proteins')
      
      expect(foodEntry.foodType).toBe('proteins')
      expect(foodEntry.emoji).toBe('🍗')
    })

    it('should update description', () => {
      foodEntry.updateDescription('Pan de centeno')
      
      expect(foodEntry.description).toBe('Pan de centeno')
    })

    it('should update quantity', () => {
      foodEntry.updateQuantity(150)
      
      expect(foodEntry.quantity).toBe(150)
    })

    it('should update timestamp', () => {
      const newTimestamp = new Date('2024-01-15T12:00:00Z')
      foodEntry.updateTimestamp(newTimestamp)
      
      expect(foodEntry.timestamp).toBe(newTimestamp)
    })
  })

  describe('Nutritional Information', () => {
    it('should calculate calories for carbohydrates', () => {
      const entry = new FoodEntry({
        id: '9',
        userId: 'user1',
        foodType: 'carbohydrates',
        description: 'Arroz',
        quantity: 100
      })
      
      const calories = entry.calculateCalories()
      expect(calories).toBe(130) // 100g * 1.3 cal/g for carbs
    })

    it('should calculate calories for proteins', () => {
      const entry = new FoodEntry({
        id: '10',
        userId: 'user1',
        foodType: 'proteins',
        description: 'Pollo',
        quantity: 150
      })
      
      const calories = entry.calculateCalories()
      expect(calories).toBe(225) // 150g * 1.5 cal/g for proteins
    })

    it('should calculate calories for vegetables', () => {
      const entry = new FoodEntry({
        id: '11',
        userId: 'user1',
        foodType: 'vegetables',
        description: 'Brócoli',
        quantity: 200
      })
      
      const calories = entry.calculateCalories()
      expect(calories).toBe(60) // 200g * 0.3 cal/g for vegetables
    })
  })

  describe('Data Export', () => {
    it('should export food entry data correctly', () => {
      const exported = foodEntry.export()
      
      expect(exported).toEqual({
        id: '1',
        userId: 'user1',
        timestamp: new Date('2024-01-15T08:00:00Z'),
        foodType: 'carbohydrates',
        description: 'Pan integral',
        quantity: 100,
        emoji: '🍞'
      })
    })
  })
})
