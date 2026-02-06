<?php

namespace App\Http\Controllers;

use App\Models\Movement;
use App\Models\Account;    // ДОДАЙ ЦЕ
use App\Models\Card;       // ДОДАЙ ЦЕ
use App\Models\Tag;        // ДОДАЙ ЦЕ
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log; 

class MovementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, Account $account)
    {
        // 1. Seguridad: ¿La cuenta es del usuario?
        if ($account->user_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // 2. Query base
        $query = $account->movements()->with('tag'); // Traemos la etiqueta asociada si existe

        // 3. Filtros opcionales (Ingresos vs Gastos)
        if ($request->has('type')) {
            // Asumiendo que guardas montos negativos para gastos y positivos para ingresos
            if ($request->type === 'income') {
                $query->where('amount', '>', 0);
            } elseif ($request->type === 'expense') {
                $query->where('amount', '<', 0);
            }
        }

        // 4. Ordenar y Paginar
        $movements = $query->orderBy('date', 'desc') // O 'created_at'
                           ->limit(50) // Limitamos a 50 para no saturar
                           ->get();

        return response()->json($movements);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function all(Request $request)
    {
        // Отримати всі movimientos користувача
        $user = Auth::user();
        
        $query = Movement::whereHas('account', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })->with(['account', 'card', 'tags']);
        
        // Фільтр по картці
        if ($request->has('card_id')) {
            $query->where('card_id', $request->card_id);
        }
        
        $movements = $query->orderBy('date', 'desc')->get();
        
        return response()->json($movements);
    }

    // У методі store() заміни цей блок:
    public function store(Request $request)
    {
        Log::info('=== MOVEMENT STORE START ===');
        Log::info('Request data:', $request->all());
        
        try {
            $validated = $request->validate([
                'card_id' => 'required|exists:cards,id',
                'amount' => 'required|numeric',
                'description' => 'required|string|max:255',
                'date' => 'required|date',
                'type' => 'required|in:gasto,ingreso,traspaso',
                'tag_id' => 'nullable|exists:tags,id'
            ]);
            
            Log::info('Validation passed:', $validated);
            
            // 1. Отримати картку
            $card = Card::findOrFail($validated['card_id']);
            
            // 2. Перевірити, чи картка належить користувачеві
            if ($card->account->user_id !== Auth::id()) {
                Log::warning('Unauthorized movement creation attempt');
                return response()->json([
                    'message' => 'No autorizado para realizar esta acción'
                ], 403);
            }
            
            // 3. Розрахунок суми
            $amount = $validated['amount'];
            if ($validated['type'] === 'gasto') {
                $amount = -abs($amount);
            }
            
            // 4. Створити movement в БД
            $movement = Movement::create([
                'account_id' => $card->account_id,
                'card_id' => $validated['card_id'],
                'amount' => $amount,
                'description' => $validated['description'],
                'date' => $validated['date'],
                'type' => $validated['type']
            ]);
            
            // 5. Додати тег, якщо є
            if (!empty($validated['tag_id'])) {
                $movement->tags()->attach($validated['tag_id']);
            }
            
            // 6. Завантажити зв'язки
            $movement->load('tags', 'account', 'card');
            
            Log::info('Movement created successfully:', $movement->toArray());
            
            return response()->json([
                'message' => '✅ Movimiento creado correctamente',
                'movement' => $movement
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('Movement error: ' . $e->getMessage());
            Log::error('Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => '❌ Error: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Display the specified resource.
     */
    public function show(Movement $movement)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Movement $movement)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Movement $movement)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Movement $movement)
    {
        //
    }
}
