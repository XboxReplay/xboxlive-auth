import axios, { AxiosError } from 'axios';
import config, { defaultXSTSRelyingParty } from './config';
import { getBaseHeaders } from '../../utils';
import XRError from '../../classes/XRError';
import commonConfig from '../../config';

import {
	XBLDummyDeviceTokenResponse,
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
 * @param {string} rpsTicket - Returned `access_token` from login.live.com authorization process
 * @param {string=} preable - `t` - Use `d` for custom Azure applications
 * @param {object=} additionalHeaders - Additional headers if required, can be used to override default ones
 *
 * @example
 *	exchangeRpsTicketForUserToken('EwAQxxxxxx');
 *
 * @throws {XRError}
 * @returns {Promise<XBLExchangeRpsTicketResponse>} Exchange response
 */
export const exchangeRpsTicketForUserToken = async (
	rpsTicket: string,
	preamble: 'd' | 't' = 't',
	additionalHeaders: Record<string, string> = {}
): Promise<XBLExchangeRpsTicketResponse> => {
	const match = rpsTicket.match(/^([t|d]=)/g);

	if (match === null) {
		rpsTicket = `${preamble}=${rpsTicket}`;
	}

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
	})
		.then(res => res.data)
		.catch(_ => {
			throw XRError.badRequest(
				'Could not exchange specified "RpsTicket"'
			);
		});

	return response;
};

/**
 * Exchange tokens
 *
 * @param {XBLTokens} tokens
 * @param {XBLExchangeTokensOptions=} options - Exchange options
 * @param {object=} additionalHeaders - Additional headers if required, can be used to override default ones
 *
 * @example
 *	exchangeTokensForXSTSToken({ userTokens: ['eyxxx'] });
 *
 * @example
 * exchangeTokensForXSTSToken(
 *		{ userTokens: ['eyxxx'] }
 *	);

 * @example
 * exchangeTokensForXSTSToken(
 *		{ userTokens: ['eyxxx'], deviceToken: 'eyxxx', titleToken: 'eyxxx' },
 *		{ XSTSRelyingParty: 'https://gameservices.xboxlive.com/', OptionalDisplayClaims: ['mgt'] },
 *		{ Signature: 'AAAAQxxxx' }
 *	);
 *
 * @throws {XRError}
 * @returns {Promise<XBLExchangeTokensResponse>} Exchange response
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
	})
		.then(res => res.data)
		.catch((err: AxiosError) => {
			throw new XRError(
				'Could not exchange specified tokens, please double check used parameters or make sure to use the "EXPERIMENTAL_createDummyWin32DeviceToken" method to handle "Child" and "Teen" accounts',
				{ statusCode: err.response?.status }
			);
		});

	return response;
};

/**
 * Exchange token
 *
 * @param {string} userToken - Returned token from `exchangeRpsTicketForUserToken` method
 * @param {XBLExchangeTokensOptions=} options - Exchange options
 * @param {object=} additionalHeaders - Additional headers if required, can be used to override default ones
 * @returns {Promise<XBLExchangeTokensResponse>} Exchange response
 *
 * @example
 *	exchangeTokenForXSTSToken('eyxxx');
 *
 * @example
 *	exchangeTokenForXSTSToken(
 *		'eyxxx',
 *		{ XSTSRelyingParty: 'https://gameservices.xboxlive.com/', OptionalDisplayClaims: ['mgt'] },
 *		{ Signature: 'AAAAQxxxx' }
 *	);
 *
 * @throws {XRError}
 * @returns {Promise<XBLExchangeTokensResponse>} Exchange response
 */
export const exchangeTokenForXSTSToken = (
	userToken: string,
	options: XBLExchangeTokensOptions = {},
	additionalHeaders: Record<string, string> = {}
) =>
	exchangeTokensForXSTSToken(
		{ userTokens: [userToken] },
		options,
		additionalHeaders
	);

/**
 * Create a dummy Win32 device token to be used with `exchangeTokensForXSTSToken` method
 *
 * @throws {XRError}
 * @returns {Promise<XBLDummyDeviceTokenResponse>} Device authenticate response
 */
export const EXPERIMENTAL_createDummyWin32DeviceToken = async (): Promise<XBLDummyDeviceTokenResponse> => {
	const trustedParty = 'https://xboxreplay.net/';
	const serviceDeviceId = '21354D2F-352F-472F-5842-5265706C6179';
	const serviceSignature =
		'AAAAAQHW6oD31MwA6MAjn67vdCppWCbrMovubA85xejO06rtOAEdZ0tMTZFnu7xbI6lZDNvIWfuMaIPJSUcpvxjKqSFJl1oaWzQGBw==';

	const serviceProofKey = {
		crv: 'P-256',
		alg: 'ES256',
		use: 'sig',
		kty: 'EC',
		x: 'b8Zc6GPFeu41DqiWPJxRa_jqUTSiMA537emKVHt8UO8',
		y: 'CXAuTEHet72GjgSDfDg6psBrwE1waxBsNEIGrRZV_90'
	};

	const response = await axios({
		url: config.urls.deviceAuthenticate,
		method: 'POST',
		headers: getBaseHeaders({
			...XBLAdditionalHeaders,
			Signature: serviceSignature
		}),
		data: {
			RelyingParty: 'http://auth.xboxlive.com',
			TokenType: 'JWT',
			Properties: {
				AuthMethod: 'ProofOfPossession',
				TrustedParty: trustedParty,
				Id: `{${serviceDeviceId}}`,
				DeviceType: 'Win32',
				Version: '10.0.18363',
				ProofKey: serviceProofKey
			}
		}
	})
		.then(res => res.data)
		.catch(_ => {
			throw XRError.badRequest(
				`Could not create a valid device token, please fill an issue on ${commonConfig.github.createIssue}`
			);
		});

	return response;
};

//#endregion
