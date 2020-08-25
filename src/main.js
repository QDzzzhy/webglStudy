import Vue from "vue";
import App from "./App.vue";
import animated from 'animate.css';

Vue.config.productionTip = false;
Vue.use(animated);

new Vue({
  render: (h) => h(App),
}).$mount("#app");
