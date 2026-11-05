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
        Schema::create('subscribers', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->enum('status', ['pending', 'confirmed', 'unsubscribed', 'bounced'])->default('pending')->index();
            $table->string('confirm_token_hash')->nullable(); // Hashed token for double opt-in
            $table->string('unsubscribe_token_hash')->nullable(); // Hashed token for unsubscribe
            $table->timestamp('confirmed_at')->nullable();
            $table->string('source')->nullable(); // Where they signed up from
            $table->string('consent_text_version')->nullable(); // Version of consent text
            $table->timestamps();

            $table->index(['status', 'confirmed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscribers');
    }
};