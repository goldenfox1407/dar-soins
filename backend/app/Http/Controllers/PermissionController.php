<?php

namespace App\Http\Controllers;

use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function index()
    {
        // Retourne toutes les permissions
        // On pourrait aussi les grouper par module ici, mais on va le faire côté frontend pour plus de flexibilité
        return Permission::all();
    }
}
