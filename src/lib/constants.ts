export const BACKEND_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://api-dev.quantcase.ai';

export const CALLS = ['CANFINHOME_FY2026_Q3', 'TCS_FY2026_Q3'];

export const GOOGLE_CLIENT_ID = '86776906960-kslmbvml7jvs9kkdq56ifarj3m0m7hbr.apps.googleusercontent.com';
