<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\CaseFileController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\PublicationController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\AnalyticsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::get('/profile', [ProfileController::class, 'show']);

Route::prefix('articles')->group(function () {
    Route::get('/', [ArticleController::class, 'index']);
    Route::get('/{slug}', [ArticleController::class, 'show']);
});

Route::prefix('case-files')->group(function () {
    Route::get('/', [CaseFileController::class, 'index']);
    Route::get('/{slug}', [CaseFileController::class, 'show']);
});

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/tags', [TagController::class, 'index']);
Route::get('/publications', [PublicationController::class, 'index']);

Route::get('/search', [SearchController::class, 'search']);

Route::prefix('newsletter')->group(function () {
    Route::post('/subscribe', [NewsletterController::class, 'subscribe']);
    Route::get('/confirm/{token}', [NewsletterController::class, 'confirm']);
    Route::get('/unsubscribe/{token}', [NewsletterController::class, 'unsubscribe']);
});

Route::post('/contact', [ContactController::class, 'store']);
Route::post('/events', [AnalyticsController::class, 'track']);

// Admin routes (protected by auth:sanctum)
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    Route::apiResource('articles', \App\Http\Controllers\Admin\ArticleController::class);
    Route::post('articles/{id}/publish', [\App\Http\Controllers\Admin\ArticleController::class, 'publish']);
    Route::post('articles/{id}/schedule', [\App\Http\Controllers\Admin\ArticleController::class, 'schedule']);
    Route::post('articles/{id}/feature', [\App\Http\Controllers\Admin\ArticleController::class, 'feature']);

    Route::apiResource('case-files', \App\Http\Controllers\Admin\CaseFileController::class);
    Route::post('case-files/{id}/parts', [\App\Http\Controllers\Admin\CaseFileController::class, 'addPart']);
    Route::post('case-files/{id}/parts/reorder', [\App\Http\Controllers\Admin\CaseFileController::class, 'reorderParts']);
    Route::put('case-files/{id}/parts/{partId}', [\App\Http\Controllers\Admin\CaseFileController::class, 'updatePart']);
    Route::delete('case-files/{id}/parts/{partId}', [\App\Http\Controllers\Admin\CaseFileController::class, 'removePart']);
    Route::post('case-files/{id}/timeline', [\App\Http\Controllers\Admin\CaseFileController::class, 'addTimelineEvent']);
    Route::put('case-files/{id}/timeline/{eventId}', [\App\Http\Controllers\Admin\CaseFileController::class, 'updateTimelineEvent']);
    Route::delete('case-files/{id}/timeline/{eventId}', [\App\Http\Controllers\Admin\CaseFileController::class, 'removeTimelineEvent']);
    Route::post('case-files/{id}/documents', [\App\Http\Controllers\Admin\CaseFileController::class, 'addDocument']);
    Route::put('case-files/{id}/documents/{docId}', [\App\Http\Controllers\Admin\CaseFileController::class, 'updateDocument']);
    Route::delete('case-files/{id}/documents/{docId}', [\App\Http\Controllers\Admin\CaseFileController::class, 'removeDocument']);

    Route::apiResource('profile-entries', \App\Http\Controllers\Admin\ProfileEntryController::class);
    Route::post('profile-entries/reorder', [\App\Http\Controllers\Admin\ProfileEntryController::class, 'reorder']);

    Route::apiResource('media', \App\Http\Controllers\Admin\MediaController::class);
    Route::post('media/{id}/confirm-rights', [\App\Http\Controllers\Admin\MediaController::class, 'confirmRights']);

    Route::apiResource('categories', \App\Http\Controllers\Admin\CategoryController::class);
    Route::apiResource('tags', \App\Http\Controllers\Admin\TagController::class);
    Route::apiResource('publications', \App\Http\Controllers\Admin\PublicationController::class);
    Route::apiResource('subscribers', \App\Http\Controllers\Admin\SubscriberController::class)->only(['index', 'destroy']);
    Route::get('subscribers/export', [\App\Http\Controllers\Admin\SubscriberController::class, 'export']);
    Route::apiResource('newsletter-issues', \App\Http\Controllers\Admin\NewsletterIssueController::class);
    Route::post('newsletter-issues/{id}/send', [\App\Http\Controllers\Admin\NewsletterIssueController::class, 'send']);
    Route::post('newsletter-issues/{id}/schedule', [\App\Http\Controllers\Admin\NewsletterIssueController::class, 'schedule']);
    Route::post('newsletter-issues/{id}/test-send', [\App\Http\Controllers\Admin\NewsletterIssueController::class, 'testSend']);
    Route::get('settings', [\App\Http\Controllers\Admin\SettingController::class, 'index']);
    Route::put('settings', [\App\Http\Controllers\Admin\SettingController::class, 'update']);
    Route::get('analytics/summary', [\App\Http\Controllers\Admin\AnalyticsController::class, 'summary']);
    Route::get('analytics/articles', [\App\Http\Controllers\Admin\AnalyticsController::class, 'articles']);

    // Auth routes
    Route::post('auth/logout', [\App\Http\Controllers\Admin\AuthController::class, 'logout']);
    Route::post('auth/two-factor/secret', [\App\Http\Controllers\Admin\AuthController::class, 'generateTwoFactorSecret']);
    Route::post('auth/two-factor', [\App\Http\Controllers\Admin\AuthController::class, 'enableTwoFactor']);
    Route::delete('auth/two-factor', [\App\Http\Controllers\Admin\AuthController::class, 'disableTwoFactor']);
    Route::post('auth/two-factor/recovery', [\App\Http\Controllers\Admin\AuthController::class, 'verifyRecoveryCode']);
});

// Admin login (no auth middleware)
Route::post('/admin/auth/login', [\App\Http\Controllers\Admin\AuthController::class, 'login']);
Route::get('/admin/auth/user', [\App\Http\Controllers\Admin\AuthController::class, 'user'])->middleware('auth:sanctum');