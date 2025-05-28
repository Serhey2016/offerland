// Создаём конструктор нашего кастомного поля для ссылок
var LinkField = function(config) {
    jsGrid.Field.call(this, config);
};

// Наследуем от jsGrid.Field и определяем шаблоны для разных режимов
LinkField.prototype = new jsGrid.Field({

    // Режим отображения: возвращаем ссылку, если заданы и текст и URL
    itemTemplate: function(value) {
        // value – это объект, например: { LinkText: "Google", LinkUrl: "https://google.com" }
        if(value && value.LinkText && value.LinkUrl) {
            return $("<a>").attr("href", value.LinkUrl).text(value.LinkText);
        }
        return "";
    },

    // Шаблон для вставки (режим добавления новой строки)
    insertTemplate: function() {
        var $text = $("<input>")
            .attr("type", "text")
            .addClass("form-control")
            .attr("placeholder", "Link Text");
        var $url = $("<input>")
            .attr("type", "text")
            .addClass("form-control")
            .attr("placeholder", "Link URL");
        return $("<div>").append($text).append($url);
    },

    // Получаем значение из шаблона вставки
    insertValue: function() {
        var $inputs = this._insertControl.find("input");
        return {
            LinkText: $inputs.eq(0).val(),
            LinkUrl: $inputs.eq(1).val()
        };
    },

    // Шаблон для редактирования (показываем два инпута с текущими значениями)
    editTemplate: function(value) {
        var $text = $("<input>")
            .attr("type", "text")
            .addClass("form-control")
            .attr("placeholder", "Link Text")
            .val(value ? value.LinkText : "");
        var $url = $("<input>")
            .attr("type", "text")
            .addClass("form-control")
            .attr("placeholder", "Link URL")
            .val(value ? value.LinkUrl : "");
        return $("<div>").append($text).append($url);
    },

    // Получаем значение из шаблона редактирования
    editValue: function() {
        var $inputs = this._editControl.find("input");
        return {
            LinkText: $inputs.eq(0).val(),
            LinkUrl: $inputs.eq(1).val()
        };
    }
});

// Регистрируем наше поле в jsGrid
jsGrid.fields.linkField = LinkField;
