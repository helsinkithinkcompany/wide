import Purecss from 'purecss'
import Vue from 'vue';
import App from './components/app.vue'

new Vue({
    el: '#app',
    components: {
        App, Purecss
    },
    render(h) {
        return h('app');
    }
});

