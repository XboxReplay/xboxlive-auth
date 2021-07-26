# RelyingParty

The **RelyingParty** (used as `XSTSRelyingParty` in this library) is a trusted URL configured by Microsoft and / or its partners to create a XSTS token which is intended to be used for a targeted service. For instance, if you use `rp://playfabapi.com/` you will be able to interact with the official Playfab.com API. A partial list can be found here: https://title.mgt.xboxlive.com/titles/default/endpoints?type=1.

Please note that each service may have its own parties such as **Minecraft** (`rp://api.minecraftservices.com/`), **Sea Of Thieves** (`http://athena.prod.msrareservices.com/`) or **Gears 5** (`http://xsts.gearsofwar.net/`).

### Usage Example

```javascript
import { authenticate } from '@xboxreplay/xboxlive-auth';

const authWithCustomRP = await authenticate('name@domain.com', 'password', {
	XSTSRelyingParty: 'http://xsts.gearsofwar.net/'
});

console.info(authWithCustomRP);
```

### Optional Display Claims

Some parties may support additional claims such as `mgt` (ModerGamertag), `umg` (UniqueModernGamertag) or `mgs` (ModerGamertagSuffix) which are not returned by default. If required, you can retrieve them via the `optionalDisplayClaims` option.

```javascript
import { authenticate } from '@xboxreplay/xboxlive-auth';

const authWithOptionalDisplayClaims = await authenticate(
	'name@domain.com',
	'password',
	{ optionalDisplayClaims: ['mgt', 'umg'] }
);

console.info(authWithOptionalDisplayClaims);
```
