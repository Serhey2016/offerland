const SimpleTest = () => {
  console.log('🚀 SimpleTest: Component starting to render')
  
  return {
    type: 'div',
    props: {
      style: {
        padding: '20px',
        backgroundColor: '#f0f9ff',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        margin: '20px'
      }
    },
    children: [
      {
        type: 'h2',
        props: { style: { color: '#1e40af', margin: '0 0 10px 0' } },
        children: 'Simple Test Component'
      },
      {
        type: 'p',
        props: { style: { color: '#374151', margin: '0' } },
        children: 'If you see this, React is working!'
      }
    ]
  }
}

export default SimpleTest
