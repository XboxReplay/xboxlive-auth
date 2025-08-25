# Experimental Methods

This document covers experimental methods that may change or be removed in future versions. Use these methods with caution in production environments.

## Device Token Generation

### xnet.experimental.createDummyWin32DeviceToken()

Creates a dummy Win32 device token that can be used during the authentication process. This is particularly useful for authenticating accounts with age restrictions or when additional device validation is required.

> [!CAUTION]
> Due to high usage, the `deviceId` may be flagged and **banned** by Xbox services. While this should not affect the attached account, use it with caution and **only as a last resort** for XSTS token generation. The response below indicate when this occurs.

```json
{
   "url": "https://xsts.auth.xboxlive.com/xsts/authorize",
   "statusCode": 401,
   "response": {
      "body": {
         "Identity": "xdi",
         "XErr": 2148916227,
         "Redirect": "https://start.ui.xboxlive.com/enforcement"
      },
      "headers": {
         "cache-control": "no-cache, no-store",
         "content-length": "91",
         "content-type": "application/json",
         "date": "Sun, 22 Aug 2025 13:21:01 GMT",
         "ms-cv": "4fbQV1uQjEao73beFAHdn1.0",
         "www-authenticate": "XSTS error=\"Msft_ban\"",
         "x-content-type-options": "nosniff",
         "x-xblcorrelationid": "5c14ade8-8395-4744-a453-962120adddb5"
      }
   }
}
```

**Usage:**

```typescript
import { xnet } from '@xboxreplay/xboxlive-auth';

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

## Usage with Authentication

### Basic Authentication with Device Token

Unfortunately, the current `authenticate()` function doesn't directly support device tokens. You'll need to use the individual modules:

```typescript
import { live, xnet } from '@xboxreplay/xboxlive-auth';

// Step 1: Authenticate with Microsoft Live
const authResponse = await live.authenticateWithCredentials({
  email: 'user@example.com',
  password: 'password',
});

// Step 2: Get user token
const userTokenResponse = await xnet.exchangeRpsTicketForUserToken(authResponse.access_token, 't');

// Step 3: Create device token
const deviceTokenResponse = await xnet.experimental.createDummyWin32DeviceToken();

// Step 4: Exchange for XSTS token with device token
const XSTSResponse = await xnet.exchangeTokensForXSTSToken(
  {
    userTokens: [userTokenResponse.Token],
    deviceToken: deviceTokenResponse.Token,
  },
  {
    XSTSRelyingParty: 'http://xboxlive.com',
  }
);

console.log(XSTSResponse);
```

### Custom Azure Applications with Device Token

For custom Azure applications, the process is similar but uses different parameters:

```typescript
import { live, xnet } from '@xboxreplay/xboxlive-auth';

// OAuth flow code exchange
const tokens = await live.exchangeCodeForAccessToken('AUTHORIZATION_CODE');

// Get user token (note the 'd' parameter for custom Azure apps)
const userTokenResponse = await xnet.exchangeRpsTicketForUserToken(
  tokens.access_token,
  'd' // Required for custom Azure applications
);

// Create device token
const deviceTokenResponse = await xnet.experimental.createDummyWin32DeviceToken();

// Exchange for XSTS token
const XSTSResponse = await xnet.exchangeTokensForXSTSToken(
  {
    userTokens: [userTokenResponse.Token],
    deviceToken: deviceTokenResponse.Token,
  },
  {
    XSTSRelyingParty: 'http://xboxlive.com',
  }
);
```

## When to Use Device Tokens

Device tokens are particularly useful in these scenarios:

### 1. Age-Restricted Accounts

Child and Teen accounts often require device tokens for authentication:

```typescript
// First, check the age group
const ageCheckResponse = await xnet.exchangeTokenForXSTSToken(userToken, {
  XSTSRelyingParty: 'http://accounts.xboxlive.com',
});

const ageGroup = ageCheckResponse.DisplayClaims.xui[0].agg;

if (ageGroup === 'Child' || ageGroup === 'Teen') {
  // Use device token for authentication
  const deviceToken = await xnet.experimental.createDummyWin32DeviceToken();
  // Continue with device token authentication...
}
```

### 2. Enhanced Security Requirements

Some Xbox Network services may require device tokens for additional security validation.

### 3. Specific RelyingParty Requirements

Certain relying parties may mandate device tokens for authentication.

## Important Considerations

### Experimental Status

⚠️ **Warning**: This method is experimental and may:

-   Change without notice in future versions
-   Be removed in future versions
-   Have limited support or documentation
-   Behave differently across different environments

### Security Implications

Device tokens contain device-specific information. While these are "dummy" tokens, be mindful of how you store and transmit them.

## Error Handling

Always implement proper error handling when using experimental methods:

```typescript
try {
  const deviceToken = await xnet.experimental.createDummyWin32DeviceToken();
  // Use device token...
} catch (error) {
  console.error('Device token generation failed:', error);

  // Fallback to authentication without device token
  const fallbackAuth = await authenticate('user@example.com', 'password');
}
```

## Migration Path

If this experimental method is removed in future versions, alternative approaches may include:

1. Using official device registration APIs (when available)
2. Implementing custom device identification
3. Using OAuth 2.0 flows without device tokens

## Related Documentation

-   [Known Issues](06-Known_Issues.md) - Age group authentication issues
-   [Detect Unauthorized AgeGroup](07-Detect_Unauthorized_AgeGroup.md) - Checking account restrictions
-   [Available Methods](05-Methods.md) - Complete method reference
-   [Errors](09-Errors.md) - Error Handling

## Feedback

Since this is an experimental feature, feedback is particularly valuable. If you encounter issues or have suggestions for improvement, please report them through the project's issue tracker.
