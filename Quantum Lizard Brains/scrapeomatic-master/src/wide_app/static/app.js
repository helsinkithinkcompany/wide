
var text = 'A robot may not injure a human being or, through inaction, allow a human being to come to harm. A robot must obey the orders given it by human beings except where such orders would conflict with the First Law.A robot must protect its own existence as long as such protection does not conflict with the First or Second Laws'

var app = new Vue({
    el: '#app',
    data () {
        return {
            scrapeInput: null,
            selectedKeywords: [],
            keywords: [],
            searchResults: [],
            annifSources: [],
            datasetSources: [],
            publishedStartDate: null,
            publishedEtartDate: null,
            showKeywords: false,
            showSearchResults: false,
            youtubeLink: null,
            showKeywordsLoading: false,
            showSearchLoading: false,
            recursionLevel: 0
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
        scrape: function(tabs) {
            console.log('SCRAPING !');
            var vm = this;
            vm.showSearchResults = false;
            vm.searchResults = [];
            vm.selectedKeywords = [];
            vm.keywords = [];
            vm.showKeywords = false;
            vm.showSearchResults = false;
            if (!vm.scrapeInput) {
                return;
            }
            vm.showKeywordsLoading = true;
            this.$http.post('/scrape', { content: vm.scrapeInput }).then(response => {
                console.log('scrape ok');
                console.log(response);
                vm.keywords = response.body.keywords;
                response.body.keywords.forEach(function (res) {
                    var keyword = res.label;

                    if (vm.selectedKeywords.indexOf(keyword) === -1) {
                        vm.selectedKeywords.push(keyword);
                    }
                });
                vm.showKeywordsLoading = false;
                vm.showKeywords = true;
            }, response => {
                vm.showKeywordsLoading = false;
                console.log('fffffffffff');
                console.log(response);
            });
        },

        scrapeYoutube: function(tabs) {
            console.log('SCRAPING !');
            var vm = this;
            vm.showSearchResults = false;
            vm.searchResults = [];
            vm.selectedKeywords = [];
            vm.keywords = [];
            vm.showKeywords = false;
            vm.showSearchResults = false;
            if (!vm.youtubeLink) {
                return;
            }
            vm.showKeywordsLoading = true;
            this.$http.post('/scrape', { youtube: true, link: vm.youtubeLink }).then(response => {
                console.log('scrape ok');
                console.log(response);
                vm.keywords = response.body.keywords;
                response.body.keywords.forEach(function (res) {
                    var keyword = res.label;

                    if (vm.selectedKeywords.indexOf(keyword) === -1) {
                        vm.selectedKeywords.push(keyword);
                    }
                });
                vm.showKeywordsLoading = false;
                vm.showKeywords = true;
            }, response => {
                vm.showKeywordsLoading = false;
                console.log('fffffffffff');
                console.log(response);
            });
        },

        scrapeAbstract: function(abstract, recursionLevel) {
            console.log('SCRAPING ABSTRACT!');
            var vm = this;
            // vm.showKeywords = false;
            // vm.showSearchResults = false;
            this.$http.post('/scrape', { content: abstract }).then(response => {
                console.log('scrape ok');
                console.log(response);
                abstractkw = []
                vm.keywords = response.body.keywords;
                response.body.keywords.forEach(function (res) {
                    var keyword = res.label;

                    if (abstractkw.indexOf(keyword) === -1) {
                        abstractkw.push(keyword);
                    }
                });
                console.log(window.location.host);
                console.log(window.location.hostname);
                window.location.href = 'http://localhost:8000/?keywords=' + encodeURIComponent( JSON.stringify(vm.keywords) ) + '&recursion=' + (recursionLevel + 1);
            }, response => {
                console.log('fffffffffff');
                console.log(response);
            });
        },

        searchDatasets: function(tabs) {
            // search request wouldn't normally require involvement from the tab content script,
            // but for some reason http requests do not work from the background script.......
            console.log('searching datasets...');
            var vm = this;
            vm.showSearchResults = false;
            vm.showSearchLoading = true;
            this.$http.post('/search', { content: vm.selectedKeywords }).then(response => {
                console.log('search ok');
                console.log(response);
                vm.searchResults = response.body.results;
                vm.showSearchLoading = false;
                vm.showSearchResults = true;
            }, response => {
                vm.showSearchLoading = false;
                console.log('fffffffffff');
                console.log(response);
            });
        },

        uploadFile: function(tabs) {
            var vm = this;
            vm.searchResults = [];
            vm.showSearchResults = false;
            vm.selectedKeywords = [];
            vm.keywords = [];
            vm.showKeywords = false;
            vm.showKeywordsLoading = true;

            const files = document.querySelector('[type=file]').files;
            const formData = new FormData();

            for (let i = 0; i < files.length; i++) {
                let file = files[i];

                formData.append('files[]', file);
            }

            this.$http.post('/upload', formData).then(response => {
                console.log('upload ok');
                console.log(response);
                vm.keywords = response.body.keywords;
                response.body.keywords.forEach(function (res) {
                    var keyword = res.label;

                    if (vm.selectedKeywords.indexOf(keyword) === -1) {
                        vm.selectedKeywords.push(keyword);
                    }
                });
                vm.showKeywordsLoading = false;
                vm.showKeywords = true;
            }, response => {
                vm.showKeywordsLoading = false;
                console.log('fffffffffff');
                console.log(response);
            });
        },

        listenForClicks: function() {
            document.addEventListener("click", (e) => {
                if (e.target.classList.contains("scrape")) {
                    this.scrape();
                }
                else if (e.target.classList.contains("search")) {
                    this.searchDatasets();
                }
                else if (e.target.classList.contains("upload-file")) {
                    this.uploadFile();
                }
                else if (e.target.classList.contains("scrape-youtube")) {
                    this.scrapeYoutube();
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
        this.listenForClicks();
        var urlParams = new URLSearchParams(window.location.search);
        console.log(urlParams);
        var localSelectedKeywords = [];
        var rcKeywords = urlParams.get('keywords');
        var recursionLevel = urlParams.get('recursion');
        if (rcKeywords) {
            // console.log(this.selectedKeywords);
            this.keywords = JSON.parse(decodeURIComponent(rcKeywords));

            this.keywords.forEach(function (res) {
                var keyword = res.label; 

                if (localSelectedKeywords.indexOf(keyword) === -1) {
                    localSelectedKeywords.push(keyword);
                }
            });
            this.selectedKeywords = localSelectedKeywords;
            this.showKeywordsLoading = false;
            this.showKeywords = true;
            this.searchDatasets();
        }
        if (recursionLevel) {
            this.recursionLevel = parseInt(recursionLevel);
        }
    }
})
