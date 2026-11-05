<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfileEntry extends Model
{
    protected $fillable = [
        'kind',
        'title',
        'organisation',
        'start_date',
        'end_date',
        'description',
        'url',
        'verified',
        'position',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'verified' => 'boolean',
        'position' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function scopeVerified($query)
    {
        return $query->where('verified', true);
    }

    public function scopeCareer($query)
    {
        return $query->where('kind', 'career');
    }

    public function scopeEducation($query)
    {
        return $query->where('kind', 'education');
    }

    public function scopeRecognition($query)
    {
        return $query->where('kind', 'recognition');
    }

    public function isCurrent(): bool
    {
        return $this->end_date === null;
    }
}