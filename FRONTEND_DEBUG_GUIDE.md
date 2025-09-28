# 🔍 Debug Instructions for Task Tracker

## 🚀 Debug Workflow Rules

### ⚠️ CRITICAL: FRONTEND_DEBUG_GUIDE.md Purpose & Rules
- **THIS FILE IS FOR DEBUGGING ONLY** - not for system documentation or configuration
- **NEVER add system configurations** - use SYSTEM_DOCUMENTATION.md for that
- **NEVER add dependency lists** - use SYSTEM_DOCUMENTATION.md for that
- **NEVER add Docker/Vite configs** - use SYSTEM_DOCUMENTATION.md for that
- **ONLY document debugging methods, errors, and solutions** - keep focus on troubleshooting

### ⚠️ CRITICAL: FRONTEND_DEBUG_GUIDE.md Editing Rules
- **NEVER edit this file during active debugging** - it's a reference guide only
- **ONLY update this file AFTER successfully resolving problems** - document solutions for future use
- **ADD recommendations and improvements** - suggest what information would be useful to add
- **DOCUMENT successful solutions** - record what worked and what didn't
- **PRESERVE existing structure** - maintain the current organization and format

### 📚 Related Documentation
- **SYSTEM_DOCUMENTATION.md** - System configuration, dependencies, and setup
- **DEVELOPMENT_RULES.md** - Development workflow and coding standards

### ⚠️ CRITICAL: No Test Files Rule
- **NEVER create test files** during debugging process
- **ALWAYS work with existing files** and current codebase
- **Modify existing code** instead of creating new test instances
- **Use current project structure** for all debugging activities
- **Test with real components** that are already implemented

### 🎯 PRIORITY DEBUG METHODS (Use These First!)

#### 1. **Browser DevTools (PRIMARY METHOD)**
- **React DevTools Extension** - Install for Chrome/Firefox
- **Sources Tab with Breakpoints** - Set breakpoints in .tsx files
- **Elements Tab** - Inspect DOM and CSS
- **Network Tab** - Monitor API calls and resources
- **Performance Tab** - Profile component performance

#### 2. **React DevTools (RECOMMENDED)**
- **Components Tab** - See component tree and props/state
- **Profiler Tab** - Monitor re-renders and performance
- **Hooks Tab** - Inspect React hooks state
- **No code changes needed!**

#### 3. **Conditional Logging (WHEN NEEDED)**
- **URL Parameter**: `?debug=true` to enable debug logs
- **LocalStorage**: `localStorage.setItem('debug-enabled', 'true')`
- **Environment Variables**: Use `__DEBUG__` flag
- **Module-based**: Enable/disable specific modules

#### 4. **Performance Monitoring**
- **Performance API**: `performance.now()` for timing
- **React Profiler**: Built-in performance monitoring
- **Lighthouse**: Web vitals and performance audit

### ⚠️ CONSOLE.LOG RULES
- **LAST RESORT ONLY** - Use only when other methods fail
- **ALWAYS ASK FIRST** - "Can I add console.log for debugging?"
- **REMOVE IMMEDIATELY** - Delete logs after debugging
- **USE CONDITIONAL** - Wrap in debug flags when needed
- **NEVER COMMIT** - Don't leave logs in production code

### Phase 1: Pre-Debug Setup
1. **Check Docker Status**
   ```bash
   docker ps
   docker logs offerland-frontend
   ```

2. **Open Browser DevTools**
   - Press F12
   - Go to Console tab
   - Clear console (Ctrl+L)

3. **Enable Source Maps**
   - Go to Sources tab
   - Look for .tsx files in webpack://
   - Verify source maps are working

## 🔍 Modern Debug Process (Follow This Order!)

### Phase 2: Debug Process

#### Step 1: Browser DevTools Inspection
**Primary Method - No Code Changes Needed:**
1. **Open React DevTools**
   - Install React DevTools extension
   - Go to Components tab
   - Inspect TaskTracker component
   - Check props, state, and hooks

2. **Use Sources Tab with Breakpoints**
   ```javascript
   // Set breakpoints in:
   // - frontend/src/main.tsx (line 7, 14)
   // - frontend/src/components/TaskTracker.tsx (line 32, 98)
   // - static/js/task_tracker.js (line 213, 259)
   ```

