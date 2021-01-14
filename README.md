# @xboxreplay/xboxlive-auth

A light Xbox Live authentication module (Server + Electron only).

### Installation

```shell
$ npm install @xboxreplay/xboxlive-auth
```

### Usage example

```javascript
import xboxliveAuth from '@xboxreplay/xboxlive-auth';

xboxliveAuth
	.authenticate('xbl-account@your-domain.com', '*********')
	.then(console.info)
	.catch(console.error);
```

**Sample response:**

```json
{
	"live": {
		"token_type": "bearer",
		"expires_in": 86400,
		"access_token": "EwAIA+pvBAAUKxxxxxx",
		"refresh_token": "M.R3_BAY.xxxxxx",
		"scope": "service::user.auth.xboxlive.com::MBI_SSL",
		"user_id": "xxxxxx"
	},
	"xboxlive": {
		"IssueInstant": "2021-01-14T18:55:20.0082007Z",
		"NotAfter": "2021-01-15T10:55:20.0082007Z",
		"Token": "eyJlbmMiOiJBMTIxxxxxx", // XSTSToken
		"DisplayClaims": {
			"xui": [
				{
					"gtg": "Major Nelson",
					"xid": "273172xxxxxx",
					"uhs": "304328xxxxxx", // userHash
					"agg": "Adult",
					"usr": "234",
					"utr": "190",
					"prv": "185 186 187 188 191 192"
				}
			]
		}
	}
}
```

### How to interact with the Xbox Live API?

The best way to interact with the API is to use our [XboxLive-API](https://github.com/XboxReplay/xboxlive-api) module. That said, a cURL example is available below.

**Sample call:**

```shell
$ curl 'https://profile.xboxlive.com/users/gt(Major%20Nelson)/profile/settings?settings=Gamerscore' \
    -H 'Authorization: XBL3.0 x={userHash};{XSTSToken}' \
    -H 'x-xbl-contract-version: 2'
```

**Sample response:**

```javascript
{
    "profileUsers": [
        {
            "id": "2584878536129841",
            "hostId": "2584878536129841",
            "settings": [
                {
                    "id": "Gamerscore",
                    "value": "911540"
                }
            ],
            "isSponsoredUser": false
        }
    ]
}
```

### Available examples

-   Electron app
    -   Use `@xboxreplay/xboxlive-auth` module inside an Electron app.

### What's a "XSTSRelyingParty"?

The "XSTSRelyingParty" is a domain configured by Microsoft and / or its partners to create a XSTS token which is intended to be used for a targeted service. For instance, if you use `http://playfab.xboxlive.com/` you will be able to interact with the official **Playfab.com** API. A partial list can be found here: https://title.mgt.xboxlive.com/titles/default/endpoints?type=1.

### What about 2FA (Two-factor authentication)?

2FA is not supported by this module which may cause authentication issues. Please disable it for the used account or create a dummy one with Xbox LIVE capabalities. Of course, a Gold account is not required. Please note that Electron apps are not impacted by this issue (see examples).

### I'm unable to connect even with valid credentials and no 2FA

Take a look at https://account.live.com/activity or try to sign in to https://account.xbox.com/Profile from your browser. Recent activities (from unknown location, as a production server) may be blocked.
