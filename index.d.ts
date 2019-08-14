declare namespace XboxLiveAuth {
    type ExtraErrorProperties = {
        statusCode?: number;
        reason?: string;
    };

    type ExchangeUserTokenResponse = {
        userXUID: string | null;
        userHash: string;
        XSTSToken: string;
        expiresOn: string;
    };

    type AuthOptions = {
        XSTSRelyingParty?: string;
    };

    type AuthUserResponse = ExchangeUserTokenResponse & {
        wlRefreshToken?: string | null;
    };

    type LogUserResponse = {
        accessToken: string;
        refreshToken: string | null;
    };

    /**
     * @deprecated
     */
    function exchangeAccessTokenForUserToken(
        accessToken: string
    ): Promise<string>;

    function exchangeRpsTicketForUserToken(RpsTicket: string): Promise<string>;

    function exchangeUserTokenForXSTSIdentity(
        userToken: string,
        XSTSRelyingParty?: string
    ): Promise<ExchangeUserTokenResponse>;

    function authenticate(
        email: string,
        password: string,
        options?: AuthOptions
    ): Promise<AuthUserResponse>;
}

export = XboxLiveAuth;
