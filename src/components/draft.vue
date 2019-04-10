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
      <div v-if="form.layouts == 'expand'">
        <el-form-item label="圖片路徑">
          <el-input v-model="expand.path"></el-input>
        </el-form-item>
        <el-form-item label="圖片比例">
          <el-input v-model="expand.ratio"></el-input>
        </el-form-item>
        <el-form-item label="展開模式">
          <el-input v-model="expand.expandMode"></el-input>
        </el-form-item>
      </div>
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
        <router-link :to="{ name: 'demo' }" target="_blank" class="demolink"
          >Demo</router-link
        >
      </el-form-item>
    </el-form>

    <div class="output">
      <textarea
        row="15"
        style="width:400px;height:400px;"
        v-model="showJs"
      ></textarea>
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
// import { tetrisImg } from "../../src/js/tetris.js";
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
        type: []
      },
      expand: {
        el: "vmfiveAdUnitContainer.adContainerInner",
        path: "http://lorempixel.com/320/100/",
        ratio: "32:10",
        expandMode: "full"
      },
      tetris: {
        el: "vmfiveAdUnitContainer.adContainerInner",
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
        let options = {
          image: this.expand.path,
          bannerRatio: this.expand.ratio,
          enableExpand: true,
          expandMode: this.expand.expandMode,
          layoutGrid: "2",
          layoutExpand: "1"
        };

        // vuex
        this.changeLayout(this.form.layouts);
        this.changeOptions(options);

        let append =
          `
          let vmfiveAdUnitContainer = new BannerContainer2({
            request_id: 3456,
            bannerRatio: "` +
          this.tetris.ratio +
          `",
            enableExpand: true,
            expandMode: ` +
          this.expand.expandMode +
          `,
          });
          `;
        this.showJs = append;
      } else if (this.form.layouts == "tetris") {
        let options = {
          image: this.tetris.path,
          bannerRatio: this.tetris.ratio,
          columns: this.tetris.columns,
          rows: this.tetris.rows,
        };

        // vuex
        this.changeLayout(this.form.layouts);
        this.changeOptions(options);

        let append =
          `
          tetris({
            el: "`+this.tetris.el+`"
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
