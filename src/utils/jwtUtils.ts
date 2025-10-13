export function parseJwt<T>(token: string): T | null {
  try {
    const base64Url = token.split('.')[1]; // payload 부분
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(JSON.parse(jsonPayload)['sub']) as T;
  } catch (e) {
    console.error('토큰 파싱 실패:', e);
    return null;
  }
}
