
//   $(document).ready(function () {
//     // Подключение всплывающих окон с помощью bootstrap popover
//     $('.editable-popup').popover({
//       trigger: 'click',
//       html: true,
//       content: function () {
//         return $(this).data('content');
//       }
//     });

//     // Закрытие других popover при открытии
//     $('.editable-popup').on('shown.bs.popover', function () {
//       $('.editable-popup').not(this).popover('hide');
//     });

//     // Инициализация x-editable
//     $('.editable-popup').editable({
//       mode: 'inline',
//       type: 'text',
//       pk: 1, // ID записи, при необходимости заменить на реальный PK
//       url: '/update_field/', // Эндпоинт для сохранения изменений
//       title: 'Edit Field',
//     });
//   });
$(document).ready(function () {
    // Инициализация x-editable
    $('.editable-popup').editable({
      mode: 'inline',
      success: function(response, newValue) {
        if (!response.success) return response.msg; // Вывод ошибки при необходимости
      }
    });
  
    // Инициализация popover для "Company"
    $('[data-toggle="popover"]').popover({
      html: true,
      trigger: 'click',
      placement: 'right',
      sanitize: false
    }).on('shown.bs.popover', function () {
      const rowId = $(this).data('id');
      $(this).next('.popover').find('form').on('submit', function (e) {
        e.preventDefault();
        const formData = $(this).serializeArray();
        // Отправка данных на сервер через AJAX
        $.ajax({
          url: `/update_field/company/${rowId}/`,
          method: 'POST',
          data: formData,
          success: function (response) {
            if (response.success) {
              location.reload(); // Перезагрузка страницы для обновления данных
            } else {
              alert(response.error);
            }
          }
        });
      });
    });
  
    // Закрытие других popovers
    $('[data-toggle="popover"]').on('click', function () {
      $('[data-toggle="popover"]').not(this).popover('hide');
    });
  });

