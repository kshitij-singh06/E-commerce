export const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function authHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export function authJsonHeaders() {
    return {
        "Content-Type": "application/json",
        ...authHeaders(),
    };
}

// Resolve image URL: full URLs (Cloudinary) pass through, relative paths get API prefix
export function imageUrl(url) {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API}${url}`;
}
