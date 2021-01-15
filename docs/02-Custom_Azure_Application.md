# Custom Azure Application

This library allows you to create your own **OAuth2.0** flow using a custom Azure application and let your users to signin with their Microsoft account and return their Xbox Live tokens. As you may know there is **no public documentations** as this authentication process is technically reserved for approved Microsoft's **partners** as it may compromise user's privacy. Please use it with caution and don't be a... You got it.

### Steps

-   Register your application in [Azure Active Directory](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
-   Select "Personal Microsoft accounts only" under supported account types
-   Add your own `redirect_uri` a Redirect URI of type "Web" (requires a HTTPS server)
    -   "https://login.live.com/oauth20_desktop.srf" can used for Electron applications
-   Create a new client secret

### Usage with "code" exchange

First of all you must redirect your user to the `login.live.com` authentication page. This library exposes a method which will compute this URL for you.

```javascript
import { live } from '@xboxreplay/xboxlive-auth';

live.getAuthorizeUrl(
	'YOUR_CLIENT_ID',
	'XboxLive.signin XboxLive.offline_access',
	'code',
	'YOUR_REDIRECT_URI'
);
```

Once authenticated, the user will be redirect to the specified `redirectUri` which will include a `code` in its query parameters that you'll use to request an access token. Please refer to this documentation for further information: https://docs.microsoft.com/en-us/advertising/guides/authentication-oauth-live-connect?view=bingads-13#request-accesstoken

```javascript
import { live, xbl } from '@xboxreplay/xboxlive-auth';

const code = 'RETURNED_CODE';
const exchangeCodeResponse = await live.exchangeCodeForAccessToken(code);

const rpsTicket = exchangeCodeResponse.access_token;
const refreshToken = exchangeCodeResponse.refresh_token; // May be undefined

const expiresOn = new Date(
	Date.now() + exchangeCodeResponse.expires_in * 1000
).toISOString();

const userTokenResponse = await xbl.exchangeRpsTicketForUserToken(
	rpsTicket,
	'd' // Required for custom Azure applications
);

await xbl
	.exchangeTokenForXSTSToken(userTokenResponse.Token)
	.then(console.info)
	.catch(console.error);

// Handle expiration

const hasExpired = new Date() >= new Date(expiresOn);

if (hasExpired === true && !!refreshToken) {
	const freshTokens = await live.refreshAccessToken(
		refreshToken,
		'YOUR_CLIENT_ID',
		'XboxLive.signin XboxLive.offline_access',
		'YOUR_CLIENT_SECRET'
	);

	console.info(freshTokens);
}
```
