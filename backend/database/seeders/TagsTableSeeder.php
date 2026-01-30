<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TagsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
// database/seeders/TagsTableSeeder.php
    public function run(): void
    {
        $tags = [
            ['name' => 'Gimnasio', 'color' => '#34d399', 'icon' => 'dumbbell'],
            ['name' => 'Internet', 'color' => '#60a5fa', 'icon' => 'wifi'],
            ['name' => 'Gasolina', 'color' => '#fbbf24', 'icon' => 'gas-pump'],
            ['name' => 'Supermercado', 'color' => '#ef4444', 'icon' => 'shopping-cart'],
            ['name' => 'Entretenimiento', 'color' => '#a855f7', 'icon' => 'gamepad'],
            ['name' => 'Netflix', 'color' => '#ef4444', 'icon' => 'tv'],
            ['name' => 'Spotify', 'color' => '#10b981', 'icon' => 'music'],
            ['name' => 'Transporte', 'color' => '#60a5fa', 'icon' => 'bus'],
            ['name' => 'Ropa', 'color' => '#a855f7', 'icon' => 'tshirt'],
            ['name' => 'Restaurante', 'color' => '#fbbf24', 'icon' => 'utensils'],
        ];

        foreach ($tags as $tag) {
            \App\Models\Tag::create($tag);
        }
    }
}
