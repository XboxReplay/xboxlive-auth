# Available Methods

This document provides a comprehensive reference for all available methods in the library.

## Main Exports

```typescript
import { authenticate, live, xnet, XSAPIClient } from '@xboxreplay/xboxlive-auth';
```

## authenticate()

The main authentication function that handles the complete Xbox Network authentication flow.

```typescript
authenticate(email: Email, password: string, options?: AuthenticateOptions): Promise<AuthenticateResponse>
authenticate(email: Email, password: string, options: AuthenticateOptions & { raw: true }): Promise<AuthenticateRawResponse>
```

**Parameters:**

-   `email` - User's email address (must be valid email format)
-   `password` - User's password
-   `options` - Optional configuration object

**Example:**

```typescript
const result = await authenticate('user@example.com', 'password', {
	XSTSRelyingParty: 'http://xboxlive.com',
	optionalDisplayClaims: ['gtg', 'mgt'],
	raw: false,
});
```

## live Module

Microsoft Live authentication methods.

### live.preAuth()

Pre-authentication request used to retrieve mandatory authentication parameters.

```typescript
const preAuthResponse = await live.preAuth();
console.log(preAuthResponse);
```

**Response:**

```json
{
	"cookie": "MSA=...; X=...; ...",
	"matches": {
		"PPFT": "abcde...",
		"urlPost": "https://login.live.com/..."
	}
}
```

### live.getAuthorizeUrl()

Returns the login.live.com authorize URL for OAuth 2.0 flows.

```typescript
const authorizeUrl = live.getAuthorizeUrl();
console.log(authorizeUrl);
// https://login.live.com/oauth20_authorize.srf?client_id=000000004C12AE6F&redirect_uri=https://login.live.com/oauth20_desktop.srf&response_type=token&scope=service::user.auth.xboxlive.com::MBI_SSL
```

**With custom parameters:**

```typescript
const authorizeUrl = live.getAuthorizeUrl({
	clientId: 'YOUR_CLIENT_ID',
	scope: 'XboxLive.signin XboxLive.offline_access',
	responseType: 'code',
	redirectUri: 'YOUR_REDIRECT_URI',
});
```

### live.authenticateWithCredentials()

Authenticate directly with user credentials.

```typescript
const authResponse = await live.authenticateWithCredentials({
	email: 'user@example.com',
	password: 'password',
});

console.log(authResponse);
```

**Response:**

```json
{
	"token_type": "bearer",
	"expires_in": 86400,
	"access_token": "EwAIA+pvBAAUK...",
	"refresh_token": "M.R3_BAY...",
	"scope": "service::user.auth.xboxlive.com::MBI_SSL",
	"user_id": "123abc..."
}
```

### live.exchangeCodeForAccessToken()

Exchange an OAuth authorization code for access tokens.

```typescript
const tokens = await live.exchangeCodeForAccessToken('AUTHORIZATION_CODE');
console.log(tokens);
```

### live.refreshAccessToken()

Refresh an expired access token using a refresh token.

```typescript
const freshTokens = await live.refreshAccessToken('M.R3_B.xxxxxx');
console.log(freshTokens);
```

**Response:**

```json
{
	"token_type": "bearer",
	"expires_in": 86400,
	"access_token": "EwAIA+pvBAAUK...",
	"refresh_token": "M.R3_BAY...",
	"scope": "service::user.auth.xboxlive.com::MBI_SSL",
	"user_id": "123abc..."
}
```

## xnet Module

Xbox Network token exchange methods.

### xnet.exchangeRpsTicketForUserToken()

Exchange a Live.com RPS ticket for an Xbox Network user token.

```typescript
const userTokenResponse = await xnet.exchangeRpsTicketForUserToken(
	'RPS_TICKET',
	't' // or 'd' for custom Azure applications
);

console.log(userTokenResponse);
```

**Response:**

```json
{
	"IssueInstant": "2021-01-14T18:55:20.0082007Z",
	"NotAfter": "2021-01-15T10:55:20.0082007Z",
	"Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"DisplayClaims": {
		"xui": [
			{
				"uhs": "3218841136841218711"
			}
		]
	}
}
```

### xnet.exchangeTokenForXSTSToken()

