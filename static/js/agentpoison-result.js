
//Formatter to generate charts
var chartFormatter = function (cell, formatterParams, onRendered) {
    var content = document.createElement("span");
    var values = cell.getValue();

    //invert values if needed
    if (formatterParams.invert) {
        values = values.map(val => val * -1);
    }

    //add values to chart and style
    content.classList.add(formatterParams.type);
    content.inneHrTML = values.join(",");

    //setup chart options
    var options = {
        width: 50,
        // min: 0.0,
        // max: 100.0,
    }

    if (formatterParams.fill) {
        options.fill = formatterParams.fill
    }

    //instantiate piety chart after the cell element has been aded to the DOM
    onRendered(function () {
        peity(content, formatterParams.type, options);
    });

    return content;
};



var colorFormatter = function (cell, formatterParams) {
    var value = cell.getValue();

    // Check for the specific string "-"
    if (value === "-") {
        return value;
    }

    // Default values
    var defaults = {
        min: 0.0,
        max: 100.0,
        startColor: { r: 255, g: 255, b: 255 },
        endColor: { r: 215, g: 98, b: 204 }
    };

    // Override defaults with provided formatterParams values
    var min = (formatterParams && formatterParams.min) || defaults.min;
    var max = (formatterParams && formatterParams.max) || defaults.max;
    var startColor = (formatterParams && formatterParams.startColor) || defaults.startColor;
    var endColor = (formatterParams && formatterParams.endColor) || defaults.endColor;

    // Normalize the value between 0 and 1
    var normalizedValue = (value - min) / (max - min);

    // Compute the color gradient 
    var red = Math.floor(startColor.r + (endColor.r - startColor.r) * normalizedValue);
    var green = Math.floor(startColor.g + (endColor.g - startColor.g) * normalizedValue);
    var blue = Math.floor(startColor.b + (endColor.b - startColor.b) * normalizedValue);

    // make sure the value is rounded to 1 decimal place
    value = parseFloat(value).toFixed(1)

    return "<span style='display: block; width: 100%; height: 100%; background-color: rgb(" + red + ", " + green + ", " + blue + ");'>" + value + "</span>";
}


var barColorFn = function (value, formatterParams) {
    var defaults = {
        range: [-50, 50],
        low: { r: 255, g: 100, b: 150 },
        high: { r: 150, g: 255, b: 150 }
    };

    // Override defaults with provided formatterParams values

    var low_range = (formatterParams && formatterParams.range[0]) || defaults.range[0];
    var high_range = (formatterParams && formatterParams.range[1]) || defaults.range[1];
    var low = (formatterParams && formatterParams.low) || defaults.low;
    var high = (formatterParams && formatterParams.high) || defaults.high;

    // Clamp the value to the range [-100, 100]
    value = Math.max(low_range, Math.min(high_range, value));
    var range = high_range - low_range;

    // Normalize the value to the range [0, 1]
    var normalizedValue = (value + range / 2) / range;
    // Interpolate between the two colors based on the normalized value
    var interpolated = {
        r: Math.floor(low.r + (high.r - low.r) * normalizedValue),
        g: Math.floor(low.g + (high.g - low.g) * normalizedValue),
        b: Math.floor(low.b + (high.b - low.b) * normalizedValue)
    };

    return 'rgba(' + interpolated.r + ',' + interpolated.g + ',' + interpolated.b + ',0.9)';
}

