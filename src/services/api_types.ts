export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        _id: string;
        name: string;
        email: string;
        role: string;
        token: string;
    };
}

export interface ApiError {
    success: false;
    message: string;
    error?: string;
}

export interface SendOTPRequest {
    email: string;
}

export interface SendOTPResponse {
    success: boolean;
    message: string;
}

export interface VerifyOTPRequest {
    email: string;
    otp: string;
}

export interface VerifyOTPResponse {
    success: boolean;
    message: string;
}

export interface ResendOTPRequest {
    email: string;
}

export interface ResendOTPResponse {
    success: boolean;
    message: string;
}

export interface ForgotPasswordRequest {
    email: string;
    password: string;
    confirmPassword: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
    message: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export interface Admin {
    _id: string;
    name: string;
    email: string;
    mobile: string;
    avatar: string;
    role: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    password?: string;
    __v?: number;
}

export interface CreateAdminRequest {
    name: string;
    email: string;
    mobile: string;
    role: string;
    avatar?: File;
}

export interface UpdateAdminRequest {
    name?: string;
    email?: string;
    mobile?: string;
    role?: string;
    avatar?: File;
}

export interface CreateAdminResponse {
    success: boolean;
    message: string;
    data: Admin;
}

export interface UpdateAdminResponse {
    success: boolean;
    message: string;
    data: Admin;
}

export interface DeleteAdminResponse {
    success: boolean;
    message: string;
    data: Admin;
}

export interface AdminListParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface GetAdminsResponse {
    success: boolean;
    message: string;
    data: {
        admins: Admin[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export interface Category {
    _id: string;
    name: string;
    color: string;
    description: string;
    visibilityRank: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface CreateCategoryRequest {
    name: string;
    description: string;
    color: string;
    visibilityRank: number;
}

export interface UpdateCategoryRequest {
    name: string;
    description: string;
    color: string;
    visibilityRank: number;
}

export interface CreateCategoryResponse {
    success: boolean;
    message: string;
    data: Category;
}

export interface UpdateCategoryResponse {
    success: boolean;
    message: string;
    data: Category;
}

export interface DeleteCategoryResponse {
    success: boolean;
    message: string;
    data: null;
}

export interface GetCategoriesResponse {
    success: boolean;
    message: string;
    data: Category[];
}

export interface GetCategoryByIdResponse {
    success: boolean;
    message: string;
    data: Category;
}

export interface AudioBook {
    _id: string;
    statusCategory: {
        _id?: string;
        name: string;
        color: string;
        description: string;
    };
    title: string;
    description: string;
    duration: number;
    musicFile: string;
    isFree: boolean;
    index?: number | string;
    createdAt: string;
    updatedAt?: string;
    __v?: number;
}

export interface CreateAudioBookRequest {
    title: string;
    statusCategory: string;
    description: string;
    duration: number;
    musicFile: File;
    isFree: boolean;
    index?: number | string;
}

export interface UpdateAudioBookRequest {
    title?: string;
    statusCategory?: string;
    description?: string;
    duration?: number;
    musicFile?: File;
    isFree?: boolean;
    index?: number | string;
}

export interface CreateAudioBookResponse {
    success: boolean;
    message: string;
    data: AudioBook;
}

export interface UpdateAudioBookResponse {
    success: boolean;
    message: string;
    data: AudioBook;
}

export interface DeleteAudioBookResponse {
    success: boolean;
    message: string;
    data: null;
}

export interface GetAudioBooksResponse {
    success: boolean;
    message: string;
    data: {
        music: AudioBook[];
        pagination?: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export interface GetAudioBookByIdResponse {
    success: boolean;
    message: string;
    data: AudioBook;
}

export interface AudioBookListParams {
    search?: string;
    page?: number;
    limit?: number;
    statusCategoryId?: string;
}

export interface Gift {
    _id: string;
    name: string;
    description: string;
    productLink: string;
    image: string;
    category?: {
        _id: string;
        name: string;
        color?: string;
        description: string;
        packageType: string;
        startDate: string;
        endDate: string;
        minAge: number;
        maxAge: number;
        isWeekendOnly: boolean;
        priority: number;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        __v?: number;
    };
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface CreateGiftRequest {
    name: string;
    description: string;
    productLink: string;
    image: File;
    category: string;
}

export interface UpdateGiftRequest {
    name?: string;
    description?: string;
    productLink?: string;
    image?: File;
    category?: string;
}

export interface CreateGiftResponse {
    success: boolean;
    message: string;
    data: Gift;
}

export interface UpdateGiftResponse {
    success: boolean;
    message: string;
    data: Gift;
}

export interface DeleteGiftResponse {
    success: boolean;
    message: string;
    data: null;
}

export interface GetGiftsResponse {
    success: boolean;
    message: string;
    data: {
        page: number;
        limit: number;
        total: number;
        data: Gift[];
    };
}

export interface GetGiftByIdResponse {
    success: boolean;
    message: string;
    data: Gift;
}

export interface GiftListParams {
    page?: number;
    limit?: number;
}

export interface GiftPackage {
    _id: string;
    name: string;
    description: string;
    packageType: string;
    startDate: string;
    endDate: string;
    minAge?: number;
    maxAge?: number;
    isTargetedAgeOnly: boolean;
    isExclusiveFirstAppOpen: boolean;
    isWeekendOnly: boolean;
    isHoliday: boolean;
    isBasic: boolean;
    priority: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface CreateGiftPackageRequest {
    name: string;
    description: string;
    packageType: string;
    startDate: string;
    endDate: string;
    minAge?: number;
    maxAge?: number;
    isTargetedAgeOnly: boolean;
    isExclusiveFirstAppOpen: boolean;
    isWeekendOnly: boolean;
    isHoliday: boolean;
    isBasic: boolean;
    priority: number;
    isActive: boolean;
}

export interface UpdateGiftPackageRequest {
    name?: string;
    description?: string;
    packageType?: string;
    startDate?: string;
    endDate?: string;
    minAge?: number;
    maxAge?: number;
    isTargetedAgeOnly?: boolean;
    isExclusiveFirstAppOpen?: boolean;
    isWeekendOnly?: boolean;
    isHoliday?: boolean;
    isBasic?: boolean;
    priority?: number;
    isActive?: boolean;
}

export interface CreateGiftPackageResponse {
    success: boolean;
    message: string;
    data: GiftPackage;
}

export interface UpdateGiftPackageResponse {
    success: boolean;
    message: string;
    data: GiftPackage;
}

export interface DeleteGiftPackageResponse {
    success: boolean;
    message: string;
    data: null;
}

export interface GetGiftPackagesResponse {
    success: boolean;
    message: string;
    data: {
        data: GiftPackage[];
        total: number;
        page: number;
        limit: number;
    };
}

export interface GiftPackageListParams {
    page?: number;
    limit?: number;
}

export interface DashboardStats {
    userCount: number;
    childrenCount: number;
    maleChildren: number;
    femaleChildren: number;
    otherChildren: number
    giftCount: number;
    musicCount: number;
    dashboardVideo?: {
        _id: string;
        videoFile: string;
    };
    stateCounts: {
        [key: string]: number;
    };
}

export interface GetDashboardStatsResponse {
    success: boolean;
    message: string;
    data: DashboardStats;
}

export interface AddDashboardVideoRequest {
    videoFile: string;
}

export interface AddDashboardVideoResponse {
    success: boolean;
    message: string;
    data: {
        _id: string;
        videoFile: string;
    };
}

export interface AdminProfile {
    avatar: string | null;
    _id: string;
    name: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    __v?: number;
    mobile?: string;
    countryCode?: string;
}

export interface GetAdminProfileResponse {
    success: boolean;
    message: string;
    data: AdminProfile;
}

export interface UpdateProfileRequest {
    name: string;
    email: string;
    mobile: string;
    countryCode: string;
    avatar?: File | null;
}

export interface UpdateProfileResponse {
    success: boolean;
    message: string;
    data: AdminProfile;
}

export interface ChangePasswordRequest {
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordResponse {
    success: boolean;
    message: string;
    data: {
        _id: string;
        name: string;
        email: string;
        message: string;
    };
}

export type ContactType = 'App Question' | 'Bauble Question' | 'Support' | 'Other';

export interface Contact {
    _id: string;
    name: string;
    email: string;
    message: string;
    mobile?: string;
    countryCode?: string;
    type?: ContactType;
    isResolved: boolean;
    solution?: string;
    solutionImages?: string[];
    images?: string[];
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface ContactListParams {
    page?: number;
    limit?: number;
    isResolved?: boolean;
    type?: ContactType;
}

export interface GetContactsResponse {
    success: boolean;
    message: string;
    data: {
        contacts: Contact[];
        resolvedCount: number;
        unresolvedCount: number;
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export interface ResolveContactRequest {
    solution: string;
}

export interface ResolveContactResponse {
    success: boolean;
    message: string;
    data: Contact;
}

export interface AudioPlayback {
    _id: string;
    title: string;
    description: string;
    duration: number;
    videoFile: string;
    thumbnail: string;
    default: boolean;
    status: string;
    isDashboard: boolean;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface CreateAudioPlaybackRequest {
    title: string;
    description: string;
    duration: number;
    status: string;
    default: boolean;
    audioFile: File;
    thumbnail: File;
}

export interface UpdateAudioPlaybackRequest {
    title?: string;
    description?: string;
    duration?: number;
    status?: string;
    default?: boolean;
    audioFile?: File;
    thumbnail?: File;
}

export interface CreateAudioPlaybackResponse {
    success: boolean;
    message: string;
    data: AudioPlayback;
}

export interface UpdateAudioPlaybackResponse {
    success: boolean;
    message: string;
    data: AudioPlayback;
}

export interface DeleteAudioPlaybackResponse {
    success: boolean;
    message: string;
    data: null;
}

export interface GetAudioPlaybacksResponse {
    success: boolean;
    message: string;
    data: AudioPlayback[];
}

export interface Child {
    _id: string;
    parentId: string;
    firstName: string;
    age?: number;
    dob?: string;
    state: string;
    gender: string;
    avatar?: string | null;
    createdAt: string;
    updatedAt: string;
    lastMessage?: {
        _id: string;
        createdAt: string;
        statusCategory: {
            _id: string;
            name: string;
            color: string;
        };
    };
}

export interface UserData {
    _id: string;
    name: string;
    email: string;
    isEmailVerified: boolean;
    createdAt: string;
    avatar: string | null;
    mobile: string;
    status?: string;
    childrens: Child[];
    childrenCount: number;
}

export interface UserListParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}

export interface UpdateUserStatusRequest {
    status: string;
}

export interface UpdateUserStatusResponse {
    success: boolean;
    message: string;
    data: {
        success: boolean;
        message: string;
        data: {
            userId: string;
            status: string;
        };
    };
}

export interface GetUsersResponse {
    success: boolean;
    message: string;
    data: {
        users: UserData[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export interface AppVersion {
    _id: string;
    androidVersion: string;
    iosVersion: string;
    isForceUpdate: boolean;
    releaseDate: string;
    createdAt: string;
    updatedAt: string;
    remarks?: string;
    notes?: string;
    __v?: number;
}

export interface UpdateAppVersionRequest {
    androidVersion: string;
    iosVersion: string;
    notes: string;
}

export interface UpdateAppVersionResponse {
    success: boolean;
    message: string;
}

export interface GetAppVersionResponse {
    success: boolean;
    message: string;
    data: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        data: AppVersion[];
    };
}

export interface SendBroadcastRequest {
    title: string;
    body: string;
    type: string;
}

export interface SendBroadcastResponse {
    success: boolean;
    message: string;
    data: {
        success: boolean;
        message: string;
        users: number;
    };
}

export interface BroadcastHistory {
    _id: string;
    activeUserCount: number;
    title: string | null;
    body: string | null;
    type: string | null;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface GetBroadcastHistoryResponse {
    success: boolean;
    message: string;
    data: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        data: BroadcastHistory[];
    };
}

export interface ReportsByStateParams {
    state: string;
}

export interface ReportsByStateResponse {
    success: boolean;
    message: string;
    data: Array<{
        state: string;
        categories: {
            [categoryName: string]: number;
        };
    }>;
}

export interface ReportCategoryDetailParams {
    page?: number;
    limit?: number;
    search?: string;
    state?: string;
    fromDate?: string;
    toDate?: string;
}

export interface ReportChildData {
    _id: string;
    createdAt: string;
    updatedAt: string;
    statusCategory: {
        _id: string;
        name: string;
        color: string;
        description: string;
    };
    children: {
        _id: string;
        parentId: string;
        avatar?: string;
        firstName: string;
        dob: string;
        state: string;
        gender: string;
        createdAt: string;
        updatedAt: string;
    };
    parent: {
        email: string;
        name: string;
    };
}

export interface GetReportCategoryDetailResponse {
    success: boolean;
    message: string;
    data: {
        data: ReportChildData[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export interface ReportDashboardParams {
    type: 'behaviour' | 'popular' | 'state';
}

export interface BehaviourReportData {
    totalChildren: number;
    totalNice: number;
    totalNaughty: number;
    data: {
        topNice: Array<{
            firstName: string;
            count: number;
            childId: string;
            statusCategoryId: string;
        }>;
        topNaughty: Array<{
            firstName: string;
            count: number;
            childId: string;
            statusCategoryId: string;
        }>;
    };
}

export interface PopularReportData {
    totalChildren: number;
    totalNice: number;
    totalNaughty: number;
    data: {
        top20BoysName: Array<{
            count: number;
            firstName: string;
        }>;
        top20GirlsName: Array<{
            count: number;
            firstName: string;
        }>;
    };
}

export interface StateReportData {
    totalChildren: number;
    totalNice: number;
    totalNaughty: number;
    data: Array<{
        nice: number;
        naughty: number;
        state: string;
    }>;
}

export interface GetBehaviourReportResponse {
    success: boolean;
    message: string;
    data: BehaviourReportData;
}

export interface GetPopularReportResponse {
    success: boolean;
    message: string;
    data: PopularReportData;
}

export interface GetStateReportResponse {
    success: boolean;
    message: string;
    data: StateReportData;
}