3. **Network Tab Monitoring**
   - Check if React script loads: `localhost:5173/src/main.tsx`
   - Monitor API calls: `/task-tracker/api/...`
   - Verify CORS headers

#### Step 2: React DevTools Analysis
**Check Component State:**
- **selectedCategory**: Should be 'Agenda' by default
- **selectedSubcategory**: Should be empty string
- **isUpdating**: Should be false
- **Event Listeners**: Should be attached

**Check JSX Transform Status:**
- **Modern JSX**: Components should use automatic JSX transform (no React import needed)
- **JSX Runtime**: Check if `react/jsx-runtime` functions are being used
- **Import Analysis**: Verify no unused React imports in components
- **Transform Warnings**: Look for "outdated JSX transform" warnings in console

#### Step 3: DOM Inspection
**Elements Tab Check:**
- React mount point: `#react-task-tracker` exists
- Menu buttons: `.task_tracker_menu_item` present
- Event handlers: No `onclick` attributes (using addEventListener)

#### Step 4: Event Handler Testing (Using DevTools)
**Test each menu item using Browser DevTools:**

**Method 1: React DevTools Profiler**
1. Open React DevTools → Profiler tab
2. Click "Record" button
3. Click menu items (Touchpoint, Inbox, Agenda, etc.)
4. Stop recording
5. Analyze re-renders and performance

**Method 2: Sources Tab Breakpoints**
1. Set breakpoint in `TaskTracker.tsx` line 98 (handleExpandableMenuClick)
2. Click expandable menu items
3. Inspect variables in DevTools scope
4. Step through code execution

**Method 3: Event Listener Inspection**
1. Elements tab → Right-click menu button → "Inspect"
2. Event Listeners tab → Check for click handlers
3. Console tab → Type: `getEventListeners($0)`




#### Critical Errors (Fix Immediately)
- ❌ `React mount point not found` - HTML structure issue
- ❌ `Found expandable buttons 0` - Event handlers not attached
- ❌ TypeScript compilation errors - Code issues
- ❌ Network errors - Resource loading problems
- ❌ Component crashes - React rendering issues
- ❌ JSX Transform errors - Outdated JSX configuration
- ❌ `react/jsx-runtime` import errors - JSX runtime not available
- ❌ `PropTypes module does not provide default export` - Missing prop-types dependency
- ❌ `React is not defined` - Using React.createElement without React import
- ❌ `PrimeIcons 404 errors` - Font files not loading correctly

#### Warning Errors (Monitor)
- ⚠️ Deprecated API usage - Future compatibility
- ⚠️ Performance warnings - Optimization needed
- ⚠️ Console warnings - Non-critical issues
- ⚠️ Network timeouts - Slow loading
- ⚠️ "Outdated JSX transform" warning - Upgrade to modern JSX transform
- ⚠️ Unused React imports - Clean up after JSX transform upgrade

#### Info Messages (Track)
- ℹ️ Initialization logs - Normal operation
- ℹ️ State updates - Component changes
- ℹ️ User interactions - User actions
- ℹ️ Component renders - UI updates

### Phase 5: Debug Commands (Use These Instead of console.log)

#### Browser DevTools Console Commands
```javascript
// Check React component state (Use React DevTools instead)
// window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED

// Check HTML structure
document.getElementById('react-task-tracker')
document.querySelectorAll('[data-category]')

// Check event listeners
getEventListeners(document.querySelector('.task_tracker_menu_item'))

// Check PrimeReact components
document.querySelectorAll('[class*="p-"]')

// Performance monitoring
performance.mark('start-operation')
// ... your code ...
performance.mark('end-operation')
performance.measure('operation', 'start-operation', 'end-operation')
```

#### React DevTools Commands (Install Extension First)
```javascript
// In React DevTools Console tab:
// Access component instance
$r // Current selected component
$r.props // Component props
$r.state // Component state (if class component)

// Force re-render (for testing)
$r.forceUpdate()

// Access parent component
$r._owner // Parent component
```

#### Conditional Debug Commands (Only When Needed)
```javascript
// Enable debug mode via URL
// http://localhost:8000/task-tracker/?debug=true

// Enable debug mode via localStorage
localStorage.setItem('debug-enabled', 'true')
location.reload()

// Check if debug is enabled
localStorage.getItem('debug-enabled')

// Disable debug mode
localStorage.removeItem('debug-enabled')
```

