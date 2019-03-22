<template>
  <div class="home">
    <el-steps :space="200" :active="1" finish-status="success">
		<el-step title="制定Container"></el-step>
		<el-step title="plugins"></el-step>
		<el-step title="產出"></el-step>
    </el-steps>
    <Draft />
  </div>
</template>

<script>
// @ is an alias to /src
import Draft from "@/components/draft.vue";

export default {
  name: "home",
  components: {
    Draft
  }
};
</script>
