import Home from "./views/Home.vue";
import About from "./views/About.vue";
import Nav from "./views/Nav.vue";
import Demo from "./views/demo.vue";

import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export const routes = [
  {
    path: "/",
    name: "home",
    components: {
      default: Home,
      header: Nav
    }
  },
  {
    path: "/draft",
    name: "draft",
    components: {
      default: Home,
      header: Nav
    }
  },
  {
    path: "/about",
    name: "about",
    components: {
      default: About,
      header: Nav
    }
  },
  {
    path: "/demo",
    name: "demo",
    components: {
      default: Demo
    }
  }
];
