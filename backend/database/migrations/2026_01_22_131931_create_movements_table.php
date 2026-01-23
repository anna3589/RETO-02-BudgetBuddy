<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use PHPUnit\Framework\Constraint\Constraint;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('movements', function (Blueprint $table) {
            $table->id();
            
            // SIEMPRE sabemos de qué cuenta sale/entra el dinero
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            
            // Claves foráneas opcionales (Nullables)
            $table->foreignId('card_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('envelope_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('tag_id')->nullable()->constrained()->onDelete('set null');

            $table->decimal('amount', 10, 2); 
            $table->string('description');
            $table->date('date');
            
            // Enum según tu diagrama
            $table->enum('type', ['gasto', 'ingreso', 'traspaso']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movements');
    }
};
