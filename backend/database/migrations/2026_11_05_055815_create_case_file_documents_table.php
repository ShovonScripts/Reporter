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
        Schema::create('case_file_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_file_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('type'); // e.g., pdf, image, link
            $table->foreignId('media_id')->nullable()->constrained()->nullOnDelete();
            $table->string('url')->nullable(); // Alternative to media_id for external links
            $table->boolean('is_public')->default(true)->index(); // Only public items are served
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index(['case_file_id', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('case_file_documents');
    }
};