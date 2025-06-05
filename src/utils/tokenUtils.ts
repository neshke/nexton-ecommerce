/**
 * Dekodira JWT token.
 * @param token JWT token za dekodiranje.
 * @returns Dekodirani token ili null ako dođe do greške.
 */
interface DecodedToken {
  exp: number;
  iat: number;
  user: {
    id: number;
    email: string;
  };
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64));
    return payload;
  } catch (error) {
    return null;
  }
};

/**
 * Proverava da li je JWT token istekao.
 * @param token JWT token za proveru.
 * @returns True ako je token istekao, inače false.
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};
