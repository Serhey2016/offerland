import React, { useState, useEffect, useRef } from 'react'
import { Button } from 'primereact/button'
import { Menu } from 'primereact/menu'
import { categoryApi, Category, Subcategory } from '../api/categoryApi'
import { taskApi, Task } from '../api/taskApi'

// SubMenuSection з інтеграцією Django API
const SubMenuSectionWithAPI: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  
  const filterMenuRef = useRef<Menu>(null)
  const addMenuRef = useRef<Menu>(null)

  // Завантаження категорій при ініціалізації
  useEffect(() => {
    loadCategories()
  }, [])

  // Завантаження підкатегорій при зміні категорії
  useEffect(() => {
    if (selectedCategory) {
      loadSubcategories(selectedCategory)
      loadTasksByCategory(selectedCategory)
    }
  }, [selectedCategory])

  // Завантаження категорій
  const loadCategories = async () => {
    try {
      setLoading(true)
      const categoriesData = await categoryApi.getCategories()
      setCategories(categoriesData)
      
      // Встановлюємо першу категорію як активну
      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].slug)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  // Завантаження підкатегорій
  const loadSubcategories = async (categorySlug: string) => {
    try {
      const category = categories.find(cat => cat.slug === categorySlug)
      if (category) {
        const subcategoriesData = await categoryApi.getSubcategories(category.id)
        setSubcategories(subcategoriesData)
      }
    } catch (error) {
      console.error('Error loading subcategories:', error)
    }
  }

  // Завантаження задач по категорії
  const loadTasksByCategory = async (categorySlug: string) => {
    try {
      const tasksData = await taskApi.getTasksByCategory(categorySlug)
      setTasks(tasksData)
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  // Обробка кліку по категорії
  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategory(categorySlug)
    
    // Відправляємо подію для основного TaskTracker
    window.dispatchEvent(new CustomEvent('taskTrackerCategoryChange', {
      detail: { category: categorySlug }
    }))
  }

  // Обробка кліку по підкатегорії
  const handleSubcategoryClick = (subcategorySlug: string) => {
    window.dispatchEvent(new CustomEvent('submenuItemClick', {
      detail: { subcategory: subcategorySlug }
    }))
  }

  // Створення нової задачі
  const handleCreateTask = async (taskType: string) => {
    try {
      const newTask = await taskApi.createTask({
        title: `Нова ${taskType}`,
        description: `Опис для ${taskType}`,
        category: selectedCategory,
        priority: 'medium',
        status: 'pending'
      })
      
      // Оновлюємо список задач
      setTasks(prev => [...prev, newTask])
      
      console.log(`Створено нову задачу: ${taskType}`)
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  // Фільтрація задач
  const handleFilterTasks = async (filterType: string) => {
    try {
      let filters = {}
      
      switch (filterType) {
        case 'active':
          filters = { status: 'in-progress' }
          break
        case 'completed':
          filters = { status: 'completed' }
          break
        case 'high-priority':
          filters = { priority: 'high' }
          break
        default:
          filters = {}
      }
      
      const filteredTasks = await taskApi.getTasks(filters)
      setTasks(filteredTasks)
      
      console.log(`Фільтр застосовано: ${filterType}`)
    } catch (error) {
      console.error('Error filtering tasks:', error)
    }
  }

  // Меню для фільтрів
  const filterMenuItems = [
    {
      label: 'Всі задачі',
      icon: 'pi pi-filter',
      command: () => handleFilterTasks('all')
    },
    {
      label: 'Активні',
      icon: 'pi pi-check-circle',
      command: () => handleFilterTasks('active')
    },
    {
      label: 'Завершені',
      icon: 'pi pi-check',
      command: () => handleFilterTasks('completed')
    },
    {
      label: 'Високий пріоритет',
      icon: 'pi pi-exclamation-triangle',
      command: () => handleFilterTasks('high-priority')
    }
  ]

  // Меню для додавання
  const addMenuItems = [
    {
      label: 'Додати задачу',
      icon: 'pi pi-plus',
      command: () => handleCreateTask('задача')
    },
    {
      label: 'Додати проект',
      icon: 'pi pi-briefcase',
      command: () => handleCreateTask('проект')
    },
    {
      label: 'Додати контакт',
      icon: 'pi pi-user',
      command: () => handleCreateTask('контакт')
    },
    {
      label: 'Додати нотатку',
      icon: 'pi pi-file-edit',
      command: () => handleCreateTask('нотатка')
    }
  ]

  if (loading) {
    return <div>Завантаження меню...</div>
  }

  return (
    <div className="task_tracker_sub_menu_section">
      {/* Кнопка фільтру */}
      <div className="task_tracker_sub_menu_filter_container">
        <Button
          className="task_tracker_sub_menu_filter_btn"
          onClick={() => filterMenuRef.current?.toggle()}
          icon="pi pi-filter"
          text
          aria-label="Фільтри"
        />
        <Menu
          model={filterMenuItems}
          popup
          ref={filterMenuRef}
          className="task_tracker_filter_menu"
          hideOverlaysOnDocumentScrolling={false}
        />
      </div>

      {/* Навігація по категоріях */}
      <div className="task_tracker_sub_menu_scrollable_container">
        <div className="task_tracker_sub_menu_navigation_items">
          {categories.map(category => (
            <button
              key={category.id}
              className={`task_tracker_sub_menu_nav_btn ${
                selectedCategory === category.slug ? 'active' : ''
              }`}
              onClick={() => handleCategoryClick(category.slug)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Підкатегорії */}
      {subcategories.length > 0 && (
        <div className="task_tracker_sub_menu_subcategories">
          {subcategories.map(subcategory => (
            <button
              key={subcategory.id}
              className="task_tracker_sub_menu_subcategory_btn"
              onClick={() => handleSubcategoryClick(subcategory.slug)}
            >
              {subcategory.name}
            </button>
          ))}
        </div>
      )}

      {/* Кнопка додавання */}
      <div className="task_tracker_sub_menu_add_container">
        <Button
          className="task_tracker_sub_menu_add_btn"
          onClick={() => addMenuRef.current?.toggle()}
          icon="pi pi-plus"
          text
          aria-label="Додати"
        />
        <Menu
          model={addMenuItems}
          popup
          ref={addMenuRef}
          className="task_tracker_add_menu"
          hideOverlaysOnDocumentScrolling={false}
        />
      </div>

      {/* Статистика */}
      <div className="task_tracker_stats">
        <p>Задач: {tasks.length}</p>
        <p>Категорій: {categories.length}</p>
        <p>Підкатегорій: {subcategories.length}</p>
      </div>
    </div>
  )
}

export default SubMenuSectionWithAPI
