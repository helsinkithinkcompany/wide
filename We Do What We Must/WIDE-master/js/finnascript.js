function urlBuilder(searchTerm, year) {
    var yearStr = "" + year + " TO " + year;
    var url = "https://api.finna.fi/v1/search?lookfor=" + searchTerm + "&filter[]=search_daterange_mv:\"[" + yearStr + "]\"&limit=0";
    return url;
}

function searchFromFinna(searchTerm, year) {
    let response;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", urlBuilder(searchTerm, year), false);
    xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) { // on successful HTTP 200 OK response
          let xhr_result = xhr.responseText; // use JSON.Parse() if JSON responseText
          response = JSON.parse(xhr_result);
        }
      }
    }
    xhr.send();
    return response;
}

function dataPointsForSubject(searchTerm, from, to) {
    let array = [];
    for (let i = from; i <= to; i++) {
        let response = searchFromFinna(searchTerm, i);
        let point = {"year": i, "count": response.resultCount};
        array.push(point);
    }
    let jsonObj = {"subject": searchTerm, "points": array};
    return jsonObj;
}