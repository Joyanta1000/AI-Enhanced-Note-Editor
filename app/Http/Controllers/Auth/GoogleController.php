<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $googleAvatarUrl = $googleUser->getAvatar();
        $dateTime = Carbon::now()->getTimestamp();
        $filename = Str::random(10) . Carbon::now()->format('YmdHisv'). '.jpg';

        $response = Http::get($googleAvatarUrl);

        if ($response->successful()) {
            Storage::disk('public')->put("images/user/profile_pictures/{$filename}", $response->body());
        }

        $user = User::updateOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name' => $googleUser->getName(),
                'avatar' => $filename,
                'password' => Hash::make(Carbon::now()->format('YmdHisv').Str::random(10)),
                'google_id' => $googleUser->getId(),
            ]
        );

        Auth::login($user);
        return redirect('/dashboard');
    }
}
