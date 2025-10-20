
// Скрипт видимости иконок редактирования
document.addEventListener('DOMContentLoaded', function () {
  const toggleButton = document.getElementById('toggleEditIcons');
  const editIcons = document.querySelectorAll('[data-toggle-icons]');

  let iconsVisible = false;

  toggleButton.addEventListener('click', function () {
    iconsVisible = !iconsVisible; // Переключение состояния
    editIcons.forEach(icon => {
      icon.style.display = iconsVisible ? 'inline' : 'none';
    });
  });
});

// Скрипт для отображения, редактирования полей в таблице . Иконка карандаша

// document.addEventListener('DOMContentLoaded', function () {
//   const editIcons = document.querySelectorAll('[data-toggle-icons]');
//   const popup = document.getElementById('editPopup');
//   const overlay = document.getElementById('overlay');
//   const closePopupButton = document.getElementById('closePopup');
//   const editForm = document.getElementById('editForm');

//   // Открытие popup
//   editIcons.forEach(icon => {
//     icon.addEventListener('click', function () {
//       const id = this.dataset.id;
//       const jobTitle = this.dataset.jobTitle;
//       const jobTitleLink = this.dataset.jobTitleLink;

//       document.getElementById('editId').value = id;
//       document.getElementById('editJobTitle').value = jobTitle;
//       document.getElementById('editJobTitleLink').value = jobTitleLink;

//       popup.style.display = 'block';
//       overlay.style.display = 'block';
//     });
//   });

//   // Закрытие popup
//   closePopupButton.addEventListener('click', function () {
//     popup.style.display = 'none';
//     overlay.style.display = 'none';
//   });

//   // Отправка данных через AJAX
//   editForm.addEventListener('submit', function (e) {
//     e.preventDefault();

//     const formData = new FormData(this);

//     fetch(updateVacancyUrl, {
//       method: 'POST',
//       body: formData,
//       headers: {
//         'X-CSRFToken': getCookie('csrftoken')
//       }
//     })
//       .then(response => response.json())
//       .then(data => {
//         if (data.success) {
//           alert('Vacancy updated successfully!');
//           location.reload(); // Обновление страницы после успешного сохранения
//         } else {
//           alert('Error updating vacancy.');
//         }
//       })
//       .catch(error => console.error('Error:', error));
//   });

//   // Функция для получения CSRF-токена
//   function getCookie(name) {
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//       const cookies = document.cookie.split(';');
//       for (let i = 0; i < cookies.length; i++) {
//         const cookie = cookies[i].trim();
//         if (cookie.substring(0, name.length + 1) === (name + '=')) {
//           cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//           break;
//         }
//       }
//     }
//     return cookieValue;
//   }
// });

document.addEventListener('DOMContentLoaded', function () {
  const editIcons = document.querySelectorAll('[data-toggle-icons]');
  const jobTitlePopup = document.getElementById('editPopup');
  const statusPopup = document.getElementById('editStatusPopup');
  const overlay = document.getElementById('overlay');
  const closeJobTitlePopupButton = document.getElementById('closePopup');
  const closeStatusPopupButton = document.getElementById('closeStatusPopup');
  const editJobTitleForm = document.getElementById('editForm');
  const editStatusForm = document.getElementById('editStatusForm');

  // Открытие popup
  editIcons.forEach(icon => {
    icon.addEventListener('click', function () {
      const field = this.dataset.field;
      const id = this.dataset.id || ''; // Убедимся, что id не undefined

      if (field === 'job_title') {
        const jobTitle = this.dataset.jobTitle || ''; // Значение по умолчанию, если undefined
        const jobTitleLink = this.dataset.jobTitleLink || ''; // Значение по умолчанию

        document.getElementById('editId').value = id;
        document.getElementById('editJobTitle').value = jobTitle;
        document.getElementById('editJobTitleLink').value = jobTitleLink;

        jobTitlePopup.style.display = 'block';
        overlay.style.display = 'block';
      } else if (field === 'status') {
        const statusId = this.dataset.statusId || '1'; // Значение по умолчанию, если undefined

        document.getElementById('editStatusId').value = id;
        document.getElementById('editStatusSelect').value = statusId;

        statusPopup.style.display = 'block';
        overlay.style.display = 'block';
      }
    });
  });

  // Закрытие popup для job title
  closeJobTitlePopupButton.addEventListener('click', function () {
    jobTitlePopup.style.display = 'none';
    overlay.style.display = 'none';
  });

  // Закрытие popup для status
  closeStatusPopupButton.addEventListener('click', function () {
    statusPopup.style.display = 'none';
    overlay.style.display = 'none';
  });

  // Отправка данных через AJAX для job title
  editJobTitleForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    fetch(updateVacancyUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRFToken': getCookie('csrftoken')
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Vacancy updated successfully!');
          location.reload();
        } else {
          alert('Error updating vacancy: ' + (data.error || 'Unknown error'));
        }
      })
      .catch(error => console.error('Error:', error));
  });

  // Отправка данных через AJAX для status
  editStatusForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    fetch(updateVacancyUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRFToken': getCookie('csrftoken')
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Status updated successfully!');
          location.reload();
        } else {
          alert('Error updating status: ' + (data.error || 'Unknown error'));
        }
      })
      .catch(error => console.error('Error:', error));
  });

  // Функция для получения CSRF-токена
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
});