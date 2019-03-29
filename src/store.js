import Vue from "vue";
import Vuex from "vuex";
import app from "./vuex/modules/app";
import demo from "./vuex/modules/demo";

Vue.use(Vuex);

const localStoragePlugin = store => {
  store.subscribe((mutation, value) => {
    if (mutation.type === "demo/changeLayout") {
      window.localStorage.setItem(
        "demoLayout",
        JSON.stringify(value.demo.demoLayout)
      );
    }
    if (mutation.type === "demo/changeOptions") {
      window.localStorage.setItem(
        "demoOptions",
        JSON.stringify(value.demo.demoOptions)
      );
    }
  });
};

const store = new Vuex.Store({
  modules: {
    app,
    demo
  },

  //將 localStoragePlugin 引用進來
  plugins: [localStoragePlugin]
});

export default store;
