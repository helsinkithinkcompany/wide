//var keywords = ["punk", "punkki"]
//var from = 1980
//var to = 2000

// Fetches data using the finna API
// Input: keywords -- array of keywords
//        from     -- start year
//        to       -- end year
function getData(keywords, from, to) {
    var dataSets = keywords.map(function (kw) {
        return dataPointsForSubject(kw, from, to);
    })
    return dataSets;
}

function reformatDataForLineChart(datasSets) {
    var reformatted = datasSets.map(function (dataSet) {
        var dataX = dataSet.points.map(p => p.year);
        var dataY = dataSet.points.map(p => p.count);
        var data1 = {
            "label": dataSet.subject,
            "x": dataX,
            "y": dataY
        };
        return data1;
    })

    return reformatted
}

function drawLineChart() {
    var button = document.getElementById("myButton").setAttribute("style", "display:none")

    var svgId = "line_chart";
    var startYearId = "start_date";
    var endYearId = "end_date";

    // fetch data from text fields
    var startYear = document.getElementById(startYearId).value;
    var endYear = document.getElementById(endYearId).value;
    var keywords = keywordArray;

    // Query data from Finna
    var dataDets = getData(keywords, startYear, endYear);

    // Reformat data for plotting
    var reformatted = reformatDataForLineChart(dataDets);

    // Populate SVG element
    makeLineChart(svgId, reformatted)

    // Normalized data
    var normalized = reformatted.map(function (dataSet) {
        var maxY = Math.max.apply(null, dataSet.y)
        var dataY = dataSet.y.map(val => val / maxY);
        var data1 = {
            "label": dataSet.label,
            "x": dataSet.x,
            "y": dataY
        };
        return data1;
    })


    makeLineChart("line_chart2", normalized)
}

//-----------------------------------------------------

// function to create force-directed graph
function drawGraph() {
    var keyword = document.getElementById("keyword_input").value;

    var data = getItDone(keyword);
    var svg = d3.select('#graph_elem');

    createV4SelectableForceDirectedGraph(svg, data);
}