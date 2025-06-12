<?php

use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Controller;
use App\Http\Controllers\User\DashboardController;
use App\Http\Controllers\User\NoteController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/auth/redirect', [GoogleController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/callback', [GoogleController::class, 'callback'])->name('google.callback');

Route::middleware(['auth', 'verified'])->group(function () {
    // Route::get('dashboard', function () {
    //     return Inertia::render('dashboard');
    // })->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');
    Route::post('/notes/summarize', [NoteController::class, 'summarizeNote']);
    Route::get('/notes/export-raw', [NoteController::class, 'export'])->name('notes.export.raw');
    Route::resource('/notes', NoteController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
