# Authenticate

This document covers the main `authenticate` function and its usage patterns.

## Basic Authentication

The simplest way to authenticate with Xbox Network is using the main `authenticate` function:

```typescript
import { authenticate } from '@xboxreplay/xboxlive-auth';

const result = await authenticate('user@example.com', 'password');
console.log(result);
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
> The `xuid` field may be `null` based on the specified `RelyingParty`, and `display_claims` may vary based on the `RelyingParty` configuration.

## Advanced Options

The `authenticate` function accepts an optional third parameter with configuration options:

```typescript
const result = await authenticate('user@example.com', 'password', {
  XSTSRelyingParty: 'http://xboxlive.com',
  optionalDisplayClaims: ['gtg', 'xid', 'mgt'],
  sandboxId: 'RETAIL',
  raw: false,
});
```

### Available Options

-   **`XSTSRelyingParty`** `{string}` - Default: `'http://xboxlive.com'` - The relying party URL for XSTS token exchange
-   **`optionalDisplayClaims`** `{string[]}` - Default: `[]` - Optional display claims to be returned based on the used RelyingParty
-   **`sandboxId`** `{string}` - Default: `'RETAIL'` - Targeted sandbox ID
-   **`raw`** `{boolean}` - Default: `false` - If set to true, returns raw responses from each authentication step

## Raw Response Mode

When `raw: true` is specified, the function returns the raw responses from all authentication steps:

```typescript
const rawResult = await authenticate('user@example.com', 'password', {
  raw: true,
});

console.log(rawResult);
```

### Raw Response Format

```json
{
  "login.live.com": {
    "token_type": "bearer",
    "expires_in": 86400,
    "access_token": "EwAIA+pvBAAUK...",
    "refresh_token": "M.R3_BAY...",
    "scope": "service::user.auth.xboxlive.com::MBI_SSL",
    "user_id": "123abc..."
  },
  "user.auth.xboxlive.com": {
    "IssueInstant": "2025-01-14T18:55:20.0082007Z",
    "NotAfter": "2025-01-15T10:55:20.0082007Z",
    "Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "DisplayClaims": {
      "xui": [
        {
          "uhs": "3218841136841218711"
        }
      ]
    }
  },
  "xsts.auth.xboxlive.com": {
    "IssueInstant": "2025-01-14T18:55:20.0082007Z",
    "NotAfter": "2025-01-15T10:55:20.0082007Z",
    "Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "DisplayClaims": {
      "xui": [
        {
          "gtg": "Zeny IC",
          "xid": "2584878536129841",
          "uhs": "3218841136841218711",
          "agg": "Adult",
          "usr": "234",
          "utr": "190",
          "prv": "185 186 187 188 191 192 ..."
        }
      ]
    }
  }
}
```

## Type Safety

The library enforces proper email formatting through TypeScript:

```typescript
// ✅ Valid
authenticate('user@domain.com', 'password');

// ❌ TypeScript error - invalid email format
authenticate('invalid-email', 'password');
```

The `Email` type is defined as:

```typescript
type Email = `${string}@${string}.${string}`;
```

## Error Handling

Always wrap authentication calls using try-catch or promise chaining to handle errors gracefully:

### Option 1: Promise chaining

```typescript
await authenticate('user@example.com', 'password')
  .then(res => {
    console.log('Authentication successful:', res);
  })
  .catch(err => {
    console.error('Authentication failed:', err);
  });
```

### Option 2: Async/Await with try-catch

```typescript
try {
  const res = await authenticate('user@example.com', 'password');
  console.log('Authentication successful:', res);
} catch (err) {
  console.error('Authentication failed:', err);
}
```

Common error scenarios include:

-   Invalid credentials
-   Account restrictions (2FA, age restrictions)
-   Network connectivity issues
-   Rate limiting

## Alternative Authentication Methods

For more advanced authentication scenarios, consider using the individual modules:

-   **OAuth 2.0 flows**: Use `live` module methods
-   **Custom Azure applications**: See [Custom Azure Application](02-Custom_Azure_Application.md) documentation
-   **Token refresh**: Use `live.refreshAccessToken()`

## Next Steps

-   [Custom Azure Application Setup](02-Custom_Azure_Application.md)
-   [Understanding RelyingParty](04-RelyingParty.md)
-   [Available Methods Reference](05-Methods.md)
-   [Errors](09-Errors.md)
