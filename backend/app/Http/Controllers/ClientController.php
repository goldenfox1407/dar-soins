<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ClientController extends Controller
{
    public function index()
    {
        $clients = Client::with('user')->get()->map(function ($client) {
            $data = $client->toArray();
            if ($client->user) {
                $data['nom'] = trim($client->user->nom . ' ' . $client->user->prenom);
                $data['email'] = $client->user->email;
            }
            return $data;
        });
        return response()->json($clients);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email'
        ]);

        DB::beginTransaction();
        try {
            // Create user for the client
            $user = User::create([
                'nom' => $request->nom,
                'email' => $request->email,
                'password' => Hash::make(Str::random(12)), // Random password, they can reset it later
                'role' => 'client'
            ]);

            // Create client profile
            $client = Client::create([
                'user_id' => $user->id,
                'code_client' => $request->code_client ?? 'CL-' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
                'telephone' => $request->telephone,
                'pays' => $request->pays,
                'ville' => $request->ville,
                'code_postal' => $request->code_postal,
                'numero_taxe' => $request->numero_taxe,
                'limite_credit' => $request->limite_credit,
                'notes_internes' => $request->notes_internes
            ]);

            DB::commit();
            
            $data = $client->toArray();
            $data['nom'] = trim($user->nom . ' ' . $user->prenom);
            $data['email'] = $user->email;
            
            return response()->json($data, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $client = Client::with([
            'user', 
            'interventions.produit', 
            'interventions.infirmier.user', 
            'interventions.constantes'
        ])->findOrFail($id);
        
        $data = $client->toArray();
        if ($client->user) {
            $data['nom'] = trim($client->user->nom . ' ' . $client->user->prenom);
            $data['email'] = $client->user->email;
        }
        return response()->json($data);
    }

    public function update(Request $request, $id)
    {
        $client = Client::findOrFail($id);
        
        DB::beginTransaction();
        try {
            if ($client->user) {
                $userData = [];
                if ($request->has('nom')) $userData['nom'] = $request->nom;
                if ($request->has('prenom')) $userData['prenom'] = $request->prenom;
                if ($request->has('email') && $request->email != $client->user->email) {
                    $request->validate(['email' => 'email|unique:users,email']);
                    $userData['email'] = $request->email;
                }
                if (!empty($userData)) {
                    $client->user->update($userData);
                }
            }

            $client->update($request->only([
                'code_client', 'telephone', 'pays', 'ville', 
                'code_postal', 'numero_taxe', 'limite_credit', 'notes_internes'
            ]));

            DB::commit();

            $data = $client->toArray();
            if ($client->user) {
                $data['nom'] = trim($client->user->nom . ' ' . $client->user->prenom);
                $data['email'] = $client->user->email;
            }
            return response()->json($data);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $client = Client::findOrFail($id);
        // Deleting the user will cascade delete the client because of the DB foreign key cascade
        if ($client->user) {
            $client->user->delete();
        } else {
            $client->delete();
        }
        return response()->json(['message' => 'Deleted']);
    }
}
