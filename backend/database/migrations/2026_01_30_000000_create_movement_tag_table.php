<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecutar la migración.
     * Crear la tabla pivot para la relación N:M entre movements y tags.
     */
    public function up(): void
    {
        Schema::create('movement_tag', function (Blueprint $table) {
            // ID único para cada registro en la tabla pivot
            $table->id();
            
            // -----------------------------------------------------------------
            // CLAVES FORÁNEAS PARA LA RELACIÓN N:M
            // -----------------------------------------------------------------
            
            // 1. Referencia al movimiento (movement)
            // Esta columna guarda el ID del movimiento que tiene etiquetas
            $table->foreignId('movement_id')
                  ->constrained()           // Crea una restricción de clave foránea
                  ->onDelete('cascade');    // Si se elimina un movimiento, 
                                            // se eliminan automáticamente todas sus 
                                            // relaciones con etiquetas
                  
            // 2. Referencia a la etiqueta (tag)  
            // Esta columna guarda el ID de la etiqueta asignada al movimiento
            $table->foreignId('tag_id')
                  ->constrained()           // Crea una restricción de clave foránea
                  ->onDelete('cascade');    // Si se elimina una etiqueta,
                                            // se eliminan automáticamente todas sus
                                            // relaciones con movimientos
            
            // -----------------------------------------------------------------
            // TIMESTAMPS PARA CONTROL DE CAMBIOS
            // -----------------------------------------------------------------
            
            // Laravel automáticamente maneja estas columnas
            $table->timestamps(); // created_at y updated_at
                                  // Para saber cuándo se creó y modificó cada relación
            
            // -----------------------------------------------------------------
            // RESTRICCIONES PARA INTEGRIDAD DE DATOS
            // -----------------------------------------------------------------
            
            // Restricción única: evita duplicar la misma relación
            // Un movimiento no puede tener la misma etiqueta dos veces
            // Ejemplo: movimiento_id=1 y tag_id=5 solo puede existir UNA vez
            $table->unique(['movement_id', 'tag_id']);
            
            // -----------------------------------------------------------------
            // ÍNDICES PARA MEJOR RENDIMIENTO
            // -----------------------------------------------------------------
            
            // Índice para búsquedas rápidas de etiquetas por movimiento
            // Ejemplo: "¿Qué etiquetas tiene el movimiento con ID=1?"
            $table->index('movement_id');
            
            // Índice para búsquedas rápidas de movimientos por etiqueta
            // Ejemplo: "¿Qué movimientos tienen la etiqueta con ID=3?"
            $table->index('tag_id');
        });
        
        // ---------------------------------------------------------------------
        // EXPLICACIÓN DE POR QUÉ NECESITAMOS ESTA TABLA:
        // ---------------------------------------------------------------------
        //(relación N:M - un movimiento → muchas etiquetas):
        // - Necesitamos tabla intermedia (pivot)
        // - Un movimiento puede tener VARIAS etiquetas
        // - Ejemplo: movimiento de "Vuelo a Madrid" → 
        //            etiquetas: "#Viaje", "#Urgente", "#Trabajo"
        //
        // EJEMPLO DE DATOS EN ESTA TABLA:
        // +----+--------------+--------+
        // | id | movement_id | tag_id |
        // +----+--------------+--------+
        // | 1  | 1           | 1      | ← Movimiento 1 tiene etiqueta 1
        // | 2  | 1           | 3      | ← Movimiento 1 también tiene etiqueta 3
        // | 3  | 2           | 1      | ← Movimiento 2 tiene etiqueta 1
        // | 4  | 3           | 2      | ← Movimiento 3 tiene etiqueta 2
        // +----+--------------+--------+
        //
        // Esto significa:
        // - Movimiento 1 tiene etiquetas 1 y 3 (dos etiquetas)
        // - Movimiento 2 tiene etiqueta 1 (una etiqueta)
        // - Movimiento 3 tiene etiqueta 2 (una etiqueta)
        // - Etiqueta 1 está en movimientos 1 y 2 (usada dos veces)
        // ---------------------------------------------------------------------
    }

    /**
     * Revertir la migración.
     * Eliminar la tabla pivot si necesitamos deshacer los cambios.
     */
    public function down(): void
    {
        // Eliminar completamente la tabla pivot
        Schema::dropIfExists('movement_tag');
        
        // NOTA: Al eliminar esta tabla, NO perdemos los movimientos ni las etiquetas
        // Solo perdemos las RELACIONES entre ellos (qué etiquetas tenía cada movimiento)
    }
};