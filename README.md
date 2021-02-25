# @xboxreplay/xboxlive-auth

A light but advanced Xbox Live authentication module with [OAuth2.0](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/02-Custom_Azure_Application.md) and [Electron](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/examples/electron-app) support.

## Installation

```shell
$ npm install @xboxreplay/xboxlive-auth@4.0.0-beta.5
```

## Usage Example

```javascript
import { authenticate } from '@xboxreplay/xboxlive-auth';

authenticate('name@domain.com', '*********')
	.then(console.info)
	.catch(console.error);
```

##### Sample Response

```javascript
{
    "xuid": "2584878536129841", // May be null based on the specified "RelyingParty"
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
    "expires_on": "2021-04-13T05:43:32.6275675Z"
}
```

## Documentation

-   [Basic authentication](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/01-Authenticate.md)
-   [Use a custom Azure Application (OAuth2.0)](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/02-Custom_Azure_Application.md)
-   [Experimental methods, such as "deviceToken" generation](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/03-Experimental.md)
-   [What's a RelyingParty and how to use it](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/04-RelyingParty.md)
-   [Available methods in this library](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/05-Methods.md)
-   [Known issues and possible workarounds](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/06-Known_Issues.md)
-   [How to deal with unauthorized "AgeGroup" authentication](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/07-Detect_Unauthorized_AgeGroup.md)

## Available Examples

-   [Electron App](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/examples/electron-app)

## How to interact with the Xbox Live API?

The best way to interact with the API is to use our [@xboxreplay/xboxlive-auth](https://github.com/XboxReplay/xboxlive-api) module. That said, a cURL example is available below.

##### Example

```shell
$ curl 'https://profile.xboxlive.com/users/gt(Major%20Nelson)/profile/settings?settings=Gamerscore' \
    -H 'Authorization: XBL3.0 x={userHash};{XSTSToken}' \
    -H 'x-xbl-contract-version: 2'
```

## What about 2FA (Two-factor authentication)?

Exposed `authenticate` and `authenticateWithUserCredentials` methods can not deal with 2FA but a workaround is available with the `authenticateWithUserRefreshToken` one. Please take a look at ["Authenticate" documentation](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/01-Authenticate.md).

## Known Issues

Please refer to the [dedicated documention](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/06-Known_Issues.md).

## Licence

MIT
