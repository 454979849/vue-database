<template>
  <el-scrollbar wrap-class="scrollbar-wrapper">
    <div :style="sidebar.opened?'':'width:36px'" class="app-project-name">
      <span :style="sidebar.opened?'':'margin-left:-11px'" class="fa fa-cubes icon"/>
      <span>{{ generateTitle(projectName) }}</span>
    </div>
    <el-menu
      :show-timeout="200"
      :default-active="$route.path"
      :collapse="isCollapse"
      mode="vertical"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
    >
      <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path"/>
    </el-menu>
  </el-scrollbar>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarItem from './SidebarItem'
import { generateTitle } from '@/utils/i18n'

export default {
  components: { SidebarItem },
  computed: {
    ...mapGetters(['sidebar', 'projectName']),
    routes() {
      return this.$router.options.routes
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  methods: {
    generateTitle
  }
}
</script>
<style lang="scss" scoped>
.app-project-name {
  padding-left: 20px;
  text-align: left;
  height: 50px;
  background-color: #304161;
  color: #fff;
  font-size: 15px;
  line-height: 50px;
  cursor: Default;
  z-index: 9;
  width: 180px;
  overflow: hidden;
  -webkit-transition: width 0.28s;
  transition: width 280ms ease 0ms;
  .icon {
    margin-right: 5px;
  }
}
</style>
