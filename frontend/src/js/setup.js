/**
 * setup.js
 * Lógica para el Wizard de Configuración Inicial
 */

// ======================================================
// 1. FUNCIONES AUXILIARES GLOBALES
// ======================================================

/**
 * Obtiene el valor de una cookie por su nombre (necesario para CSRF)
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
}

// ======================================================
// 2. INICIO DE LA APLICACIÓN
// ======================================================

document.addEventListener("DOMContentLoaded", async function () {
    // Variables de estado
    let currentStep = 1;
    const totalSteps = 4;

    // ------------------------------------------------------
    // A. CARGA INICIAL DE DATOS
    // ------------------------------------------------------
    try {
        const res = await fetch("/api/profile", {
            headers: { "Accept": "application/json" },
            credentials: 'same-origin'
        });
        if (res.ok) {
            const user = await res.json();
            if (user.name) document.getElementById("setup_firstname").value = user.name;
        }
    } catch (e) {
        console.error("Error cargando usuario inicial", e);
    }

    // ------------------------------------------------------
    // B. LÓGICA VISUAL E INTERACCIÓN (UI)
    // ------------------------------------------------------

    /**
     * Función global para navegar entre pasos (usada en el HTML)
     */
    window.goToStep = async function (step) {
        // Si intentamos pasar del paso 1 al 2, guardamos el perfil primero
        if (currentStep === 1 && step > 1) {
            const saved = await saveProfileStep();
            if (!saved) return; // Si falla, no avanzamos
        }
        showStep(step);
    };

    // Listener para el botón "Siguiente" del primer paso
    const btnStep1 = document.getElementById("btn-step-1");
    if (btnStep1) btnStep1.addEventListener("click", () => window.goToStep(2));

    /**
     * Muestra el paso indicado y actualiza la barra de progreso
     */
    function showStep(step) {
        // Gestionar visibilidad de secciones
        document.querySelectorAll(".step-content").forEach((el) => el.classList.remove("active"));
        const stepEl = document.getElementById(`step-${step}`);
        if (stepEl) stepEl.classList.add("active");

        // Gestionar los puntos (dots) de la cabecera
        document.querySelectorAll(".step-dot").forEach((el) => el.classList.remove("active"));
        for (let i = 1; i <= step; i++) {
            const dot = document.getElementById(`dot-${i}`);
            if (dot) dot.classList.add("active");
        }

        // Actualizar número en el texto
        const stepNum = document.getElementById("step-number");
        if (stepNum) stepNum.innerText = step;

        currentStep = step;
    }

    /**
     * Muestra/Oculta secciones opcionales (Tarjeta y Sobres)
     */
    window.toggleSection = function (section) {
        const fields = document.getElementById(`${section}-fields`);
        const checkbox = document.getElementById(`has_${section}`);
        const toggleDiv = document.getElementById(`toggle-${section}`);

        if (fields.style.display === "none") {
            fields.style.display = "block";
            checkbox.checked = true;
            toggleDiv.classList.add("active");
            // Scroll suave hacia la sección abierta
            setTimeout(() => fields.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
        } else {
            fields.style.display = "none";
            checkbox.checked = false;
            toggleDiv.classList.remove("active");
        }
    };

    // Selección de ICONOS (UI)
    const iconOptions = document.querySelectorAll(".icon-option");
    iconOptions.forEach((option) => {
        option.addEventListener("click", function () {
            iconOptions.forEach((opt) => opt.classList.remove("selected"));
            this.classList.add("selected");
        });
    });

    // Selección de COLORES (UI)
    const colorOptions = document.querySelectorAll(".color-circle");
    colorOptions.forEach((option) => {
        option.addEventListener("click", function () {
            colorOptions.forEach((opt) => opt.classList.remove("selected"));
            this.classList.add("selected");
            const hiddenInput = document.getElementById("account_color");
            if (hiddenInput) hiddenInput.value = this.dataset.color;
        });
    });

    // ------------------------------------------------------
    // C. LÓGICA DE INPUTS (FORMATO IBAN)
    // ------------------------------------------------------
    
    const ibanInput = document.getElementById('iban_number');
    if (ibanInput) {
        // Formatear mientras se escribe (espacios cada 4 dígitos)
        ibanInput.addEventListener('input', function (e) {
            let target = e.target;
            // Eliminar todo lo que no sea número y limitar a 22 dígitos
            let input = target.value.replace(/\D/g, '').substring(0, 22);
            
            // Añadir espacios visuales
            let formatted = input.match(/.{1,4}/g)?.join(' ') || '';
            target.value = formatted;
            
            // Feedback visual (Verde si completo, normal si no)
            if (input.length === 22) {
                target.style.borderColor = "#10b981";
            } else {
                target.style.borderColor = "";
            }
        });

        // Validar al salir del campo
        ibanInput.addEventListener('blur', function() {
            let input = this.value.replace(/\D/g, '');
            if (input.length > 0 && input.length < 22) {
                this.style.borderColor = "#ef4444"; // Rojo si está incompleto
            }
        });
    }

    // ------------------------------------------------------
    // D. COMUNICACIÓN CON API (GUARDADO)
    // ------------------------------------------------------

    /**
     * Guarda el Paso 1 (Perfil de Usuario)
     */
    async function saveProfileStep() {
        const btn = document.getElementById("btn-step-1");
        const originalText = btn.innerHTML;
        const firstName = document.getElementById("setup_firstname").value.trim();
        const lastName = document.getElementById("setup_lastname").value.trim();
        const phone = document.getElementById("setup_phone").value.trim();

        if (!firstName || !lastName) {
            alert("Por favor, completa nombre y apellidos.");
            return false;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ...';

        try {
            // 1. Obtener datos actuales (necesitamos el email para no perderlo)
            const userRes = await fetch("/api/profile", {
                headers: { "Accept": "application/json" },
                credentials: 'same-origin'
            });
            const user = await userRes.json();

            // 2. Refrescar seguridad
            await fetch("/sanctum/csrf-cookie");

            // 3. Enviar actualización
            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: user.email,
                    phone: phone,
                }),
            });

            if (!response.ok) throw new Error("Error al guardar perfil");
            return true;
        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
            return false;
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    // ------------------------------------------------------
    // E. SUBMIT FINAL (CREACIÓN DE CUENTAS)
    // ------------------------------------------------------
    
    const form = document.getElementById("setup-form");
    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const btn = document.getElementById("btn-submit");
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finalizando...';

            try {
                // 1. Preparar seguridad
                await fetch("/sanctum/csrf-cookie");
                const csrfToken = getCookie("XSRF-TOKEN");
                const commonHeaders = {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                };

                // 2. Recopilar datos de CUENTA BANCARIA
                const country = document.getElementById("iban_country").value;
                // Limpiamos los espacios del IBAN antes de enviar
                const numberRaw = document.getElementById("iban_number").value.replace(/\s+/g, '');

                if (numberRaw.length !== 22) {
                    throw new Error("El IBAN debe tener 24 caracteres (ES + 22 dígitos).");
                }

                const accountData = {
                    bank_name: document.getElementById("bank_name").value,
                    iban: country + numberRaw,
                    current_balance: document.getElementById("current_balance").value,
                    color: document.getElementById("account_color").value,
                };

                // 3. Crear CUENTA
                const accRes = await fetch("/api/accounts", {
                    method: "POST",
                    headers: commonHeaders,
                    credentials: "same-origin",
                    body: JSON.stringify(accountData),
                });

                if (!accRes.ok) {
                    const errorData = await accRes.json();
                    throw new Error(errorData.message || "Error al crear cuenta");
                }
                
                const accResult = await accRes.json();
                const accountId = accResult.account.id;

                // 4. Crear TARJETA (Opcional)
                if (document.getElementById("has_card").checked) {
                    const typeRadio = document.querySelector('input[name="card_type"]:checked');
                    const cardType = typeRadio ? typeRadio.value : "debit";
                    let expDate = document.getElementById("card_expiration").value;
                    if (expDate) expDate += "-01";

                    await fetch("/api/cards", {
                        method: "POST",
                        headers: commonHeaders,
                        credentials: "same-origin",
                        body: JSON.stringify({
                            account_id: accountId,
                            alias: document.getElementById("card_alias").value,
                            type: cardType,
                            last_4_digits: document.getElementById("card_digits").value,
                            expiration_date: expDate,
                            balance: 0,
                        }),
                    });
                }

                // 5. Crear SOBRE (Opcional)
                if (document.getElementById("has_envelope").checked) {
                    const selectedIconDiv = document.querySelector(".icon-option.selected");
                    const iconClass = selectedIconDiv ? selectedIconDiv.getAttribute("data-icon") : "fas fa-piggy-bank";

                    await fetch("/api/envelopes", {
                        method: "POST",
                        headers: commonHeaders,
                        credentials: "same-origin",
                        body: JSON.stringify({
                            account_id: accountId,
                            name: document.getElementById("env_name").value,
                            target_amount: document.getElementById("env_target").value,
                            allocated_amount: document.getElementById("env_allocated").value || 0,
                            icon: iconClass,
                        }),
                    });
                }

                // 6. ¡ÉXITO! Redirigir
                window.location.href = "/dashboard";

            } catch (error) {
                console.error(error);
                alert("Ocurrió un error: " + error.message);
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }
});