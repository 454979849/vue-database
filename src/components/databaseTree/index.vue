<template>
  <div
    id="leftTree"
    class="border">
    <div class="tt themeBg">
      <span>数据源选择</span>
      <p class="iBox" @click="closeLeft">
        <i class="fa fa-angle-double-left"/>
      </p>
    </div>
    <div class="chooseSource">
      <el-select
        @change="changeSourceId"
        v-model="sourceId"
        placeholder="请选择数据源"
        style="width:94%;">
        <el-option
          v-for="item in sourceOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"/>
      </el-select>
    </div>
    <div
      v-loading="treeLoading"
      class="listWrap">
      <div class="whiteBg">
        <div
          v-for="(item,index) in treeConfig"
          :key="index"
          class="database">
          <p class="type ku">
            <i class="fa fa-caret-right"/>
            <i class="fa fa-database"/>
            <span>{{ item.name }}</span>
          </p>
          <div class="kuContent">
            <div class="tables biao">
              <i class="fa fa-caret-right"/>
              <span style="font-size:14px;">表</span>
            </div>
            <ul class="tableList biaoContent">
              <li
                v-for="(v,i) in item.children[0].children"
                :key="i">
                <p
                  class="tableName"
                  @click="showTableDetail({table:v,database:item})">
                  <img src="../../assets/imgs/calendar.png">
                  <span>{{ v.name }}</span>
                </p>
              </li>
              <MouseRightMenu
                :config="rightMenuConfig"
                @change="getMouseRightIndex(item,index,arguments)"/>
            </ul>
            <div class="tables biao">
              <i class="fa fa-caret-right"/>
              <span style="font-size:14px;">视图</span>
            </div>
            <ul class="tableList biaoContent">
              <li
                v-for="(v,i) in item.children[1].children"
                :key="i">
                <p
                  class="tableName"
                  @click="showTableDetail({table:v,database:item},true)">
                  <img src="../../assets/imgs/library.png">
                  <span>{{ v.name }}</span>
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <p class="iBox single" @click="openLeft">
      <i class="fa fa-angle-double-right"/>
    </p>
  </div>
</template>

