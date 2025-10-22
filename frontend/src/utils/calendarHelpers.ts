import { DjangoTask, RecurrencePattern } from '../api/taskApi'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  resource?: any
}

/**
 * Конвертує Task з recurrence_pattern в масив Calendar Events
 */
export const convertTaskToCalendarEvents = (task: DjangoTask): CalendarEvent[] => {
  const events: CalendarEvent[] = []
  
  // Перевіряємо, чи є повторення
  if (task.recurrence_pattern?.slots && task.recurrence_pattern.slots.length > 0) {
    // Розгортаємо кожен слот в окрему подію
    task.recurrence_pattern.slots.forEach((slot, index) => {
      const startDateTime = new Date(`${slot.date}T${slot.start_time}`)
      const endDateTime = new Date(`${slot.date}T${slot.end_time}`)
      
      events.push({
        id: `${task.slug}-slot-${index}`,
        title: slot.day_label ? `${task.title} - ${slot.day_label}` : task.title,
        start: startDateTime,
        end: endDateTime,
        allDay: false,
        resource: {
          taskId: task.id,
          taskSlug: task.slug,
          slotIndex: index,
          slotNotes: slot.notes,
          isRecurringSlot: true,
          totalSlots: task.recurrence_pattern.slots.length,
          recurrenceType: task.recurrence_pattern.type,
          priority: task.priority,
          status: task.status,
          category: task.category,
          description: task.description,
          note: task.note,
        }
      })
    })
  } else if (task.start_datetime && task.end_datetime) {
    // Звичайна подія без повторення з start_datetime/end_datetime
    events.push({
      id: task.slug,
      title: task.title,
      start: new Date(task.start_datetime),
      end: new Date(task.end_datetime),
      allDay: false,
      resource: {
        taskId: task.id,
        taskSlug: task.slug,
        isRecurringSlot: false,
        priority: task.priority,
        status: task.status,
        category: task.category,
        description: task.description,
        note: task.note,
      }
    })
  } else if (task.date_start && task.date_end) {
    // Legacy: використовуємо date_start/date_end (для зворотної сумісності)
    const today = new Date()
    let startDate: Date
    let endDate: Date
    
    if (task.date_start && task.date_end) {
      startDate = new Date(task.date_start)
      endDate = new Date(task.date_end)
      endDate.setHours(23, 59, 59)
    } else {
      startDate = new Date(today)
      endDate = new Date(today)
      endDate.setHours(23, 59, 59)
    }
    
    // Визначаємо, чи є конкретний час
    const hasSpecificTime = task.time_start && task.time_end && 
      (new Date(task.time_start).getHours() !== 0 || 
       new Date(task.time_start).getMinutes() !== 0 ||
       new Date(task.time_end).getHours() !== 0 || 
       new Date(task.time_end).getMinutes() !== 0)
    
    if (hasSpecificTime && task.time_start && task.time_end) {
      startDate = new Date(task.time_start)
      endDate = new Date(task.time_end)
    }
    
    events.push({
      id: task.slug,
      title: task.title,
      start: startDate,
      end: endDate,
      allDay: !hasSpecificTime,
      resource: {
        taskId: task.id,
        taskSlug: task.slug,
        isRecurringSlot: false,
        priority: task.priority,
        status: task.status,
        category: task.category,
        description: task.description,
        note: task.note,
      }
    })
  } else {
    // Fallback: таска без дат
    // Перевіряємо статус таски
    const isDone = task.status === 'done' || task.category === 'done' || task.task_mode === 'completed'
    const isAgenda = task.status === 'agenda' || task.category === 'agenda'
    
    if (isDone) {
      // Виконані таски: показувати ТІЛЬКИ в день виконання
      const completedDate = task.completed_at ? new Date(task.completed_at) : 
                           task.updated_at ? new Date(task.updated_at) : new Date()
      completedDate.setHours(0, 0, 0, 0)
      const endOfDay = new Date(completedDate)
      endOfDay.setHours(23, 59, 59, 999)
      
      events.push({
        id: task.slug,
        title: `✅ ${task.title}`,
        start: completedDate,
        end: endOfDay,
        allDay: true,
        resource: {
          taskId: task.id,
          taskSlug: task.slug,
          isRecurringSlot: false,
          isCompleted: true,
          priority: task.priority,
          status: task.status,
          category: task.category,
          description: task.description,
          note: task.note,
          noDateSet: true,
        }
      })
    } else if (isAgenda) {
      // Agenda таски (невиконані): показувати ЩОДНЯ протягом N днів
      const daysToShow = 3 // Показувати на 3 дні вперед
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Створюємо окрему подію для кожного дня
      for (let i = 0; i < daysToShow; i++) {
        const eventDate = new Date(today)
        eventDate.setDate(today.getDate() + i)
        
        const endOfDay = new Date(eventDate)
        endOfDay.setHours(23, 59, 59, 999)
        
        events.push({
          id: `${task.slug}-day-${i}`,
          title: `📌 ${task.title}`,
          start: eventDate,
          end: endOfDay,
          allDay: true,
          resource: {
            taskId: task.id,
            taskSlug: task.slug,
            isRecurringSlot: false,
            isAgendaItem: true,
            dayIndex: i,
            priority: task.priority,
            status: task.status,
            category: task.category,
            description: task.description,
            note: task.note,
            noDateSet: true,
          }
        })
      }
    } else {
      // Інші таски без дат: показувати тільки сьогодні
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const endOfDay = new Date(today)
      endOfDay.setHours(23, 59, 59, 999)
      
      events.push({
        id: task.slug,
        title: task.title,
        start: today,
        end: endOfDay,
        allDay: true,
        resource: {
          taskId: task.id,
          taskSlug: task.slug,
          isRecurringSlot: false,
          priority: task.priority,
          status: task.status,
          category: task.category,
          description: task.description,
          note: task.note,
          noDateSet: true,
        }
      })
    }
  }
  
  return events
}

