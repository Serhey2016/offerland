import interact from 'interactjs'

const app = document.getElementById('app')
const grid = document.createElement('div')
grid.className = 'grid'
grid.innerHTML = `
  <div class="cell" data-quadrant="q1">
    <h3>Важливо й Терміново</h3>
    <div class="items" id="q1"></div>
  </div>
  <div class="cell" data-quadrant="q2">
    <h3>Важливо й Не терміново</h3>
    <div class="items" id="q2"></div>
  </div>
  <div class="cell" data-quadrant="q3">
    <h3>Неважливо й Терміново</h3>
    <div class="items" id="q3"></div>
  </div>
  <div class="cell" data-quadrant="q4">
    <h3>Неважливо й Не терміново</h3>
    <div class="items" id="q4"></div>
  </div>
`
app.appendChild(grid)

function createItem(id, title) {
  const el = document.createElement('div')
  el.className = 'item'
  el.textContent = title
  el.dataset.id = id
  el.setAttribute('draggable', 'true')
  return el
}

document.getElementById('q2').appendChild(createItem('t1', 'Приклад задача'))

interact('.item').draggable({
  listeners: {
    move (event) {
      const target = event.target
      const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
      const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
      target.style.transform = `translate(${x}px, ${y}px)`
      target.setAttribute('data-x', x)
      target.setAttribute('data-y', y)
    },
    end (event) {
      event.target.style.transform = 'translate(0, 0)'
      event.target.removeAttribute('data-x')
      event.target.removeAttribute('data-y')
    }
  }
})

interact('.items').dropzone({
  ondrop (event) {
    const item = event.relatedTarget
    event.target.appendChild(item)
    // Тут згодом зробимо PATCH до DRF: importance/urgency за id списку
    console.log('moved to', event.target.id, 'task', item.dataset.id)
  }
})


