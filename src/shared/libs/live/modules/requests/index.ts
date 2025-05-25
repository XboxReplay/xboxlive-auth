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

import FetchClient from '../../../../classes/Fetch/Clients';
import XRLiveLibraryException from '../../classes/Exceptions/XRLiveLibraryException';
import { config } from '../../config';

import type {
	LiveAuthResponse,
	LiveCredentials,
	LivePreAuthMatchedParameters,
	LivePreAuthOptions,
	LivePreAuthResponse,
} from './requests.types';

//#region public methods

/**
 * Returns login.live.com authorize URL
 * @param {string} [clientId] - Client ID
 * @param {string} [scope] - OAuth scope
 * @param {'token'|'code'} [responseType] - Response type
 * @param {string} [redirectUri] - Redirect URI
 *
 * @example
 * ```typescript
 * // Using defaults
 * getAuthorizeUrl();
 * ```
 *
 * @example
 * ```typescript
 * // Custom parameters
 * getAuthorizeUrl('xxxxxx', 'XboxLive.signin', 'code', 'https://xxxxxx');
 * ```
 *
 * @returns {string} Authorize URL with query parameters
 */
export const getAuthorizeUrl = (
	clientId: string = config.clients.xboxApp.id,
	scope: string = config.clients.xboxApp.scope,
	responseType: 'token' | 'code' = config.clients.xboxApp.responseType,
	redirectUri: string = config.clients.xboxApp.redirectUri
): string =>
	`${config.urls.authorize}?${new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: responseType,
		scope: scope,
	}).toString()}`;

/**
 * Exchange returned code for a valid access token
 * @param {string} code - Authorization code
 * @param {string} clientId - Client ID
 * @param {string} scope - OAuth scope
 * @param {string} redirectUri - Redirect URI
 * @param {string} [clientSecret] - Client secret
 * @throws {XRFetchClientException} If the request fails
 * @returns {Promise<LiveAuthResponse>} OAuth token response
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
		scope,
	};

	if (clientSecret !== void 0) {
		payload.client_secret = clientSecret;
	}

	return FetchClient.post<LiveAuthResponse>(config.urls.token, new URLSearchParams(payload).toString(), {
		headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
	}).then(res => res.data);
};

/**
 * Refresh an expired token
 * @param {string} refreshToken - The refresh token
 * @param {string} [clientId] - Client ID
 * @param {string} [scope] - OAuth scope
 * @param {string} [clientSecret] - Client secret
 *
 * @example
 * ```typescript
 * // Using defaults
 * refreshAccessToken('M.R3_B.xxxxxx');
 * ```
 *
 * @example
 * ```typescript
 * // Custom parameters
 * refreshAccessToken('M.R3_B.xxxxxx', 'xxxxxx', 'XboxLive.signin', 'xxxxxx');
 * ```
 *
 * @throws {XRFetchClientException} If the request fails
 * @returns {Promise<LiveAuthResponse>} Refresh token response
 */
export const refreshAccessToken = async (
	refreshToken: string,
	clientId: string = config.clients.xboxApp.id,
	scope: string = config.clients.xboxApp.scope,
	clientSecret?: string
): Promise<LiveAuthResponse> => {
	const payload: Record<string, string> = {
		client_id: clientId,
		scope,
		grant_type: 'refresh_token',
		refresh_token: refreshToken,
	};

	if (clientSecret !== void 0) {
		payload.client_secret = clientSecret;
	}

	return FetchClient.post<LiveAuthResponse>(config.urls.token, new URLSearchParams(payload).toString(), {
		headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
	}).then(res => res.data);
};

/**
 * Retrieve required cookies and parameters before authentication
 * @param {LivePreAuthOptions} [options] - Pre-auth options
 * @throws {XRFetchClientException} If the request fails
 * @throws {XRLiveLibraryException} If parameters can't be matched
 * @returns {Promise<LivePreAuthResponse>} Required cookies and parameters
 */
export const preAuth = async (options?: LivePreAuthOptions): Promise<LivePreAuthResponse> => {
	const url = getAuthorizeUrl(options?.clientId, options?.scope, options?.responseType, options?.redirectUri);
	const resp = await FetchClient.get<string>(url, {
		options: { parseJson: false },
	});

	const body = resp.data;
	const cookies = resp.headers['set-cookie'] || '';

	// Extract cookies from set-cookie header
	const cookie = cookies
		.split(',')
		.map((c: string) => c.trim().split(';')[0])
		.filter(Boolean)
		.join('; ');

	const matches: Partial<LivePreAuthMatchedParameters> = {
		PPFT: getMatchForIndex(body, /sFTTag:'.*value=\"(.*)\"\/>'/, 1),
		urlPost: getMatchForIndex(body, /urlPost:'(.+?(?=\'))/, 1),
	};

	if (matches.PPFT !== void 0 && matches.urlPost !== void 0) {
		return { cookie, matches: matches as LivePreAuthMatchedParameters };
	}

	throw new XRLiveLibraryException(`Could not match required "preAuth" parameters`, {
		attributes: { code: 'PRE_AUTH_ERROR' },
	});
};

/**
 * Authenticate with Microsoft Live using credentials
 * @param {LiveCredentials} credentials - Email and password credentials
 * @throws {XRFetchClientException} If the request fails
 * @throws {XRLiveLibraryException} If the authentication has failed
 * @returns {Promise<LiveAuthResponse>} Authentication response with tokens
 */
export const authenticate = async (credentials: LiveCredentials): Promise<LiveAuthResponse> => {
	const preAuthResponse = await preAuth();
	const resp = await FetchClient.post<null>(
		preAuthResponse.matches.urlPost,
		new URLSearchParams({
			login: credentials.email,
			loginfmt: credentials.email,
			passwd: credentials.password,
			PPFT: preAuthResponse.matches.PPFT,
		}).toString(),
		{
			headers: {
				['Content-Type']: 'application/x-www-form-urlencoded',
				['Cookie']: preAuthResponse.cookie,
			},
			redirect: 'manual',
			options: { parseJson: false },
		}
	);

	if (resp.status !== 302) {
		throw new XRLiveLibraryException(`The authentication has failed`, {
			attributes: { code: 'INVALID_CREDENTIALS_OR_2FA_ENABLED' },
		});
	}

	const hash = (resp.headers.location || '').split('#')[1] || null;
	if (hash === null) {
		throw new XRLiveLibraryException(`The authentication has failed`, {
			attributes: { code: 'MISSING_HASH_PARAMETERS' },
		});
	}

	const params = new URLSearchParams(hash);
	const formatted: Record<string, string | number | null> = {};

	for (const [key, value] of params.entries()) {
		if (key === 'expires_in') {
			formatted[key] = Number(value);
		} else formatted[key] = value;
	}

	const output = formatted as LiveAuthResponse;
	if (output.refresh_token === void 0 || output.refresh_token === '') {
		output.refresh_token = null;
	}

	return output;
};

//#endregion
//#region private methods

/**
 * Extracts a specific match from a string using regex
 * @param {string} entry - The string to search in
 * @param {RegExp} regex - The regular expression pattern to match
 * @param {number} [index=0] - The capture group index to return
 * @returns {string|undefined} The matched string or undefined if no match
 */
const getMatchForIndex = (entry: string, regex: RegExp, index: number = 0): string | undefined => {
	const match = entry.match(regex);
	return match?.[index] || void 0;
};

//#endregion
