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

import type { config } from '../../config';

type ValueOf<T> = T[keyof T];

export type Preamble = 'd' | 't';

export type XNETTokens = { userTokens: string[] } & (
	| { deviceToken?: string; titleToken?: never }
	| { deviceToken: string; titleToken: string }
);

export type XNETExchangeTokensOptions = Omit<XNETTokens, 'userTokens'> & {
	sandboxId?: ValueOf<(typeof config)['sandboxIds']> | (string & {});
	optionalDisplayClaims?: Array<(typeof config)['displayClaims'][number] | (string & {})>;
	XSTSRelyingParty?: ValueOf<(typeof config)['relyingParties']> | (string & {});
};

export type XNETExchangeRpsTicketResponse = {
	IssueInstant: string;
	NotAfter: string;
	Token: string;
	DisplayClaims: { xui: Array<{ uhs: string }> };
};

export type XNETExchangeTokensResponse = Omit<XNETExchangeRpsTicketResponse, 'DisplayClaims'> & {
	DisplayClaims: { xui: Array<{ xid?: string; uhs: string } & (string & {})> };
};

export type XNETDummyDeviceTokenResponse = {
	IssueInstant: string;
	NotAfter: string;
	Token: string;
	DisplayClaims: {
		xdi: { did: string; dcs: string };
	};
};
