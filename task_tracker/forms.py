from django import forms
from .models import Task, TaskComment

class TaskForm(forms.ModelForm):
    """Форма для создания и редактирования задач"""
    
    class Meta:
        model = Task
        fields = ['title', 'description', 'status', 'priority', 'due_date']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Введите название задачи'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Введите описание задачи'
            }),
            'status': forms.Select(attrs={
                'class': 'form-control'
            }),
            'priority': forms.Select(attrs={
                'class': 'form-control'
            }),
            'due_date': forms.DateTimeInput(attrs={
                'class': 'form-control',
                'type': 'datetime-local'
            }),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Добавляем CSS классы для стилизации
        for field_name, field in self.fields.items():
            if field_name != 'due_date':
                field.widget.attrs.update({'class': 'form-control'})

class TaskCommentForm(forms.ModelForm):
    """Форма для добавления комментариев к задачам"""
    
    class Meta:
        model = TaskComment
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Введите ваш комментарий...'
            }),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['content'].widget.attrs.update({'class': 'form-control'})

class TaskFilterForm(forms.Form):
    """Форма для фильтрации задач"""
    
    STATUS_CHOICES = [('', 'Все статусы')] + Task.STATUS_CHOICES
    PRIORITY_CHOICES = [('', 'Все приоритеты')] + Task.PRIORITY_CHOICES
    
    status = forms.ChoiceField(
        choices=STATUS_CHOICES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    priority = forms.ChoiceField(
        choices=PRIORITY_CHOICES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    search = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Поиск по названию...'
        })
    )
