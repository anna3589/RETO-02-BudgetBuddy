<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Review;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        // Definimos tus reseñas VIP manualmente
        $reviews = [
            [
                'usuario' => 'Laura Martínez',
                'comentario' => 'Llevo usándola un mes y he ahorrado 200€ sin darme cuenta. ¡Top!',
                'estrellas' => 5,
                'avatar' => 'https://ui-avatars.com/api/?name=Laura+Martinez&background=random',
            ],
            [
                'usuario' => 'David Broncano',
                'comentario' => 'La interfaz está guapísima, pero echo de menos poder exportar a PDF.',
                'estrellas' => 4,
                'avatar' => 'https://ui-avatars.com/api/?name=David+Broncano&background=0D8ABC&color=fff',
            ],
            [
                'usuario' => 'Ibai Llanos',
                'comentario' => 'Es una locura de app, chavales. Muy intuitiva.',
                'estrellas' => 5,
                'avatar' => 'https://ui-avatars.com/api/?name=Ibai+Llanos&background=ffcc00',
            ],
            [
                'usuario' => 'Marta Díaz',
                'comentario' => 'Cumple su función, aunque a veces tarda un pelín en cargar.',
                'estrellas' => 3,
                'avatar' => 'https://ui-avatars.com/api/?name=Marta+Diaz&background=random',
            ],
            [
                'usuario' => 'Sergio Ramos',
                'comentario' => 'Clean sheet en mis finanzas. Perfecta.',
                'estrellas' => 5,
                'avatar' => 'https://ui-avatars.com/api/?name=Sergio+Ramos&background=ef4444&color=fff',
            ],
        ];

        // Recorremos el array e insertamos cada una
        foreach ($reviews as $review) {
            Review::create($review);
        }
    }
}