# Known Issues

### I'm unable to connect even with valid credentials and no 2FA

Take a look at https://account.live.com/activity or try to sign in to https://account.xbox.com/Profile from your browser. Recent activities (from unknown location such a production server) may be blocked.

### Still not working?

"Child" and "Teen" accounts (AgeGroup / "agg") may not be able to authenticate. This restriction **could** be bypassed by using the `EXPERIMENTAL_createDummyWin32DeviceToken` method by adding returned device token to the used authentication method. Please refer to the [dedicated documentation](https://github.com/XboxReplay/xboxlive-auth/blob/master/docs/03-Experimental.md#method-experimental_createdummywin32devicetoken) before using it.

```javascript
import { xbl, authenticate } from '@xboxreplay/xboxlive-auth';

const deviceTokenResponse = await xbl.EXPERIMENTAL_createDummyWin32DeviceToken();
const { Token: deviceToken } = deviceTokenResponse;

await authenticate('name@domain.com', 'password', { deviceToken })
	.then(console.info)
	.catch(console.error);

// Alternative for custom Azure applications

const userToken = 'RETURNED_USER_TOKEN';
const deviceTokenResponse = await xbl.EXPERIMENTAL_createDummyWin32DeviceToken();
const { Token: deviceToken } = deviceTokenResponse;

await xbl
	.exchangeTokensForXSTSToken({
		userTokens: [userToken],
		deviceToken
	})
	.then(console.info)
	.catch(console.error);
```
