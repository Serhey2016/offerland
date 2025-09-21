# Development Rules for Offerland Project

## 🚨 IMPORTANT: Always Ask Before Making Changes

### Style Changes
- **NEVER change styles without explicit permission**
- Always ask: "Can I change the styles?" and specify what you want to change
- Preserve original design unless specifically requested to modify

### PrimeReact Components
- Use **real PrimeReact components** with proper classes
- For SpeedDial: use `direction="left"` for horizontal expansion (right to left)
- Use proper PrimeReact structure: `p-speeddial`, `p-speeddial-linear`, `p-speeddial-direction-left`

### Project Context
- Project runs in **Docker**
- All communication in **English**
- No test files creation
- Popups should NOT close when clicking outside
- For JS testing, provide "Allow pasting" command

### Code Quality
- Ask before creating new files
- Preserve existing functionality
- Test thoroughly before marking as complete
- Use proper error handling

### CSS and Styling Rules
- **NEVER use inline styles** (`style="..."`)
- **ALWAYS use CSS classes** for styling
- **Use IDs only for JavaScript/TypeScript** functionality
- **Separate concerns**: CSS for styling, IDs for JS, classes for styling
- **Example**: Use `className="my-component"` instead of `style="display: flex; gap: 10px;"`

## 🎯 Current Task Context
- Implementing PrimeReact SpeedDial for task tracker
- SpeedDial should expand horizontally from right to left
- Button located in `task_tracker_sub_menu_section`
- Using React CDN with Strict Mode and Source Maps

---
**Last Updated:** $(date)
**Status:** Active Development