Exchange a user token for an XSTS token (single token version).

```typescript
const XSTSResponse = await xnet.exchangeTokenForXSTSToken('USER_TOKEN', {
	XSTSRelyingParty: 'http://xboxlive.com',
	optionalDisplayClaims: ['gtg', 'xid'],
	sandboxId: 'RETAIL',
});
```

### xnet.exchangeTokensForXSTSToken()

Exchange multiple tokens (user tokens, device tokens, title tokens) for an XSTS token.

```typescript
const XSTSResponse = await xnet.exchangeTokensForXSTSToken(
	{
		userTokens: ['USER_TOKEN_1', 'USER_TOKEN_2'],
		deviceToken: 'DEVICE_TOKEN', // optional
		titleToken: 'TITLE_TOKEN', // optional
	},
	{
		XSTSRelyingParty: 'http://xboxlive.com',
		optionalDisplayClaims: ['gtg', 'mgt'],
		sandboxId: 'RETAIL',
	}
);
```

### xnet.exchangeCodeForAccessToken()

Exchange an authorization code for access tokens (Xbox Network version).

```typescript
const tokens = await xnet.exchangeCodeForAccessToken('AUTHORIZATION_CODE');
```

## xnet.experimental

Experimental methods that may change or be removed in future versions.

### xnet.experimental.createDummyWin32DeviceToken()

Create a dummy Win32 device token for authentication scenarios that require device tokens.

```typescript
const deviceTokenResponse = await xnet.experimental.createDummyWin32DeviceToken();
console.log(deviceTokenResponse);
```

**Response:**

```json
{
	"IssueInstant": "2021-01-14T18:55:20.0082007Z",
	"NotAfter": "2021-01-15T10:55:20.0082007Z",
	"Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"DisplayClaims": {
		"xdi": {
			"did": "F50CDD8781FF4476",
			"dcs": "87411"
		}
	}
}
```

## XSAPIClient

XSAPI Fetch client for making authenticated requests to Xbox Network APIs.

```typescript
import { XSAPIClient } from '@xboxreplay/xboxlive-auth';

// GET request
await XSAPIClient.get('https://profile.xboxlive.com/users/gt(Major%20Nelson)/profile/settings?settings=Gamerscore', {
	options: { contractVersion: 2, userHash: 'YOUR_USER_HASH', XSTSToken: 'YOUR_XSTS_TOKEN' },
});

// POST request
await XSAPIClient.get('https://account.xboxlive.com/users/me/profile/gamertag', {
	body: { gamertag: 'Join Waypoint' },
	options: { contractVersion: 4, userHash: 'YOUR_USER_HASH', XSTSToken: 'YOUR_XSTS_TOKEN' },
});
```

## Type Definitions

### AuthenticateOptions

```typescript
type AuthenticateOptions = {
	XSTSRelyingParty?: string;
	optionalDisplayClaims?: string[];
	sandboxId?: string;
	raw?: boolean;
};
```

### Email

```typescript
type Email = `${string}@${string}.${string}`;
```

### AuthenticateResponse

```typescript
type AuthenticateResponse = {
	xuid: string | null;
	user_hash: string;
	xsts_token: string;
	display_claims: XBLExchangeTokensResponse['DisplayClaims'];
	expires_on: string;
};
```

### AuthenticateRawResponse

```typescript
type AuthenticateRawResponse = {
	'login.live.com': LiveAuthResponse;
	'user.auth.xboxlive.com': XNETExchangeRpsTicketResponse;
	'xsts.auth.xboxlive.com': XBLExchangeTokensResponse;
};
```

## Error Handling

All methods can throw errors. Always use proper error handling:

```typescript
try {
	const result = await live.authenticateWithCredentials({
		email: 'user@example.com',
		password: 'password',
	});
} catch (error) {
	console.error('Authentication failed:', error);
	// Handle specific error cases
}
```

## Related Documentation

-   [Basic Authentication](01-Authenticate.md)
-   [Custom Azure Application](02-Custom_Azure_Application.md)
-   [RelyingParty Configuration](04-Relying_Party.md)
-   [Known Issues](06-Known_Issues.md)
-   [Errors](08-Errors.md)