/**
 * Конвертує масив Tasks в масив Calendar Events
 */
export const convertTasksToCalendarEvents = (tasks: DjangoTask[]): CalendarEvent[] => {
  const allEvents: CalendarEvent[] = []
  
  tasks.forEach(task => {
    const taskEvents = convertTaskToCalendarEvents(task)
    allEvents.push(...taskEvents)
  })
  
  return allEvents
}

/**
 * Перевіряє, чи є task повторюваною
 */
export const isRecurringTask = (task: DjangoTask): boolean => {
  return !!(task.recurrence_pattern?.slots && task.recurrence_pattern.slots.length > 0)
}

/**
 * Отримує загальну тривалість всіх слотів (в хвилинах)
 */
export const getTotalRecurrenceDuration = (task: DjangoTask): number => {
  if (!isRecurringTask(task)) return 0
  
  let totalMinutes = 0
  task.recurrence_pattern!.slots.forEach(slot => {
    const start = new Date(`2000-01-01T${slot.start_time}`)
    const end = new Date(`2000-01-01T${slot.end_time}`)
    const durationMs = end.getTime() - start.getTime()
    totalMinutes += durationMs / (1000 * 60)
  })
  
  return totalMinutes
}

/**
 * Отримує кількість слотів у повторенні
 */
export const getRecurrenceSlotCount = (task: DjangoTask): number => {
  if (!isRecurringTask(task)) return 0
  return task.recurrence_pattern!.slots.length
}

/**
 * Генерує recurrence pattern для простого повторення
 */
export const generateSimpleRecurrence = (
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string,
  type: 'daily' | 'weekly' = 'daily'
): RecurrencePattern => {
  const slots = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  let currentDate = new Date(start)
  let dayCounter = 1
  
  while (currentDate <= end) {
    slots.push({
      date: currentDate.toISOString().split('T')[0],
      start_time: startTime,
      end_time: endTime,
      day_label: `Day ${dayCounter}`
    })
    
    // Інкрементуємо дату залежно від типу
    if (type === 'daily') {
      currentDate.setDate(currentDate.getDate() + 1)
    } else if (type === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7)
    }
    
    dayCounter++
  }
  
  return {
    type,
    slots,
    total_duration_minutes: getTotalDurationFromSlots(slots)
  }
}

/**
 * Helper: обчислює загальну тривалість з масиву слотів
 */
const getTotalDurationFromSlots = (slots: Array<{ start_time: string; end_time: string }>): number => {
  let totalMinutes = 0
  slots.forEach(slot => {
    const start = new Date(`2000-01-01T${slot.start_time}`)
    const end = new Date(`2000-01-01T${slot.end_time}`)
    const durationMs = end.getTime() - start.getTime()
    totalMinutes += durationMs / (1000 * 60)
  })
  return totalMinutes
}

