<template>
  <div class="rightSql">
    <div class="tt themeBg">
      <span>常用SQL</span>
      <p class="iBox" @click="closeLeft">
        <i class="fa fa-angle-double-right"/>
      </p>
    </div>
    <div class="commonSql" v-loading="commonSqlLoading">
      <p class="type sqlTitle">
        <i class="fa fa-caret-down"></i>
        <i class="el-icon-tickets" style="margin-right:4px;"></i>
        <span>SQL</span>
      </p>
      <div class="sqlContent">
        <div v-for="(item,index) in commonSqlConfig" :key="index">
          <p class="type item" style="padding-left:26px;">
            <i class="fa fa-caret-down"></i>
            <img src="../../assets/imgs/calendar.png">
            <span style="font-size:14px;margin-left:4px;">{{item.name}}</span>
          </p>
          <ul class="subContent">
            <li v-for="(v,i) in item.children">
              <p class="itemName" @click="getSqlContent(v.content)">
                <i class="el-icon-document"></i>
                <span>{{v.name}}</span>
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="tt themeBg">
      <span>我的SQL</span>
      <p class="iBox" @click="refreshMysql">
        <i class="el-icon-refresh"/>
      </p>
    </div>
    <div class="mySql" v-loading="mySqlLoading">
      <el-table
        :data="mySqlConfig"
        border
      >
        <el-table-column label="详情" width="190" align="center">
          <template slot-scope="scope">
            <span style="display:block;height:100%;cursor:pointer" @click="getSqlContent(scope.row.sqls)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="50" align="center">
          <template slot-scope="scope">
            <i class="el-icon-remove" style="color:red;font-size:18px;cursor:pointer;" @click="removeSqlRow(scope.row.id)"></i>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <p class="iBox single" @click="openRight">
      <i class="fa fa-angle-double-left"/>
    </p>
  </div>
</template>

<script>
  export default {
    name: 'rightSql',
    mounted() {
      $(document).on('click', '.sqlTitle.type,.item.type', function() {
        $(this).next().slideToggle(200)
        if ($(this).find('i.fa-caret-right').length) {
          $(this).find('i.fa-caret-right').removeClass('fa-caret-right').addClass('fa-caret-down')
        } else if ($(this).find('i.fa-caret-down').length) {
          $(this).find('i.fa-caret-down').removeClass('fa-caret-down').addClass('fa-caret-right')
        }
      })
    },
    props: {
      commonSqlConfig: {
        type: Array,
        default: []
      },
      mySqlConfig: {
        type: Array,
        default: []
      },
      commonSqlLoading: {
        type: Boolean,
        default: false
      },
      mySqlLoading: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      removeSqlRow(id){
        this.$emit('removeSqlRow',id)
      },
      getSqlContent(sql){
        this.$emit('appendSql',sql);
      },
      openRight(){
        $('.rightSql').animate({
          width:'250px'
        },200)
        $('.rightSql>div:not(.single)').show();
        $('.rightSql>.single').removeClass('active');
      },
      closeLeft() {
        $('.rightSql').animate({
          width:'26px'
        },200)
        $('.rightSql>div:not(.single)').hide();
        $('.rightSql>.single').addClass('active');
      },
      refreshMysql() {
        this.$emit('refreshMysql')
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

  .type {
    display: flex;
    align-items: center;
    height: 26px;
    cursor: pointer;
  }

  .rightSql {
    width: 26px;
    border-left: 1px solid $themeBorder1;
    &>div:not(.single){
      display:none;
    }
    p.iBox.single {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      text-align: center;
      line-height: 24px;
      margin-top:5px;
      i {
        color: #000;
      }

      &:hover {

        i {
          color: #409EFF;
        }
      }
    }
    .sqlTitle {
      padding-left: 10px;
      font-size: 14px;
      height: 26px;
      line-height: 26px;

      i {
        font-size: 16px;
        width:14px;
        display:inline-block;
        text-align:center;
      }
    }

    .sqlContent i.fa {
      font-size: 16px;
      width:14px;
      display:inline-block;
      text-align:center;
    }

    .commonSql {
      height: calc(50% - 35px);
      overflow: auto;
      padding-top: 10px;
    }

    .subContent {
      li {
        line-height: 26px;
        font-size: 14px;
        cursor: pointer;

        &:hover {
          background: $themeBg1;
        }

        p.itemName {
          &.active {
            background-color: #eee;
          }


          padding-left: 40px;
          padding-right: 4px;
          white-space: nowrap;

          &:hover {
            cursor: pointer;
            color: #409EFF;
          }

        }
      }
    }

    .mySql {
      height: calc(50% - 35px);
      overflow:auto;
    }

    .tt {
      /*display: flex;*/
      /*justify-content: space-between;*/
      /*align-items: center;*/
      height: 35px;
      font-size: 15px;
      padding: 0 5px;
      line-height:35px;
      &>span{
        float:left;
      }
      &>p.iBox{
        float:right;
        margin-top:5px;
      }

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
  }
</style>
