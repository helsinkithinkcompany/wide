(function() {
    /**
    * Check and set a global guard variable.
    * If this content script is injected into the same page again,
    * it will do nothing next time.
    */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;
    let log = console.log;

    function scrapeAction() {
        return POST('/scrape', { content: document.body.innerHTML })
    }

    function searchAction(keywords) {
        return POST('/search', { content: keywords })
    }

    function GET(url) {
        // Default options are marked with *
        return fetch('http://localhost:8000' + url, {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, cors, *same-origin
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            }
        })
        .then(response => {
            return response.json().then(data => {
                if (data) {
                    log('received ok response from GET');
                    log(data);
                    return data
                }
                return false;
            })
        });
    }

    function POST(url, data={}) {
        // Default options are marked with *
        return fetch('http://localhost:8000' + url, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, cors, *same-origin
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) {
                // throws to the below catch-block
                throw response;
            }
            return response.json().then(data => {
                if (data) {
                    log('received ok response from POST');
                    log(data);
                    return data
                }
                return false;
            })
        }).catch(function(error) {
            log('i guess the backend returned an error:');
            log(error);
            error.text().then( errorMessage => {
                log(errorMessage);
            });
        });
    }

  /**
   * Listen for messages from the background script.
   * Call "beastify()" or "reset()".
  */
    browser.runtime.onMessage.addListener(message => {
        log('content script received action:');
        log(message);
        if (message.action === 'scrape') {
            return scrapeAction();
        }
        else if (message.action === 'search') {
            return searchAction(message.keywords);
        }
        else {
            log(message);
            log('cant handle this type of action');
        }
    });

})();
