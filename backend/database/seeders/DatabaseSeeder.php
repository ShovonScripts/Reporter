<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@prodo.test')],
            [
                'name' => env('ADMIN_NAME', 'ProDo Admin'),
                'password' => Hash::make(env('ADMIN_PASSWORD', 'password')),
            ]
        );

        SiteSetting::set('newsletter_consent_version', '1.0', 'text', 'Newsletter consent text version');
        SiteSetting::set('contact_notification_email', env('ADMIN_EMAIL', 'admin@prodo.test'), 'email', 'Email address to receive contact form notifications');
    }
}