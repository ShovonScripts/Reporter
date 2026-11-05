<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = SiteSetting::allAsArray();
        return response()->json($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'journalist_name' => 'nullable|string|max:255',
            'positioning_line' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'social_links' => 'nullable|array',
            'social_links.*' => 'string|url|max:500',
            'contact_details' => 'nullable|array',
            'newsletter_copy' => 'nullable|string',
            'newsletter_consent_version' => 'nullable|string|max:20',
        ]);

        foreach ($validated as $key => $value) {
            SiteSetting::set($key, $value);
        }

        $settings = SiteSetting::allAsArray();
        return response()->json($settings);
    }
}