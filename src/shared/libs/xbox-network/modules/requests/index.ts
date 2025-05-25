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

import XSAPIFetchClient from '../../../../classes/Fetch/Clients/XSAPIFetchClient';
import { config } from '../../config';

import type {
	Preamble,
	XNETTokens,
	XNETExchangeTokensOptions,
	XBLExchangeTokensResponse,
	XNETExchangeRpsTicketResponse,
} from './requests.types';

export const exchangeRpsTicketForUserToken = async (
	rpsTicket: string,
	preamble: Preamble = 't',
	additionalHeaders: Record<string, string> = {}
): Promise<XNETExchangeRpsTicketResponse> => {
	const match = rpsTicket.match(/^([d|t]=)/g);
	if (match === null) {
		rpsTicket = `${preamble}=${rpsTicket}`;
	}

	return XSAPIFetchClient.post<XNETExchangeRpsTicketResponse>(
		config.urls.userAuthenticate,
		{
			RelyingParty: 'http://auth.xboxlive.com',
			TokenType: 'JWT',
			Properties: {
				AuthMethod: 'RPS',
				SiteName: 'user.auth.xboxlive.com',
				RpsTicket: rpsTicket,
			},
		},
		{ options: { additionalHeaders } }
	).then(res => res.data);
};

export const exchangeTokensForXSTSToken = async (
	tokens: XNETTokens,
	options: XNETExchangeTokensOptions = {},
	additionalHeaders: Record<string, string> = {}
): Promise<XBLExchangeTokensResponse> => {
	return XSAPIFetchClient.post<XNETExchangeRpsTicketResponse>(
		config.urls.XSTSAuthorize,
		{
			RelyingParty: options.XSTSRelyingParty || config.relyingParties.XBOX_LIVE,
			TokenType: 'JWT',
			Properties: {
				UserTokens: tokens.userTokens,
				DeviceToken: tokens.deviceToken,
				TitleToken: tokens.titleToken,
				OptionalDisplayClaims: options.optionalDisplayClaims,
				SandboxId: options.sandboxId || config.sandboxIds.RETAIL,
			},
		},
		{ options: { additionalHeaders } }
	).then(res => res.data);
};

export const exchangeTokenForXSTSToken = (
	userToken: string,
	options: XNETExchangeTokensOptions = {},
	additionalHeaders: Record<string, string> = {}
) => exchangeTokensForXSTSToken({ userTokens: [userToken] }, options, additionalHeaders);
