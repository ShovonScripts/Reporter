<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class PageViewsDaily extends Model
{
    protected $table = 'page_views_daily';

    protected $fillable = [
        'date',
        'path',
        'article_id',
        'views',
        'unique_visitors',
    ];

    protected $casts = [
        'date' => 'date',
        'views' => 'integer',
        'unique_visitors' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    public static function incrementViews(string $path, ?int $articleId = null): void
    {
        $today = now()->startOfDay();

        $record = self::firstOrCreate(
            ['date' => $today, 'path' => $path],
            ['article_id' => $articleId, 'views' => 0, 'unique_visitors' => 0]
        );

        if ($articleId !== null && $record->article_id !== $articleId) {
            $record->article_id = $articleId;
            $record->save();
        }

        $record->increment('views');
    }

    public static function incrementUniqueVisitors(string $path, ?int $articleId = null): void
    {
        $today = now()->startOfDay();

        self::firstOrCreate(
            ['date' => $today, 'path' => $path],
            ['article_id' => $articleId, 'views' => 0, 'unique_visitors' => 0]
        )->increment('unique_visitors');
    }
}