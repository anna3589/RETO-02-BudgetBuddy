document.addEventListener('DOMContentLoaded', function() {
    // ==========================================
    // 1. CONFIGURACIÓN Y ESTADO
    // ==========================================
    const selectedAccountId = localStorage.getItem('selectedAccountId') || 1;
    
    let currentCards = [];
    let currentInvoices = []; // Nueva variable para facturas
    let currentCardIndex = 0;

    // Referencias al DOM (Tarjetas y Transacciones)
    const dom = {
        cardsContainer: document.getElementById('cards-container'),
        cardsTitle: document.getElementById('cards-title'),
        cardCounter: document.getElementById('card-counter'),
        weeklyExpenses: document.getElementById('weekly-expenses'),
        availableBalance: document.getElementById('available-balance'),
        transactionsBody: document.getElementById('transactions-body'),
        prevBtn: document.querySelector('.prev-card-btn'),
        nextBtn: document.querySelector('.next-card-btn'),
        dateContainer: document.getElementById('current-date'),
        filterButtons: document.querySelectorAll('.filter-btn'),
        
        // Referencias de Facturas
        invoicesSummary: document.getElementById('invoices-summary-container'),
        viewAllInvoicesBtn: document.getElementById('viewAllInvoices'),
        
        // Referencias del Modal
        invoicesModal: document.getElementById('invoicesModal'),
        closeModalBtn: document.getElementById('closeModal'),
        modalInvoicesList: document.getElementById('modal-invoices-list'),
        modalTotalCount: document.getElementById('modal-total-count'),
        modalTotalAmount: document.getElementById('modal-total-amount')
    };

    // ==========================================
    // 2. SIMULACIÓN DE API
    // ==========================================
    async function fetchAccountData(accountId) {
        // Simulamos respuesta completa de la cuenta
        const mockData = {
            cards: [
                {
                    id: 101,
                    alias: "Tarjeta Principal",
                    type: "VISA",
                    number: "**** **** **** 3090",
                    balance: 1827.50,
                    expenses: 480.00,
                    expiry: "09/24",
                    cvv: "NB",
                    colorClass: "card-black",
                    transactions: [
                        { id: "#125", name: "Starbucks", amount: -25.90, date: "12 Mayo", type: "payment", icon: "fa-coffee" },
                        { id: "#126", name: "Transferencia", amount: 340.80, date: "12 Mayo", type: "income", icon: "fa-arrow-down" }
                    ]
                },
                {
                    id: 102,
                    alias: "Tarjeta Ahorro",
                    type: "MASTERCARD",
                    number: "**** **** **** 9800",
                    balance: 5250.00,
                    expenses: 120.00,
                    expiry: "12/26",
                    cvv: "NB",
                    colorClass: "card-blue",
                    transactions: []
                }
            ],
            // DATOS DE FACTURAS (Compartidos por la cuenta)
            invoices: [
                { id: 1, name: "Apple Store", desc: "Hardware", amount: -320.00, time: "Hace 12 min", icon: "fab fa-apple", color: "red" },
                { id: 2, name: "Netflix", desc: "Suscripción", amount: -12.99, time: "Hace 1 día", icon: "fas fa-film", color: "red" },
                { id: 3, name: "Spotify", desc: "Música", amount: -9.99, time: "Hace 2 días", icon: "fas fa-music", color: "green" },
                { id: 4, name: "Gimnasio", desc: "Salud", amount: -45.00, time: "Hace 5 días", icon: "fas fa-dumbbell", color: "red" },
                { id: 5, name: "Amazon", desc: "Compras", amount: -89.50, time: "Hace 1 semana", icon: "fab fa-amazon", color: "red" },
                { id: 6, name: "Iberdrola", desc: "Luz", amount: -120.00, time: "Hace 2 semanas", icon: "fas fa-lightbulb", color: "red" }
            ]
        };

        return new Promise(resolve => setTimeout(() => resolve(mockData), 500));
    }

    // ==========================================
    // 3. RENDERIZADO (UI)
    // ==========================================

    function renderCards() {
        if (currentCards.length === 0) {
            dom.cardsContainer.innerHTML = '<div class="no-data">No hay tarjetas.</div>';
            return;
        }
        dom.cardsContainer.innerHTML = '';
        currentCards.forEach((card, index) => {
            const displayStyle = index === currentCardIndex ? 'block' : 'none';
            const isActive = index === currentCardIndex ? 'active' : '';
            
            const cardHTML = `
                <div class="credit-card-compact ${card.colorClass} ${isActive}" style="display: ${displayStyle};">
                    <div class="card-type"><span>${card.type}</span><span>${formatCurrency(card.balance)}</span></div>
                    <div class="card-number">${card.number}</div>
                    <div class="card-details"><div class="card-expiry">Exp: ${card.expiry}</div><div class="card-cvv">${card.alias}</div></div>
                </div>`;
            dom.cardsContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
        updateUI();
    }

    function updateUI() {
        const card = currentCards[currentCardIndex];
        dom.cardsTitle.textContent = card.alias;
        dom.cardCounter.textContent = `${currentCardIndex + 1}/${currentCards.length}`;
        dom.weeklyExpenses.textContent = formatCurrency(card.expenses);
        dom.availableBalance.textContent = formatCurrency(card.balance);
        renderTransactions(card.transactions);
    }

    function renderTransactions(transactions, filter = 'all') {
        dom.transactionsBody.innerHTML = '';
        if (!transactions || transactions.length === 0) {
            dom.transactionsBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">Sin movimientos</td></tr>';
            return;
        }
        transactions.forEach(tx => {
            if (filter !== 'all' && tx.type !== filter) return;
            const amountClass = tx.type === 'income' ? 'positive' : 'negative';
            const iconColor = tx.type === 'income' ? 'green' : 'red';
            const row = `
                <tr class="transaction-row">
                    <td><div class="transaction-name"><div class="transaction-icon-small ${iconColor}"><i class="fas ${tx.icon}"></i></div>${tx.name}</div></td>
                    <td>${tx.id}</td><td>Terminal TPV</td><td>${tx.date}</td>
                    <td class="amount ${amountClass}">${formatCurrency(tx.amount)}</td>
                </tr>`;
            dom.transactionsBody.insertAdjacentHTML('beforeend', row);
        });
    }

    // --- NUEVO: Renderizado de Facturas ---
    
    function renderInvoices() {
        // 1. Resumen (Solo las 5 primeras)
        const summaryInvoices = currentInvoices.slice(0, 5);
        dom.invoicesSummary.innerHTML = summaryInvoices.map(inv => createInvoiceHTML(inv, 'invoice-item')).join('');

        // 2. Modal (Todas)
        dom.modalInvoicesList.innerHTML = currentInvoices.map(inv => createInvoiceHTML(inv, 'modal-invoice-item')).join('');
        
        // 3. Estadísticas del Modal
        dom.modalTotalCount.textContent = currentInvoices.length;
        const total = currentInvoices.reduce((acc, inv) => acc + inv.amount, 0);
        dom.modalTotalAmount.textContent = formatCurrency(total);
    }

    function createInvoiceHTML(inv, className) {
        // Adaptamos el HTML para usarlo tanto en resumen como en modal
        // En el modal la estructura es ligeramente distinta (clases con prefijo modal-)
        const isModal = className.includes('modal');
        const prefix = isModal ? 'modal-' : '';
        
        return `
            <div class="${className}">
                <div class="${prefix}invoice-left">
                    <div class="${prefix}invoice-icon ${inv.color}">
                        <i class="${inv.icon}"></i>
                    </div>
                    <div class="${prefix}invoice-info">
                        <h4>${inv.name}</h4>
                        <div class="${prefix}invoice-time">${inv.time} • ${inv.desc}</div>
                    </div>
                </div>
                <div class="${prefix}invoice-amount ${inv.amount > 0 ? '' : 'negative'}">
                    ${formatCurrency(inv.amount)}
                </div>
            </div>
        `;
    }

    // ==========================================
    // 4. EVENTOS Y MODAL
    // ==========================================

    dom.prevBtn.addEventListener('click', () => {
        if (currentCards.length === 0) return;
        currentCardIndex = (currentCardIndex - 1 + currentCards.length) % currentCards.length;
        renderCards();
    });

    dom.nextBtn.addEventListener('click', () => {
        if (currentCards.length === 0) return;
        currentCardIndex = (currentCardIndex + 1) % currentCards.length;
        renderCards();
    });

    dom.filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            dom.filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderTransactions(currentCards[currentCardIndex].transactions, this.getAttribute('data-filter'));
        });
    });

    // --- Lógica del Modal (Antes estaba en invoices-modal.js) ---
    dom.viewAllInvoicesBtn.addEventListener('click', () => {
        dom.invoicesModal.classList.add('active'); // O style.display = 'flex'
        dom.invoicesModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    function closeInvoicesModal() {
        dom.invoicesModal.classList.remove('active');
        dom.invoicesModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    dom.closeModalBtn.addEventListener('click', closeInvoicesModal);
    
    dom.invoicesModal.addEventListener('click', (e) => {
        if (e.target === dom.invoicesModal) closeInvoicesModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeInvoicesModal();
    });

    // ==========================================
    // 5. INICIALIZACIÓN
    // ==========================================
    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
    }

    function updateDate() {
        const now = new Date();
        dom.dateContainer.textContent = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    async function init() {
        updateDate();
        try {
            const data = await fetchAccountData(selectedAccountId);
            currentCards = data.cards;
            currentInvoices = data.invoices; // Guardamos facturas
            
            renderCards();
            renderInvoices(); // Renderizamos facturas
        } catch (error) {
            console.error(error);
            dom.cardsContainer.innerHTML = '<div class="error">Error cargando datos</div>';
        }
    }

    init();
});