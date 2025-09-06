import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'

const app = document.getElementById('app')
const calendarEl = document.createElement('div')
calendarEl.id = 'calendar'
calendarEl.style.height = '100%'
app.appendChild(calendarEl)

const calendar = new Calendar(calendarEl, {
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'timeGridWeek',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
  },
  selectable: true,
  editable: true,
  droppable: true,
  nowIndicator: true,
  firstDay: 1,
  height: '100%',
  events: [
    { id: '1', title: 'Приклад задача', start: new Date().toISOString() }
  ],
  select: (info) => {
    // Тут згодом буде виклик до DRF для створення блоку часу
    calendar.addEvent({ title: 'Новий блок', start: info.start, end: info.end })
  },
  eventDrop: (info) => {
    // Тут згодом буде PATCH до DRF
    console.log('event moved', info.event.id, info.event.start, info.event.end)
  },
  eventResize: (info) => {
    // Тут згодом буде PATCH до DRF
    console.log('event resized', info.event.id, info.event.start, info.event.end)
  }
})

calendar.render()


