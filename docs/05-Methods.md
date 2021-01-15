# Methods

List of all available methods exposed by the library.

## Common

### Method: authenticate

Authenticate the user.

-   [See dedicated documentation](01-Authenticate.md#method-authenticate)

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
-   preable {d|t=} `t`
-   additionalHeaders {object=} `{}` - Additional headers if required, can be used to override default ones

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

### Method: EXPERIMENTAL_createDummyWin32DeviceToken

Create a dummy **Win32** `deviceToken` that can be used during the authentication process.

-   [See dedicated documentation](03-Experimental.md#method-experimental_createdummywin32devicetoken)
