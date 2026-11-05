<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ReferrersDaily extends Model
{
    protected $table = 'referrers_daily';

    protected $fillable = [
        'date',
        'source',
        'views',
    ];

    protected $casts = [
        'date' => 'date',
        'views' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public static function incrementViews(string $source): void
    {
        $today = now()->startOfDay();

        self::firstOrCreate(
            ['date' => $today, 'source' => $source],
            ['views' => 0]
        )->increment('views');
    }
}