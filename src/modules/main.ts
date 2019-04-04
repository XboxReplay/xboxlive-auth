import * as request from 'request';
import * as XboxLiveAuthError from './errors';
import { readFileSync } from 'fs';
import { stringify } from 'querystring';

import {
    LiveEndpoints,
    XboxLiveEndpoints,
    IRequestHeaders,
    IPreAuthResponse,
    IPreAuthMatchesParameters,
    IUserCredentials,
    ILogUserResponse,
    IUriQueryParameters,
    ILogUserMatchesParameters,
    IExchangeUserTokenResponse,
    IAuthUserResponse,
    IAuthOptions
} from './__typings__/main';

const { version } = JSON.parse(readFileSync('package.json', 'utf-8'));
const USER_AGENT: string = `Mozilla/5.0 (XboxReplay; XboxLiveAuth ${version}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36`;
const BASE_HEADERS: IRequestHeaders = {
    Accept: 'text/html; charset=utf-8',
    'Accept-Language': 'en-US',
    'User-Agent': USER_AGENT
};

// ***** PRIVATE METHODS ***** //

const _getMatchForIndex = (
    entry: string,
    regex: any,
    index: number = 0
): string | null => {
    const match = entry.match(regex);
    if (match === null) return null;
    if (match[index] === void 0) return null;
    return String(match[index] || '');
};

const _preAuth = (): Promise<IPreAuthResponse> =>
    new Promise((resolve, reject) => {
        const jar = request.jar();
        const authorizeQuery: IUriQueryParameters = {
            client_id: '0000000048093EE3', // My Xbox Live
            redirect_uri: 'https://login.live.com/oauth20_desktop.srf',
            response_type: 'token',
            scope: 'service::user.auth.xboxlive.com::MBI_SSL',
            display: 'touch',
            locale: 'en'
        };

        request(
            {
                uri:
                    LiveEndpoints.Authorize +
                    '?' +
                    unescape(stringify(authorizeQuery)),
                headers: BASE_HEADERS,
                jar
            },
            (err: any, _: request.Response, body: any) => {
                if (err) return reject(XboxLiveAuthError.internal(err.message));

                // prettier-ignore
                const matches = {
                    PPFT: _getMatchForIndex(body, /sFTTag:'.*value=\"(.*)\"\/>'/, 1),
                    urlPost: _getMatchForIndex(body, /urlPost:'([A-Za-z0-9:\?_\-\.&\\/=]+)/, 1)
                } as any;

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
                    matches: matches as IPreAuthMatchesParameters
                });
            }
        );
    });

const _logUser = (
    preAuthResponse: IPreAuthResponse,
    credentials: IUserCredentials
): Promise<ILogUserResponse> =>
    new Promise((resolve, reject) => {
        request(
            {
                uri: preAuthResponse.matches.urlPost,
                method: 'POST',
                followRedirect: false,
                headers: {
                    ...BASE_HEADERS,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Cookie: preAuthResponse.jar.getCookieString(
                        LiveEndpoints.Authorize
                    )
                },
                body: stringify({
                    login: credentials.email,
                    loginfmt: credentials.email,
                    passwd: credentials.password,
                    PPFT: preAuthResponse.matches.PPFT
                })
            },
            (err: any, response: request.Response) => {
                if (err) return reject(XboxLiveAuthError.internal(err.message));

                const location = response.headers.location;

                if (location === void 0) {
                    return reject(XboxLiveAuthError.invalidCredentials());
                }

                // prettier-ignore
                const matches = {
                    accessToken: _getMatchForIndex(location, /access_token=(.+?)&/, 1),
                    refreshToken: _getMatchForIndex(location, /refresh_token=(.+?)&/, 1)
                } as any;

                if (matches.accessToken === null) {
                    return reject(
                        XboxLiveAuthError.matchError(
                            'Cannot match "access_token" parameter'
                        )
                    );
                }

                return resolve(matches as ILogUserMatchesParameters);
            }
        );
    });

// ***** PUBLIC METHODS ***** //

export const exchangeAccessTokenForUserToken = (
    accessToken: string
): Promise<string> =>
    new Promise((resolve, reject) => {
        request(
            {
                uri: XboxLiveEndpoints.UserAuthenticate,
                method: 'POST',
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
    XSTSRelyingParty: string = 'http://xboxlive.com'
): Promise<IExchangeUserTokenResponse> =>
    new Promise((resolve, reject) => {
        request(
            {
                uri: XboxLiveEndpoints.XSTSAuthorize,
                method: 'POST',
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
                else if (response.statusCode !== 200)
                    return reject(
                        XboxLiveAuthError.exchangeFailure(
                            'Cannot exchange "userToken"'
                        )
                    );

                return resolve({
                    userXUID: body.DisplayClaims.xui[0].xid
                        ? String(body.DisplayClaims.xui[0].xid)
                        : null,
                    userHash: String(body.DisplayClaims.xui[0].uhs),
                    XSTSToken: String(body.Token),
                    expiresOn: body.NotAfter ? String(body.NotAfter) : null
                });
            }
        );
    });

export const authenticate = async (
    email: string,
    password: string,
    options: IAuthOptions = {}
): Promise<IAuthUserResponse> => {
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
