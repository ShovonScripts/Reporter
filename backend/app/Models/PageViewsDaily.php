<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class PageViewsDaily extends Model
{
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
        $today = now()->toDateString();

        self::updateOrCreate(
            ['date' => $today, 'path' => $path],
            [
                'article_id' => $articleId,
                'views' => \DB::raw('views + 1'),
                // unique_visitors incremented separately via salted hash
            ]
        );
    }

    public static function incrementUniqueVisitors(string $path, ?int $articleId = null): void
    {
        $today = now()->toDateString();

        self::where('date', $today)
            ->where('path', $path)
            ->increment('unique_visitors');
    }
}