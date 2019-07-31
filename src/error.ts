import * as HTTPStatusCodes from './http-status-codes';
import { ExtraErrorProperties } from '..';

class XboxLiveAuthError extends Error {
    XBLAuthError: boolean = true;
    extra: ExtraErrorProperties;

    constructor(message: string = '', extra: ExtraErrorProperties = {}) {
        super(message);
        Error.captureStackTrace(this, XboxLiveAuthError);
        this.name = 'XboxLiveAuthError';
        this.extra = extra;
    }
}

const errors = {
    internal: (message = 'Something went wrong...') =>
        new XboxLiveAuthError(message, {
            statusCode: HTTPStatusCodes.INTERNAL_SERVER_ERROR,
            reason: 'INTERNAL_ERROR'
        }),
    matchError: (message = 'Match error') =>
        new XboxLiveAuthError(message, {
            statusCode: HTTPStatusCodes.BAD_REQUEST,
            reason: 'MATCH_ERROR'
        }),
    invalidCredentials: (message = 'Invalid credentials') =>
        new XboxLiveAuthError(message, {
            statusCode: HTTPStatusCodes.UNAUTHORIZED,
            reason: 'INVALID_CREDENTIALS'
        }),
    exchangeFailure: (message = 'Exchange failure') =>
        new XboxLiveAuthError(message, {
            statusCode: HTTPStatusCodes.BAD_REQUEST,
            reason: 'EXCHANGE_FAILURE'
        })
};

export = errors;
