// api-estadisticas.js - Versión corregida sin errores

// Datos simulados (sin API por CORS)
const etfData = {
    sp500: {
        nombre: "SPDR S&P 500 ETF",
        simbolo: "SPY",
        precio: 451.42,
        cambio: +0.19,
        cambioPorcentaje: +0.04,
        color: "#217a4a",
        historial1D: [450.10, 451.80, 449.50, 452.30, 451.42],
        max: 452.89,
        min: 449.67,
        volumen: "23.4M",
        mercado: "NYSE"
    },
    msci: {
        nombre: "iShares MSCI World",
        simbolo: "URTH",
        precio: 120.45,
        cambio: 0.00,
        cambioPorcentaje: 0.00,
        color: "#3b82f6",
        historial1D: [119.20, 120.10, 119.80, 121.20, 120.45],
        max: 121.80,
        min: 119.20,
        volumen: "5.8M",
        mercado: "NYSE"
    },
    ibex: {
        nombre: "Amundi IBEX 35 ETF",
        simbolo: "CBIX",
        precio: 17719.00,
        cambio: +38.50,
        cambioPorcentaje: +0.22,
        color: "#ef4444",
        historial1D: [17680.50, 17700.00, 17720.00, 17740.00, 17719.00],
        max: 17744.60,
        min: 17680.50,
        volumen: "1.2M",
        mercado: "BME"
    }
};

let charts = {};
let currentTimeframe = "1D";

document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ BudgetBuddy - Estadísticas cargadas");
    
    // 1. ФІКС для header (СУПЕР-ПРОСТИЙ)
    fixHeaderIssue();
    
    // 2. Actualizar fecha
    updateCurrentDate();
    
    // 3. Configurar botones de tiempo
    setupTimeButtons();
    
    // 4. Inicializar todos los datos y gráficos
    initializeEverything();
    
    // 5. Configurar eventos
    setupEventListeners();
    
    // 6. Simular actualización de datos
    startDataSimulation();
});

// ============ ФІКС ДЛЯ HEADER ============
function fixHeaderIssue() {
    const header = document.querySelector('.desktop-header');
    if (!header) {
        console.warn('⚠️ Header no encontrado, pero continuamos...');
        return;
    }
    
    console.log('🎯 Aplicando estilos al header...');
    
    // ВИДАЛИТИ всі inline-стилі
    header.removeAttribute('style');
    
    // Примусово застосувати прозорість
    header.style.cssText = `
        position: fixed !important;
        top: 20px !important;
        left: 30px !important;
        right: 20px !important;
        height: 70px !important;
        background: rgba(255, 255, 255, 0.25) !important;
        backdrop-filter: blur(40px) saturate(200%) contrast(120%) !important;
        -webkit-backdrop-filter: blur(40px) saturate(200%) contrast(120%) !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        padding: 0 30px !important;
        z-index: 1000 !important;
        border-radius: 50px !important;
        border: 1px solid #757575 !important;
        box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.08),
            0 1px 0 rgba(255, 255, 255, 0.5) inset,
            0 -1px 0 rgba(0, 0, 0, 0.05) inset !important;
        transition: all 0.5s ease !important;
        overflow: hidden !important;
    `;
    
    // Ефект при скролі
    window.addEventListener('scroll', function() {
        if (window.scrollY > 20) {
            header.style.background = 'rgba(255, 255, 255, 0.95) !important';
            header.style.backdropFilter = 'blur(60px) saturate(200%) !important';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.25) !important';
            header.style.backdropFilter = 'blur(40px) saturate(200%) contrast(120%) !important';
        }
    });
}

// ============ ІНІЦІАЛІЗАЦІЯ ============
function initializeEverything() {
    // Оновити всі UI елементи
    updateAllUI();
    
    // Створити всі графіки
    createAllCharts();
    
    // Оновити статус ринку
    updateMarketStatus();
}

function updateAllUI() {
    // Оновити всі дані
    Object.keys(etfData).forEach(etfId => {
        updateETFUI(etfId);
    });
}

