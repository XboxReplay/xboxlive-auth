# Detect Unauthorized "AgeGroup"

As specified in [known issues](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/06-Known_Issues.md), "Child" and "Teen" accounts can not authenticate without a valid "deviceToken". As the exposed method is [experimental](https://github.com/XboxReplay/xboxlive-auth/tree/4.0.0/docs/03-Experimental.md#method-experimental_createdummywin32devicetoken), you may check their `agg` (AgeGroup) before calling the default relying party (`http://xboxlive.com/`) using the `accounts` one (`http://accounts.xboxlive.com`).

### Example

```javascript
import { xbl } from '@xboxreplay/xboxlive-auth';

const userToken = 'CURRENT_USER_TOKEN';
const response = await xbl.exchangeTokenForXSTSToken(userToken, {
	XSTSRelyingParty: 'http://accounts.xboxlive.com'
});

console.info(response);
```

##### Sample Response

```
{
    "IssueInstant": "2021-01-14T18:55:20.0082007Z",
    "NotAfter": "2021-01-15T10:55:20.0082007Z",
    "Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "DisplayClaims": {
        "xui": [{
            "uhs": "3218841136841218711"
            "agg": "Teen" // "Child" | "Teen" | "Adult"
        }]
    }
}
```
