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

import FetchClient from './shared/classes/Fetch/Clients';
import XSAPIFetchClient from './shared/classes/Fetch/Clients/XSAPIFetchClient';
import { createDummyWin32DeviceToken } from './shared/libs/xbox-network/modules/requests/experimental';
import type { XNETTokens } from './shared/libs/xbox-network/modules/requests/requests.types';
import type { AuthenticateOptions, Email } from './types/lib.types';

import {
	exchangeRpsTicketForUserToken,
	exchangeTokenForXSTSToken,
	exchangeTokensForXSTSToken,
} from './shared/libs/xbox-network/modules/requests';

import {
	preAuth,
	getAuthorizeUrl,
	refreshAccessToken,
	exchangeCodeForAccessToken,
	authenticate as authenticateWithCredentials,
} from './shared/libs/live/modules/requests';

const authenticate = async (email: Email, password: string, options: AuthenticateOptions = {}) => {
	const authResponse = await authenticateWithCredentials({ email, password });
	const userTokenResponse = await exchangeRpsTicketForUserToken(authResponse.access_token, 't');
	const reqTokens: XNETTokens = { userTokens: [userTokenResponse.Token] };

	if (options.deviceToken !== void 0) {
		reqTokens.deviceToken = options.deviceToken;
		if (options.titleToken !== void 0) {
			// @ts-expect-error assign title token
			reqTokens.titleToken = options.titleToken;
		}
	}

	const XSTSResponse = await exchangeTokensForXSTSToken(reqTokens, {
		XSTSRelyingParty: options.XSTSRelyingParty,
		optionalDisplayClaims: options.optionalDisplayClaims,
		sandboxId: options.sandboxId,
	});

	if (options.raw === true) {
		return {
			'login.live.com': authResponse,
			'user.auth.xboxlive.com': userTokenResponse,
			'xsts.auth.xboxlive.com': XSTSResponse,
		};
	}

	return {
		xuid: XSTSResponse.DisplayClaims.xui[0]!.xid || null,
		user_hash: XSTSResponse.DisplayClaims.xui[0]!.uhs,
		xsts_token: XSTSResponse.Token,
		display_claims: XSTSResponse.DisplayClaims,
		expires_on: XSTSResponse.NotAfter,
	};
};

const namespaces = {
	live: {
		preAuth,
		getAuthorizeUrl,
		refreshAccessToken,
		authenticateWithCredentials,
		exchangeCodeForAccessToken,
	},
	xnet: {
		exchangeTokenForXSTSToken,
		exchangeTokensForXSTSToken,
		exchangeCodeForAccessToken,
		exchangeRpsTicketForUserToken,
		experimental: {
			createDummyWin32DeviceToken,
		},
	},
	httpClient: {
		Base: FetchClient,
		XSAPI: XSAPIFetchClient,
	},
};

export { authenticate };
export default namespaces;
