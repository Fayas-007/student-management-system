const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function api<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",

            ...(token
                ? {
                      Authorization: `Bearer ${token}`,
                  }
                : {}),

            ...options.headers,
        },
    });

    const text = await res.text();

    if (!res.ok) {
        let message = `Request failed (${res.status})`;

        if (text) {
            try {
                const data = JSON.parse(text);

                if (typeof data === "string") {
                    message = data;
                } else if (data.message) {
                    message = data.message;
                } else if (data.error) {
                    message = data.error;
                }
            } catch {
                message = text;
            }
        }

        throw new Error(message);
    }

    return (text ? JSON.parse(text) : null) as T;
}