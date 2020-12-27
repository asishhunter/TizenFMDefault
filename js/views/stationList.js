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
 * Station list module.
 *
 * @module views/stationList
 * @requires {@link core/event}
 * @requires {@link core/template}
 * @requires {@link FMRadio/models/stations}
 * @requires {@link FMRadio/views/popup}
 * @namespace FMRadio/views/stationList
 * @memberof FMRadio/views
 */
define({
    name: 'views/stationList',
    requires: [
        'core/event',
        'core/template',
        'models/stations',
        'views/popup'
    ],
    def: function viewsStationList(req) {
        'use strict';

        /**
         * Event module object.
         *
         * @private
         * @type {Module}
         */
        var e = req.core.event,

            /**
             * Template module object.
             *
             * @private
             * @type {Module}
             */
            tpl = req.core.template,

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
             * Rename icon class value.
             *
             * @private
             * @const {string}
             */
            RENAME_ICON_CLASS = 'ui-icon-rename',

            /**
             * Remove icon class value.
             *
             * @private
             * @const {string}
             */
            REMOVE_ICON_CLASS = 'ui-icon-delete',

            /**
             * Station list element.
             *
             * @private
             * @type {HTMLElement}
             */
            stationList = document.getElementById('station-list'),

            /**
             * Currently edited station frequency.
             *
             * @private
             * @type {number}
             */
            stationEditFreq = 0;

        /**
         * Toggles remove button state.
         *
         * @private
         * @fires views.stationList.refreshStationButtons
         */
        function setupRemoveButton() {
            var removeAllButton = document.getElementById('remove-all-button'),
                stationsCount = stations.getStationList().length;

            if (stationsCount) {
                tau.widget.Button(removeAllButton).enable();
            } else {
                tau.widget.Button(removeAllButton).disable();
                e.fire('refreshStationButtons');
            }
        }

        /**
         * Displays station list.
         *
         * @private
         */
        function displayStations() {
            var list = stations.getStationList();

            setupRemoveButton();

            stationList.innerHTML = tpl.get('stationListItem', {'arr': list});
            tau.engine.createWidgets(stationList);
            tau.widget.Listview(stationList).refresh();
        }

        /**
         * Edits station name on the list.
         *
         * @private
         * @param {string} name New station name.
         * @fires views.stationList.refreshStation
         */
        function updateName(name) {
            var i = 0,
                children = stationList.children,
                childrenLen = children.length,
                child = null;

            for (i = 0; i < childrenLen; i += 1) {
                child = children[i];
                if (Number(child.dataset.frequency) === stationEditFreq) {
                    child.getElementsByClassName('station-name')[0]
                        .innerHTML = name;
                    break;
                }
            }
            stations.save(name, stationEditFreq, true);
            e.fire('refreshStation');
        }

        /**
         * Removes item from the list.
         *
         * @private
         * @fires views.stationList.refreshStation
         */
        function remove() {
            var i = 0,
                children = stationList.children,
                childrenLen = children.length,
                child = null;

            for (i = 0; i < childrenLen; i += 1) {
                child = children[i];
                if (Number(child.dataset.frequency) === stationEditFreq) {
                    child.parentNode.removeChild(child);
                    break;
                }
            }

            stations.remove(stationEditFreq);
            setupRemoveButton();
            e.fire('refreshStation');
        }

        /**
         * Removes all items from the list.
         *
         * @private
         */
        function removeAll() {
            stationList.innerHTML = '';
            stations.removeAll();
            setupRemoveButton();
        }

        /**
         * Shows popup with confirmation about removing all items.
         *
         * @private
         */
        function onRemoveAllBtnClick() {
            popup.showPopup('stations-page', popup.POPUP_TYPES.TEXT, {
                title: 'Remove all stations',
                btnYesText: 'Yes',
                btnYesCallback: removeAll,
                btnNoText: 'No',
                text: 'Are you sure?'
            });
        }

        /**
         * Returns clicked HTML list element.
         *
         * @private
         * @param {HTMLElement} element Child element clicked.
         * @returns {HTMLElement}
         */
        function findClickedListElement(element) {
            var clickedLi = null;

            while (element) {
                if (element.dataset && element.dataset.frequency) {
                    clickedLi = element;
                    break;
                }
                element = element.parentNode;
            }

            return clickedLi;
        }

        /**
         * Handles click on list element.
         *
         * @private
         * @param {Event} event Pressed list element event.
         * @fires views.stationList.switchToFrequency
         */
        function onStationListClick(event) {
            var target = event.target,
                clickedLi = findClickedListElement(target),
                frequency = Number(clickedLi.dataset.frequency),
                name = clickedLi.getElementsByClassName('station-name')[0]
                    .innerHTML.trim();

            if (target.classList.contains(RENAME_ICON_CLASS)) {
                stationEditFreq = frequency;
                popup.showPopup('stations-page', popup.POPUP_TYPES.INPUT, {
                    title: 'Station name',
                    btnYesText: 'Save',
                    btnYesCallback: updateName,
                    btnNoText: 'Cancel',
                    input: name,
                    validator: popup.nameValidator,
                    inputErrorText: 'Station name length should be between ' +
                                        popup.STATION_NAME_LENGTH_MIN +
                                        ' and ' + popup.STATION_NAME_LENGTH_MAX
                });
            } else if (target.classList.contains(REMOVE_ICON_CLASS)) {
                stationEditFreq = frequency;
                popup.showPopup('stations-page', popup.POPUP_TYPES.TEXT, {
                    title: 'Remove station',
                    btnYesText: 'Yes',
                    btnYesCallback: remove,
                    btnNoText: 'No',
                    text: 'Are you sure?'
                });
            } else {
                e.fire('switchToFrequency', {frequency: frequency});
            }

        }

        /**
         * Binds events.
         *
         * @private
         */
        function bindEvents() {
            var page = document.getElementById('stations-page'),
                removeAllBtn = document.getElementById('remove-all-button');

            page.addEventListener('pagebeforeshow', displayStations);
            removeAllBtn.addEventListener('click', onRemoveAllBtnClick);
            stationList.addEventListener('click', onStationListClick);
        }

        /**
         * Initializes module.
         *
         * @memberof FMRadio/views/stationList
         * @public
         */
        function init() {
            bindEvents();
        }

        return {
            init: init
        };
    }
});
