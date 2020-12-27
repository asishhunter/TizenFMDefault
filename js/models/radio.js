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

/*global define, tizen*/

/**
 * Module radio.
 *
 * @module models/radio
 * @requires {@link core/event}
 * @requires {@link FMRadio/models/stations}
 * @requires {@link FMRadio/views/popup}
 * @namespace FMRadio/models/radio
 * @memberof FMRadio/models
 */
define({
    name: 'models/radio',
    requires: [
        'core/event',
        'models/stations',
        'views/popup'
    ],
    def: function modelsRadio(req) {
        'use strict';

        /**
         * Event module object.
         *
         * @private
         * @type {Module}
         */
        var e = req.core.event,

            /**
             * Popup module object.
             *
             * @private
             * @type {Module}
             */
            popup = req.views.popup,

            /**
             * Stations module object.
             *
             * @private
             * @type {Module}
             */
            stations = req.models.stations,

            /**
             * Tizen radio object.
             *
             * @private
             * @type {FMRadioManager}
             */
            radio = null,

            /**
             * Minimal radio frequency.
             *
             * @memberof FMRadio/models/radio
             * @public
             * @type {number}
             */
            minFrequency = 87.5,

            /**
             * Maximal radio frequency.
             *
             * @memberof FMRadio/models/radio
             * @public
             * @type {number}
             */
            maxFrequency = 108.0,

            /**
             * Found stations counter.
             *
             * @private
             * @type {number}
             */
            stationCount = 0,

            /**
             * Frequency before scan to be restored after cancel.
             *
             * @private
             * @type {number}
             */
            frequencyBeforeScan = 0,

            /**
             * Scan callback.
             *
             * @private
             * @type {object}
             */
            scanCallback = {
                /**
                 * Called when new frequency have been found.
                 * Calculates move point of progress bar after finding next
                 * frequency.
                 *
                 * Increases number of found stations.
                 *
                 * Updates search progress bar and station count.
                 *
                 * @private
                 * @param {number} frequency Found frequency.
                 */
                onfrequencyfound: function onFrequencyFound(frequency) {
                    var range = (maxFrequency * 10) - (minFrequency * 10),
                        progress = ((frequency - minFrequency) * 1000) / range;

                    stationCount += 1;
                    popup.updateProgress(progress, stationCount);
                },
                /**
                 * Called when scanning has been completed.
                 * Updates progress bar and found stations count after scan
                 * frequencies.
                 *
                 * Saves found frequencies.
                 *
                 * Switches playing radio frequency to the first one found.
                 *
                 * @private
                 * @param {number[]} frequencies List of found frequencies.
                 * @fires models.radio.switchToFrequency
                 */
                onfinished: function onFinished(frequencies) {
                    var i = 0;

                    stationCount = frequencies.length;
                    popup.updateProgress(100, stationCount);
                    for (i = 0; i < stationCount; i += 1) {
                        stations.save('Station ' + (i + 1), frequencies[i]);
                    }
                    e.fire('switchToFrequency', {frequency: frequencies[0]});
                }
            },

            /**
             * Possible states of the radio.
             *
             * @private
             * @const {object}
             */
            RADIO_STATE = Object.freeze({
                PLAY: 'PLAYING',
                SCAN: 'SCANNING'
            }),

            /**
             * Interruption callback.
             *
             * @private
             * @type {object}
             */
            interruptCallback = null;

        /**
         * Returns radio state.
         *
         * @memberof FMRadio/models/radio
         * @public
         * @returns {string} State of the radio.
         */
        function getState() {
            return radio.state;
        }

        /**
         * Returns radio frequency.
         *
         * @memberof FMRadio/models/radio
         * @public
         * @returns {number} Radio frequency.
         */
        function getFrequency() {
            return Math.round(radio.frequency * 10) / 10;
        }

        /**
         * Sets radio muted state.
         *
         * @memberof FMRadio/models/radio
         * @public
         * @param {boolean} isMuted Should radio be muted.
         */
        function setMuted(isMuted) {
            radio.mute = isMuted;
        }

        /**
         * Starts radio at given frequency.
         *
         * @memberof FMRadio/models/radio
         * @public
         * @param {number} freq Frequency to be played.
         */
        function start(freq) {
            if (radio.state !== RADIO_STATE.SCAN) {
                radio.start(freq);
            }
        }

        /**
         * Stops radio.
         *
         * @memberof FMRadio/models/radio
         * @public
         */
        function stop() {
            if (radio.state === RADIO_STATE.PLAY) {
                radio.stop();
            }
        }

        /**
         * Performs action when the scanning process is stopped with success.
         *
         * @private
         */
        function scanStopSuccess() {
            start(frequencyBeforeScan);
            frequencyBeforeScan = 0;
        }

        /**
         * Shows error popup.
         *
         * @private
         * @param {Error} error Error object.
         */
        function errorCallback(error) {
            popup.showPopup('main-page', popup.POPUP_TYPES.TEXT, {
                title: error.name,
                btnYesText: 'OK',
                text: error.message
            });
        }

        /**
         * Seeks the channel at higher frequency.
         *
         * @memberof FMRadio/models/radio
         * @public
         * @param {function} successCb Function to call after finding channel.
         */
        function seekUp(successCb) {
            if (radio.state === RADIO_STATE.PLAY) {
                radio.seekUp(successCb, errorCallback);
            }
        }

        /**
         * Seeks the channel at lower frequency.
         *
         * @memberof FMRadio/models/radio
         * @public
         * @param {function} successCb Function to call after finding channel.
         */
        function seekDown(successCb) {
            if (radio.state === RADIO_STATE.PLAY) {
                radio.seekDown(successCb, errorCallback);
            }
        }

        /**
         * Starts scanning for channels.
         *
         * @memberof FMRadio/models/radio
         * @public
         */
        function scanStart() {
            if (radio.state === RADIO_STATE.PLAY) {
                radio.stop();
            }
            stationCount = 0;
            frequencyBeforeScan = getFrequency();
            radio.scanStart(scanCallback, errorCallback);
        }

        /**
         * Stops scanning for channels.
         *
         * @memberof FMRadio/models/radio
         * @public
         */
        function scanStop() {
            if (radio.state === RADIO_STATE.SCAN) {
                radio.scanStop(scanStopSuccess, errorCallback);
            }
        }

        /**
         * Listens for antenna connection status change.
         *
         * @private
         * @param {boolean} isAntennaConnected Is antenna connected.
         */
        function onChangeAntennaConnectionListener(isAntennaConnected) {
            if (isAntennaConnected) {
                start(getFrequency());
            }
        }

        /**
         * Initializes module.
         * Creates tizen fmradio object.
         * Sets frequency limits.
         * Adds radio listeners.
         * Sets frequency.
         * Plays radio.
         *
         *
         * @memberof FMRadio/models/radio
         * @public
         */
        function init() {
            var freq = 0;

            interruptCallback = {
                /**
                 * Called when radio playback is interrupted.
                 *
                 * @private
                 * @param {string} reason Interruption reason.
                 */
                oninterrupted: function onInterrputed(reason) {
                    popup.showPopup('main-page', popup.POPUP_TYPES.TEXT, {
                        title: 'Radio interrupted',
                        btnYesText: 'OK',
                        text: reason
                    });
                },
                /**
                 * Called when radio playback interruption is finished.
                 *
                 * @private
                 */
                oninterruptfinished: function onInterrputedFinish() {
                    start(getFrequency());
                }
            };
            radio = tizen.fmradio;
            minFrequency = radio.frequencyLowerBound;
            maxFrequency = radio.frequencyUpperBound;

            radio.setFMRadioInterruptedListener(interruptCallback);
            radio.setAntennaChangeListener(onChangeAntennaConnectionListener);

            freq = stations.getLastFrequency();
            if (!freq) {
                freq = minFrequency;
            }
            start(freq);
        }

        return {
            initialize: init,
            getState: getState,
            getFrequency: getFrequency,
            minFrequency: minFrequency,
            maxFrequency: maxFrequency,
            setMuted: setMuted,
            start: start,
            stop: stop,
            seekUp: seekUp,
            seekDown: seekDown,
            scanStart: scanStart,
            scanStop: scanStop
        };
    }
});
