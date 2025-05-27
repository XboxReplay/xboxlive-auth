# RelyingParty Configuration

This document explains what RelyingParty is, how it affects authentication, and how to configure it for different Xbox Network services.

## What is a RelyingParty?

A RelyingParty (RP) is a URL that identifies which Xbox Network service or application you're authenticating for. Different services require different relying parties, and each can return different sets of user claims and have different authentication requirements.

## Default RelyingParty

The library uses `http://xboxlive.com` as the default RelyingParty, which works for most general Xbox Network API access.

```typescript
import { authenticate } from '@xboxreplay/xboxlive-auth';

// Uses default RelyingParty: http://xboxlive.com
const result = await authenticate('user@example.com', 'password');
```

## Custom RelyingParty

You can specify a custom RelyingParty for specific services:

```typescript
import { authenticate } from '@xboxreplay/xboxlive-auth';

const authWithCustomRP = await authenticate('user@example.com', 'password', {
  XSTSRelyingParty: 'https://prod.xsts.halowaypoint.com/',
});

console.log(authWithCustomRP);
```

### Known Public Relying Parties

| Relying Party URL                       | Purpose                                 |
| --------------------------------------- | --------------------------------------- |
| `http://accounts.xboxlive.com`          | Account management and profile services |
| `http://attestation.xboxlive.com`       | Device and client attestation           |
| `http://banning.xboxlive.com`           | Ban and enforcement services            |
| `http://device.mgt.xboxlive.com`        | Device management                       |
| `http://events.xboxlive.com`            | Event tracking and analytics            |
| `http://experimentation.xboxlive.com/`  | A/B testing and feature flags           |
| `https://gameservices.xboxlive.com/`    | Core gaming services                    |
| `http://instance.mgt.xboxlive.com`      | Game instance management                |
| `http://licensing.xboxlive.com`         | Content licensing and DRM               |
| `http://mp.microsoft.com/`              | Microsoft multiplayer services          |
| `http://playfab.xboxlive.com/`          | PlayFab integration services            |
| `http://sisu.xboxlive.com/`             | Sign-in and user services               |
| `rp://streaming.xboxlive.com/`          | Game streaming services                 |
| `http://unlock.device.mgt.xboxlive.com` | Device unlock management                |
| `http://update.xboxlive.com`            | System and game updates                 |
| `http://uxservices.xboxlive.com`        | User experience services                |
| `http://xboxlive.com`                   | General Xbox Live services              |
| `http://xdes.xboxlive.com/`             | Xbox data and encryption services       |
| `http://xflight.xboxlive.com/`          | Feature rollout and flighting           |
| `http://xkms.xboxlive.com`              | Key management services                 |
| `http://xlink.xboxlive.com`             | Cross-platform linking                  |

> [!NOTE]
> Different relying parties provide access to different Xbox Live services and may return varying claim sets in the authentication response.

## Optional Display Claims

Different RelyingParty configurations may support additional claims that aren't returned by default. You can request specific claims using the `optionalDisplayClaims` option:

```typescript
import { authenticate } from '@xboxreplay/xboxlive-auth';

const authWithOptionalClaims = await authenticate('user@example.com', 'password', {
  XSTSRelyingParty: 'http://xboxlive.com',
  optionalDisplayClaims: ['mgt', 'umg', 'mgs'],
});

console.log(authWithOptionalClaims);
```

### Available Optional Claims

| Claim | Description            | Example Value                  |
| ----- | ---------------------- | ------------------------------ |
| `gtg` | Gamertag               | `"Zeny IC"`                    |
| `xid` | Xbox User ID           | `"2584878536129841"`           |
| `uhs` | User Hash              | `"3218841136841218711"`        |
| `agg` | Age Group              | `"Adult"`, `"Teen"`, `"Child"` |
| `usr` | User Privileges        | `"234"`                        |
| `utr` | User Title Rights      | `"190"`                        |
| `prv` | Privileges             | `"185 186 187 188 191 192"`    |
| `mgt` | Modern Gamertag        | `"ZenyIC"`                     |
| `umg` | Unique Modern Gamertag | `"ZenyIC#1234"`                |
| `mgs` | Modern Gamertag Suffix | `"1234"`                       |

## RelyingParty Effects

Different RelyingParty values can affect:

### 1. Available Claims

Some claims are only available with specific RelyingParty values:

```typescript
// General Xbox Network - basic claims
const basicAuth = await authenticate('user@example.com', 'password', {
  XSTSRelyingParty: 'http://xboxlive.com',
});

// Accounts service - may include additional account information
const accountsAuth = await authenticate('user@example.com', 'password', {
  XSTSRelyingParty: 'http://accounts.xboxlive.com',
});
```

### 2. XUID Availability

The `xuid` field may be `null` for certain RelyingParty configurations:

