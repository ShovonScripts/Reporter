<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Publication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PublicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $publications = Publication::orderBy('name')->paginate(50);
        return response()->json($publications);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:publications,slug',
            'website_url' => 'nullable|url|max:500',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        }

        $publication = Publication::create($validated);
        return response()->json($publication, 201);
    }

    public function show(int $id): JsonResponse
    {
        $publication = Publication::findOrFail($id);
        return response()->json($publication);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $publication = Publication::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:publications,slug,' . $id,
            'website_url' => 'nullable|url|max:500',
        ]);

        $publication->update($validated);
        return response()->json($publication);
    }

    public function destroy(int $id): JsonResponse
    {
        $publication = Publication::findOrFail($id);
        $publication->delete();
        return response()->json(['message' => 'Publication deleted.']);
    }
}