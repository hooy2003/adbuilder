const state = {
  User: {
    account: "",
    email: "",
    name: "",
    isLogin: false
  },
  errorState: {
    tel: "必須為數字",
    type: "格式不正確",
    what: "無效的資料",
    strange: "不得包括特殊符號"
  },
  isLoading: false
};

const getters = {
  User: state => state.User,
  errorState: state => state.errorState,
  isLoading: state => state.isLoading
};

const mutations = {
  setUserData(state, { userData }) {
    state.User.account = userData.email;
    state.User.name = userData.name;
    state.User.phone = userData.phone;
    state.User.isLogin = true;
  },
  clearUserData(state) {
    state.User.account = "";
    state.User.name = "";
    state.User.phone = "";
    state.User.isLogin = false;
  },
  editUserData(state, { value }) {
    state.User.email = value.email;
    state.User.name = value.name;
    state.User.phone = value.phone;
  },
  isLoading(state) {
    state.isLoading = !state.isLoading;
  }
};

const actions = {};

export default {
  state,
  getters,
  mutations
};
