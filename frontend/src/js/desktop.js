// desktop.js

// ========== FUNCIONES AUXILIARES GENERALES ==========
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2)
        return decodeURIComponent(parts.pop().split(";").shift());
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "52, 211, 153";
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r}, ${g}, ${b}`;
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch (e) {
        return dateString;
    }
}

// ========== GESTIÓN DE CUENTAS BANCARIAS (Lógica Real) ==========

// 1. Variable vacía (se llenará desde la BD)
let accountsData = {};

// Elementos DOM de Cuentas
const accountCard = document.getElementById("accountCard"); // El contenedor principal
const accountSelect = document.getElementById("bankAccountSelect");
const bankNameElement = document.querySelector(".bank-name");
const accountTypeElement = document.querySelector(".account-type");
const bankLogoElement = document.querySelector(".bank-logo i");
const ibanElement = document.querySelector(".iban-number");
const balanceElement = document.querySelector(".balance-amount");

/**
 * Cargar cuentas desde el servidor (Laravel API)
 */
async function loadAccountsFromServer() {
    console.log("Cargando cuentas...");
    
    // 1. ACTIVAR MODO CARGA
    if(accountCard) accountCard.classList.add("is-loading");

    try {
        // Simulamos un pequeño retardo artificial para que se aprecie la animación 
        // (puedes quitar el setTimeout en producción, pero ayuda a ver el efecto)
        await new Promise(r => setTimeout(r, 800)); 

        const response = await fetch("/api/accounts", {
            headers: { "Accept": "application/json" },
            credentials: "same-origin",
        });

        if (response.ok) {
            const accounts = await response.json();
            
            // Mapeo de datos (Asegúrate de usar los nombres de TU base de datos)
            accountsData = {}; 
            accounts.forEach(acc => {
                accountsData[acc.id] = {
                    bankName: acc.bank_name, 
                    accountType: "Cuenta Corriente", // Valor fijo si no viene de BD
                    iban: acc.iban,
                    balance: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(acc.current_balance),
                    logoIcon: getBankIcon(acc.bank_name), 
                };
            });

            renderAccountDropdown(accounts);
            
            if (accounts.length > 0) {
                updateAccountInfo(accounts[0].id.toString());
            } else {
                // Manejar caso de 0 cuentas (opcional)
                bankNameElement.textContent = "Sin cuentas";
            }

            // 2. DESACTIVAR MODO CARGA (Datos listos)
            if(accountCard) accountCard.classList.remove("is-loading");

        } else {
            showNotification("Error al cargar cuentas", "error");
            if(accountCard) accountCard.classList.remove("is-loading");
        }
    } catch (error) {
        console.error("Error:", error);
        if(accountCard) accountCard.classList.remove("is-loading");
    }
}

/**
 * Pintar las opciones en el <select>
 */
function renderAccountDropdown(accounts) {
    if (!accountSelect) return;

    accountSelect.innerHTML = ""; // Limpiar "Cargando..."

    accounts.forEach(acc => {
        const option = document.createElement("option");
        option.value = acc.id;
        const shortIban = acc.iban ? acc.iban.slice(-4) : "????";
        option.textContent = `${acc.bank_name} - **** ${shortIban}`;
        accountSelect.appendChild(option);
    });
}


function updateAccountInfo(accountId) {
    const account = accountsData[accountId];
    if (!account) return;

    // Solo actualizamos lo que existe en el HTML nuevo
    bankNameElement.textContent = account.bankName;
    accountTypeElement.textContent = account.accountType;
    bankLogoElement.className = account.logoIcon;
    ibanElement.textContent = account.iban;
    balanceElement.textContent = account.balance;
    
    // Como hemos borrado fecha, interes y estado del HTML, 
    // borramos esas líneas del JS para que no den error.
}
/**
 * Elegir icono según el nombre del banco
 */
function getBankIcon(bankName) {
    const name = (bankName || "").toLowerCase();
    if (name.includes("caixa")) return "fas fa-star";
    if (name.includes("bbva")) return "fas fa-location-arrow"; 
    if (name.includes("santander")) return "fas fa-fire";
    if (name.includes("ing")) return "fas fa-lion";
    return "fas fa-university"; 
}

/**
 * Actualizar la tarjeta visual de la cuenta
 */
function updateAccountInfo(accountId) {
    const account = accountsData[accountId];
    if (!account) return;

    // Solo actualizamos lo que existe en el HTML nuevo
    bankNameElement.textContent = account.bankName;
    accountTypeElement.textContent = account.accountType;
    bankLogoElement.className = account.logoIcon;
    ibanElement.textContent = account.iban;
    balanceElement.textContent = account.balance;
    
    // Como hemos borrado fecha, interes y estado del HTML, 
    // borramos esas líneas del JS para que no den error.
}

// Event Listener para cambio de cuenta
if (accountSelect) {
    accountSelect.addEventListener("change", function () {
        updateAccountInfo(this.value);
    });
}

// Botones copiar IBAN
const copyButtons = document.querySelectorAll(".copy-btn");
copyButtons.forEach((button) => {
    button.addEventListener("click", function () {
        const iban = ibanElement.textContent;
        navigator.clipboard.writeText(iban)
            .then(() => {
                const originalIcon = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i>';
                this.style.color = "var(--income-green)";
                setTimeout(() => {
                    this.innerHTML = originalIcon;
                    this.style.color = "";
                }, 2000);
            })
            .catch(() => alert("No se pudo copiar el IBAN."));
    });
});


// ========== GESTIÓN DE ETIQUETAS (TAGS) ==========

async function loadTagsFromServer() {
    console.log("Cargando etiquetas...");
    try {
        const response = await fetch("/api/tags", {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            credentials: "same-origin",
        });

        if (response.ok) {
            const tags = await response.json();
            if (typeof renderTags === "function") {
                renderTags(tags);
            }
            return tags;
        } else {
            console.warn("No se pudieron cargar etiquetas");
        }
    } catch (error) {
        console.error("Error de red tags:", error);
    }
}

function renderTags(tags) {
    const tagsList = document.querySelector(".tags-list");
    const deleteTagArea = document.getElementById("delete-tag-area");

    if (!tagsList) return;

    // Limpiar viejas (manteniendo el área de borrar)
    document.querySelectorAll(".tag-item").forEach((tag) => {
        if (!tag.classList.contains("delete-tag-item")) {
            tag.remove();
        }
    });

    tags.forEach((tag) => {
        const tagElement = document.createElement("div");
        tagElement.className = "tag-item";
        tagElement.setAttribute("draggable", "true");
        tagElement.setAttribute("data-id", tag.id.toString());
        tagElement.style.setProperty("--tag-color", tag.color);

        tagElement.innerHTML = `
            <div class="tag-icon" style="background-color: rgba(${hexToRgb(tag.color)}, 0.1); color: ${tag.color};">
                <i class="fas fa-${tag.icon || "tag"}"></i>
            </div>
            <div class="tag-info">
                <h3>${tag.name}</h3>
                <p>${tag.created_at ? "Creada: " + formatDate(tag.created_at) : "Etiqueta"}</p>
            </div>
        `;
        tagsList.insertBefore(tagElement, deleteTagArea);
    });

    initializeDragAndDrop();
}

// ========== SISTEMA DRAG & DROP ETIQUETAS ==========

let deleteTagArea = null;
let deleteIndicator = null;

function initializeDragAndDrop() {
    if (!deleteTagArea) deleteTagArea = document.getElementById("delete-tag-area");
    if (!deleteIndicator) deleteIndicator = document.getElementById("delete-indicator");

    const tagItems = document.querySelectorAll(".tag-item:not(.delete-tag-item)");

    tagItems.forEach((tag) => {
        tag.removeEventListener("dragstart", handleDragStart);
        tag.removeEventListener("dragend", handleDragEnd);
        tag.addEventListener("dragstart", handleDragStart);
        tag.addEventListener("dragend", handleDragEnd);
        tag.setAttribute("draggable", "true");
    });

    if (deleteTagArea) {
        deleteTagArea.removeEventListener("dragover", handleDragOver);
        deleteTagArea.removeEventListener("dragleave", handleDragLeave);
        deleteTagArea.removeEventListener("drop", handleDrop);
        
        deleteTagArea.addEventListener("dragover", handleDragOver);
        deleteTagArea.addEventListener("dragleave", handleDragLeave);
        deleteTagArea.addEventListener("drop", handleDrop);
    }
}

function handleDragStart(e) {
    e.dataTransfer.setData("text/plain", this.getAttribute("data-id"));
    this.classList.add("dragging");
    if (deleteIndicator) {
        deleteIndicator.textContent = "Arrastra a la zona roja para eliminar";
        deleteIndicator.classList.add("active");
    }
}

function handleDragEnd() {
    this.classList.remove("dragging");
    if (deleteIndicator) deleteIndicator.classList.remove("active");
    if (deleteTagArea) {
        deleteTagArea.classList.remove("drag-over");
        deleteTagArea.style.transform = "scale(1)";
    }
}

function handleDragOver(e) {
    e.preventDefault();
    if (deleteTagArea) {
        deleteTagArea.classList.add("drag-over");
        deleteTagArea.style.transform = "scale(1.02)";
    }
}

function handleDragLeave() {
    if (deleteTagArea) {
        deleteTagArea.classList.remove("drag-over");
        deleteTagArea.style.transform = "scale(1)";
    }
}

async function handleDrop(e) {
    e.preventDefault();
    const tagId = e.dataTransfer.getData("text/plain");
    const tagToDelete = document.querySelector(`.tag-item[data-id="${tagId}"]:not(.delete-tag-item)`);

    if (!tagToDelete) return;

    if (!confirm("¿Estás seguro de eliminar esta etiqueta?")) {
        if (deleteTagArea) deleteTagArea.classList.remove("drag-over");
        return;
    }

    tagToDelete.style.opacity = "0.5";

    try {
        await fetch("/sanctum/csrf-cookie"); // Refresh CSRF
        const response = await fetch(`/api/tags/${tagId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
            },
            credentials: "same-origin",
        });

        if (response.ok) {
            tagToDelete.remove();
            showNotification("Etiqueta eliminada", "success");
            loadTagsFromServer(); // Recargar lista
        } else {
            showNotification("No se pudo eliminar (¿Está en uso?)", "error");
            tagToDelete.style.opacity = "1";
        }
    } catch (error) {
        console.error(error);
        tagToDelete.style.opacity = "1";
    }
    
    if (deleteTagArea) deleteTagArea.classList.remove("drag-over");
}

