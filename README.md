# @xboxreplay/xboxlive-auth

A light but advanced Xbox Live authentication module with OAuth2.0 support.

### Installation

```shell
$ npm install @xboxreplay/xboxlive-auth
```

### Usage Example

```javascript
import xboxliveAuth from '@xboxreplay/xboxlive-auth';

xboxliveAuth
	.authenticate('xbl-account@your-domain.com', '*********')
	.then(console.info)
	.catch(console.error);
```

### Documentation

Please refer to the [available documention](docs) in the [repository](https://github.com/XboxReplay/xboxlive-auth).

### Available examples

-   Electron app
    -   Use `@xboxreplay/xboxlive-auth` module inside an Electron app.

### How to interact with the Xbox Live API?

The best way to interact with the API is to use our [XboxLive-API](https://github.com/XboxReplay/xboxlive-api) module. That said, a cURL example is available below.

**Sample call:**

```shell
$ curl 'https://profile.xboxlive.com/users/gt(Major%20Nelson)/profile/settings?settings=Gamerscore' \
    -H 'Authorization: XBL3.0 x={userHash};{XSTSToken}' \
    -H 'x-xbl-contract-version: 2'
```

### What about 2FA (Two-factor authentication)?

2FA is not supported by this module which may cause authentication issues. Please disable it for the used account or create a dummy one with Xbox LIVE capabalities. Of course, a Gold account is not required. Please note that Electron apps are not impacted by this issue.
