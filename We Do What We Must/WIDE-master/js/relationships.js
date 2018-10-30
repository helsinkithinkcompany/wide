function getFromWeb(url) {

    let response;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          let xhr_result = xhr.responseText;
          response = JSON.parse(xhr_result);
        }
      }
    }
    xhr.send();
    return response;
}

//take finto api, use yso vocab and search find the uri for the first result
function getUriForWord(word) {
    let url = "http://api.finto.fi/rest/v1/search?vocab=yso&query=" + word + "&lang=fi";
    let response = getFromWeb(url);
    return response.results[0].uri;
}

//find the broader concepts for the given uri
function goBroader(uri) {
    let url = "http://api.finto.fi/rest/v1/yso/broader?uri=" + uri;
    let response = getFromWeb(url);
    return response.broader;
}

//find the narrower concepts for the given uri
function goNarrower(uri) {
    let url = "http://api.finto.fi/rest/v1/yso/narrower?uri=" + uri;
    let response = getFromWeb(url);
    return response;
}

/*
takes a word and finds the broader concepts after which it takes those concepts and finds their child nodes
which we assume are the original words siblings

then it filters the original word from the sibling list and returns a json object with the original word and a array of siblings
*/
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

/*
finds the result count of two words all records that either of the two words
then it looks for the result count of all the records that have both of the words
it calculates their ratio AND/OR that gives their relevance to each other

*/
function pairCount(word1, word2) {
    let urlOr = "https://api.finna.fi/v1/search?bool0[]=OR&lookfor0[]=" + word1 + "&lookfor0[]=" + word2 + "&limit=0";
    let urlAnd = "https://api.finna.fi/v1/search?bool0[]=AND&lookfor0[]=" + word1 + "&lookfor0[]=" + word2 + "&limit=0";
    let responseOr = getFromWeb(urlOr).resultCount;
    let responseAnd = getFromWeb(urlAnd).resultCount;
    let ratio = responseAnd / responseOr;

    return ({"word1": word1, "word2": word2, "ORcount": responseOr, "ANDcount": responseAnd, "ratio": ratio});
}

/*
finds the result count for both the word1 and a second word
then it calculates their ratio AND/word1resultcount
*/
function hitsforOriginal(word1, word1ResultCount, word2) {
    let urlAnd = "https://api.finna.fi/v1/search?bool0[]=AND&lookfor0[]=" + word1 + "&lookfor0[]=" + word2 + "&limit=0";
    let responseAnd = getFromWeb(urlAnd).resultCount;
    let ratio = responseAnd / word1ResultCount;

    return ({"word1": word1, "word2": word2, "Word1Count": word1ResultCount, "ANDcount": responseAnd, "ratio": ratio});
}

/*
takes siblingwords json object and calculates the ratio of hits for all possible word pairs
*/
function pairs(siblingwords) {
    let array = [];
    let limit = siblingwords.siblings.length;
    for (let i = 0; i < limit; i++) {
        for (let j = i + 1; j < limit; j++) {
            let result = pairCount(siblingwords.siblings[i], siblingwords.siblings[j]);
            array = [...array, result];
        }
    }
    return array;
}

//finds the result count for a a single word
function resultCountForWord(word) {
    let url = "https://api.finna.fi/v1/search?&lookfor=" + word + "&limit=0";
    let response = getFromWeb(url);
    return response.resultCount;
}

/*
calculates the 
*/
function relationToMain(stuff) {
    let subject = stuff.subject;
    let resultCountForSubject = resultCountForWord(subject);
    let siblings = stuff.siblings;
    let array = [];
    for (let i in siblings) {
        let results = hitsforOriginal(subject, resultCountForSubject, siblings[i]);
        array.push(results);
    }
    array.sort(function(a,b){
        return parseFloat(a.ratio) - parseFloat(b.ratio);
    });
    return array;
}

function graphData(subjectToSiblings, siblingsToEachOther) {
    let nodes = [{"id": subjectToSiblings[0].word1, "group": 1}];
    let siblingNodes = subjectToSiblings.map(function(a) {
        return {"id": a.word2, "group": 1};
    });
    nodes = [...nodes, ...siblingNodes];

    let links;
    // let first = subjectToSiblings.map(function(a) {
    //     return {"source": a.word1, "target": a.word2, "value": a.ratio};
    // });
    let second = siblingsToEachOther.map(function(a) {
        return {"source": a.word1, "target": a.word2, "value": a.ratio};
    });

    links = second;

    return {"nodes": nodes, "links": links};
}

function print(data) {
    document.body.innerHTML = "<pre>" + JSON.stringify(data, null, 2) + "<pre>";
}

function newSiblingWords(pairArray, subject) {
    let array = pairArray.map(function(a) {
        return a.word2;
    });

    array = [subject, ...array];

    return {"subject": subject, "siblings": array};
}

function getItDone(word) {
    let siblingWords = getSiblingWords(word);
    let subjectToSiblings = relationToMain(siblingWords);
    subjectToSiblings = subjectToSiblings.slice(subjectToSiblings.length - 5);
    let newSiblings = newSiblingWords(subjectToSiblings, siblingWords.subject);
    let siblingsToEachOther = pairs(newSiblings);
    let data = graphData(subjectToSiblings, siblingsToEachOther);
    let array = data.links.sort(function(a, b) {
        return a.value - b.value;
    });
    let biggestValue = array[array.length - 1].value;
    array = array.map(function(a) {
        let newVal = Math.round(a.value / biggestValue * 10);
        return {"source": a.source, "target": a.target, "value": newVal};
    });
    data = {"nodes": data.nodes, "links": array};
    return data;
}

