<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Full-text search indexes are only supported on MySQL/MariaDB.
     * SQLite deployments fall back to LIKE queries in SearchController.
     */
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        if (!in_array($driver, ['mysql', 'mariadb'], true)) {
            return;
        }

        try {
            DB::statement('ALTER TABLE articles ADD FULLTEXT articles_fulltext (title, summary)');
        } catch (\Throwable) {
            // Index already exists.
        }

        try {
            DB::statement('ALTER TABLE case_files ADD FULLTEXT case_files_fulltext (title, deck, overview_html)');
        } catch (\Throwable) {
            // Index already exists.
        }
    }

    public function down(): void
    {
        $driver = DB::connection()->getDriverName();

        if (!in_array($driver, ['mysql', 'mariadb'], true)) {
            return;
        }

        try {
            DB::statement('ALTER TABLE articles DROP INDEX articles_fulltext');
        } catch (\Throwable) {
            // Index does not exist.
        }

        try {
            DB::statement('ALTER TABLE case_files DROP INDEX case_files_fulltext');
        } catch (\Throwable) {
            // Index does not exist.
        }
    }
};
