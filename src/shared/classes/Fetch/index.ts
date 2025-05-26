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

import FetchClientException from './Exceptions/XRFetchClientException';
import { isObject } from '../../modules/utils';
import type { FetchRequestConfig, FetchResponse } from './Fetch.types';

export const MIN_TIMEOUT = 1_000; // 1 second
export const MAX_TIMEOUT = 30_000; // 30 seconds
export const DEFAULT_TIMEOUT = 10_000; // 10 seconds

export const DEFAULT_OPTIONS: Partial<FetchRequestConfig['options']> = {
	parseJson: true,
	throwOnError: true,
	timeout: DEFAULT_TIMEOUT,
};

/**
 * Base fetch client for making HTTP requests
 * Can be extended for specialized API clients
 */
abstract class XRFetch {
	/**
	 * Default user agent used during requests
	 */
	protected static USER_AGENT =
		'XboxLive-Auth/5.0 (Node; +https://github.com/XboxReplay/xboxlive-auth) XboxReplay/AuthClient';

	/**
	 * Makes a GET request to an endpoint
	 * @template T - The expected response data type
	 * @param {string} url - The URL to make the request to
	 * @param {Omit<FetchRequestConfig, 'method' | 'body'>} [config={}] - Request config excluding method and body
	 * @returns {Promise<FetchResponse<T>>} A promise that resolves to the response data
	 * @throws {FetchClientException} If the request fails
	 */
	public static async get<T = any>(
		url: string,
		init: Omit<FetchRequestConfig, 'method' | 'body'> = {}
	): Promise<FetchResponse<T>> {
		return this.fetch<T>(url, { ...init, method: 'GET' });
	}

	/**
	 * Makes a POST request to an endpoint
	 * @template T - The expected response data type
	 * @param {string} url - The URL to make the request to
	 * @param {any} [body] - The request body (will be automatically stringified if an object)
	 * @param {Omit<FetchRequestConfig, 'method' | 'body'>} [init={}] - Request config excluding method and body
	 * @returns {Promise<FetchResponse<T>>} A promise that resolves to the response data
	 * @throws {FetchClientException} If the request fails
	 */
	public static async post<T = any>(
		url: string,
		body?: any,
		init: Omit<FetchRequestConfig, 'method' | 'body'> = {}
	): Promise<FetchResponse<T>> {
		return this.fetch<T>(url, { ...init, method: 'POST', body });
	}

	/**
	 * Makes a PUT request to an endpoint
	 * @template T - The expected response data type
	 * @param {string} url - The URL to make the request to
	 * @param {any} [body] - The request body (will be automatically stringified if an object)
	 * @param {Omit<FetchRequestConfig, 'method' | 'body'>} [config={}] - Request config excluding method and body
	 * @returns {Promise<FetchResponse<T>>} A promise that resolves to the response data
	 * @throws {FetchClientException} If the request fails
	 */
	public static async put<T = any>(
		url: string,
		body?: any,
		init: Omit<FetchRequestConfig, 'method' | 'body'> = {}
	): Promise<FetchResponse<T>> {
		return this.fetch<T>(url, { ...init, method: 'PUT', body });
	}

	/**
	 * Makes a DELETE request to an endpoint
	 * @template T - The expected response data type
	 * @param {string} url - The URL to make the request to
	 * @param {Omit<FetchRequestConfig, 'method'>} [init={}] - Request config excluding method
	 * @returns {Promise<FetchResponse<T>>} A promise that resolves to the response data
	 * @throws {FetchClientException} If the request fails
	 */
	public static async delete<T = any>(
		url: string,
		init: Omit<FetchRequestConfig, 'method'> = {}
	): Promise<FetchResponse<T>> {
		return this.fetch<T>(url, { ...init, method: 'DELETE' });
	}

	/**
	 * Runs a fetch request
	 * @template T - The expected response data type
	 * @param {string} url - The URL to request
	 * @param {FetchRequestConfig} [config={}] - Fetch options
	 * @returns {Promise<FetchResponse<T>>} Promise resolving to the response data
	 * @throws {FetchClientException} If the request fails
	 */
	public static async fetch<T = any>(url: string, config: FetchRequestConfig = {}): Promise<FetchResponse<T>> {
		const options = this.mergeOptions(config.options);
		const timeout = this.calculateTimeout(options.timeout);
		const headers = this.createHeaders(config);

		if (options.additionalHeaders !== void 0) {
			Object.entries(options.additionalHeaders).forEach(([key, value]) => {
				headers.set(key, value);
			});
		}

		const processedBody = this.processBody(config.body);
		delete config.options;

		const resp = await this.performFetch(url, {
			...(config satisfies Omit<FetchRequestConfig, 'options'>),
			headers,
			body: processedBody,
			signal: timeout !== void 0 ? AbortSignal.timeout(timeout) : void 0,
		}).catch(err => {
			throw this.createErrorFromNetworkError(err, url);
		});

		const responseHeaders = this.extractHeaders(resp);

		if (options.throwOnError === true && resp.ok === false) {
			if (resp.status >= 300 && resp.status < 400) {
				return this.createResponse(null as T, resp, responseHeaders);
			} else throw await this.createErrorFromResponse(resp);
		}

		const data = await this.parseResponseData<T>(resp, options).catch(err => {
			throw new FetchClientException(err);
		});

		return this.createResponse(data, resp, responseHeaders);
	}

