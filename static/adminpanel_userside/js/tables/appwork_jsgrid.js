


$(function () {
    
    
    
    
    
    let maxNumber = 0; // Хранение текущего максимального номера

    $("#jsGrid").jsGrid({
        width: "100%",
        height: "auto",
        inserting: true,
        editing: true,
        sorting: true,
        paging: true,
        autoload: false, // Отключаем автоматическую загрузку данных
        noDataContent: "", // Убираем текст "Not found" или подобные строки
        pageSize: 10,
        pageButtonCount: 5,
        deleteConfirm: "Do you really want to delete the row?",
        data: [], // Начинаем с пустых данных
        controller: {
            loadData: function () {
                return []; // Возвращаем пустой массив данных
            },
            insertItem: function (item) {
                maxNumber++; // Увеличиваем номер
                item.Number = maxNumber; // Присваиваем следующий номер
                // Обратите внимание, что для столбца "JobTitle" теперь ожидается объект вида:
                // { LinkText: "Текст ссылки", LinkUrl: "https://адрес-ссылки" }
                return item;
            },
            updateItem: function (item) {
                return item;
            },
            deleteItem: function (item) {
                return item;
            }
        },
        fields: [
            { name: "Number", title: "Number", type: "number", width: 50, readOnly: true },
            {
                name: "Status",
                title: "Status",
                type: "select",
                items: [
                    { Name: "Saved", Id: 1 },
                    { Name: "Review", Id: 2 },
                    { Name: "Applied", Id: 3 },
                    { Name: "Interviewing", Id: 4 },
                    { Name: "Negotiating", Id: 5 },
                    { Name: "Accepted", Id: 6 },
                    { Name: "Rejected", Id: 7 }
                ],
                valueField: "Id",
                textField: "Name",
                width: 100
            },
            {
                // Здесь используем наше кастомное поле
                name: "JobTitle",
                title: "Job Title",
                type: "linkField", // наш новый тип поля
                width: 150
            },
            {
                name: "CompanyContacts",
                title: "Company and Contacts",
                type: "text",
                width: 150
            },
            {
                name: "Interview",
                title: "Interview",
                type: "text",
                width: 150
            },
            {
                name: "Date",
                title: "Date",
                type: "text",
                width: 100,
                readOnly: true
            },
            {
                name: "DigitalDocuments",
                title: "Digital Documents",
                type: "text",
                width: 150
            },
            {
                type: "control",
                modeSwitchButton: false,
                editButton: false,
                deleteButton: false,
                headerTemplate: function () {
                    // Только иконка "+" для добавления новой строки
                    const $addIcon = $("<i>")
                        .addClass("material-icons md-plus")
                        .text("add")
                        .click(() => {
                            $("#jsGrid").jsGrid("insertItem", {});
                        });
                    return $addIcon;
                },
                itemTemplate: function (_, item) {
                    // Только иконка корзины для удаления строки
                    const $deleteIcon = $("<i>")
                        .addClass("material-icons md-delete")
                        .text("") // Убираем текст "delete"
                        .click(() => {
                            $("#jsGrid").jsGrid("deleteItem", item);
                        });
                    return $deleteIcon;
                }
            }
        ]
    });
});
