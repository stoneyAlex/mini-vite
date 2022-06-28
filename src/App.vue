<!--
 * @Author: shimingxia
 * @Date: 2022-06-27 20:37:54
 * @LastEditors: shimingxia
 * @LastEditTime: 2022-06-27 20:40:01
 * @Description: 
-->
<template>
  <div>
    {{name}}
  </div>
</template>
<script>
  export default {
    setup() {
      const name = 'Stoney'
      return {
        name
      }
    }
  }
</script>
<style scoped>
  body {
    background-color: yellow;
  }
</style>