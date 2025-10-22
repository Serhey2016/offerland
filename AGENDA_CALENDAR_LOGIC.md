# Agenda Calendar Display Logic

## Overview
This document describes the smart display logic for tasks in the Agenda calendar view, implemented to handle different task states appropriately.

## Task Display Rules

### 1. Agenda Tasks (Incomplete)
**Rule**: Display EVERY DAY for N days forward

**Implementation**:
- Default: Shows for 3 days forward from today
- Creates a separate calendar event for each day
- Marked with 📌 emoji prefix
- Shows in "All Day" section
- Each event has unique ID: `{task.slug}-day-{dayIndex}`

**Why**: Agenda tasks are ongoing reminders that should appear daily until completed or rescheduled.

### 2. Done Tasks
**Rule**: Display ONLY on the completion date

**Implementation**:
- Shows only on the day the task was completed
- Uses `completed_at` field if available, falls back to `updated_at`
- Marked with ✅ emoji prefix
- Shows in "All Day" section

**Why**: Completed tasks should only appear in history on the day they were finished, not pollute future days.

### 3. Recurring Done Tasks
**Rule**: Display on ALL completion dates (each occurrence)

**Implementation**:
- For tasks with `recurrence_pattern`, each slot is shown separately
- Each completed occurrence appears on its respective date
- Marked with ✅ emoji prefix
- Uses slot-specific completion dates

**Why**: Recurring tasks have multiple completion instances that should all be visible in history.

### 4. Other Tasks (No Dates)
**Rule**: Display TODAY only

**Implementation**:
- Shows as single all-day event for current day
- No special emoji prefix
- Falls back behavior for tasks without explicit dates

**Why**: Tasks without dates should be visible but not repeated unnecessarily.

## Database Changes

### New Field: `completed_at`
```python
completed_at = models.DateTimeField(
    null=True, 
    blank=True, 
    verbose_name='Completed At',
    help_text='Date and time when task was marked as done'
)
```

**Auto-population**:
- Automatically set when task is moved to 'done' category
- Automatically cleared when task is moved OUT of 'done' category
- Uses Django's `timezone.now()` for accurate timestamps

## Frontend Implementation

### File: `frontend/src/utils/calendarHelpers.ts`

**Key Logic**:
```typescript
// Check task status
const isDone = task.status === 'done' || task.category === 'done'
const isAgenda = task.status === 'agenda' || task.category === 'agenda'

if (isDone) {
  // Show ONLY on completion date
  const completedDate = task.completed_at ? new Date(task.completed_at) : 
                       task.updated_at ? new Date(task.updated_at) : new Date()
  // Create single all-day event
}

if (isAgenda) {
  // Show DAILY for N days
  const daysToShow = 3
  for (let i = 0; i < daysToShow; i++) {
    // Create separate event for each day
  }
}
```

**Event Properties**:
- `id`: Unique identifier (with day suffix for agenda items)
- `title`: Task title with emoji prefix
- `start`/`end`: All-day event boundaries
- `allDay`: Always true for fallback logic
- `resource`: Contains task metadata, status flags

## API Changes

### Updated Response
Added `completed_at` field to task JSON response:

```python
'completed_at': task.completed_at.isoformat() if task.completed_at else None
```

### TypeScript Interface
```typescript
export interface DjangoTask {
  // ... existing fields
  completed_at?: string | null  // New field
}
```

## Admin Interface

### Display Fields
- Added `completed_at` to `readonly_fields`
- Added to "Даты и время" fieldset
- Visible in task detail view

## Configuration

### Adjustable Parameters

**Days to show agenda items**:
```typescript
const daysToShow = 3 // Change this value to adjust forward visibility
```

Location: `frontend/src/utils/calendarHelpers.ts`, line ~146

## Migration

**File**: `services_and_projects/migrations/0038_add_completed_at.py`

**Applied**: Successfully migrated with zero downtime

## Testing Scenarios

### Scenario 1: Move task to Agenda
1. Task has no dates set
2. Move to Agenda category
3. **Expected**: Task appears in "All Day" section for next 3 days

### Scenario 2: Complete an Agenda task
1. Task is in Agenda (showing for 3 days)
2. Move to Done category
3. **Expected**: Task disappears from future days, shows ONLY on today with ✅

### Scenario 3: Undo completion
1. Task is in Done (showing on completion date)
2. Move back to Agenda or other category
3. **Expected**: `completed_at` cleared, task behavior resets

### Scenario 4: Recurring task completion
1. Task has `recurrence_pattern` with 3 slots
2. Complete the task
3. **Expected**: Task shows with ✅ on all 3 slot dates

## Known Issues & Limitations

1. **Timezone handling**: Uses browser's local timezone for date comparisons
2. **Performance**: Generating 3 events per agenda task may impact large calendars
3. **Customization**: Days-to-show is hardcoded (could be user preference)

## Future Enhancements

1. User-configurable "days to show" setting
2. Different display modes (calendar view vs list view)
3. Color-coding by priority or category
4. Filtering options for completed vs active tasks
5. Bulk completion actions for recurring tasks

## Related Files

- `services_and_projects/models.py` - Task model with `completed_at`
- `services_and_projects/admin.py` - Admin interface updates
- `services_and_projects/views.py` - API endpoint changes
- `frontend/src/api/taskApi.ts` - TypeScript interfaces
- `frontend/src/utils/calendarHelpers.ts` - Display logic
- `frontend/src/components/views/AgendaView.tsx` - Calendar component

## Summary

This implementation provides intelligent task display based on status:
- ✅ **Done tasks**: Show only on completion date
- 📌 **Agenda tasks**: Show daily for 3 days
- 🔄 **Recurring**: Each occurrence handled independently
- 📅 **Others**: Show today only

The system automatically manages `completed_at` timestamps and adjusts display logic accordingly, providing a clean and intuitive calendar experience.

