import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  nameid?: string;
  email?: string;
  role?: string;
  exp?: number;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
  [key: string]: string | number | undefined;
}

export function getUserIdFromToken(token: string): string | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return (
      decoded.nameid ||
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      null
    );
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
}
