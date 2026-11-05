<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use PragmaRX\Google2FA\Google2FA;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'two_factor_code' => 'nullable|string|max:20',
            'remember' => 'nullable|boolean',
        ]);

        // Rate limiting
        $key = 'login:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'email' => "Too many login attempts. Try again in {$seconds} seconds.",
            ]);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($key, 300); // 5 minutes
            throw ValidationException::withMessages([
                'email' => 'Invalid credentials.',
            ]);
        }

        RateLimiter::clear($key);

        // Check 2FA
        if ($user->hasTwoFactorEnabled()) {
            if (!$request->filled('two_factor_code')) {
                return response()->json([
                    'two_factor_required' => true,
                    'message' => 'Two-factor authentication code required.',
                ], 428); // Precondition Required
            }

            $google2fa = new Google2FA();
            $valid = $google2fa->verifyKey($user->two_factor_secret, $request->two_factor_code);

            if (!$valid) {
                // Check recovery codes
                $recoveryCodeValid = $user->verifyRecoveryCode($request->two_factor_code);
                if (!$recoveryCodeValid) {
                    throw ValidationException::withMessages([
                        'two_factor_code' => 'Invalid two-factor authentication code.',
                    ]);
                }
            }
        }

        // Log in the user
        Auth::guard('web')->login($user, $request->boolean('remember'));

        // Regenerate session
        $request->session()->regenerate();

        // Alert on new login (if different IP)
        // TODO: Implement email alert

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'two_factor_enabled' => $user->hasTwoFactorEnabled(),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'two_factor_enabled' => $user->hasTwoFactorEnabled(),
        ]);
    }

    public function generateTwoFactorSecret(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasTwoFactorEnabled()) {
            return response()->json([
                'message' => 'Two-factor authentication is already enabled.',
            ], 400);
        }

        $request->validate([
            'password' => 'required|string',
        ]);

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => 'Invalid password.',
            ]);
        }

        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();

        // Store the pending secret (not confirmed until a valid code is verified).
        $user->update([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);

        return response()->json([
            'secret' => $secret,
            'otpauth_url' => $google2fa->getQRCodeUrl(
                config('app.name'),
                $user->email,
                $secret
            ),
        ]);
    }

    public function enableTwoFactor(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasTwoFactorEnabled()) {
            return response()->json([
                'message' => 'Two-factor authentication is already enabled.',
            ], 400);
        }

        $request->validate([
            'password' => 'required|string',
            'code' => 'required|string|size:6',
        ]);

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => 'Invalid password.',
            ]);
        }

        if (empty($user->two_factor_secret)) {
            throw ValidationException::withMessages([
                'code' => 'Request a two-factor secret before confirming setup.',
            ]);
        }

        $google2fa = new Google2FA();
        $secret = $user->two_factor_secret;

        $valid = $google2fa->verifyKey($secret, $request->code);

        if (!$valid) {
            throw ValidationException::withMessages([
                'code' => 'Invalid authentication code.',
            ]);
        }

        // Generate recovery codes
        $recoveryCodes = [];
        for ($i = 0; $i < 10; $i++) {
            $recoveryCodes[] = strtoupper(Str::random(10));
        }

        $user->enableTwoFactor($secret, $recoveryCodes);

        return response()->json([
            'message' => 'Two-factor authentication enabled.',
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    public function disableTwoFactor(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasTwoFactorEnabled()) {
            return response()->json([
                'message' => 'Two-factor authentication is not enabled.',
            ], 400);
        }

        $request->validate([
            'password' => 'required|string',
            'code' => 'required|string|size:6',
        ]);

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => 'Invalid password.',
            ]);
        }

        $google2fa = new Google2FA();
        $valid = $google2fa->verifyKey($user->two_factor_secret, $request->code);

        if (!$valid) {
            // Check recovery codes
            $recoveryCodeValid = $user->verifyRecoveryCode($request->code);
            if (!$recoveryCodeValid) {
                throw ValidationException::withMessages([
                    'code' => 'Invalid authentication code.',
                ]);
            }
        }

        $user->disableTwoFactor();

        return response()->json([
            'message' => 'Two-factor authentication disabled.',
        ]);
    }

    public function verifyRecoveryCode(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'code' => 'required|string',
        ]);

        $valid = $user->verifyRecoveryCode($request->code);

        if (!$valid) {
            return response()->json([
                'message' => 'Invalid recovery code.',
            ], 400);
        }

        return response()->json([
            'message' => 'Recovery code accepted.',
        ]);
    }
}