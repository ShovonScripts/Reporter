<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Models\ProfileEntry;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    public function show(): JsonResponse
    {
        $settings = SiteSetting::allAsArray();

        $profile = [
            'journalist_name' => $settings['journalist_name'] ?? '',
            'positioning_line' => $settings['positioning_line'] ?? '',
            'bio' => $settings['bio'] ?? '',
            'social_links' => $settings['social_links'] ?? [],
            'contact_details' => $settings['contact_details'] ?? [],
            'newsletter_copy' => $settings['newsletter_copy'] ?? '',
            'career' => ProfileEntry::verified()->career()->orderBy('position')->get(['id', 'kind', 'title', 'organisation', 'start_date', 'end_date', 'description', 'url', 'position']),
            'education' => ProfileEntry::verified()->education()->orderBy('position')->get(['id', 'kind', 'title', 'organisation', 'start_date', 'end_date', 'description', 'url', 'position']),
            'recognition' => ProfileEntry::verified()->recognition()->orderBy('position')->get(['id', 'kind', 'title', 'organisation', 'start_date', 'end_date', 'description', 'url', 'position']),
        ];

        return response()->json($profile);
    }
}