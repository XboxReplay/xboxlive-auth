/**
 * Copyright 2025 Alexis Bize
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { isObject } from '../../modules/utils';
import type { BaseErrorAttributes, ErrorAttributes, ErrorData, StringOrError } from './XRException.types';

/**
 * Custom exception class for the library with support for structured error data and attributes.
 * @template TAttributes Type for custom error attributes.
 */
class XRBaseException<TAttributes extends BaseErrorAttributes = BaseErrorAttributes> extends Error {
	/**
	 * Structured error data containing optional attributes.
	 */
	public readonly data: ErrorData<TAttributes>;

	/**
	 * Creates a new XRBaseException.
	 * @param stringOrError - Error message or an Error object to wrap.
	 * @param data - Optional additional error data.
	 */
	public constructor(stringOrError: StringOrError, data: ErrorData<TAttributes> = {}) {
		super(typeof stringOrError === 'string' ? stringOrError : stringOrError.message);

		// Maintain proper prototype chain for instanceof checks
		Object.setPrototypeOf(this, new.target.prototype);

		// Set the correct name
		this.name = this.constructor.name;

		// Capture stack trace if available
		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, this.constructor);
		}

		// Initialize data with attributes
		this.data = { ...data };

		// Handle case when an Error object is passed
		if (stringOrError instanceof Error) {
			const attributes = (this.data.attributes || {}) as ErrorAttributes<TAttributes>;
			this.data.attributes = {
				...attributes,
				_originalError: stringOrError,
				// Preserve original stack if available
				...(stringOrError.stack ? { _originalStack: stringOrError.stack } : {}),
			} as ErrorAttributes<TAttributes>;

			// Copy any additional properties from the original error
			const originalErrorProps = Object.getOwnPropertyNames(stringOrError).filter(
				prop => !['name', 'message', 'stack'].includes(prop)
			);

			for (const prop of originalErrorProps) {
				const value = (stringOrError as Record<string, any>)[prop];
				(this.data.attributes as Record<string, unknown>)[`_original_${prop}`] = value;
			}
		}
	}

	/**
	 * Gets the error attributes.
	 * @returns Current error attributes.
	 */
	public getAttributes(): ErrorAttributes<TAttributes> {
		return (this.data.attributes || {}) as ErrorAttributes<TAttributes>;
	}

	/**
	 * Extends the current attributes with new ones.
	 * @param attributes - Partial attributes to add.
	 * @returns This instance for chaining.
	 */
	public extendAttributes(attributes: Partial<TAttributes>): this {
		this.data.attributes = {
			...(this.data.attributes || {}),
			...attributes,
		} as ErrorAttributes<TAttributes>;
		return this;
	}

	/**
	 * Creates a JSON representation of the error.
	 * @returns Object with message and data properties.
	 */
	public toJSON(): { message: string; data: ErrorData<TAttributes>; name: string } {
		return { name: this.name, message: this.message, data: this.data };
	}

	/**
	 * Creates a copy of the exception with a new message.
	 * @param message - New error message.
	 */
	public withMessage(message: string): XRBaseException<TAttributes> {
		return new XRBaseException<TAttributes>(message, this.data);
	}

	/**
	 * Factory method to create an exception from any error.
	 * @param err - Error to convert to an XRBaseException.
	 * @param defaultMessage - Optional message to use if the error doesn't have one.
	 * @example
	 * const ex = XRBaseException.from(new Error('fail'));
	 */
	public static from<T extends BaseErrorAttributes>(
		err: unknown,
		defaultMessage = 'An unknown error occurred'
	): XRBaseException<T> {
		if (err instanceof XRBaseException) {
			return err as XRBaseException<T>;
		} else if (err instanceof Error) {
			return new XRBaseException<T>(err);
		}

		// Handle non-Error objects
		if (isObject(err) === true) {
			const errorObj = err as Record<string, unknown>;
			const message = typeof errorObj.message === 'string' ? errorObj.message : defaultMessage;

			return new XRBaseException<T>(message, {
				attributes: { _originalError: err } as ErrorAttributes<T>,
			});
		}

		// Handle primitives
		return new XRBaseException<T>(defaultMessage, {
			attributes: { _originalError: err } as ErrorAttributes<T>,
		});
	}
}

export default XRBaseException;
