# Methods

List of all available methods exposed by the library.

## Common

### Method: authenticate

Authenticate the user.

-   [See dedicated documentation](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/01-Authenticate.md#method-authenticate)

### Method: authenticateWithUserCredentials

Clone of the initial `authenticate` method.

### Method: authenticateWithUserRefreshToken

Authenticate the user with its `refresh_token`.

-   [See dedicated documentation](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/01-Authenticate.md#method-authenticatewithuserrefreshtoken)

### Method: preAuth

Pre-authentication request used to retrieve mandatory authentication parameters.

```javascript
import { live } from '@xboxreplay/xboxlive-auth';

const preAuthResponse = await live.preAuth();
console.log(preAuthResponse);
```

##### Arguments

-   options {object=}
    -   clientId {string=} - `000000004C12AE6F`
    -   scope {string=} - `service::user.auth.xboxlive.com::MBI_SSL`
    -   responseType {token|code=} - `token`
    -   redirectUri {string=} - `https://login.live.com/oauth20_desktop.srf`

##### Sample Response

```javascript
{
	"cookie": "MSA=...; X=...; ...",
	"matches": {
		"PPFT": "abcde...",
		"urlPost": "https://login.live.com/..."
	}
}
```

## Namespace: xbl

### Method: exchangeRpsTicketForUserToken

Exchange returned "RpsTicket" from login.live.com authorization process.

```javascript
import { xbl } from '@xboxreplay/xboxlive-auth';

const loginResponse = {
	token_type: 'bearer',
	expires_in: 86400,
	access_token: 'EwAIA+pvBAAUK...', // RpsTicket
	refresh_token: 'M.R3_BAY...',
	scope: 'service::user.auth.xboxlive.com::MBI_SSL',
	user_id: '123abc...'
};

const rpsTicket = loginResponse.access_token;
const userTokenResponse = await xbl.exchangeRpsTicketForUserToken(
	rpsTicket,
	'd' // Required if using a custom Azure applications
);

console.info(userTokenResponse);
```

##### Arguments

-   rpsTicket {string}
-   preable {d|t=} - `t` - Use `d` for custom Azure applications
-   additionalHeaders {object=} - `{}` - Additional headers if required, can be used to override default ones

##### Sample Response

```javascript
{
	"IssueInstant": "2021-01-14T18:55:20.0082007Z",
	"NotAfter": "2021-01-15T10:55:20.0082007Z",
	"Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"DisplayClaims": {
		"xui": [{ "uhs": "3218841136841218711" }]
	}
}
```

### Method: exchangeTokenForXSTSToken

Exchange returned token by the `exchangeRpsTicketForUserToken` method.

```javascript
import { xbl } from '@xboxreplay/xboxlive-auth';

const userTokenExchangeResponse = {
	IssueInstant: '2021-01-14T18:55:20.0082007Z',
	NotAfter: '2021-01-15T10:55:20.0082007Z',
	Token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	DisplayClaims: {
		xui: [{ uhs: '3218841136841218711' }]
	}
};

const userToken = userTokenExchangeResponse.Token;
const XSTSTokenResponse = await xbl.exchangeTokenForXSTSToken(userToken);

console.info(XSTSTokenResponse);
```

##### Arguments

-   userToken {string}
-   options {object=}
    -   XSTSRelyingParty {string=} - `http://xboxlive.com` - Targeted [RelyingParty](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/04-RelyingParty.md#relyingparty)
    -   optionalDisplayClaims {string[]=} - `[]` - Optional display claims to be returned based on the used [RelyingParty](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/04-RelyingParty.md#optional-display-claims)
    -   sandboxId {string=} - `RETAIL` - Targeted sandbox ID
-   additionalHeaders {object=} - `{}` - Additional headers if required, can be used to override default ones

##### Sample Response

```javascript
{
	"IssueInstant": "2021-01-14T18:55:20.0082007Z",
	"NotAfter": "2021-01-15T10:55:20.0082007Z",
	"Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"DisplayClaims": {
		"xui": [{
			"gtg": "Zeny IC",
			"xid": "2584878536129841",
			"uhs": "3218841136841218711"
			"agg": "Adult",
			"usr" "234",
			"utr": "190",
			"prv": "185 186 187 188 191 192 ..."
		}]
	}
}
```

### Method: exchangeTokensForXSTSToken

Exchange returned token by the `exchangeRpsTicketForUserToken` method. This method also allows you to specify your own device token and title token.

```javascript
import { xbl } from '@xboxreplay/xboxlive-auth';

const userTokenExchangeResponse = {
	IssueInstant: '2021-01-14T18:55:20.0082007Z',
	NotAfter: '2021-01-15T10:55:20.0082007Z',
	Token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	DisplayClaims: {
		xui: [{ uhs: '3218841136841218711' }]
	}
};

const deviceToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const titleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const userToken = userTokenExchangeResponse.Token;
const XSTSTokenResponse = await xbl.exchangeTokensForXSTSToken({
	userTokens: [userToken],
	deviceToken,
	titleToken
});

console.info(XSTSTokenResponse);
```

##### Arguments

-   tokens {object}
    -   userTokens {string[]}
    -   deviceToken {string=}
    -   titleToken {string=}
-   options {object=}
    -   XSTSRelyingParty {string=} - `http://xboxlive.com` - Targeted [RelyingParty](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/04-RelyingParty.md#relyingparty)
    -   optionalDisplayClaims {string[]=} - `[]` - Optional display claims to be returned based on the used [RelyingParty](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/04-RelyingParty.md#optional-display-claims)
    -   sandboxId {string=} - `RETAIL` - Targeted sandbox ID
-   additionalHeaders {object=} - `{}` - Additional headers if required, can be used to override default ones

##### Sample Response

```javascript
{
	"IssueInstant": "2021-01-14T18:55:20.0082007Z",
	"NotAfter": "2021-01-15T10:55:20.0082007Z",
	"Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"DisplayClaims": {
		"xui": [{
			"gtg": "Zeny IC",
			"xid": "2584878536129841",
			"uhs": "3218841136841218711"
			"agg": "Adult",
			"usr" "234",
			"utr": "190",
			"prv": "185 186 187 188 191 192 ..."
		}]
	}
}
```

### Method: EXPERIMENTAL_createDummyWin32DeviceToken

Create a dummy **Win32** `deviceToken` that can be used during the authentication process.

-   [See dedicated documentation](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/03-Experimental.md#method-experimental_createdummywin32devicetoken)

## Namespace: live

### Method: getAuthorizeUrl

Returns `login.live.com` authorize URL.

```javascript
import { live } from '@xboxreplay/xboxlive-auth';

const authorizeUrl = live.getAuthorizeUrl();

console.info(authorizeUrl);
```

##### Arguments

-   clientId {string=} - `000000004C12AE6F`
-   scope {string=} - `service::user.auth.xboxlive.com::MBI_SSL`
-   responseType {token|code=} - `token`
-   redirectUri {string=} - `https://login.live.com/oauth20_desktop.srf`

##### Sample Response

```
https://login.live.com/oauth20_authorize.srf?client_id=000000004C12AE6F&redirect_uri=https://login.live.com/oauth20_desktop.srf&response_type=token&scope=service::user.auth.xboxlive.com::MBI_SSL
```

### Method: refreshAccessToken

Refresh an expired token.

```javascript
import { live } from '@xboxreplay/xboxlive-auth';

const freshTokens = await live.refreshAccessToken('M.R3_B.xxxxxx');

console.info(freshTokens);
```

##### Arguments

-   refreshToken {string}
-   clientId {string=} - `000000004C12AE6F`
-   scope {string=} - `service::user.auth.xboxlive.com::MBI_SSL`
-   clientSecret {string=} - `undefined`

##### Sample Response

```javascript
{
	"token_type": "bearer",
	"expires_in": 86400,
	"access_token": "EwAIA+pvBAAUK...", // RpsTicket
	"refresh_token": "M.R3_BAY...",
	"scope": "service::user.auth.xboxlive.com::MBI_SSL",
	"user_id": "123abc..."
}
```

### Method: authenticate

Authenticate with credentials.

```javascript
import { live } from '@xboxreplay/xboxlive-auth';

const authResponse = await live.authenticate({
	email: 'account@domain.com',
	password: 'password'
});

console.info(authResponse);
```

##### Arguments

-   credentials {object}
    -   email {string}
    -   password {string}

##### Sample Response

```javascript
{
	"token_type": "bearer",
	"expires_in": 86400,
	"access_token": "EwAIA+pvBAAUK...", // RpsTicket
	"refresh_token": "M.R3_BAY...",
	"scope": "service::user.auth.xboxlive.com::MBI_SSL",
	"user_id": "123abc..."
}
```