document.addEventListener('DOMContentLoaded', function () {
    Promise.all([
        fetch('/data/agentpoison/main_result.json').then(response => response.json()),
        fetch('/data/agentpoison/human_eval.json').then(response => response.json()),
        fetch('/data/agentpoison/alignment.json').then(response => response.json()),
        fetch('/data/agentpoison/safety.json').then(response => response.json()),
    ])
        .then(([
            main_tabledata,
            human_tabledata,
            alignment_tabledata,
            safety_tabledata,
            quality_tabledata,
            bias_tabledata]) => {


            // Initialize Tabulator
            var table = new Tabulator("#main-table", {
                data: main_tabledata,
                layout: "fitColumns",
                responsiveLayout: "collapse",
                movableColumns: false,
                columnDefaults: {
                    tooltip: true,
                },
                columns: [
                    { title: "Agent Backbone", field: "Agent_Backbone", headerHozAlign: "center", headerVAlign: "middle", widthGrow: 2.0, minWidth: 135 },
                    { title: "Method", field: "Method", headerHozAlign: "center", headerVAlign: "middle", widthGrow: 1.5, minWidth: 100 },
                    {
                        title: "Agent-Driver",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "ASR-r", field: "Agent_Driver_ASR_r", headerHozAlign: "center", hozAlign: "center", minWidth: 75, formatter: colorFormatter },
                            { title: "ASR-a", field: "Agent_Driver_ASR_a", headerHozAlign: "center", hozAlign: "center", minWidth: 75, formatter: colorFormatter },
                            { title: "ASR-t", field: "Agent_Driver_ASR_t", headerHozAlign: "center", hozAlign: "center", minWidth: 75, formatter: colorFormatter },
                            { title: "ACC", field: "Agent_Driver_ACC", headerHozAlign: "center", hozAlign: "center", minWidth: 75, formatter: colorFormatter },
                        ],
                    },
                    {
                        title: "ReAct-StrategyQA",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "ASR-r", field: "ReAct_StrategyQA_ASR_r", headerHozAlign: "center", hozAlign: "center", minWidth: 75, formatter: colorFormatter },
                            { title: "ASR-a", field: "ReAct_StrategyQA_ASR_a", headerHozAlign: "center", hozAlign: "center", minWidth: 75, formatter: colorFormatter },
                            { title: "ASR-t", field: "ReAct_StrategyQA_ASR_t", headerHozAlign: "center", hozAlign: "center", minWidth: 75, formatter: colorFormatter },
                            { title: "ACC", field: "ReAct_StrategyQA_ACC", headerHozAlign: "center", hozAlign: "center", minWidth: 75, formatter: colorFormatter },
                        ],
                    },
                    {
                        title: "EHRAgent",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "ASR-r", field: "EHRAgent_ASR_r", headerHozAlign: "center", hozAlign: "center", minWidth: 75, formatter: colorFormatter },
                            { title: "ASR-a", field: "EHRAgent_ASR_a", headerHozAlign: "center", hozAlign: "center", minWidth: 75, formatter: colorFormatter },
                            { title: "ASR-t", field: "EHRAgent_ASR_t", headerHozAlign: "center", hozAlign: "center", minWidth: 75, formatter: colorFormatter },
                            { title: "ACC", field: "EHRAgent_ACC", headerHozAlign: "center", hozAlign: "center", minWidth: 75, formatter: colorFormatter },
                        ],
                    },
                ],
            });

            // 2. Human Evaluation Table
            human_tabledata.forEach(row => {
                row.line = [row['1'], row['2'], row['3'], row['4'], row['5'], row['6']]
            })

            var human_eval_table = new Tabulator("#human-table", {
                data: human_tabledata,
                layout: "fitColumns",
                responsiveLayout: "collapse",
                movableColumns: false,
                columnDefaults: {
                    tooltip: true,
                },
                columns: [
                    { title: "Model", field: "Model", headerHozAlign: "center", headerVAlign: "middle", widthGrow: 2.0, minWidth: 150 },
                    {
                        title: "Alignment",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "FR", field: "Alignment_FR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "RR", field: "Alignment_RR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "AR", field: "Alignment_AR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "AV", field: "Alignment_AV", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter }
                        ]
                    },
                    {
                        title: "Safety",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "FR", field: "Safety_FR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "RR", field: "Safety_RR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "AR", field: "Safety_AR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "AV", field: "Safety_AV", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter }
                        ]
                    },
                    {
                        title: "Bias",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "FR", field: "Bias_FR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "RR", field: "Bias_RR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "AR", field: "Bias_AR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "AV", field: "Bias_AV", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter }
                        ]
                    }
                ],
                initialSort: [
                    { column: "Alignment_AR", dir: "asc" },
                    { column: "Safety_AR", dir: "asc" },
                    { column: "Bias_AR", dir: "asc" }
                ],
            });

            // 3. Alignment Table
            alignment_tabledata.forEach(row => {
                row.line = [row['1'], row['2'], row['3'], row['4'], row['5'], row['6']]
            })

            var alignment_table = new Tabulator("#alignment-table", {
                data: alignment_tabledata,
                layout: "fitColumns",
                responsiveLayout: "collapse",
                movableColumns: false,
                columnDefaults: {
                    tooltip: true,
                },
                columns: [
                    { title: "Model", field: "Model", headerHozAlign: "center", headerVAlign: "middle", widthGrow: 2.0, minWidth: 180 },
                    { title: "Object", field: "Object", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter },
                    { title: "Attribute", field: "Attribute", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter },
                    { title: "Action", field: "Action", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter },
                    { title: "Location", field: "Location", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter },
                    { title: "Count", field: "Count", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter },
                    { title: "Avg", field: "Avg", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter },
                ],
                initialSort: [
                    { column: "Avg", dir: "desc" },
                ],
            });

            // 4. Safety Table
            safety_tabledata.forEach(row => {
                row.line = [row['1'], row['2'], row['3'], row['4'], row['5'], row['6']]
            })

            var safety_table = new Tabulator("#safety-table", {
                data: safety_tabledata,
                layout: "fitColumns",
                responsiveLayout: "collapse",
                movableColumns: false,
                columnDefaults: {
                    tooltip: true,
                },
                columns: [
                    { title: "Model", field: "Model", headerHozAlign: "center", headerVAlign: "middle", widthGrow: 2.0, minWidth: 150 },
                    {
                        title: "Toxicity",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "Crime", field: "Toxicity_Crime", headerHozAlign: "center", hozAlign: "center", minWidth: 90, formatter: colorFormatter },
                            { title: "Shocking", field: "Toxicity_Shocking", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter },
                            { title: "Disgust", field: "Toxicity_Disgust", headerHozAlign: "center", hozAlign: "center", minWidth: 90, formatter: colorFormatter },
                            { title: "Avg", field: "Toxicity_Avg", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 90, formatter: colorFormatter }
                        ]
                    },
                    {
                        title: "NSFW",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "Evident", field: "NSFW_Evident", headerHozAlign: "center", hozAlign: "center", minWidth: 90, formatter: colorFormatter },
                            { title: "Evasive", field: "NSFW_Evasive", headerHozAlign: "center", hozAlign: "center", minWidth: 90, formatter: colorFormatter },
                            { title: "Subtle", field: "NSFW_Subtle", headerHozAlign: "center", hozAlign: "center", minWidth: 90, formatter: colorFormatter },
                            { title: "Avg", field: "NSFW_Avg", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 90, formatter: colorFormatter }
                        ]
                    },
                    { title: "Avg", field: "Avg", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 90, formatter: colorFormatter }
                ],
                initialSort: [
                    { column: "Avg", dir: "desc" },
                ],
            });

        });

})