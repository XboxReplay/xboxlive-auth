import * as request from 'request';
import * as XboxLiveAuthError from './error';
import { stringify } from 'querystring';

import {
    AuthOptions,
    AuthUserResponse,
    ExchangeUserTokenResponse,
    LogUserResponse
} from '..';

// **** TYPINGS **** //

type RequestHeaders = {
    [key: string]: string | number;
};

type URIQueryParameters = {
    client_id: string;
    redirect_uri: string;
    response_type: string;
    scope: string;
    display: string;
    locale: string;
};

type UserCredentials = {
    email: string;
    password: string;
};

type PreAuthMatchesParameters = {
    PPFT: string | null;
    urlPost: string | null;
};

type LogUserMatchesParameters = {
    accessToken: string | null;
    refreshToken: string | null;
};

type PreAuthResponse = {
    jar: request.CookieJar;
    matches: {
        PPFT: string;
        urlPost: string;
    };
};

// ***** DEFINITIONS ***** //

const CLIENT_ID = '0000000048093EE3'; // My Xbox Live
const SCOPE = 'service::user.auth.xboxlive.com::MBI_SSL';
const RESPONSE_TYPE = 'token';
const DEFAULT_RELYING_PARTY = 'http://xboxlive.com';

const USER_AGENT: string = [
    'Mozilla/5.0 (XboxReplay; XboxLiveAuth/1.1)',
    'AppleWebKit/537.36 (KHTML, like Gecko)',
    'Chrome/71.0.3578.98 Safari/537.36'
].join(' ');

const BASE_HEADERS: RequestHeaders = {
    Accept: 'application/json; charset=utf-8',
    'Accept-Language': 'en-US',
    'User-Agent': USER_AGENT
};

const LIVE_ENDPOINTS = {
    authorize: 'https://login.live.com/oauth20_authorize.srf',
    redirect: 'https://login.live.com/oauth20_desktop.srf'
};

const XBOX_LIVE_ENDPOINTS = {
    userAuthenticate: 'https://user.auth.xboxlive.com/user/authenticate',
    XSTSAuthorize: 'https://xsts.auth.xboxlive.com/xsts/authorize'
};

// **** PRIVATE METHODS **** //

const _getMatchForIndex = (
    entry: string,
    regex: any,
    index: number = 0
): string | null => {
    const match = entry.match(regex);
    if (match === null) return null;
    if (match[index] === void 0) return null;
    return match[index];
};

