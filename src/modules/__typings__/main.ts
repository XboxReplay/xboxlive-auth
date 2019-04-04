import { CookieJar } from 'request';

// ***** ENUM ***** //

export enum LiveEndpoints {
    Authorize = 'https://login.live.com/oauth20_authorize.srf'
}

export enum XboxLiveEndpoints {
    UserAuthenticate = 'https://user.auth.xboxlive.com/user/authenticate',
    XSTSAuthorize = 'https://xsts.auth.xboxlive.com/xsts/authorize'
}

// ***** INTERFACES ***** //

export interface IUriQueryParameters {
    client_id: string;
    redirect_uri: string;
    response_type: string;
    scope: string;
    display: string;
    locale: string;
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

export interface IExchangeUserTokenResponse {
    userXUID: string;
    userHash: string;
    XSTSToken: string;
    expiresOn: string;
}

export interface IAuthUserResponse extends IExchangeUserTokenResponse {
    wlRefreshToken?: string | null;
}

export interface IAuthOptions {
    XSTSRelyingParty?: string;
}

export interface ILogUserResponse extends ILogUserMatchesParameters {}
