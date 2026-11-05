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
        // Guard against databases where the media table was created under the
        // previous migration filename (keeps upgrades from older checkouts safe).
        if (Schema::hasTable('media')) {
            return;
        }

        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('path'); // Relative path from storage root
            $table->string('mime');
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->text('alt_text')->nullable();
            $table->string('credit')->nullable();
            $table->text('caption')->nullable();
            $table->boolean('rights_confirmed')->default(false); // Rule: cannot be shown publicly unless true
            $table->text('rights_note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};