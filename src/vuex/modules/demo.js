var _ = require("lodash");

const state = {
  demoOptions: [],
  demoLayout: ""
};

const getters = {
  demoOptions: state => state.demoOptions,
  demoLayout: state => state.demoLayout
};

const actions = {};

const mutations = {
  changeLayout(state, value) {
    state.demoLayout = value;
  },
  changeOptions(state, value) {
    state.demoOptions = value;
  }
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
};
