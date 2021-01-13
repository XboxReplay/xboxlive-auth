import axios from 'axios';
import { stringify } from 'querystring';
import { getBaseHeaders } from '../../utils';
import { LiveAuthenticateResponse } from '../..';

import config, {
	defaultClientId,
	defaultRedirectUri,
	defaultResponseType,
	defaultScope
} from './config';

//#region public methods

/**
 * Returns login.live.com authorize URL to be used inside an Electron app
 *
 * @returns {string} Authorize URL
 */
export const getAuthorizeUrl = (): string =>
	`${config.urls.authorize}?${stringify({
		client_id: defaultClientId,
		redirectUri: defaultRedirectUri,
		response_type: defaultResponseType,
		scope: defaultScope,
		display: 'touch'
	})}`;

/**
 * Refresh an expired token
 *
 * @param {string|null} clientId - Set this value to `null` if the default one was used
 * @param {string} refreshToken - Stored `refresh_token`
 * @param {scope=} scope - Default to `service::user.auth.xboxlive.com::MBI_SSL`
 * @param {string=} clientSecret - Not required if the default `client_id` has been used
 *
 * @example
 * 	refreshAccessToken(null, 'M.R3_B.xxxxxxxx');
 *
 * @example
 * 	refreshAccessToken('00000XXXXXX', 'M.R3_B.xxxxxxxx', 'XboxLive.signin', 'xxxxxx');
 *
 * @throws {AxiosError}
 * @returns {Promise<LiveAuthenticateResponse>} Refresh response
 */
export const refreshAccessToken = async (
	clientId: string | null | undefined,
	refreshToken: string,
	scope?: string,
	clientSecret?: string
): Promise<LiveAuthenticateResponse> => {
	if (typeof clientId !== 'string' || clientId.length === 0) {
		clientId = defaultClientId;
	}

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
	}).then(res => res.data);

	return response;
};

//#endregion
