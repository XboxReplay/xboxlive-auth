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

import type { LiveAuthResponse } from '../shared/libs/live/modules/requests/requests.types';

import type {
	XNETExchangeTokensResponse,
	XNETExchangeTokensOptions,
	XNETExchangeRpsTicketResponse,
} from '../shared/libs/xbox-network/modules/requests/requests.types';

export type Email = `${string}@${string}.${string}`;
export type AuthenticateOptions = Omit<XNETExchangeTokensOptions, 'deviceToken' | 'titleToken'> & {
	raw?: boolean;
};

export type AuthenticateResponse = {
	xuid: string | null;
	user_hash: string;
	xsts_token: string;
	display_claims: XNETExchangeTokensResponse['DisplayClaims'];
	expires_on: string;
};

export type AuthenticateRawResponse = {
	'login.live.com': LiveAuthResponse;
	'user.auth.xboxlive.com': XNETExchangeRpsTicketResponse;
	'xsts.auth.xboxlive.com': XNETExchangeTokensResponse;
};
