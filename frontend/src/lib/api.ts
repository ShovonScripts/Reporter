import axios, { AxiosInstance, AxiosError } from 'axios';

// API base URL - points to Laravel backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // Important for Sanctum cookie auth
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add CSRF token if available
        if (typeof window !== 'undefined') {
          const csrfToken = this.getCsrfToken();
          if (csrfToken) {
            config.headers['X-XSRF-TOKEN'] = csrfToken;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for auth handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Clear auth state
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:logout'));
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getCsrfToken(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  // Get CSRF cookie (Sanctum route lives at the app root, not under /api/v1)
  async getCsrfCookie(): Promise<void> {
    const rootUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    await axios.get(`${rootUrl}/sanctum/csrf-cookie`, { withCredentials: true });
  }

  // Auth
  async login(email: string, password: string, twoFactorCode?: string, remember = false) {
    // Sanctum's stateful API requires a CSRF cookie before the first state-changing request.
    await this.getCsrfCookie();
    return this.client.post('/admin/auth/login', { email, password, two_factor_code: twoFactorCode, remember });
  }

  async logout() {
    return this.client.post('/admin/auth/logout');
  }

  async getUser() {
    return this.client.get('/admin/auth/user');
  }

  async enableTwoFactor(password: string, code: string) {
    return this.client.post('/admin/auth/two-factor', { password, code });
  }

  async disableTwoFactor(password: string, code: string) {
    return this.client.delete('/admin/auth/two-factor', { data: { password, code } });
  }

  async verifyRecoveryCode(code: string) {
    return this.client.post('/admin/auth/two-factor/recovery', { code });
  }

  // Public API
  async getProfile() {
    return this.client.get('/profile');
  }

  async getArticles(params?: Record<string, any>) {
    return this.client.get('/articles', { params });
  }

  async getArticle(slug: string) {
    return this.client.get(`/articles/${slug}`);
  }

  async getCaseFiles() {
    return this.client.get('/case-files');
  }

  async getCaseFile(slug: string) {
    return this.client.get(`/case-files/${slug}`);
  }

  async getCategories() {
    return this.client.get('/categories');
  }

  async getTags() {
    return this.client.get('/tags');
  }

  async getPublications() {
    return this.client.get('/publications');
  }

  async search(query: string) {
    return this.client.get('/search', { params: { q: query } });
  }

  async subscribeNewsletter(email: string, source?: string) {
    return this.client.post('/newsletter/subscribe', { email, source });
  }

  async confirmNewsletter(token: string) {
    return this.client.get(`/newsletter/confirm/${token}`);
  }

  async unsubscribeNewsletter(token: string) {
    return this.client.get(`/newsletter/unsubscribe/${token}`);
  }

  async sendContact(data: { name: string; email: string; message: string; honeypot?: string }) {
    return this.client.post('/contact', data);
  }

  async trackEvent(data: { path: string; article_id?: number; referrer?: string }) {
    return this.client.post('/events', data);
  }

  // Admin API
  // Articles
  async adminGetArticles(params?: Record<string, any>) {
    return this.client.get('/admin/articles', { params });
  }

  async adminCreateArticle(data: any) {
    return this.client.post('/admin/articles', data);
  }

  async adminGetArticle(id: number) {
    return this.client.get(`/admin/articles/${id}`);
  }

  async adminUpdateArticle(id: number, data: any) {
    return this.client.put(`/admin/articles/${id}`, data);
  }

  async adminDeleteArticle(id: number) {
    return this.client.delete(`/admin/articles/${id}`);
  }

  async adminPublishArticle(id: number) {
    return this.client.post(`/admin/articles/${id}/publish`);
  }

  async adminScheduleArticle(id: number, scheduledFor: string) {
    return this.client.post(`/admin/articles/${id}/schedule`, { scheduled_for: scheduledFor });
  }

  async adminFeatureArticle(id: number, isFeatured: boolean, featuredOrder?: number) {
    return this.client.post(`/admin/articles/${id}/feature`, { is_featured: isFeatured, featured_order: featuredOrder });
  }

  // Case Files
  async adminGetCaseFiles(params?: Record<string, any>) {
    return this.client.get('/admin/case-files', { params });
  }

  async adminCreateCaseFile(data: any) {
    return this.client.post('/admin/case-files', data);
  }

  async adminGetCaseFile(id: number) {
    return this.client.get(`/admin/case-files/${id}`);
  }

  async adminUpdateCaseFile(id: number, data: any) {
    return this.client.put(`/admin/case-files/${id}`, data);
  }

  async adminDeleteCaseFile(id: number) {
    return this.client.delete(`/admin/case-files/${id}`);
  }

  // Case File Parts
  async adminAddCaseFilePart(caseFileId: number, data: any) {
    return this.client.post(`/admin/case-files/${caseFileId}/parts`, data);
  }

  async adminUpdateCaseFilePart(caseFileId: number, partId: number, data: any) {
    return this.client.put(`/admin/case-files/${caseFileId}/parts/${partId}`, data);
  }

  async adminRemoveCaseFilePart(caseFileId: number, partId: number) {
    return this.client.delete(`/admin/case-files/${caseFileId}/parts/${partId}`);
  }

  async adminReorderCaseFileParts(caseFileId: number, partIds: number[]) {
    return this.client.post(`/admin/case-files/${caseFileId}/parts/reorder`, { part_ids: partIds });
  }

  // Case File Timeline
  async adminAddCaseFileTimeline(caseFileId: number, data: any) {
    return this.client.post(`/admin/case-files/${caseFileId}/timeline`, data);
  }

  async adminUpdateCaseFileTimeline(caseFileId: number, eventId: number, data: any) {
    return this.client.put(`/admin/case-files/${caseFileId}/timeline/${eventId}`, data);
  }

  async adminRemoveCaseFileTimeline(caseFileId: number, eventId: number) {
    return this.client.delete(`/admin/case-files/${caseFileId}/timeline/${eventId}`);
  }

  // Case File Documents
  async adminAddCaseFileDocument(caseFileId: number, data: any) {
    return this.client.post(`/admin/case-files/${caseFileId}/documents`, data);
  }

  async adminUpdateCaseFileDocument(caseFileId: number, docId: number, data: any) {
    return this.client.put(`/admin/case-files/${caseFileId}/documents/${docId}`, data);
  }

  async adminRemoveCaseFileDocument(caseFileId: number, docId: number) {
    return this.client.delete(`/admin/case-files/${caseFileId}/documents/${docId}`);
  }

  // Profile Entries
  async adminGetProfileEntries(params?: Record<string, any>) {
    return this.client.get('/admin/profile-entries', { params });
  }

  async adminCreateProfileEntry(data: any) {
    return this.client.post('/admin/profile-entries', data);
  }

  async adminUpdateProfileEntry(id: number, data: any) {
    return this.client.put(`/admin/profile-entries/${id}`, data);
  }

  async adminDeleteProfileEntry(id: number) {
    return this.client.delete(`/admin/profile-entries/${id}`);
  }

  async adminReorderProfileEntries(kind: string, entryIds: number[]) {
    return this.client.post('/admin/profile-entries/reorder', { kind, entry_ids: entryIds });
  }

  // Media
  async adminGetMedia(params?: Record<string, any>) {
    return this.client.get('/admin/media', { params });
  }

  async adminUploadMedia(file: File, data?: any) {
    const formData = new FormData();
    formData.append('file', file);
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }
    return this.client.post('/admin/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async adminUpdateMedia(id: number, data: any) {
    return this.client.put(`/admin/media/${id}`, data);
  }

  async adminDeleteMedia(id: number) {
    return this.client.delete(`/admin/media/${id}`);
  }

  async adminConfirmMediaRights(id: number, rightsConfirmed: boolean, rightsNote?: string) {
    return this.client.post(`/admin/media/${id}/confirm-rights`, { rights_confirmed: rightsConfirmed, rights_note: rightsNote });
  }

  // Categories
  async adminGetCategories() {
    return this.client.get('/admin/categories');
  }

  async adminCreateCategory(data: any) {
    return this.client.post('/admin/categories', data);
  }

  async adminUpdateCategory(id: number, data: any) {
    return this.client.put(`/admin/categories/${id}`, data);
  }

  async adminDeleteCategory(id: number) {
    return this.client.delete(`/admin/categories/${id}`);
  }

  // Tags
  async adminGetTags() {
    return this.client.get('/admin/tags');
  }

  async adminCreateTag(data: any) {
    return this.client.post('/admin/tags', data);
  }

  async adminUpdateTag(id: number, data: any) {
    return this.client.put(`/admin/tags/${id}`, data);
  }

  async adminDeleteTag(id: number) {
    return this.client.delete(`/admin/tags/${id}`);
  }

  // Publications
  async adminGetPublications() {
    return this.client.get('/admin/publications');
  }

  async adminCreatePublication(data: any) {
    return this.client.post('/admin/publications', data);
  }

  async adminUpdatePublication(id: number, data: any) {
    return this.client.put(`/admin/publications/${id}`, data);
  }

  async adminDeletePublication(id: number) {
    return this.client.delete(`/admin/publications/${id}`);
  }

  // Subscribers
  async adminGetSubscribers(params?: Record<string, any>) {
    return this.client.get('/admin/subscribers', { params });
  }

  async adminDeleteSubscriber(id: number) {
    return this.client.delete(`/admin/subscribers/${id}`);
  }

  async adminExportSubscribers(status?: string) {
    return this.client.get('/admin/subscribers/export', { params: { status } });
  }

  // Newsletter Issues
  async adminGetNewsletterIssues(params?: Record<string, any>) {
    return this.client.get('/admin/newsletter-issues', { params });
  }

  async adminCreateNewsletterIssue(data: any) {
    return this.client.post('/admin/newsletter-issues', data);
  }

  async adminGetNewsletterIssue(id: number) {
    return this.client.get(`/admin/newsletter-issues/${id}`);
  }

  async adminUpdateNewsletterIssue(id: number, data: any) {
    return this.client.put(`/admin/newsletter-issues/${id}`, data);
  }

  async adminDeleteNewsletterIssue(id: number) {
    return this.client.delete(`/admin/newsletter-issues/${id}`);
  }

  async adminSendNewsletterIssue(id: number) {
    return this.client.post(`/admin/newsletter-issues/${id}/send`);
  }

  async adminScheduleNewsletterIssue(id: number, scheduledFor: string) {
    return this.client.post(`/admin/newsletter-issues/${id}/schedule`, { scheduled_for: scheduledFor });
  }

  async adminTestSendNewsletterIssue(id: number, testEmail: string) {
    return this.client.post(`/admin/newsletter-issues/${id}/test-send`, { test_email: testEmail });
  }

  // Settings
  async adminGetSettings() {
    return this.client.get('/admin/settings');
  }

  async adminUpdateSettings(data: any) {
    return this.client.put('/admin/settings', data);
  }

  // Analytics
  async adminGetAnalyticsSummary(days = 30) {
    return this.client.get('/admin/analytics/summary', { params: { days } });
  }

  async adminGetAnalyticsArticles(params?: Record<string, any>) {
    return this.client.get('/admin/analytics/articles', { params });
  }
}

export const api = new ApiClient();