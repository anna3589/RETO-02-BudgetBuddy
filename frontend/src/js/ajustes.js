// ajustes.js - Versión Corregida y Limpia

document.addEventListener('DOMContentLoaded', function() {
    // ===========================================
    // 1. DECLARACIÓN DE VARIABLES
    // ===========================================
    let editProfileBtn, profileViewMode, profileEditMode, cancelEditBtn;
    let viewFirstName, viewLastName, viewEmail, viewPhone, viewCountry, profileFullNameView;
    let firstNameInput, lastNameInput, emailInput, phoneInput;
    let profileForm, saveChangesBtn, userAvatarTop, profileAvatarLarge, profileAvatarLargeEdit;
    let changeAvatarBtn, removeAvatarBtn, logoutBtn;
    let changePasswordBtn, viewSessionsBtn, twoFactorToggle;
    let emailNotificationsToggle, pushNotificationsToggle, spendingAlertsToggle;
    let changeCurrencyBtn, exportDataBtn;
    let passwordModal, closePasswordModal, cancelPasswordBtn, passwordForm;
    
    let initialFormValues = {};
    
    // ===========================================
    // 2. MODALES Y UTILIDADES
    // ===========================================
    function openModal(modal) {
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEscapeKey);
        }
    }
    
    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleEscapeKey);
        }
    }
    
    function handleEscapeKey(e) {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal[style*="display: flex"]');
            openModals.forEach(modal => {
                closeModal(modal);
                const forms = modal.querySelectorAll('form');
                forms.forEach(form => form.reset());
            });
        }
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        // Estilos básicos para la notificación si no cargan del CSS
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        // Inyectar estilos inline para asegurar visibilidad
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            background: ${type === 'success' ? '#d1fae5' : '#e0f2fe'}; 
            color: ${type === 'success' ? '#065f46' : '#075985'};
            padding: 1rem; border-radius: 0.5rem; z-index: 9999;
            display: flex; align-items: center; gap: 10px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        `;
        
        document.body.appendChild(notification);
        
        const closeBtn = notification.querySelector('.notification-close');
        if(closeBtn) closeBtn.onclick = () => notification.remove();

        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 4000);
    }

    // Función auxiliar VITAL para leer la cookie de Laravel
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
        return null;
    }

    // ===========================================
    // 3. LÓGICA DE CONEXIÓN (API)
    // ===========================================
    
    // Cargar datos del perfil
    async function initializeProfileData() {
        try {
            // Pedir datos al backend
            const response = await fetch('/api/profile', {
                headers: { 
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) throw new Error('Error de conexión');

            const user = await response.json();
            // Mapeo seguro de datos (por si profile es null)
            const profile = user.profile || {};

            const realData = {
                firstName: user.name || '',
                lastName: profile.lastname || '',
                email: user.email || '',
                phone: profile.phone || ''
            };

            initialFormValues = {...realData};
            updateViewMode(realData);
            updateEditMode(realData);
            updateAvatar(realData.firstName, realData.lastName);
            
        } catch (error) {
            console.error('Error al cargar datos:', error);
            // No mostramos error al usuario para no molestar si es la primera carga
        }
    } // <--- ¡ESTA LLAVE ERA LA QUE FALTABA!

    // Guardar cambios
    async function saveProfileChanges() {
        const btn = document.getElementById('save-changes-btn');
        const originalText = btn.innerHTML;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        const updatedData = {
            first_name: firstNameInput.value,
            last_name: lastNameInput.value,
            email: emailInput.value,
            phone: phoneInput.value
        };

        try {
            // 1. Asegurar cookie CSRF
            await fetch('/sanctum/csrf-cookie');
            
            // 2. Enviar petición con la cookie en el header
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') // Usamos cookie, no meta tag
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                // Actualizar vista local
                initialFormValues = {
                    firstName: updatedData.first_name,
                    lastName: updatedData.last_name,
                    email: updatedData.email,
                    phone: updatedData.phone
                };
                updateViewMode(initialFormValues);
                updateAvatar(initialFormValues.firstName, initialFormValues.lastName);
                switchToViewMode();
                showNotification('Perfil actualizado correctamente', 'success');
            } else {
                throw new Error('Error al actualizar');
            }
        } catch (error) {
            console.error(error);
            showNotification('No se pudieron guardar los cambios', 'danger');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    // Cerrar sesión
    async function logoutUser() {
        if (!confirm('¿Estás seguro de que quieres salir?')) return;

        try {
            await fetch('/sanctum/csrf-cookie');
            await fetch('/api/logout', { // Asegúrate de que esta ruta existe en api.php o web.php
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
                }
            });
            window.location.href = '/login';
        } catch (error) {
            console.error("Error logout", error);
            window.location.href = '/login'; // Forzar salida
        }
    }

    // ===========================================
    // 4. INTERFAZ DE USUARIO (UI)
    // ===========================================
    
    function updateViewMode(data) {
        if (viewEmail) viewEmail.textContent = data.email;
        if (viewPhone) viewPhone.textContent = data.phone;
        if (profileFullNameView) profileFullNameView.textContent = `${data.firstName} ${data.lastName}`;
    }
    
    function updateEditMode(data) {
        if (firstNameInput) firstNameInput.value = data.firstName;
        if (lastNameInput) lastNameInput.value = data.lastName;
        if (emailInput) emailInput.value = data.email;
        if (phoneInput) phoneInput.value = data.phone;
    }
    
    function switchToEditMode() {
        if (profileViewMode) profileViewMode.style.display = 'none';
        if (profileEditMode) profileEditMode.style.display = 'block';
        if (editProfileBtn) editProfileBtn.style.display = 'none';
    }
    
    function switchToViewMode() {
        if (profileEditMode) profileEditMode.style.display = 'none';
        if (profileViewMode) profileViewMode.style.display = 'block';
        if (editProfileBtn) editProfileBtn.style.display = 'flex';
        updateEditMode(initialFormValues); // Resetear cambios no guardados
    }
    
    function updateAvatar(firstName, lastName) {
        const f = firstName ? firstName.charAt(0) : '';
        const l = lastName ? lastName.charAt(0) : '';
        const initials = (f + l).toUpperCase();
        
        if (userAvatarTop) userAvatarTop.textContent = initials;
        if (profileAvatarLarge) profileAvatarLarge.textContent = initials;
        if (profileAvatarLargeEdit) profileAvatarLargeEdit.textContent = initials;
    }

    // ===========================================
    // 5. INICIALIZACIÓN
    // ===========================================
    function initElements() {
        // Botones principales
        editProfileBtn = document.getElementById('edit-profile-btn');
        cancelEditBtn = document.getElementById('cancel-edit-btn');
        saveChangesBtn = document.getElementById('save-changes-btn');
        logoutBtn = document.getElementById('logout-btn');
        
        // Contenedores
        profileViewMode = document.getElementById('profile-view-mode');
        profileEditMode = document.getElementById('profile-edit-mode');
        profileForm = document.getElementById('profile-form');
        
        // Campos de vista
        viewEmail = document.getElementById('view-email');
        viewPhone = document.getElementById('view-phone');
        profileFullNameView = document.getElementById('profile-full-name-view');
        
        // Inputs
        firstNameInput = document.getElementById('first-name');
        lastNameInput = document.getElementById('last-name');
        emailInput = document.getElementById('email');
        phoneInput = document.getElementById('phone');
        
        // Avatares
        userAvatarTop = document.getElementById('user-avatar-top');
        profileAvatarLarge = document.getElementById('profile-avatar-large');
        profileAvatarLargeEdit = document.getElementById('profile-avatar-large-edit');
        changeAvatarBtn = document.getElementById('change-avatar-btn');
        removeAvatarBtn = document.getElementById('remove-avatar-btn');

        // Otros
        changePasswordBtn = document.getElementById('change-password-btn');
        exportDataBtn = document.getElementById('export-data-btn');
        viewSessionsBtn = document.getElementById('view-sessions-btn');
        
        // Modales
        passwordModal = document.getElementById('password-modal');
        closePasswordModal = document.getElementById('close-password-modal');
        cancelPasswordBtn = document.getElementById('cancel-password-btn');
        passwordForm = document.getElementById('password-form');
    }
    
    function initEventListeners() {
        if (editProfileBtn) editProfileBtn.addEventListener('click', switchToEditMode);
        if (cancelEditBtn) cancelEditBtn.addEventListener('click', switchToViewMode);
        
        if (saveChangesBtn) {
            saveChangesBtn.addEventListener('click', function(e) {
                e.preventDefault();
                saveProfileChanges();
            });
        }
        
        if (profileForm) {
            profileForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveProfileChanges();
            });
        }
        
        if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);
        
        // Placeholders para funciones no implementadas en back
        if (changePasswordBtn) changePasswordBtn.addEventListener('click', () => openModal(passwordModal));
        if (exportDataBtn) exportDataBtn.addEventListener('click', () => showNotification('Función de exportar próximamente', 'info'));
        if (viewSessionsBtn) viewSessionsBtn.addEventListener('click', () => showNotification('Función de sesiones próximamente', 'info'));
        
        if (cancelPasswordBtn) cancelPasswordBtn.addEventListener('click', () => closeModal(passwordModal));
        if (closePasswordModal) closePasswordModal.addEventListener('click', () => closeModal(passwordModal));
    }
    
    // Función principal de arranque
    async function init() { // <--- CORREGIDO 'fasync' A 'async'
        console.log('Iniciando Ajustes...');
        initElements();
        await initializeProfileData();
        initEventListeners();
    }
    
    init();
});