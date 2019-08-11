# Xbox Live - Auth

Simple Xbox Live authentication module.

### Installation
```
$ npm install @xboxreplay/xboxlive-auth
```

### Clone
```
$ git clone https://github.com/XboxReplay/xboxlive-auth.git
```

### Build
```
$ npm run build
```

### Test
```
$ npm run test
```

### Usage example

```
import XboxLiveAuth from '@xboxreplay/xboxlive-auth';

XboxLiveAuth.authenticate('xbl-account@domain.com', '*********')
    .then(console.info)
    .catch(console.error);
```
**Sample response:**
```
{
    "userXUID": "2535465515082324", // May be null
    "userHash": "1890318589445465111",
    "XSTSToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoiYiJ9.iMrN7XT_jCcRXWKwUo_JPWeRO75dBOGTzerAO",
    "expiresOn": "2019-04-05T05:43:32.6275675Z"
}
```

### Parameters

-   email {string}
-   password {string}
-   options {Object?}
    -   XSTSRelyingParty {string?} - Default: http://xboxlive.com

### How to interact with the Xbox Live API?

The best way to interact with the API is to use our [XboxLive-API](https://github.com/XboxReplay/xboxlive-api) module which has the **XboxLive-Auth** as a peer dependency. That said, a cURL example is available below.

**Sample call:**
```
$ curl 'https://profile.xboxlive.com/users/gt(Zeny%20IC)/profile/settings?settings=Gamerscore' \
    -H 'Authorization: XBL3.0 x={userHash};{XSTSToken}' \
    -H 'x-xbl-contract-version: 2'
```

**Sample response:**

```
{
    "profileUsers": [
        {
            "id": "2535465515082324",
            "hostId": "2535465515082324",
            "settings": [
                {
                    "id": "Gamerscore",
                    "value": "6270"
                }
            ],
            "isSponsoredUser": false
        }
    ]
}
```

### What's a "XSTSRelyingParty"?

The "XSTSRelyingParty" is a domain configured by Microsoft and / or its partners to create a XSTS token which is intended to be used for a targeted service. For instance, if you use `http://beam.pro/` you will be able to interact with the private **Mixer.com** API. A partial list can be found here: https://title.mgt.xboxlive.com/titles/default/endpoints?type=4.

### What about 2FA (Two-factor authentication)?

2FA is not supported by this module which may cause authentication issues. Please disable it for the used account or create a dummy one with Xbox LIVE capabalities. Of course, a Gold account is not required.

### I'm unable to connect even with valid credentials and no 2FA

Take a look at https://account.live.com/activity. Recent activities (from unknown location, as a production server) may be blocked.
