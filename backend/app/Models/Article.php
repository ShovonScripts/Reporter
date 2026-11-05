<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Article extends Model
{
    protected $fillable = [
        'type',
        'title',
        'slug',
        'summary',
        'body_json',
        'body_html',
        'status',
        'published_at',
        'scheduled_for',
        'publication_id',
        'original_url',
        'archived_url',
        'featured_media_id',
        'show_image',
        'is_featured',
        'featured_order',
        'reading_minutes',
        'seo_title',
        'seo_description',
        'og_media_id',
        'canonical_url',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'scheduled_for' => 'datetime',
        'show_image' => 'boolean',
        'is_featured' => 'boolean',
        'featured_order' => 'integer',
        'reading_minutes' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function publication(): BelongsTo
    {
        return $this->belongsTo(Publication::class);
    }

    public function featuredMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'featured_media_id');
    }

    public function ogMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'og_media_id');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'article_category')
            ->withPivot('is_primary')
            ->withTimestamps();
    }

    public function primaryCategory(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'article_category')
            ->wherePivot('is_primary', true)
            ->withTimestamps();
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'article_tag')
            ->withTimestamps();
    }

    public function caseFileParts(): HasMany
    {
        return $this->hasMany(CaseFilePart::class);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)
            ->orderBy('featured_order');
    }

    public function scopeExternal($query)
    {
        return $query->where('type', 'external');
    }

    public function scopeInternal($query)
    {
        return $query->where('type', 'internal');
    }
}