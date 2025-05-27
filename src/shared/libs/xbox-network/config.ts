/**
 * Copyright 2025 Alexis Bize
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const config = {
	urls: {
		deviceAuthenticate: 'https://device.auth.xboxlive.com/device/authenticate',
		titleAuthenticate: 'https://title.auth.xboxlive.com/device/authenticate',
		userAuthenticate: 'https://user.auth.xboxlive.com/user/authenticate',
		XSTSAuthorize: 'https://xsts.auth.xboxlive.com/xsts/authorize',
	},
	sandboxIds: {
		RETAIL: 'RETAIL',
		XDKS_1: 'XDKS.1', // DevKit
	},
	relyingParties: {
		ACCOUNTS: 'http://accounts.xboxlive.com',
		ATTESTATION: 'http://attestation.xboxlive.com',
		BANNING: 'http://banning.xboxlive.com',
		DEVICE_MGT: 'http://device.mgt.xboxlive.com',
		EVENTS: 'http://events.xboxlive.com',
		EXPERIMENTATION: 'http://experimentation.xboxlive.com/',
		GAME_SERVICES: 'https://gameservices.xboxlive.com/',
		INSTANCE_MGT: 'http://instance.mgt.xboxlive.com',
		LICENSING: 'http://licensing.xboxlive.com',
		MP_MS: 'http://mp.microsoft.com/',
		PLAYFAB: 'http://playfab.xboxlive.com/',
		SISU: 'http://sisu.xboxlive.com/',
		STREAMING: 'rp://streaming.xboxlive.com/',
		UNLOCK_DEVICE: 'http://unlock.device.mgt.xboxlive.com',
		UPDATE: 'http://update.xboxlive.com',
		UX_SERVICES: 'http://uxservices.xboxlive.com',
		XBOX_LIVE: 'http://xboxlive.com',
		XDES: 'http://xdes.xboxlive.com/',
		XFLIGHT: 'http://xflight.xboxlive.com/',
		XKMS: 'http://xkms.xboxlive.com',
		XLINK: 'http://xlink.xboxlive.com',
	},
	displayClaims: ['gtg', 'xid', 'uhs', 'agg', 'usr', 'utr', 'prv', 'mgt', 'umg', 'mgs'],
};

export { config };
