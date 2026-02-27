interface TokenClient {
  requestAccessToken(overrides?: { prompt?: string }): void
  callback: (response: TokenResponse) => void
}

interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
  error?: string
}

interface Google {
  accounts: {
    oauth2: {
      initTokenClient(config: {
        client_id: string
        scope: string
        callback: (response: TokenResponse) => void
        error_callback?: (error: { type: string; message: string }) => void
      }): TokenClient
      revoke(token: string, callback?: () => void): void
    }
  }
}

declare const google: Google
