# Detect Unauthorized AgeGroup

This document explains how to detect and handle age-restricted Xbox Network accounts that require special authentication handling.

## Overview

Xbox Network accounts are classified into different age groups based on the account holder's age and regional regulations. Accounts classified as "Child" or "Teen" have restrictions that prevent standard authentication and typically require device tokens for successful authentication.

## Age Group Classifications

| Age Group | Description                    | Authentication Requirements   |
| --------- | ------------------------------ | ----------------------------- |
| `Adult`   | Standard adult accounts        | Standard authentication works |
| `Teen`    | Teenage accounts (13-17 years) | May require device tokens     |
| `Child`   | Child accounts (under 13)      | Requires device tokens        |

## Detection Method

Use the accounts RelyingParty to check an account's age group before attempting full authentication:

```typescript
import { live, xnet } from '@xboxreplay/xboxlive-auth';

async function checkAgeGroup(email, password) {
	try {
		// Step 1: Authenticate with Microsoft Live
		const authResponse = await live.authenticateWithCredentials({
			email,
			password,
		});

		// Step 2: Get user token
		const userTokenResponse = await xnet.exchangeRpsTicketForUserToken(authResponse.access_token, 't');

		// Step 3: Check age group using accounts RelyingParty
		const accountsResponse = await xnet.exchangeTokenForXSTSToken(userTokenResponse.Token, {
			XSTSRelyingParty: 'http://accounts.xboxlive.com',
		});

		// Step 4: Extract age group
		const ageGroup = accountsResponse.DisplayClaims.xui[0].agg;

		return {
			ageGroup,
			userToken: userTokenResponse.Token,
			accountInfo: accountsResponse.DisplayClaims.xui[0],
		};
	} catch (error) {
		throw new Error(`Age group detection failed: ${error.message}`);
	}
}

// Usage
const result = await checkAgeGroup('user@example.com', 'password');
console.log('Age Group:', result.ageGroup);
console.log('Account Info:', result.accountInfo);
```

## Complete Detection Response

The accounts RelyingParty returns detailed account information:

```json
{
	"IssueInstant": "2021-01-14T18:55:20.0082007Z",
	"NotAfter": "2021-01-15T10:55:20.0082007Z",
	"Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"DisplayClaims": {
		"xui": [
			{
				"uhs": "3218841136841218711",
				"agg": "Teen"
			}
		]
	}
}
```

## Handling Different Age Groups

Based on the detected age group, implement appropriate authentication strategies:

```typescript
async function authenticateByAgeGroup(email, password) {
	const { ageGroup, userToken } = await checkAgeGroup(email, password);

	switch (ageGroup) {
		case 'Adult':
			console.log('Adult account - using standard authentication');
			return await authenticate(email, password);

		case 'Teen':
		case 'Child':
			console.log(`${ageGroup} account - using device token authentication`);
			return await authenticateWithDeviceToken(userToken);

		default:
			throw new Error(`Unknown age group: ${ageGroup}`);
	}
}

async function authenticateWithDeviceToken(userToken) {
	// Create device token for restricted accounts
	const deviceTokenResponse = await xnet.experimental.createDummyWin32DeviceToken();

	// Exchange for XSTS token with device token
	const XSTSResponse = await xnet.exchangeTokensForXSTSToken(
		{
			userTokens: [userToken],
			deviceToken: deviceTokenResponse.Token,
		},
		{
			XSTSRelyingParty: 'http://xboxlive.com',
		}
	);

	// Format response to match standard authenticate() response
	return {
		xuid: XSTSResponse.DisplayClaims.xui[0]?.xid || null,
		user_hash: XSTSResponse.DisplayClaims.xui[0]?.uhs,
		xsts_token: XSTSResponse.Token,
		display_claims: XSTSResponse.DisplayClaims,
		expires_on: XSTSResponse.NotAfter,
	};
}
```

## Streamlined Detection Function

Here's a utility function that combines detection and appropriate authentication:

```typescript
import { live, xnet, authenticate } from '@xboxreplay/xboxlive-auth';

async function smartAuthenticate(email, password, options = {}) {
	try {
		// First, try standard authentication
		return await authenticate(email, password, options);
	} catch (error) {
		// If standard auth fails, check if it's an age-restricted account
		console.log('Standard authentication failed, checking age group...');

		try {
			const { ageGroup, userToken } = await checkAgeGroup(email, password);

			if (ageGroup === 'Child' || ageGroup === 'Teen') {
				console.log(`Detected ${ageGroup} account, using device token...`);
				return await authenticateWithDeviceToken(userToken);
			} else {
				// Re-throw original error if it's not an age issue
				throw error;
			}
		} catch (detectionError) {
			// If detection also fails, throw the original error
			throw error;
		}
	}
}

// Usage
try {
	const result = await smartAuthenticate('user@example.com', 'password');
	console.log('Authentication successful:', result);
} catch (error) {
	console.error('Authentication failed:', error);
}
```

## Batch Age Group Detection

For multiple accounts, you can batch the detection process:

```typescript
async function batchAgeGroupDetection(credentials) {
	const results = [];

	for (const { email, password } of credentials) {
		try {
			const { ageGroup } = await checkAgeGroup(email, password);
			results.push({ email, ageGroup, status: 'success' });
		} catch (error) {
			results.push({ email, ageGroup: null, status: 'error', error: error.message });
		}

		// Rate limiting - wait between requests
		await new Promise(resolve => setTimeout(resolve, 1000));
	}

	return results;
}

// Usage
const accounts = [
	{ email: 'adult@example.com', password: 'password1' },
	{ email: 'teen@example.com', password: 'password2' },
	{ email: 'child@example.com', password: 'password3' },
];

const ageGroups = await batchAgeGroupDetection(accounts);
console.log('Age group results:', ageGroups);
```

## Caching Age Group Information

To avoid repeated age group checks, implement caching:

```typescript
const ageGroupCache = new Map();

async function getCachedAgeGroup(email, password) {
	const cacheKey = `${email}:agegroup`;

	if (ageGroupCache.has(cacheKey)) {
		const cached = ageGroupCache.get(cacheKey);

		// Check if cache is still valid (24 hours)
		if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
			return cached.ageGroup;
		}
	}

	// Cache miss or expired, fetch new data
	const { ageGroup } = await checkAgeGroup(email, password);

	ageGroupCache.set(cacheKey, {
		ageGroup,
		timestamp: Date.now(),
	});

	return ageGroup;
}
```

## Best Practices

1. **Check age group before full authentication** to avoid unnecessary API calls
2. **Cache age group results** to reduce repeated checks
3. **Implement fallback mechanisms** for when detection fails
4. **Handle rate limiting** when checking multiple accounts
5. **Use appropriate error handling** for different failure modes
6. **Respect privacy** when logging or storing age group information

## Privacy Considerations

When handling age group information:

-   **Don't log or store age group data unnecessarily**
-   **Be aware of regional privacy laws** (COPPA, GDPR, etc.)
-   **Implement appropriate data retention policies**
-   **Consider parental consent requirements** for child accounts

## Related Documentation

-   [Known Issues](06-Known_Issues.md) - Age-related authentication issues
-   [Experimental Methods](03-Experimental.md) - Device token usage
-   [RelyingParty Configuration](04-Relying_Party.md) - Using accounts RelyingParty
-   [Available Methods](05-Methods.md) - Complete method reference
-   [Errors](08-Errors.md)
