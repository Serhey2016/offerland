import React from 'react'

const SimpleTest = () => {
  console.log('🚀 SimpleTest: Component rendered')
  
  return React.createElement('div', { 
    style: { padding: '20px', border: '2px solid red', margin: '10px' } 
  }, 
    React.createElement('h2', null, 'Simple Test Component'),
    React.createElement('p', null, 'This is a simple test to verify React is working')
  )
}

export default SimpleTest
