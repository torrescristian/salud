import { useState } from 'react'

interface PressureMeasurementFormProps {
  onSubmit: (systolic: number, diastolic: number) => void
  onCancel: () => void
  criticalLimits: {
    systolic: { min: number; max: number }
    diastolic: { min: number; max: number }
  }
}

export function PressureMeasurementForm({ onSubmit, onCancel, criticalLimits }: PressureMeasurementFormProps) {
  const [systolic, setSystolic] = useState('')
  const [diastolic, setDiastolic] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const systolicValue = parseFloat(systolic)
    const diastolicValue = parseFloat(diastolic)
    
    if (isNaN(systolicValue) || isNaN(diastolicValue)) {
      setError('Por favor ingrese valores válidos')
      return
    }

    if (systolicValue <= 0 || diastolicValue <= 0) {
      setError('Los valores deben ser positivos')
      return
    }

    if (systolicValue < diastolicValue) {
      setError('La presión alta no puede ser menor que la baja')
      return
    }

    if (systolicValue > 300 || diastolicValue > 200) {
      setError('Los valores parecen ser muy altos. ¿Está seguro?')
      return
    }

    setError('')
    onSubmit(systolicValue, diastolicValue)
  }

  const getStatusColor = (systolic: number, diastolic: number) => {
    const systolicStatus = getSystolicStatus(systolic)
    const diastolicStatus = getDiastolicStatus(diastolic)
    
    if (systolicStatus === 'critical' || diastolicStatus === 'critical') {
      return 'text-red-600'
    } else if (systolicStatus === 'warning' || diastolicStatus === 'warning') {
      return 'text-yellow-600'
    } else {
      return 'text-green-600'
    }
  }

  const getStatusEmoji = (systolic: number, diastolic: number) => {
    const systolicStatus = getSystolicStatus(systolic)
    const diastolicStatus = getDiastolicStatus(diastolic)
    
    if (systolicStatus === 'critical' || diastolicStatus === 'critical') {
      return '🔴'
    } else if (systolicStatus === 'warning' || diastolicStatus === 'warning') {
      return '🟡'
    } else {
      return '🟢'
    }
  }

  const getStatusText = (systolic: number, diastolic: number) => {
    const systolicStatus = getSystolicStatus(systolic)
    const diastolicStatus = getDiastolicStatus(diastolic)
    
    if (systolicStatus === 'critical' || diastolicStatus === 'critical') {
      return 'Crítico'
    } else if (systolicStatus === 'warning' || diastolicStatus === 'warning') {
      return 'Atención'
    } else {
      return 'Normal'
    }
  }

  const getSystolicStatus = (value: number): 'normal' | 'warning' | 'critical' => {
    if (value >= criticalLimits.systolic.min && value <= criticalLimits.systolic.max) {
      return 'normal'
    } else if (
      (value >= criticalLimits.systolic.min * 0.9 && value < criticalLimits.systolic.min) ||
      (value > criticalLimits.systolic.max && value <= criticalLimits.systolic.max * 1.2)
    ) {
      return 'warning'
    } else {
      return 'critical'
    }
  }

  const getDiastolicStatus = (value: number): 'normal' | 'warning' | 'critical' => {
    if (value >= criticalLimits.diastolic.min && value <= criticalLimits.diastolic.max) {
      return 'normal'
    } else if (
      (value >= criticalLimits.diastolic.min * 0.9 && value < criticalLimits.diastolic.min) ||
      (value > criticalLimits.diastolic.max && value <= criticalLimits.diastolic.max * 1.2)
    ) {
      return 'warning'
    } else {
      return 'critical'
    }
  }

  const clearError = () => {
    if (error) setError('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Registrar Presión Arterial
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Presión Sistólica (Alta) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Presión Alta (mmHg):
            </label>
            <input
              type="number"
              value={systolic}
              onChange={(e) => {
                setSystolic(e.target.value)
                clearError()
              }}
              placeholder="120"
              className="w-full px-4 py-3 text-xl text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="300"
              step="1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Presión cuando el corazón late (número superior)
            </p>
          </div>

          {/* Presión Diastólica (Baja) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Presión Baja (mmHg):
            </label>
            <input
              type="number"
              value={diastolic}
              onChange={(e) => {
                setDiastolic(e.target.value)
                clearError()
              }}
              placeholder="80"
              className="w-full px-4 py-3 text-xl text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="200"
              step="1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Presión cuando el corazón descansa (número inferior)
            </p>
          </div>

          {/* Estado visual */}
          {systolic && diastolic && !error && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-3xl font-bold ${getStatusColor(parseFloat(systolic), parseFloat(diastolic))}`}>
                {getStatusEmoji(parseFloat(systolic), parseFloat(diastolic))} {getStatusText(parseFloat(systolic), parseFloat(diastolic))}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Límites: {criticalLimits.systolic.min}/{criticalLimits.diastolic.min} - {criticalLimits.systolic.max}/{criticalLimits.diastolic.max} mmHg
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!systolic.trim() || !diastolic.trim()}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
