<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publication;
use Illuminate\Http\JsonResponse;

class PublicationController extends Controller
{
    public function index(): JsonResponse
    {
        $publications = Publication::orderBy('name')->get(['id', 'name', 'slug', 'website_url']);

        return response()->json($publications);
    }
}