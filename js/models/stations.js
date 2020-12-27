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
 * Module stations.
 *
 * @module models/stations
 * @requires {@link core/event}
 * @requires {@link core/storage/idb}
 * @namespace FMRadio/models/stations
 * @memberof FMRadio/models
 */

define({
    name: 'models/stations',
    requires: [
        'core/event',
        'core/storage/idb'
    ],
    def: function modelsStations(req) {
        'use strict';

        /**
         * Event module object.
         *
         * @private
         * @type {Module}
         */
        var e = req.core.event,

            /**
             * Idb module object.
             *
             * @private
             * @type {Module}
             */
            idb = req.core.storage.idb,

            /**
             * List of saved stations.
             *
             * @private
             * @type {object[]}
             */
            stationList = [],

            /**
             * Last frequency listen.
             *
             * @private
             * @type {number}
             */
            lastFrequency = 0,

            /**
             * Database keys values.
             *
             * @private
             * @type {object}
             */
            dbKeys = {
                stations: 'stations',
                lastFrequency: 'lastFrequency'
            };

        /**
         * Compares two elements and returns difference between them.
         *
         * @private
         * @param {object} a First element.
         * @param {object} b Second element.
         * @returns {number}
         */
        function compare(a, b) {
            return a.frequency - b.frequency;
        }

        /**
         * Saves station list to database.
         *
         * @private
         */
        function saveToDatabase() {
            idb.add(dbKeys.stations, JSON.stringify(stationList));
            idb.add(dbKeys.lastFrequency, lastFrequency);
        }


        /**
         * Saves last frequency to database.
         *
         * @memberof FMRadio/models/stations
         * @public
         * @param {number} frequency Last frequency.
         */
        function setLastFrequency(frequency) {
            lastFrequency = frequency;
            saveToDatabase();
        }

        /**
         * Returns last tuned frequency.
         *
         * @memberof FMRadio/models/stations
         * @public
         * @returns {number}
         */
        function getLastFrequency() {
            return lastFrequency;
        }

        /**
         * Returns station list.
         *
         * @memberof FMRadio/models/stations
         * @public
         * @returns {object[]}
         */
        function getStationList() {
            return stationList;
        }

        /**
         * Returns station name for given frequency.
         *
         * @memberof FMRadio/models/stations
         * @public
         * @param {number} freq Frequency.
         * @returns {string} Name of the station.
         */
        function getStationName(freq) {
            var i = 0,
                station = null,
                length = stationList.length;

            for (i = 0; i < length; i += 1) {
                station = stationList[i];
                if (station.frequency === freq) {
                    return station.name;
                }
            }

            return 'UNNAMED';
        }

        /**
         * Saves station name to station list.
         *
         * @memberof FMRadio/models/stations
         * @public
         * @param {string} name Station name.
         * @param {number} frequency Station frequency.
         * @param {boolean} overwrite Should overwrite name if station exists.
         */
        function save(name, frequency, overwrite) {
            var i = 0,
                exists = false,
                station = null,
                length = stationList.length;

            for (i = 0; i < length; i += 1) {
                station = stationList[i];
                if (station.frequency === frequency) {
                    if (overwrite === true) {
                        station.name = name;
                    }
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                stationList.push({name: name, frequency: frequency});
                stationList.sort(compare);
            }

            saveToDatabase();
        }

        /**
         * Removes station from station list.
         *
         *
         * @memberof FMRadio/models/stations
         * @public
         * @param {number} frequency Frequency value to remove.
         */
        function remove(frequency) {
            var i = 0,
                station = null,
                length = stationList.length;

            for (i = 0; i < length; i += 1) {
                station = stationList[i];
                if (station.frequency === frequency) {
                    stationList.splice(i, 1);
                    break;
                }
            }
            saveToDatabase();
        }

        /**
         * Removes all stations from list.
         *
         *
         * @memberof FMRadio/models/stations
         * @public
         */
        function removeAll() {
            stationList = [];
            saveToDatabase();
        }

        /**
         * Tunes to next saved station and returns its frequency.
         *
         * @memberof FMRadio/models/stations
         * @public
         * @returns {number}
         */
        function nextStation(freq) {
            var i = 0,
                station = null,
                stationsLen = stationList.length;

            for (i = 0; i < stationsLen; i += 1) {
                station = stationList[i];
                if (station.frequency > freq) {
                    return station.frequency;
                }
            }
            return stationList[0].frequency;
        }

        /**
         * Tunes to previous saved station and returns its frequency.
         *
         * @memberof FMRadio/models/stations
         * @public
         * @returns {number}
         */
        function prevStation(freq) {
            var i = 0,
                station = null,
                stationsLen = stationList.length;

            for (i = stationsLen - 1; i >= 0; i -= 1) {
                station = stationList[i];
                if (station.frequency < freq) {
                    return station.frequency;
                }
            }
            return stationList[stationsLen - 1].frequency;
        }

        /**
         * Reads station list and last played frequency from database.
         *
         * @private
         */
        function queryDatabase() {
            if (idb.isReady()) {
                idb.get(dbKeys.stations);
                idb.get(dbKeys.lastFrequency);
            }
        }

        /**
         * Performs action when database values are read.
         *
         * @private
         * @param {Event} event Event on read database values.
         * @fires models.station.switchToFrequency
         */
        function queryCallback(event) {
            var data = event.detail;

            if (data.value) {
                if (data.key === dbKeys.stations) {
                    stationList = JSON.parse(data.value);
                } else if (data.key === dbKeys.lastFrequency) {
                    lastFrequency = data.value;
                    e.fire('switchToFrequency', {frequency: lastFrequency});
                }
            }
        }

        /**
         * Initializes module.
         *
         * @memberof FMRadio/models/stations
         * @public
         */
        function init() {
            if (idb.isReady()) {
                queryDatabase();
            } else {
                e.listen('core.storage.idb.open', queryDatabase);
            }
        }

        e.listen('core.storage.idb.read', queryCallback);

        return {
            init: init,
            setLastFrequency: setLastFrequency,
            getLastFrequency: getLastFrequency,
            getStationList: getStationList,
            getStationName: getStationName,
            save: save,
            remove: remove,
            removeAll: removeAll,
            nextStation: nextStation,
            prevStation: prevStation
        };
    }
});