<script>
  import MouseRightMenu from '@/components/MouseRightMenu'

  export default {
    name: 'DataBaseTree',
    components: { MouseRightMenu },
    props: {
      sourceOptions: {
        type: Array,
        default: []
      },
      treeConfig: {
        type: Array,
        default: []
      },
      treeLoading: {
        type: Boolean,
        default: false
      }
    },
    data() {
      const _this = this
      return {
        status: 0,
        mouseRightTableInfo: {},
        sourceId: '1',
        mouseRightIndex: -1,
        rightMenuConfig: [{
          icon: 'el-icon-tickets',
          title: '打开表',
          callback: function() {
            if (_this.mouseRightIndex !== -1) {
              _this.$emit('changeTable', _this.mouseRightTableInfo)
            }
          }
        }, {
          icon: 'el-icon-setting',
          title: '设计表',
          callback: function() {
            if (_this.mouseRightIndex !== -1) {
              _this.$emit('setTableByRightMouse', _this.mouseRightTableInfo)
            }
          }
        }, {
          icon: 'el-icon-plus',
          title: '新增表',
          callback: function() {
            if (_this.mouseRightIndex !== -1) {
              _this.$emit('addTable', _this.mouseRightTableInfo)
            }
          }
        }, {
          icon: 'el-icon-printer',
          title: '复制表',
          callback: function() {
            if (_this.mouseRightIndex !== -1) {
              _this.$emit('copyTable', _this.mouseRightTableInfo)
            }
          }
        }, {
          icon: 'el-icon-edit-outline',
          title: '重命名',
          callback: function() {
            if (_this.mouseRightIndex !== -1) {
              _this.$emit('tableRename', _this.mouseRightTableInfo)
            }
          }
        }, {
          icon: 'el-icon-delete',
          title: '删除表',
          callback: function() {
            if (_this.mouseRightIndex !== -1) {
              _this.$emit('deleteTable', _this.mouseRightTableInfo)
            }
          }
        }, {
          icon: 'el-icon-remove',
          title: '清空表',
          callback: function() {
            if (_this.mouseRightIndex !== -1) {
              _this.$emit('emptyTable', _this.mouseRightTableInfo)
            }
          }
        }, {
          icon: 'el-icon-remove',
          title: '表信息',
          callback: function() {
            if (_this.mouseRightIndex !== -1) {
              _this.$emit('tableInfo', _this.mouseRightTableInfo)
            }
          }
        }]
      }
    },
    methods: {
      changeSourceId(newSourceId) {
        this.$emit('changeSourceId', newSourceId)
      },
      showTableDetail(obj, bool) {
        this.$emit('changeTable', obj, bool)
      },
      getMouseRightIndex(databaseObj, databaseIndex, argument) {
        this.mouseRightIndex = argument[0]
        this.mouseRightTableInfo = {
          database: databaseObj,
          table: this.treeConfig[databaseIndex].children[0].children[this.mouseRightIndex]
        }
        this.$emit('getMouseRightTableInfo', {
          database: databaseObj,
          table: this.treeConfig[databaseIndex].children[0].children[this.mouseRightIndex]
        })
      },
      closeLeft() {
        $('#leftTree').animate({
          width: '26px'
        }, 200)
        $('#leftTree>div:not(.single)').hide()
        $('#leftTree>.single').addClass('active')
      },
      openLeft() {
        $('#leftTree').animate({
          width: '250px'
        }, 200)
        $('#leftTree>div:not(.single)').show()
        $('#leftTree>.single').removeClass('active')
      }
    },
    mounted() {
      const _this = this
      if (!$('html').data('hasBind')) {
        $(document).on('click', '.ku i:first-child,.biao i:first-child', function() {

          $(this).parent().next().slideToggle(200)
          if ($(this).hasClass('fa-caret-right')) {
            $(this).removeClass('fa-caret-right').addClass('fa-caret-down')
          } else if ($(this).hasClass('fa-caret-down')) {
            $(this).removeClass('fa-caret-down').addClass('fa-caret-right')
          }
        })
        $('html').data('hasBind', 1)
      }

      $(document).on('click', '.ku', function() {
        $('.ku').removeClass('active')
        $(this).addClass('active')
        let curName = $(this).find('span').text()
        _this.$emit('chooseDatabase', curName)
      })
    },
    watch: {
      treeConfig(val) {
        if (val.length && this.status == 0) {
          this.$nextTick(() => {
            this.status = 1
            $('.whiteBg>div:first-child .ku i:first-child').trigger('click')
            $('.whiteBg>div:first-child .biao i:first-child').trigger('click')
          })
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  //数据库页面主题色class定义
  $themeBg1: #f0f2f5;
  $themeColor1: #000;
  $themeBorder1: #d8dce5;

  $darkC: #000;
  $lightC: #fff;
  .theme1 {
    .border {
      border: 1px solid $themeBorder1;
    }

    .themeBg {
      background-color: $themeBg1;
    }

    .themeC {
      color: $themeColor1;
    }

    .text {
      color: $darkC;
    }
  }

  img {
    vertical-align: middle;
  }

  #leftTree {
    border-top: none;
    border-left: none;
    border-bottom: none;
    width: 250px;

    .ku.active {
      background-color: #409EFF;

      i, span {
        color: #fff !important;
      }
    }

    .single {
      display: none;

      &.active {
        display: block;
      }
    }

    p.iBox.single {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      text-align: center;
      line-height: 24px;
      margin-top: 5px;

      i {
        color: #000;
      }

      &:hover {

        i {
          color: #409EFF;
        }
      }
    }

    .kuContent, .biaoContent {
      display: none;

      &.active {
        display: block;
      }
    }

    .chooseSource {
      text-align: center;
      padding-top: 5px;
    }

    .tt {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 35px;
      font-size: 15px;
      padding: 0 5px;

      p.iBox {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        text-align: center;
        line-height: 24px;

        i {
          color: #000;
        }

        &:hover {
          background-color: #fff;

          i {
            color: #409EFF;
          }
        }
      }
    }

    .listWrap {
      height: calc(100% - 75px);

      .whiteBg {
        background-color: #fff;
        width: 100%;
        height: 100%;
        padding-top: 10px;
        overflow: auto;
      }
    }

    ul.tableList {
      li {
        line-height: 26px;
        font-size: 14px;

        &:hover {
          background: $themeBg1;
        }

        p {
          &.active {
            background-color: #eee;
          }

          &.tableName {
            padding-left: 42px;
            padding-right: 4px;
            /*overflow: hidden;*/
            /*text-overflow: ellipsis;*/
            white-space: nowrap;

            &:hover {
              cursor: pointer;
              color: #409EFF;
            }
          }

        }
      }
    }

    i {
      display: inline-block;
      width: 14px;

      &:hover {
        cursor: pointer;
      }
    }

    .type {
      display: flex;
      align-items: center;
      height: 26px;
    }

    p.type {
      padding-left: 10px;

      i.fa-database {
        font-size: 14px;
        color: #aaa;
      }
    }

    div.tables {
      padding-left: 26px;
    }
  }
</style>
