// --- LÓGICA DE INTERFAZ Y NAVEGACIÓN ---

let currentStep = 1;

function nextStep(step) {
	// Validación básica antes de avanzar
	if (step > currentStep) {
		if (currentStep === 1) {
			const bank = document.getElementById("bank_name").value;
			const balance = document.getElementById("current_balance").value;
			if (!bank || !balance) {
				alert("Por favor, rellena los campos obligatorios de la cuenta.");
				return;
			}
		}
	}

	// Cambiar UI
	document
		.querySelectorAll(".step-content")
		.forEach((el) => el.classList.remove("active"));
	document.getElementById(`step-${step}`).classList.add("active");

	// Actualizar puntos
	document.querySelectorAll(".step-dot").forEach((dot, index) => {
		if (index + 1 <= step) dot.classList.add("active");
		else dot.classList.remove("active");
	});

	document.getElementById("step-number").textContent = step;
	currentStep = step;
}

function toggleSection(type) {
	const checkbox = document.getElementById(`has_${type}`);
	const fields = document.getElementById(`${type}-fields`);
	const container = document.getElementById(`toggle-${type}`);

	checkbox.checked = !checkbox.checked;

	if (checkbox.checked) {
		fields.style.display = "block";
		container.classList.add("active");
	} else {
		fields.style.display = "none";
		container.classList.remove("active");
	}

	// Hacer required inputs si está activo
	const inputs = fields.querySelectorAll(
		'input:not([type="hidden"]):not([type="radio"])'
	);
	inputs.forEach((i) => (i.required = checkbox.checked));
}

// Selectores visuales (Color e Iconos)
document.querySelectorAll(".color-circle").forEach((c) => {
	c.addEventListener("click", function () {
		document
			.querySelectorAll(".color-circle")
			.forEach((i) => i.classList.remove("selected"));
		this.classList.add("selected");
		document.getElementById("account_color").value = this.dataset.color;
	});
});

document.querySelectorAll(".icon-option").forEach((c) => {
	c.addEventListener("click", function () {
		document
			.querySelectorAll(".icon-option")
			.forEach((i) => i.classList.remove("selected"));
		this.classList.add("selected");
		document.getElementById("env_icon").value = this.dataset.icon;
	});
});

// --- LÓGICA DE ENVÍO DE DATOS ---

function getCookie(name) {
	let matches = document.cookie.match(
		new RegExp(
			"(?:^|; )" +
				name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
				"=([^;]*)"
		)
	);
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

document
	.getElementById("setup-form")
	.addEventListener("submit", async function (e) {
		e.preventDefault();
		const btn = document.getElementById("btn-submit");
		const originalText = btn.innerHTML;
		btn.disabled = true;
		btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

		try {
			// 1. Pedir la cookie CSRF (Seguridad)
			await fetch("/sanctum/csrf-cookie", { method: "GET" });

			// 1. LÓGICA DE CONCATENACIÓN (UNIR PAÍS + NÚMEROS)
			const country = document.getElementById("iban_country").value; // "ES"
			let number = document.getElementById("iban_number").value; // "2100..."

			// Limpiar espacios vacíos
			number = number.replace(/\s+/g, "");

			// Unir todo en un solo string
			const fullIban = country + number;

			// 2. CREAR EL OBJETO PARA ENVIAR
			const accountData = {
				bank_name: document.getElementById("bank_name").value,

				// ¡AQUÍ ESTÁ LA CLAVE! Enviamos la llave 'iban', no 'ibanNumber'
				iban: fullIban,

				current_balance: document.getElementById("current_balance").value,
				color: document.getElementById("account_color").value,
			};

			// 3. ENVIAR AL BACKEND
			const accRes = await fetch("/api/accounts", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					"X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
				},
				credentials: "include",
				body: JSON.stringify(accountData),
			});

			if (accRes.status === 401) {
				window.location.href = "/login";
				return;
			}

			// Manejo de errores
			if (!accRes.ok) {
				const errorText = await accRes.text();
				console.error("ERROR DEL SERVIDOR:", errorText);
				try {
					const errorJson = JSON.parse(errorText);
					throw new Error(errorJson.message || "Error guardando la cuenta");
				} catch (e) {
					// Si el mensaje del try anterior falla, lanzamos el original
					if (e.message !== "Error guardando la cuenta") throw e;
					throw new Error("Error crítico del servidor. Revisa consola.");
				}
			}

			// --- SI LLEGAMOS AQUÍ, LA CUENTA SE CREÓ ---
			const accResult = await accRes.json();
			const accountId = accResult.account.id;

			// 2. CREAR TARJETA (Si procede)
			if (document.getElementById("has_card").checked) {
				let rawDate = document.getElementById("card_expiration").value;
				const type = document.querySelector(
					'input[name="card_type"]:checked'
				).value;

				await fetch("/api/cards", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						"X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
					},
					credentials: "include",
					body: JSON.stringify({
						account_id: accountId,
						alias: document.getElementById("card_alias").value,
						last_4_digits: document.getElementById("card_digits").value,
						expiration_date: rawDate ? rawDate + "-01" : null,
						type: type,
					}),
				});
			}

			// 3. CREAR SOBRE (Si procede)
			if (document.getElementById("has_envelope").checked) {
				await fetch("/api/envelopes", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						"X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
					},
					credentials: "include",
					body: JSON.stringify({
						account_id: accountId,
						name: document.getElementById("env_name").value,
						target_amount: document.getElementById("env_target").value,
						allocated_amount: document.getElementById("env_allocated").value,
						icon: document.getElementById("env_icon").value,
					}),
				});
			}

			// FIN
			window.location.href = "/dashboard";
		} catch (error) {
			console.error(error);
			alert("Error: " + error.message);
			btn.disabled = false;
			btn.innerHTML = originalText;
		}
	});