export const API_CONFIG = {
  BASE_URL: 'https://nonb.naughtyornicebaubles.com.au/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/admin/auth/login',
    SEND_OTP: '/auth/resend-otp',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  STATUS: {
    CREATE: '/admin/status/create',
    UPDATE: (id: string) => `/admin/status/update/${id}`,
    DELETE: (id: string) => `/admin/status/${id}`,
    LIST: '/admin/status/list',
    GET_BY_ID: (id: string) => `/admin/status/${id}`,
  },
  MUSIC: {
    CREATE: '/admin/music/create',
    UPDATE: (id: string) => `/admin/music/update/${id}`,
    DELETE: (id: string) => `/admin/music/${id}`,
    LIST: '/admin/music/list',
    GET_BY_ID: (id: string) => `/admin/music/${id}`,
  },
  GIFT: {
    CREATE: '/admin/gift/create',
    UPDATE: (id: string) => `/admin/gift/update/${id}`,
    DELETE: (id: string) => `/admin/gift/delete/${id}`,
    LIST: '/admin/gift/list',
    GET_BY_ID: (id: string) => `/admin/gift/${id}`,
  },
  GIFT_PACKAGE: {
    CREATE: '/admin/gift/package/create',
    UPDATE: (id: string) => `/admin/gift/package/update/${id}`,
    DELETE: (id: string) => `/admin/gift/package/delete/${id}`,
    LIST: '/admin/gift/package/list',
  },
  DASHBOARD: {
    STATS: '/admin/dashboard-stats',
    ADD_VIDEO: '/admin/add-dashboard-link',
  },
  PROFILE: {
    GET: '/admin/profile',
    UPDATE: '/admin/update-profile',
    CHANGE_PASSWORD: '/admin/change-password',
  },
  CONTACT: {
    LIST: '/admin/contact-us/list',
    UPDATE: (id: string) => `/admin/contact-us/update/${id}`,
  },
  AUDIO_PLAYBACK: {
    CREATE: '/admin/audio-playback/add',
    UPDATE: (id: string) => `/admin/audio-playback/update/${id}`,
    DELETE: (id: string) => `/admin/audio-playback/delete/${id}`,
    LIST: '/admin/audio-playback/list',
  },
  USER: {
    LIST: '/admin/user/list',
    UPDATE_STATUS: (id: string) => `/admin/user/update-user-status/${id}`
  },
  ADMIN: {
    CREATE: '/admin/user/admin/add',
    LIST: '/admin/user/admin/list',
    UPDATE: (id: string) => `/admin/user/admin/edit/${id}`,
    DELETE: (id: string) => `/admin/user/admin/delete/${id}`,
  },
  APP_VERSION: {
    GET: '/admin/app-version',
    UPDATE: '/admin/app-version-update',
  },
  NOTIFICATION: {
    BROADCAST: '/admin/broadcast/send',
    HISTORY: '/admin/broadcast/history',
  },
};