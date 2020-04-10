import { preAuth, logUser } from './core/live';

import {
	exchangeRpsTicketForUserToken,
	exchangeUserTokenForXSTSIdentity
} from './core/xboxlive';

//#region typings

export type Credentials = {
	email: string;
	password: string;
};

export type AuthOptions = {
	XSTSRelyingParty?: string;
};

export type PreAuthResponse = {
	cookie: string;
	matches: {
		PPFT: string;
		urlPost: string;
	};
};

export type LogUserResponse = {
	access_token: string;
	token_type: string;
	expires_in: number;
	scope: string;
	refresh_token: string;
	user_id: string;
};

export type ExchangeResponse = {
	IssueInstant: string;
	NotAfter: string;
	Token: string;
	DisplayClaims: object;
};

export type ExchangeRpsTicketResponse = ExchangeResponse & {
	DisplayClaims: { xui: [{ uhs: string }] };
};

export type AuthenticateResponse = {
	userXUID: string | null;
	userHash: string;
	XSTSToken: string;
	expiresOn: string;
};

//#endregion
//#region public methods

export const authenticate = async (
	email: Credentials['email'],
	password: Credentials['password'],
	options: AuthOptions = {}
): Promise<AuthenticateResponse> => {
	const preAuthResponse = await preAuth();
	const logUserResponse = await logUser(preAuthResponse, { email, password });
	const exchangeRpsTicketForUserTokenResponse = await exchangeRpsTicketForUserToken(
		logUserResponse.access_token
	);

	return exchangeUserTokenForXSTSIdentity(
		exchangeRpsTicketForUserTokenResponse.Token,
		options.XSTSRelyingParty,
		false
	) as Promise<AuthenticateResponse>;
};

export { exchangeRpsTicketForUserToken, exchangeUserTokenForXSTSIdentity };

//#endregion
