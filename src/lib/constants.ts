export const BACKEND_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://qc-backend.mach33.club';

export const CALLS = ['CANFINHOME_FY2026_Q3', 'TCS_FY2026_Q3'];
