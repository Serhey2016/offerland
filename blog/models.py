# blog/models.py

from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from PIL import Image
import os

def validate_title_image_resolution(image):
    """
    Валидатор для проверки, что изображение имеет разрешение 634x423 px.
    """
    try:
        img = Image.open(image)
        if img.width != 634 or img.height != 423:
            raise ValidationError("Изображение тайтла должно иметь разрешение 634x423 px.")
    except Exception as e:
        raise ValidationError("Невозможно обработать изображение. Проверьте его корректность.")

class BlogCategory(models.Model):
    name = models.CharField("название категории", max_length=50)

    class Meta:
        db_table = "blog_categories"
        verbose_name = "Категория блога"
        verbose_name_plural = "Категории блога"

    def __str__(self):
        return self.name

class AllArticles(models.Model):
    theme = models.CharField("тема", max_length=250)
    title_image = models.ImageField(
        "изображение тайтла",
        upload_to='articles/title_images/',
        validators=[validate_title_image_resolution],
        help_text="Изображение должно иметь разрешение 634x423 px."
    )
    article_text = models.TextField("текст-статьи")
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="создатель"
    )
    created_date = models.DateField("Дата создания", auto_now_add=True)
    published_date = models.DateField("Дата публикации")
    is_published = models.BooleanField("статус публикации", default=False)
    tags = models.ManyToManyField(
        "joblist.AllTags",
        verbose_name="теги",
        blank=True
    )
    category = models.ForeignKey(
        BlogCategory,
        on_delete=models.CASCADE,
        verbose_name="категория"
    )

    class Meta:
        db_table = "all_articles"
        verbose_name = "Статья"
        verbose_name_plural = "Все статьи"

    def __str__(self):
        return self.theme

    def save(self, *args, **kwargs):
        """
        Переопределяем метод save для автоматического изменения размера изображения,
        если оно не соответствует 634x423 px.
        """
        # Сохраняем объект, чтобы self.title_image.path был доступен.
        super().save(*args, **kwargs)

        if self.title_image:
            image_path = self.title_image.path
            try:
                img = Image.open(image_path)
                if img.width != 634 or img.height != 423:
                    # Меняем размер изображения до 634x423 px с сохранением качества
                    img = img.resize((634, 423), Image.ANTIALIAS)
                    img.save(image_path)
            except Exception as e:
                # В случае ошибки можно записать лог или выбросить исключение,
                # в зависимости от требований к обработке ошибок
                pass