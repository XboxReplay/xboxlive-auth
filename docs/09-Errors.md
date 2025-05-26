# Error Handling

This document covers the custom error system used throughout the Xbox Network authentication library, including error types, handling patterns, and debugging techniques.

## Error Hierarchy

The library uses a structured exception system based on `XRBaseException`:

```
XRBaseException (Base class)
├── XRFetchClientException (HTTP/Network errors)
├── XRLiveLibraryException (Microsoft Live authentication errors)
```

## XRBaseException

The base exception class that all other errors extend. It provides structured error data and attributes.

### Properties

```typescript
class XRBaseException<TAttributes> extends Error {
	public readonly data: ErrorData<TAttributes>;
	public message: string;
	public name: string;
	public stack?: string;
}
```

### Basic Usage

```typescript
import { authenticate } from '@xboxreplay/xboxlive-auth';

try {
	const result = await authenticate('user@example.com', 'password');
} catch (error) {
	if (error instanceof XRBaseException) {
		console.log('Error name:', error.name);
		console.log('Error message:', error.message);
		console.log('Error data:', error.data);
		console.log('Error attributes:', error.getAttributes());
	}
}
```

### Methods

#### getAttributes()

Returns the error attributes containing additional context:

```typescript
const attributes = error.getAttributes();
console.log('Error code:', attributes.code);
console.log('Extra data:', attributes.extra);
```

## XRFetchClientException

Thrown for HTTP/network-related errors when making requests to Microsoft services.

### Common Scenarios

-   XSTS token exchange failures
-   Age-restricted account issues
-   Invalid RelyingParty configurations
-   Device token requirements

### Error Codes

-   `REQUEST_ERROR` - HTTP request failed (4xx, 5xx responses)
-   `NETWORK_ERROR` - Network connectivity issues

## Error StackTrace Example

```javascript
XRFetchClientException: Bad Request
    at Function.fromResponse (/node_modules/@xboxreplay/xboxlive-auth/src/shared/classes/Fetch/Exceptions/XRFetchClientException.ts:51:10)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Function.fetch (/node_modules/@xboxreplay/xboxlive-auth/src/shared/classes/Fetch/index.ts:142:17)
    at async authenticate (/home/xboxreplay/index.ts:58:23) {
  data: {
    attributes: {
      code: 'REQUEST_ERROR',
      extra: {
        url: 'https://xsts.auth.xboxlive.com/xsts/authorize',
        statusCode: 400,
        response: {
          body: '',
          headers: {
            'cache-control': 'no-cache, no-store',
            'content-length': '0',
            date: 'Mon, 25 May 2025 11:11:11 GMT',
            'ms-cv': 'yEz88kl7V0KUY4VBAcxd1w.0',
            'x-content-type-options': 'nosniff',
            'x-xblcorrelationid': '1ff20f87-0001-4d18-1234-6f110526abb9'
          }
        }
      }
    }
  }
}
```

### Example Usage

```typescript
import { XSAPIClient } from '@xboxreplay/xboxlive-auth';

try {
	const response = await XSAPIClient.get('https://profile.xboxlive.com/users/me', {
		options: { XSTSToken: 'invalid_token', userHash: 'hash' },
	});
} catch (error) {
	if (error instanceof XRFetchClientException) {
		const attributes = error.getAttributes();

		console.log('Status Code:', attributes.extra?.statusCode);
		console.log('URL:', attributes.extra?.url);
		console.log('Response Body:', attributes.extra?.response?.body);
		console.log('Response Headers:', attributes.extra?.response?.headers);
	}
}
```

## XRLiveLibraryException

Thrown for Microsoft Live authentication-related errors.

### Common Scenarios

-   Invalid credentials
-   Account restrictions
-   OAuth flow errors
-   Token exchange failures

## Error StackTrace Example

```javascript
XRLiveLibraryException: The authentication has failed
    at authenticate (/node_modules/@xboxreplay/xboxlive-auth/src/shared/libs/live/modules/requests/index.ts:204:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async authenticate (/home/xboxreplay/auth.ts:54:23) {
  data: { attributes: { code: 'INVALID_CREDENTIALS_OR_2FA_ENABLED' } }
}
```

### Example Usage

```typescript
import { live } from '@xboxreplay/xboxlive-auth';

try {
	const result = await live.authenticateWithCredentials({
		email: 'user@example.com',
		password: 'wrong_password',
	});
} catch (error) {
	if (error instanceof XRLiveLibraryException) {
		const attributes = error.getAttributes();

		switch (attributes.code) {
			case 'INVALID_CREDENTIALS_OR_2FA_ENABLED':
				console.log('Invalid username or password');
				break;
			default:
				console.log('Live authentication error:', error.message);
		}
	}
}
```

### Network Issues

```typescript
// Network connectivity problems
try {
	await authenticate('user@example.com', 'password');
} catch (error) {
	if (error instanceof XRFetchClientException) {
		const attributes = error.getAttributes();
		if (attributes.code === 'NETWORK_ERROR') {
			console.log('Check your internet connection');
		}
	}
}
```

## Debugging Tips

### Enable Detailed Error Information

```typescript
// Set NODE_ENV to development for more detailed errors
process.env.NODE_ENV = 'development';

try {
	await authenticate(email, password);
} catch (error) {
	if (error instanceof XRBaseException) {
		console.log('Full error details:', error.toJSON());
		console.log('Original error:', error.getAttributes()._originalError);
		console.log('Original stack:', error.getAttributes()._originalStack);
	}
}
```

## Best Practices

1. **Always handle specific error types** rather than catching all errors generically
2. **Log structured error data** for better debugging and monitoring
3. **Don't expose sensitive information** in error messages or logs
4. **Implement appropriate retry logic** for transient failures
5. **Provide meaningful error messages** to end users
6. **Use error codes** to programmatically handle different error scenarios
7. **Monitor error patterns** to identify systemic issues

## Related Documentation

-   [Known Issues](06-Known_Issues.md) - Common problems and workarounds
-   [Basic Authentication](01-Authenticate.md) - Authentication methods
-   [Available Methods](05-Methods.md) - Complete API reference
-   [Detect Unauthorized AgeGroup](07-Detect_Unauthorized_AgeGroup.md) - Age restriction handling