#### Docker Commands
```bash
# Restart containers
docker-compose restart

# Rebuild frontend
docker-compose build frontend

# Check logs
docker logs -f offerland-frontend

# Enter container
docker exec -it offerland-frontend sh
```

#### JSX Transform Debug Commands
```javascript
// Check JSX Transform Status
// Look in Sources tab for compiled JSX code patterns:

// OLD Transform (Classic) - Should NOT see this:
// React.createElement('div', { className: 'test' }, 'Hello')

// NEW Transform (Automatic) - Should see this:
// import {jsx as _jsx} from 'react/jsx-runtime'
// _jsx('div', { className: 'test', children: 'Hello' })

// Check for unused React imports
document.querySelectorAll('script[type="module"]')
// Look for imports that are no longer needed

// Verify JSX runtime is available
console.log('JSX Runtime available:', typeof window !== 'undefined' && window.React)
```

#### PropTypes Debug Commands
```javascript
// Check if PropTypes is available
console.log('PropTypes available:', typeof PropTypes !== 'undefined');

// Check for PropTypes import errors in Network tab
// Look for: /node_modules/prop-types/index.js?v=...
// Should return 200 OK, not 404 or import errors

// Verify prop-types dependency is installed
// In container: npm list prop-types
```

### Phase 5: Debug Report Format

#### When Reporting Issues, Include:
1. **Console Logs** - Copy all console output
2. **Error Messages** - Red error text
3. **Steps to Reproduce** - What you clicked/did
4. **Expected Behavior** - What should happen
5. **Actual Behavior** - What actually happened
6. **Docker Status** - Container status
7. **Browser Info** - Browser version, OS

#### Report Template:
```
🐛 DEBUG REPORT

Issue: [Brief description]
Steps: 1. [Step 1] 2. [Step 2] 3. [Step 3]
Console: [Copy console logs]
Expected: [What should happen]
Actual: [What happened]
Docker: [Container status]
Browser: [Browser version]
```

## 🔧 Modern Debug Tools Setup

### 1. React DevTools (ESSENTIAL)
- **Install**: Chrome/Firefox extension
- **Components Tab**: Inspect component tree, props, state
- **Profiler Tab**: Monitor re-renders and performance
- **Hooks Tab**: Inspect React hooks state
- **Console Tab**: Access component instances with `$r`

### 2. Browser DevTools (PRIMARY)
- **Sources Tab**: Set breakpoints in .tsx files
- **Elements Tab**: Inspect DOM and CSS
- **Network Tab**: Monitor API calls and resources
- **Performance Tab**: Profile component performance
- **Application Tab**: Check localStorage, sessionStorage

### 3. Source Maps (ALREADY ENABLED)
- Vite automatically provides source maps
- Set breakpoints in original .tsx files
- Step through code line by line
- Inspect variables in real-time

### 4. Network Monitoring
- Check Network tab for failed requests
- Verify all resources load correctly
- Monitor loading times
- Check for 404 errors
- Verify CORS headers

### 5. Performance Monitoring
- **Performance API**: `performance.now()` for timing
- **React Profiler**: Built-in performance monitoring
- **Lighthouse**: Web vitals and performance audit
- **Bundle Analyzer**: Check bundle size and imports

## 🚨 Emergency Debugging

### When Nothing Works:
1. **Restart Everything**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

2. **Clear Browser Cache**
   - Hard refresh (Ctrl+Shift+R)
   - Clear site data in DevTools

3. **Check File Permissions**
   ```bash
   ls -la /home/dev/offerland/
   ```

4. **Verify Dependencies**
   ```bash
   docker exec -it offerland-frontend npm list
   ```

## 📈 Success Indicators

### Debug Success:
- ✅ All initialization logs present
- ✅ No console errors
- ✅ Event handlers working
- ✅ State updates successful
- ✅ UI responds correctly
- ✅ TypeScript compilation clean
- ✅ Modern JSX transform working (no "outdated JSX transform" warnings)
- ✅ No unused React imports in components
- ✅ JSX runtime functions properly imported from `react/jsx-runtime`

### Debug Failure:
- ❌ Missing initialization logs
- ❌ Console errors present
- ❌ Event handlers not working
- ❌ State updates failing
- ❌ UI not responding
- ❌ TypeScript errors
- ❌ "Outdated JSX transform" warnings in console
- ❌ Unused React imports causing bundle bloat
- ❌ JSX runtime import errors

