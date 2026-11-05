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
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['external', 'internal'])->index();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary')->nullable(); // Independently written description (external) or standfirst (internal)
            $table->longText('body_json')->nullable(); // Internal only - TipTap JSON
            $table->longText('body_html')->nullable(); // Internal only - Sanitised rendered HTML
            $table->enum('status', ['draft', 'scheduled', 'published', 'archived'])->default('draft')->index();
            $table->timestamp('published_at')->nullable()->index(); // Original date for external; publish date for internal
            $table->timestamp('scheduled_for')->nullable()->index();
            $table->foreignId('publication_id')->nullable()->constrained()->nullOnDelete(); // External only
            $table->string('original_url')->nullable(); // External only, required when type=external
            $table->string('archived_url')->nullable(); // Optional archived reference
            $table->foreignId('featured_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->boolean('show_image')->default(true); // Per-article image visibility switch
            $table->boolean('is_featured')->default(false)->index();
            $table->unsignedInteger('featured_order')->nullable();
            $table->unsignedInteger('reading_minutes')->nullable(); // Internal only, computed
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->foreignId('og_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('canonical_url')->nullable(); // For internal articles also published elsewhere
            $table->timestamps();

            // Constraints
            $table->index(['status', 'published_at']);
            $table->index(['type', 'status', 'published_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};