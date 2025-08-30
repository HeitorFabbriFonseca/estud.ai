/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '@react-oauth/google' {
  export interface GoogleLoginResponse {
    credential: string;
  }
} 