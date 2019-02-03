import { CookieJar } from 'request';

export interface IUriQueryParameters {
	client_id: string;
	redirect_uri: string;
	response_type: string;
	scope: string;
	display: string;
	locale: string;
}

export enum LiveEndpoints {
	Authorize = 'https://login.live.com/oauth20_authorize.srf'
}

export enum XboxLiveEndpoints {
	UserAuthenticate = 'https://user.auth.xboxlive.com/user/authenticate',
	XSTSAuthorize = 'https://xsts.auth.xboxlive.com/xsts/authorize'
}

export interface IRequestHeaders {
	[key: string]: string;
}

export interface IPreAuthMatchesParameters {
	PPFT: string;
	urlPost: string;
}

export interface IPreAuthResponse {
	jar: CookieJar;
	matches: IPreAuthMatchesParameters;
}

export interface IUserCredentials {
	email: string;
	password: string;
}

export interface ILogUserMatchesParameters {
	accessToken: string;
	refreshToken: string | null;
}

export interface ILogUserResponse extends ILogUserMatchesParameters {}
export interface IExchangeUserTokenResponse {
	userHash: string;
	XSTSToken: string;
}

export interface IAuthUserResponse extends IExchangeUserTokenResponse {
	wlRefreshToken?: string | null;
}

export type IExchangeRPSTicketResponse = string;
export type XSTSRelyingParty = 'http://xboxlive.com' | string;

export interface IAuthOptions {
	XSTSRelyingParty?: XSTSRelyingParty;
}