	/**
	 * Merges provided options with defaults
	 * @param {FetchRequestConfig['options']} [options={}] - The options to merge
	 * @returns {FetchRequestConfig['options']} Merged options
	 * @protected
	 */
	protected static mergeOptions(
		options: FetchRequestConfig['options'] = {}
	): NonNullable<FetchRequestConfig['options']> {
		return { ...DEFAULT_OPTIONS, ...options };
	}

	/**
	 * Creates headers for the request
	 * @param {FetchRequestConfig} config - The request config
	 * @returns {Headers} The headers object
	 * @protected
	 */
	protected static createHeaders(config: FetchRequestConfig): Headers {
		const headers = new Headers(config.headers);

		if (config.options?.includeDefaultHeaders !== false) {
			headers.set('Accept', '*/*');
			headers.set('Accept-Language', 'en-US,en;q=0.9');
			headers.set('Cache-Control', 'no-cache');
			headers.set('Accept-Encoding', 'gzip, deflate, br');
			headers.set('User-Agent', this.USER_AGENT);
		}

		if (isObject(config.body) === true) {
			headers.set('Content-Type', 'application/json');
		}

		return headers;
	}

	/**
	 * Processes the request body
	 * @param {any} body - The request body
	 * @returns {any} The processed body
	 * @protected
	 */
	protected static processBody(body: any): any {
		if (isObject(body) === true) {
			return JSON.stringify(body);
		} else return body;
	}

	/**
	 * Calculates the appropriate timeout value
	 * @param {number} [timeout] - The provided timeout
	 * @returns {number|undefined} The calculated timeout
	 * @protected
	 */
	protected static calculateTimeout(timeout?: number): number | undefined {
		if (timeout !== void 0) {
			return Math.max(MIN_TIMEOUT, Math.min(MAX_TIMEOUT, timeout));
		} else return void 0;
	}

	/**
	 * Performs the actual fetch request
	 * @param {string} url - The URL to fetch
	 * @param {RequestInit} init - The fetch request config
	 * @returns {Promise<Response>} The fetch response
	 * @protected
	 */
	protected static async performFetch(url: string, init: RequestInit): Promise<Response> {
		return fetch(url, init);
	}

	/**
	 * Extracts headers from the response
	 * @param {Response} response - The fetch response
	 * @returns {Record<string, string>} The headers as an object
	 * @protected
	 */
	protected static extractHeaders(response: Response): Record<string, string> {
		const responseHeaders: Record<string, string> = {};

		response.headers.forEach((value, key) => {
			if (key.toLowerCase() === 'set-cookie') {
				if (responseHeaders[key]) {
					responseHeaders[key] += ',' + value;
				} else responseHeaders[key] = value;
			} else responseHeaders[key] = value;
		});

		return responseHeaders;
	}
	/**
	 * Creates an error from a failed response
	 * @param {Response} response - The fetch response
	 * @returns {Promise<FetchClientException>} The created error
	 * @protected
	 */
	protected static async createErrorFromResponse(response: Response): Promise<FetchClientException> {
		return FetchClientException.fromResponse(response);
	}

	/**
	 * Creates an error from a network error
	 * @param {any} error - The original error
	 * @param {string} url - The request URL
	 * @returns {FetchClientException} The created error
	 * @protected
	 */
	protected static createErrorFromNetworkError(error: any, url: string): FetchClientException {
		return FetchClientException.fromNetworkError(error instanceof Error ? error : new Error(String(error)), url);
	}

	/**
	 * Parses the response data based on content type
	 * @template T - The expected data type
	 * @param {Response} response - The fetch response
	 * @param {FetchRequestConfig['options']} [options={}] - The fetch options
	 * @returns {Promise<T>} The parsed data
	 * @protected
	 */
	protected static async parseResponseData<T>(
		response: Response,
		options: FetchRequestConfig['options'] = {}
	): Promise<T> {
		const data =
			options.parseJson === true && response.status !== 204 ? await response.json() : await response.text();
		return data as T;
	}

	/**
	 * Creates the final response object
	 * @template T - The expected data type
	 * @param {T} data - The response data
	 * @param {Response} response - The original fetch response
	 * @param {Record<string, string>} headers - The extracted headers
	 * @returns {FetchResponse<T>} The final response object
	 * @protected
	 */
	protected static createResponse<T>(data: T, response: Response, headers: Record<string, string>): FetchResponse<T> {
		return { data, response, headers, status: response.status };
	}
}

export default XRFetch;
