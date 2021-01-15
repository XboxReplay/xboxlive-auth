# Experimental methods

Listed experimental methods are, as specified, experimental. They may break, be removed or do not act as described.

### Method: EXPERIMENTAL_createDummyWin32DeviceToken

Create a dummy **Win32** `deviceToken` that can be used during the authentication process.

```javascript
import { EXPERIMENTAL_createDummyWin32DeviceToken } from '@xboxreplay/xboxlive-auth';

EXPERIMENTAL_createDummyWin32DeviceToken()
	.then(console.log)
	.catch(console.error);
```

##### Sample Response

```javascript
{
    "IssueInstant": "2021-01-14T18:55:20.0082007Z",
    "NotAfter": "2021-01-15T10:55:20.0082007Z",
    "Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "DisplayClaims": {
        "xdi": {
            "did": "F50CDD8781FF4476",
            "dcs": "87411"
        }
    }
}
```
