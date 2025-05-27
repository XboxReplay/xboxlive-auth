# XboxReplay/XboxLive-Auth

A lightweight, zero-dependency Xbox Network (Xbox Live) authentication library for Node.js with OAuth 2.0 support.

⚠️ **Breaking Changes Notice**: Significant breaking changes have been introduced since v4. Please review the [Migration Guide](https://github.com/XboxReplay/xboxlive-auth/tree/master/docs/90-Migration_From_v4.md) for detailed upgrade instructions and code examples.

> [!IMPORTANT]
> The main `authenticate()` function remains backward compatible for basic usage, but method imports and advanced features have changed significantly.

## Installation

```bash
npm install @xboxreplay/xboxlive-auth
```

## Quick Start

### Basic Authentication

```typescript
import { authenticate } from '@xboxreplay/xboxlive-auth';

authenticate('name@domain.com', 'password').then(console.info).catch(console.error);
```

### Response Format

```json
{
	"xuid": "2584878536129841",
	"user_hash": "3218841136841218711",
	"xsts_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"display_claims": {
		"gtg": "Zeny IC",
		"xid": "2584878536129841",
		"uhs": "3218841136841218711",
		"agg": "Adult",
		"usr": "234",
		"utr": "190",
		"prv": "185 186 187 188 191 192 ..."
	},
	"expires_on": "2025-04-13T05:43:32.6275675Z"
}
```

> [!NOTE]
> The `xuid` field may be null based on the specified "RelyingParty", and `display_claims` may vary based on the specified "RelyingParty" configuration.

### Advanced Usage

#### Raw Response Mode

```typescript
import { authenticate } from '@xboxreplay/xboxlive-auth';

// Get raw responses from all authentication steps
const rawResponse = await authenticate('email@example.com', 'password', {
	raw: true,
});

console.log(rawResponse);
// Returns:
// {
//   'login.live.com': LiveAuthResponse,
//   'user.auth.xboxlive.com': XNETExchangeRpsTicketResponse,
//   'xsts.auth.xboxlive.com': XBLExchangeTokensResponse
// }
```

#### Custom Authentication Options

```typescript
import { authenticate } from '@xboxreplay/xboxlive-auth';

const result = await authenticate('email@example.com', 'password', {
	XSTSRelyingParty: 'http://xboxlive.com',
	optionalDisplayClaims: ['gtg', 'xid'],
	sandboxId: 'RETAIL',
});
```

### Using Individual Modules

The library now exports granular modules for advanced use cases:

```typescript
import { live, xnet } from '@xboxreplay/xboxlive-auth';

// Microsoft Live authentication
await live.preAuth();
await live.authenticateWithCredentials({ email: 'user@example.com', password: 'password' });
await live.exchangeCodeForAccessToken(code);
await live.refreshAccessToken(refreshToken);

// Xbox Network token exchange
await xnet.exchangeRpsTicketForUserToken(accessToken, 't');
await xnet.exchangeTokensForXSTSToken(tokens, options);

// Experimental features
const deviceToken = await xnet.experimental.createDummyWin32DeviceToken();
```

## Type Safety

The library is fully typed with TypeScript. Key types include:

-   `Email`: Enforces proper email format (`${string}@${string}.${string}`)
-   `AuthenticateOptions`: Configuration options for authentication
-   `AuthenticateResponse`: Standard response format
-   `AuthenticateRawResponse`: Raw response format when `raw: true`

## Documentation

-   [Basic authentication](https://github.com/XboxReplay/xboxlive-auth/tree/master/docs/01-Authenticate.md)
-   [Use a custom Azure Application (OAuth2.0)](https://github.com/XboxReplay/xboxlive-auth/tree/master/docs/02-Custom_Azure_Application.md)
-   [Experimental methods, such as "deviceToken" generation](https://github.com/XboxReplay/xboxlive-auth/tree/master/docs/03-Experimental.md)
-   [What's a RelyingParty and how to use it](https://github.com/XboxReplay/xboxlive-auth/tree/master/docs/04-RelyingParty.md)
-   [Available methods in this library](https://github.com/XboxReplay/xboxlive-auth/tree/master/docs/05-Methods.md)
-   [Known issues and possible workarounds](https://github.com/XboxReplay/xboxlive-auth/tree/master/docs/06-Known_Issues.md)
-   [How to deal with unauthorized "AgeGroup" authentication](https://github.com/XboxReplay/xboxlive-auth/tree/master/docs/07-Detect_Unauthorized_AgeGroup.md)

## Using the XSAPI Client

The library includes an XSAPI client that's a Fetch wrapper designed specifically for calling Xbox Network APIs:

```typescript
await XSAPIClient.get('https://profile.xboxlive.com/users/gt(Major%20Nelson)/profile/settings?settings=Gamerscore', {
	options: { contractVersion: 2, userHash: 'YOUR_USER_HASH', XSTSToken: 'YOUR_XSTS_TOKEN' },
});
```

### Manual cURL Example

```bash
curl 'https://profile.xboxlive.com/users/gt(Major%20Nelson)/profile/settings?settings=Gamerscore' \
  -H 'Authorization: XBL3.0 x=YOUR_USER_HASH;YOUR_XSTS_TOKEN' \
  -H 'X-XBL-Contract-Version: 2'
```

## Known Limitations

### Two-Factor Authentication (2FA)

The exposed `authenticate` method cannot deal with 2FA, but a workaround may be possible using OAuth2.0 flows with refresh tokens. Please take a look at the [authenticate documentation](https://github.com/XboxReplay/xboxlive-auth/tree/master/docs/01-Authenticate.md). Additional improvements regarding this issue are not currently planned.

### Other Issues

Please refer to the [dedicated documentation](https://github.com/XboxReplay/xboxlive-auth/tree/master/docs/06-Known_Issues.md) for other known issues and workarounds.

## License

[Apache Version 2.0](/LICENCE)
