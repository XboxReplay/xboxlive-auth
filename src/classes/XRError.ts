//#region typings

type XRErrorDetails = {
	statusCode: number;
	reason: keyof typeof XRErrorReasons;
	additional: any;
};

enum XRErrorReasons {
	BAD_REQUEST = 'BAD_REQUEST',
	UNAUTHORIZED = 'UNAUTHORIZED',
	FORBIDDEN = 'FORBIDDEN',
	NOT_FOUND = 'NOT_FOUND',
	TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
	INTERNAL_ERROR = 'INTERNAL_ERROR'
}

//#endregion
//#region definitions

const statusCodeToReasonMap: Record<number, keyof typeof XRErrorReasons> = {
	500: 'INTERNAL_ERROR',
	400: 'BAD_REQUEST',
	401: 'UNAUTHORIZED',
	403: 'FORBIDDEN',
	404: 'NOT_FOUND',
	429: 'TOO_MANY_REQUESTS'
};

const defaultErrorMessage = 'Something went wrong...';
const defaultStatusCode: keyof typeof statusCodeToReasonMap = 500;
const defaultReason = XRErrorReasons.INTERNAL_ERROR;

//#endregion
//#region class

class XRError extends Error {
	public readonly __XboxReplay__ = true;
	public readonly details: XRErrorDetails = {
		statusCode: defaultStatusCode,
		reason: defaultReason,
		additional: null
	};

	/**
	 *
	 * @param message {string} - `Bad Request`
	 * @param additional {object|null} - `null`
	 *
	 * @returns {XRError}
	 */
	static badRequest = (
		message: string = 'Bad Request',
		additional: XRErrorDetails['additional'] = null
	): XRError =>
		new XRError(message, {
			statusCode: 400,
			additional
		});

	/**
	 *
	 * @param message {string} - `Unauthorized`
	 * @param additional {object|null} - `null`
	 *
	 * @returns {XRError}
	 */
	static unauthorized = (
		message: string = 'Unauthorized',
		additional: XRErrorDetails['additional'] = null
	): XRError =>
		new XRError(message, {
			statusCode: 401,
			additional
		});

	/**
	 *
	 * @param message {string} - `Forbidden`
	 * @param additional {object|null} - `null`
	 *
	 * @returns {XRError}
	 */
	static forbidden = (
		message: string = 'Forbidden',
		additional: XRErrorDetails['additional'] = null
	): XRError =>
		new XRError(message, {
			statusCode: 403,
			additional
		});

	/**
	 *
	 * @param message {string} - `Too Many Requests`
	 * @param additional {object|null} - `null`
	 *
	 * @returns {XRError}
	 */
	static tooManyRequests = (
		message: string = 'Too Many Requests',
		additional: XRErrorDetails['additional'] = null
	): XRError =>
		new XRError(message, {
			statusCode: 429,
			additional
		});

	/**
	 *
	 * @param message {string} - `Internal Error`
	 * @param additional {object|null} - `null`
	 *
	 * @returns {XRError}
	 */
	static internal = (
		message: string = 'Internal Error',
		additional: XRErrorDetails['additional'] = null
	): XRError =>
		new XRError(message, {
			statusCode: 500,
			additional
		});

	public constructor(
		message = defaultErrorMessage,
		details: Omit<Partial<XRErrorDetails>, 'reason'> = {}
	) {
		super(message);
		this.name = this.constructor.name;

		if (typeof Error.captureStackTrace === 'function')
			Error.captureStackTrace(this, this.constructor);
		else this.stack = new Error(message).stack;

		this.details = {
			...this.details,
			...details
		};

		this.details.reason =
			statusCodeToReasonMap[this.details.statusCode] ||
			statusCodeToReasonMap[defaultStatusCode];
	}

	/**
	 * @returns {string}
	 */
	public getMessage(): string {
		return this.message;
	}

	/**
	 * @returns {XRErrorDetails}
	 */
	public getDetails(): XRErrorDetails {
		return this.details;
	}

	/**
	 * @returns {number}
	 */
	public getStatusCode(): number {
		return this.getDetails().statusCode;
	}

	/**
	 * @returns {string}
	 */
	public getReason(): keyof typeof XRErrorReasons {
		return this.getDetails().reason;
	}

	/**
	 * @returns {object|null}
	 */
	public getAdditional(): Record<string, string> | null {
		return this.getDetails().additional;
	}
}

export default XRError;

//#endregion
