export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://api-dev.quantcase.ai');

export const CALLS = ['CANFINHOME_FY2026_Q3', 'TCS_FY2026_Q3'];

export const GOOGLE_CLIENT_ID = '86776906960-kslmbvml7jvs9kkdq56ifarj3m0m7hbr.apps.googleusercontent.com';

export const INTERCOM_APP_ID = 'cllmzzkg';

export const CLARITY_PROJECT_ID = 'xmewh5ihzq';

export const GTM_CONTAINER_ID = 'GTM-MWXXCQ6K';

export const GSC_VERIFICATION = 'Y85Cc1LHRJ0dSXYNth-u2e6Sawc0a6S-hbv86XwXb-s';
