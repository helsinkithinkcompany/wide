function getFromWeb(url) {
    let response;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
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

function getUriForWord(word) {
    let url = "http://api.finto.fi/rest/v1/search?vocab=yso&query=" + word + "&lang=fi";
    let response = getFromWeb(url);
    return response.results[0].uri;
}

function goBroader(uri) {
    let url = "http://api.finto.fi/rest/v1/yso/broader?uri=" + uri;
    let response = getFromWeb(url);
    return response.broader;
}

function goNarrower(uri) {
    let url = "http://api.finto.fi/rest/v1/yso/narrower?uri=" + uri;
    let response = getFromWeb(url);
    return response;
}

function getSiblingWords(word) {
    try {
    let array = [];
    let wordUri = getUriForWord(word);
    let broaderArray = goBroader(wordUri);
    for (let i in broaderArray) {
        let broaderUri = broaderArray[i].uri;
        let siblings = goNarrower(broaderUri);
        let mapped = siblings.narrower.map(function(word) { return word.prefLabel });
        mapped = mapped.filter(sibling => word !== sibling);
        array = [...array, ...mapped];
    }

    let jsonObj = {"subject": word, "siblings": array};
    return jsonObj;
    } catch (err) {
        console.error(err);
        return({"subject": word, "siblings":[]})
    }
}