## 🎯 Quick Debug Checklist

### Before Starting:
- [ ] Docker containers running
- [ ] Browser DevTools open
- [ ] Console cleared
- [ ] Source maps enabled

### During Debug:
- [ ] Monitor console logs
- [ ] Test all interactions
- [ ] Check for errors
- [ ] Verify state updates

### After Debug:
- [ ] Document findings
- [ ] Report issues
- [ ] Test fixes
- [ ] Update documentation

---

## 📚 Debug Resources

### Browser DevTools:
- **Console** - Logs and errors
- **Sources** - Source maps and breakpoints
- **Network** - Resource loading
- **Elements** - DOM inspection
- **Application** - Storage and cache

### React Debugging:
- **React DevTools** - Component inspection
- **Strict Mode** - Additional checks
- **Source Maps** - Original code debugging
- **Console Logging** - Custom debug output

### Docker Debugging:
- **Container Logs** - Application output
- **Container Status** - Running state
- **File System** - Code changes
- **Network** - Container communication

## 🚫 Debug Anti-Patterns

### What NOT to do during debugging:
- ❌ **Don't create test files** - Use existing codebase
- ❌ **Don't create mock components** - Debug real components
- ❌ **Don't create temporary files** - Work with current structure
- ❌ **Don't duplicate existing code** - Modify what exists
- ❌ **Don't create new test instances** - Use current project files
- ❌ **Don't add console.log immediately** - Try DevTools first
- ❌ **Don't leave console.log in code** - Remove after debugging
- ❌ **Don't commit debug logs** - Clean code before commit

### What TO do during debugging:
- ✅ **Use React DevTools first** - Primary debugging method
- ✅ **Set breakpoints in Sources tab** - Step through code
- ✅ **Use Elements tab** - Inspect DOM and event listeners
- ✅ **Use Network tab** - Monitor API calls and resources
- ✅ **Modify existing files** - Update current code
- ✅ **Use real components** - Debug actual implementation
- ✅ **Work with current structure** - Follow existing patterns
- ✅ **Test with real data** - Use actual project data
- ✅ **Debug incrementally** - Make small changes to existing code
- ✅ **Ask before adding console.log** - Get permission first
- ✅ **Remove debug logs immediately** - Clean up after debugging

## 📋 Console.log Rules (LAST RESORT ONLY)

### Before Adding console.log:
1. **Ask Permission**: "Can I add console.log for debugging?"
2. **Try DevTools First**: Use React DevTools, breakpoints, Elements tab
3. **Use Conditional Logging**: Wrap in debug flags
4. **Remove Immediately**: Delete after debugging
5. **Never Commit**: Clean code before pushing

### Conditional Logging Pattern:
```javascript
// Good: Conditional logging
if (localStorage.getItem('debug-enabled') === 'true') {
  console.log('Debug info:', data);
}

// Bad: Always logging
console.log('Debug info:', data);
```

### Emergency Console.log (Only When DevTools Fail):
```javascript
// Temporary debugging - REMOVE IMMEDIATELY
console.log('TEMPORARY DEBUG:', { variable, state, props });
```

---

## 🎯 Quick Debug Checklist

### Before Starting Debugging:
- [ ] **React DevTools installed** and working
- [ ] **Browser DevTools open** (F12)
- [ ] **Sources tab** - source maps enabled
- [ ] **Network tab** - monitoring requests
- [ ] **Console cleared** (Ctrl+L)
- [ ] **JSX Transform** - modern JSX transform enabled in config
- [ ] **TypeScript config** - `jsx: 'react-jsx'` and `jsxImportSource: 'react'`

### Debug Process (In Order):
1. [ ] **React DevTools** - Check component state
2. [ ] **Sources Tab** - Set breakpoints and check JSX transform
3. [ ] **Elements Tab** - Inspect DOM
4. [ ] **Network Tab** - Check API calls and JSX runtime imports
5. [ ] **Performance Tab** - Profile if needed
6. [ ] **JSX Transform Check** - Verify modern transform working
7. [ ] **Ask Permission** - Before adding console.log
8. [ ] **Conditional Logging** - If console.log needed
9. [ ] **Remove Logs** - Clean up immediately

