<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::orderBy('position')->orderBy('name')->paginate(50);
        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'nullable|string|max:100|unique:categories,slug',
            'description' => 'nullable|string',
            'position' => 'nullable|integer|min:0',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        }

        $maxPosition = Category::max('position') ?? -1;
        $validated['position'] = $request->position ?? $maxPosition + 1;

        $category = Category::create($validated);
        return response()->json($category, 201);
    }

    public function show(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        return response()->json($category);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'slug' => 'sometimes|string|max:100|unique:categories,slug,' . $id,
            'description' => 'nullable|string',
            'position' => 'nullable|integer|min:0',
        ]);

        $category->update($validated);
        return response()->json($category);
    }

    public function destroy(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Category deleted.']);
    }
}