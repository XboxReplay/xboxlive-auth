# Authenticate

### Method: authenticate

```javascript
import { authenticate } from '@xboxreplay/xboxlive-auth';

authenticate('live@domain.com', 'password')
	.then(console.info)
	.catch(console.error);
```

##### Arguments

-   email {string} - Account email
-   password {string} - Account password
-   options {object=} - Additional options
    -   XSTSRelyingParty {string=} - `http://xboxlive.com` - Targeted [RelyingParty](04-RelyingParty.md#relyingparty)
    -   optionalDisplayClaims {string[]=} - `[]` - Optional display claims to be returned based on the used [RelyingParty](04-RelyingParty.md#optional-display-claims)
    -   sandboxId {string=} - `RETAIL` - Targeted sandbox
    -   deviceToken {string=} - Optional device token
    -   titleToken {string=} - Optional title token
    -   raw {boolean} - `false` - If set to `true` the returned response will include each exchange based on called domains

##### Sample Response

```javascript
{
    "xuid": "2584878536129841", // May be null based on the specified "RelyingParty"
    "user_hash": "3218841136841218711",
    "xsts_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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
    "device.auth.xboxlive.com": {
        "IssueInstant": "2021-01-14T18:55:20.0082007Z",
        "NotAfter": "2021-01-15T10:55:20.0082007Z",
        "Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "DisplayClaims": {
            "xdi": {
                "did": "F50CDD8781FF4476",
                "dcs": "87411"
            }
        }
    },
    "xsts.auth.xboxlive.com": {
        "IssueInstant": "2021-01-14T18:55:20.0082007Z",
        "NotAfter": "2021-01-15T10:55:20.0082007Z",
        "Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "DisplayClaims": {
            "xui": [{
                "gtg": "Major Nelson",
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
