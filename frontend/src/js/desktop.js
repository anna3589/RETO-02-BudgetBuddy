// desktop.js - Funcionalidades para la versión de escritorio

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const tagModal = document.getElementById('tagModal');
    const closeModal = document.getElementById('closeModal');
    const cancelTag = document.getElementById('cancelTag');
    const saveTag = document.getElementById('saveTag');
    const addTagBtn = document.getElementById('desktop-add-tag');
    const addNewTagCard = document.getElementById('add-new-tag');
    const colorOptions = document.querySelectorAll('.color-option');
    const iconOptions = document.querySelectorAll('.icon-option');
    
    let selectedColor = '#34d399';
    let selectedIcon = 'dumbbell';
    
    // Abrir modal al hacer clic en el botón de añadir etiqueta
    if (addTagBtn) {
        addTagBtn.addEventListener('click', () => {
            tagModal.showModal();
        });
    }
    
    // Abrir modal al hacer clic en la tarjeta de añadir etiqueta
    if (addNewTagCard) {
        addNewTagCard.addEventListener('click', () => {
            tagModal.showModal();
        });
    }
    
    // Cerrar modal
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
    
    // Seleccionar color
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedColor = this.getAttribute('data-color');
        });
    });
    
    // Seleccionar icono
    iconOptions.forEach(option => {
        option.addEventListener('click', function() {
            iconOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedIcon = this.getAttribute('data-icon');
        });
    });
    
    // Guardar nueva etiqueta
    if (saveTag) {
        saveTag.addEventListener('click', function() {
            const tagName = document.getElementById('tagName').value;
            const tagAmount = document.getElementById('tagAmount').value;
            
            if (!tagName.trim()) {
                alert('Por favor, ingresa un nombre para la etiqueta');
                return;
            }
            
            // Crear nueva tarjeta de etiqueta
            const tagsContainer = document.querySelector('.desktop-tags-container');
            const addTagCard = document.querySelector('.add-tag-card');
            
            const newTagCard = document.createElement('div');
            newTagCard.className = 'tag-card';
            newTagCard.style.setProperty('--tag-color', selectedColor);
            
            // Obtener el icono FA correspondiente
            const iconClass = `fas fa-${selectedIcon}`;
            
            newTagCard.innerHTML = `
                <div class="tag-icon" style="background-color: rgba(${hexToRgb(selectedColor)}, 0.1); color: ${selectedColor};">
                    <i class="${iconClass}"></i>
                </div>
                <div class="tag-info">
                    <h3>${tagName}</h3>
                    <p>${tagAmount ? tagAmount + '€ / mes' : 'Sin monto definido'}</p>
                </div>
                <div class="tag-amount">${tagAmount ? tagAmount + '€' : '0€'}</div>
            `;
            
            // Insertar antes del botón de añadir
            tagsContainer.insertBefore(newTagCard, addTagCard);
            
            // Resetear formulario
            document.getElementById('tagName').value = '';
            document.getElementById('tagAmount').value = '';
            
            // Cerrar modal
            tagModal.close();
            
            // Mostrar mensaje de éxito
            showNotification('Etiqueta creada exitosamente', 'success');
        });
    }
    
    // Notificaciones
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            showNotification('Tienes 3 notificaciones sin leer', 'info');
        });
    }
    
    // Hover effects para elementos de navegación
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f9fafb';
        });
        
        item.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.backgroundColor = 'transparent';
            }
        });
    });
    
    // Efecto hover para tarjetas de metas
    const goalCards = document.querySelectorAll('.goal-card-large');
    goalCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'var(--shadow)';
        });
    });
    
    // Funciones auxiliares
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return '52, 211, 153';
        
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        
        return `${r}, ${g}, ${b}`;
    }
    
    function showNotification(message, type) {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Estilos para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background-color: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 350px;
        `;
        
        document.body.appendChild(notification);
        
        // Botón para cerrar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // Añadir estilos CSS para animaciones de notificaciones
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }
    `;
    document.head.appendChild(style);
});