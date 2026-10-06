const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const text = await res.text(); // DELETE may return an empty body
  return (text ? JSON.parse(text) : null) as T;
}