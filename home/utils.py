def mask_email(email):
    """
    Маскирует email адрес, показывая только первые 2 и последние 2 символа локальной части
    Пример: user@example.com -> us***er@example.com
    """
    if not email or '@' not in email:
        return email
    
    local_part, domain = email.split('@', 1)
    
    if len(local_part) <= 4:
        # Если локальная часть слишком короткая, показываем только первый символ
        masked_local = local_part[0] + '***'
    else:
        # Показываем первые 2 и последние 2 символа
        masked_local = local_part[:2] + '***' + local_part[-2:]
    
    return f"{masked_local}@{domain}"


def mask_phone_number(phone):
    """
    Маскирует номер телефона, показывая только первые 2 и последние 2 цифры
    Пример: +1234567890 -> +12***90
    """
    if not phone:
        return phone
    
    # Убираем все нецифровые символы кроме +
    digits_only = ''.join(c for c in phone if c.isdigit())
    
    if len(digits_only) <= 4:
        # Если номер слишком короткий, показываем только первые 2 цифры
        masked_digits = digits_only[:2] + '***'
    else:
        # Показываем первые 2 и последние 2 цифры
        masked_digits = digits_only[:2] + '***' + digits_only[-2:]
    
    # Восстанавливаем + в начале если он был
    if phone.startswith('+'):
        return '+' + masked_digits
    else:
        return masked_digits 