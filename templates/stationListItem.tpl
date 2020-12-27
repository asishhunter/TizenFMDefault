{{#arr}}
    <li class="ui-li-static li-has-multiline li-has-right-btn" data-frequency="{{this.frequency}}">
        <span class="station-name">
            {{this.name}}
        </span>
        <span class="li-text-sub">{{this.frequency}} MHz</span>
        <div class="ui-btn second-right-icon" data-inline="true" data-icon="rename" data-style="circle"></div>
        <div class="ui-btn" data-inline="true" data-icon="delete" data-style="circle"></div>
    </li>
{{/arr}}