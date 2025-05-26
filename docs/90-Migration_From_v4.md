# Migration From v4

This document outlines the breaking changes introduced in the latest version of `@xboxreplay/xboxlive-auth`.

## 1. Method Naming and Access

### `authenticateWithUserCredentials` → `live.authenticateWithCredentials`

**❌ Old (v4):**

```javascript
import { authenticateWithUserCredentials } from '@xboxreplay/xboxlive-auth';

await authenticateWithUserCredentials(email, password);
```

**✅ New:**

```javascript
import { live } from '@xboxreplay/xboxlive-auth';

await live.authenticateWithCredentials({ email, password });
```

## 2. Modular Structure

Methods are now organized under namespaces instead of being directly exported.

**❌ Old (v4):**

```javascript
import {
	exchangeRpsTicketForUserToken,
	exchangeTokenForXSTSToken,
	exchangeTokensForXSTSToken,
} from '@xboxreplay/xboxlive-auth';

await exchangeRpsTicketForUserToken(token, 't');
await exchangeTokenForXSTSToken(token, options);
```

**✅ New:**

```javascript
import { xnet } from '@xboxreplay/xboxlive-auth';

await xnet.exchangeRpsTicketForUserToken(token, 't');
await xnet.exchangeTokenForXSTSToken(token, options);
await xnet.exchangeTokensForXSTSToken(tokens, options);
```

## 3. Function Parameter Changes

### Object Parameters Required

**❌ Old (v4):**

```javascript
authenticateWithUserCredentials(email, password);
```

**✅ New:**

```javascript
live.authenticateWithCredentials({ email, password });
```

## 4. Return Type Changes

The `authenticate` function now supports different return formats.

**❌ Old behavior:**

```javascript
// Always returned simplified object
const result = await authenticate(email, password);
// Always returned: { xuid, user_hash, xsts_token, display_claims, expires_on }
```

**✅ New behavior:**

```javascript
// Default behavior (backward compatible)
const result = await authenticate(email, password);
// Returns: { xuid, user_hash, xsts_token, display_claims, expires_on }

// New raw mode (breaking change if you expect consistent types)
const rawResult = await authenticate(email, password, { raw: true });
// Returns: { 'login.live.com': {...}, 'user.auth.xboxlive.com': {...}, 'xsts.auth.xboxlive.com': {...} }
```

## 5. TypeScript Email Validation

Stricter email type validation is now enforced.

**❌ Old (v4):**

```javascript
// Any string was accepted
authenticate('invalid-email', 'password');
```

**✅ New:**

```javascript
// Must be proper email format
authenticate('user@domain.com', 'password'); // ✅ Valid
authenticate('invalid-email', 'password'); // ❌ TypeScript error
```

## 6. Removed Methods

### `authenticateWithUserRefreshToken`

This method was mentioned in the previous documentation but is no longer available in the main exports.

**❌ No longer available:**

```javascript
import { authenticateWithUserRefreshToken } from '@xboxreplay/xboxlive-auth';
```

**✅ Alternative:**

```javascript
import { live } from '@xboxreplay/xboxlive-auth';

// Use OAuth2.0 flows with refresh tokens
await live.refreshAccessToken(refreshToken);
```

## 7. Import Structure Changes

Only specific methods are now exported at the root level.

**❌ Old (v4):**

```javascript
// Many methods were directly importable
import {
	authenticate,
	authenticateWithUserCredentials,
	authenticateWithUserRefreshToken,
	exchangeRpsTicketForUserToken,
	// ... and many others
} from '@xboxreplay/xboxlive-auth';
```

**✅ New:**

```javascript
// Only four main exports
import {
	authenticate, // Main authentication function
	live, // Microsoft Live authentication methods
	xnet, // Xbox Network token exchange methods
	XSAPIClient, // XSAPI client for Xbox Network API calls
} from '@xboxreplay/xboxlive-auth';
```

## Migration Checklist

-   [ ] Replace `authenticateWithUserCredentials` with `live.authenticateWithCredentials`
-   [ ] Update method imports to use `live` and `xnet` namespaces
-   [ ] Change function calls to use object parameters where required
-   [ ] Handle new `raw` option if using dynamic return type handling
-   [ ] Update TypeScript types to use proper email format
-   [ ] Replace `authenticateWithUserRefreshToken` usage with `live.refreshAccessToken`
-   [ ] Update import statements to use new export structure
-   [ ] Test authentication flows to ensure compatibility

## Backward Compatibility

The main `authenticate(email, password)` function **remains backward compatible** for basic usage. Most breaking changes affect advanced usage patterns and direct method imports.
