import axios from 'axios';
import config, { defaultXSTSRelyingParty } from './config';
import { getBaseHeaders } from '../../utils';

import {
	XBLExchangeRpsTicketResponse,
	XBLExchangeTokensOptions,
	XBLExchangeTokensResponse,
	XBLTokens
} from '../..';

//#region definitions

const XBLContractVersion = 0;
const XBLAdditionalHeaders = {
	Accept: 'application/json',
	'X-Xbl-Contract-Version': String(XBLContractVersion)
};

//#endregion
//#region public methods

/**
 * Exchange returned "RpsTicket"
 *
 * @param {string} rpsTicket
 * @param {object=} additionalHeaders - Additional headers
 * @returns {Promise<XBLExchangeRpsTicketResponse>} Exchange response
 *
 * @example
 * //	exchangeRpsTicketForUserToken(
 * //		'EwAQxxxxxx'
 * //		{ Signature: 'AAAAQxxxx' }
 * //	);
 */
export const exchangeRpsTicketForUserToken = async (
	rpsTicket: string,
	additionalHeaders: Record<string, string> = {}
): Promise<XBLExchangeRpsTicketResponse> => {
	const response = await axios({
		url: config.urls.userAuthenticate,
		method: 'POST',
		headers: getBaseHeaders({
			...XBLAdditionalHeaders,
			...additionalHeaders
		}),
		data: {
			RelyingParty: 'http://auth.xboxlive.com',
			TokenType: 'JWT',
			Properties: {
				AuthMethod: 'RPS',
				SiteName: 'user.auth.xboxlive.com',
				RpsTicket: rpsTicket
			}
		}
	}).then(res => res.data);

	return response;
};

/**
 * Exchange tokens
 *
 * @param {XBLTokens} tokens
 * @param {XBLExchangeTokensOptions} options - Exchange options
 * @param {object=} additionalHeaders - Additional headers
 * @returns {Promise<XBLExchangeTokensResponse>} Exchange response
 *
 * @example
 * //	exchangeTokensForXSTSToken(
 * //		{ userTokens: ['eyxxx'], deviceToken: 'eyxxx' },
 * //		{
 * //			XSTSRelyingParty: 'https://gameservices.xboxlive.com/',
 * //			OptionalDisplayClaims: ['mgt']
 * //		},
 * //		{ Signature: 'AAAAQxxxx' }
 * //	);
 */
export const exchangeTokensForXSTSToken = async (
	tokens: XBLTokens,
	options: XBLExchangeTokensOptions = {},
	additionalHeaders: Record<string, string> = {}
): Promise<XBLExchangeTokensResponse> => {
	const response = await axios({
		url: config.urls.XSTSAuthorize,
		method: 'POST',
		headers: getBaseHeaders({
			...XBLAdditionalHeaders,
			...additionalHeaders
		}),
		data: {
			RelyingParty: options.XSTSRelyingParty || defaultXSTSRelyingParty,
			TokenType: 'JWT',
			Properties: {
				UserTokens: tokens.userTokens,
				DeviceToken: tokens.deviceToken,
				TitleToken: tokens.titleToken,
				OptionalDisplayClaims: options.optionalDisplayClaims,
				SandboxId: options.sandboxId || 'RETAIL'
			}
		}
	}).then(res => res.data);

	return response;
};

//#endregion
