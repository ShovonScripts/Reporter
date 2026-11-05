<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class MediaController extends Controller
{
    private ImageManager $imageManager;

    public function __construct()
    {
        $this->imageManager = new ImageManager(new Driver());
    }

    public function index(Request $request): JsonResponse
    {
        $query = Media::orderBy('created_at', 'desc');

        if ($request->filled('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('path', 'like', "%{$request->q}%")
                  ->orWhere('alt_text', 'like', "%{$request->q}%")
                  ->orWhere('credit', 'like', "%{$request->q}%");
            });
        }

        $perPage = min($request->integer('per_page', 30), 100);
        $media = $query->paginate($perPage);

        return response()->json($media);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240|mimes:jpg,jpeg,png,gif,webp,avif,svg,pdf',
            'alt_text' => 'nullable|string|max:500',
            'credit' => 'nullable|string|max:255',
            'caption' => 'nullable|string',
            'rights_confirmed' => 'boolean',
            'rights_note' => 'nullable|string',
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = strtolower($file->getClientOriginalExtension());
        $mime = $file->getMimeType();

        // Generate secure filename
        $filename = Str::random(32) . '.' . $extension;
        $path = 'uploads/' . date('Y/m') . '/' . $filename;

        // Store original file
        Storage::disk('public')->put($path, file_get_contents($file));

        $width = null;
        $height = null;

        // Process images - generate responsive variants
        if (str_starts_with($mime, 'image/') && $extension !== 'svg') {
            try {
                $image = $this->imageManager->read(Storage::disk('public')->path($path));

                $width = $image->width();
                $height = $image->height();

                // Generate WebP variant
                $webpPath = Str::replaceLast('.' . $extension, '.webp', $path);
                $webpImage = $image->toWebp(85);
                Storage::disk('public')->put($webpPath, (string) $webpImage);

                // Generate AVIF variant
                $avifPath = Str::replaceLast('.' . $extension, '.avif', $path);
                $avifImage = $image->toAvif(75);
                Storage::disk('public')->put($avifPath, (string) $avifImage);

                // Generate responsive sizes for images (max widths)
                $sizes = [400, 800, 1200, 1600];
                foreach ($sizes as $size) {
                    if ($width > $size) {
                        $resizedPath = Str::replaceLast('.' . $extension, "-{$size}w.{$extension}", $path);
                        $resized = $image->scaleDown($size);
                        Storage::disk('public')->put($resizedPath, (string) $resized->toWebp(85));
                    }
                }

                // Strip EXIF data (already done by Intervention by default when re-encoding)
            } catch (\Throwable $e) {
                \Log::warning('Image processing failed', ['path' => $path, 'error' => $e->getMessage()]);
            }
        }

        $media = Media::create([
            'path' => $path,
            'mime' => $mime,
            'width' => $width,
            'height' => $height,
            'alt_text' => $request->alt_text,
            'credit' => $request->credit,
            'caption' => $request->caption,
            'rights_confirmed' => $request->boolean('rights_confirmed', false),
            'rights_note' => $request->rights_note,
        ]);

        return response()->json($media, 201);
    }

    public function show(int $id): JsonResponse
    {
        $media = Media::findOrFail($id);
        return response()->json($media);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $media = Media::findOrFail($id);

        $request->validate([
            'alt_text' => 'nullable|string|max:500',
            'credit' => 'nullable|string|max:255',
            'caption' => 'nullable|string',
            'rights_confirmed' => 'boolean',
            'rights_note' => 'nullable|string',
        ]);

        $media->update($request->only(['alt_text', 'credit', 'caption', 'rights_confirmed', 'rights_note']));

        return response()->json($media);
    }

    public function destroy(int $id): JsonResponse
    {
        $media = Media::findOrFail($id);

        // Delete all variants
        $basePath = $media->path;
        $extension = pathinfo($basePath, PATHINFO_EXTENSION);
        $baseWithoutExt = Str::replaceLast('.' . $extension, '', $basePath);

        $filesToDelete = [
            $basePath,
            $baseWithoutExt . '.webp',
            $baseWithoutExt . '.avif',
        ];

        // Add responsive sizes
        foreach ([400, 800, 1200, 1600] as $size) {
            $filesToDelete[] = $baseWithoutExt . "-{$size}w.{$extension}";
            $filesToDelete[] = $baseWithoutExt . "-{$size}w.webp";
        }

        foreach ($filesToDelete as $filePath) {
            Storage::disk('public')->delete($filePath);
        }

        $media->delete();

        return response()->json(['message' => 'Media deleted.']);
    }

    public function confirmRights(Request $request, int $id): JsonResponse
    {
        $media = Media::findOrFail($id);

        $request->validate([
            'rights_confirmed' => 'required|boolean',
            'rights_note' => 'nullable|string',
        ]);

        $media->update([
            'rights_confirmed' => $request->rights_confirmed,
            'rights_note' => $request->rights_note,
        ]);

        return response()->json($media);
    }
}