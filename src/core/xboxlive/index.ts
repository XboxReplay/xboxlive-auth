import errors from '@xboxreplay/errors';
import axios from 'axios';
import xboxLiveConfig from './config';
import commonConfig from '../../config';

import {
	ExchangeRpsTicketResponse,
	AuthenticateResponse,
	ExchangeResponse,
	TokensExchangeProperties,
	TokensExchangeOptions
} from '../..';

export const exchangeRpsTicketForUserToken = (
	RpsTicket: string
): Promise<ExchangeRpsTicketResponse> =>
	axios
		.post(
			xboxLiveConfig.uris.userAuthenticate,
			{
				RelyingParty: 'http://auth.xboxlive.com',
				TokenType: 'JWT',
				Properties: {
					AuthMethod: 'RPS',
					SiteName: 'user.auth.xboxlive.com',
					RpsTicket
				}
			},
			{
				headers: {
					...commonConfig.request.baseHeaders,
					Accept: 'application/json',
					'x-xbl-contract-version': 0
				}
			}
		)
		.then(response => {
			if (response.status !== 200)
				throw errors.internal(
					'Could not exchange specified "RpsTicket"'
				);
			else return response.data as ExchangeRpsTicketResponse;
		})
		.catch(err => {
			if (!!err.__XboxReplay__) throw err;
			else throw errors.internal(err.message);
		});

export const exchangeTokensForXSTSIdentity = <T extends ExchangeResponse>(
	{ userToken, deviceToken, titleToken }: TokensExchangeProperties,
	{ XSTSRelyingParty, optionalDisplayClaims, raw }: TokensExchangeOptions = {}
): Promise<T | AuthenticateResponse> =>
	axios
		.post(
			xboxLiveConfig.uris.XSTSAuthorize,
			{
				RelyingParty:
					XSTSRelyingParty || xboxLiveConfig.defaultRelyingParty,
				TokenType: 'JWT',
				Properties: {
					UserTokens: [userToken],
					DeviceToken: deviceToken,
					TitleToken: titleToken,
					OptionalDisplayClaims: optionalDisplayClaims,
					SandboxId: 'RETAIL'
				}
			},
			{
				headers: {
					...commonConfig.request.baseHeaders,
					Accept: 'application/json',
					'x-xbl-contract-version': 1
				}
			}
		)
		.then(response => {
			if (response.status !== 200) {
				throw errors.internal(
					'Could not exchange specified "userToken"'
				);
			}

			if (raw !== true) {
				const body = response.data as ExchangeResponse & {
					DisplayClaims: { xui: [{ uhs: string; xid?: string }] };
				};

				return {
					userXUID: body.DisplayClaims.xui[0].xid || null,
					userHash: body.DisplayClaims.xui[0].uhs,
					XSTSToken: body.Token,
					expiresOn: body.NotAfter
				};
			} else return response.data as T;
		})
		.catch(err => {
			if (!!err.__XboxReplay__) throw err;
			else if (err.response?.status === 400) {
				const isDefaultRelyingParty =
					XSTSRelyingParty === xboxLiveConfig.defaultRelyingParty;

				const computedErrorMessage = [
					'Could not exchange "userToken", please',
					`refer to ${commonConfig.gitHubLinks.seeUserTokenIssue}`
				];

				// prettier-ignore
				if (isDefaultRelyingParty === false)
			computedErrorMessage.splice(1, 0, 'double check the specified "XSTSRelyingParty" or');

				throw errors.internal(computedErrorMessage.join(' '));
			} else throw errors.internal(err.message);
		});

export const exchangeUserTokenForXSTSIdentity = <T extends ExchangeResponse>(
	userToken: string,
	options: TokensExchangeOptions
): Promise<T | AuthenticateResponse> =>
	exchangeTokensForXSTSIdentity<T>({ userToken }, options);
