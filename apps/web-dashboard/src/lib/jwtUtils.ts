// lib/jwtUtils.ts
export interface InvitePayload {
    email: string;
    role: string;
    exp: number;
    iat: number;
  }
  
  /**
   * Decodifica il payload di un JWT (solo client-side!).
   * Non verifica la firma, serve solo per leggere i campi.
   */
  export function decodeJwtPayload<T = any>(token: string): T {
    try {
      const parts = token.split(".");
      if (parts.length < 2) throw new Error("Token JWT non valido");
  
      // base64url -> base64
      const base64 = parts[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");
  
      // decodifica in stringa JSON
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
  
      return JSON.parse(jsonPayload);
    } catch (err) {
      throw new Error("Impossibile decodificare JWT payload");
    }
  }
  