import { XboxReplayError } from '@xboxreplay/error';
import * as HTTPStatusCodes from './http-status-codes';
import * as GitHubLinks from './github-links';

const errors = {
    internal: (message = 'Something went wrong...') =>
        new XboxReplayError(message, {
            statusCode: HTTPStatusCodes.INTERNAL_SERVER_ERROR,
            reason: 'INTERNAL_ERROR'
        }),
    matchError: (message = 'Match error') =>
        new XboxReplayError(message, {
            statusCode: HTTPStatusCodes.BAD_REQUEST,
            reason: 'MATCH_ERROR'
        }),
    invalidCredentials: (
        message = `Invalid credentials or 2FA enabled, please refer to ${
            GitHubLinks.twoFactorAuthenticationError
        }`
    ) =>
        new XboxReplayError(message, {
            statusCode: HTTPStatusCodes.UNAUTHORIZED,
            reason: 'INVALID_CREDENTIALS'
        }),
    unauthorizedActivity: (
        message = `Activity confirmation required, please refer to ${
            GitHubLinks.unauthorizedActivityError
        }`
    ) =>
        new XboxReplayError(message, {
            statusCode: HTTPStatusCodes.UNAUTHORIZED,
            reason: 'UNAUTHORIZED_ACTIVITY'
        }),
    exchangeFailure: (message = 'Exchange failure') =>
        new XboxReplayError(message, {
            statusCode: HTTPStatusCodes.BAD_REQUEST,
            reason: 'EXCHANGE_FAILURE'
        })
};

export = errors;
