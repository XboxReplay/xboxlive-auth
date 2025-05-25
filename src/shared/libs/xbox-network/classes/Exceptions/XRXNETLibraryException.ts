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

import XRBaseException from '../../../../classes/XRException';
import type { StringOrError, ErrorData, BaseErrorAttributes } from '../../../../classes/XRException/XRException.types';

type ErrorAttributes = BaseErrorAttributes;

class XRXNETLibraryException extends XRBaseException<ErrorAttributes> {
	/**
	 * Creates a new library exception
	 * @param stringOrError - Error message or an Error object to wrap
	 * @param data - Additional error data
	 */
	public constructor(stringOrError: StringOrError, data: ErrorData<ErrorAttributes> = {}) {
		super(stringOrError, data);
		this.name = this.constructor.name;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export default XRXNETLibraryException;
