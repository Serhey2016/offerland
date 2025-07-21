document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.project-form');
    const saveBtn = document.querySelector('.btn.btn-secondary');
    const modalOverlay = document.querySelector('.modal-overlay');

    if (form && saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Собираем данные формы
            const formData = new FormData(form);

            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => {
                // Пытаемся распарсить JSON, если не получится — ошибка
                return response.json().catch(() => ({success: false, error: 'Некорректный ответ сервера'}));
            })
            .then(data => {
                // Закрываем popup
                if (modalOverlay) modalOverlay.style.display = 'none';

                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Saved!',
                        text: 'Data saved successfully.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: data.error || 'Failed to save data.'
                    });
                }
            })
            .catch(error => {
                if (modalOverlay) modalOverlay.style.display = 'none';
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'There was an error submitting the form.'
                });
            });
        });
    }
});
