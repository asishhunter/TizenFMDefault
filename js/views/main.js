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

/*global define, tau, document*/

/**
 * Module main.
 *
 * @module views/main
 * @requires {@link core/event}
 * @requires {@link FMRadio/models/radio}
 * @requires {@link FMRadio/models/stations}
 * @requires {@link FMRadio/views/popup}
 * @requires {@link FMRadio/views/stationList}
 * @namespace FMRadio/views/main
 * @memberof FMRadio/views
 */
define({
    name: 'views/main',
    requires: [
        'core/event',
        'models/radio',
        'models/stations',
        'views/popup',
        'views/stationList'
    ],
    def: function viewsMain(req) {
        'use strict';

        /**
         * Event module object.
         *
         * @private
         * @type {Module}
         */
        var e = req.core.event,

            /**
             * Radio module object.
             *
             * @private
             * @type {Module}
             */
            radio = req.models.radio,

            /**
             * Stations module object.
             *
             * @private
             * @type {Module}
             */
            stations = req.models.stations,

            /**
             * Popup module object.
             *
             * @private
             * @type {Module}
             */
            popup = req.views.popup,

            /**
             * Unnamed class value.
             *
             * @private
             * @const {string}
             */
            UNNAMED_CLASS = 'unnamed',

            /**
             * Label displaying the station name.
             *
             * @private
             * @type {HTMLElement}
             */
            nameLabel = document.getElementById('station-name'),

            /**
             * Label displaying the frequency.
             *
             * @private
             * @type {HTMLElement}
             */
            frequencyLabel = document.getElementById('station-frequency'),

            /**
             * Boolean preventing too fast successive click on buttons.
             *
             * @private
             * @type {boolean}
             */
            buttonBlock = false;

        /**
         * Refreshes saved stations buttons state.
         *
         * @private
         */
        function refreshStationButtons() {
            var stationsBtn = document.getElementById('stations-button'),
                nextStationBtn = document.getElementById('station-next-button'),
                prevStationBtn = document.getElementById('station-prev-button'),
                stationsCount = stations.getStationList().length,
                tauButton = tau.widget.Button;

            if (stationsCount) {
                tauButton(stationsBtn).enable();
                if (stationsCount > 1) {
                    tauButton(nextStationBtn).enable();
                    tauButton(prevStationBtn).enable();
                } else {
                    tauButton(nextStationBtn).disable();
                    tauButton(prevStationBtn).disable();
                }
            } else {
                tauButton(stationsBtn).disable();
                tauButton(nextStationBtn).disable();
                tauButton(prevStationBtn).disable();
            }
        }

        /**
         * Refreshes frequency and station name at main page.
         * Unblocks buttons.
         * Rounds current frequency value to number with one digit after comma.
         *
         * If station name is not set adds 'unnamed' CSS class.
         * Sets last played radio station frequency.
         *
         * Refreshes footer buttons.
         *
         * @private
         */
        function refreshStation() {
            var freq = radio.getFrequency(),
                name = stations.getStationName(freq);

            buttonBlock = false;
            frequencyLabel.textContent = freq.toFixed(1);
            nameLabel.textContent = name;

            if (name === 'UNNAMED') {
                nameLabel.classList.add(UNNAMED_CLASS);
            } else {
                nameLabel.classList.remove(UNNAMED_CLASS);
            }
            stations.setLastFrequency(freq);
            refreshStationButtons();
        }

        /**
         * Seeks the channel at lower frequency.
         *
         * @private
         */
        function seekDown() {
            if (!buttonBlock) {
                buttonBlock = true;
                radio.seekDown(refreshStation);
            }
        }

        /**
         * Seeks the channel at upper frequency.
         *
         * @private
         */
        function seekUp() {
            if (!buttonBlock) {
                buttonBlock = true;
                radio.seekUp(refreshStation);
            }
        }

        /**
         * Stops radio channel scan.
         *
         * @private
         */
        function scanStop() {
            radio.scanStop();
        }

        /**
         * Starts radio channel scan.
         *
         * @private
         */
        function onScanBtnClick() {
            popup.showPopup('main-page', popup.POPUP_TYPES.PROGRESS, {
                title: 'Scanning...',
                text: 'Found stations: 0',
                btnYesText: 'Cancel',
                btnYesCallback: scanStop
            });
            radio.scanStart();
        }

        /**
         * Handles click on mute button.
         *
         * @private
         */
        function onMuteBtnClick() {
            var muteIcon = document.getElementById('mute-icon'),
                soundIcon = document.getElementById('sound-icon');

            if (muteIcon.dataset.visible === 'true') {
                muteIcon.dataset.visible = false;
                soundIcon.dataset.visible = true;
                radio.setMuted(false);
            } else {
                muteIcon.dataset.visible = true;
                soundIcon.dataset.visible = false;
                radio.setMuted(true);
            }
        }

        /**
         * Tunes radio to frequency.
         *
         * @private
         * @param {number} frequency Frequency to tune.
         */
        function tune(frequency) {
            if (frequency < radio.minFrequency) {
                frequency = radio.maxFrequency;
            } else if (frequency > radio.maxFrequency) {
                frequency = radio.minFrequency;
            }
            radio.start(frequency);
            refreshStation();
        }

        /**
         * Tunes frequency down.
         *
         * @private
         */
        function tuneDown() {
            tune(radio.getFrequency() - 0.1);
        }

        /**
         * Tunes frequency up.
         *
         * @private
         */
        function tuneUp() {
            tune(radio.getFrequency() + 0.1);
        }

        /**
         * Switches current frequency and refreshes fields.
         *
         * @private
         * @param {Event} event Changed frequency event.
         */
        function switchToFrequency(event) {
            var details = event.detail;

            tune(details.frequency);
            tau.changePage('#main-page');
        }

        /**
         * Switches to next saved station.
         *
         * @private
         */
        function nextStation() {
            var nextFreq = stations.nextStation(radio.getFrequency());

            if (nextFreq) {
                tune(nextFreq);
            }
        }

        /**
         * Switches to previous saved station.
         *
         * @private
         */
        function prevStation() {
            var prevFreq = stations.prevStation(radio.getFrequency());

            if (prevFreq) {
                tune(prevFreq);
            }
        }

        /**
         * Saves station.
         *
         * @private
         * @param {string} stationName Station name.
         */
        function saveStationName(stationName) {
            stations.save(stationName, radio.getFrequency(), true);
            refreshStation();
        }

        /**
         * Saves current station.
         *
         * @private
         */
        function onStationNameClick() {
            var name = document.getElementById('station-name').textContent;

            if (name === 'UNNAMED') {
                name = '';
            }

            popup.showPopup('main-page', popup.POPUP_TYPES.INPUT, {
                title: 'Station name',
                btnYesText: 'Save',
                btnYesCallback: saveStationName,
                btnNoText: 'Cancel',
                input: name,
                validator: popup.nameValidator,
                inputErrorText: 'Station name length should be between ' +
                                    popup.STATION_NAME_LENGTH_MIN + ' and ' +
                                    popup.STATION_NAME_LENGTH_MAX
            });
        }

        /**
         * Opens popup with frequency change input.
         *
         * @private
         */
        function onFrequencyLabelClick() {
            popup.showPopup('main-page', popup.POPUP_TYPES.INPUT, {
                title: 'Switch to frequency',
                btnYesText: 'Ok',
                btnYesCallback: tune,
                btnNoText: 'Cancel',
                input: radio.getFrequency(),
                validator: popup.frequencyValidator,
                inputErrorText: 'Frequency must be a number.'
            });
        }

        /**
         * Changes page to station list.
         *
         * @private
         */
        function onStationsBtnClick() {
            tau.changePage('#stations-page');
        }

        /**
         * Binds events.
         *
         * @private
         */
        function bindEvents() {
            var tuneDownBtn = document.getElementById('tune-down-button'),
                tuneUpBtn = document.getElementById('tune-up-button'),
                previousBtn = document.getElementById('previous-button'),
                nextBtn = document.getElementById('next-button'),
                muteBtn = document.getElementById('mute-button'),
                scanBtn = document.getElementById('scan-button'),
                stationsBtn = document.getElementById('stations-button'),
                nextStationBtn = document.getElementById('station-next-button'),
                prevStationBtn = document.getElementById('station-prev-button');

            tuneDownBtn.addEventListener('click', tuneDown);
            tuneUpBtn.addEventListener('click', tuneUp);
            previousBtn.addEventListener('click', seekDown);
            nextBtn.addEventListener('click', seekUp);
            muteBtn.addEventListener('click', onMuteBtnClick);
            scanBtn.addEventListener('click', onScanBtnClick);
            nameLabel.addEventListener('click', onStationNameClick);
            frequencyLabel.addEventListener('click', onFrequencyLabelClick);
            stationsBtn.addEventListener('click', onStationsBtnClick);
            nextStationBtn.addEventListener('click', nextStation);
            prevStationBtn.addEventListener('click', prevStation);

            e.listeners({
                'views.stationList.switchToFrequency': switchToFrequency,
                'views.stationList.refreshStation': refreshStation,
                'views.stationList.refreshStationButtons':
                    refreshStationButtons,
                'models.radio.switchToFrequency': switchToFrequency,
                'models.stations.switchToFrequency': switchToFrequency
            });

        }

        /**
         * Initializes module.
         *
         * @memberof FMRadio/views/main
         * @public
         */
        function init() {
            bindEvents();
            radio.initialize();
        }

        return {
            initialize: init
        };
    }
});
