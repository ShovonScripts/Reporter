<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('page_views_daily', function (Blueprint $table) {
            $table->id();
            $table->date('date')->index();
            $table->string('path')->index(); // The page path
            $table->foreignId('article_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('views')->default(0);
            $table->unsignedInteger('unique_visitors')->default(0); // Derived from daily-rotating salted hash
            $table->timestamps();

            $table->unique(['date', 'path']);
            $table->index(['date', 'article_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_views_daily');
    }
};