### Success Indicators:
- ✅ React DevTools shows component tree
- ✅ Breakpoints hit and variables inspectable
- ✅ Event listeners attached correctly
- ✅ API calls successful in Network tab
- ✅ No console errors
- ✅ Clean code (no debug logs)
- ✅ No "outdated JSX transform" warnings
- ✅ JSX runtime functions imported correctly
- ✅ No unused React imports in bundle

---

**Remember:** Always follow this debug workflow for consistent and effective debugging!
**Priority:** React DevTools → Browser DevTools → Conditional Logging → Console.log (last resort)

---

## 📝 Recommendations for Future Updates

### What to Add to FRONTEND_DEBUG_GUIDE.md

#### 1. **New Error Patterns**
- Document new error messages encountered
- Add solutions that worked for specific problems
- Include troubleshooting steps for new technologies

#### 2. **Successful Debug Workflows**
- Record complete debug sequences that worked
- Document time-saving techniques
- Add shortcuts for common problems

#### 3. **Browser DevTools Techniques**
- New debugging methods discovered
- Console commands that provide useful information
- Network tab analysis techniques

#### 4. **Performance Debugging**
- Methods to identify performance bottlenecks
- Tools for analyzing bundle sizes
- Techniques for optimizing loading times

### What NOT to Add to FRONTEND_DEBUG_GUIDE.md

#### ❌ **System Documentation**
- Package.json dependencies
- Vite configuration files
- Docker setup instructions
- TypeScript configuration

#### ❌ **Setup Instructions**
- Installation commands
- Environment setup
- Build configurations
- Deployment procedures

#### ❌ **Code Examples**
- Working configurations
- Complete setup scripts
- System architecture
- Infrastructure details

**Use SYSTEM_DOCUMENTATION.md for all system-related information!**

### How to Update This File

1. **Wait until problem is completely resolved**
2. **Test the solution thoroughly**
3. **Document the exact steps that worked**
4. **Add any new insights or techniques**
5. **Preserve existing structure and organization**

### Example Update Format

```markdown
## 🔧 New Problem Type Debugging Guide

### Understanding [New Problem Type] Issues

#### Common [Problem Type] Problems

##### 1. [Specific Problem]
**Symptoms:**
```
[Exact error message]
```

**Causes:**
- [Root cause 1]
- [Root cause 2]

**Solutions:**
1. **[Solution 1]:**
   ```bash
   [Exact command that worked]
   ```

2. **[Solution 2]:**
   ```typescript
   // [Configuration that worked]
   ```

3. **[Solution 3]:**
   ```bash
   [Rebuild commands]
   ```
```

**Remember:** Only add information after confirming it works in practice!

---

## ⚠️ FINAL RULE: When to Edit This File

### ✅ EDIT ONLY WHEN:
- **Problem is completely resolved** and tested
- **Solution is proven to work** in practice
- **Adding new successful debugging techniques**
- **Documenting working configurations**
- **Updating with new error patterns and solutions**

### ❌ NEVER EDIT WHEN:
- **Actively debugging** a current problem
- **Problem is not fully resolved** yet
- **Testing potential solutions** that might not work
- **Adding untested information** or guesses
- **Making changes during troubleshooting**
- **Adding system documentation** - use SYSTEM_DOCUMENTATION.md instead
- **Adding configuration files** - use SYSTEM_DOCUMENTATION.md instead
- **Adding dependency lists** - use SYSTEM_DOCUMENTATION.md instead

### 📋 UPDATE CHECKLIST:
- [ ] Problem completely resolved
- [ ] Solution tested and verified
- [ ] All error messages eliminated
- [ ] Components working as expected
- [ ] No console errors or warnings
- [ ] Documentation reflects actual working state

**This file is a DEBUGGING REFERENCE GUIDE ONLY - keep it accurate and useful!**

## 🎯 FILE PURPOSE REMINDER

**FRONTEND_DEBUG_GUIDE.md** is **ONLY** for:
- ✅ Debugging methods and techniques
- ✅ Error patterns and solutions
- ✅ Troubleshooting workflows
- ✅ Browser DevTools usage
- ✅ Performance debugging

**FRONTEND_DEBUG_GUIDE.md** is **NOT** for:
- ❌ System configurations
- ❌ Dependencies and packages
- ❌ Docker/Vite setups
- ❌ Installation instructions
- ❌ Code examples

**Use SYSTEM_DOCUMENTATION.md for system-related information!**