<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CaseFileTimeline extends Model
{
    protected $fillable = [
        'case_file_id',
        'date',
        'text',
        'position',
    ];

    protected $casts = [
        'date' => 'date',
        'position' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function caseFile(): BelongsTo
    {
        return $this->belongsTo(CaseFile::class);
    }
}