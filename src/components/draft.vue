<template>
  <div class="draft">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="廣告名稱">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="廣告版型">
        <el-select v-model="form.layouts" placeholder="請選擇廣告版型">
          <el-option label="展開版型" value="expand"></el-option>
          <el-option label="俄羅斯方塊版型" value="tetris"></el-option>
        </el-select>
      </el-form-item>
      <div v-if="form.layouts == 'tetris'">
        <el-form-item label="圖片路徑">
          <el-input v-model="tetris.path"></el-input>
        </el-form-item>
        <el-form-item label="圖片比例">
          <el-input v-model="tetris.ratio"></el-input>
        </el-form-item>
        <el-form-item label="方塊欄數">
          <el-input v-model="tetris.columns"></el-input>
        </el-form-item>
        <el-form-item label="方塊列數">
          <el-input v-model="tetris.rows"></el-input>
        </el-form-item>
      </div>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即創建</el-button>
        <el-button @click="clearLocalStorage">claer</el-button>
        <el-button @click="testState">state</el-button>
        <router-link :to="{ name:'demo' }" target="_blank" class="demolink">Demo</router-link>
      </el-form-item>
    </el-form>

    <div class="output">
      <textarea row="15" style="width:400px;height:400px;" v-model="showJs"></textarea>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import { tetrisImg } from "../../src/js/tetris.js";
export default {
  name: "draft",
  props: {
    msg: String
  },
  data() {
    return {
      form: {
        name: "",
        layouts: "",
        type: [],
      },
      tetris: {
        path: "http://lorempixel.com/320/100/",
        ratio: "32:10",
        columns: 12,
        rows: 4
      },
      options: {},
      showJs: "預設值為空"
    };
  },
  computed: {},
  methods: {
    ...mapMutations("demo", ["changeOptions", "changeLayout"]),
    onSubmit() {
      if (!this.form.layouts) {
        this.$message.error("No layouts value");
      } else if (this.form.layouts == "expand") {
        console.log("it is expand");
      } else if (this.form.layouts == "tetris") {

        let options = {
          image: this.tetris.path,
          bannerRatio: this.tetris.ratio,
          columns: this.tetris.columns,
          rows: this.tetris.rows
        };

        // vuex
        this.changeLayout(this.form.layouts);
        this.changeOptions(options);

        console.log('tetris js =');

        let append =
          `
          var TetrisImg=function(n){function e(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return n[o].call(r.exports,r,r.exports,e),r.l=!0,r.exports}var t={};return e.m=n,e.c=t,e.d=function(n,t,o){e.o(n,t)||Object.defineProperty(n,t,{configurable:!1,enumerable:!0,get:o})},e.n=function(n){var t=n&&n.__esModule?function(){return n.default}:function(){return n};return e.d(t,'a',t),t},e.o=function(n,e){return Object.prototype.hasOwnProperty.call(n,e)},e.p="/dist/components",e(e.s=0)}([function(n,e){function t(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}var o=Object.assign||function(n){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&(n[o]=t[o])}return n},r=function(){function n(n,e){for(var t=0;t<e.length;t++){var o=e[t];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(n,o.key,o)}}return function(e,t,o){return t&&n(e.prototype,t),o&&n(e,o),e}}(),i=function(){function n(e){t(this,n);var r=e.request_id&&''!=e.request_id.trim()?e.request_id:'[request_id]';if(this.defaultConfig={el:'#vmfive-ad-unit-container-'+r,request_id:r,'image:image1':'[image:image1]',enableExpand:!0,onBackgroundImageOnLoad:[],bannerRatio:'32:9',columns:5,rows:5},this.config=o({},this.defaultConfig,e),this.config.el='string'==typeof this.config.el?document.querySelector(this.config.el):this.config.el,null===this.config.el)throw new Error('Something wrong with your el param');this.config.el.insertAdjacentHTML('beforeend',this.template);var i=this;this.rootView=this.config.el,this.containerBlock=this.rootView.querySelector('#vmfive-ad-container-'+i.config.request_id+' .block'),this.init()}return r(n,[{key:'init',value:function(){var n=this;!function(e){function t(){var t=n.config.onBackgroundImageOnLoad&&Array.isArray(n.config.onBackgroundImageOnLoad)?n.config.onBackgroundImageOnLoad:[],o=n.config.rows,r=n.config.columns;t.forEach(function(t){'function'==typeof t&&t(n,{e:e,rows:o,columns:r})})}var o=n.containerBlock,r=o.currentStyle||window.getComputedStyle(o,!1),i=r.backgroundImage.slice(4,-1).replace(/"/g,""),o=new Image;o.src=i,o.complete?t():o.onload=function(){t()}}()}},{key:'template',get:function(){for(var n=this,e=n.config.columns,t=n.config.rows,o=e*t,r=document.createElement("div"),i=void 0,a=100/e,c=+n.config.bannerRatio.split(':')[1]/+n.config.bannerRatio.split(':')[0],s=n.config.el.getBoundingClientRect().width,l=s*c/t,u=1;u<=o;u++){i=document.createElement("div"),i.className='block block'+u;var f=void 0,g=void 0;f=(u-1)%e*s/e,g=l*Math.floor((u-1)/e),i.style.backgroundPosition='-'+f+'px -'+g+'px',r.insertAdjacentHTML('beforeend',i.outerHTML)}return'\n      \t'+r.innerHTML+'\n\n      <style>\n      #vmfive-ad-container-'+n.config.request_id+' .block {\n        text-align: center;\n        display: inline-block;\n        width: '+a+'%;\n        height: '+l+'px;\n        margin: 0;\n\t\t\t\tbackground: url(\''+n.config['image:image1']+'\') no-repeat bottom;\n\t\t\t\tbackground-size: '+s+'px;\n\n        -webkit-transform: translateY(-100vh);\n        -moz-transform: translateY(-100vh);\n        -o-transform: translateY(-100vh);\n        -ms-transform: translateY(-100vh);\n        transform: translateY(-100vh);\n      }\n      </style>\n      '}}]),n}();try{n.exports=i}catch(n){}}]);var sc = document.createElement("script");
tetris({
el: vmfiveAdUnitContainer,
request_id: 3456,
"image:image1": "` +
          this.tetris.path +
          `",
bannerRatio: "` +
          this.tetris.ratio +
          `",
columns: ` +
          this.tetris.columns +
          `,
rows: ` +
          this.tetris.rows +
          `,
onBackgroundImageOnLoad: []
			});
    `;
        this.showJs = append;
      }
    },

    clearLocalStorage() {
      window.localStorage.removeItem("demoOptions");
    },
    testState() {
      const demoOp = JSON.parse(localStorage.getItem("demoOptions"));
      console.log("this demo options", demoOp);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.demolink {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  -webkit-appearance: none;
  text-align: center;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  outline: 0;
  margin: 0;
  -webkit-transition: 0.1s;
  transition: 0.1s;
  font-weight: 500;
  margin-left: 10px;
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 4px;
}
</style>
