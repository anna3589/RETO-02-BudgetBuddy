// tarjetas.js - Спрощена версія без CSRF

document.addEventListener('DOMContentLoaded', function () {
    // ==========================================
    // 1. КОНФІГУРАЦІЯ API
    // ==========================================
    const API = {
        CARDS: {
            INDEX: '/api/cards',
            STORE: '/api/cards',
            DESTROY: '/api/cards/',
        },
        TAGS: {
            INDEX: '/api/tags',
        },
        MOVEMENTS: {
            INDEX: '/api/movements',
            STORE: '/api/movements',
        },
        ACCOUNTS: {
            INDEX: '/api/accounts',
        }
    };

    // ==========================================
    // 2. ЗМІННІ
    // ==========================================
    let currentCards = [];
    let currentTags = [];
    let currentMovements = [];
    let selectedCardId = null;
    let draggedCardId = null;

    // ==========================================
    // 3. DOM ЕЛЕМЕНТИ
    // ==========================================
    const dom = {
        cardAccountSelect: document.getElementById('cardAccountSelect'),
        cardsContainer: document.getElementById('cards-container'),
        transactionsBody: document.getElementById('transactions-body'),
        filterButtons: document.querySelectorAll('.filter-btn'),
        createMovementBtn: document.getElementById('createMovementBtn'),
        cardModal: document.getElementById('cardModal'),
        closeCardModal: document.getElementById('closeCardModal'),
        cancelCardBtn: document.getElementById('cancelCardBtn'),
        saveCardBtn: document.getElementById('saveCardBtn'),
        createCardForm: document.getElementById('createCardForm'),
        movementModal: document.getElementById('movementModal'),
        closeMovementModal: document.getElementById('closeMovementModal'),
        cancelMovementBtn: document.getElementById('cancelMovementBtn'),
        saveMovementBtn: document.getElementById('saveMovementBtn'),
        movementForm: document.getElementById('movementForm'),
        movementCardSelect: document.getElementById('movementCard'),
        movementCategorySelect: document.getElementById('movementCategory'),
        dateContainer: document.getElementById('current-date')
    };

    // ==========================================
    // 4. ДОПОМІЖНІ ФУНКЦІЇ
    // ==========================================
    function formatCurrency(amount) {
        if (amount === undefined || amount === null || isNaN(amount)) amount = 0;
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dateString || 'Fecha desconocida';
        }
    }

    function updateDate() {
        if (!dom.dateContainer) return;
        const now = new Date();
        dom.dateContainer.textContent = now.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    function showNotification(message, type = 'info') {
        const oldNotifications = document.querySelectorAll('.notification');
        oldNotifications.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Функція для API запитів (без CSRF)
    async function apiRequest(url, method = 'GET', data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
            options.body = JSON.stringify(data);
        }

        console.log(`API ${method} ${url}`, data);

        try {
            const response = await fetch(url, options);
            console.log(`Response ${response.status} from ${url}`);

            if (response.status === 401) {
                showNotification('Sesión expirada. Redirigiendo al login...', 'error');
                setTimeout(() => window.location.href = '/login', 2000);
                return null;
            }

            if (response.status === 422) {
                const errors = await response.json();
                const errorMessages = errors.errors ?
                    Object.values(errors.errors).flat().join(', ') :
                    errors.message || 'Error de validación';
                throw new Error(errorMessages);
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (response.status === 204 || method === 'DELETE') {
                return { success: true };
            }

            return await response.json();

        } catch (error) {
            console.error('API Error:', error);
            showNotification(`Error: ${error.message}`, 'error');
            throw error;
        }
    }

    // ==========================================
    // 5. ЗАВАНТАЖЕННЯ ДАНИХ
    // ==========================================
    async function loadCards() {
        try {
            const data = await apiRequest(API.CARDS.INDEX);
            if (data) {
                currentCards = Array.isArray(data) ? data : [];
                console.log(`Loaded ${currentCards.length} cards`);
                renderCardDropdown();
                renderCards();
                initializeDragAndDrop();

                if (currentCards.length > 0 && !selectedCardId) {
                    selectedCardId = currentCards[0].id;
                    if (dom.cardAccountSelect) {
                        dom.cardAccountSelect.value = selectedCardId;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading cards:', error);
            currentCards = [];
            renderCardDropdown();
            renderCards();
        }
    }

    async function loadTags() {
        try {
            const data = await apiRequest(API.TAGS.INDEX);
            if (data) {
                currentTags = Array.isArray(data) ? data : [];
                console.log(`Loaded ${currentTags.length} tags`);
                renderTagDropdown();
            }
        } catch (error) {
            console.error('Error loading tags:', error);
            currentTags = [];
        }
    }

    async function loadMovements() {
        try {
            let url = API.MOVEMENTS.INDEX;
            if (selectedCardId) {
                url += `?card_id=${selectedCardId}`;
            }

            const data = await apiRequest(url);
            if (data) {
                currentMovements = Array.isArray(data) ? data : [];
                console.log(`Loaded ${currentMovements.length} movements`);
                renderMovements();
            }
        } catch (error) {
            console.error('Error loading movements:', error);
            currentMovements = [];
            renderMovements();
        }
    }

    async function deleteCard(cardId) {
        try {
            if (!confirm('¿Estás seguro de eliminar esta tarjeta? Esta acción no se puede deshacer.')) {
                return false;
            }

            const result = await apiRequest(`${API.CARDS.DESTROY}${cardId}`, 'DELETE');
            if (result && result.success) {
                showNotification('Tarjeta eliminada correctamente', 'success');
                await loadCards();
                await loadMovements();
                return true;
            }
        } catch (error) {
            console.error('Error deleting card:', error);
            showNotification('Error al eliminar la tarjeta', 'error');
            return false;
        }
    }

    async function createMovement(movementData) {
        try {
            console.log('Creating movement:', movementData);

            // Для витрат робимо суму негативною
            if (movementData.type === 'gasto') {
                movementData.amount = -Math.abs(movementData.amount);
            }

            const result = await apiRequest(API.MOVEMENTS.STORE, 'POST', movementData);
            if (result) {
                showNotification('Movimiento creado correctamente', 'success');
                await loadMovements();
                return true;
            }
        } catch (error) {
            console.error('Error creating movement:', error);
            return false;
        }
    }

    async function createCard(cardData) {
        try {
            console.log('Creating card:', cardData);
            const result = await apiRequest(API.CARDS.STORE, 'POST', cardData);
            if (result) {
                showNotification('Tarjeta creada correctamente', 'success');
                await loadCards();
                return true;
            }
        } catch (error) {
            console.error('Error creating card:', error);
            return false;
        }
    }

    // ==========================================
    // 6. РЕНДЕРИНГ ІНТЕРФЕЙСУ
    // ==========================================
    function renderCardDropdown() {
        if (!dom.cardAccountSelect) return;

        dom.cardAccountSelect.innerHTML = '';

        if (currentCards.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay tarjetas';
            dom.cardAccountSelect.appendChild(option);
            return;
        }

        currentCards.forEach(card => {
            const option = document.createElement('option');
            option.value = card.id;
            const shortDigits = card.last_4_digits || '0000';
            option.textContent = `${card.alias} - **** ${shortDigits}`;
            dom.cardAccountSelect.appendChild(option);
        });

        if (currentCards.length > 0 && !selectedCardId) {
            selectedCardId = currentCards[0].id;
            dom.cardAccountSelect.value = selectedCardId;
        }
    }

    function renderCards() {
        if (!dom.cardsContainer) return;

        dom.cardsContainer.innerHTML = '';

        if (currentCards.length === 0) {
            dom.cardsContainer.innerHTML = `
                <div class="no-cards-message">
                    <i class="fas fa-credit-card"></i>
                    <h3>No tienes tarjetas</h3>
                    <p>Añade tu primera tarjeta para empezar</p>
                    <button onclick="openCardModal()" class="btn-primary">
                        <i class="fas fa-plus"></i> Añadir tarjeta
                    </button>
                </div>
            `;
            return;
        }

        // Рендеримо картки
        currentCards.forEach((card) => {
            const cardEl = document.createElement('div');
            let visualType = card.type === "credit" ? "mastercard" : "visa";

            cardEl.className = `mini-card ${visualType}`;
            cardEl.setAttribute('draggable', 'true');
            cardEl.setAttribute('data-card-id', card.id.toString());

            // Форматуємо дату
            let expDateFormatted = "??/??";
            if (card.expiration_date) {
                try {
                    const dateObj = new Date(card.expiration_date);
                    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
                    const year = dateObj.getFullYear().toString().slice(-2);
                    expDateFormatted = `${month}/${year}`;
                } catch (e) { }
            }

            // Баланс
            const balance = card.account?.current_balance || card.account?.balance || 0;

            cardEl.innerHTML = `
                <div class="mini-card-top">
                    <span style="font-weight: 500; font-size: 0.9rem;">${card.alias}</span>
                    <i class="fab fa-cc-${visualType}" style="font-size: 1.8rem; opacity: 0.9;"></i>
                </div>
                <div class="mini-card-number">
                    **** **** **** ${card.last_4_digits || "0000"}
                </div>
                <div class="mini-card-bottom">
                    <div>
                        <div style="font-size: 0.7rem; opacity: 0.7; margin-bottom:2px;">Saldo</div>
                        <div style="font-weight: bold; font-size: 1.1rem;">${formatCurrency(balance)}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.6rem; opacity: 0.7;">Expira</div>
                        <div style="font-size: 0.8rem">${expDateFormatted}</div>
                    </div>
                </div>
            `;

            cardEl.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedCardId = card.id;
                if (dom.cardAccountSelect) {
                    dom.cardAccountSelect.value = selectedCardId;
                }
                showNotification(`Seleccionada: ${card.alias}`, 'info');
                loadMovements();
            });

            dom.cardsContainer.appendChild(cardEl);
        });

        // Примарна картка
        const ghostCard = document.createElement('div');
        ghostCard.className = 'mini-card ghost-card';
        ghostCard.innerHTML = `
            <div class="ghost-content">
                <div class="ghost-icon">
                    <i class="fas fa-plus"></i>
                </div>
                <span style="font-size: 0.9rem; font-weight: 500;">Nueva Tarjeta</span>
            </div>
        `;
        ghostCard.addEventListener('click', openCardModal);
        dom.cardsContainer.appendChild(ghostCard);

        // Зона видалення
        createDeleteZone();

        // Скрол
        initializeHorizontalScroll();
    }

    function createDeleteZone() {
        const oldZone = document.getElementById('deleteCardZone');
        if (oldZone) oldZone.remove();

        const deleteZone = document.createElement('div');
        deleteZone.className = 'delete-card-zone';
        deleteZone.id = 'deleteCardZone';
        deleteZone.innerHTML = `
            <div class="delete-card-icon">
                <i class="fas fa-trash"></i>
            </div>
            <div class="delete-card-text">
                <h4>Eliminar tarjeta</h4>
                <p>Arrastra aquí para eliminar</p>
            </div>
        `;

        if (dom.cardsContainer) {
            dom.cardsContainer.appendChild(deleteZone);
        }
    }

    function renderTagDropdown() {
        if (!dom.movementCategorySelect) return;

        dom.movementCategorySelect.innerHTML = '<option value="">Seleccionar etiqueta...</option>';

        currentTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.id;
            option.textContent = tag.name;
            option.style.color = tag.color || '#000000';
            dom.movementCategorySelect.appendChild(option);
        });
    }

    function renderMovements() {
        if (!dom.transactionsBody) return;

        dom.transactionsBody.innerHTML = '';

        if (currentMovements.length === 0) {
            dom.transactionsBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        <i class="fas fa-exchange-alt" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                        No hay movimientos registrados
                    </td>
                </tr>`;
            return;
        }

        currentMovements.forEach(movement => {
            const row = document.createElement('tr');

            let tagHTML = '<span class="category-tag" style="background-color: #9ca3af;">Sin categoría</span>';
            if (movement.tags && movement.tags.length > 0) {
                tagHTML = movement.tags.map(tag =>
                    `<span class="category-tag" style="background-color: ${tag.color || '#9ca3af'};">${tag.name}</span>`
                ).join('');
            }

            let amountClass = 'amount-income';
            const amount = parseFloat(movement.amount) || 0;

            if (movement.type === 'gasto' || amount < 0) {
                amountClass = 'amount-expense';
            } else if (movement.type === 'traspaso') {
                amountClass = 'amount-transfer';
            }

            const formattedAmount = amount >= 0 ?
                `+€${Math.abs(amount).toFixed(2)}` :
                `-€${Math.abs(amount).toFixed(2)}`;

            row.innerHTML = `
                <td>${movement.description || 'Sin descripción'}</td>
                <td>#${movement.id || 'N/A'}</td>
                <td>${formatDate(movement.date || movement.created_at)}</td>
                <td class="${amountClass}">${formattedAmount}</td>
                <td><div class="category-tags">${tagHTML}</div></td>
            `;

            dom.transactionsBody.appendChild(row);
        });
    }

    function initializeHorizontalScroll() {
        const container = dom.cardsContainer;
        if (!container) return;

        container.style.overflowX = 'auto';
        container.style.overflowY = 'hidden';
        container.style.cursor = 'grab';

        let isDragging = false;
        let startX;
        let scrollLeft;

        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            container.style.cursor = 'grabbing';
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('mouseleave', () => {
            isDragging = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('mouseup', () => {
            isDragging = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });

        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            container.scrollLeft += e.deltaY;
        }, { passive: false });
    }

    // ==========================================
    // 7. DRAG & DROP
    // ==========================================
    function initializeDragAndDrop() {
        const cardItems = document.querySelectorAll('.mini-card:not(.ghost-card)');
        const deleteZone = document.getElementById('deleteCardZone');

        if (!deleteZone) {
            console.warn('Delete zone not found!');
            return;
        }

        cardItems.forEach((card) => {
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);
        });

        deleteZone.addEventListener('dragover', handleDragOver);
        deleteZone.addEventListener('dragleave', handleDragLeave);
        deleteZone.addEventListener('drop', handleDrop);
    }

    function handleDragStart(e) {
        draggedCardId = this.getAttribute('data-card-id');
        e.dataTransfer.setData('text/plain', draggedCardId);
        this.classList.add('dragging');

        const deleteZone = document.getElementById('deleteCardZone');
        if (deleteZone) {
            deleteZone.classList.add('active');
        }
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        const deleteZone = document.getElementById('deleteCardZone');
        if (deleteZone) {
            deleteZone.classList.remove('active', 'drag-over');
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        const deleteZone = document.getElementById('deleteCardZone');
        if (deleteZone) {
            deleteZone.classList.add('drag-over');
        }
    }

    function handleDragLeave() {
        const deleteZone = document.getElementById('deleteCardZone');
        if (deleteZone) {
            deleteZone.classList.remove('drag-over');
        }
    }

    async function handleDrop(e) {
        e.preventDefault();

        const deleteZone = document.getElementById('deleteCardZone');
        if (deleteZone) {
            deleteZone.classList.remove('drag-over');
        }

        if (!draggedCardId) return;

        const card = currentCards.find(c => c.id.toString() === draggedCardId);
        if (!card) return;

        const success = await deleteCard(draggedCardId);
        if (success) {
            draggedCardId = null;
        }
    }

    // ==========================================
    // 8. ФУНКЦІЇ МОДАЛІВ
    // ==========================================
    function openCardModal() {
        loadAccountsForCardModal();

        const now = new Date();
        const nextYear = new Date(now.getFullYear() + 4, now.getMonth(), 1);
        const month = (nextYear.getMonth() + 1).toString().padStart(2, '0');
        const year = nextYear.getFullYear();

        const expInput = document.getElementById('card-exp');
        if (expInput) {
            expInput.value = `${year}-${month}`;
        }

        if (dom.cardModal) {
            dom.cardModal.showModal();
        }
    }

    async function loadAccountsForCardModal() {
        try {
            const data = await apiRequest(API.ACCOUNTS.INDEX);
            const select = document.getElementById('card-account-select');

            if (select && data) {
                select.innerHTML = '<option value="">Seleccionar cuenta...</option>';
                data.forEach(account => {
                    const option = document.createElement('option');
                    option.value = account.id;
                    const shortIban = account.iban ? account.iban.slice(-4) : '????';
                    option.textContent = `${account.bank_name} - **** ${shortIban}`;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    }

    function openMovementModal() {
        if (dom.movementCardSelect) {
            dom.movementCardSelect.innerHTML = '';

            if (currentCards.length === 0) {
                dom.movementCardSelect.innerHTML = '<option value="">No hay tarjetas disponibles</option>';
            } else {
                currentCards.forEach(card => {
                    const option = document.createElement('option');
                    option.value = card.id;
                    const shortDigits = card.last_4_digits || '0000';
                    option.textContent = `${card.alias} (**** ${shortDigits})`;
                    dom.movementCardSelect.appendChild(option);
                });

                if (selectedCardId) {
                    dom.movementCardSelect.value = selectedCardId;
                }
            }
        }

        if (dom.movementCategorySelect) {
            renderTagDropdown();
        }

        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('movementDate');
        if (dateInput) dateInput.value = today;

        if (dom.movementModal) {
            dom.movementModal.showModal();
        }
    }

    // ==========================================
    // 9. ОБРОБНИКИ ПОДІЙ
    // ==========================================
    if (dom.cardAccountSelect) {
        dom.cardAccountSelect.addEventListener('change', function () {
            selectedCardId = this.value;
            loadMovements();
        });
    }

    if (dom.filterButtons) {
        dom.filterButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                dom.filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const filter = this.getAttribute('data-filter');
                let filteredMovements = currentMovements;

                if (filter === 'income') {
                    filteredMovements = currentMovements.filter(m => parseFloat(m.amount) > 0);
                } else if (filter === 'expense') {
                    filteredMovements = currentMovements.filter(m => parseFloat(m.amount) < 0);
                }

                const tempBody = document.getElementById('transactions-body');
                if (tempBody) {
                    tempBody.innerHTML = '';
                    filteredMovements.forEach(movement => {
                        const row = document.createElement('tr');
                        const amount = parseFloat(movement.amount) || 0;
                        const amountClass = amount >= 0 ? 'amount-income' : 'amount-expense';
                        const formattedAmount = amount >= 0 ?
                            `+€${Math.abs(amount).toFixed(2)}` :
                            `-€${Math.abs(amount).toFixed(2)}`;

                        row.innerHTML = `
                            <td>${movement.description || 'Sin descripción'}</td>
                            <td>#${movement.id || 'N/A'}</td>
                            <td>${formatDate(movement.date || movement.created_at)}</td>
                            <td class="${amountClass}">${formattedAmount}</td>
                            <td><div class="category-tags">${movement.tags ? movement.tags.map(t => `<span class="category-tag">${t.name}</span>`).join('') : ''}</div></td>
                        `;
                        tempBody.appendChild(row);
                    });
                }

                showNotification(`Filtro aplicado: ${this.textContent}`, 'info');
            });
        });
    }

    if (dom.createMovementBtn) {
        dom.createMovementBtn.addEventListener('click', openMovementModal);
    }

    if (dom.closeCardModal) {
        dom.closeCardModal.addEventListener('click', () => {
            if (dom.cardModal) dom.cardModal.close();
        });
    }

    if (dom.cancelCardBtn) {
        dom.cancelCardBtn.addEventListener('click', () => {
            if (dom.cardModal) dom.cardModal.close();
        });
    }

    if (dom.saveCardBtn) {
        dom.saveCardBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            const accountId = document.getElementById('card-account-select').value;
            const alias = document.getElementById('card-alias').value;
            const digits = document.getElementById('card-digits').value;
            const expInput = document.getElementById('card-exp').value;
            const typeRadio = document.querySelector('input[name="card_type"]:checked');

            if (!accountId || !alias || !digits || !expInput || digits.length !== 4 || !/^\d{4}$/.test(digits)) {
                showNotification('Por favor, complete todos los campos correctamente', 'error');
                return;
            }

            const expDate = expInput + '-01';

            const originalText = dom.saveCardBtn.innerHTML;
            dom.saveCardBtn.disabled = true;
            dom.saveCardBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

            try {
                const cardData = {
                    account_id: parseInt(accountId),
                    alias: alias,
                    type: typeRadio.value,
                    last_4_digits: digits,
                    expiration_date: expDate
                };

                const success = await createCard(cardData);
                if (success) {
                    dom.cardModal.close();
                    dom.createCardForm.reset();
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                dom.saveCardBtn.disabled = false;
                dom.saveCardBtn.innerHTML = originalText;
            }
        });
    }

    if (dom.closeMovementModal) {
        dom.closeMovementModal.addEventListener('click', () => {
            if (dom.movementModal) dom.movementModal.close();
        });
    }

    if (dom.cancelMovementBtn) {
        dom.cancelMovementBtn.addEventListener('click', () => {
            if (dom.movementModal) dom.movementModal.close();
        });
    }

    if (dom.saveMovementBtn) {
        dom.saveMovementBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            const movementData = {
                card_id: parseInt(dom.movementCardSelect.value),
                tag_id: dom.movementCategorySelect.value ? parseInt(dom.movementCategorySelect.value) : null,
                amount: Math.abs(parseFloat(document.getElementById('movementAmount').value)),
                description: document.getElementById('movementDescription').value,
                date: document.getElementById('movementDate').value,
                type: document.querySelector('input[name="movement_type"]:checked').value
            };

            if (!movementData.amount || isNaN(movementData.amount) ||
                !movementData.description || !movementData.card_id) {
                showNotification('Por favor, complete todos los campos obligatorios', 'error');
                return;
            }

            const originalText = dom.saveMovementBtn.innerHTML;
            dom.saveMovementBtn.disabled = true;
            dom.saveMovementBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

            try {
                console.log('Saving movement data:', movementData);
                const success = await createMovement(movementData);
                if (success) {
                    dom.movementModal.close();
                    dom.movementForm.reset();
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                dom.saveMovementBtn.disabled = false;
                dom.saveMovementBtn.innerHTML = originalText;
            }
        });
    }
    // Elemento del DOM
    const userAvatarTop = document.querySelector(".user-avatar-top");

    // 1. ESTADO DE CARGA (Spinner)
    userAvatarTop.innerHTML = `
    <div style="text-align: center; padding: 40px; color: var(--color-gray-500);">
        <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>
    </div>`;
    /**
    * Carga el usuario logueado y actualiza el avatar
    */
    async function loadUserProfile() {
        console.log("Cargando perfil de usuario...");

        try {
            // Petición estándar a Laravel para obtener el usuario autenticado
            const response = await fetch("/api/user", {
                headers: { Accept: "application/json" },
                credentials: "same-origin",
            });

            if (response.ok) {
                const user = await response.json();
                // Asumimos que tu tabla users tiene una columna 'name'
                updateAvatarUI(user.name);
            }
        } catch (error) {
            console.error("Error cargando usuario:", error);
            showNotification("Error cargando perfil de usuario", "error");
        }
    }

    /**
     * Calcula las iniciales y actualiza el círculo del header
     * Ej: "Juan Pérez" -> "JP"
     */
    function updateAvatarUI(fullName) {
        if (!userAvatarTop || !fullName) return;

        // Dividimos el nombre por espacios
        const parts = fullName.trim().split(" ");

        // Tomamos la primera letra del primer nombre
        let initials = parts[0].charAt(0).toUpperCase();

        // Si hay apellido (o segundo nombre), tomamos su inicial también
        if (parts.length > 1) {
            initials += parts[parts.length - 1].charAt(0).toUpperCase();
        }

        userAvatarTop.textContent = initials;
        // Opcional: poner el nombre completo en el título al pasar el ratón
        userAvatarTop.title = fullName;
    }
    // ==========================================
    // 10. ІНІЦІАЛІЗАЦІЯ
    // ==========================================
    async function init() {
        console.log('Initializing tarjetas.js...');
        updateDate();

        try {
            await Promise.all([
                loadCards(),
                loadTags(),
                loadMovements()
            ]);

            showNotification('Sistema cargado correctamente', 'success');
        } catch (error) {
            console.error('Error during initialization:', error);
            showNotification('Error al cargar los datos', 'error');
        }

        setInterval(updateDate, 60000);
    }



    window.openCardModal = openCardModal;
    init();
});