from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django_countries.fields import CountryField
import uuid

# Create your models here.

class CustomUser(AbstractUser):
    """
    Custom User model for UK-based business users
    """
    
    # Basic user information
    avatar = models.ImageField(
        upload_to='user_avatars/',
        null=True,
        blank=True,
        verbose_name="Profile Picture"
    )
    
    # Company information
    company_name = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Company Name"
    )
    
    company_number = models.CharField(
        max_length=8,
        blank=True,
        verbose_name="Company Number",
        help_text="8-digit UK company registration number"
    )
    
    website = models.URLField(
        blank=True,
        verbose_name="Website"
    )
    
    # UK-specific fields
    utr = models.CharField(
        max_length=10,
        blank=True,
        verbose_name="UTR (Unique Taxpayer Reference)",
        help_text="10-digit Unique Taxpayer Reference number",
        validators=[
            RegexValidator(
                regex=r'^\d{10}$',
                message='UTR must be exactly 10 digits'
            )
        ]
    )
    
    # Address fields
    country = CountryField(
        default='GB',
        verbose_name="Country/Region"
    )
    
    postal_code = models.CharField(
        max_length=10,
        blank=True,
        verbose_name="Postal Code",
        help_text="UK postal code"
    )
    
    city = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="City"
    )
    
    # Contact information
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Phone Number",
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message='Phone number must be entered in the format: +999999999. Up to 15 digits allowed.'
            )
        ]
    )
    
    # Additional fields
    is_verified = models.BooleanField(
        default=False,
        verbose_name="Email Verified"
    )
    
    date_joined = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date Joined"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Last Updated"
    )
    
    # Unique identifier for API access
    api_key = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        verbose_name="API Key"
    )
    
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        db_table = 'custom_user'
    
    def __str__(self):
        if self.company_name:
            return f"{self.get_full_name()} - {self.company_name}"
        return self.get_full_name() or self.username
    
    def get_full_name(self):
        """
        Return the first_name plus the last_name, with a space in between.
        """
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()
    
    def get_short_name(self):
        """
        Return the short name for the user.
        """
        return self.first_name
    
    @property
    def display_name(self):
        """
        Return the display name for the user.
        """
        if self.get_full_name():
            return self.get_full_name()
        return self.username
    
    def save(self, *args, **kwargs):
        # Ensure email is lowercase
        if self.email:
            self.email = self.email.lower()
        super().save(*args, **kwargs)
    
    def get_default_avatar_emoji(self):
        """
        Возвращает случайный эмодзи-аватар для пользователя без загруженной аватарки
        """
        import random
        default_emojis = ['🐼', '👤', '🐻', '🐯', '🐻‍❄️']
        # Возвращаем случайный эмодзи без привязки к ID
        return random.choice(default_emojis)


class UserProfile(models.Model):
    """
    Extended profile information for users
    """
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    
    # Additional business information
    business_type = models.CharField(
        max_length=50,
        blank=True,
        choices=[
            ('sole_trader', 'Sole Trader'),
            ('partnership', 'Partnership'),
            ('limited_company', 'Limited Company'),
            ('llp', 'Limited Liability Partnership'),
            ('other', 'Other'),
        ],
        verbose_name="Business Type"
    )
    
    industry = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Industry"
    )
    
    company_size = models.CharField(
        max_length=20,
        blank=True,
        choices=[
            ('1-10', '1-10 employees'),
            ('11-50', '11-50 employees'),
            ('51-200', '51-200 employees'),
            ('201-500', '201-500 employees'),
            ('500+', '500+ employees'),
        ],
        verbose_name="Company Size"
    )
    
    # Preferences
    email_notifications = models.BooleanField(
        default=True,
        verbose_name="Email Notifications"
    )
    
    sms_notifications = models.BooleanField(
        default=False,
        verbose_name="SMS Notifications"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
        db_table = 'user_profile'
    
    def __str__(self):
        return f"Profile for {self.user.display_name}"
