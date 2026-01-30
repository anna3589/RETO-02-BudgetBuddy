// desktop.js - Versión simplificada funcional con integración API

// ========== FUNCIONES GLOBALES PARA ETIQUETAS ==========

/**
 * Convertir color hexadecimal a RGB
 * @param {string} hex - Color en formato hexadecimal
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '52, 211, 153';
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r}, ${g}, ${b}`;
}

/**
 * Formatear fecha
 * @param {string} dateString - Fecha en formato string
 */
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    } catch (e) {
        return dateString;
    }
}

/**
 * Cargar etiquetas desde el servidor
 * Intenta obtener etiquetas de la API, si falla usa datos estáticos
 */
async function loadTagsFromServer() {
    console.log('loadTagsFromServer llamado');
    
    try {
        // Intentar obtener etiquetas de la API
        const response = await fetch('/api/tags', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        });
        
        console.log('Estado de respuesta API:', response.status);
        
        if (response.ok) {
            const tags = await response.json();
            console.log('Etiquetas obtenidas de API:', tags.length, 'elementos');
            
            // Renderizar etiquetas si la función existe
            if (typeof renderTags === 'function') {
                renderTags(tags);
            } else {
                console.error('Error: función renderTags no encontrada');
                showNotification('Error al cargar etiquetas', 'error');
            }
            
            return tags;
        } else {
            // Si hay error en la API, usar etiquetas estáticas
            console.warn('API devolvió error:', response.status);
            const staticTags = getStaticTags();
            renderTags(staticTags);
            showNotification('Usando etiquetas locales', 'info');
            return staticTags;
        }
    } catch (error) {
        // Error de red
        console.error('Error de red:', error);
        
        // Usar etiquetas estáticas como fallback
        const staticTags = getStaticTags();
        renderTags(staticTags);
        showNotification('Error de conexión. Usando etiquetas locales', 'warning');
        return staticTags;
    }
}

/**
 * Obtener etiquetas estáticas (para cuando la API no está disponible)
 */
function getStaticTags() {
    return [
        { id: 1, name: 'Gimnasio', color: '#34d399', icon: 'dumbbell' },
        { id: 2, name: 'Internet', color: '#60a5fa', icon: 'wifi' },
        { id: 3, name: 'Gasolina', color: '#fbbf24', icon: 'gas-pump' },
        { id: 4, name: 'Supermercado', color: '#ef4444', icon: 'shopping-cart' },
        { id: 5, name: 'Entretenimiento', color: '#a855f7', icon: 'gamepad' },
        { id: 6, name: 'Netflix', color: '#ef4444', icon: 'tv' },
        { id: 7, name: 'Spotify', color: '#10b981', icon: 'music' },
        { id: 8, name: 'Transporte', color: '#60a5fa', icon: 'bus' },
        { id: 9, name: 'Ropa', color: '#a855f7', icon: 'tshirt' },
        { id: 10, name: 'Restaurante', color: '#fbbf24', icon: 'utensils' }
    ];
}

/**
 * Renderizar etiquetas en el DOM
 * @param {Array} tags - Array de objetos de etiquetas
 */
function renderTags(tags) {
    const tagsList = document.querySelector('.tags-list');
    const deleteTagArea = document.getElementById('delete-tag-area');
    
    if (!tagsList) {
        console.error('No se encontró .tags-list');
        return;
    }
    
    console.log('Renderizando etiquetas:', tags.length);
    
    // Limpiar etiquetas existentes (excepto deleteTagArea)
    document.querySelectorAll('.tag-item').forEach(tag => {
        if (!tag.classList.contains('delete-tag-item')) {
            tag.remove();
        }
    });
    
    // Añadir nuevas etiquetas
    tags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.setAttribute('draggable', 'true');
        tagElement.setAttribute('data-id', tag.id.toString());
        tagElement.style.setProperty('--tag-color', tag.color);
        
        tagElement.innerHTML = `
            <div class="tag-icon" style="background-color: rgba(${hexToRgb(tag.color)}, 0.1); color: ${tag.color};">
                <i class="fas fa-${tag.icon || 'tag'}"></i>
            </div>
            <div class="tag-info">
                <h3>${tag.name}</h3>
                <p>${tag.created_at ? 'Creada: ' + formatDate(tag.created_at) : 'Etiqueta'}</p>
            </div>
        `;
        
        tagsList.insertBefore(tagElement, deleteTagArea);
    });
    
    // Inicializar drag & drop PARA NUEVAS ETIQUETAS
    if (typeof window.initializeDragAndDrop === 'function') {
        window.initializeDragAndDrop();
    } else if (typeof initializeDragAndDrop === 'function') {
        initializeDragAndDrop();
    }
    
    console.log('Etiquetas renderizadas exitosamente');
}

