//Load vender
require('./vender');

// Vue
import Vue from "vue";
import Router from "vue-router";
import App from "./App.vue";

// Routes & Vuex
import { routes } from "./routes";
import store from "./store";

// SCSS
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './scss/app.scss'

Vue.config.productionTip = false;

Vue.use(ElementUI);

const router = new Router({
  routes,
  mode: "history",
  // base: process.env.BASE_URL,
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')