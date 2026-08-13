<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Notifications\GenericSystemNotification;
use App\Models\User;

class NotificationController extends Controller
{
    /**
     * Get list of notifications for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->take(30)
            ->get()
            ->map(function ($notif) {
                return [
                    'id' => $notif->id,
                    'type' => $notif->type,
                    'data' => $notif->data,
                    'read_at' => $notif->read_at,
                    'created_at' => $notif->created_at->diffForHumans(),
                    'created_at_exact' => $notif->created_at->toISOString(),
                ];
            });

        return response()->json([
            'unread_count' => $user->unreadNotifications()->count(),
            'notifications' => $notifications
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        $notif = $user->notifications()->where('id', $id)->first();

        if ($notif) {
            $notif->markAsRead();
        }

        return response()->json([
            'message' => 'Notification marquée comme lue',
            'unread_count' => $user->unreadNotifications()->count()
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        $user->unreadNotifications->markAsRead();

        return response()->json([
            'message' => 'Toutes les notifications ont été marquées comme lues',
            'unread_count' => 0
        ]);
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $user->notifications()->where('id', $id)->delete();

        return response()->json([
            'message' => 'Notification supprimée',
            'unread_count' => $user->unreadNotifications()->count()
        ]);
    }

    /**
     * Send a test notification for demo.
     */
    public function sendTest(Request $request)
    {
        $user = $request->user();
        
        $samples = [
            [
                'titre' => 'Nouvelle Demande d\'Intervention',
                'message' => 'Un client a demandé une injection à domicile (Quartier Agdal).',
                'evenement' => 'nouvelle_intervention',
                'icone' => '🏥',
                'url' => '/gestionnaire/interventions'
            ],
            [
                'titre' => 'Alerte Stock Bas',
                'message' => 'Le stock de "Compresses Stériles" est tombé sous le seuil d\'alerte (12 unités).',
                'evenement' => 'stock_alerte',
                'icone' => '📦',
                'url' => '/gestionnaire/produits'
            ],
            [
                'titre' => 'Devis Accepté',
                'message' => 'Le client M. Alami a validé le devis #DEV-2026-042.',
                'evenement' => 'devis_accepte',
                'icone' => '✅',
                'url' => '/gestionnaire/devis'
            ],
            [
                'titre' => 'Nouveau Client Inscrit',
                'message' => 'Mme Sara Berrada vient de créer son compte client.',
                'evenement' => 'nouveau_client',
                'icone' => '👤',
                'url' => '/gestionnaire/gens/clients'
            ],
        ];

        $sample = $samples[array_rand($samples)];

        $user->notify(new GenericSystemNotification(
            $sample['titre'],
            $sample['message'],
            $sample['evenement'],
            $sample['icone'],
            $sample['url']
        ));

        return response()->json([
            'message' => 'Notification de test envoyée avec succès',
            'unread_count' => $user->unreadNotifications()->count()
        ]);
    }
}
