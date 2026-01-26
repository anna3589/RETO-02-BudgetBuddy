// setup.js - VERSIÓN FINAL CORREGIDA

// 1. Lógica de selección de color (Visual)
const colorCircles = document.querySelectorAll('.color-circle');
const colorInput = document.getElementById('account_color');

if (colorCircles.length > 0) {
    colorCircles.forEach(circle => {
        circle.addEventListener('click', function() {
            colorCircles.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            colorInput.value = this.dataset.color;
        });
    });
}

// =========================================================
// 2. LÓGICA QUE FALTABA: MOSTRAR/OCULTAR TARJETA
// =========================================================
const checkbox = document.getElementById('has_card');
const cardFields = document.getElementById('card-fields');

if (checkbox && cardFields) {
    checkbox.addEventListener('change', function() {
        // Mostrar u ocultar el bloque
        cardFields.style.display = this.checked ? 'block' : 'none';
        
        // Hacer obligatorios los campos solo si el checkbox está marcado
        const requiredInputs = cardFields.querySelectorAll('input:not([type="radio"])');
        requiredInputs.forEach(input => {
            input.required = this.checked;
        });
    });
}
// =========================================================

// 3. Función Cookie
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

// 4. Envío del Formulario
const form = document.getElementById('setup-form');
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const btn = document.getElementById('btn-submit');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            // Inicializar CSRF
            await fetch('/sanctum/csrf-cookie', { method: 'GET' });

            // A. Guardar Cuenta
            const accountData = {
                bank_name: document.getElementById('bank_name').value,
                iban: document.getElementById('iban').value,
                current_balance: document.getElementById('current_balance').value,
                color: document.getElementById('account_color').value
            };

            const accResponse = await fetch('/api/accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
                },
                credentials: 'include',
                body: JSON.stringify(accountData)
            });

            if (accResponse.status === 401) {
                alert("Sesión expirada. Redirigiendo al login...");
                window.location.href = "/login";
                return;
            }

            if (!accResponse.ok) {
                const err = await accResponse.json().catch(() => ({}));
                throw new Error(err.message || "Error al crear cuenta");
            }

            const accResult = await accResponse.json();
            const accountId = accResult.account.id;

            // B. Guardar Tarjeta (Solo si el checkbox está marcado)
            if (checkbox.checked) {
                // Formatear fecha: de "2025-08" a "2025-08-01"
                let rawDate = document.getElementById('card_expiration').value; 
                let formattedDate = rawDate ? rawDate + "-01" : null;
                
                // Obtener tipo (radio button)
                const typeInput = document.querySelector('input[name="card_type"]:checked');
                const type = typeInput ? typeInput.value : 'debit';

                const cardData = {
                    account_id: accountId,
                    alias: document.getElementById('card_alias').value,
                    last_4_digits: document.getElementById('card_digits').value,
                    expiration_date: formattedDate,
                    type: type
                };

                const cardResponse = await fetch('/api/cards', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
                    },
                    credentials: 'include',
                    body: JSON.stringify(cardData)
                });
                
                if (!cardResponse.ok) {
                    console.error("Error guardando tarjeta:", await cardResponse.text());
                    // No lanzamos error aquí para que al menos redirija al dashboard si la cuenta se creó bien
                }
            }

            // ¡ÉXITO!
            window.location.href = "/dashboard";

        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });
}