/**
 * Mostrar notificación
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, info, warning)
 */
function showNotification(message, type) {
    // Verificar si ya existe una notificación con ese texto
    const existingNotifications = document.querySelectorAll('.notification');
    for (const notif of existingNotifications) {
        if (notif.textContent.includes(message)) {
            return; // No mostrar duplicado
        }
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'info-circle';
    let bgColor = '#3b82f6';
    
    if (type === 'success') {
        icon = 'check-circle';
        bgColor = '#10b981';
    } else if (type === 'error') {
        icon = 'exclamation-circle';
        bgColor = '#ef4444';
    } else if (type === 'info') {
        icon = 'info-circle';
        bgColor = '#3b82f6';
    } else if (type === 'warning') {
        icon = 'exclamation-triangle';
        bgColor = '#f59e0b';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: ${bgColor};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Añadir estilo para animación
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                margin-left: 10px;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// ========== FUNCIONES GLOBALES PARA DRAG-AND-DROP ==========

let deleteTagArea = null;
let deleteIndicator = null;

/**
 * Inicializar sistema de drag-and-drop
 */
function initializeDragAndDrop() {
    // Obtener referencias a elementos si aún no las tenemos
    if (!deleteTagArea) {
        deleteTagArea = document.getElementById('delete-tag-area');
    }
    if (!deleteIndicator) {
        deleteIndicator = document.getElementById('delete-indicator');
    }
    
    const tagItems = document.querySelectorAll('.tag-item:not(.delete-tag-item)');
    
    console.log('Inicializando drag-and-drop para', tagItems.length, 'etiquetas');
    
    tagItems.forEach(tag => {
        // Remover manejadores antiguos
        tag.removeEventListener('dragstart', handleDragStart);
        tag.removeEventListener('dragend', handleDragEnd);
        
        // Añadir nuevos manejadores
        tag.addEventListener('dragstart', handleDragStart);
        tag.addEventListener('dragend', handleDragEnd);
        
        // Asegurarse de que el atributo draggable está activo
        tag.setAttribute('draggable', 'true');
    });
    
    if (deleteTagArea) {
        // Remover manejadores antiguos para deleteTagArea
        deleteTagArea.removeEventListener('dragover', handleDragOver);
        deleteTagArea.removeEventListener('dragleave', handleDragLeave);
        deleteTagArea.removeEventListener('drop', handleDrop);
        
        // Añadir nuevos manejadores para deleteTagArea
        deleteTagArea.addEventListener('dragover', handleDragOver);
        deleteTagArea.addEventListener('dragleave', handleDragLeave);
        deleteTagArea.addEventListener('drop', handleDrop);
    }
}

function handleDragStart(e) {
    console.log('Drag start para etiqueta ID:', this.getAttribute('data-id'));
    e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
    this.classList.add('dragging');
    if (deleteIndicator) {
        deleteIndicator.textContent = 'Arrastra a la zona roja para eliminar';
        deleteIndicator.classList.add('active');
    }
}

function handleDragEnd() {
    console.log('Drag end para etiqueta');
    this.classList.remove('dragging');
    if (deleteIndicator) {
        deleteIndicator.classList.remove('active');
    }
    if (deleteTagArea) {
        deleteTagArea.classList.remove('drag-over');
        deleteTagArea.style.transform = 'scale(1)';
    }
}

function handleDragOver(e) {
    e.preventDefault();
    if (deleteTagArea) {
        deleteTagArea.classList.add('drag-over');
        deleteTagArea.style.transform = 'scale(1.02)';
    }
}

function handleDragLeave() {
    if (deleteTagArea) {
        deleteTagArea.classList.remove('drag-over');
        deleteTagArea.style.transform = 'scale(1)';
    }
}

/**
 * Manejador para soltar etiqueta en zona de eliminación
 */
async function handleDrop(e) {
    e.preventDefault();
    const tagId = e.dataTransfer.getData('text/plain');
    console.log('Drop etiqueta ID:', tagId);
    
    const tagToDelete = document.querySelector(`.tag-item[data-id="${tagId}"]:not(.delete-tag-item)`);
    
    if (!tagToDelete) {
        console.log('Etiqueta no encontrada para eliminar');
        if (deleteTagArea) {
            deleteTagArea.classList.remove('drag-over');
            deleteTagArea.style.transform = 'scale(1)';
        }
        return;
    }
    
    // Preguntar confirmación
    if (!confirm('¿Estás seguro de que quieres eliminar esta etiqueta?')) {
        if (deleteTagArea) {
            deleteTagArea.classList.remove('drag-over');
            deleteTagArea.style.transform = 'scale(1)';
        }
        return;
    }
    
    // Animación de eliminación
    tagToDelete.style.opacity = '0.5';
    tagToDelete.style.pointerEvents = 'none';
    
    try {
        console.log('Eliminando etiqueta ID:', tagId);
        
        const response = await fetch(`/api/tags/${tagId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Respuesta de eliminación:', response.status);
        
        if (response.ok) {
            // Animación completa de eliminación
            tagToDelete.style.opacity = '0';
            tagToDelete.style.transform = 'translateX(100px) rotate(10deg)';
            
            setTimeout(() => {
                tagToDelete.remove();
                
                if (deleteIndicator) {
                    deleteIndicator.textContent = '¡Etiqueta eliminada correctamente!';
                    deleteIndicator.classList.add('active');
                    
                    setTimeout(() => {
                        deleteIndicator.textContent = '';
                        deleteIndicator.classList.remove('active');
                    }, 2000);
                }
                
                // Recargar etiquetas del servidor para actualizar la lista
                setTimeout(() => {
                    loadTagsFromServer();
                }, 500);
                
            }, 300);
            
            showNotification('Etiqueta eliminada exitosamente', 'success');
        } else {
            const errorData = await response.json().catch(() => ({}));
            // Cancelar animación si hay error
            tagToDelete.style.opacity = '1';
            tagToDelete.style.pointerEvents = 'auto';
            showNotification(errorData.message || 'Error al eliminar la etiqueta', 'error');
        }
    } catch (error) {
        // Cancelar animación si hay error
        tagToDelete.style.opacity = '1';
        tagToDelete.style.pointerEvents = 'auto';
        showNotification('Error de conexión con el servidor', 'error');
        console.error('Error:', error);
    }
    
    if (deleteTagArea) {
        deleteTagArea.classList.remove('drag-over');
        deleteTagArea.style.transform = 'scale(1)';
    }
}

// ========== INICIALIZACIÓN PRINCIPAL ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('Desktop.js cargado!');
    
    // Variables globales para etiquetas
    let selectedColor = '#34d399';
    let selectedIcon = 'dumbbell';
    
    // ========== SOLO PARA PÁGINAS EN DESARROLLO (href="#") ==========
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const title = this.getAttribute('title') || 'esta página';
            showNotification(`Página "${title}" en desarrollo`, 'info');
            
            // Para navegación sidebar en desktop actualizar clase activa
            if (this.classList.contains('nav-item')) {
                document.querySelectorAll('.nav-item').forEach(nav => {
                    nav.classList.remove('active');
                });
                this.classList.add('active');
                
                // Actualizar título de página
                const pageTitleElement = document.querySelector('.page-title');
                if (pageTitleElement && title !== 'Panel general') {
                    pageTitleElement.textContent = title;
                }
            }
        });
    });
    
    // ========== SELECTOR DE CUENTAS BANCARIAS ==========
    // Datos para cada cuenta
    const accountsData = {
        '1': {
            bankName: 'Banco Nacional',
            accountType: 'Cuenta Corriente',
            iban: 'ES12 3456 7890 1234 5678 9012',
            balance: '5.827,50€',
            balanceChange: '+320,80€',
            changeType: 'positive',
            openingDate: '15 Enero, 2023',
            accountAge: '1 año, 4 meses',
            interestRate: '1.25%',
            interestType: 'Tasa anual',
            status: 'active',
            logoIcon: 'fas fa-building'
        },
        '2': {
            bankName: 'CaixaBank',
            accountType: 'Cuenta Ahorro',
            iban: 'ES98 7654 3210 9876 5432 1098',
            balance: '12.450,20€',
            balanceChange: '+1.200,50€',
            changeType: 'positive',
            openingDate: '22 Marzo, 2022',
            accountAge: '2 años, 1 mes',
            interestRate: '2.10%',
            interestType: 'Tasa anual',
            status: 'active',
            logoIcon: 'fas fa-piggy-bank'
        },
        '3': {
            bankName: 'BBVA',
            accountType: 'Cuenta Corriente',
            iban: 'ES76 5432 1098 7654 3210 9876',
            balance: '3.245,80€',
            balanceChange: '-150,30€',
            changeType: 'negative',
            openingDate: '10 Julio, 2023',
            accountAge: '9 meses',
            interestRate: '0.75%',
            interestType: 'Tasa anual',
            status: 'active',
            logoIcon: 'fas fa-building'
        },
        '4': {
            bankName: 'Santander',
            accountType: 'Cuenta Universitaria',
            iban: 'ES34 5678 9012 3456 7890 1234',
            balance: '1.850,00€',
            balanceChange: '+45,20€',
            changeType: 'positive',
            openingDate: '5 Septiembre, 2023',
            accountAge: '7 meses',
            interestRate: '0.50%',
            interestType: 'Tasa anual',
            status: 'active',
            logoIcon: 'fas fa-graduation-cap'
        }
    };

    // Obtener elementos DOM
    const accountSelect = document.getElementById('bankAccountSelect');
    const bankNameElement = document.querySelector('.bank-name');
    const accountTypeElement = document.querySelector('.account-type');
    const bankLogoElement = document.querySelector('.bank-logo i');
    const ibanElement = document.querySelector('.iban-number');
    const balanceElement = document.querySelector('.balance-amount');
    const balanceChangeElement = document.querySelector('.balance-change');
    const openingDateElement = document.querySelector('.account-details-grid .detail-card:nth-child(3) .detail-value');
    const accountAgeElement = document.querySelector('.account-age');
    const interestRateElement = document.querySelector('.account-details-grid .detail-card:nth-child(4) .detail-value');
    const statusDotElement = document.querySelector('.status-dot');
    const statusTextElement = document.querySelector('.status-text');

    /**
     * Actualizar información de cuenta bancaria
     * @param {string} accountId - ID de la cuenta
     */
    function updateAccountInfo(accountId) {
        const account = accountsData[accountId];
        
        if (!account) return;
        
        // Actualizar todos los campos
        bankNameElement.textContent = account.bankName;
        accountTypeElement.textContent = account.accountType;
        bankLogoElement.className = account.logoIcon;
        ibanElement.textContent = account.iban;
        balanceElement.textContent = account.balance;
        
        // Actualizar cambio de balance
        balanceChangeElement.textContent = account.balanceChange;
        balanceChangeElement.className = `balance-change ${account.changeType}`;
        
        openingDateElement.textContent = account.openingDate;
        accountAgeElement.textContent = account.accountAge;
        interestRateElement.textContent = account.interestRate;
        
        // Actualizar estado
        statusDotElement.className = `status-dot ${account.status}`;
        statusTextElement.textContent = account.status === 'active' ? 'Cuenta activa' : 'Cuenta inactiva';
    }

    // Manejador de cambio de selector
    if (accountSelect) {
        accountSelect.addEventListener('change', function() {
            const selectedAccountId = this.value;
            updateAccountInfo(selectedAccountId);
        });
        
        // Inicializar con primera cuenta
        updateAccountInfo(accountSelect.value);
    }

    // Función para copiar IBAN
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const iban = ibanElement.textContent;
            
            // Usar Clipboard API para copiar
            navigator.clipboard.writeText(iban).then(() => {
                // Cambiar ícono temporalmente
                const originalIcon = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i>';
                this.style.backgroundColor = 'rgba(0, 185, 52, 0.1)';
                this.style.color = 'var(--income-green)';
                
                setTimeout(() => {
                    this.innerHTML = originalIcon;
                    this.style.backgroundColor = '';
                    this.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Error copiando texto: ', err);
                alert('No se pudo copiar el IBAN. Por favor, cópielo manualmente.');
            });
        });
    });
    
    // ========== FUNCIONES AUXILIARES PARA ETIQUETAS ==========
    
    /**
     * Intentar URLs alternativas para cargar etiquetas
     */
    async function tryAlternativeUrls() {
        const alternativeUrls = [
            '/api/tags',                      // A través de nginx
            'http://localhost/api/tags',      // Localhost directo
            'http://backend:8000/api/tags',   // Conexión directa al backend
        ];
        
        for (const url of alternativeUrls) {
            try {
                console.log('Intentando URL:', url);
                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const tags = await response.json();
                    console.log('Cargado exitosamente desde:', url);
                    renderTags(tags);
                    return tags;
                }
            } catch (error) {
                console.log('Falló con URL:', url, error.message);
            }
        }
        
        console.log('Todas las URLs fallaron, mostrando etiquetas estáticas');
        renderTags(getStaticTags());
        return [];
    }
    
    /**
     * Verificar si ya existe una etiqueta con ese nombre
     * @param {string} tagName - Nombre de la etiqueta
     */
    async function checkTagExists(tagName) {
        try {
            const response = await fetch('/api/tags');
            if (response.ok) {
                const tags = await response.json();
                return tags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase());
            }
        } catch (error) {
            console.error('Error verificando etiquetas:', error);
        }
        return false;
    }
    
    // ========== MODAL PARA ETIQUETAS ==========
    const tagModal = document.getElementById('tagModal');
    const addTagBtn = document.getElementById('desktop-add-tag');
    const closeModal = document.getElementById('closeModal');
    const cancelTag = document.getElementById('cancelTag');
    const saveTag = document.getElementById('saveTag');
    const tagNameInput = document.getElementById('tagName');
    const colorOptions = document.querySelectorAll('.color-option');
    const iconOptions = document.querySelectorAll('.icon-option');
    
    if (addTagBtn && tagModal) {
        addTagBtn.addEventListener('click', () => {
            // Resetear selección de color e ícono a valores por defecto
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            iconOptions.forEach(opt => opt.classList.remove('selected'));
            
            if (colorOptions.length > 0) colorOptions[0].classList.add('selected');
            if (iconOptions.length > 0) iconOptions[0].classList.add('selected');
            
            selectedColor = '#34d399';
            selectedIcon = 'dumbbell';
            
            // Limpiar campo de entrada
            if (tagNameInput) tagNameInput.value = '';
            
            tagModal.showModal();
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            tagModal.close();
        });
    }
    
    if (cancelTag) {
        cancelTag.addEventListener('click', () => {
            tagModal.close();
        });
    }
    
    if (colorOptions.length > 0) {
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                selectedColor = this.getAttribute('data-color');
            });
        });
    }
    
    if (iconOptions.length > 0) {
        iconOptions.forEach(option => {
            option.addEventListener('click', function() {
                iconOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                selectedIcon = this.getAttribute('data-icon');
            });
        });
    }
    
    if (saveTag) {
        saveTag.addEventListener('click', async function() {
            const tagName = tagNameInput ? tagNameInput.value.trim() : '';
            
            if (!tagName) {
                showNotification('Por favor, ingresa un nombre para la etiqueta', 'error');
                return;
            }
            
            // Mostrar indicador de carga
            const originalButtonText = saveTag.innerHTML;
            saveTag.disabled = true;
            saveTag.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando...';
            
            try {
                console.log('Enviando solicitud para crear etiqueta:', tagName);
                
                const response = await fetch('/api/tags', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        name: tagName,
                        color: selectedColor,
                        icon: selectedIcon
                    })
                });
                
                console.log('Respuesta:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Etiqueta creada:', data);
                    
                    // Limpiar formulario
                    if (tagNameInput) tagNameInput.value = '';
                    tagModal.close();
                    
                    // Cargar lista actualizada de etiquetas
                    await loadTagsFromServer();
                    
                    showNotification('Etiqueta creada exitosamente', 'success');
                } else {
                    let errorMessage = 'Error al crear la etiqueta';
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                        // Ignorar si no hay JSON
                    }
                    showNotification(errorMessage, 'error');
                }
            } catch (error) {
                console.error('Error de red:', error);
                showNotification('Error de conexión con el servidor', 'error');
            } finally {
                // Restaurar botón
                saveTag.disabled = false;
                saveTag.innerHTML = originalButtonText;
            }
        });
    }
    
    // ========== POPUP "VER TODAS" PARA METAS FINANCIERAS ==========
    const viewAllBtn = document.getElementById('viewAllGoals');
    const goalsModal = document.getElementById('goalsModal');
    const closeGoalsModal = document.getElementById('closeGoalsModal');
    const allGoalsList = document.getElementById('allGoalsList');
    
    // Datos para todas las metas financieras
    const allGoalsData = [
        {
            id: 1,
            title: 'Comprar iPhone 15',
            category: 'Tecnología',
            targetAmount: 1200,
            savedAmount: 360,
            deadline: '8 mayo 2024',
            progress: 30,
            priority: 'alta'
        },
        {
            id: 2,
            title: 'Nuevo portátil para la uni',
            category: 'Educación',
            targetAmount: 1200,
            savedAmount: 1080,
            deadline: '16 agosto 2024',
            progress: 90,
            priority: 'alta'
        },
        {
            id: 3,
            title: 'Fiestas de graduación',
            category: 'Entretenimiento',
            targetAmount: 1000,
            savedAmount: 770,
            deadline: '12 mayo 2025',
            progress: 77,
            priority: 'media'
        },
        {
            id: 4,
            title: 'Viaje a Japón',
            category: 'Viajes',
            targetAmount: 3000,
            savedAmount: 450,
            deadline: '15 diciembre 2024',
            progress: 15,
            priority: 'baja'
        },
        {
            id: 5,
            title: 'Curso de programación',
            category: 'Educación',
            targetAmount: 800,
            savedAmount: 320,
            deadline: '30 junio 2024',
            progress: 40,
            priority: 'alta'
        },
        {
            id: 6,
            title: 'Fondo de emergencia',
            category: 'Ahorro',
            targetAmount: 5000,
            savedAmount: 2500,
            deadline: '31 diciembre 2024',
            progress: 50,
            priority: 'alta'
        },
        {
            id: 7,
            title: 'Nueva cámara fotográfica',
            category: 'Hobbies',
            targetAmount: 900,
            savedAmount: 180,
            deadline: '1 octubre 2024',
            progress: 20,
            priority: 'media'
        },
        {
            id: 8,
            title: 'Regalos de Navidad',
            category: 'Regalos',
            targetAmount: 500,
            savedAmount: 150,
            deadline: '20 diciembre 2024',
            progress: 30,
            priority: 'media'
        }
    ];
    
    /**
     * Renderizar todas las metas en el popup
     */
    function renderAllGoals() {
        if (!allGoalsList) return;
        
        allGoalsList.innerHTML = '';
        
        allGoalsData.forEach(goal => {
            const goalElement = document.createElement('div');
            goalElement.className = 'goals-modal-item';
            goalElement.setAttribute('data-id', goal.id);
            
            // Determinar color para prioridad
            let priorityColor = '#34d399'; // verde para baja
            if (goal.priority === 'alta') priorityColor = '#ef4444'; // rojo para alta
            if (goal.priority === 'media') priorityColor = '#fbbf24'; // amarillo para media
            
            goalElement.innerHTML = `
                <div class="goals-modal-item-left">
                    <div class="goals-modal-progress">
                        <svg class="goals-modal-progress-circle" viewBox="0 0 36 36">
                            <circle class="progress-circle-bg" cx="18" cy="18" r="16"></circle>
                            <circle class="progress-circle-fill" cx="18" cy="18" r="16" 
                                    style="--progress: ${goal.progress}; stroke: ${priorityColor};"></circle>
                        </svg>
                        <div class="goals-modal-progress-text">${goal.progress}%</div>
                    </div>
                    <div class="goals-modal-item-info">
                        <h4 class="goals-modal-item-title">${goal.title}</h4>
                        <div class="goals-modal-item-date">Fecha límite: ${goal.deadline}</div>
                        <span class="goals-modal-item-category">${goal.category}</span>
                    </div>
                </div>
                <div class="goals-modal-item-right">
                    <div class="goals-modal-amount">
                        ${goal.savedAmount}€ / ${goal.targetAmount}€
                    </div>
                    <div class="goals-modal-progress-bar">
                        <div class="goals-modal-progress-fill" style="width: ${goal.progress}%"></div>
                    </div>
                    <div class="goals-modal-actions">
                        <button class="goals-modal-action-btn" onclick="editGoal(${goal.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="goals-modal-action-btn primary" onclick="addToGoal(${goal.id})">
                            <i class="fas fa-plus"></i> Añadir
                        </button>
                    </div>
                </div>
            `;
            
            allGoalsList.appendChild(goalElement);
        });
    }
    
    // Manejador para botón "Ver todas"
    if (viewAllBtn && goalsModal) {
        viewAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            renderAllGoals();
            goalsModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Cerrar popup
    if (closeGoalsModal && goalsModal) {
        closeGoalsModal.addEventListener('click', function() {
            goalsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Cerrar al hacer clic en overlay
    if (goalsModal) {
        goalsModal.addEventListener('click', function(event) {
            if (event.target === goalsModal) {
                goalsModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && goalsModal && goalsModal.style.display === 'flex') {
            goalsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Funciones globales para botones en popup
    window.editGoal = function(goalId) {
        const goal = allGoalsData.find(g => g.id === goalId);
        if (goal) {
            showNotification(`Editando: ${goal.title}`, 'info');
        }
    };
    
    window.addToGoal = function(goalId) {
        const goal = allGoalsData.find(g => g.id === goalId);
        if (goal) {
            showNotification(`Añadiendo dinero a: ${goal.title}`, 'info');
        }
    };
    
    // ========== FUNCIONES UTILITARIAS ==========
    
    // Actualizar fecha
    function updateDate() {
        const now = new Date();
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        const formattedDate = now.toLocaleDateString('es-ES', options);
        const dateElement = document.querySelector('.date-container');
        if (dateElement) {
            dateElement.textContent = formattedDate;
        }
    }
    
    updateDate();
    
    // Actualizar círculos de progreso
    function updateProgressCircles() {
        document.querySelectorAll('.progress-circle-fill, .goals-modal-progress-circle .progress-circle-fill').forEach(circle => {
            const progress = circle.style.getPropertyValue('--progress');
            const circumference = 100;
            const offset = circumference - (progress / 100 * circumference);
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = offset;
        });
    }
    
    updateProgressCircles();
    
    // Inicializar todas las funciones al cargar
    setTimeout(() => {
        updateProgressCircles();
        
        // Inicializar drag-and-drop al cargar la página
        deleteTagArea = document.getElementById('delete-tag-area');
        deleteIndicator = document.getElementById('delete-indicator');
        
        if (deleteTagArea) {
            initializeDragAndDrop();
        }
        
        // Cargar etiquetas del servidor al cargar la página
        loadTagsFromServer();
    }, 100);
});