import axios, { AxiosError } from 'axios';
import { stringify } from 'querystring';
import { getBaseHeaders } from '../../utils';
import XRError from '../../classes/XRError';
import commonConfig from '../../config';

import {
	LiveAuthResponse,
	LiveCredentials,
	LivePreAuthMatchedParameters,
	LivePreAuthResponse
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
 * @param {string=} clientId - `000000004C12AE6F`
 * @param {scope=} scope - `service::user.auth.xboxlive.com::MBI_SSL`
 * @param {responseType=} responseType - `token`
 * @param {redirectUri=} redirectUri - `https://login.live.com/oauth20_desktop.srf`
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
		redirectUri: redirectUri,
		response_type: responseType,
		scope: scope
	})}`;

/**
 * Refresh an expired token
 *
 * @param {string} refreshToken
 * @param {string=} clientId - `000000004C12AE6F`
 * @param {scope=} scope - `service::user.auth.xboxlive.com::MBI_SSL`
 * @param {string=} clientSecret - `undefined`
 *
 * @example
 * 	refreshAccessToken('M.R3_B.xxxxxx');
 *
 * @example
 * 	refreshAccessToken('M.R3_B.xxxxxx', 'xxxxxx', 'XboxLive.signin', 'xxxxxx');
 *
 * @throws {XRError}
 * @returns {Promise<LiveAuthenticateResponse>} Refresh response
 */
export const refreshAccessToken = async (
	refreshToken: string,
	clientId: string = defaultClientId,
	scope: string = defaultScope,
	clientSecret: string | undefined = void 0
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

	const response = await axios({
		url: config.urls.token,
		method: 'POST',
		headers: getBaseHeaders({
			Accept: 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded'
		}),
		data: stringify(payload)
	})
		.then(res => res.data)
		.catch((err: AxiosError) => {
			throw new XRError(err.message, {
				statusCode: err.response?.status,
				additional: err.response?.data || null
			});
		});

	return response;
};

/**
 * Retrieve required cookies and parameters before continue
 *
 * @throws {XRError}
 * @returns {Promise<LivePreAuthResponse>} Required cookies and parameters
 */
export const preAuth = async (): Promise<LivePreAuthResponse> => {
	const response = await axios({
		url: getAuthorizeUrl(),
		method: 'GET',
		headers: getBaseHeaders()
	})
		.then(res => {
			const body = (res.data || '') as string;
			const cookie: string = (res.headers['set-cookie'] || [])
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
		})
		.catch(err => {
			if (err.__XboxReplay__ === true) throw err;
			throw XRError.internal(err.message);
		});

	return response;
};

/**
 * Authenticate with credentials
 *
 * @param {object} credentials
 *
 * @throws {XRError}
 * @returns {Promise<LiveAuthResponse>} Authenticate response
 */
export const authenticate = async (
	credentials: LiveCredentials
): Promise<LiveAuthResponse> => {
	const preAuthResponse = await preAuth();
	const response = await axios({
		url: preAuthResponse.matches.urlPost,
		method: 'POST',
		headers: getBaseHeaders({
			'Content-Type': 'application/x-www-form-urlencoded',
			Cookie: preAuthResponse.cookie
		}),
		data: stringify({
			login: credentials.email,
			loginfmt: credentials.email,
			passwd: credentials.password,
			PPFT: preAuthResponse.matches.PPFT
		}),
		maxRedirects: 0,
		validateStatus: status => status === 302 || status === 200
	})
		.then(res => {
			if (res.status === 200) {
				throw XRError.unauthorized(
					`Invalid credentials or 2FA enabled`
				);
			}

			const { location = '' } = res.headers || {};
			const hash = location.split('#')[1];
			const output: Record<string, any> = {};

			for (const part of new URLSearchParams(hash)) {
				if (part[0] === 'expires_in') {
					output[part[0]] = Number(part[1]);
				} else output[part[0]] = part[1];
			}

			return output as LiveAuthResponse;
		})
		.catch(err => {
			if (err.__XboxReplay__ === true) throw err;
			throw XRError.internal(err.message);
		});

	return response;
};

//#endregion
