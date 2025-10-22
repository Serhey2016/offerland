# Recurrence Pattern Implementation for Tasks

## 📅 Overview
Implemented JSON-based recurrence pattern system for Task model to support events with different time slots across multiple days.

## ✅ Completed Implementation

### 1. Backend (Django)

#### **Task Model Updates** (`services_and_projects/models.py`)
- ✅ Added `recurrence_pattern` JSONField
- ✅ Added helper methods:
  - `is_recurring()` - Check if task is recurring
  - `get_recurrence_slots()` - Get all time slots
  - `get_recurrence_type()` - Get recurrence type (custom, daily, weekly, etc.)
  - `add_recurrence_slot()` - Add new time slot
  - `clear_recurrence()` - Clear all recurrence data

#### **Database Migration**
- ✅ Created migration `0037_add_recurrence_pattern.py`
- ✅ Successfully applied to database

#### **Admin Interface** (`services_and_projects/admin.py`)
- ✅ Added `is_recurring_display` column in list view
- ✅ Added `recurrence_info_display` in detail view
- ✅ Added "Повторення (Recurrence)" fieldset with collapse
- ✅ Shows detailed slot information with dates and times

### 2. Frontend (TypeScript/React)

#### **Type Definitions** (`frontend/src/api/taskApi.ts`)
- ✅ Added `RecurrenceSlot` interface
- ✅ Added `RecurrencePattern` interface
- ✅ Updated `DjangoTask` interface with `recurrence_pattern` field

#### **Calendar Helpers** (`frontend/src/utils/calendarHelpers.ts`)
- ✅ `convertTaskToCalendarEvents()` - Converts single task to calendar events
- ✅ `convertTasksToCalendarEvents()` - Converts task array to events
- ✅ `isRecurringTask()` - Check if task is recurring
- ✅ `getTotalRecurrenceDuration()` - Calculate total duration
- ✅ `generateSimpleRecurrence()` - Generate simple recurring patterns

#### **AgendaView Updates** (`frontend/src/components/views/AgendaView.tsx`)
- ✅ Imported `convertTasksToCalendarEvents` helper
- ✅ Simplified task loading logic
- ✅ Now automatically handles both regular and recurring tasks

#### **API Methods** (`frontend/src/api/taskApi.ts`)
- ✅ `createRecurringTask()` - Create task with recurrence pattern
- ✅ `updateRecurrencePattern()` - Update or clear recurrence pattern

## 📊 JSON Structure

### Recurrence Pattern Format:
```json
{
  "type": "custom",
  "description": "Multi-day event with different time slots",
  "slots": [
    {
      "date": "2025-10-21",
      "start_time": "15:30:00",
      "end_time": "16:30:00",
      "day_label": "Day 1 - Introduction",
      "notes": "Welcome session"
    },
    {
      "date": "2025-10-22",
      "start_time": "15:00:00",
      "end_time": "15:30:00",
      "day_label": "Day 2 - Workshop",
      "notes": "Hands-on practice"
    },
    {
      "date": "2025-10-23",
      "start_time": "16:00:00",
      "end_time": "18:00:00",
      "day_label": "Day 3 - Presentation",
      "notes": "Final presentations"
    }
  ],
  "total_duration_minutes": 240
}
```

### Supported Recurrence Types:
- `custom` - Different time for each day
- `daily` - Same time every day
- `weekly` - Weekly repetition
- `weekdays` - Weekdays only
- `weekend` - Weekends only

## 🎯 Usage Examples

### Creating a Recurring Task:

```typescript
import { taskApi, RecurrencePattern } from './api/taskApi'

// Example: 3-day training course with different times
const pattern: RecurrencePattern = {
  type: 'custom',
  description: 'Python Training Course',
  slots: [
    {
      date: '2025-10-21',
      start_time: '15:30:00',
      end_time: '16:30:00',
      day_label: 'Day 1',
      notes: 'Introduction'
    },
    {
      date: '2025-10-22',
      start_time: '15:00:00',
      end_time: '15:30:00',
      day_label: 'Day 2',
      notes: 'Workshop'
    },
    {
      date: '2025-10-23',
      start_time: '16:00:00',
      end_time: '18:00:00',
      day_label: 'Day 3',
      notes: 'Presentation'
    }
  ]
}

const task = await taskApi.createRecurringTask({
  title: 'Python Training Course',
  description: 'Comprehensive course',
  priority: 'iu',
  category: 'agenda',
  recurrence_pattern: pattern
})
```

### Calendar Display:

The calendar will automatically:
- Display each slot as a separate event
- Show in the correct day and time
- Display day labels in event titles
- Support all calendar modes (Month, Week, Day, Agenda)

## 🎨 Calendar Visualization

### In DAY View:
```
MONDAY 21.10           TUESDAY 22.10          WEDNESDAY 23.10
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ 15:00        │       │ 15:00 ┌────┐│       │ 16:00 ┌────┐ │
│ 15:30 ┌────┐ │       │       │Day2││       │       │    │ │
│       │Day1│ │       │ 15:30 └────┘│       │       │Day3│ │
│ 16:00 │    │ │       │              │       │ 17:00 │    │ │
│ 16:30 └────┘ │       │              │       │       │    │ │
│              │       │              │       │ 18:00 └────┘ │
└──────────────┘       └──────────────┘       └──────────────┘
```

## 📝 Admin Interface Features

### List View:
- Shows 🔄 icon for recurring tasks
- Column: "Recurring" (Yes/No)

### Detail View:
- Expandable "Повторення (Recurrence)" section
- Shows:
  - Recurrence type
  - Total number of slots
  - Detailed list of all slots with dates and times
  - Day labels and notes (if provided)

## 🚀 Benefits

1. **Flexible Scheduling** - Different times for each occurrence
2. **Single Task Entity** - All related slots in one task
3. **Calendar Integration** - Automatic conversion to calendar events
4. **Easy Management** - View and edit all slots from one place
5. **Backward Compatible** - Regular tasks still work as before

## 📚 Files Modified

### Backend:
- `services_and_projects/models.py` - Added JSONField and helper methods
- `services_and_projects/admin.py` - Added display methods
- `services_and_projects/migrations/0037_add_recurrence_pattern.py` - New migration

### Frontend:
- `frontend/src/api/taskApi.ts` - Added interfaces and API methods
- `frontend/src/utils/calendarHelpers.ts` - NEW: Helper utilities
- `frontend/src/components/views/AgendaView.tsx` - Updated to use helpers

## ✅ Testing

Server Status: ✅ Running without errors
Migration Status: ✅ Applied successfully
Admin Interface: ✅ Working
TypeScript Compilation: ✅ No errors

## 🎓 Next Steps (Optional)

1. Add UI for creating recurring tasks from frontend
2. Add visual indicators for recurring events in calendar
3. Add ability to edit individual slots
4. Add recurring pattern templates (daily, weekly, etc.)
5. Add conflict detection for overlapping slots

---

**Implementation Date:** October 22, 2025
**Status:** ✅ Complete and Ready for Use

