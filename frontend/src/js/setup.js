document.addEventListener("DOMContentLoaded", async function () {
    let currentStep = 1;
    const totalSteps = 4;

    // ==========================================
    // 1. CARGA INICIAL (PERFIL)
    // ==========================================
    try {
        const res = await fetch('/api/profile', {
            headers: { 
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include'
        });
        
        console.log("Profile status:", res.status);
        
        if (res.ok) {
            try {
                const user = await res.json();
                console.log("User data loaded:", user);
                if (user.name) {
                    document.getElementById('setup_firstname').value = user.name;
                }
            } catch (e) {
                console.log("Profile response is not JSON, skipping...");
            }
        }
    } catch (e) {
        console.error("Error cargando usuario inicial", e);
    }

    // ==========================================
    // 2. NAVEGACIÓN Y VISUAL (WIZARD)
    // ==========================================
    
    window.goToStep = async function(step) {
        if (currentStep === 1 && step > 1) {
            const saved = await saveProfileStep();
            if (!saved) return; 
        }
        showStep(step);
    };

    const btnStep1 = document.getElementById('btn-step-1');
    if(btnStep1) btnStep1.addEventListener('click', () => window.goToStep(2));

    function showStep(step) {
        document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.step-dot').forEach(el => el.classList.remove('active'));

        document.getElementById(`step-${step}`).classList.add('active');
        
        for(let i=1; i<=step; i++) {
            const dot = document.getElementById(`dot-${i}`);
            if(dot) dot.classList.add('active');
        }
        for(let i=step+1; i<=totalSteps; i++) {
            const dot = document.getElementById(`dot-${i}`);
            if(dot) dot.classList.remove('active');
        }

        const stepNum = document.getElementById('step-number');
        if(stepNum) stepNum.innerText = step;
        
        currentStep = step;
    }

    window.toggleSection = function(section) {
        const fields = document.getElementById(`${section}-fields`);
        const checkbox = document.getElementById(`has_${section}`);
        const toggleDiv = document.getElementById(`toggle-${section}`);

        if (fields.style.display === 'none') {
            fields.style.display = 'block';
            checkbox.checked = true;
            toggleDiv.classList.add('active');
            setTimeout(() => fields.scrollIntoView({behavior: 'smooth', block: 'center'}), 100);
        } else {
            fields.style.display = 'none';
            checkbox.checked = false;
            toggleDiv.classList.remove('active');
        }
    };

    const iconOptions = document.querySelectorAll('.icon-option');
    iconOptions.forEach(option => {
        option.addEventListener('click', function() {
            iconOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    const colorOptions = document.querySelectorAll('.color-circle');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            const hiddenInput = document.getElementById('account_color');
            if(hiddenInput) hiddenInput.value = this.dataset.color;
        });
    });

    // ==========================================
    // 3. FUNCIONES PARA IBAN (MEJORADO)
    // ==========================================

    function formatIBAN(iban) {
        const cleanIBAN = iban.replace(/\s/g, '');
        return cleanIBAN.replace(/(.{4})/g, '$1 ').trim();
    }

    function cleanIBAN(iban) {
        return iban.replace(/\s/g, '');
    }

    const ibanInput = document.getElementById('iban_number');
    if (ibanInput) {
        ibanInput.addEventListener('input', function(e) {
            const cursorPos = e.target.selectionStart;
            const originalValue = e.target.value;
            
            let cleanValue = originalValue.replace(/[^A-Za-z0-9]/g, '');
            cleanValue = cleanValue.toUpperCase();
            
            if (cleanValue.length > 24) {
                cleanValue = cleanValue.substring(0, 24);
            }
            
            let formattedValue = '';
            for (let i = 0; i < cleanValue.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += cleanValue[i];
            }
            
            e.target.value = formattedValue;
            
            const spacesBeforeCursor = (formattedValue.substring(0, cursorPos).match(/\s/g) || []).length;
            const originalSpaces = (originalValue.substring(0, cursorPos).match(/\s/g) || []).length;
            const newCursorPos = Math.min(
                cursorPos + (spacesBeforeCursor - originalSpaces),
                formattedValue.length
            );
            
            e.target.setSelectionRange(newCursorPos, newCursorPos);
        });

        ibanInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            
            let cleanPasted = pastedText.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
            cleanPasted = cleanPasted.substring(0, 24);
            
            const currentClean = cleanIBAN(ibanInput.value);
            const combined = (currentClean + cleanPasted).substring(0, 24);
            
            ibanInput.value = formatIBAN(combined);
        });
    }

    // ==========================================
    // 4. LÓGICA DE GUARDADO (API)
    // ==========================================

    // A. GUARDAR PERFIL (PASO 1) - FIXED CSRF
    async function saveProfileStep() {
        const btn = document.getElementById('btn-step-1');
        const originalText = btn.innerHTML;
        const firstName = document.getElementById('setup_firstname').value.trim();
        const lastName = document.getElementById('setup_lastname').value.trim();
        const phone = document.getElementById('setup_phone').value.trim();

        if (!firstName || !lastName) {
            alert("Por favor, completa nombre y apellidos.");
            return false;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ...';

        try {
            console.log("=== INICIANDO GUARDADO DE PERFIL ===");
            
            // 1. Obtener CSRF token PRIMERO
            console.log("1. Obteniendo CSRF token...");
            const csrfResponse = await fetch('/sanctum/csrf-cookie', {
                credentials: 'include'
            });
            console.log("CSRF response status:", csrfResponse.status);
            
            // 2. Obtener token de cookies
            const csrfToken = getCookie('XSRF-TOKEN');
            console.log("CSRF token from cookie:", csrfToken ? "OK" : "NOT FOUND");
            
            if (!csrfToken) {
                throw new Error("No se pudo obtener el token de seguridad. Recarga la página.");
            }

            // 3. Obtener email del usuario
            console.log("2. Obteniendo email del usuario...");
            const userRes = await fetch('/api/profile', {
                headers: {'Accept': 'application/json'},
                credentials: 'include'
            });
            
            let userEmail = '';
            if (userRes.ok) {
                try {
                    const user = await userRes.json();
                    userEmail = user.email || user.data?.email || '';
                    console.log("User email:", userEmail);
                } catch (e) {
                    console.warn("No se pudo obtener email, usando valor por defecto");
                }
            }

            // 4. Enviar actualización de perfil
            console.log("3. Enviando datos del perfil...");
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include',
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: userEmail || 'user@example.com', // Valor por defecto
                    phone: phone
                })
            });

            console.log("Profile update status:", response.status, response.statusText);
            
            if (!response.ok) {
                let errorMessage = "Error al guardar perfil";
                try {
                    const errorData = await response.json();
                    console.error("Error del servidor:", errorData);
                    errorMessage = errorData.message || errorMessage;
                    
                    if (response.status === 419) {
                        errorMessage = "Error de seguridad (CSRF). Por favor, recarga la página.";
                    }
                } catch (e) {
                    console.error("Error parsing response");
                }
                throw new Error(errorMessage);
            }
            
            console.log("✅ Perfil guardado exitosamente!");
            return true;

        } catch (error) {
            console.error("❌ Error completo:", error);
            alert("Error: " + error.message);
            return false;
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    // B. FINALIZAR (PASO 4 -> Submit del Formulario)
    const form = document.getElementById('setup-form');
    if(form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const btn = document.getElementById('btn-submit');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finalizando...';

            try {
                console.log("=== INICIANDO CONFIGURACIÓN COMPLETA ===");
                
                // 1. Obtener CSRF token
                console.log("1. Obteniendo CSRF token...");
                await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
                const csrfToken = getCookie('XSRF-TOKEN');
                
                if (!csrfToken) {
                    throw new Error("No se pudo obtener el token de seguridad");
                }
                console.log("CSRF token obtenido");

                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                };

                // 2. Preparar datos de cuenta
                const country = document.getElementById('iban_country').value;
                const number = document.getElementById('iban_number').value.replace(/\s/g, '');
                
                if (number.length < 4) {
                    throw new Error("El IBAN debe tener al menos 4 dígitos después del código de país");
                }
                
                const fullIBAN = country + number;
                console.log("Creando cuenta con IBAN:", fullIBAN);

                const accountData = {
                    bank_name: document.getElementById('bank_name').value,
                    iban: fullIBAN,
                    current_balance: document.getElementById('current_balance').value || 0,
                    color: document.getElementById('account_color').value || '#217A4A'
                };

                console.log("Datos de cuenta:", accountData);

                // 3. Crear cuenta bancaria
                console.log("3. Creando cuenta bancaria...");
                const accountRes = await fetch('/api/accounts', {
                    method: 'POST',
                    headers: headers,
                    credentials: 'include',
                    body: JSON.stringify(accountData)
                });

                if (!accountRes.ok) {
                    let errorMessage = "Error creando la cuenta bancaria";
                    try {
                        const errorData = await accountRes.json();
                        console.error("Error del servidor:", errorData);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch (e) {
                        const text = await accountRes.text();
                        console.error("Non-JSON response:", text.substring(0, 200));
                    }
                    throw new Error(errorMessage);
                }
                
                // Obtener ID de la cuenta creada
                let accountId = null;
                try {
                    const accountResult = await accountRes.json();
                    accountId = accountResult.account?.id || accountResult.id || accountResult.data?.id;
                    console.log("✅ Cuenta creada, ID:", accountId);
                } catch (e) {
                    console.warn("No se pudo obtener ID de cuenta, pero continuamos...");
                }

                // 4. Crear tarjeta (si está marcado)
                if(document.getElementById('has_card').checked && accountId) {
                    try {
                        console.log("4. Creando tarjeta...");
                        const typeRadio = document.querySelector('input[name="card_type"]:checked');
                        const cardType = typeRadio ? typeRadio.value : 'debit';
                        
                        let expDate = document.getElementById('card_expiration').value;
                        if(expDate) expDate += "-01";

                        const cardData = {
                            account_id: accountId,
                            alias: document.getElementById('card_alias').value,
                            last_four_digits: document.getElementById('card_digits').value,
                            expiration_date: expDate,
                            type: cardType
                        };
                        
                        console.log("Datos de tarjeta:", cardData);
                        
                        const cardRes = await fetch('/api/cards', {
                            method: 'POST',
                            headers: headers,
                            credentials: 'include',
                            body: JSON.stringify(cardData)
                        });
                        
                        if (cardRes.ok) {
                            console.log("✅ Tarjeta creada exitosamente");
                        } else {
                            const errorText = await cardRes.text();
                            console.warn("No se pudo crear la tarjeta:", errorText);
                        }
                    } catch (cardError) {
                        console.warn("Error creando tarjeta:", cardError);
                    }
                }

                // 5. Crear sobre (si está marcado)
                if(document.getElementById('has_envelope').checked && accountId) {
                    try {
                        console.log("5. Creando sobre...");
                        const selectedIconDiv = document.querySelector('.icon-option.selected');
                        const iconClass = selectedIconDiv ? selectedIconDiv.getAttribute('data-icon') : 'fas fa-piggy-bank';

                        const envData = {
                            account_id: accountId,
                            name: document.getElementById('env_name').value,
                            target_amount: document.getElementById('env_target').value,
                            current_amount: document.getElementById('env_allocated').value || 0,
                            icon: iconClass
                        };

                        console.log("Datos de sobre:", envData);

                        const envRes = await fetch('/api/envelopes', {
                            method: 'POST',
                            headers: headers,
                            credentials: 'include',
                            body: JSON.stringify(envData)
                        });
                        
                        if (envRes.ok) {
                            console.log("✅ Sobre creado exitosamente");
                        } else {
                            const errorText = await envRes.text();
                            console.warn("No se pudo crear el sobre:", errorText);
                        }
                    } catch (envError) {
                        console.warn("Error creando sobre:", envError);
                    }
                }

                // 6. Éxito -> Redirigir
                console.log("🎉 Configuración completada con éxito, redirigiendo...");
                
                btn.innerHTML = '<i class="fas fa-check-circle"></i> ¡Configuración completada!';
                btn.style.backgroundColor = '#10b981';
                btn.disabled = true;

                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);

            } catch (error) {
                console.error("❌ Error completo:", error);
                alert("Error: " + error.message);
                btn.disabled = false;
                btn.innerHTML = originalText;
                btn.style.backgroundColor = '';
            }
        });
    }
});

// Función auxiliar para las cookies (MEJORADA)
function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const cookieName = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        if (cookieName === name) {
            const cookieValue = cookie.substring(eqPos + 1);
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}