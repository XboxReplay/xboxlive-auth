import errors from '@xboxreplay/errors';
import axios from 'axios';
import liveConfig from './config';
import commonConfig from '../../config';
import { PreAuthResponse, Credentials, LogUserResponse } from '../..';
import { stringify, parse } from 'querystring';

//#region typings

type PreAuthMatchesParameters = {
	PPFT?: string;
	urlPost?: string;
};

type HashParameters = LogUserResponse;

//#endregion
//#region private methods

const _getMatchForIndex = (entry: string, regex: RegExp, index: number = 0) => {
	const match = entry.match(regex);
	return match?.[index] || void 0;
};

const _requiresIdentityConfirmation = (body: string) => {
	const m1 = _getMatchForIndex(body, /id=\"fmHF\" action=\"(.*?)\"/, 1);
	const m2 = _getMatchForIndex(m1 || '', /identity\/confirm/, 0);
	return m2 !== null;
};

//#endregion
//#region public methods

export const preAuth = (): Promise<PreAuthResponse> =>
	axios
		.get(
			`${liveConfig.uris.authorize}?${stringify({
				...liveConfig.queries.authorize
			})}`,
			{ headers: commonConfig.request.baseHeaders }
		)
		.then(response => {
			if (response.status !== 200) {
				throw errors.internal('Pre-authentication failed.');
			}

			const body = (response.data || '') as string;
			const cookie = (response.headers['set-cookie'] || [])
				.map((c: string) => c.split(';')[0])
				.join('; ');

			// prettier-ignore
			const matches: PreAuthMatchesParameters = {
				PPFT: _getMatchForIndex(body, /sFTTag:'.*value=\"(.*)\"\/>'/, 1),
				urlPost: _getMatchForIndex(body, /urlPost:'(.+?(?=\'))/, 1)
			};

			if (matches.PPFT === void 0)
				throw errors.internal(
					`Could not match "PPFT" parameter, please fill an issue on ${commonConfig.gitHubLinks.createIssue}`
				);
			else if (matches.urlPost === void 0)
				throw errors.internal(
					`Could not match "urlPost" parameter, please fill an issue on ${commonConfig.gitHubLinks.createIssue}`
				);

			return {
				cookie,
				matches: {
					PPFT: matches.PPFT,
					urlPost: matches.urlPost
				}
			};
		})
		.catch(err => {
			if (!!err.__XboxReplay__) throw err;
			else throw errors.internal(err.message);
		});

export const logUser = (
	preAuthResponse: PreAuthResponse,
	credentials: Credentials
): Promise<LogUserResponse> =>
	axios
		.post(
			preAuthResponse.matches.urlPost,
			stringify({
				login: credentials.email,
				loginfmt: credentials.email,
				passwd: credentials.password,
				PPFT: preAuthResponse.matches.PPFT
			}),
			{
				maxRedirects: 1,
				headers: {
					...commonConfig.request.baseHeaders,
					'Content-Type': 'application/x-www-form-urlencoded',
					Cookie: preAuthResponse.cookie
				}
			}
		)
		.then(response => {
			if (response.status !== 200) {
				throw errors.internal(`Authentication failed.`);
			}

			const body = (response.data || '') as string;
			const { responseUrl = '' } = response.request?.res || {};
			const hash = responseUrl.split('#')[1];

			if (responseUrl === preAuthResponse.matches.urlPost) {
				throw errors.unauthorized('Invalid credentials.');
			}

			if (hash === void 0) {
				const errorMessage =
					_requiresIdentityConfirmation(body) === true
						? `Activity confirmation required, please refer to ${commonConfig.gitHubLinks.unauthorizedActivityError}`
						: `Invalid credentials or 2FA enabled, please refer to ${commonConfig.gitHubLinks.twoFactorAuthenticationError}`;

				throw errors.unauthorized(errorMessage);
			}

			const parseHash = (parse(hash) as unknown) as HashParameters;
			parseHash.expires_in = Number(parseHash.expires_in);
			return parseHash;
		})
		.catch(err => {
			if (!!err.__XboxReplay__) throw err;
			else throw errors.internal(err.message);
		});

//#endregion
