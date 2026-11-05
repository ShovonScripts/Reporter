<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CaseFile extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'deck',
        'status',
        'case_status',
        'period_start',
        'period_end',
        'overview_html',
        'methods_html',
        'impact_html',
        'featured_media_id',
        'seo_title',
        'seo_description',
        'og_media_id',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function featuredMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'featured_media_id');
    }

    public function ogMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'og_media_id');
    }

    public function parts(): HasMany
    {
        return $this->hasMany(CaseFilePart::class)->orderBy('position');
    }

    public function timeline(): HasMany
    {
        return $this->hasMany(CaseFileTimeline::class)->orderBy('position');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(CaseFileDocument::class)->where('is_public', true)->orderBy('position');
    }

    public function allDocuments(): HasMany
    {
        return $this->hasMany(CaseFileDocument::class)->orderBy('position');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function hasOverview(): bool
    {
        return !empty($this->overview_html);
    }

    public function hasMethods(): bool
    {
        return !empty($this->methods_html);
    }

    public function hasImpact(): bool
    {
        return !empty($this->impact_html);
    }
}