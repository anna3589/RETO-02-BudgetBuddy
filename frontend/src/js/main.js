import "../css/style.css";
// Función asíncrona para pedir los datos
async function fetchReviews() {
	const container = document.getElementById("reviews-container");

	try {
		// 1. Llamamos al camarero (Petición GET)
		// Ajusta la ruta si tu api está en otro puerto o carpeta
		const response = await fetch("/api/reviews");

		// 2. Esperamos a que llegue el plato y lo convertimos a objeto JS
		if (!response.ok) throw new Error("Error en la cocina (Server Error)");
		const reviews = await response.json();

		console.log("--- INICIO DEPURACIÓN ---");
		console.log("TIPO DE DATO:", typeof reviews);
		console.log("CONTENIDO EXACTO:", reviews);
		console.log("--- FIN DEPURACIÓN ---");

		// Antes de hacer el forEach, vamos a ver si es un array
		if (!Array.isArray(reviews)) {
			console.error(
				"¡ALERTA! PHP no está enviando un array. Está enviando:",
				reviews
			);
			return; // Paramos aquí para que no explote
		}

		// 3. Limpiamos el mensaje de "Cargando..."
		container.innerHTML = "";

		// 4. Pintamos cada reseña (Manipulación del DOM)

		reviews.forEach((review) => {
			// Generamos las estrellas dinámicamente
			const starsHTML =
				"★".repeat(review.estrellas) + "☆".repeat(5 - review.estrellas);

			// Creamos el HTML de la tarjeta
			const cardHTML = `
            	<div class="review-card">
                	<div class="review-header">
						<a href="${review["avatar"]}" alt="${review.usuario} profile picture" class="user-avatar"></a>
						<div class="user-info">
                        	<h3>${review.usuario}</h3>
                    <div class="stars">${starsHTML}</div>
                    </div>
                </div>
                <p>"${review.comentario}"</p>
              </div>
          `;

			// Lo añadimos al contenedor
			container.innerHTML += cardHTML;
		});
	} catch (error) {
		console.error("Error cargando reseñas:", error);
		container.innerHTML =
			"<p>Error al cargar las opiniones. Inténtalo más tarde.</p>";
	}
}

// Ejecutamos la función cuando cargue la página
document.addEventListener("DOMContentLoaded", fetchReviews);
