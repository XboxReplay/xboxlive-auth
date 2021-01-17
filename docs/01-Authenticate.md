# Authenticate

### Method: authenticate

Authenticate the user.

```javascript
import { authenticate } from '@xboxreplay/xboxlive-auth';

authenticate('name@domain.com', 'password')
	.then(console.info)
	.catch(console.error);
```

##### Arguments

-   email {string}
-   password {string}
-   options {object=}
    -   XSTSRelyingParty {string=} - `http://xboxlive.com` - Targeted [RelyingParty](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/04-RelyingParty.md#relyingparty)
    -   optionalDisplayClaims {string[]=} - `[]` - Optional display claims to be returned based on the used [RelyingParty](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/04-RelyingParty.md#optional-display-claims)
    -   sandboxId {string=} - `RETAIL` - Targeted sandbox ID
    -   deviceToken {string=} - Optional device token
    -   titleToken {string=} - Optional title token
    -   raw {boolean=} - `false` - If set to `true` the returned response will include each exchange based on called domains

##### Sample Response

```javascript
{
    "xuid": "2584878536129841", // May be null based on the specified "RelyingParty"
    "user_hash": "3218841136841218711",
    "xsts_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "display_claims": {
        "gtg": "Zeny IC",
        "xid": "2584878536129841",
        "uhs": "3218841136841218711"
        "agg": "Adult",
        "usr" "234",
        "utr": "190",
        "prv": "185 186 187 188 191 192 ..."
    },
    "expires_on": "2021-04-13T05:43:32.6275675Z"
}
```

##### Sample Response (Raw)

```javascript
{
    "login.live.com": {
        "token_type": "bearer",
        "expires_in": 86400,
        "access_token": "EwAIA+pvBAAUK...", // RpsTicket
        "refresh_token": "M.R3_BAY...",
        "scope": "service::user.auth.xboxlive.com::MBI_SSL",
        "user_id": "123abc..."
    },
    "user.auth.xboxlive.com": {
        "IssueInstant": "2021-01-14T18:55:20.0082007Z",
        "NotAfter": "2021-01-15T10:55:20.0082007Z",
        "Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "DisplayClaims": {
            "xui": [{ "uhs": "3218841136841218711" }]
        }
    },
    "xsts.auth.xboxlive.com": {
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
}
```

### Method: authenticateWithUserCredentials

Clone of the initial `authenticate` method.

### Method: authenticateWithUserRefreshToken

Authenticate the user with its `refresh_token`. This method has been designed to prevent you to deal with 2FA and other issues that could occur outside your local machine.

The easiest way to get your `refresh_token` is to authenticate yourself via [login.live.com](https://login.live.com/oauth20_authorize.srf?client_id=0000000048093EE3&redirect_uri=https://login.live.com/oauth20_desktop.srf&response_type=token&display=touch&scope=service::user.auth.xboxlive.com::MBI_SSL) and grab it from the returned hash parameter (do not forget to decode it with `decodeURIComponent` function).

Caution, `authenticateWithUserRefreshToken` acts as a closure which means that the specified "refreshToken" will be overridden by the returned one.

```javascript
import { authenticateWithUserRefreshToken } from '@xboxreplay/xboxlive-auth';

xbl.authenticateWithUserRefreshToken('M.R3_B...')
	.then(console.log)
	.catch(console.error);
```

##### Arguments

-   refreshToken {string}
-   refreshOptions {object|null=} - `null`
    -   clientId {string=} - `000000004C12AE6F`
    -   scope {string=} - `service::user.auth.xboxlive.com::MBI_SSL`
    -   preablme {d|t=} - `t` - Use `d` for custom Azure applications
    -   clientSecret {string=} - `undefined`
-   options {object=} - `{}`
    -   XSTSRelyingParty {string=} - `http://xboxlive.com` - Targeted [RelyingParty](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/04-RelyingParty.md#relyingparty)
    -   optionalDisplayClaims {string[]=} - `[]` - Optional display claims to be returned based on the used [RelyingParty](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/04-RelyingParty.md#optional-display-claims)
    -   sandboxId {string=} - `RETAIL` - Targeted sandbox ID
    -   deviceToken {string=} - Optional device token
    -   titleToken {string=} - Optional title token
    -   raw {boolean=} - `false` - If set to `true` the returned response will include each exchange based on called domains

## Detect and authenticate "Child" and "Teen" accounts

Please refer to the [dedicated documentation](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/07-Detect_Unauthorized_AgeGroup.md).
