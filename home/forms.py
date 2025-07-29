from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.core.validators import RegexValidator
from django_countries import countries
from .models import CustomUser, UserProfile

class CustomUserCreationForm(UserCreationForm):
    """
    Form for creating new CustomUser instances
    """
    email = forms.EmailField(required=True)
    first_name = forms.CharField(required=True, max_length=30)
    last_name = forms.CharField(required=True, max_length=30)
    
    # UK-specific validators
    utr = forms.CharField(
        max_length=10,
        required=False,
        help_text="10-digit Unique Taxpayer Reference number",
        validators=[
            RegexValidator(
                regex=r'^\d{10}$',
                message='UTR must be exactly 10 digits'
            )
        ]
    )
    
    company_number = forms.CharField(
        max_length=8,
        required=False,
        help_text="8-digit UK company registration number",
        validators=[
            RegexValidator(
                regex=r'^\d{8}$',
                message='Company Number must be exactly 8 digits'
            )
        ]
    )
    
    phone_number = forms.CharField(
        max_length=20,
        required=False,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message='Phone number must be entered in the format: +999999999. Up to 15 digits allowed.'
            )
        ]
    )
    
    class Meta:
        model = CustomUser
        fields = (
            'username', 'email', 'password1', 'password2',
            'first_name', 'last_name', 'company_name', 'company_number',
            'website', 'utr', 'country', 'postal_code', 'city',
            'phone_number', 'avatar'
        )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set default country to UK
        self.fields['country'].initial = 'GB'
        
        # Make required fields more obvious
        for field_name in ['first_name', 'last_name', 'email']:
            self.fields[field_name].widget.attrs.update({
                'class': 'form-control required',
                'placeholder': f'Enter your {field_name.replace("_", " ").title()}'
            })
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email and CustomUser.objects.filter(email=email.lower()).exists():
            raise forms.ValidationError('A user with this email already exists.')
        return email.lower() if email else email
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email'].lower()
        if commit:
            user.save()
        return user


class CustomUserChangeForm(UserChangeForm):
    """
    Form for updating existing CustomUser instances
    """
    password = None  # Remove password field from change form
    
    class Meta:
        model = CustomUser
        fields = (
            'username', 'email', 'first_name', 'last_name',
            'company_name', 'company_number', 'website', 'utr',
            'country', 'postal_code', 'city', 'phone_number', 'avatar'
        )
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email:
            # Check if email exists for other users
            existing_user = CustomUser.objects.filter(email=email.lower()).exclude(pk=self.instance.pk)
            if existing_user.exists():
                raise forms.ValidationError('A user with this email already exists.')
        return email.lower() if email else email


class UserProfileForm(forms.ModelForm):
    """
    Form for updating UserProfile
    """
    class Meta:
        model = UserProfile
        fields = (
            'business_type', 'industry', 'company_size',
            'email_notifications', 'sms_notifications'
        )
        widgets = {
            'business_type': forms.Select(attrs={'class': 'form-control'}),
            'industry': forms.TextInput(attrs={'class': 'form-control'}),
            'company_size': forms.Select(attrs={'class': 'form-control'}),
            'email_notifications': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'sms_notifications': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }


class CustomUserProfileForm(forms.ModelForm):
    """
    Combined form for updating both CustomUser and UserProfile
    """
    # UserProfile fields
    business_type = forms.ChoiceField(
        choices=UserProfile._meta.get_field('business_type').choices,
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    industry = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    company_size = forms.ChoiceField(
        choices=UserProfile._meta.get_field('company_size').choices,
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    email_notifications = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    sms_notifications = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    
    class Meta:
        model = CustomUser
        fields = (
            'first_name', 'last_name', 'email', 'company_name',
            'company_number', 'website', 'utr', 'country',
            'postal_code', 'city', 'phone_number', 'avatar'
        )
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'company_name': forms.TextInput(attrs={'class': 'form-control'}),
            'company_number': forms.TextInput(attrs={'class': 'form-control'}),
            'website': forms.URLInput(attrs={'class': 'form-control'}),
            'utr': forms.TextInput(attrs={'class': 'form-control'}),
            'country': forms.Select(attrs={'class': 'form-control'}),
            'postal_code': forms.TextInput(attrs={'class': 'form-control'}),
            'city': forms.TextInput(attrs={'class': 'form-control'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-control'}),
            'avatar': forms.FileInput(attrs={'class': 'form-control'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk and hasattr(self.instance, 'profile'):
            # Pre-populate profile fields
            profile = self.instance.profile
            self.fields['business_type'].initial = profile.business_type
            self.fields['industry'].initial = profile.industry
            self.fields['company_size'].initial = profile.company_size
            self.fields['email_notifications'].initial = profile.email_notifications
            self.fields['sms_notifications'].initial = profile.sms_notifications
    
    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
            # Update profile
            profile = user.profile
            profile.business_type = self.cleaned_data.get('business_type', '')
            profile.industry = self.cleaned_data.get('industry', '')
            profile.company_size = self.cleaned_data.get('company_size', '')
            profile.email_notifications = self.cleaned_data.get('email_notifications', True)
            profile.sms_notifications = self.cleaned_data.get('sms_notifications', False)
            profile.save()
        return user 