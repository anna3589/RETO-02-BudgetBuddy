<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // 1. 'usuario': Genera un nombre completo falso (ej: "Juan Pérez")
            'usuario' => $this->faker->name(),

            // 2. 'comentario': Genera un texto de unos 100 caracteres
            'comentario' => $this->faker->text(100),

            // 3. 'estrellas': Un número aleatorio entre 3 y 5
            'estrellas' => $this->faker->numberBetween(3, 5),

            // 4. 'avatar': TRUCO PRO.
            // Usamos un servicio gratuito para generar URLs de imágenes aleatorias.
            // Añadimos un email falso al final para que cada imagen sea distinta.
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=' . $this->faker->unique()->word,
        ];
    }
}