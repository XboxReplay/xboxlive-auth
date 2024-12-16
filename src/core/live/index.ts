import { stringify } from 'querystring';
import { getBaseHeaders } from '../../utils';
import XRError from '../../classes/XRError';
import commonConfig from '../../config';

import {
	LiveAuthResponse,
	LiveCredentials,
	LivePreAuthMatchedParameters,
	LivePreAuthResponse,
	LivePreAuthOptions
} from '../..';

import config, {
	defaultClientId,
	defaultRedirectUri,
	defaultResponseType,
	defaultScope
} from './config';

//#region private methods

const getMatchForIndex = (entry: string, regex: RegExp, index: number = 0) => {
	const match = entry.match(regex);
	return match?.[index] || void 0;
};

//#endregion
//#region public methods

/**
 * Returns login.live.com authorize URL
 *
 * @param {string} [clientId="000000004C12AE6F"] `000000004C12AE6F`
 * @param {scope} [scope="service::user.auth.xboxlive.com::MBI_SSL"] `service::user.auth.xboxlive.com::MBI_SSL`
 * @param {responseType} [responseType="token"] `token`
 * @param {redirectUri=} [redirectUri="https://login.live.com/oauth20_desktop.srf"] `https://login.live.com/oauth20_desktop.srf`
 *
 * @example
 * 	getAuthorizeUrl();
 *
 * @example
 * 	getAuthorizeUrl('xxxxxx', 'XboxLive.signin', 'code', 'https://xxxxxx');
 *
 * @returns {string} Authorize URL
 */
export const getAuthorizeUrl = (
	clientId: string = defaultClientId,
	scope: string = defaultScope,
	responseType: 'token' | 'code' = defaultResponseType,
	redirectUri: string = defaultRedirectUri
): string =>
	`${config.urls.authorize}?${stringify({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: responseType,
		scope: scope
	})}`;

/**
 * Exchange returned code for a valid access token
 *
 * @param {string} code
 * @param {string} clientId
 * @param {string} scope
 * @param {string} redirectUri
 * @param {string=} clientSecret
 *
 * @throws {XRError}
 * @returns {Promise<LiveAuthResponse>}
 */
export const exchangeCodeForAccessToken = async (
	code: string,
	clientId: string,
	scope: string,
	redirectUri: string,
	clientSecret?: string
): Promise<LiveAuthResponse> => {
	const payload: Record<string, any> = {
		code,
		client_id: clientId,
		grant_type: 'authorization_code',
		redirect_uri: redirectUri,
		scope
	};

	if (clientSecret !== void 0) {
		payload.client_secret = clientSecret;
	}

	try {
		const response = await fetch(config.urls.token, {
			method: 'POST',
			headers: getBaseHeaders({
				Accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded'
			}),
			body: stringify(payload),
		});

		if (!response.ok) {
			throw new XRError(response.statusText, {
				statusCode: response.status,
				additional: (await response.text()) || null
			});
		}

		return await response.json();
	} catch (err: Error | any) {
		throw new XRError(err.message, {
			statusCode: err.response?.status,
			additional: err.response?.data || null
		});
	}
};

/**
 * Refresh an expired token
 *
 * @param {string} refreshToken
 * @param {string} [clientId="000000004C12AE6F"] - `000000004C12AE6F`
 * @param {scope} [scope="service::user.auth.xboxlive.com::MBI_SSL"] - `service::user.auth.xboxlive.com::MBI_SSL`
 * @param {string=} clientSecret - `undefined`
 *
 * @example
 * 	refreshAccessToken('M.R3_B.xxxxxx');
 *
 * @example
 * 	refreshAccessToken('M.R3_B.xxxxxx', 'xxxxxx', 'XboxLive.signin', 'xxxxxx');
 *
 * @throws {XRError}
 * @returns {Promise<LiveAuthResponse>} Refresh response
 */
