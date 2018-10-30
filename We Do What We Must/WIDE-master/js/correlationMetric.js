
var mockData = {
    "subject": "punk",
    "points": [
        {
            "year": 1990,
            "count": 291
        },
        {
            "year": 1991,
            "count": 245
        },
        {
            "year": 1992,
            "count": 264
        },
        {
            "year": 1993,
            "count": 357
        },
        {
            "year": 1994,
            "count": 347
        },
        {
            "year": 1995,
            "count": 396
        },
        {
            "year": 1996,
            "count": 420
        },
        {
            "year": 1997,
            "count": 354
        },
        {
            "year": 1998,
            "count": 288
        },
        {
            "year": 1999,
            "count": 380
        },
        {
            "year": 2000,
            "count": 352
        }
    ]
};

var mock1 = {
    "subject": "punkReduced",
    "points": mockData.points.map(function (d) {
        var jsonDataPoint = {
            "year": d.year,
            "count": d.count - 100
        };
        return jsonDataPoint;
    })
}


// Normalize data to specific range
function normalize(data) {
    var vals = data.points.map(function (d) {
        return d.count;
    });
    var maxVal = Math.max.apply(null, vals)

    return {
        "subject": data.subject,
        "points": data.points.map(function (d) {
            return {
                "year": d.year,
                "count": d.count/maxVal
            };
        })
    }
}

// Compute normalized average change
function delta(data, y1, y2) {
    var count1 = data.points.find(function(v) {return v.year == y1}).count;
    var count2 = data.points.find(function(v) {return v.year == y2}).count;
    var delta = (count2-count1)/(y2-y1);
    var average = (count1+count2) / 2;
    return delta / average;
}

// Compute sliding delta
function slidingDelta(data, windowSize, start, end) {
    var rangeLength = end-start+1;
    var startIndices = [...Array(rangeLength-windowSize+1).keys()].map(function(i){return i+start});
    var deltas = startIndices.map(function(i){
        var j = i+windowSize-1;
        return delta(data, i, j);
    });
    return deltas;
}