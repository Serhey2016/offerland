# Fix: Drag and Drop Tasks in Agenda Calendar

## 🐛 Problem
When dragging a task from the "All day" section to a specific time slot (half-hour intervals) in the Agenda calendar, the task did not move or update its time.

## 🔍 Root Cause
The `InfiniteDailyCalendar` component was using `react-big-calendar` without the drag-and-drop addon enabled. There was no handler to update task datetime when events were dragged or resized.

## ✅ Solution

### 1. Frontend: Enable Drag and Drop (`frontend/src/components/InfiniteDailyCalendar.tsx`)

**Added drag-and-drop support:**
```typescript
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

const DnDCalendar = withDragAndDrop(BigCalendar)
```

**Added event handlers for drag and resize:**
```typescript
const handleEventDrop = async ({ event, start, end, isAllDay }: any) => {
  const taskSlug = event.resource?.taskSlug || event.resource?.taskId?.toString()
  
  await taskApi.updateTaskDatetime(taskSlug, {
    start_datetime: start.toISOString(),
    end_datetime: end.toISOString(),
    all_day: isAllDay || false
  })
  
  // Trigger reload
  if (onEventUpdate) {
    onEventUpdate()
  }
}

const handleEventResize = async ({ event, start, end }: any) => {
  // Similar logic to handleEventDrop
}
```

**Updated Calendar component:**
```typescript
<DnDCalendar
  // ... existing props ...
  onEventDrop={handleEventDrop}
  onEventResize={handleEventResize}
  resizable={true}
  draggableAccessor={() => true}
/>
```

### 2. API Client: Add Update Datetime Method (`frontend/src/api/taskApi.ts`)

```typescript
updateTaskDatetime: async (slug: string, datetimeData: {
  start_datetime: string
  end_datetime: string
  all_day?: boolean
}): Promise<any> => {
  const response = await api.patch(
    `/services_and_projects/tasks/${slug}/datetime/`, 
    datetimeData
  )
  return response.data
}
```

### 3. Backend: Create Update Datetime Endpoint (`services_and_projects/views.py`)

```python
@login_required
@require_http_methods(["PATCH"])
@csrf_exempt
def update_task_datetime(request, task_slug):
    """Update task start_datetime and end_datetime via PATCH request"""
    try:
        import json
        from datetime import datetime
        
        task = Task.objects.get(slug=task_slug, taskownerrelations__user=request.user)
        
        # Permission check
        owner_rel = TaskOwnerRelations.objects.filter(task=task, user=request.user).first()
        if not owner_rel:
            return JsonResponse({'success': False, 'error': 'Permission denied'}, status=403)
        
        # Parse request data
        data = json.loads(request.body)
        start_datetime_str = data.get('start_datetime')
        end_datetime_str = data.get('end_datetime')
        
        # Update datetimes
        if start_datetime_str:
            start_dt = datetime.fromisoformat(start_datetime_str.replace('Z', '+00:00'))
            task.start_datetime = start_dt
        
        if end_datetime_str:
            end_dt = datetime.fromisoformat(end_datetime_str.replace('Z', '+00:00'))
            task.end_datetime = end_dt
        
        task.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Task datetime updated successfully',
            'start_datetime': task.start_datetime.isoformat() if task.start_datetime else None,
            'end_datetime': task.end_datetime.isoformat() if task.end_datetime else None
        })
        
    except Task.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Task not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
```

### 4. URL Configuration (`services_and_projects/urls.py`)

```python
from .views import ..., update_task_datetime

urlpatterns = [
    # ... existing paths ...
    path('tasks/<slug:task_slug>/datetime/', update_task_datetime, name='update_task_datetime'),
]
```

### 5. Agenda View: Connect Reload Callback (`frontend/src/components/views/AgendaView.tsx`)

```typescript
<InfiniteDailyCalendar
  events={events}
  // ... other props ...
  onEventUpdate={loadAgendaTasks}  // Reload tasks after drag-drop
/>
```

## 📊 Flow After Fix

### Drag Task from All Day to Time Slot:
```
1. User drags task from "All day" section to 14:30 time slot
   ↓
2. handleEventDrop() is triggered with new start/end times
   ↓
3. API call: PATCH /services_and_projects/tasks/{slug}/datetime/
   ↓
4. Backend updates task.start_datetime and task.end_datetime
   ↓
5. Frontend reloads agenda tasks via onEventUpdate callback
   ↓
6. Task now appears at 14:30 instead of "All day" section
```

### Resize Task:
```
1. User resizes task event (drags bottom edge to extend duration)
   ↓
2. handleEventResize() is triggered with new end time
   ↓
3. API call updates task.end_datetime
   ↓
4. Frontend reloads to show new duration
```

## 🎯 Features Enabled

✅ **Drag from All Day to Time Slot** - Tasks can be moved from all-day section to specific times
✅ **Drag between Time Slots** - Tasks can be moved between different time slots
✅ **Drag across Days** - Tasks can be dragged to different days in the calendar
✅ **Resize Events** - Task duration can be adjusted by dragging event edges
✅ **Automatic Reload** - Calendar refreshes after drag-drop to show updated times
✅ **Error Handling** - Shows alerts if drag-drop fails

## 🔧 Technical Details

### Files Modified:
1. `frontend/src/components/InfiniteDailyCalendar.tsx` - Added DnD support
2. `frontend/src/api/taskApi.ts` - Added updateTaskDatetime method
3. `frontend/src/components/views/AgendaView.tsx` - Connected reload callback
4. `services_and_projects/views.py` - Created update_task_datetime endpoint
5. `services_and_projects/urls.py` - Added URL route

### Dependencies:
- Uses `react-big-calendar` DnD addon (already included in package)
- No new npm packages required

### Backward Compatibility:
✅ All existing calendar functionality preserved
✅ Tasks without dates still show in all-day section
✅ No breaking changes to existing API endpoints

## 🧪 Testing

To test the drag-and-drop functionality:

1. Open Agenda view with tasks in "All day" section
2. Try dragging a task from "All day" to a specific time (e.g., 14:30)
3. Verify task moves to the correct time slot
4. Try dragging task to a different time
5. Try resizing the task by dragging its bottom edge
6. Try dragging task to a different day
7. Verify all changes persist after page reload

## 📝 Notes

- Drag-and-drop works with 30-minute time intervals (step=30)
- All datetime updates are stored in UTC and converted for display
- Permission checks ensure users can only drag their own tasks
- Failed drag operations show error alerts to the user

