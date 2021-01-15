import {
	getAuthorizeUrl,
	authenticate as LiveAuthenticate,
	refreshAccessToken
} from './core/live';

import {
	EXPERIMENTAL_createDummyWin32DeviceToken,
	exchangeRpsTicketForUserToken,
	exchangeTokensForXSTSToken,
	exchangeTokenForXSTSToken
} from './core/xboxlive';

//#region typings

export type LiveCredentials = {
	email: string;
	password: string;
};

export type LiveAuthResponse = {
	token_type: 'bearer';
	expires_in: number;
	access_token: string;
	refresh_token?: string;
	scope: string;
	user_id: string;
};

export type LivePreAuthMatchedParameters = {
	PPFT: string;
	urlPost: string;
};

export type LivePreAuthResponse = {
	cookie: string;
	matches: LivePreAuthMatchedParameters;
};

export type XBLExchangeRpsTicketResponse = {
	IssueInstant: string;
	NotAfter: string;
	Token: string;
	DisplayClaims: {
		xui: Array<{
			uhs: string;
		}>;
	};
};

export type XBLExchangeTokensOptions = {
	XSTSRelyingParty?: string;
	optionalDisplayClaims?: string[];
	sandboxId?: string;
};

export type XBLExchangeTokensResponse = {
	IssueInstant: string;
	NotAfter: string;
	Token: string;
	DisplayClaims: {
		xui: Array<
			Record<string, string> & {
				xid?: string;
				uhs: string;
			}
		>;
	};
};

export type XBLDummyDeviceTokenResponse = {
	IssueInstant: string;
	NotAfter: string;
	Token: string;
	DisplayClaims: {
		xdi: {
			did: 'F50CDD8781FF4476';
			dcs: string;
		};
	};
};

/**
 * If specified, `titleToken` requires a `deviceToken` pair
 */
export type XBLTokens = {
	userTokens: string[];
	deviceToken?: string;
	titleToken?: string;
};

export type AuthenticateOptions = XBLExchangeTokensOptions & {
	deviceToken?: string;
	titleToken?: string;
	raw?: boolean;
};

//#endregion
//#region public methods

export const authenticate = async (
	email: string,
	password: string,
	options: AuthenticateOptions = {}
) => {
	const credentials = { email, password };
	const liveAuthResponse = await LiveAuthenticate(credentials);
	const { access_token: RpsTicket } = liveAuthResponse;

	const userTokenResponse = await exchangeRpsTicketForUserToken(RpsTicket);
	const XSTSResponse = await exchangeTokensForXSTSToken(
		{
			userTokens: [userTokenResponse.Token],
			deviceToken: options.deviceToken,
			titleToken: options.titleToken
		},
		{
			XSTSRelyingParty: options.XSTSRelyingParty,
			optionalDisplayClaims: options.optionalDisplayClaims,
			sandboxId: options.sandboxId
		}
	);

	if (options.raw !== true) {
		return {
			xuid: XSTSResponse.DisplayClaims.xui[0].xid || null,
			user_hash: XSTSResponse.DisplayClaims.xui[0].uhs,
			xsts_token: XSTSResponse.Token,
			expires_on: XSTSResponse.NotAfter
		};
	}

	return {
		'login.live.com': liveAuthResponse,
		'user.auth.xboxlive.com': userTokenResponse,
		'xsts.auth.xboxlive.com': XSTSResponse
	};
};

export const live = {
	getAuthorizeUrl,
	authenticate: LiveAuthenticate,
	refreshAccessToken
};

export const xbl = {
	EXPERIMENTAL_createDummyWin32DeviceToken,
	exchangeRpsTicketForUserToken,
	exchangeTokensForXSTSToken,
	exchangeTokenForXSTSToken
};

//#endregion
