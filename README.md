# @xboxreplay/xboxlive-auth

A light Xbox Live authentication module (Server + Electron only).

### Installation

```shell
$ npm install @xboxreplay/xboxlive-auth
```

### Usage example

```javascript
import XboxLiveAuth from '@xboxreplay/xboxlive-auth';

XboxLiveAuth.authenticate('xbl-account@your-domain.com', '*********')
	.then(console.info)
	.catch(console.error);
```

**Sample response:**

```
{
    "xuid": "25848785...", // May be undefined
    "user_hash": "32188411368...",
    "xsts_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_on": "2021-04-13T05:43:32.6275675Z"
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

##### Electron app

Use `@xboxreplay/xboxlive-auth` module inside an Electron app.

### What's a "XSTSRelyingParty"?

The "XSTSRelyingParty" is a domain configured by Microsoft and / or its partners to create a XSTS token which is intended to be used for a targeted service. For instance, if you use `http://playfab.xboxlive.com/` you will be able to interact with the official **Playfab.com** API. A partial list can be found here: https://title.mgt.xboxlive.com/titles/default/endpoints?type=1.

### What about 2FA (Two-factor authentication)?

2FA is not supported by this module which may cause authentication issues. Please disable it for the used account or create a dummy one with Xbox LIVE capabalities. Of course, a Gold account is not required. Please note that Electron apps are not impacted by this issue (see examples).

### I'm unable to connect even with valid credentials and no 2FA

Take a look at https://account.live.com/activity or try to sign in to https://account.xbox.com/Profile from your browser. Recent activities (from unknown location, as a production server) may be blocked.
