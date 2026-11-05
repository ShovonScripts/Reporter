<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
    ];

    protected $casts = [
        'value' => 'json', // Store as JSON, but can be text
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get a site setting by key.
     */
    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        if (!$setting) {
            return $default;
        }

        return $setting->value;
    }

    /**
     * Set a site setting by key.
     */
    public static function set(string $key, $value, string $type = 'text', ?string $description = null): void
    {
        self::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => $type, 'description' => $description]
        );
    }

    /**
     * Get all settings as key-value array.
     */
    public static function allAsArray(): array
    {
        return self::pluck('value', 'key')->toArray();
    }
}