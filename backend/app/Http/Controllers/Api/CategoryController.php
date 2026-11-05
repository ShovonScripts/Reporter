<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::orderBy('position')->orderBy('name')->get(['id', 'name', 'slug', 'description', 'position']);

        return response()->json($categories);
    }
}