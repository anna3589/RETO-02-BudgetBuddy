<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    /**
     * Отримати всі теги (публічний доступ)
     */
    public function index()
    {
        // Повертає всі теги (публічні)
        // Якщо хочеш лише теги користувача, зроби так:
        // $tags = Auth::user()->tags()->orderBy('created_at', 'desc')->get();
        $tags = Tag::orderBy('created_at', 'desc')->get();
        return response()->json($tags);
    }

    /**
     * Створити нову тегу (потребує автентифікації)
     */
    public function store(Request $request)
    {
        // Якщо хочете обмежити створення тільки для адмінів:
        // if (!auth()->check() || !auth()->user()->is_admin) {
        //     return response()->json(['message' => 'No autorizado'], 403);
        // }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tags,name',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:50'
        ]);

        $tag = Tag::create([
            'name' => $validated['name'],
            'color' => $validated['color'] ?? '#cccccc',
            'icon' => $validated['icon'] ?? 'tag'
        ]);

        return response()->json([
            'message' => 'Etiqueta creada exitosamente',
            'tag' => $tag
        ], 201);
    }

    /**
     * Оновити тегу (потребує автентифікації)
     */
    public function update(Request $request, Tag $tag)
    {
        // Якщо хочете обмежити тільки для адмінів:
        // if (!auth()->check() || !auth()->user()->is_admin) {
        //     return response()->json(['message' => 'No autorizado'], 403);
        // }
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:tags,name,' . $tag->id,
            'color' => 'sometimes|string|max:7',
            'icon' => 'sometimes|string|max:50'
        ]);

        $tag->update($validated);

        return response()->json([
            'message' => 'Etiqueta actualizada',
            'tag' => $tag
        ]);
    }

    /**
     * Видалити тегу (потребує автентифікації)
     */
    public function destroy(Tag $tag)
    {
        // Якщо хочете обмежити тільки для адмінів:
        // if (!auth()->check() || !auth()->user()->is_admin) {
        //     return response()->json(['message' => 'No autorizado'], 403);
        // }
        
        // Перевірка, чи тега використовується в рухах
        if ($tag->movements()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar la etiqueta porque está en uso por algunos movimientos'
            ], 422);
        }

        $tag->delete();

        return response()->json([
            'message' => 'Etiqueta eliminada'
        ]);
    }

    /**
     * Показати конкретну тегу (публічний доступ)
     */
    public function show(Tag $tag)
    {
        return response()->json($tag);
    }
}