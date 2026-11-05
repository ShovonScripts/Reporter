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
        Schema::create('case_files', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('deck')->nullable(); // Subtitle/deck
            $table->enum('status', ['draft', 'published'])->default('draft')->index();
            $table->string('case_status')->nullable(); // e.g., complete, ongoing
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
            $table->longText('overview_html')->nullable();
            $table->longText('methods_html')->nullable();
            $table->longText('impact_html')->nullable();
            $table->foreignId('featured_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->foreignId('og_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('case_files');
    }
};