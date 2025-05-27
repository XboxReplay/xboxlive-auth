# Known Issues

This document outlines known limitations and issues with the library, along with possible workarounds.

## Two-Factor Authentication (2FA)

### Issue

The main `authenticate()` function and `live.authenticateWithCredentials()` method cannot handle accounts with Two-Factor Authentication (2FA) enabled.

### Impact

-   Accounts with 2FA will fail during authentication
-   No interactive prompt for 2FA codes
-   Authentication will throw an error

### Workaround

Use OAuth 2.0 flows with refresh tokens instead:

```typescript
import { live } from '@xboxreplay/xboxlive-auth';

// 1. Get authorization URL
const authorizeUrl = live.getAuthorizeUrl({
	clientId: 'YOUR_CLIENT_ID',
	scope: 'XboxLive.signin XboxLive.offline_access',
	responseType: 'code',
	redirectUri: 'YOUR_REDIRECT_URI',
});

// 2. Direct user to authorizeUrl for manual authentication
console.log('Please visit:', authorizeUrl);

// 3. After user completes 2FA, exchange the code
const tokens = await live.exchangeCodeForAccessToken('RETURNED_CODE');

// 4. Use refresh token for future authentications
const freshTokens = await live.refreshAccessToken(tokens.refresh_token);
```

### Status

Additional improvements regarding 2FA support are not currently planned.

## Age-Restricted Accounts

### Issue

Child and Teen accounts cannot authenticate with the default authentication methods due to Xbox Network security restrictions.

### Impact

-   Accounts with age groups "Child" or "Teen" will fail authentication
-   Error typically occurs during XSTS token exchange
-   Standard authentication flow is insufficient

### Detection

First, check the account's age group:

```typescript
import { live, xnet } from '@xboxreplay/xboxlive-auth';

// Get user token first
const authResponse = await live.authenticateWithCredentials({
	email: 'user@example.com',
	password: 'password',
});

const userToken = await xnet.exchangeRpsTicketForUserToken(authResponse.access_token, 't');

// Check age group using accounts RelyingParty
const accountsResponse = await xnet.exchangeTokenForXSTSToken(userToken.Token, {
	XSTSRelyingParty: 'http://accounts.xboxlive.com',
});

const ageGroup = accountsResponse.DisplayClaims.xui[0].agg;
console.log('Age Group:', ageGroup); // "Child", "Teen", or "Adult"
```

### Workaround

Use device tokens for age-restricted accounts:

```typescript
import { live, xnet } from '@xboxreplay/xboxlive-auth';

// Standard authentication flow
const authResponse = await live.authenticateWithCredentials({
	email: 'child@example.com',
	password: 'password',
});

const userTokenResponse = await xnet.exchangeRpsTicketForUserToken(authResponse.access_token, 't');

// Create device token for age-restricted account
const deviceTokenResponse = await xnet.experimental.createDummyWin32DeviceToken();

// Exchange with device token
const XSTSResponse = await xnet.exchangeTokensForXSTSToken(
	{
		userTokens: [userTokenResponse.Token],
		deviceToken: deviceTokenResponse.Token,
	},
	{
		XSTSRelyingParty: 'http://xboxlive.com',
	}
);

console.log('Success with device token:', XSTSResponse);
```

### Alternative for Custom Azure Applications

```typescript
// For custom Azure applications, use 'd' parameter
const userToken = await xnet.exchangeRpsTicketForUserToken(rpsTicket, 'd');
const deviceToken = await xnet.experimental.createDummyWin32DeviceToken();

await xnet.exchangeTokensForXSTSToken(
	{
		userTokens: [userToken.Token],
		deviceToken: deviceToken.Token,
	},
	{
		XSTSRelyingParty: 'http://xboxlive.com',
	}
);
```

## Connection Issues with Valid Credentials and Disabled 2FA

### Issue

Authentication fails despite providing correct credentials and having two-factor authentication disabled, typically due to Microsoft's automated security restrictions.

### Impact

-   Sign-in attempts are blocked from unfamiliar locations or automated systems
-   Production servers and cloud deployments commonly trigger these restrictions
-   Authentication flow completes locally but fails in deployment environments
-   No clear error indication that location-based blocking is the cause

> [!NOTE]
> This issue commonly occurs when deploying applications to cloud servers or when the application runs from a different geographic location than your usual sign-in pattern.

## Token Expiration

