<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Media extends Model
{
    protected $fillable = [
        'path',
        'mime',
        'width',
        'height',
        'alt_text',
        'credit',
        'caption',
        'rights_confirmed',
        'rights_note',
    ];

    protected $appends = [
        'url',
    ];

    protected $casts = [
        'width' => 'integer',
        'height' => 'integer',
        'rights_confirmed' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function articlesFeatured(): HasMany
    {
        return $this->hasMany(Article::class, 'featured_media_id');
    }

    public function articlesOg(): HasMany
    {
        return $this->hasMany(Article::class, 'og_media_id');
    }

    public function caseFilesFeatured(): HasMany
    {
        return $this->hasMany(CaseFile::class, 'featured_media_id');
    }

    public function caseFilesOg(): HasMany
    {
        return $this->hasMany(CaseFile::class, 'og_media_id');
    }

    public function caseFileDocuments(): HasMany
    {
        return $this->hasMany(CaseFileDocument::class);
    }

    public function getUrlAttribute(): string
    {
        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->path);
    }

    public function isImage(): bool
    {
        return str_starts_with($this->mime, 'image/');
    }

    public function canBePublic(): bool
    {
        return $this->rights_confirmed;
    }
}