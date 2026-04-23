import { NativeModules } from 'react-native';

// Expo uses process.env.EXPO_PUBLIC_* for env vars (no extra package needed)
const RAW_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const getMetroHost = (): string | null => {
  // In dev, RN exposes the packager URL here, e.g. http://192.168.8.155:8081/index.bundle?...
  const scriptURL: unknown = (NativeModules as any)?.SourceCode?.scriptURL;
  if (typeof scriptURL !== 'string') return null;

  const match = scriptURL.match(/^https?:\/\/([^/:]+)(?::\d+)?\//);
  return match?.[1] ?? null;
};

const isIPv4 = (host: string): boolean => /^\d{1,3}(\.\d{1,3}){3}$/.test(host);

const resolveBaseUrl = (url: string): string => {
  // If you already set a LAN URL in .env, keep it as-is.
  // If it's "localhost", make it work on physical devices by swapping in the Metro host.
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';
    if (!isLocalhost) return url;

    if (!__DEV__) return url;

    const metroHost = getMetroHost();
    if (!metroHost || !isIPv4(metroHost)) return url;

    parsed.hostname = metroHost;

    // Keep the port/path from the env var (typically :3000/api/v1)
    return parsed.toString().replace(/\/$/, '');
  } catch {
    // Fallback for environments without URL (rare in modern Expo).
    if (!__DEV__) return url;
    if (!/^(https?:\/\/)(localhost|127\.0\.0\.1)([:/]|$)/.test(url)) return url;
    const metroHost = getMetroHost();
    if (!metroHost) return url;
    return url.replace(/^(https?:\/\/)(localhost|127\.0\.0\.1)/, `$1${metroHost}`);
  }
};

const BASE_URL = resolveBaseUrl(RAW_BASE_URL);
console.log('Using API base URL:', BASE_URL);

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

const request = async <T>(path: string, opts: RequestInit = {}): Promise<ApiResponse<T>> => {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...opts.headers },
    });

    const text = await res.text();
    let json: any = null;
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        // Non-JSON response (e.g. proxy/HTML/error page)
      }
    }

    if (!res.ok) {
      return {
        success: false,
        message: json?.message ?? `HTTP ${res.status}`,
        data: json?.data,
      };
    }

    return (json ?? { success: true }) as ApiResponse<T>;
  } catch (err: any) {
    const msg = typeof err?.message === 'string' ? err.message : 'Please check your connection.';
    return { success: false, message: `Network error: ${msg}` };
  }
};

// ── OTP ───────────────────────────────────────────────────────────────────────

export const sendOtp = (countryCode: string, number: number) =>
  request<void>('/otp/send', { method: 'POST', body: JSON.stringify({ countryCode, number }) });

export const verifyOtp = (countryCode: string, number: number, otp: number) =>
  request<{ verified: boolean }>('/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ countryCode, number, otp }),
  });

export const resendOtp = (countryCode: string, number: number) =>
  request<void>('/otp/resend', { method: 'POST', body: JSON.stringify({ countryCode, number }) });

// ── Leads ─────────────────────────────────────────────────────────────────────

export const createQuickLead = (data: Record<string, any>) =>
  request<{ leadId: string; workflowId: string | null }>('/leads/quick', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const saveBasicInfo = (leadId: string, data: Record<string, any>) =>
  request<void>(`/leads/${leadId}/basic-info`, { method: 'PUT', body: JSON.stringify(data) });

export const savePropertyInfo = (leadId: string, data: Record<string, any>) =>
  request<void>(`/leads/${leadId}/property-info`, { method: 'PUT', body: JSON.stringify(data) });

export const saveIncomeInfo = (leadId: string, data: Record<string, any>) =>
  request<void>(`/leads/${leadId}/income-info`, { method: 'PUT', body: JSON.stringify(data) });

export const saveReferences = (leadId: string, references: any[]) =>
  request<void>(`/leads/${leadId}/references`, {
    method: 'PUT',
    body: JSON.stringify({ references }),
  });

export const submitLead = (leadId: string) =>
  request<{ status: string }>(`/leads/${leadId}/submit`, { method: 'POST' });

// ── Masters ───────────────────────────────────────────────────────────────────

export const fetchMasters = () =>
  request<Record<string, { label: string; value: string }[]>>('/masters');
