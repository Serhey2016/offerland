document.addEventListener("DOMContentLoaded", function() {
    const shareBtn = document.getElementById("share-btn");
    const modal = document.getElementById("share-modal");
    const closeModal = document.getElementById("close-modal");
    const copyBtn = document.getElementById("copy-btn");
    const copyMessage = document.querySelector(".copy-message");
    const shareLink = document.getElementById("share-link");

    // Автоматически вставляем текущий URL
    shareLink.value = window.location.href;

    // Открытие модального окна
    shareBtn.addEventListener("click", function(event) {
        event.preventDefault();
        modal.style.display = "flex";
    });

    // Закрытие модального окна
    closeModal.addEventListener("click", function() {
        modal.style.display = "none";
    });

    // Закрытие при клике на фон
    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Копирование ссылки
    copyBtn.addEventListener("click", function() {
        navigator.clipboard.writeText(shareLink.value).then(() => {
            copyMessage.style.display = "block";
            setTimeout(() => {
                copyMessage.style.display = "none";
            }, 2000);
        }).catch(err => console.error("Ошибка копирования:", err));
    });
});