```typescript
const result = await authenticate('user@example.com', 'password', {
  XSTSRelyingParty: 'http://accounts.xboxlive.com',
});

// result.xuid might be null for this RelyingParty
if (result.xuid) {
  console.log('User XUID:', result.xuid);
} else {
  console.log('XUID not available for this RelyingParty');
}
```

### 3. Authentication Requirements

Some RelyingParty values may require additional authentication steps or tokens:

```typescript
// Some services might require device tokens
const deviceToken = await xnet.experimental.createDummyWin32DeviceToken();

const serviceAuth = await xnet.exchangeTokensForXSTSToken(
  {
    userTokens: [userToken],
    deviceToken: deviceToken.Token,
  },
  {
    XSTSRelyingParty: 'https://specific-service.com/',
  }
);
```

## Age Group Detection

The accounts RelyingParty is particularly useful for detecting age-restricted accounts:

```typescript
import { xnet } from '@xboxreplay/xboxlive-auth';

// First get a user token
const userToken = 'YOUR_USER_TOKEN';

// Use accounts RP to check age group
const accountsResponse = await xnet.exchangeTokenForXSTSToken(userToken, {
  XSTSRelyingParty: 'http://accounts.xboxlive.com',
});

const ageGroup = accountsResponse.DisplayClaims.xui[0].agg;
console.log('Age Group:', ageGroup); // "Adult", "Teen", or "Child"

if (ageGroup === 'Child' || ageGroup === 'Teen') {
  console.log('Account has age restrictions');
  // May need device token for full authentication
}
```

## Sandbox Configuration

Along with RelyingParty, you can specify a sandbox ID:

```typescript
const result = await authenticate('user@example.com', 'password', {
  XSTSRelyingParty: 'http://xboxlive.com',
  sandboxId: 'RETAIL', // or 'XDKS.1' for development
});
```

### Available Sandbox IDs

-   `RETAIL` (default) - Production Xbox Network environment
-   `XDKS.1` - Development/testing environment

In addition to the above, developers may also have access to their own RelyingParty identifiers (e.g., L343.1, BNG.99, etc.), which are typically tied to specific studios or services.

## Using with Raw Mode

When using raw mode, you can see exactly how different RelyingParty values affect the response:

```typescript
const rawResult = await authenticate('user@example.com', 'password', {
  XSTSRelyingParty: 'http://accounts.xboxlive.com',
  optionalDisplayClaims: ['mgt', 'umg'],
  raw: true,
});

// Examine the XSTS response for this specific RelyingParty
console.log(rawResult['xsts.auth.xboxlive.com'].DisplayClaims);
```

## Advanced Usage with Individual Methods

For more control, you can use the individual token exchange methods:

```typescript
import { xnet } from '@xboxreplay/xboxlive-auth';

// Exchange with custom RelyingParty and claims
const XSTSResponse = await xnet.exchangeTokenForXSTSToken(userToken, {
  XSTSRelyingParty: 'https://prod.xsts.halowaypoint.com/',
  optionalDisplayClaims: ['gtg', 'mgt', 'umg'],
  sandboxId: 'RETAIL',
});

console.log('Custom RP Response:', XSTSResponse);
```

## Error Handling

Different RelyingParty values may result in different error conditions:

```typescript
try {
  await authenticate('user@example.com', 'password', {
    XSTSRelyingParty: 'http://custom-service.com/',
  });
} catch (err) {
  console.error('Account may not have access to this service', err);
}
```

## Best Practices

1. **Use the most specific RelyingParty** for your use case
2. **Test with different account types** (Adult, Teen, Child) to ensure compatibility
3. **Cache RelyingParty-specific responses** when possible to reduce API calls
4. **Handle null xuid values** gracefully in your application logic
5. **Request only necessary optional claims** to minimize response size
6. **Use accounts RelyingParty for age verification** before attempting service-specific authentication

## Troubleshooting

### Common Issues

**Issue**: `xuid` is null in response
**Solution**: Try using `http://xboxlive.com` as the RelyingParty, or check if the service supports XUID claims.

**Issue**: Missing expected claims in response
**Solution**: Add the required claims to `optionalDisplayClaims` array.

**Issue**: Authentication fails with specific RelyingParty
**Solution**: Verify the RelyingParty URL is correct and that your account has access to that service.

**Issue**: Age-restricted account authentication fails
**Solution**: Use device tokens with restricted accounts (see [Experimental Methods](03-Experimental.md)).

## Related Documentation

-   [Basic Authentication](01-Authenticate.md) - Main authentication methods
-   [Experimental Methods](03-Experimental.md) - Device token usage
-   [Known Issues](06-Known_Issues.md) - Age group restrictions
-   [Detect Unauthorized AgeGroup](07-Detect_Unauthorized_AgeGroup.md) - Age verification patterns
-   [Errors](09-Errors.md) - Error Handling
