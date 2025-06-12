<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function dashboard()
    {
         $notes = auth()->user()
        ->notes()
        ->latest()
        ->select('id', 'title', 'content', 'slug')
        ->paginate(10) 
        ->withQueryString();

        return Inertia::render('dashboard', [
            'notes' => $notes
        ]);
    }
}
