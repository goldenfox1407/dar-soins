<?php

namespace App\Http\Controllers;

use App\Models\Config;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ParametreController extends Controller
{
    public function show()
    {
        return response()->json(Config::firstOrFail());
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'nom_entreprise'         => 'sometimes|string|max:255',
            'slogan'                 => 'nullable|string|max:255',
            'email_contact'          => 'nullable|email|max:255',
            'telephone'              => 'nullable|string|max:30',
            'adresse'                => 'nullable|string',
            'ville'                  => 'nullable|string|max:100',
            'code_postal'            => 'nullable|string|max:20',
            'pays'                   => 'nullable|string|max:100',
            'site_web'               => 'nullable|url|max:255',
            'rc'                     => 'nullable|string|max:50',
            'ice'                    => 'nullable|string|max:50',
            'if_fiscal'              => 'nullable|string|max:50',
            'patente'                => 'nullable|string|max:50',
            'cnss'                   => 'nullable|string|max:50',
            'tkmf_sm'                => 'sometimes|numeric|min:0',
            'tva'                    => 'sometimes|numeric|min:0|max:100',
            'rayon_intervention_km'  => 'sometimes|numeric|min:1',
            'delai_reponse_devis_h'  => 'sometimes|integer|min:1',
            'delai_validite_devis_j' => 'sometimes|integer|min:1',
            'commission_infirmier'   => 'sometimes|numeric|min:0|max:100',
            'devise_defaut'          => 'sometimes|string|max:3',
            'format_date'            => 'sometimes|string|max:20',
            'mentions_facture'       => 'nullable|string',
            'conditions_paiement'    => 'nullable|string',
            'pied_facture'           => 'nullable|string',
            'prefix_facture'         => 'sometimes|string|max:10',
            'prefix_devis'           => 'sometimes|string|max:10',
            'prefix_achat'           => 'sometimes|string|max:10',
            'prefix_vente'           => 'sometimes|string|max:10',
            'prefix_avoir'           => 'sometimes|string|max:10',
            'format_numero'          => 'sometimes|in:PREFIX-YYYYMMDD-NNNN,PREFIX-YYYY-NNNN,PREFIX-NNNNNN',
        ]);

        $config = Config::firstOrFail();
        $config->update($validated);

        return response()->json($config);
    }

    public function uploadLogo(Request $request)
    {
        $request->validate(['logo' => 'required|image|max:2048']);

        $config = Config::firstOrFail();

        if ($config->logo_path) {
            Storage::disk('public')->delete($config->logo_path);
        }

        $path = $request->file('logo')->store('logos', 'public');
        $config->update(['logo_path' => $path]);

        return response()->json(['logo_url' => Storage::url($path)]);
    }
}
