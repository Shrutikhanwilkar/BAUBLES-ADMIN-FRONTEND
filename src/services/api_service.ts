import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from './api_config';
import {
    LoginRequest,
    LoginResponse,
    ApiError,
    CreateCategoryRequest,
    UpdateCategoryRequest,
    CreateCategoryResponse,
    UpdateCategoryResponse,
    DeleteCategoryResponse,
    GetCategoriesResponse,
    GetCategoryByIdResponse,
    CreateAudioBookRequest,
    UpdateAudioBookRequest,
    CreateAudioBookResponse,
    UpdateAudioBookResponse,
    DeleteAudioBookResponse,
    GetAudioBooksResponse,
    GetAudioBookByIdResponse,
    AudioBookListParams,
    CreateGiftRequest,
    UpdateGiftRequest,
    CreateGiftResponse,
    UpdateGiftResponse,
    DeleteGiftResponse,
    GetGiftsResponse,
    GetGiftByIdResponse,
    GiftListParams,
    CreateGiftPackageRequest,
    UpdateGiftPackageRequest,
    CreateGiftPackageResponse,
    UpdateGiftPackageResponse,
    DeleteGiftPackageResponse,
    GetGiftPackagesResponse,
    GiftPackageListParams,
    GetDashboardStatsResponse,
    GetAdminProfileResponse,
    UpdateProfileResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
    ChangePasswordResponse,
    ContactListParams,
    GetContactsResponse,
    ResolveContactRequest,
    ResolveContactResponse,
    CreateAudioPlaybackRequest,
    UpdateAudioPlaybackRequest,
    CreateAudioPlaybackResponse,
    UpdateAudioPlaybackResponse,
    DeleteAudioPlaybackResponse,
    GetAudioPlaybacksResponse,
    UserListParams,
    GetUsersResponse,
    AddDashboardVideoRequest,
    AddDashboardVideoResponse,
    SendOTPRequest,
    SendOTPResponse,
    VerifyOTPRequest,
    VerifyOTPResponse,
    ResendOTPRequest,
    ResendOTPResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    CreateAdminRequest,
    UpdateAdminRequest,
    CreateAdminResponse,
    UpdateAdminResponse,
    DeleteAdminResponse,
    AdminListParams,
    GetAdminsResponse,
    UpdateAppVersionRequest,
    UpdateAppVersionResponse,
    GetAppVersionResponse,
    SendBroadcastRequest,
    SendBroadcastResponse,
    GetBroadcastHistoryResponse,
    UpdateUserStatusResponse,
    ReportsByStateParams,
    ReportsByStateResponse,
    GetReportCategoryDetailResponse,
    ReportCategoryDetailParams,
    ReportDashboardParams,
    GetBehaviourReportResponse,
    GetPopularReportResponse,
    GetStateReportResponse
} from './api_types';

class ApiService {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            timeout: API_CONFIG.TIMEOUT,
            headers: API_CONFIG.HEADERS,
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        this.axiosInstance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = this.getAuthToken();
                if (token) {
                    config.headers['x-authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        this.axiosInstance.interceptors.response.use(
            (response) => {
                return response.data;
            },
            (error: AxiosError) => {
                const apiError: ApiError = {
                    success: false,
                    message: 'An error occurred',
                };

                if (error.response) {
                    const data = error.response.data as any;
                    apiError.message = data?.message || 'Server error occurred';
                    apiError.error = data?.error;
                } else if (error.request) {
                    apiError.message = 'No response from server';
                } else {
                    apiError.message = error.message || 'Request failed';
                }

                return Promise.reject(apiError);
            }
        );
    }

    private getAuthToken(): string | null {
        return localStorage.getItem('authToken');
    }

    private setAuthToken(token: string): void {
        localStorage.setItem('authToken', token);
    }

    public removeAuthToken(): void {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
    }

    public async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await this.axiosInstance.post<any, LoginResponse>(
            API_ENDPOINTS.AUTH.LOGIN,
            credentials
        );

        if (response.success && response.data.token) {
            this.setAuthToken(response.data.token);
        }

