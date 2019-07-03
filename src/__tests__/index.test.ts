import * as XboxLiveAuth from '..';
import { AuthUserResponse } from '../..';

beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
});

it('should authenticate with success', async () => {
    const authorization: AuthUserResponse = {
        userXUID: '123456789123456789',
        userHash: '1234567890123456',
        XSTSToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.WyJBcmUgeW91IGxvb2tpbmcgZm9yIHNvbWV0aGluZz8iXQ.OfRjqsoMbmeksokqRHXE7BgjblODCZ-m0c5PQ3PIFWc',
        expiresOn: '2019-04-05T05:43:32.6275675Z'
    };

    const mock = jest.spyOn(XboxLiveAuth, 'authenticate');
    mock.mockReturnValueOnce(new Promise(resolve => resolve(authorization)));

    const response = await XboxLiveAuth.authenticate('email', 'password');
    expect(response).toEqual(authorization);
});

it('should exchange "accessToken" for "userToken"', async () => {
    const userToken: string =
        'EwAoAEwAoAEwAoAEwAoAEwAoAEwAoAEwAoAEwAoAEwAoAEwAoA';

    const mock = jest.spyOn(XboxLiveAuth, 'exchangeAccessTokenForUserToken');
    mock.mockReturnValueOnce(new Promise(resolve => resolve(userToken)));

    const response = await XboxLiveAuth.exchangeAccessTokenForUserToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.WyJaZW55IElDIl0.uhbX3bSPxuuAsz3wxWPIsdzlczxI1LHRGFaX1HoBnzM'
    );

    expect(response).toEqual(userToken);
});

it('should exchange "userToken" for "XSTSIdentity"', async () => {
    const authorization: AuthUserResponse = {
        userXUID: '123456789123456789',
        userHash: '1234567890123456',
        XSTSToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.WyJBcmUgeW91IGxvb2tpbmcgZm9yIHNvbWV0aGluZz8iXQ.OfRjqsoMbmeksokqRHXE7BgjblODCZ-m0c5PQ3PIFWc',
        expiresOn: '2019-04-05T05:43:32.6275675Z'
    };

    const mock = jest.spyOn(XboxLiveAuth, 'exchangeUserTokenForXSTSIdentity');
    mock.mockReturnValueOnce(new Promise(resolve => resolve(authorization)));

    const response = await XboxLiveAuth.exchangeUserTokenForXSTSIdentity(
        'EwAoAEwAoAEwAoAEwAoAEwAoAEwAoAEwAoAEwAoAEwAoAEwAoA'
    );

    expect(response).toEqual(authorization);
});

it('should try to authenticate, and fail', async () => {
    // prettier-ignore
    try { await XboxLiveAuth.authenticate('email', 'password'); }
	catch (err) { expect(err.message).toMatch('Invalid credentials') }
});

it('should try to exchange "accessToken", and fail', async () => {
    // prettier-ignore
    try { await XboxLiveAuth.exchangeAccessTokenForUserToken('fake'); }
	catch (err) { expect(err.message).toMatch('Cannot exchange "accessToken"') }
});

it('should try to exchange "userToken", and fail', async () => {
    // prettier-ignore
    try { await XboxLiveAuth.exchangeUserTokenForXSTSIdentity('fake'); }
	catch (err) { expect(err.message).toMatch('Cannot exchange "userToken"') }
});