function updateETFUI(etfId) {
    const etf = etfData[etfId];
    const isPositive = etf.cambio >= 0;
    const symbol = etfId === 'ibex' ? '€' : '$';
    const priceFormat = etfId === 'ibex' ? 
        etf.precio.toLocaleString('es-ES', {minimumFractionDigits: 2}) : 
        etf.precio.toFixed(2);
    
    // Оновити ціну та зміну
    const priceElement = document.getElementById(`${etfId}-price`);
    const changeElement = document.getElementById(`${etfId}-change`);
    
    if (priceElement) {
        priceElement.textContent = `${symbol}${priceFormat}`;
    }
    
    if (changeElement) {
        changeElement.textContent = `${isPositive ? '+' : ''}${etf.cambio.toFixed(2)} (${isPositive ? '+' : ''}${etf.cambioPorcentaje.toFixed(2)}%)`;
        changeElement.className = `change ${isPositive ? 'positive' : 'negative'}`;
    }
    
    // Оновити статистики
    const highElement = document.getElementById(`${etfId}-high`);
    const lowElement = document.getElementById(`${etfId}-low`);
    const volumeElement = document.getElementById(`${etfId}-volume`);
    
    if (highElement) highElement.textContent = `${symbol}${etfId === 'ibex' ? etf.max.toLocaleString('es-ES', {minimumFractionDigits: 2}) : etf.max.toFixed(2)}`;
    if (lowElement) lowElement.textContent = `${symbol}${etfId === 'ibex' ? etf.min.toLocaleString('es-ES', {minimumFractionDigits: 2}) : etf.min.toFixed(2)}`;
    if (volumeElement) volumeElement.textContent = etf.volumen;
}

// ============ ГРАФІКИ ============
function createAllCharts() {
    // Графіки для кожного ETF
    createETFChart('sp500');
    createETFChart('msci');
    createETFChart('ibex');
    
    // Графік порівняння
    createComparisonChart();
}

function createETFChart(etfId) {
    const canvas = document.getElementById(`${etfId}-chart`);
    if (!canvas) {
        console.warn(`⚠️ Canvas no encontrado: ${etfId}-chart`);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const etf = etfData[etfId];
    
    // Якщо графік вже існує - знищити
    if (charts[etfId]) {
        charts[etfId].destroy();
    }
    
    const labels = getLabelsForTimeframe(currentTimeframe);
    const data = getChartData(etfId, currentTimeframe);
    
    charts[etfId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                borderColor: etf.color,
                backgroundColor: etf.color + '20',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: etf.color,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const symbol = etfId === 'ibex' ? '€' : '$';
                            const value = etfId === 'ibex' ? 
                                context.parsed.y.toLocaleString('es-ES', {minimumFractionDigits: 2}) : 
                                context.parsed.y.toFixed(2);
                            return `${symbol}${value}`;
                        }
                    }
                }
            },
            scales: {
                x: { 
                    display: false 
                },
                y: {
                    ticks: {
                        callback: function(value) {
                            const symbol = etfId === 'ibex' ? '€' : '$';
                            const formatted = etfId === 'ibex' ? 
                                value.toLocaleString('es-ES', {minimumFractionDigits: 0}) : 
                                value.toFixed(0);
                            return symbol + formatted;
                        }
                    }
                }
            }
        }
    });
}

function createComparisonChart() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) {
        console.warn('⚠️ Canvas no encontrado: performanceChart');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    
    // Якщо графік вже існує - знищити
    if (charts.comparison) {
        charts.comparison.destroy();
    }
    
    charts.comparison = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'IBEX 35',
                    data: [0, 2.8, 5.2, 7.5, 10.1, 12.3],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    fill: true
                },
                {
                    label: 'S&P 500',
                    data: [0, 3.2, 6.1, 9.5, 12.8, 15.2],
                    borderColor: '#217a4a',
                    backgroundColor: 'rgba(33, 122, 74, 0.1)',
                    borderWidth: 3,
                    fill: true
                },
                {
                    label: 'MSCI World',
                    data: [0, 2.5, 4.8, 7.3, 9.7, 11.5],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            family: "'Roboto', sans-serif",
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// ============ ДОПОМІЖНІ ФУНКЦІЇ ============
function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long', 
        year: 'numeric'
    };
    const dateStr = now.toLocaleDateString('es-ES', options);
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = dateStr;
    }
}

