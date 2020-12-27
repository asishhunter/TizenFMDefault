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

/*global define, document, tizen, window, history, console*/

/**
 * Module app.
 *
 * @module app
 * @requires {@link FMRadio/views/main}
 * @requires {@link FMRadio/views/popup}
 * @namespace FMRadio/app
 * @memberof FMRadio
 */
define({
    name: 'app',
    requires: [
        'views/main',
        'views/popup'
    ],
    def: function app(req) {
        'use strict';

        /**
         * Main module object.
         *
         * @private
         * @type {Module}
         */
        var main = req.views.main,

            /**
             * Popup module object.
             *
             * @private
             * @type {Module}
             */
            popup = req.views.popup;

        /**
         * Closes the application.
         *
         * @private
         */
        function exitApplication() {
            tizen.application.getCurrentApplication().exit();
        }

        /**
         * Shows popup with message and exit button.
         *
         * @private
         * @param {string} title Title of the popup.
         * @param {string} reason Text content of the popup.
         */
        function showExitPopup(title, reason) {
            popup.showPopup('main-page', popup.POPUP_TYPES.TEXT, {
                title: title,
                btnYesText: 'Exit',
                btnYesCallback: exitApplication,
                text: reason,
                exitCallback: exitApplication
            });
        }

        /**
         * Returns 'true' if device supports radio feature, 'false' otherwise.
         *
         * @private
         * @returns {boolean}
         */
        function isRadioSupported() {
            var isSupported = false;

            try {
                isSupported = tizen.systeminfo
                    .getCapability('http://tizen.org/feature/fmradio');
            } catch (error) {
                console.error('No support for radio feature: ', error.message);
            } finally {
                return isSupported;
            }
        }

        /**
         * Returns 'true' if device antenna is connected, 'false' otherwise.
         *
         * @private
         * @returns {boolean} Is antenna connected.
         */
        function isAntennaConnected() {
            return tizen.fmradio.isAntennaConnected;
        }

        /**
         * Checks requirements whether the application can be run.
         *
         * @private
         */
        function checkRequirements() {

            if (!isRadioSupported()) {
                showExitPopup('Unsupported device',
                    'This device does not support radio feature.');
                return false;
            }

            if (!isAntennaConnected()) {
                showExitPopup('Antenna not connected',
                    'Antenna is not connected. Application will be closed.');
                return false;
            }

            return true;
        }

        /**
         * Scales SVG element to fit the screen.
         *
         * @private
         */
        function scaleSVG() {
            var scale = 0,
                content = document.getElementById('main-content'),
                svg = document.getElementById('radio-buttons');

            // We want 98% of screen with 340 px of original SVG,
            // values range from 0 to 1
            if (window.innerWidth < window.innerHeight) {
                scale = window.innerWidth * 98 / 340 / 100;
            } else {
                scale = content.clientHeight * 98 / 340 / 100;
            }

            svg.style.webkitTransform = 'scale(' + scale + ')';
        }

        /**
         * Handles back button on device.
         *
         * @private
         * @param {Event} event Device pressed key event.
         */
        function onBackButton(event) {
            if (event.keyName === 'back') {
                if (document.querySelector('.ui-page-active').id ===
                    'main-page') {
                    exitApplication();
                } else {
                    history.back();
                }
            }
        }

        /**
         * Initializes application.
         *
         * @memberof FMRadio/app
         * @public
         */
        function init() {
            window.addEventListener('tizenhwkey', onBackButton);
            scaleSVG();
            if (checkRequirements()) {
                main.initialize();
            }
        }

        return {
            init: init
        };
    }
});
