<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu-demo"
    mode="horizontal"
    @select="handleSelect"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b"
  >
    <el-menu-item index="1">主頁</el-menu-item>
    <el-submenu index="2">
      <template slot="title"
        >我的工作台</template
      >
      <el-menu-item index="2-1">選項1</el-menu-item>
      <el-menu-item index="2-2">選項2</el-menu-item>
      <el-menu-item index="2-3">選項3</el-menu-item>
      <el-submenu index="2-4">
        <template slot="title"
          >選項4</template
        >
        <el-menu-item index="2-4-1">選項1</el-menu-item>
        <el-menu-item index="2-4-2">選項2</el-menu-item>
        <el-menu-item index="2-4-3">選項3</el-menu-item>
      </el-submenu>
    </el-submenu>
    <el-menu-item index="3" disabled>消息中心</el-menu-item>
    <el-menu-item index="4"><a href="" target="_blank">管理</a></el-menu-item>
  </el-menu>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: "1"
    };
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    }
  }
};
</script>
