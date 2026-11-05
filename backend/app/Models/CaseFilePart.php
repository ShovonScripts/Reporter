<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CaseFilePart extends Model
{
    protected $fillable = [
        'case_file_id',
        'article_id',
        'position',
        'note',
    ];

    protected $casts = [
        'position' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function caseFile(): BelongsTo
    {
        return $this->belongsTo(CaseFile::class);
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}