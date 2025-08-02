# Alertify.js Integration for Task Feed Notifications

This directory contains the integration code for alertify.js library to handle notifications in the task feed.

## Files

- `alertify.js` - Main alertify library
- `alertify.min.js` - Minified version
- `alertify_integra.js` - Integration code for task feed notifications
- `alertify_integra.css` - Custom styling for notifications

## Features

### Notifications
- **Save Success**: Shows "Notes saved successfully!" when notes are saved
- **Save Error**: Shows error message with specific reason if save fails
- **Cancel**: Shows "Changes to notes were not saved" when canceling

### Configuration
- Notifications appear in top-right corner
- 5-second display duration
- Responsive design for mobile devices
- Custom styling with animations

### Integration
- Overrides existing `showNotification` function
- Works with existing task feed functionality
- Maintains backward compatibility
- English language messages only

## Usage

The integration automatically initializes when the page loads. No additional setup required.

### Notification Types
- `success` - Green notification for successful operations
- `error` - Red notification for errors
- `warning` - Yellow notification for warnings
- `message` - Blue notification for info messages

### Example
```javascript
// Show a success notification
showNotification('Notes saved successfully!', 'success');

// Show an error notification
showNotification('Failed to save notes', 'error');

// Show a warning notification
showNotification('Changes were not saved', 'warning');
```

## Dependencies
- alertify.js library
- Existing task feed functionality in tasks_projects_tenders.js
- Django backend with save_task_notes view 