const _requiresIdentityConfirmation = (body: string) => {
    const m1 = _getMatchForIndex(body, /id=\"fmHF\" action=\"(.*?)\"/, 1);
    const m2 = _getMatchForIndex(m1 || '', /identity\/confirm/, 0);
    return m2 !== null;
};

const _preAuth = (): Promise<PreAuthResponse> =>
    new Promise((resolve, reject) => {
        const jar = request.jar();
        const authorizeQuery: URIQueryParameters = {
            client_id: CLIENT_ID,
            redirect_uri: LIVE_ENDPOINTS.redirect,
            response_type: RESPONSE_TYPE,
            scope: SCOPE,
            display: 'touch',
            locale: 'en'
        };

        request(
            {
                uri:
                    LIVE_ENDPOINTS.authorize +
                    '?' +
                    unescape(stringify(authorizeQuery)),
                gzip: true,
                headers: BASE_HEADERS,
                jar
            },
            (err: any, _: request.Response, body: any) => {
                if (err) return reject(XboxLiveAuthError.internal(err.message));

                // prettier-ignore
                const matches: PreAuthMatchesParameters = {
                    PPFT: _getMatchForIndex(body, /sFTTag:'.*value=\"(.*)\"\/>'/, 1),
                    urlPost: _getMatchForIndex(body, /urlPost:'([A-Za-z0-9:\?_\-\.&\\/=]+)/, 1)
                }

                if (matches.PPFT === null) {
                    return reject(
                        XboxLiveAuthError.matchError(
                            'Cannot match "PPFT" parameter'
                        )
                    );
                } else if (matches.urlPost === null) {
                    return reject(
                        XboxLiveAuthError.matchError(
                            'Cannot match "urlPost" parameter'
                        )
                    );
                }

                return resolve({
                    jar,
                    matches: {
                        PPFT: matches.PPFT,
                        urlPost: matches.urlPost
                    }
                });
            }
        );
    });

const _logUser = (
    preAuthResponse: PreAuthResponse,
    credentials: UserCredentials
): Promise<LogUserResponse> =>
    new Promise((resolve, reject) => {
        const jar = request.jar();
        request(
            {
                uri: preAuthResponse.matches.urlPost,
                method: 'POST',
                gzip: true,
                followRedirect: false,
                headers: {
                    ...BASE_HEADERS,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Cookie: preAuthResponse.jar.getCookieString(
                        LIVE_ENDPOINTS.authorize
                    )
                },
                body: stringify({
                    login: credentials.email,
                    loginfmt: credentials.email,
                    passwd: credentials.password,
                    PPFT: preAuthResponse.matches.PPFT
                }),
                jar
            },
            (err: any, response: request.Response, body: any) => {
                if (err) return reject(XboxLiveAuthError.internal(err.message));

                const location = response.headers.location;

                if (location === void 0) {
                    return _requiresIdentityConfirmation(body)
                        ? reject(XboxLiveAuthError.unauthorizedActivity())
                        : reject(XboxLiveAuthError.invalidCredentials());
                }

                // prettier-ignore
                const matches: LogUserMatchesParameters = {
                    accessToken: _getMatchForIndex(location, /access_token=(.+?)&/, 1),
                    refreshToken: _getMatchForIndex(location, /refresh_token=(.+?)&/, 1)
                };

                if (matches.accessToken === null) {
                    return reject(
                        XboxLiveAuthError.matchError(
                            'Cannot match "access_token" parameter'
                        )
                    );
                }

                return resolve({
                    accessToken: matches.accessToken,
                    refreshToken: matches.refreshToken
                });
            }
        );
    });

// **** PUBLIC METHODS **** //

export const exchangeAccessTokenForUserToken = (
    accessToken: string
): Promise<string> =>
    new Promise((resolve, reject) => {
        request(
            {
                uri: XBOX_LIVE_ENDPOINTS.userAuthenticate,
                method: 'POST',
                gzip: true,
                headers: {
                    ...BASE_HEADERS,
                    'x-xbl-contract-version': 0
                },
                json: {
                    RelyingParty: 'http://auth.xboxlive.com',
                    TokenType: 'JWT',
                    Properties: {
                        AuthMethod: 'RPS',
                        SiteName: 'user.auth.xboxlive.com',
                        RpsTicket: accessToken
                    }
                }
            },
            (err: any, response: request.Response, body: any) => {
                if (err) return reject(XboxLiveAuthError.internal(err.message));
                else if (response.statusCode !== 200)
                    return reject(
                        XboxLiveAuthError.exchangeFailure(
                            'Cannot exchange "accessToken"'
                        )
                    );
                return resolve(body.Token);
            }
        );
    });

export const exchangeUserTokenForXSTSIdentity = (
    userToken: string,
    XSTSRelyingParty: string = DEFAULT_RELYING_PARTY
): Promise<ExchangeUserTokenResponse> =>
    new Promise((resolve, reject) => {
        request(
            {
                uri: XBOX_LIVE_ENDPOINTS.XSTSAuthorize,
                method: 'POST',
                gzip: true,
                headers: {
                    ...BASE_HEADERS,
                    'x-xbl-contract-version': 0
                },
                json: {
                    RelyingParty: XSTSRelyingParty,
                    TokenType: 'JWT',
                    Properties: {
                        UserTokens: [userToken],
                        SandboxId: 'RETAIL'
                    }
                }
            },
            (err: any, response: request.Response, body: any) => {
                if (err) return reject(XboxLiveAuthError.internal(err.message));
                else if (response.statusCode !== 200) {
                    const isDefaultRelyingParty =
                        XSTSRelyingParty === DEFAULT_RELYING_PARTY;

                    const errorMessage = [
                        'Cannot exchange "userToken", please',
                        'refer to https://bit.ly/xr-xbl-auth-user-token-issue'
                    ];

                    if (isDefaultRelyingParty === false)
                        // prettier-ignore
                        errorMessage.splice(1, 0, 'double check the specified "XSTSRelyingParty" or');

                    return reject(
                        XboxLiveAuthError.exchangeFailure(
                            errorMessage.join(' ')
                        )
                    );
                }

                return resolve({
                    userXUID: String(body.DisplayClaims.xui[0].xid),
                    userHash: String(body.DisplayClaims.xui[0].uhs),
                    XSTSToken: String(body.Token),
                    expiresOn: String(body.NotAfter)
                });
            }
        );
    });

export const authenticate = async (
    email: string,
    password: string,
    options: AuthOptions = {}
): Promise<AuthUserResponse> => {
    const preAuthResponse = await _preAuth();
    const logUser = await _logUser(preAuthResponse, { email, password });
    const userToken = await exchangeAccessTokenForUserToken(
        logUser.accessToken
    );

    return exchangeUserTokenForXSTSIdentity(
        userToken,
        options.XSTSRelyingParty
    );
};
