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
- **NO !important rules in CSS** - Use proper CSS specificity instead
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

### Django API Integration with Axios

#### When to Use Axios
- **API Communication**: All Django REST API calls
- **Data Fetching**: Loading tasks, categories, user data
- **CRUD Operations**: Create, Read, Update, Delete operations
- **Form Submissions**: Sending form data to Django
- **File Uploads**: Uploading files to Django backend
- **Authentication**: Login, logout, token management

#### Axios Configuration Rules
- **Base URL**: Always use `http://192.168.0.146:8000/api` for development
- **CSRF Tokens**: Automatically handled by axios interceptors
- **Error Handling**: Use try-catch blocks for all API calls
- **Loading States**: Always show loading indicators during API calls
- **TypeScript**: Use proper TypeScript interfaces for API responses

#### API Client Structure
```typescript
// api/client.ts - Base axios configuration
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://192.168.0.146:8000/api',
  headers: { 'Content-Type': 'application/json' }
})

// CSRF token interceptor
api.interceptors.request.use(config => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1]
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken
  }
  return config
})
```

#### API Service Rules
- **Separate Files**: Create separate files for each API endpoint (`taskApi.ts`, `categoryApi.ts`)
- **TypeScript Interfaces**: Define interfaces for all API requests/responses
- **Error Handling**: Implement proper error handling in each API function
- **Custom Hooks**: Use custom hooks (`useTasks`, `useCategories`) for state management

#### When NOT to Use Axios
- **Static Data**: Hardcoded configuration data
- **Local Storage**: Browser storage operations
- **URL Parameters**: Reading query parameters
- **Client-side Logic**: Pure frontend calculations
- **Third-party APIs**: External services (use fetch or specific SDKs)

### PrimeReact & UI Libraries Best Practices

#### Component Import Rules
- **Tree-shaking Optimization**: Import only needed components from libraries
- **Individual Imports**: Use specific imports instead of wildcard imports
- **Vite Optimization**: Let Vite optimize bundle size automatically

#### PrimeReact Import Examples
```typescript
// ✅ CORRECT - Individual imports (tree-shaking friendly)
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dialog } from 'primereact/dialog'
import { Menu } from 'primereact/menu'

// ❌ WRONG - Wildcard import (increases bundle size)
import * as PrimeReact from 'primereact'
```

#### PrimeFlex Grid System
```typescript
// ✅ CORRECT - Use PrimeFlex classes for layout
<div className="p-d-flex p-justify-center p-align-center">
  <div className="p-col-12 p-md-6 p-lg-4">
    <Button label="Click me" icon="pi pi-check" />
  </div>
</div>

// ❌ WRONG - Inline styles
<div style={{ display: 'flex', justifyContent: 'center' }}>
  <div style={{ width: '50%' }}>
    <Button label="Click me" />
  </div>
</div>
```

#### TypeScript Integration
- **Full TypeScript Support**: All PrimeReact components are fully typed
- **Props Autocomplete**: VS Code shows all available props
- **Type Safety**: Compile-time error checking for component props
- **Interface Definitions**: Use proper TypeScript interfaces

#### Component Usage Examples
```typescript
// Button with PrimeIcons
<Button 
  label="Submit" 
  icon="pi pi-check" 
  className="p-button-success"
  onClick={handleSubmit}
/>

// DataTable with columns
<DataTable value={data} paginator rows={10}>
  <Column field="name" header="Name" />
  <Column field="email" header="Email" />
  <Column field="status" header="Status" />
</DataTable>

// Dialog with PrimeFlex layout
<Dialog 
  header="Edit Task" 
  visible={visible} 
  onHide={onHide}
  className="p-fluid"
>
  <div className="p-field">
    <label htmlFor="title">Title</label>
    <InputText id="title" value={title} onChange={onTitleChange} />
  </div>
</Dialog>
```

#### Library Integration Rules
- **PrimeReact**: Primary UI component library
- **PrimeIcons**: Icon library (use `pi pi-icon-name` classes)
- **PrimeFlex**: Grid system and utility classes
- **Chart.js**: Data visualization (when needed)
- **Moment.js**: Date manipulation (for calendar components)
- **Quill**: Rich text editor (for text editing features)

#### Performance Optimization
- **Lazy Loading**: Load components only when needed
- **Code Splitting**: Split large components into smaller chunks
- **Bundle Analysis**: Monitor bundle size with Vite
- **Tree Shaking**: Import only used components

#### Testing in Development
- **Dev Mode**: Always test with `npm run dev`
- **HMR**: Use Hot Module Replacement for faster development
- **Browser DevTools**: Check component rendering and props
- **TypeScript Compiler**: Ensure no type errors

---
**Last Updated:** $(date)
**Status:** Active Development
