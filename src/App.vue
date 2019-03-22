<template>
  <div class="wrapper">
    <router-view name="header"></router-view>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>