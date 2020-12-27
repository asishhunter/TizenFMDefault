/*
 * Copyright (c) 2014 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*global define*/

/**
 * Text module
 * @requires {@link core/window}
 * @namespace core/text
 */

define({
    name: 'core/text',
    requires: [
        'core/window'
    ],
    def: function coreText(window) {
        'use strict';

        var str = window.String.prototype;

        /**
         * This is used to trim a text.
         * @memberof core/text
         * @param {string} txt Text to modify.
         * @return {string} Modified text.
         */
        function trim(txt) {
            return str.trim.call(txt);
        }

        /**
         * This is used to uppercase a text.
         * @memberof core/text
         * @param {string} txt Text to modify.
         * @return {string} Modified text.
         */
        function upper(txt) {
            return str.toUpperCase.call(txt);
        }

        /**
         * This is used to lowercase a text.
         * @memberof core/text
         * @param {string} txt Text to modify.
         * @return {string} Modified text.
         */
        function lower(txt) {
            return str.toLowerCase.call(txt);
        }

        return {
            trim: trim,
            upper: upper,
            lower: lower
        };
    }
});
