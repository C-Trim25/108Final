import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const protectedRoutes = ['/play', '/games', '/game', '/leaderboard'];  // Paths to protect
export const authRoutes = ["/"];  // Paths that redirect to games if authenticated

export async function middleware(req) {
  const sessionTokenCookie = cookies(req).get('sessionToken');
  const sessionToken = sessionTokenCookie ? sessionTokenCookie.value : null;
  const usernameCookie = cookies(req).get('username');
  const username = usernameCookie ? usernameCookie.value : null;
  let isValid = false;

  if (username && sessionToken) {
    const validateSessionUrl = 'http://localhost:3000/api/validateSession';
    try {
      const validationResponse = await fetch(validateSessionUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, sessionToken })
      });

      if (validationResponse.ok) {
        const data = await validationResponse.json();
        isValid = data.valid;
      }
    } catch (error) {
      console.error('Error validating session:', error);
    }
  }

  // Check if the current path starts with any of the protected routes
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

  if (isProtectedRoute && !isValid) {
    // Redirect to the login page if the session is not valid
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.delete("sessionToken");
    return response;
  }

  if (authRoutes.includes(path) && isValid) {
    return NextResponse.redirect(new URL("/games", req.url));
  }

  return NextResponse.next();
}