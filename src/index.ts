import {
	preAuth,
	getAuthorizeUrl,
	authenticate as LiveAuthenticate,
	refreshAccessToken,
	exchangeCodeForAccessToken
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

export type LivePreAuthOptions = {
	clientId?: string;
	scope?: string;
	responseType?: 'token' | 'code';
	redirectUri?: string;
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

export type AuthenticateRefreshOptions = {
	clientId?: string;
	clientSecret?: string;
	scope?: string;
	preamble?: 't' | 'd';
};

export type CredentialsAuthenticateInitialResponse = {
	xuid: string | null;
	user_hash: string;
	xsts_token: string;
	display_claims: Record<string, string>;
	expires_on: string;
};

export type CredentialsAuthenticateRawResponse = {
	'login.live.com': LiveAuthResponse;
	'user.auth.xboxlive.com': XBLExchangeRpsTicketResponse;
	'xsts.auth.xboxlive.com': XBLExchangeTokensResponse;
};

export type CredentialsAuthenticateResponse =
	| CredentialsAuthenticateInitialResponse
	| CredentialsAuthenticateRawResponse;

//#endregion
//#region private methods

/**
 * Called after the used authenticate method
 *
 * @param {LiveAuthResponse} liveAuthResponse
 * @param {string} preamble - `t`
 * @param {AuthenticateOptions=} options `{}`
 *
 * @returns {Promise<CredentialsAuthenticateResponse>} Authenticate response
 */
const postLiveAuthenticate = async (
	liveAuthResponse: LiveAuthResponse,
	preamble: 'd' | 't' = 't',
	options: AuthenticateOptions = {}
): Promise<CredentialsAuthenticateResponse> => {
	const userTokenResponse = await exchangeRpsTicketForUserToken(
		liveAuthResponse.access_token,
		preamble
	);

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
			display_claims: XSTSResponse.DisplayClaims.xui[0],
			expires_on: XSTSResponse.NotAfter
		};
	}

	return {
		'login.live.com': liveAuthResponse,
		'user.auth.xboxlive.com': userTokenResponse,
		'xsts.auth.xboxlive.com': XSTSResponse
	};
};

//#endregion
//#region public methods

/**
 * Authenticate with credentials
 *
 * @param {string} email
 * @param {string} password
 * @param {AuthenticateOptions=} options
 *
 * @returns {Promise<CredentialsAuthenticateResponse>} Authenticate response
 */
export const authenticateWithUserCredentials = async (
	email: string,
	password: string,
	options: AuthenticateOptions = {}
): Promise<CredentialsAuthenticateResponse> => {
	const credentials: LiveCredentials = { email, password };
	const liveAuthResponse = await LiveAuthenticate(credentials);
	return postLiveAuthenticate(liveAuthResponse, 't', options);
};

/**
 * Authenticate with refresh token
 *
 * Caution, this method is a closure which means that the specified "refreshToken" will be overridden by the returned one.
 *
 * @param {string} refreshToken
 * @param {AuthenticateRefreshOptions|null=} refreshTokenOptions - `null`
 * @param {AuthenticateOptions=} options - `{}`
 *
 * @returns {Promise<CredentialsAuthenticateResponse>} Authenticate response
 */
export const authenticateWithUserRefreshToken = (() => {
	let __rt: string;

	return async (
		refreshToken: string,
		refreshOptions: AuthenticateRefreshOptions | null = null,
		options: AuthenticateOptions = {}
	) => {
		const liveAuthResponse = await live.refreshAccessToken(
			__rt || refreshToken,
			refreshOptions?.clientId,
			refreshOptions?.scope,
			refreshOptions?.clientSecret
		);

		__rt = liveAuthResponse.refresh_token || refreshToken;

		return postLiveAuthenticate(
			liveAuthResponse,
			refreshOptions?.preamble,
			options
		);
	};
})();

/**
 * Main authentication method
 *
 * @param {string} email
 * @param {string} password
 * @param {AuthenticateOptions=} options
 *
 * @returns {Promise<CredentialsAuthenticateResponse>} Authenticate response
 */
export const authenticate = authenticateWithUserCredentials;

//#endregion
//#region public namespaces

export const live = {
	preAuth,
	getAuthorizeUrl,
	authenticate: LiveAuthenticate,
	refreshAccessToken,
	exchangeCodeForAccessToken
};

export const xbl = {
	EXPERIMENTAL_createDummyWin32DeviceToken,
	exchangeRpsTicketForUserToken,
	exchangeTokensForXSTSToken,
	exchangeTokenForXSTSToken
};

//#endregion
