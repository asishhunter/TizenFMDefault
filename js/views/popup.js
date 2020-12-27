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

/*global define, tau, document, console*/

/**
 * Module popup.
 *
 * @module view/popup
 * @namespace FMRadio/views/popup
 * @memberof FMRadio/views
 */

define({
    name: 'views/popup',
    def: function viewsPopup() {
        'use strict';

        /**
         * Type of popup.
         *
         * @memberof FMRadio/views/popup
         * @public
         * @const {object}
         */
        var POPUP_TYPES = Object.freeze({
                SIMPLE: 0,
                TEXT: 1,
                PROGRESS: 2,
                INPUT: 3
            }),

            /**
             * Minimum length of station name.
             *
             * @memberof FMRadio/views/popup
             * @public
             * @const {number}
             */
            STATION_NAME_LENGTH_MIN = 1,

            /**
             * Maximum length of station name.
             *
             * @memberof FMRadio/views/popup
             * @public
             * @const {number}
             */
            STATION_NAME_LENGTH_MAX = 10,

            /**
             * Hidden class value.
             *
             * @private
             * @const {string}
             */
            HIDDEN_CLASS = 'hidden',

            /**
             * Input error class value.
             *
             * @private
             * @const {string}
             */
            INPUT_ERROR_CLASS = 'input-error',

            /**
             * Grid for two buttons in popup footer.
             *
             * @private
             * @const {string}
             */
            TWO_FOOTER_BTNS_GRID = 'ui-grid-col-2',

            /**
             * Single button class value.
             *
             * @private
             * @const {string}
             */
            SINGLE_BUTTON_POPUP_CLASS = 'center_title_1btn',

            /**
             * Double button class value.
             *
             * @private
             * @const {string}
             */
            DOUBLE_BUTTON_POPUP_CLASS = 'center_title_2btn',

            /**
             * Function called after Yes button is clicked.
             *
             * @private
             * @type {function}
             */
            successCallback = null,

            /**
             * Function called after popup close.
             *
             * @private
             * @type {function}
             */
            closeCallback = null,

            /**
             * Function that validates input data.
             *
             * @private
             * @type {function}
             */
            validator = null,

            /**
             * Input error text.
             *
             * @private
             * @type {string}
             */
            inputErrorText = '',

            /**
             * Current page id.
             *
             * @private
             * @type {string}
             */
            page = '';

        /**
         * Sets up popup buttons.
         *
         * @private
         * @param {object} popupData Values of the popup content.
         */
        function setupPopupButtons(popupData) {
            var popup = document.getElementById(page + '-popup'),
                btnYes = document.getElementById(page + '-popup-yes-btn'),
                btnNo = document.getElementById(page + '-popup-no-btn'),
                footerBtn = document.getElementById(page + '-popup-footer');

            tau.widget.Button(btnYes).value(popupData.btnYesText);
            if (popupData.btnNoText) {
                tau.widget.Button(btnNo).value(popupData.btnNoText);
                btnNo.classList.remove(HIDDEN_CLASS);
                popup.classList.remove(SINGLE_BUTTON_POPUP_CLASS);
                popup.classList.add(DOUBLE_BUTTON_POPUP_CLASS);
                footerBtn.classList.add(TWO_FOOTER_BTNS_GRID);
            } else {
                btnNo.classList.add(HIDDEN_CLASS);
                popup.classList.add(SINGLE_BUTTON_POPUP_CLASS);
                popup.classList.remove(DOUBLE_BUTTON_POPUP_CLASS);
                footerBtn.classList.remove(TWO_FOOTER_BTNS_GRID);
            }
        }

        /**
         * Sets up popup content.
         *
         * @private
         * @param {number} popupType Type of the popup to display.
         * @param {object} popupData Values of the popup content.
         */
        function setupPopupContent(popupType, popupData) {
            var title = document.getElementById(page + '-popup-title'),
                text = document.getElementById(page + '-popup-text'),
                progress = document.getElementById(page + '-popup-progress'),
                input = document.getElementById(page + '-popup-input'),
                inputContainer = document.getElementById(
                    page + '-popup-input-container');

            title.innerHTML = popupData.title;

            text.classList.add(HIDDEN_CLASS);
            progress.classList.add(HIDDEN_CLASS);
            inputContainer.classList.add(HIDDEN_CLASS);

            switch (popupType) {
                case POPUP_TYPES.PROGRESS:
                    text.innerHTML = popupData.text;
                    tau.widget.Progress(progress).value(0);
                    text.classList.remove(HIDDEN_CLASS);
                    progress.classList.remove(HIDDEN_CLASS);
                    break;
                case POPUP_TYPES.INPUT:
                    input.value = popupData.input;
                    inputContainer.classList.remove(HIDDEN_CLASS);
                    break;
                default:
                    text.innerHTML = popupData.text;
                    text.classList.remove(HIDDEN_CLASS);
            }
        }

        /**
         * Shows customized popup.
         *
         * @memberof FMRadio/views/popup
         * @public
         * @param {string} pageId Id of the current page.
         * @param {number} popupType Type of the popup to display.
         * @param {object} popupData Values of the popup content.
         */
        function showPopup(pageId, popupType, popupData) {
            var popup = document.getElementById(pageId + '-popup');

            if (typeof popupData.validator !== 'function') {
                console.warn('popupData.validator is not a function.');
            }

            page = pageId;
            successCallback = popupData.btnYesCallback;
            closeCallback = popupData.exitCallback;
            validator = popupData.validator;
            inputErrorText = popupData.inputErrorText;

            setupPopupButtons(popupData);
            setupPopupContent(popupType, popupData);

            tau.widget.Popup(popup).open();
        }

        /**
         * Invokes callback on popup close.
         *
         * @private
         */
        function onPopupClose() {
            if (closeCallback) {
                closeCallback();
            }
        }

        /**
         * Shows error text for input value.
         *
         * @private
         */
        function showInputError() {
            var text = document.getElementById(page + '-popup-text');

            text.classList.remove(HIDDEN_CLASS);
            text.classList.add(INPUT_ERROR_CLASS);
            text.innerHTML = inputErrorText;
        }

        /**
         * Hides error text for input value.
         *
         * @private
         */
        function hideInputError() {
            var text = document.getElementById(page + '-popup-text');

            text.classList.add(HIDDEN_CLASS);
            text.classList.remove(INPUT_ERROR_CLASS);
        }

        /**
         * Handles popup yes button click.
         *
         * @private
         */
        function popupYesClicked() {
            var popup = document.getElementById(page + '-popup'),
                input = document.getElementById(page + '-popup-input'),
                isValid = true;

            if (validator) {
                isValid = validator(input.value);
            }
            if (isValid) {
                if (successCallback) {
                    hideInputError();
                    successCallback(input.value);
                }
                tau.widget.Popup(popup).close();
            } else {
                showInputError();
            }
        }

        /**
         * Updates progress popup value.
         *
         * @memberof FMRadio/views/popup
         * @public
         * @param {number} progressValue Progress value in percent.
         * @param {number} stationsFound Number of found stations.
         */
        function updateProgress(progressValue, stationsFound) {
            var text = document.getElementById(page + '-popup-text'),
                progress = document.getElementById(page + '-popup-progress'),
                progressBar = tau.widget.Progress(progress);

            text.innerHTML = 'Stations found: ' + stationsFound;
            progressBar.value(Math.floor(progressValue));
            if (progressValue === 100) {
                tau.closePopup();
                progressBar.value(0);
            }
        }

        /**
         * Returns 'true' if the given name is valid, 'false' otherwise.
         *
         * @memberof FMRadio/views/popup
         * @public
         * @param {string} input Input to validate.
         * @returns {boolean}
         */
        function nameValidator(input) {
            if (input.length >= STATION_NAME_LENGTH_MIN &&
                    input.length <= STATION_NAME_LENGTH_MAX) {
                return true;
            }
            return false;
        }

        /**
         * Returns 'true' if the given frequency is valid, 'false' otherwise.
         *
         * @memberof FMRadio/views/popup
         * @public
         * @param {string} input Input to validate.
         * @returns {boolean} Is input valid.
         */
        function frequencyValidator(input) {
            return !isNaN(input);
        }

        /**
         * Binds events.
         *
         * @private
         */
        function bindEvents() {
            var mainPopup = document.getElementById('main-page-popup'),
                stationsPopup = document.getElementById('stations-page-popup'),
                mainY = document.getElementById('main-page-popup-yes-btn'),
                statY = document.getElementById('stations-page-popup-yes-btn');

            mainPopup.addEventListener('popupafterclose', onPopupClose);
            stationsPopup.addEventListener('popupafterclose', onPopupClose);
            mainY.addEventListener('click', popupYesClicked);
            statY.addEventListener('click', popupYesClicked);
        }

        /**
         * Initializes module.
         *
         * @memberof FMRadio/views/popup
         * @public
         */
        function init() {
            bindEvents();
        }

        return {
            init: init,
            POPUP_TYPES: POPUP_TYPES,
            showPopup: showPopup,
            updateProgress: updateProgress,
            nameValidator: nameValidator,
            frequencyValidator: frequencyValidator,
            STATION_NAME_LENGTH_MIN: STATION_NAME_LENGTH_MIN,
            STATION_NAME_LENGTH_MAX: STATION_NAME_LENGTH_MAX
        };
    }
});
