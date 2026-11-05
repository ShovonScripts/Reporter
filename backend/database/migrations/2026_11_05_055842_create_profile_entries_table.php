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
        Schema::create('profile_entries', function (Blueprint $table) {
            $table->id();
            $table->enum('kind', ['career', 'education', 'recognition'])->index();
            $table->string('title');
            $table->string('organisation')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable(); // Null = present
            $table->text('description')->nullable();
            $table->string('url')->nullable();
            $table->boolean('verified')->default(false)->index(); // Unverified items are never shown publicly
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index(['kind', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profile_entries');
    }
};