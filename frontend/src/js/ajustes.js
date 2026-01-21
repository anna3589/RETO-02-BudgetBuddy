// ajustes.js - JavaScript для сторінки Mi cuenta

document.addEventListener('DOMContentLoaded', function() {
    // ===========================================
    // ЕЛЕМЕНТИ ДЛЯ РОБОТИ З ПРОФІЛЕМ
    // ===========================================
    const profileForm = document.getElementById('profile-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    const editableInputs = document.querySelectorAll('.editable-input');
    const userAvatarTop = document.getElementById('user-avatar-top');
    const profileAvatarLarge = document.getElementById('profile-avatar-large');
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    const removeAvatarBtn = document.getElementById('remove-avatar-btn');
    
    // Збереження початкових значень форми
    let initialFormValues = {};
    
    // Ініціалізація початкових значень
    function initializeFormValues() {
        editableInputs.forEach(input => {
            initialFormValues[input.id] = input.value;
        });
    }
    
    // Оновлення аватара
    function updateAvatar(initials) {
        userAvatarTop.textContent = initials;
        profileAvatarLarge.textContent = initials;
    }
    
    // ===========================================
    // ЕЛЕМЕНТИ ДЛЯ РОБОТИ З БЕЗПЕКОЮ
    // ===========================================
    const changePasswordBtn = document.getElementById('change-password-btn');
    const viewSessionsBtn = document.getElementById('view-sessions-btn');
    const twoFactorToggle = document.getElementById('two-factor-toggle');
    
    // ===========================================
    // ЕЛЕМЕНТИ ДЛЯ РОБОТИ З НАЛАШТУВАННЯМИ СПОВІЩЕНЬ
    // ===========================================
    const emailNotificationsToggle = document.getElementById('email-notifications-toggle');
    const pushNotificationsToggle = document.getElementById('push-notifications-toggle');
    const spendingAlertsToggle = document.getElementById('spending-alerts-toggle');
    
    // ===========================================
    // ЕЛЕМЕНТИ ДЛЯ РОБОТИ З ІНШИМИ НАЛАШТУВАННЯМИ
    // ===========================================
    const changeLanguageBtn = document.getElementById('change-language-btn');
    const changeCurrencyBtn = document.getElementById('change-currency-btn');
    const exportDataBtn = document.getElementById('export-data-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    
    // ===========================================
    // ЕЛЕМЕНТИ ДЛЯ РОБОТИ З МОДАЛЬНИМИ ВІКНАМИ
    // ===========================================
    const passwordModal = document.getElementById('password-modal');
    const closePasswordModal = document.getElementById('close-password-modal');
    const cancelPasswordBtn = document.getElementById('cancel-password-btn');
    const passwordForm = document.getElementById('password-form');
    
    // ===========================================
    // ФУНКЦІЇ ДЛЯ РОБОТИ З ПРОФІЛЕМ
    // ===========================================
    
    // Ініціалізація форми
    initializeFormValues();
    
    // Скидання форми до початкових значень
    function resetForm() {
        editableInputs.forEach(input => {
            input.value = initialFormValues[input.id];
        });
    }
    
    // Збереження змін у профілі
    function saveProfileChanges() {
        // Оновлюємо аватар з новими ініціалами
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        updateAvatar(initials);
        
        // Оновлюємо початкові значення
        initializeFormValues();
        
        // Показуємо повідомлення про успішне збереження
        showNotification('Los cambios se han guardado correctamente.', 'success');
        
        // Тут можна додати код для відправки даних на сервер
        // const formData = new FormData(profileForm);
        // fetch('/api/update-profile', { method: 'POST', body: formData })
        //     .then(response => response.json())
        //     .then(data => console.log('Success:', data))
        //     .catch(error => console.error('Error:', error));
    }
    
    // ===========================================
    // ФУНКЦІЇ ДЛЯ РОБОТИ З МОДАЛЬНИМИ ВІКНАМИ
    // ===========================================
    
    // Відкриття модального вікна
    function openModal(modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    // Закриття модального вікна
    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Зміна пароля
    function changePassword() {
        openModal(passwordModal);
    }
    
    // ===========================================
    // ФУНКЦІЇ ДЛЯ РОБОТИ З ПОВІДОМЛЕННЯМИ
    // ===========================================
    
    // Показ повідомлень
    function showNotification(message, type = 'info') {
        // Створення елемента повідомлення
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Додавання стилів для повідомлення
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === 'success' ? '#d1fae5' : '#fef3c7'};
            color: ${type === 'success' ? '#065f46' : '#92400e'};
            padding: 12px 16px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            z-index: 3000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: 350px;
            animation: slideIn 0.3s ease;
        `;
        
        // Додавання анімації
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Додавання повідомлення на сторінку
        document.body.appendChild(notification);
        
        // Закриття повідомлення
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
        
        // Автоматичне закриття через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // ===========================================
    // ПІДПИСКА НА ПОДІЇ
    // ===========================================
    
    // Подія відправки форми профілю
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfileChanges();
    });
    
    // Подія натискання кнопки "Cancel"
    cancelBtn.addEventListener('click', function() {
        resetForm();
        showNotification('Los cambios han sido cancelados.', 'info');
    });
    
    // Подія натискання кнопки "Cambiar foto"
    changeAvatarBtn.addEventListener('click', function() {
        // Створення прихованого поля для завантаження файлу
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    // Тут можна обробити завантажену фотографію
                    // Наприклад, відправити на сервер або відобразити попередній перегляд
                    showNotification('Foto de perfil actualizada correctamente.', 'success');
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    });
    
    // Подія натискання кнопки "Eliminar" (аватар)
    removeAvatarBtn.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) {
            // Скидання аватара до ініціалів
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
            updateAvatar(initials);
            
            showNotification('Foto de perfil eliminada.', 'success');
        }
    });
    
    // Подія натискання кнопки "Cambiar contraseña"
    changePasswordBtn.addEventListener('click', changePassword);
    
    // Подія натискання кнопки "Ver sesiones"
    viewSessionsBtn.addEventListener('click', function() {
        showNotification('Funcionalidad en desarrollo. Próximamente disponible.', 'info');
    });
    
    // Подія зміни перемикача двофакторної аутентифікації
    twoFactorToggle.addEventListener('change', function() {
        if (this.checked) {
            showNotification('Autenticación de dos factores activada.', 'success');
        } else {
            showNotification('Autenticación de dos factores desactivada.', 'info');
        }
    });
    
    // Подія зміни перемикачів сповіщень
    emailNotificationsToggle.addEventListener('change', function() {
        showNotification(`Notificaciones por email ${this.checked ? 'activadas' : 'desactivadas'}.`, 'info');
    });
    
    pushNotificationsToggle.addEventListener('change', function() {
        showNotification(`Notificaciones push ${this.checked ? 'activadas' : 'desactivadas'}.`, 'info');
    });
    
    spendingAlertsToggle.addEventListener('change', function() {
        showNotification(`Alertas de gastos ${this.checked ? 'activadas' : 'desactivadas'}.`, 'info');
    });
    
    // Подія натискання кнопки "Cambiar" (мова)
    changeLanguageBtn.addEventListener('click', function() {
        showNotification('Funcionalidad en desarrollo. Próximamente disponible.', 'info');
    });
    
    // Подія натискання кнопки "Cambiar" (валюта)
    changeCurrencyBtn.addEventListener('click', function() {
        showNotification('Funcionalidad en desarrollo. Próximamente disponible.', 'info');
    });
    
    // Подія натискання кнопки "Exportar"
    exportDataBtn.addEventListener('click', function() {
        showNotification('Exportando datos... Esto puede tardar unos momentos.', 'info');
        // Симуляція експорту даних
        setTimeout(() => {
            showNotification('Datos exportados correctamente.', 'success');
        }, 2000);
    });
    
    // Подія натискання кнопки "Eliminar cuenta"
    deleteAccountBtn.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible y se perderán todos tus datos.')) {
            showNotification('Solicitud de eliminación de cuenta enviada. Te contactaremos pronto.', 'info');
            // Тут можна додати код для відправки запиту на видалення акаунта
        }
    });
    
    // Подія натискання кнопки закриття модального вікна пароля
    closePasswordModal.addEventListener('click', function() {
        closeModal(passwordModal);
        passwordForm.reset();
    });
    
    // Подія натискання кнопки "Cancelar" у модальному вікні пароля
    cancelPasswordBtn.addEventListener('click', function() {
        closeModal(passwordModal);
        passwordForm.reset();
    });
    
    // Подія відправки форми зміни пароля
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Валідація пароля
        if (newPassword !== confirmPassword) {
            showNotification('Las contraseñas no coinciden.', 'info');
            return;
        }
        
        if (newPassword.length < 8) {
            showNotification('La contraseña debe tener al menos 8 caracteres.', 'info');
            return;
        }
        
        // Симуляція успішного змінення пароля
        showNotification('Contraseña cambiada correctamente.', 'success');
        closeModal(passwordModal);
        passwordForm.reset();
        
        // Тут можна додати код для відправки запиту на зміну пароля
        // fetch('/api/change-password', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ currentPassword, newPassword })
        // })
        // .then(response => response.json())
        // .then(data => {
        //     if (data.success) {
        //         showNotification('Contraseña cambiada correctamente.', 'success');
        //         closeModal(passwordModal);
        //         passwordForm.reset();
        //     } else {
        //         showNotification(data.message || 'Error al cambiar la contraseña.', 'info');
        //     }
        // })
        // .catch(error => {
        //     showNotification('Error de conexión. Inténtalo de nuevo.', 'info');
        // });
    });
    
    // Закриття модального вікна при кліку на затемнену область
    window.addEventListener('click', function(e) {
        if (e.target === passwordModal) {
            closeModal(passwordModal);
            passwordForm.reset();
        }
    });
    
    // ===========================================
    // ІНІЦІАЛІЗАЦІЯ СТОРІНКИ
    // ===========================================
    
    console.log('Página Mi cuenta cargada correctamente.');
});