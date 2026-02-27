import { useAuthStore } from '@/stores/auth-store'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ')

let tokenClient: TokenClient | null = null

export function initAuth(): void {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) {
    console.error('Missing VITE_GOOGLE_CLIENT_ID')
    return
  }

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: handleTokenResponse,
    error_callback: (error) => {
      console.error('Auth error:', error)
      useAuthStore.getState().setAuthReady(true)
    },
  })
}

function handleTokenResponse(response: TokenResponse): void {
  if (response.error) {
    console.error('Token error:', response.error)
    useAuthStore.getState().setAuthReady(true)
    return
  }
  const { setAuth } = useAuthStore.getState()
  setAuth(response.access_token, response.expires_in)
  fetchUserInfo(response.access_token)
}

async function fetchUserInfo(token: string): Promise<void> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.ok) {
    const data = await res.json()
    useAuthStore.getState().setUser({
      email: data.email,
      name: data.name,
      picture: data.picture,
    })
  }
}

export function requestLogin(): void {
  if (!tokenClient) initAuth()
  tokenClient?.requestAccessToken({ prompt: 'consent' })
}

export function requestSilentLogin(): void {
  if (!tokenClient) initAuth()
  tokenClient?.requestAccessToken({ prompt: '' })
}

export function logout(): void {
  const { accessToken, logout: clearAuth } = useAuthStore.getState()
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken)
  }
  clearAuth()
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const { accessToken, isAuthenticated } = useAuthStore.getState()
  if (!isAuthenticated()) {
    throw new Error('Not authenticated')
  }
  return { Authorization: `Bearer ${accessToken}` }
}
