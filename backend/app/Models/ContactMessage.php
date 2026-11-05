<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = [
        'name',
        'email',
        'message',
        'handled_at',
    ];

    protected $casts = [
        'handled_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function scopeUnhandled($query)
    {
        return $query->whereNull('handled_at');
    }

    public function scopeHandled($query)
    {
        return $query->whereNotNull('handled_at');
    }

    public function isHandled(): bool
    {
        return $this->handled_at !== null;
    }

    public function markHandled(): void
    {
        $this->update(['handled_at' => now()]);
    }
}