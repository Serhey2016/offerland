import React, { useState, useEffect } from 'react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { Calendar } from 'primereact/calendar'

interface TimeSlotDialogProps {
  visible: boolean
  onHide: () => void
  onSave: (data: TimeSlotFormData) => Promise<void>
}

export interface TimeSlotFormData {
  category: number
  service: number
  date_start: string
  date_end: string
  time_start: string
  time_end: string
  reserved_time_on_road: number
  start_location: string
  cost_of_1_hour_of_work: number
  minimum_time_slot: string
  hashtags?: string
}

interface Category {
  id: number
  name: string
}

interface Service {
  id: number
  name: string
  category_id: number
}

const TimeSlotDialog: React.FC<TimeSlotDialogProps> = ({ visible, onHide, onSave }) => {
  const [formData, setFormData] = useState<Partial<TimeSlotFormData>>({
    reserved_time_on_road: 30,
    minimum_time_slot: '1 hour'
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Load categories and services from API
    const mockCategories: Category[] = [
      { id: 1, name: 'Maintenance and Facilities Management' },
      { id: 2, name: 'Legal and Compliance Services' },
      { id: 3, name: 'Consulting and Advisory' },
      { id: 4, name: 'Training and Development' },
      { id: 5, name: 'Marketing and Advertising' },
      { id: 6, name: 'Financial Services' },
      { id: 7, name: 'Business Process Outsourcing (BPO)' },
      { id: 8, name: 'Manufacturing and Production' },
      { id: 9, name: 'HR Services' },
      { id: 10, name: 'Real Estate and Property Management' },
      { id: 11, name: 'Event Management' },
      { id: 12, name: 'Design and Creative Services' },
      { id: 13, name: 'Security Services' },
      { id: 14, name: 'Logistics and Transportation' },
      { id: 15, name: 'Medical Services' },
      { id: 16, name: 'IT Services' },
    ]

    const mockServices: Service[] = [
      { id: 1, name: 'Handyman services', category_id: 1 },
      { id: 2, name: 'Installation and maintenance', category_id: 1 },
      { id: 3, name: 'Equipment maintenance and repair', category_id: 1 },
      { id: 4, name: 'Other', category_id: 1 },
      { id: 5, name: 'Contract drafting and review', category_id: 2 },
      { id: 6, name: 'Litigation support', category_id: 2 },
      { id: 7, name: 'Compliance auditing', category_id: 2 },
      { id: 13, name: 'Management', category_id: 3 },
      { id: 14, name: 'Strategic', category_id: 3 },
      { id: 24, name: 'Employee training programs', category_id: 4 },
      { id: 25, name: 'Leadership development', category_id: 4 },
      { id: 33, name: 'Digital marketing', category_id: 5 },
      { id: 34, name: 'Social media marketing', category_id: 5 },
    ]

    setCategories(mockCategories)
    setServices(mockServices)
  }, [])

  // Filter services based on selected category
  useEffect(() => {
    if (formData.category) {
      const filtered = services.filter(s => s.category_id === formData.category)
      setFilteredServices(filtered)
    } else {
      setFilteredServices([])
    }
  }, [formData.category, services])

  const handleInputChange = (field: keyof TimeSlotFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      // Validate required fields
      if (!formData.category || !formData.service || !formData.date_start || 
          !formData.date_end || !formData.time_start || !formData.time_end ||
          !formData.reserved_time_on_road || !formData.start_location ||
          !formData.cost_of_1_hour_of_work || !formData.minimum_time_slot) {
        alert('Please fill in all required fields')
        return
      }

      await onSave(formData as TimeSlotFormData)
      
      // Reset form
      setFormData({
        reserved_time_on_road: 30,
        minimum_time_slot: '1 hour'
      })
      onHide()
    } catch (error) {
      console.error('Error saving time slot:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatTimeForInput = (date: Date | null): string => {
    if (!date) return ''
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const dialogFooter = (
    <div className="form-actions">
      <Button 
        label="Save" 
        onClick={handleSubmit} 
        loading={loading}
        className="btn btn-secondary save-btn"
      />
    </div>
  )

  return (
    <Dialog
      header="Create Time Slot"
      visible={visible}
      onHide={onHide}
      footer={dialogFooter}
      style={{ width: '600px' }}
      modal
      dismissableMask={false}
    >
      <div className="modal-form">
        <form className="project-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          
          <div className="form-group">
            <label htmlFor="time-slot-category">Category *</label>
            <Dropdown
              id="time-slot-category"
              value={formData.category}
              options={categories}
              onChange={(e) => {
                handleInputChange('category', e.value)
                handleInputChange('service', undefined) // Reset service when category changes
              }}
              optionLabel="name"
              optionValue="id"
              placeholder="-- Select category --"
              className="w-full"
            />
          </div>

          <div className="form-group">
            <label htmlFor="time-slot-service">Service *</label>
            <Dropdown
              id="time-slot-service"
              value={formData.service}
              options={filteredServices}
              onChange={(e) => handleInputChange('service', e.value)}
              optionLabel="name"
              optionValue="id"
              placeholder="-- Select service --"
              className="w-full"
              disabled={!formData.category}
            />
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="time-slot-date-start">Date and time start *</label>
              <Calendar
                id="time-slot-date-start"
                value={formData.date_start ? new Date(formData.date_start) : null}
                onChange={(e) => handleInputChange('date_start', formatDateForInput(e.value as Date))}
                dateFormat="yy-mm-dd"
                showIcon
                className="w-full"
                style={{ marginBottom: '0.5rem' }}
              />
              <Calendar
                id="time-slot-time-start"
                value={formData.time_start ? new Date(`2000-01-01T${formData.time_start}`) : null}
                onChange={(e) => handleInputChange('time_start', formatTimeForInput(e.value as Date))}
                timeOnly
                showIcon
                className="w-full time-input"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="time-slot-date-end">Date and time end *</label>
              <Calendar
                id="time-slot-date-end"
                value={formData.date_end ? new Date(formData.date_end) : null}
                onChange={(e) => handleInputChange('date_end', formatDateForInput(e.value as Date))}
                dateFormat="yy-mm-dd"
                showIcon
                className="w-full"
                style={{ marginBottom: '0.5rem' }}
              />
              <Calendar
                id="time-slot-time-end"
                value={formData.time_end ? new Date(`2000-01-01T${formData.time_end}`) : null}
                onChange={(e) => handleInputChange('time_end', formatTimeForInput(e.value as Date))}
                timeOnly
                showIcon
                className="w-full time-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="time-slot-reserved-time">Reserved time on road (minutes) *</label>
            <InputNumber
              id="time-slot-reserved-time"
              value={formData.reserved_time_on_road}
              onValueChange={(e) => handleInputChange('reserved_time_on_road', e.value)}
              placeholder="e.g. 30"
              className="w-full"
            />
          </div>

          <div className="form-group">
            <label htmlFor="time-slot-start-location">Start location (post-code) *</label>
            <InputText
              id="time-slot-start-location"
              value={formData.start_location || ''}
              onChange={(e) => handleInputChange('start_location', e.target.value)}
              placeholder="Enter start location"
              className="w-full"
            />
          </div>

          <div className="form-group">
            <label htmlFor="time-slot-cost-hour">Cost of one hour of work in £ *</label>
            <InputNumber
              id="time-slot-cost-hour"
              value={formData.cost_of_1_hour_of_work}
              onValueChange={(e) => handleInputChange('cost_of_1_hour_of_work', e.value)}
              placeholder="e.g. 100"
              mode="decimal"
              minFractionDigits={2}
              maxFractionDigits={2}
              className="w-full"
            />
          </div>

          <div className="form-group">
            <label htmlFor="time-slot-min-slot">Minimum slot *</label>
            <InputText
              id="time-slot-min-slot"
              value={formData.minimum_time_slot || ''}
              onChange={(e) => handleInputChange('minimum_time_slot', e.target.value)}
              placeholder="e.g. 9 hours"
              className="w-full"
            />
          </div>

        </form>
      </div>
    </Dialog>
  )
}

export default TimeSlotDialog