### Issue

Authentication tokens have limited lifespans and will expire.

### Impact

-   XSTS tokens typically expire within 24 hours
-   Refresh tokens may have longer lifespans but can also expire
-   Expired tokens will cause API calls to fail

### Detection

Check token expiration before use:

```typescript
const result = await authenticate('user@example.com', 'password');
const expirationDate = new Date(result.expires_on);
const isExpired = new Date() >= expirationDate;

if (isExpired) {
	console.log('Token has expired, need to re-authenticate');
	// Re-authenticate or use refresh token
}
```

### Workaround

Implement token refresh logic:

```typescript
import { live } from '@xboxreplay/xboxlive-auth';

// Store refresh token from initial authentication
let refreshToken = 'stored_refresh_token';

try {
	// Attempt to use existing token
	await makeXboxLiveAPICall();
} catch (error) {
	if (error.status === 401) {
		// Token expired, refresh it
		const freshTokens = await live.refreshAccessToken(refreshToken);
		refreshToken = freshTokens.refresh_token; // Update stored token

		// Retry the API call with fresh token
		await makeXboxLiveAPICall();
	}
}
```

## CORS Restrictions

### Issue

This library is designed for Node.js environments and will not work in browsers due to CORS restrictions.

### Impact

-   Cannot be used in client-side web applications
-   Browser-based authentication attempts will fail
-   XMLHttpRequest/fetch requests will be blocked

### Workaround

Use the library only in server-side Node.js applications:

```typescript
// ✅ Server-side usage (Node.js)
const express = require('express');
const { authenticate } = require('@xboxreplay/xboxlive-auth');

app.post('/auth', async (req, res) => {
	try {
		const result = await authenticate(req.body.email, req.body.password);
		res.json(result);
	} catch (error) {
		res.status(401).json({ error: 'Authentication failed' });
	}
});

// ❌ Client-side usage (Browser) - Will not work
// <script src="xboxlive-auth.js"></script>
// authenticate(email, password); // CORS error
```

## Custom Azure Application Limitations

### Issue

Custom Azure Applications have different requirements and limitations compared to the default Xbox Network client.

### Impact

-   Requires different token exchange parameters
-   May have different scope requirements
-   Different redirect URI handling

### Workaround

Use appropriate parameters for custom applications:

```typescript
// Use 'd' instead of 't' for custom Azure apps
const userToken = await xnet.exchangeRpsTicketForUserToken(rpsTicket, 'd');

// Custom authorization URL
const authorizeUrl = live.getAuthorizeUrl({
	clientId: 'YOUR_CUSTOM_CLIENT_ID',
	scope: 'XboxLive.signin XboxLive.offline_access',
	responseType: 'code',
	redirectUri: 'https://your-domain.com/callback',
});
```

## Network Connectivity Issues

### Issue

Authentication requires stable internet connectivity to Microsoft services.

### Impact

-   Network timeouts can cause authentication failures
-   Intermittent connectivity issues may cause partial failures
-   Firewall restrictions may block required endpoints

### Workaround

Implement proper error handling and retry logic:

```typescript
async function robustAuthenticate(email, password) {
	const maxRetries = 3;
	const timeout = 10000; // 10 seconds

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			// Add timeout to authentication
			const authPromise = authenticate(email, password);
			const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout));

			return await Promise.race([authPromise, timeoutPromise]);
		} catch (error) {
			console.log(`Attempt ${attempt} failed:`, error.message);

			if (attempt === maxRetries) {
				throw new Error(`Authentication failed after ${maxRetries} attempts`);
			}

			// Wait before retry
			await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
		}
	}
}
```

## Error Reporting

If you encounter issues not covered in this document:

1. **Check the error message** for specific details about the failure
2. **Verify account credentials** and account status
3. **Test with different account types** (Adult, Teen, Child)
4. **Review network connectivity** and firewall settings
5. **Report issues** through the project's GitHub repository

## Related Documentation

-   [Experimental Methods](03-Experimental.md) - Device token workarounds
-   [RelyingParty Configuration](04-RelyingParty.md) - Service-specific authentication
-   [Detect Unauthorized AgeGroup](07-Detect_Unauthorized_AgeGroup.md) - Age verification methods
-   [Custom Azure Application](02-Custom_Azure_Application.md) - OAuth 2.0 setup
-   [Errors](09-Errors.md) - Error Handling
