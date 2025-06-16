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

/**
 * Returns login.live.com authorize URL
 * @param {string} [clientId] - Client ID
 * @param {string} [scope] - OAuth scope
 * @param {'token'|'code'} [responseType] - Response type
 * @param {string} [redirectUri] - Redirect URI
 *
 * @example
 * // Using defaults
 * getAuthorizeUrl();
 *
 * @example
 * // Custom parameters
 * getAuthorizeUrl('xxxxxx', 'XboxLive.signin', 'code', 'https://xxxxxx');
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
 *
 * @example
 * // Exchange code for access token
 * const token = await exchangeCodeForAccessToken('code', 'clientId', 'scope', 'redirectUri');
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
 * @throws {XRFetchClientException} If the request fails
 * @returns {Promise<LiveAuthResponse>} Refresh token response
 *
 * @example
 * // Using defaults
 * await refreshAccessToken('M.R3_B.xxxxxx');
 *
 * @example
 * // Custom parameters
 * await refreshAccessToken('M.R3_B.xxxxxx', 'xxxxxx', 'XboxLive.signin', 'xxxxxx');
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
		PPFT: extractPPFT(body) ?? void 0,
		urlPost: extractUrlPost(body) ?? void 0,
	};

	if (matches.PPFT !== void 0 && matches.urlPost !== void 0) {
		return { cookie, matches: matches as LivePreAuthMatchedParameters };
	}

	throw new XRLiveLibraryException(`Could not match required "preAuth" parameters`, {
		attributes: { code: 'PRE_AUTH_ERROR', extra: { matches } },
	});
};

/**
 * Authenticates with Microsoft Account using credentials
 * @param {LiveCredentials} credentials - Email and password credentials
 * @throws {XRFetchClientException} If the request fails
 * @throws {XRLiveLibraryException} If the authentication has failed
 * @returns {Promise<LiveAuthResponse>} Authentication response with tokens
 *
 * @example
 * const tokens = await authenticate({ email: 'user@example.com', password: 'password' });
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

	if (resp.statusCode !== 302) {
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

/**
 * Extracts the PPFT value from page
 * @param htmlContent - The HTML content containing the PPFT input field
 * @returns {string | null} The PPFT token value if found, null otherwise
 */
const extractPPFT = (htmlContent: string): string | null => {
	const ppftRegex = /name=\\?"PPFT\\?"[^>]*value=\\?"([^"\\]+)\\?"/i;
	const match = htmlContent.match(ppftRegex);
	return match !== null && match[1] !== void 0 ? match[1] : null;
};

/**
 * Extracts the urlPost value from the page
 * @param htmlContent - The HTML content containing the ServerData JavaScript object
 * @returns {string | null} The urlPost URL if found, null otherwise
 */
const extractUrlPost = (htmlContent: string): string | null => {
	const urlPostRegex = /\\?['"]?urlPost\\?['"]?:\s*\\?['"]([^'"\\]+)\\?['"]/i;
	const match = htmlContent.match(urlPostRegex);
	return match !== null && match[1] !== void 0 ? match[1] : null;
};
