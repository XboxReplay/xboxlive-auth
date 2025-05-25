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

/**
 * Helper function to check if a value is a plain object
 * @param item - Any value to check
 * @returns True if the item is a plain object (not null, not an array, and with Object.prototype)
 */
export const isObject = (item: any): item is Record<string, any> =>
	!!item &&
	typeof item === 'object' &&
	Array.isArray(item) === false &&
	Object.getPrototypeOf(item) === Object.prototype;
