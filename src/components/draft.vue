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
      <!-- <el-form-item label="活动时间">
        <el-col :span="11">
          <el-date-picker type="date" placeholder="选择日期" v-model="form.date1" style="width: 100%;"></el-date-picker>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-time-picker placeholder="选择时间" v-model="form.date2" style="width: 100%;"></el-time-picker>
        </el-col>
      </el-form-item>-->
      <el-form-item label="是否展開">
        <el-switch v-model="form.delivery"></el-switch>
      </el-form-item>
      <!-- <el-form-item label="活动性质">
        <el-checkbox-group v-model="form.type">
          <el-checkbox label="美食/餐厅线上活动" name="type"></el-checkbox>
          <el-checkbox label="地推活动" name="type"></el-checkbox>
          <el-checkbox label="线下主题活动" name="type"></el-checkbox>
          <el-checkbox label="单纯品牌曝光" name="type"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="特殊资源">
        <el-radio-group v-model="form.resource">
          <el-radio label="线上品牌商赞助"></el-radio>
          <el-radio label="线下场地免费"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="活动形式">
        <el-input type="textarea" v-model="form.desc"></el-input>
      </el-form-item>-->
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即創建</el-button>
        <el-button>取消</el-button>
        <router-link :to="{ name:'demo' }" target="_blank" class="demolink">Demo</router-link>
      </el-form-item>
    </el-form>

    <div class="output">
      <textarea row="15" style="width:400px;height:400px;" v-model="showJs"></textarea>
    </div>
  </div>
</template>

<script>
import { tetris } from "../../src/js/tetris.js";
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
        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: ""
      },
      showJs: "123"
    };
  },
  methods: {
    onSubmit() {
      if (!this.form.layouts) {
        this.$message.error("No layouts value");
      } else if (this.form.layouts == "expand") {
        console.log("it is expand");
      } else if (this.form.layouts == "tetris") {
        let vmfiveAdUnitContainer = document.querySelector(".output");
        let d = tetris({
          el: vmfiveAdUnitContainer,
          request_id: 3456,
          "image:image1": "http://lorempixel.com/320/100/",
          // 'image:foreground_image': '',

          bannerRatio: "32:10",

          columns: 12,
          rows: 4,

          onBackgroundImageOnLoad: []
        });

        let append = `
let d = tetris({
el: vmfiveAdUnitContainer,
request_id: 3456,
"image:image1": "http://lorempixel.com/320/100/",
// 'image:foreground_image': '',

bannerRatio: "32:10",

columns: 12,
rows: 4,

onBackgroundImageOnLoad: []
			});
		`;
        this.showJs = append;

        console.log("it is tetris", d);
      }
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
