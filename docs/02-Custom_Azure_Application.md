# Custom Azure Application

This document covers how to set up and use a custom Azure Active Directory application for Xbox Network authentication, providing OAuth 2.0 support and better control over the authentication flow.

> [!IMPORTANT]
> This authentication process is technically reserved for approved Microsoft partners, as it may compromise user privacy. Please use it with caution and ensure you comply with Microsoft's terms of service and applicable privacy regulations.

## Why Use a Custom Azure Application?

Custom Azure Applications provide several benefits:

-   **OAuth 2.0 Support**: Proper OAuth 2.0 flow instead of direct credential handling
-   **Refresh Tokens**: Long-lived tokens for re-authentication without storing passwords
-   **Better Security**: Eliminates the need to store user passwords
-   **2FA Compatibility**: Works with accounts that have Two-Factor Authentication enabled
-   **Compliance**: Better alignment with modern authentication standards

## Azure Application Setup

### Step 1: Register Your Application

1. Go to the [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Configure your application:
    - **Name**: Choose a descriptive name for your application
    - **Supported account types**: Select **"Personal Microsoft accounts only"**
    - **Redirect URI**: Add your redirect URI (see below)

### Step 2: Configure Redirect URI

Add a Redirect URI of type **"Web"**:

-   **For web applications**: Use your HTTPS callback URL (e.g., `https://yourdomain.com/auth/callback`)
-   **For desktop/Electron applications**: Use `https://login.live.com/oauth20_desktop.srf`
-   **For development**: You can use `http://localhost:3000/callback` (HTTP allowed for localhost)

### Step 3: Note Your Application Details

After registration, note down:

-   **Application (client) ID**: You'll need this for authentication
-   **Client Secret**: Generate one in **Certificates & secrets** (optional, but recommended for server-side apps)

## Authentication Flow

### Step 1: Generate Authorization URL

Generate the URL where users will authenticate:

```typescript
import { live } from '@xboxreplay/xboxlive-auth';

const authorizeUrl = live.getAuthorizeUrl({
	clientId: 'YOUR_CLIENT_ID',
	scope: 'XboxLive.signin XboxLive.offline_access',
	responseType: 'code',
	redirectUri: 'YOUR_REDIRECT_URI',
});

console.log('Direct user to:', authorizeUrl);
```

### Step 2: Handle Authorization Response

After the user completes authentication, they'll be redirected to your `redirectUri` with an authorization code:

```
https://yourdomain.com/callback?code=AUTHORIZATION_CODE&state=...
```

### Step 3: Exchange Code for Tokens

Exchange the authorization code for access and refresh tokens:

```typescript
import { live, xnet } from '@xboxreplay/xboxlive-auth';

const code = 'AUTHORIZATION_CODE_FROM_CALLBACK';

// Exchange code for tokens
const tokenResponse = await live.exchangeCodeForAccessToken(code);

console.log('Token Response:', tokenResponse);
```

**Token Response:**

```json
{
	"token_type": "bearer",
	"expires_in": 3600,
	"access_token": "EwAIA+pvBAAUK...",
	"refresh_token": "M.R3_BAY...",
	"scope": "service::user.auth.xboxlive.com::MBI_SSL XboxLive.signin XboxLive.offline_access",
	"user_id": "123abc..."
}
```

### Step 4: Get Xbox Network Tokens

Convert the access token to Xbox Network tokens:

```typescript
// Get user token (note the 'd' parameter for custom Azure applications)
const userTokenResponse = await xnet.exchangeRpsTicketForUserToken(
	tokenResponse.access_token,
	'd' // Required for custom Azure applications
);

// Get XSTS token
const XSTSTokenResponse = await xnet.exchangeTokenForXSTSToken(userTokenResponse.Token, {
	XSTSRelyingParty: 'http://xboxlive.com',
});

console.log('Xbox Network Authentication Complete:', XSTSTokenResponse);
```

## Complete Implementation Example

Here's a complete server-side implementation using Express.js:

```typescript
import express from 'express';
import { live, xnet } from '@xboxreplay/xboxlive-auth';

const app = express();
const CLIENT_ID = 'YOUR_CLIENT_ID';
const REDIRECT_URI = 'http://localhost:3000/auth/callback';

// Step 1: Initiate authentication
app.get('/auth/login', (req, res) => {
	const authorizeUrl = live.getAuthorizeUrl({
		clientId: CLIENT_ID,
		scope: 'XboxLive.signin XboxLive.offline_access',
		responseType: 'code',
		redirectUri: REDIRECT_URI,
	});

	res.redirect(authorizeUrl);
});

// Step 2: Handle callback
app.get('/auth/callback', async (req, res) => {
	try {
		const { code } = req.query;

		if (!code) {
			return res.status(400).send('Authorization code not provided');
		}

		// Exchange code for tokens
		const tokenResponse = await live.exchangeCodeForAccessToken(code);

		// Get Xbox Network tokens
		const userTokenResponse = await xnet.exchangeRpsTicketForUserToken(tokenResponse.access_token, 'd');

		const XSTSTokenResponse = await xnet.exchangeTokenForXSTSToken(userTokenResponse.Token, {
			XSTSRelyingParty: 'http://xboxlive.com',
		});

		// Store tokens securely (implement your own storage logic)
		const userSession = {
			xuid: XSTSTokenResponse.DisplayClaims.xui[0]?.xid,
			user_hash: XSTSTokenResponse.DisplayClaims.xui[0]?.uhs,
			xsts_token: XSTSTokenResponse.Token,
			refresh_token: tokenResponse.refresh_token,
			expires_on: XSTSTokenResponse.NotAfter,
		};

		// In a real app, store this in session/database
		req.session.xbox = userSession;

		res.json({ success: true, user: userSession });
	} catch (error) {
		console.error('Authentication error:', error);
		res.status(500).json({ error: 'Authentication failed' });
	}
});

app.listen(3000, () => {
	console.log('Server running on http://localhost:3000');
	console.log('Visit http://localhost:3000/auth/login to start authentication');
});
```

## Token Refresh Implementation

Implement automatic token refresh for long-running applications:

```typescript
class XboxAuthManager {
	private refreshToken: string;
	private xstsToken: string;
	private expiresOn: string;

	constructor(initialTokens: any) {
		this.refreshToken = initialTokens.refresh_token;
		this.xstsToken = initialTokens.xsts_token;
		this.expiresOn = initialTokens.expires_on;
	}

	async getValidToken(): Promise<string> {
		// Check if current token is still valid
		const isExpired = new Date() >= new Date(this.expiresOn);

		if (!isExpired) {
			return this.xstsToken;
		}

		// Token expired, refresh it
		console.log('Token expired, refreshing...');
		await this.refreshTokens();
		return this.xstsToken;
	}

	private async refreshTokens(): Promise<void> {
		try {
			// Refresh the access token
			const refreshResponse = await live.refreshAccessToken(this.refreshToken);

			// Get new Xbox Network tokens
			const userTokenResponse = await xnet.exchangeRpsTicketForUserToken(refreshResponse.access_token, 'd');

			const XSTSResponse = await xnet.exchangeTokenForXSTSToken(userTokenResponse.Token, {
				XSTSRelyingParty: 'http://xboxlive.com',
			});

			// Update stored tokens
			this.refreshToken = refreshResponse.refresh_token || this.refreshToken;
			this.xstsToken = XSTSResponse.Token;
			this.expiresOn = XSTSResponse.NotAfter;

			console.log('Tokens refreshed successfully');
		} catch (error) {
			console.error('Token refresh failed:', error);
			throw new Error('Failed to refresh authentication tokens');
		}
	}
}

// Usage
const authManager = new XboxAuthManager(initialTokens);

// Always get a valid token
const validToken = await authManager.getValidToken();
```

## Advanced Configuration Options

### Custom Scopes

Different scopes provide access to different Xbox Network services:

```typescript
const authorizeUrl = live.getAuthorizeUrl({
	clientId: 'YOUR_CLIENT_ID',
	scope: 'XboxLive.signin XboxLive.offline_access', // Multiple scopes
	responseType: 'code',
	redirectUri: 'YOUR_REDIRECT_URI',
});
```

### State Parameter for Security

Use the state parameter to prevent CSRF attacks:

```typescript
const state = crypto.randomBytes(16).toString('hex');

const authorizeUrl = live.getAuthorizeUrl({
	clientId: 'YOUR_CLIENT_ID',
	scope: 'XboxLive.signin XboxLive.offline_access',
	responseType: 'code',
	redirectUri: 'YOUR_REDIRECT_URI',
	state,
});

// Store state in session to verify later
req.session.oauthState = state;
```

Verify state in callback:

```typescript
app.get('/auth/callback', (req, res) => {
	const { code, state } = req.query;

	if (state !== req.session.oauthState) {
		return res.status(400).send('Invalid state parameter');
	}

	// Continue with token exchange...
});
```

## Security Best Practices

### 1. Secure Token Storage

Never store tokens in plain text:

```typescript
import crypto from 'crypto';

class SecureTokenStorage {
	private encryptionKey: string;

	constructor(key: string) {
		this.encryptionKey = key;
	}

	encrypt(text: string): string {
		const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
		let encrypted = cipher.update(text, 'utf8', 'hex');
		encrypted += cipher.final('hex');
		return encrypted;
	}

	decrypt(encryptedText: string): string {
		const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
		let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted;
	}

	storeTokens(tokens: any): void {
		const encryptedTokens = this.encrypt(JSON.stringify(tokens));
		// Store encryptedTokens in your database/file system
	}
}
```

### 2. HTTPS Only

Always use HTTPS for redirect URIs in production:

```typescript
// ✅ Production
const REDIRECT_URI = 'https://yourdomain.com/auth/callback';

// ❌ Development only
const REDIRECT_URI = 'http://localhost:3000/auth/callback';
```

### 3. Token Validation

Validate tokens before use:

```typescript
function isTokenValid(token: any): boolean {
	if (!token || !token.xsts_token || !token.expires_on) {
		return false;
	}

	const expirationDate = new Date(token.expires_on);
	const now = new Date();

	// Check if token expires within the next 5 minutes
	const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
	return now.getTime() + bufferTime < expirationDate.getTime();
}
```

## Troubleshooting

### Common Issues

**Issue**: "Invalid client" error
**Solution**: Verify your CLIENT_ID is correct and the application is properly registered.

**Issue**: "Redirect URI mismatch" error
**Solution**: Ensure the redirect URI in your code exactly matches the one registered in Azure.

**Issue**: "Scope not supported" error
**Solution**: Verify you're using supported Xbox Network scopes.

**Issue**: Refresh token doesn't work
**Solution**: Ensure you requested the `offline_access` scope during initial authentication.

### Debug Mode

Enable detailed logging for troubleshooting:

```typescript
// Enable debug mode (implement based on your logging system)
const DEBUG = process.env.NODE_ENV === 'development';

async function debugTokenExchange(code: string) {
	if (DEBUG) {
		console.log('Exchanging code:', code.substring(0, 10) + '...');
	}

	try {
		const tokens = await live.exchangeCodeForAccessToken(code);

		if (DEBUG) {
			console.log('Token exchange successful');
			console.log('Access token length:', tokens.access_token.length);
			console.log('Has refresh token:', !!tokens.refresh_token);
		}

		return tokens;
	} catch (error) {
		if (DEBUG) {
			console.error('Token exchange failed:', error);
		}
		throw error;
	}
}
```

## Related Documentation

-   [Basic Authentication](01-Authenticate.md) - Standard authentication methods
-   [Known Issues](06-Known_Issues.md) - 2FA limitations with direct authentication
-   [Available Methods](05-Methods.md) - Complete method reference
-   [RelyingParty Configuration](04-RelyingParty.md) - Service-specific authentication
-   [Errors](08-Errors.md)

For more information about Microsoft OAuth 2.0, refer to the [official Microsoft documentation](https://docs.microsoft.com/en-us/advertising/guides/authentication-oauth-live-connect).
