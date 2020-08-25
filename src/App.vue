<template>
  <div id="app">
    <!-- <mymap /> -->
    <!-- <test/> -->
    <!-- <leaflet-grid /> -->
    <!-- <vue3 /> -->
    <!-- <cesium /> -->
    <webgl />
    <!-- <router-view></router-view> -->
  </div>
</template>

<script>
/* eslint-disable */
import webgl from './components/webgl/ColorCube';
export default {
  name: "App",
  components: {
    webgl
  },
};
</script>

<style>
* {
  padding: 0;
  margin: 0;
}
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}
</style>
