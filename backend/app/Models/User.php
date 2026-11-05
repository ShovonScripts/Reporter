<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_secret' => 'encrypted',
            'two_factor_recovery_codes' => 'array',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Check if user has two-factor authentication enabled.
     */
    public function hasTwoFactorEnabled(): bool
    {
        return !empty($this->two_factor_secret) && !empty($this->two_factor_confirmed_at);
    }

    /**
     * Enable two-factor authentication.
     */
    public function enableTwoFactor(string $secret, array $recoveryCodes): void
    {
        $this->update([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => $recoveryCodes,
            'two_factor_confirmed_at' => now(),
        ]);
    }

    /**
     * Disable two-factor authentication.
     */
    public function disableTwoFactor(): void
    {
        $this->update([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);
    }

    /**
     * Verify a recovery code.
     */
    public function verifyRecoveryCode(string $code): bool
    {
        $codes = $this->two_factor_recovery_codes ?? [];
        $key = array_search($code, $codes);

        if ($key === false) {
            return false;
        }

        unset($codes[$key]);
        $this->update(['two_factor_recovery_codes' => array_values($codes)]);

        return true;
    }
}