import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./registerServiceWorker";

import Autocomplete from "v-autocomplete";

// You need a specific loader for CSS files like https://github.com/webpack/css-loader
import "v-autocomplete/dist/v-autocomplete.css";

Vue.use(Autocomplete);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
