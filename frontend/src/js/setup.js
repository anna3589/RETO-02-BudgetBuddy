document.addEventListener("DOMContentLoaded", async function () {
    let currentStep = 1;
    const totalSteps = 4;

    // --- 1. CARGAR DATOS INICIALES (Si el usuario ya tiene nombre en DB) ---
    try {
        const res = await fetch('/api/profile', {
            headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
            const user = await res.json();
            // Pre-rellenar nombre si existe
            if (user.name) document.getElementById('setup_firstname').value = user.name;
            // Pre-rellenar email hidden si fuera necesario, aunque lo cogeremos del fetch interno
        }
    } catch (e) {
        console.error("Error cargando usuario inicial", e);
    }

    // --- 2. GESTIÓN DE NAVEGACIÓN ---
    
    // Función global para que funcione en el HTML onclick="goToStep(x)"
    window.goToStep = async function(step) {
        // Si intentamos avanzar desde el paso 1, guardamos perfil primero
        if (currentStep === 1 && step > 1) {
            const saved = await saveProfileStep();
            if (!saved) return; // Si falla, no avanzamos
        }

        // Lógica visual de cambio de paso
        showStep(step);
    };

    // Listener específico para el botón del paso 1 (para poder hacerlo async)
    document.getElementById('btn-step-1').addEventListener('click', () => window.goToStep(2));

    function showStep(step) {
        // Ocultar todos
        document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.step-dot').forEach(el => el.classList.remove('active'));

        // Mostrar actual
        document.getElementById(`step-${step}`).classList.add('active');
        
        // Actualizar dots (activa todos los anteriores hasta el actual)
        for(let i=1; i<=step; i++) {
            document.getElementById(`dot-${i}`).classList.add('active');
        }
        // Desactivar los futuros
        for(let i=step+1; i<=totalSteps; i++) {
            document.getElementById(`dot-${i}`).classList.remove('active');
        }

        // Actualizar número en header
        document.getElementById('step-number').innerText = step;
        currentStep = step;
    }

    // --- 3. LÓGICA DE GUARDADO PERFIL (Paso 1) ---
    async function saveProfileStep() {
        const btn = document.getElementById('btn-step-1');
        const originalText = btn.innerHTML;
        const firstName = document.getElementById('setup_firstname').value.trim();
        const lastName = document.getElementById('setup_lastname').value.trim();
        const phone = document.getElementById('setup_phone').value.trim();

        // Validación simple Frontend
        if (!firstName || !lastName) {
            alert("Por favor, completa nombre y apellidos.");
            return false;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            // Necesitamos el email actual para pasar la validación del backend
            const userRes = await fetch('/api/profile', { headers: {'Accept': 'application/json'} });
            const user = await userRes.json();

            // CSRF
            await fetch('/sanctum/csrf-cookie'); 

            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: user.email, // Importante para que no falle la validación unique
                    phone: phone
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Error al guardar perfil");
            }
            
            return true; // Todo OK

        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
            return false;
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    // --- 4. GESTIÓN DE TOGGLES (Tarjeta / Sobre) ---
    window.toggleSection = function(section) {
        const fields = document.getElementById(`${section}-fields`);
        const checkbox = document.getElementById(`has_${section}`);
        const toggleDiv = document.getElementById(`toggle-${section}`);

        if (fields.style.display === 'none') {
            fields.style.display = 'block';
            checkbox.checked = true;
            toggleDiv.classList.add('active');
            // Scroll suave hacia los campos
            setTimeout(() => fields.scrollIntoView({behavior: 'smooth', block: 'center'}), 100);
        } else {
            fields.style.display = 'none';
            checkbox.checked = false;
            toggleDiv.classList.remove('active');
        }
    };

    // --- 5. SUBMIT FINAL (Cuentas + Tarjetas + Sobres) ---
    document.getElementById('setup-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const btn = document.getElementById('btn-submit');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finalizando...';

        try {
            // A. CREAR CUENTA (Obligatorio)
            // Lógica para obtener el IBAN completo
            const country = document.getElementById('iban_country').value;
            const number = document.getElementById('iban_number').value;
            const fullIban = country + number;

            if(number.length < 5) throw new Error("El IBAN no parece válido");

            const accountData = {
                bank_name: document.getElementById('bank_name').value,
                iban: fullIban,
                current_balance: document.getElementById('current_balance').value,
                color: document.getElementById('account_color').value // Asumiendo que tu selector de color actualiza este input hidden
            };

            await fetch('/sanctum/csrf-cookie');
            
            const accRes = await fetch('/api/accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
                },
                body: JSON.stringify(accountData)
            });

            if(!accRes.ok) throw new Error("Error creando la cuenta bancaria");
            const accData = await accRes.json();
            const accountId = accData.account.id; // Necesario para asociar tarjeta y sobre

            // B. CREAR TARJETA (Opcional)
            if(document.getElementById('has_card').checked) {
                const cardData = {
                    account_id: accountId,
                    alias: document.getElementById('card_alias').value,
                    type: document.querySelector('input[name="card_type"]:checked').value,
                    last_four_digits: document.getElementById('card_digits').value,
                    expiration_date: document.getElementById('card_expiration').value + "-01" // Formato YYYY-MM-DD
                };
                
                await fetch('/api/cards', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
                    },
                    body: JSON.stringify(cardData)
                });
            }

            // C. CREAR SOBRE (Opcional)
            if(document.getElementById('has_envelope').checked) {
                // Aquí deberías tener un input hidden o lógica para el icono seleccionado
                // Asumo que tienes un input hidden id="env_icon" que se actualiza al clicar los iconos
                const iconElement = document.querySelector('.icon-option.selected');
                const iconClass = iconElement ? iconElement.dataset.icon : 'fas fa-wallet';

                const envData = {
                    account_id: accountId,
                    name: document.getElementById('env_name').value,
                    target_amount: document.getElementById('env_target').value,
                    current_amount: document.getElementById('env_allocated').value,
                    icon: iconClass
                };

                await fetch('/api/envelopes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
                    },
                    body: JSON.stringify(envData)
                });
            }

            // D. FIN -> REDIRIGIR
            window.location.href = '/dashboard.html'; // O la ruta de tu dashboard

        } catch (error) {
            console.error(error);
            alert("Hubo un error: " + error.message);
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });

    // Lógica visual del selector de colores (mantenida de tu código original si existía)
    document.querySelectorAll('.color-circle').forEach(circle => {
        circle.addEventListener('click', function() {
            document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('account_color').value = this.dataset.color;
        });
    });

    // Lógica visual del selector de iconos (mantenida)
    document.querySelectorAll('.icon-option').forEach(icon => {
        icon.addEventListener('click', function() {
            document.querySelectorAll('.icon-option').forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            // Aquí no tienes un input hidden en el HTML que me pasaste, 
            // pero el código de envío lo usa (iconElement.dataset.icon)
        });
    });
});

// Helper cookie
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}