export const refreshAccessToken = async (
	refreshToken: string,
	clientId: string = defaultClientId,
	scope: string = defaultScope,
	clientSecret?: string
): Promise<LiveAuthResponse> => {
	const payload: Record<string, any> = {
		client_id: clientId,
		scope: scope || defaultScope,
		grant_type: 'refresh_token',
		refresh_token: refreshToken
	};

	if (clientSecret !== void 0) {
		payload.client_secret = clientSecret;
	}

	try {
		const response = await fetch(config.urls.token, {
			method: 'POST',
			headers: getBaseHeaders({
				Accept: 'application/json',
				'Accept-Encoding': 'identity',
				'Content-Type': 'application/x-www-form-urlencoded'
			}),
			body: stringify(payload),
		});

		if (!response.ok) {
			throw new XRError(response.statusText, {
				statusCode: response.status,
				additional: (await response.text()) || null
			});
		}

		return await response.json();
	} catch (err: Error | any) {
		throw new XRError(err.message, {
			statusCode: err.response?.status,
			additional: err.response?.data || null
		});
	}
};

/**
 * Retrieve required cookies and parameters before continue
 *
 * @param {LivePreAuthOptions=} options
 *
 * @throws {XRError}
 * @returns {Promise<LivePreAuthResponse>} Required cookies and parameters
 */
export const preAuth = async (
	options?: LivePreAuthOptions
): Promise<LivePreAuthResponse> => {
	try {
		const response = await fetch(getAuthorizeUrl(
			options?.clientId,
			options?.scope,
			options?.responseType,
			options?.redirectUri
		), {
			method: 'GET',
			headers: getBaseHeaders({
				'Accept-Encoding': 'identity'
			})
		});

		if (!response.ok) {
			throw new XRError(response.statusText, {
				statusCode: response.status,
				additional: (await response.text()) || null
			});
		}

		const body = (await response.text() || '') as string;
		const cookie: string = (response.headers.getSetCookie() || [])
			.map((c: string) => c.split(';')[0])
			.join('; ');

		const matches: Partial<LivePreAuthMatchedParameters> = {
			PPFT: getMatchForIndex(body, /sFTTag:'.*value=\"(.*)\"\/>'/, 1),
			urlPost: getMatchForIndex(body, /urlPost:'(.+?(?=\'))/, 1)
		};

		if (matches.PPFT !== void 0 && matches.urlPost !== void 0) {
			return {
				cookie,
				matches: matches as LivePreAuthMatchedParameters
			};
		}

		throw XRError.internal(
			`Could not match required "preAuth" parameters, please fill an issue on ${commonConfig.github.createIssue}`
		);
	} catch (err: Error | any) {
		if (err.__XboxReplay__ === true) throw err;
			throw XRError.internal(err.message);
	}
};

/**
 * Authenticate with credentials
 *
 * @param {LiveCredentials} credentials
 *
 * @throws {XRError}
 * @returns {Promise<LiveAuthResponse>} Authenticate response
 */
export const authenticate = async (
	credentials: LiveCredentials
): Promise<LiveAuthResponse> => {
	const preAuthResponse = await preAuth();

	const payload = {
		login: credentials.email,
		loginfmt: credentials.email,
		passwd: credentials.password,
		PPFT: preAuthResponse.matches.PPFT
	};

	try {
		const response = await fetch(preAuthResponse.matches.urlPost, {
			method: 'POST',
			headers: getBaseHeaders({
				'Accept-Encoding': 'identity',
				'Content-Type': 'application/x-www-form-urlencoded',
				Cookie: preAuthResponse.cookie
			}),
			redirect: 'manual',
			body: stringify(payload),
		});

		if (response.status === 200) {
			throw XRError.unauthorized(
				`Invalid credentials or 2FA enabled`
			);
		}

		if (response.status !== 302) {
			throw XRError.internal(
				`Unexpected status code: ${response.status}`
			);
		}

		const location = response.headers.get('location') || '';
		const hash = location.split('#')[1];
		const output: Record<string, any> = {};

		for (const part of new URLSearchParams(hash)) {
			if (part[0] === 'expires_in') {
				output[part[0]] = Number(part[1]);
			} else output[part[0]] = part[1];
		}

		return output as LiveAuthResponse;
	} catch (err: Error | any) {
			if (err.__XboxReplay__ === true) throw err;
			throw XRError.internal(err.message);
	}
};

//#endregion
