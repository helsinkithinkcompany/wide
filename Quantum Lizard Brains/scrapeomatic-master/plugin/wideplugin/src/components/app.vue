<template>
    <div id="popup-content">
        <div class="pure-form pure-form-stacked">
        <fieldset>
            <div class="pure-g">
                <div class="pure-u-5-24"></div>
                <div class="pure-u-14-24 l-box scrape pure-button pure-button-primary"> Scrape </div>
                <div class="pure-u-5-24"></div>
            </div>
            <div v-if="showKeywordsLoading" class="sub-title">Loading ...</div>
            <div v-if="showKeywords">
            <div id="keywords-title" class="sub-title hidden">Keywords:</div>
            <form class="pure-form">
            <div id="keywords-list" v-for="(kw, index) in keywords">
                <label :for="'selected-keyword' + index" class="pure-checkbox">
                    <input :id="'selected-keyword' + index" v-model="selectedKeywords" :value="kw.label" type="checkbox" checked>
                    {{ kw.label }} (score: {{kw.score.toFixed(2)}})
                </label>
            </div>
            </form>
            </div>
        </fieldset>
        </div>
    
        <div class="pure-form pure-form-stacked">
        <fieldset>
            <div class="pure-g">
                <div class="pure-u-5-24"></div>
                <div class="pure-u-14-24 search pure-button pure-button-primary">Search</div>
                <div class="pure-u-5-24"></div>
            </div>
            <div v-if="showSearchResults">
                <div id="datasets-title" class="sub-title hidden">Sources:</div>
                <div id="dataset-list" v-for="(source, index) in uniqueSources">
                    <label :for="'selected-source' + index" class="pure-checkbox">
                        <input :id="'selected-source' + index" type="checkbox" checked>
                        {{ source }}
                    </label>
                </div>
            </div>
        </fieldset>
        </div>

        
        <div v-if="showSearchLoading" class="sub-title">Loading ...</div>
        <div v-if="showSearchResults">
        <div id="datasets-title" class="sub-title hidden">Results:</div>
            <div v-for="res in searchResults.datasets">
                <div><strong>Title: </strong>{{ res.title }}</div>
                <div><strong>Abstract: </strong>{{ res.abstract.substr(0, 100) }}</div>
                <div><strong>Source: </strong>{{ res.source }}</div>
                <template v-for="link in res.links">
                    <div><strong>URL: </strong><a v-bind:href="link">{{ link }}</a></div>
                </template>
                <hr />
            </div>
        </div>
        
        <!-- <div v-show="totalResponseCount" class="button show-more">Show more results</div> -->
        <div v-show="totalResponseCount" class="pure-g">
                <div class="pure-u-5-24"></div>
                <div class="pure-u-14-24 l-box show-more pure-button pure-button-primary"> Show more </div>
                <div class="pure-u-5-24"></div>
            </div>
        <div id="error-content" class="hidden">
            <p>Can't execute content script on this page. Check extension configuration.</p>
        </div>

    </div>
</template>

<script>
    // export default { }
    module.exports = {
        data () {
            return {
                keywords: [],
                searchResults: [],
                annifSources: [],
                datasetSources: [],
                selectedKeywords: [],
                publishedStartDate: null,
                publishedEtartDate: null,
                showKeywords: false,
                showSearchResults: false,
                totalResponseCount: null,
                showKeywordsLoading: false,
                showSearchLoading: false,
            }
        },
        computed: {
            uniqueSources: function() {
            var sources   = [];

            this.searchResults.datasets.forEach(function (res) {
                var source = res.source;

                if (sources.indexOf(source) === -1) {
                    sources.push(source);
                }
            });

            return sources;
            }
        },
        methods: {
            sendScrapeActionToTab: function(tabs) {
                var vm = this;
                vm.showKeywords = false;
                vm.showSearchResults = false;
                vm.showKeywordsLoading = true;
                browser.tabs.sendMessage(
                    tabs[0].id,
                    { action: 'scrape' }
                ).then(response => {
                    console.log("Message from the content script scrape:");
                    console.log(response);
                    vm.keywords = response.keywords;
                    response.keywords.forEach(function (res) {
                        var keyword = res.label;

                        if (vm.selectedKeywords.indexOf(keyword) === -1) {
                            vm.selectedKeywords.push(keyword);
                        }
                    });
                    vm.showKeywordsLoading = false;
                    vm.showKeywords = true;
                }).catch(function(err) {
                    vm.showKeywordsLoading = false;
                    console.log('ffffffffff');
                    console.log(err);
                });
            },

            searchDatasets: function(tabs) {
                // search request wouldn't normally require involvement from the tab content script,
                // but for some reason http requests do not work from the background script.......
                console.log('searching datasets...');
                var vm = this;
                vm.showSearchLoading = true;
                browser.tabs.sendMessage(
                    tabs[0].id,
                    { action: 'search', keywords: vm.selectedKeywords }
                ).then(response => {
                    console.log("Message from the content script search:");
                    console.log(response);
                    vm.totalResponseCount = response.results.datasets.length
                    vm.searchResults = response.results;
                    vm.showSearchLoading = false;
                    vm.showSearchResults = true;
                }).catch(function(err) {
                    vm.showSearchLoading = false;
                    console.log('fffffffff');
                    console.log(err);
                });
            },

            showMore: function(tabs) {
                var vm = this;
                var creating = browser.tabs.create({
                    url:"http://localhost:8000?keywords=" + encodeURIComponent( JSON.stringify(vm.keywords) )
                });
            },

            listenForClicks: function() {
                document.addEventListener("click", (e) => {
                    // console.log(e.target.classList);
                    if (e.target.classList.contains("scrape")) {
                        browser.tabs.query({ active: true, currentWindow: true })
                            .then(this.sendScrapeActionToTab)
                            .catch(error => {
                                console.error(err);
                            });
                    }
                    else if (e.target.classList.contains("search")) {
                        browser.tabs.query({ active: true, currentWindow: true })
                            .then(this.searchDatasets)
                            .catch(error => {
                                console.error(err);
                            });
                    }
                    else if (e.target.classList.contains("show-more")) {
                        browser.tabs.query({ active: true, currentWindow: true })
                            .then(this.showMore)
                            .catch(error => {
                                console.error(err);
                            });
                    }
                });
            },

            reportExecuteScriptError: function(error) {
                document.querySelector("#error-content").classList.remove("hidden");
                console.error(`Failed to execute beastify content script: ${error.message}`);
            }
        },

        created () { 
            console.log('app created()...');
            browser.tabs.executeScript({file: "/content_scripts/content_script.js"})
                .then(this.listenForClicks)
                .catch(this.reportExecuteScriptError);
        }
    }
</script>

<style scoped>
    .hidden {
        display: none;
    }
    .button {
        border: 1px solid black;
        padding: 3px;
        margin: 3% auto;
        padding: 4px;
        text-align: center;
        font-size: 1.5em;
        cursor: pointer;
    }
    .popup-content {
        height: 20em;
            width: 20em;
    }
    .generic-list {
        text-align: center;
    }
    .sub-title {
        text-align: center;
    }

    .show-more {

    }

    .pure-g > div {
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
    }
    .l-box {
        padding: 1em;
    }

    .pure-button {
        /* background-color: #1f8dd6; */
        /* color: white; */
        padding: 0.5em 2em;
        border-radius: 5px;
    }

    .pure-button-primary {
        /* background: white; */
        /* color: #1f8dd6; */
        border-radius: 5px;
        font-size: 120%;
    }

</style>
