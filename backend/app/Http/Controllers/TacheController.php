<?php

namespace App\Http\Controllers;

use App\Http\Requests\Tache\StoreTacheRequest;
use App\Http\Requests\Tache\UpdateTacheRequest;
use App\Http\Resources\TacheResource;
use App\Models\Tache;
use App\Services\ServiceTache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TacheController extends Controller
{
    public function __construct(protected ServiceTache $service) {}

    /**
     * Liste paginée des tâches avec filtres.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Tache::with(['assigne', 'createur', 'intervention']);

        // Filtrage par rôle :
        // - Gestionnaire : voit toutes les tâches
        // - Infirmier : voit les tâches qui lui sont assignées + celles de ses interventions
        // - Client : voit uniquement les tâches liées à ses interventions
        if ($user->estInfirmier()) {
            $infirmierId = $user->infirmier?->id;
            $query->where(function ($q) use ($user, $infirmierId) {
                $q->where('assigne_a', $user->id);
                if ($infirmierId) {
                    $q->orWhereHas('intervention', fn($iq) => $iq->where('infirmier_id', $infirmierId));
                }
            });
        } elseif ($user->estClient()) {
            $clientId = $user->client?->id;
            $query->whereHas('intervention', fn($iq) => $iq->where('client_id', $clientId));
        }

        // Filtres optionnels
        if ($statut = $request->get('statut')) {
            $query->where('statut', $statut);
        }
        if ($priorite = $request->get('priorite')) {
            $query->where('priorite', $priorite);
        }
        if ($categorie = $request->get('categorie')) {
            $query->where('categorie', $categorie);
        }
        if ($assigne = $request->get('assigne_a')) {
            $query->where('assigne_a', $assigne);
        }
        if ($request->boolean('urgentes')) {
            $query->urgentes();
        }
        if ($request->boolean('en_retard')) {
            $query->enRetard();
        }

        $perPage = min($request->integer('per_page', 20), 100);
        $taches = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => TacheResource::collection($taches->items()),
            'meta'    => [
                'current_page' => $taches->currentPage(),
                'last_page'    => $taches->lastPage(),
                'total'        => $taches->total(),
                'per_page'     => $taches->perPage(),
            ],
        ]);
    }

    /**
     * Crée une nouvelle tâche.
     */
    public function store(StoreTacheRequest $request): JsonResponse
    {
        $tache = $this->service->creer($request->validated(), $request->user()->id);
        $tache->load(['assigne', 'createur', 'intervention']);

        return response()->json([
            'success' => true,
            'message' => 'Tâche créée avec succès.',
            'data'    => new TacheResource($tache),
        ], 201);
    }

    /**
     * Affiche une tâche.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $tache = Tache::with(['assigne', 'createur', 'intervention'])->findOrFail($id);

        // Vérification d'accès (sauf pour gestionnaire)
        $user = $request->user();
        if (! $user->estGestionnaire()) {
            if ($user->estInfirmier() && $tache->assigne_a !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Non autorisé.'], 403);
            }
            if ($user->estClient() && (! $tache->intervention || $tache->intervention->client_id !== $user->client?->id)) {
                return response()->json(['success' => false, 'message' => 'Non autorisé.'], 403);
            }
        }

        return response()->json([
            'success' => true,
            'data'    => new TacheResource($tache),
        ]);
    }

    /**
     * Met à jour une tâche.
     */
    public function update(UpdateTacheRequest $request, int $id): JsonResponse
    {
        $tache = Tache::findOrFail($id);
        $tache = $this->service->mettreAJour($tache, $request->validated());
        $tache->load(['assigne', 'createur', 'intervention']);

        return response()->json([
            'success' => true,
            'message' => 'Tâche mise à jour avec succès.',
            'data'    => new TacheResource($tache),
        ]);
    }

    /**
     * Supprime une tâche (soft delete).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $tache = Tache::findOrFail($id);

        // Seul le gestionnaire peut supprimer
        if (! $request->user()->estGestionnaire()) {
            return response()->json([
                'success' => false,
                'message' => 'Seul un gestionnaire peut supprimer une tâche.',
            ], 403);
        }

        $tache->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tâche supprimée.',
        ]);
    }

    /**
     * Vue planning hebdomadaire (tâches + interventions groupées par jour).
     */
    public function planning(Request $request): JsonResponse
    {
        $user = $request->user();
        $semaine = $request->get('semaine'); // format ISO: 2026-W28

        // Calcul de l'intervalle de la semaine
        if ($semaine) {
            [$annee, $numSemaine] = explode('-W', $semaine);
            $debut = now()->setISODate((int) $annee, (int) $numSemaine)->startOfWeek();
            $fin = (clone $debut)->endOfWeek();
        } else {
            $debut = now()->startOfWeek();
            $fin = now()->endOfWeek();
        }

        // Tâches de la semaine
        $taches = Tache::with(['assigne', 'intervention'])
            ->whereBetween('echeance', [$debut->toDateString(), $fin->toDateString()])
            ->orderBy('echeance')
            ->get();

        // Interventions de la semaine (pour le user connecté)
        $interventionsQuery = \App\Models\Intervention::with(['client.user', 'infirmier.user', 'produit'])
            ->whereBetween('date_heure', [$debut, $fin])
            ->orderBy('date_heure');

        if ($user->estInfirmier()) {
            $interventionsQuery->where('infirmier_id', $user->infirmier?->id);
        } elseif ($user->estClient()) {
            $interventionsQuery->where('client_id', $user->client?->id);
        }

        $interventions = $interventionsQuery->get();

        // Groupement par jour
        $planning = [];
        for ($i = 0; $i < 7; $i++) {
            $jour = (clone $debut)->addDays($i);
            $planning[] = [
                'date'           => $jour->toDateString(),
                'jour_semaine'   => $jour->locale('fr')->dayName,
                'taches'         => TacheResource::collection(
                    $taches->filter(fn($t) => $t->echeance?->isSameDay($jour))
                ),
                'interventions'  => $interventions->filter(fn($i) => $i->date_heure?->isSameDay($jour))->values(),
            ];
        }

        return response()->json([
            'success'    => true,
            'semaine'    => $debut->format('Y-\WW'),
            'date_debut' => $debut->toDateString(),
            'date_fin'   => $fin->toDateString(),
            'planning'   => $planning,
        ]);
    }

    /**
     * Statistiques pour le dashboard organisation.
     */
    public function stats(Request $request): JsonResponse
    {
        $stats = $this->service->statistiques();

        return response()->json([
            'success' => true,
            'data'    => $stats,
        ]);
    }
}