        return response;
    }

    public logout(): void {
        this.removeAuthToken();
    }

    public isAuthenticated(): boolean {
        return this.getAuthToken() !== null;
    }

    public async sendOTP(data: SendOTPRequest): Promise<SendOTPResponse> {
        return this.post<SendOTPResponse>(API_ENDPOINTS.AUTH.SEND_OTP, data);
    }

    public async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
        return this.post<VerifyOTPResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
    }

    public async resendOTP(data: ResendOTPRequest): Promise<ResendOTPResponse> {
        return this.post<ResendOTPResponse>(API_ENDPOINTS.AUTH.RESEND_OTP, data);
    }

    public async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
        return this.post<ForgotPasswordResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    }

    public async get<T>(endpoint: string, params?: any): Promise<T> {
        return this.axiosInstance.get<any, T>(endpoint, { params });
    }

    public async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.axiosInstance.post<any, T>(endpoint, data);
    }

    public async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.axiosInstance.put<any, T>(endpoint, data);
    }

    public async delete<T>(endpoint: string): Promise<T> {
        return this.axiosInstance.delete<any, T>(endpoint);
    }

    public async patch<T>(endpoint: string, data?: any): Promise<T> {
        return this.axiosInstance.patch<any, T>(endpoint, data);
    }

    public async createCategory(data: CreateCategoryRequest): Promise<CreateCategoryResponse> {
        return this.post<CreateCategoryResponse>(API_ENDPOINTS.STATUS.CREATE, data);
    }

    public async updateCategory(id: string, data: UpdateCategoryRequest): Promise<UpdateCategoryResponse> {
        return this.put<UpdateCategoryResponse>(API_ENDPOINTS.STATUS.UPDATE(id), data);
    }

    public async deleteCategory(id: string): Promise<DeleteCategoryResponse> {
        return this.delete<DeleteCategoryResponse>(API_ENDPOINTS.STATUS.DELETE(id));
    }

    public async getCategories(): Promise<GetCategoriesResponse> {
        return this.get<GetCategoriesResponse>(API_ENDPOINTS.STATUS.LIST);
    }

    public async getCategoryById(id: string): Promise<GetCategoryByIdResponse> {
        return this.get<GetCategoryByIdResponse>(API_ENDPOINTS.STATUS.GET_BY_ID(id));
    }

    public async createAudioBook(data: CreateAudioBookRequest): Promise<CreateAudioBookResponse> {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('statusCategory', data.statusCategory);
        formData.append('description', data.description);
        formData.append('duration', data.duration.toString());
        formData.append('musicFile', data.musicFile);
        formData.append('isFree', data.isFree.toString());

        return this.axiosInstance.post<any, CreateAudioBookResponse>(
            API_ENDPOINTS.MUSIC.CREATE,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    }

    public async updateAudioBook(id: string, data: UpdateAudioBookRequest): Promise<UpdateAudioBookResponse> {
        const formData = new FormData();

        if (data.title !== undefined) formData.append('title', data.title);
        if (data.statusCategory !== undefined) formData.append('statusCategory', data.statusCategory);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.duration !== undefined) formData.append('duration', data.duration.toString());
        if (data.musicFile !== undefined) formData.append('musicFile', data.musicFile);
        if (data.isFree !== undefined) formData.append('isFree', data.isFree.toString());

        return this.axiosInstance.put<any, UpdateAudioBookResponse>(
            API_ENDPOINTS.MUSIC.UPDATE(id),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    }

    public async deleteAudioBook(id: string): Promise<DeleteAudioBookResponse> {
        return this.delete<DeleteAudioBookResponse>(API_ENDPOINTS.MUSIC.DELETE(id));
    }

    public async getAudioBooks(params?: AudioBookListParams): Promise<GetAudioBooksResponse> {
        return this.get<GetAudioBooksResponse>(API_ENDPOINTS.MUSIC.LIST, params);
    }

    public async getAudioBookById(id: string): Promise<GetAudioBookByIdResponse> {
        return this.get<GetAudioBookByIdResponse>(API_ENDPOINTS.MUSIC.GET_BY_ID(id));
    }

    public async createGift(data: CreateGiftRequest): Promise<CreateGiftResponse> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('productLink', data.productLink);
        formData.append('image', data.image);
        formData.append('category', data.category);

        return this.axiosInstance.post<any, CreateGiftResponse>(
            API_ENDPOINTS.GIFT.CREATE,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    }

    public async updateGift(id: string, data: UpdateGiftRequest): Promise<UpdateGiftResponse> {
        const formData = new FormData();

        if (data.name !== undefined) formData.append('name', data.name);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.productLink !== undefined) formData.append('productLink', data.productLink);
        if (data.category !== undefined) formData.append('category', data.category);
        if (data.image !== undefined) formData.append('image', data.image);

        return this.axiosInstance.put<any, UpdateGiftResponse>(
            API_ENDPOINTS.GIFT.UPDATE(id),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    }

    public async deleteGift(id: string): Promise<DeleteGiftResponse> {
        return this.delete<DeleteGiftResponse>(API_ENDPOINTS.GIFT.DELETE(id));
    }

    public async getGifts(params?: GiftListParams): Promise<GetGiftsResponse> {
        return this.get<GetGiftsResponse>(API_ENDPOINTS.GIFT.LIST, params);
    }

    public async getGiftById(id: string): Promise<GetGiftByIdResponse> {
        return this.get<GetGiftByIdResponse>(API_ENDPOINTS.GIFT.GET_BY_ID(id));
    }

    public async createGiftPackage(data: CreateGiftPackageRequest): Promise<CreateGiftPackageResponse> {
        return this.post<CreateGiftPackageResponse>(API_ENDPOINTS.GIFT_PACKAGE.CREATE, data);
    }

    public async updateGiftPackage(id: string, data: UpdateGiftPackageRequest): Promise<UpdateGiftPackageResponse> {
        return this.put<UpdateGiftPackageResponse>(API_ENDPOINTS.GIFT_PACKAGE.UPDATE(id), data);
    }

    public async deleteGiftPackage(id: string): Promise<DeleteGiftPackageResponse> {
        return this.delete<DeleteGiftPackageResponse>(API_ENDPOINTS.GIFT_PACKAGE.DELETE(id));
    }

    public async getGiftPackages(params?: GiftPackageListParams): Promise<GetGiftPackagesResponse> {
        return this.get<GetGiftPackagesResponse>(API_ENDPOINTS.GIFT_PACKAGE.LIST, params);
    }

    public async getDashboardStats(): Promise<GetDashboardStatsResponse> {
        return this.get<GetDashboardStatsResponse>(API_ENDPOINTS.DASHBOARD.STATS);
    }

    public async addDashboardVideo(data: AddDashboardVideoRequest): Promise<AddDashboardVideoResponse> {
        return this.post<AddDashboardVideoResponse>(API_ENDPOINTS.DASHBOARD.ADD_VIDEO, data);
    }

    public async getAdminProfile(): Promise<GetAdminProfileResponse> {
        return this.get<GetAdminProfileResponse>(API_ENDPOINTS.PROFILE.GET);
    }

    public async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('mobile', data.mobile);
        formData.append('countryCode', data.countryCode);

        if (data.avatar) {
            formData.append('avatar', data.avatar);
        }

        return this.axiosInstance.put<any, UpdateProfileResponse>(
            API_ENDPOINTS.PROFILE.UPDATE,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    }

    public async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
        return this.put<ChangePasswordResponse>(API_ENDPOINTS.PROFILE.CHANGE_PASSWORD, data);
    }

    public async getContacts(params?: ContactListParams): Promise<GetContactsResponse> {
        return this.get<GetContactsResponse>(API_ENDPOINTS.CONTACT.LIST, params);
    }

    public async resolveContact(id: string, data: ResolveContactRequest | FormData): Promise<ResolveContactResponse> {
        if (data instanceof FormData) {
            return this.axiosInstance.patch<any, ResolveContactResponse>(
                API_ENDPOINTS.CONTACT.UPDATE(id),
                data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
        }
        return this.patch<ResolveContactResponse>(API_ENDPOINTS.CONTACT.UPDATE(id), data);
    }

    public async createAudioPlayback(data: CreateAudioPlaybackRequest): Promise<CreateAudioPlaybackResponse> {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('duration', data.duration.toString());
        formData.append('status', data.status);
        formData.append('default', data.default.toString());
        formData.append('videoFile', data.audioFile);
        formData.append('thumbnail', data.thumbnail);

        return this.axiosInstance.post<any, CreateAudioPlaybackResponse>(
            API_ENDPOINTS.AUDIO_PLAYBACK.CREATE,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    }

    public async updateAudioPlayback(id: string, data: UpdateAudioPlaybackRequest): Promise<UpdateAudioPlaybackResponse> {
        const formData = new FormData();

        if (data.title !== undefined) formData.append('title', data.title);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.duration !== undefined) formData.append('duration', data.duration.toString());
        if (data.status !== undefined) formData.append('status', data.status);
        if (data.default !== undefined) formData.append('default', data.default.toString());
        if (data.audioFile !== undefined) formData.append('videoFile', data.audioFile);
        if (data.thumbnail !== undefined) formData.append('thumbnail', data.thumbnail);

        return this.axiosInstance.patch<any, UpdateAudioPlaybackResponse>(
            API_ENDPOINTS.AUDIO_PLAYBACK.UPDATE(id),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    }

    public async deleteAudioPlayback(id: string): Promise<DeleteAudioPlaybackResponse> {
        return this.delete<DeleteAudioPlaybackResponse>(API_ENDPOINTS.AUDIO_PLAYBACK.DELETE(id));
    }

    public async getAudioPlaybacks(): Promise<GetAudioPlaybacksResponse> {
        return this.get<GetAudioPlaybacksResponse>(API_ENDPOINTS.AUDIO_PLAYBACK.LIST);
    }

    public async getUsers(params?: UserListParams): Promise<GetUsersResponse> {
        return this.get<GetUsersResponse>(API_ENDPOINTS.USER.LIST, params);
    }

    public async createAdmin(data: CreateAdminRequest): Promise<CreateAdminResponse> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('mobile', data.mobile);
        formData.append('role', data.role);

        if (data.avatar) {
            formData.append('avatar', data.avatar);
        }

        return this.axiosInstance.post<any, CreateAdminResponse>(
            API_ENDPOINTS.ADMIN.CREATE,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    }

    public async updateAdmin(id: string, data: UpdateAdminRequest): Promise<UpdateAdminResponse> {
        const formData = new FormData();

        if (data.name !== undefined) formData.append('name', data.name);
        if (data.email !== undefined) formData.append('email', data.email);
        if (data.mobile !== undefined) formData.append('mobile', data.mobile);
        if (data.role !== undefined) formData.append('role', data.role);
        if (data.avatar !== undefined) formData.append('avatar', data.avatar);

        return this.axiosInstance.put<any, UpdateAdminResponse>(
            API_ENDPOINTS.ADMIN.UPDATE(id),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    }

    public async deleteAdmin(id: string): Promise<DeleteAdminResponse> {
        return this.delete<DeleteAdminResponse>(API_ENDPOINTS.ADMIN.DELETE(id));
    }

    public async getAdmins(params?: AdminListParams): Promise<GetAdminsResponse> {
        return this.get<GetAdminsResponse>(API_ENDPOINTS.ADMIN.LIST, params);
    }

    public async getAppVersion(): Promise<GetAppVersionResponse> {
        return this.get<GetAppVersionResponse>(API_ENDPOINTS.APP_VERSION.GET);
    }

    public async updateAppVersion(data: UpdateAppVersionRequest): Promise<UpdateAppVersionResponse> {
        return this.post<UpdateAppVersionResponse>(API_ENDPOINTS.APP_VERSION.UPDATE, data);
    }

    public async sendBroadcast(data: SendBroadcastRequest): Promise<SendBroadcastResponse> {
        return this.post<SendBroadcastResponse>(API_ENDPOINTS.NOTIFICATION.BROADCAST, data);
    }

    public async getBroadcastHistory(): Promise<GetBroadcastHistoryResponse> {
        return this.get<GetBroadcastHistoryResponse>(API_ENDPOINTS.NOTIFICATION.HISTORY);
    }

    public async updateUserStatus(id: string, status: string): Promise<UpdateUserStatusResponse> {
        return this.put<UpdateUserStatusResponse>(API_ENDPOINTS.USER.UPDATE_STATUS(id), { status });
    }

    public async getReportsByState(params: ReportsByStateParams): Promise<ReportsByStateResponse> {
        return this.get<ReportsByStateResponse>(API_ENDPOINTS.REPORTS.LIST_BY_STATE, params);
    }

    public async getReportCategoryDetail(categoryId: string, params: ReportCategoryDetailParams): Promise<GetReportCategoryDetailResponse> {
        return this.get<GetReportCategoryDetailResponse>(API_ENDPOINTS.REPORTS.CATEGORY_DETAIL(categoryId), params);
    }

    public async getBehaviourReport(): Promise<GetBehaviourReportResponse> {
        return this.get<GetBehaviourReportResponse>(API_ENDPOINTS.REPORTS.DASHBOARD, { type: 'behaviour' });
    }

    public async getPopularReport(): Promise<GetPopularReportResponse> {
        return this.get<GetPopularReportResponse>(API_ENDPOINTS.REPORTS.DASHBOARD, { type: 'popular' });
    }

    public async getStateReport(): Promise<GetStateReportResponse> {
        return this.get<GetStateReportResponse>(API_ENDPOINTS.REPORTS.DASHBOARD, { type: 'state' });
    }
}

export const apiService = new ApiService();