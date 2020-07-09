window.$ = window.jQuery = window.jquery = require("jquery");

import Vue from 'vue'
import App from './App.vue'
import VueGoodTablePlugin from "vue-good-table";
import 'vue-good-table/dist/vue-good-table.css'

Vue.use(VueGoodTablePlugin);

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  created: function () {
    document.title = "Gacha Hell"
    document.querySelector('meta[name="description"]').setAttribute('content', 'random')
  }
}).$mount('#app')