// ========== CREACIÓN DE ETIQUETAS (MODAL) ==========

const tagModal = document.getElementById("tagModal");
const addTagBtn = document.getElementById("desktop-add-tag");
const closeModal = document.getElementById("closeModal");
const cancelTag = document.getElementById("cancelTag");
const saveTag = document.getElementById("saveTag");
const tagNameInput = document.getElementById("tagName");
let selectedColor = "#34d399";
let selectedIcon = "dumbbell";

// Setup Listeners Modal
if (addTagBtn) {
    addTagBtn.addEventListener("click", () => {
        if(tagNameInput) tagNameInput.value = "";
        tagModal.showModal();
    });
}
if (closeModal) closeModal.addEventListener("click", () => tagModal.close());
if (cancelTag) cancelTag.addEventListener("click", () => tagModal.close());

// Color Pickers
document.querySelectorAll(".color-option").forEach(opt => {
    opt.addEventListener("click", function() {
        document.querySelectorAll(".color-option").forEach(o => o.classList.remove("selected"));
        this.classList.add("selected");
        selectedColor = this.getAttribute("data-color");
    });
});

// Icon Pickers
document.querySelectorAll(".icon-option").forEach(opt => {
    opt.addEventListener("click", function() {
        document.querySelectorAll(".icon-option").forEach(o => o.classList.remove("selected"));
        this.classList.add("selected");
        selectedIcon = this.getAttribute("data-icon");
    });
});

