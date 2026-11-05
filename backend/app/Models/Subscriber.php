<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class Subscriber extends Model
{
    protected $fillable = [
        'email',
        'status',
        'confirm_token_hash',
        'unsubscribe_token_hash',
        'confirmed_at',
        'source',
        'consent_text_version',
    ];

    protected $casts = [
        'confirmed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $hidden = [
        'confirm_token_hash',
        'unsubscribe_token_hash',
    ];

    public static function generateToken(): string
    {
        return Str::random(40);
    }

    public static function hashToken(string $token): string
    {
        return Hash::make($token);
    }

    public function verifyConfirmToken(string $token): bool
    {
        return Hash::check($token, $this->confirm_token_hash);
    }

    public function verifyUnsubscribeToken(string $token): bool
    {
        return Hash::check($token, $this->unsubscribe_token_hash);
    }

    public function setConfirmToken(string $token): void
    {
        $this->confirm_token_hash = self::hashToken($token);
    }

    public function setUnsubscribeToken(string $token): void
    {
        $this->unsubscribe_token_hash = self::hashToken($token);
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}