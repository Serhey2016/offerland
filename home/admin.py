from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import CustomUser, UserProfile

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'

class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'company_name', 'is_verified', 'is_staff', 'date_joined', 'get_avatar_preview')
    list_filter = ('is_verified', 'is_staff', 'is_superuser', 'is_active', 'country', 'date_joined')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'company_name', 'company_number')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {
            'fields': (
                'first_name', 'last_name', 'email', 'avatar', 'phone_number'
            )
        }),
        ('Company Information', {
            'fields': (
                'company_name', 'company_number', 'website', 'utr'
            )
        }),
        ('Address', {
            'fields': (
                'country', 'postal_code', 'city'
            )
        }),
        ('Permissions', {
            'fields': (
                'is_active', 'is_staff', 'is_superuser', 'is_verified',
                'groups', 'user_permissions'
            )
        }),
        ('Important dates', {'fields': ('last_login',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'password1', 'password2',
                'first_name', 'last_name', 'company_name'
            ),
        }),
    )
    
    def get_avatar_preview(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 50px; border-radius: 50%; object-fit: cover;" />',
                obj.avatar.url
            )
        else:
            return format_html(
                '<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-size: 24px;">{}</div>',
                obj.get_default_avatar_emoji()
            )
    get_avatar_preview.short_description = 'Avatar'
    
    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super().get_inline_instances(request, obj)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'business_type', 'industry', 'company_size', 'email_notifications')
    list_filter = ('business_type', 'company_size', 'email_notifications', 'sms_notifications')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'user__company_name')
    ordering = ('user__username',)
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Business Information', {
            'fields': ('business_type', 'industry', 'company_size')
        }),
        ('Preferences', {
            'fields': ('email_notifications', 'sms_notifications')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')

# Register the CustomUser model
admin.site.register(CustomUser, CustomUserAdmin)
