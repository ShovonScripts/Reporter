<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ReferrersDaily extends Model
{
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
        $today = now()->toDateString();

        self::updateOrCreate(
            ['date' => $today, 'source' => $source],
            ['views' => DB::raw('views + 1')]
        );
    }
}