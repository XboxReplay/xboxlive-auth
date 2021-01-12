import axios from 'axios';
import { stringify } from 'querystring';
import { getBaseHeaders, removeUndefinedFromObject } from '../../utils';
import { LiveAuthenticateResponse } from '../..';
import config, { defaultClientId, defaultScope } from './config';

//#region public methods

/**
 * Refresh an expired token
 *
 * @param {string|null} clientId - Set this value to `null` if the default one was used
 * @param {string} refreshToken
 * @param {scope=} scope - Default to `service::user.auth.xboxlive.com::MBI_SSL`
 * @param {string=} clientSecret - Not required if the default `client_id` has been used
 *
 * @returns {Promise<LiveAuthenticateResponse>} Refresh response
 *
 * @example
 * // 	refreshAccessToken(null, 'MQxxxxxxx');
 */
export const refreshAccessToken = async (
	clientId: string | null | undefined,
	refreshToken: string,
	scope?: string,
	clientSecret?: string
): Promise<LiveAuthenticateResponse> => {
	if (typeof clientId !== 'string' || clientId.length === 0) {
		clientId = defaultClientId;
		scope = defaultScope;
		clientSecret = void 0;
	}

	const payload: Record<string, any> = {
		client_id: clientId,
		scope,
		grant_type: 'refresh_token',
		refresh_token: refreshToken,
		client_secret: clientSecret
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
		data: stringify(removeUndefinedFromObject(payload))
	}).then(res => res.data);

	return response;
};

//#endregion
