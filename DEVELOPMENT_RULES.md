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
- All communication in chat AI in Ukrainian
- No test files creation
- Popups should NOT close when clicking outside
- For JS testing, provide "Allow pasting" command
- All website content and UI elements must be in English only

### Code Quality
- Ask before creating new files
- Preserve existing functionality
- Test thoroughly before marking as complete
- Use proper error handling
- **NEVER create unnecessary files or components** - check existing codebase first
- **Respect existing React components** - don't create duplicates or unnecessary additions
- **For errors: Always keep console.error** - error logs are essential for debugging

### CSS and Styling Rules
- **NEVER use inline styles** (`style="..."`)
- **ALWAYS use CSS classes** for styling
- **Use IDs only for JavaScript/TypeScript** functionality
- **Separate concerns**: CSS for styling, IDs for JS, classes for styling
- **Example**: Use `className="my-component"` instead of `style="display: flex; gap: 10px;"`

## 🎯 Current Task Context

### React DevTools Integration
- **react-devtools**: ^4.28.0 - Added to devDependencies for React debugging
- **Usage**: Run `npm run react-devtools` to start React Developer Tools
- **Docker**: Automatically installed in frontend container during build
- **TypeScript Support**: Full TypeScript support for React components debugging

### JSX Transform Configuration (React 17+)
- **Modern JSX Transform**: Use `jsx: 'react-jsx'` in TypeScript config
- **Vite Configuration**: Set `jsxRuntime: 'automatic'` and `jsxImportSource: 'react'`
- **Benefits**: No need to import React in every JSX file, better performance
- **Automatic Import**: React JSX runtime functions auto-imported from `react/jsx-runtime`
- **Backward Compatibility**: Old transform still supported, upgrade is optional
- **Code Changes**: No JSX syntax changes required, only configuration updates

#### JSX Transform Setup:
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}

// vite.config.ts
export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
    jsxImportSource: 'react'
  })]
})
```

#### Before vs After JSX Transform:
```typescript
// OLD (Classic Transform) - Requires React import
import React from 'react';
function App() {
  return <h1>Hello World</h1>;
}
// Compiles to: React.createElement('h1', null, 'Hello World');

// NEW (Automatic Transform) - No React import needed
function App() {
  return <h1>Hello World</h1>;
}
// Compiles to: import {jsx as _jsx} from 'react/jsx-runtime'; _jsx('h1', { children: 'Hello World' });
```

---
**Last Updated:** $(date)
**Status:** Active Development