if (saveTag) {
    saveTag.addEventListener("click", async () => {
        const name = tagNameInput.value.trim();
        if(!name) return showNotification("Pon un nombre", "error");

        saveTag.disabled = true;
        try {
            const response = await fetch("/api/tags", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-XSRF-TOKEN": getCookie("XSRF-TOKEN")
                },
                credentials: "same-origin",
                body: JSON.stringify({ name, color: selectedColor, icon: selectedIcon })
            });

            if(response.ok) {
                tagModal.close();
                showNotification("Creada correctamente", "success");
                loadTagsFromServer();
            } else {
                showNotification("Error al crear", "error");
            }
        } catch(e) {
            console.error(e);
        } finally {
            saveTag.disabled = false;
        }
    });
}

// ========== NOTIFICACIONES ==========

function showNotification(message, type) {
    // (Tu función de notificaciones original, resumida aquí para no ocupar espacio pero mantenla igual)
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `<div class="notification-content"><span>${message}</span></div>`;
    notification.style.cssText = `position: fixed; top: 100px; right: 20px; background: ${type === 'error' ? '#ef4444' : '#10b981'}; color: white; padding: 12px; border-radius: 8px; z-index: 9999;`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ========== INICIALIZACIÓN PRINCIPAL ==========

document.addEventListener("DOMContentLoaded", function () {
    console.log("Desktop.js cargado e iniciando...");
    
    // 1. Cargar Etiquetas
    loadTagsFromServer();
    
    // 2. Cargar Cuentas Bancarias (¡Ahora real!)
    loadAccountsFromServer();
    
    // 3. Inicializar Drag and Drop
    setTimeout(initializeDragAndDrop, 500);
});