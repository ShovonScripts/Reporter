<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CaseFileDocument extends Model
{
    protected $fillable = [
        'case_file_id',
        'title',
        'type',
        'media_id',
        'url',
        'is_public',
        'position',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'position' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function caseFile(): BelongsTo
    {
        return $this->belongsTo(CaseFile::class);
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    public function getUrlAttribute(): string
    {
        if ($this->media) {
            return $this->media->url;
        }
        return $this->url ?? '';
    }
}