function setupTimeButtons() {
    const buttons = document.querySelectorAll('.time-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTimeframe = this.dataset.timeframe;
            updateChartsTimeframe();
        });
    });
}

function updateChartsTimeframe() {
    Object.keys(etfData).forEach(etfId => {
        if (charts[etfId]) {
            charts[etfId].data.labels = getLabelsForTimeframe(currentTimeframe);
            charts[etfId].data.datasets[0].data = getChartData(etfId, currentTimeframe);
            charts[etfId].update('none');
        }
    });
}

function getLabelsForTimeframe(timeframe) {
    switch(timeframe) {
        case '1D': return ['9:30', '11:00', '12:30', '14:00', '16:00'];
        case '1W': return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        case '1M': return ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
        case '3M': return ['Mes 1', 'Mes 2', 'Mes 3'];
        case '1Y': return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        default: return ['Punto 1', 'Punto 2', 'Punto 3', 'Punto 4', 'Punto 5'];
    }
}

function getChartData(etfId, timeframe) {
    // Просто повертаємо дані для 1D
    // Можна розширити для інших timeframe
    return etfData[etfId].historial1D;
}

function updateMarketStatus() {
    const now = new Date();
    const hour = now.getHours();
    const isMarketOpen = hour >= 9 && hour < 17;
    
    // Функція для безпечного оновлення елемента
    function safeUpdate(elementId, text, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
            if (className) {
                element.className = className;
            }
        } else {
            console.warn(`⚠️ Elemento no encontrado: ${elementId}`);
        }
    }
    
    // Оновити статуси
    safeUpdate('sp500-status', isMarketOpen ? 'Mercado Abierto' : 'Mercado Cerrado', 
              `market-status ${isMarketOpen ? 'open' : 'closed'}`);
    
    safeUpdate('msci-status', isMarketOpen ? 'Mercado Abierto' : 'Mercado Cerrado',
              `market-status ${isMarketOpen ? 'open' : 'closed'}`);
    
    // IBEX має інший графік (іспанський)
    const isSpanishMarketOpen = hour >= 9 && hour < 17.5;
    safeUpdate('ibex-status', isSpanishMarketOpen ? 'Mercado Abierto' : 'Mercado Cerrado',
              `market-status ${isSpanishMarketOpen ? 'open' : 'closed'}`);
}

function startDataSimulation() {
    // Симулювати зміни даних кожні 30 секунд
    setInterval(() => {
        simulateDataUpdate();
    }, 30000);
}

function simulateDataUpdate() {
    Object.keys(etfData).forEach(etfId => {
        const etf = etfData[etfId];
        
        // Невелика випадкова зміна
        const change = (Math.random() - 0.5) * (etfId === 'ibex' ? 30 : 0.5);
        etf.precio += change;
        etf.cambio += change;
        etf.cambioPorcentaje = (etf.cambio / (etf.precio - etf.cambio)) * 100;
        
        // Оновити UI
        updateETFUI(etfId);
        
        // Оновити графік
        if (charts[etfId] && currentTimeframe === '1D') {
            const data = charts[etfId].data.datasets[0].data;
            data.push(etf.precio);
            if (data.length > 10) data.shift();
            charts[etfId].update('none');
        }
    });
}

function setupEventListeners() {
    // Кнопка сповіщень
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            showNotification('📊 Datos actualizados correctamente', 'info');
        });
    }
    
    // Кнопка пошуку
    const searchBtn = document.querySelector('.top-icon[title="Buscar"]');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            showNotification('🔍 Función de búsqueda en desarrollo', 'info');
        });
    }
    
    // Картки освіти
    document.querySelectorAll('.edu-card').forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent;
            const desc = this.querySelector('p').textContent;
            showNotification(`📚 ${title}: ${desc}`, 'info');
        });
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    let icon = 'info-circle';
    let bgColor = '#3b82f6';
    
    if (type === 'success') {
        icon = 'check-circle';
        bgColor = '#10b981';
    }
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-family: 'Roboto', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Додати стилі анімації
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

console.log('🎉 Módulo de estadísticas listo para usar');