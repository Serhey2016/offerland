console.log('🚀 Simple Test: Script loaded')

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Simple Test: DOM loaded, initializing simple test')
  
  setTimeout(() => {
    console.log('⏰ Simple Test: Checking if mount point exists...')
    
    const mountPoint = document.getElementById('react-task-tracker')
    if (!mountPoint) {
      console.error('❌ Simple Test: Mount point not found!')
      return
    }

    console.log('✅ Simple Test: Mount point found', mountPoint)

    try {
      console.log('🎯 Simple Test: Creating simple content')
      mountPoint.innerHTML = `
        <div style="padding: 20px; background-color: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; margin: 20px;">
          <h2 style="color: #1e40af; margin: 0 0 10px 0;">Simple Test Component</h2>
          <p style="color: #374151; margin: 0;">If you see this, the script is working!</p>
          <button onclick="alert('Button clicked!')" style="margin-top: 10px; padding: 8px 16px; background-color: #3b82f6; color: white; border: none; border-radius: 4px;">Test Button</button>
        </div>
      `
      console.log('✅ Simple Test: Simple content rendered successfully')
      
      // Test if content is working
      setTimeout(() => {
        const testButton = document.querySelector('button')
        if (testButton) {
          console.log('✅ Simple Test: Test button found, content is working!')
        } else {
          console.error('❌ Simple Test: Test button not found, content might not be working')
        }
      }, 1000)
    } catch (error) {
      console.error('❌ Simple Test: Error rendering content:', error)
    }
  }, 100)
})
