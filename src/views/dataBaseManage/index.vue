<template>
  <div class="database theme1">
    <div id="mainContent">
      <DataBaseTree
        :treeLoading="treeLoading"
        :source-options="sourceOptions"
        :tree-config="treeConfig"
        @chooseDatabase="chooseDatabase"
        @changeSourceId="changeSourceId"
        @changeTable="changeTable"
        @setTableByRightMouse="setTableByRightMouse"
        @tableRename="tableRename"
        @copyTable="copyTable"
        @deleteTable="deleteTable"
        @emptyTable="emptyTable"
        @tableInfo="tableInfo"
        @getMouseRightTableInfo="getMouseRightTableInfo"
        @addTable="addTable"/>
      <div id="centerContent">
        <div class="pageTabs">
          <ul class="pageSign">
            <p class="iconBox">
              <i class="el-icon-d-arrow-left"/>
            </p>
            <div class="tab-box">
              <div
                style="display:inline-block;"
                class="left-tab">
                <li
                  :class="{'active':activeTabIndex==-1}"
                  @click="activeTabIndex=-1"><img src="../../assets/imgs/home.png">
                  <span>运行及展示</span>
                </li>
                <MouseRightMenu :config="firstTabRightMenuConfig"/>
              </div>
              <div
                style="display:inline-block;"
                class="center-tab">
                <li
                  v-for="(tab,index) in allGridConfigs"
                  :key="index"
                  :class="{'active':activeTabIndex==index}"
                  @click.stop="toggleTab(index)">
                  <img
                    v-if="tab.type=='table'||tab.type=='tableInfo'||tab.type=='viewTable'"
                    src="../../assets/imgs/calendar.png">
                  <img
                    v-else
                    src="../../assets/imgs/config.png">
                  <span v-if="tab.type=='table'">{{ tab.tableName }}</span>
                  <span v-else><span v-if="tab.type=='setTable'">设计</span> {{ tab.tableName }} <span
                    v-if="tab.type=='tableInfo'">信息</span></span>
                  <i
                    class="el-icon-close"
                    @click.stop="deleteTab(index)"/>
                </li>
                <MouseRightMenu
                  :config="rightMenuConfig"
                  @change="getMouseRightIndex"/>
              </div>
            </div>
            <p class="iconBox2">
              <i class="el-icon-d-arrow-right"/>
            </p>
          </ul>
        </div>
        <div id="tBox">
          <template>
            <div class="home" v-show="activeTabIndex==-1">
              <div id="editor">
                <div class="controls" style="height:40px;padding-top:5px;padding-left:10px;">
                  <el-button-group>
                    <el-button
                      icon="el-icon-caret-right"
                      type="primary"
                      size="mini" @click="implement">执行
                    </el-button>
                    <el-button
                      icon="el-icon-remove"
                      type="primary"
                      size="mini" @click="clearSql">清空
                    </el-button>
                    <el-button
                      icon="el-icon-upload"
                      type="primary"
                      size="mini" @click="saveSql">SQL保存
                    </el-button>
                  </el-button-group>
                  <div style="display:inline-block;margin-left:50px;font-size:14px;">
                    当前数据库：
                    <span style="color:#409EFF;">{{editorCurDatabase}}</span>
                  </div>
                </div>
                <textarea ref="txt" class="txt"></textarea>
              </div>
              <div id="result">
                <div class="title">运行结果</div>
                <div class="resultTabs">
                  <div class="tabSign">
                    <div :class="['resTabItem',{'active':resActiveTabIndex==0}]" @click="resActiveTabIndex=0;">
                      <img src="../../assets/imgs/issue.png">
                      <span>消息</span>
                      <!--<i class="el-icon-refresh"></i>-->
                    </div>
                    <div :class="['resTabItem',{'active':resActiveTabIndex==1}]" v-show="showResult"
                         @click="resActiveTabIndex=1;">
                      <img src="../../assets/imgs/issue.png">
                      <span>结果</span>
                      <i class="el-icon-close" @click.stop="closeResultTab"></i>
                    </div>
                  </div>
                </div>
                <div class="resultBox">
                  <div class="resultText" v-show="resActiveTabIndex==0">
                    <textarea ref="resTxt" class="resTxt"></textarea>
                  </div>
                  <div class="resultTable" v-show="resActiveTabIndex==1">
                    <el-table
                      :header-cell-style="{background:'#f5f7fa'}"
                      v-loading="tableLoading"
                      height="calc(100% - 10px)"
                      ref="table"
                      :data="resultConfig.data"
                      border
                      style="margin-top:15px;height:auto !important;"
                    >
                      <el-table-column
                        v-for="(item,index) in resultConfig.columnHeads"
                        :label="item.field"
                        :width="item.width"
                        :key="index"
                        align="left">
                        <template slot-scope="scope">
                          <span style="display:block;white-space:nowrap;width:100%;">{{scope.row[item.field]}}</span>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-show="activeTabIndex>-1"
              class="tableDetail">
              <div class="controls" v-show="viewType=='table'||viewType=='viewTable'"
                   style="height:40px;padding-top:5px;padding-left:10px;">
                <el-button-group v-show="viewType=='table'">
                  <el-button
                    icon="el-icon-plus"
                    type="primary"
                    size="mini"
                    @click="addTableRow">添加
                  </el-button>
                  <el-button
                    icon="el-icon-printer"
                    type="primary"
                    size="mini"
                    @click="copyTableRow">复制
                  </el-button>
                  <el-button
                    icon="el-icon-delete"
                    type="primary"
                    size="mini"
                    @click="deleteTableRow">删除
                  </el-button>
                  <el-button
                    icon="el-icon-setting"
                    type="primary"
                    size="mini"
                    @click="setTable">设计表
                  </el-button>
                  <el-button icon="el-icon-download" type="primary" size="mini" @click="exportTable">导出</el-button>
                  <el-button
                    icon="el-icon-refresh"
                    v-if="activeTabIndex>=0&&allGridConfigs[activeTabIndex].tableName!='新增表'"
                    type="primary"
                    size="mini"
                    @click="refreshTable">刷新
                  </el-button>
                </el-button-group>
                <el-button-group v-show="viewType=='viewTable'">
                  <el-button icon="el-icon-download" type="primary" size="mini" @click="exportTable">导出</el-button>
                  <el-button
                    icon="el-icon-refresh"
                    v-if="activeTabIndex>=0&&allGridConfigs[activeTabIndex].tableName!='新增表'"
                    type="primary"
                    size="mini"
                    @click="refreshTable">刷新
                  </el-button>
                </el-button-group>
                <div style="width:60px;display:inline-block"></div>
                <el-button-group v-show="viewType=='table'">
                  <el-button
                    type="primary"
                    size="mini"
                    icon="el-icon-success"
                    @click="saveTable">保存
                  </el-button>
                  <el-button
                    type="primary"
                    size="mini"
                    icon="el-icon-error"
                    @click="refreshTable">取消
                  </el-button>
                </el-button-group>
              </div>

              <el-table
                :header-cell-style="{background:'#f5f7fa'}"
                v-loading="tableLoading"
                v-if="viewType=='table'||viewType=='viewTable'"
                height="calc(100% - 110px)"
                ref="table"
                :data="currentConfig.data"
                border
                style="margin-top:15px;height:auto !important;"
                @selection-change="handleSelectionChange"
              >
                <el-table-column
                  type="selection"
                  width="55"/>
                <el-table-column
                  v-for="(item,index) in currentConfig.columnHeads"
                  v-if="play"
                  :label="item.field"
                  :width="item.width"
                  :key="index"
                  align="left">
                  <template slot-scope="scope">
                    <div v-show="!scope.row.isInsert" class="tdMask"
                         style="position:absolute;top:0;left:0;right:0;bottom:0;z-index:1"></div>

                    <input
                      :class="{'new':scope.row.isInsert}"
                      v-if="item.editor=='numberbox'"
                      v-model="scope.row[item.field]"
                      class="tdText"
                      type="number"
                      @input="tableRowIsEdit(scope.row)">
                    <el-date-picker
                      v-else-if="item.editor=='datetimebox'"
                      v-model="scope.row[item.field]"
                      class="tdText"
                      type="datetime"
                      value-format="yyyy-MM-dd hh:mm:ss"
                      @change="tableRowIsEdit(scope.row)"/>
                    <input
                      :class="{'new':scope.row.isInsert}"
                      v-else
                      v-model="scope.row[item.field]"
                      class="tdText"
                      @input="tableRowIsEdit(scope.row)">

                  </template>
                </el-table-column>
              </el-table>


              <div class="controls" v-show="viewType=='setTable'"
                   style="height:40px;padding-top:5px;padding-left:10px;">
                <el-button-group>
                  <el-button
                    icon="el-icon-plus"
                    type="primary"
                    size="mini"
                    @click="addSetTableRow">添加
                  </el-button>
                  <el-button
                    icon="el-icon-delete"
                    type="primary"
                    size="mini"
                    @click="deleteSetTableRow">删除
                  </el-button>
                  <el-button icon="el-icon-caret-top" type="primary" size="mini" @click="moveRowUp">上移</el-button>
                  <el-button icon="el-icon-caret-bottom" type="primary" size="mini" @click="moveRowDown">下移</el-button>
                  <el-button
                    icon="el-icon-refresh"
                    type="primary"
                    size="mini"
                    @click="refreshSetTable">刷新
                  </el-button>
                </el-button-group>
                <div style="width:60px;display:inline-block"></div>
                <el-button-group>
                  <el-button
                    type="primary"
                    size="mini"
                    icon="el-icon-success"
                    @click="saveSetTable">保存
                  </el-button>
                  <el-button
                    type="primary"
                    size="mini"
                    icon="el-icon-error"
                    @click="cancelSetTable">取消
                  </el-button>
                </el-button-group>
              </div>
              <el-table
                :header-cell-style="{background:'#f5f7fa'}"
                id="setTableTpl"
                height="calc(100% - 110px)"
                v-loading="tableLoading"
                v-if="viewType=='setTable'"
                ref="setTable"
                :data="currentConfig.data"
                border
                style="width: 100%;margin-top:15px;"
                @selection-change="handleSelectionChange"
              >
                <el-table-column
                  type="selection"
                  width="55"/>
                <el-table-column
                  :label="item.label"
                  align="center"
                  :width="item.width" v-for="(item,index) in currentConfig.columnHeads" :key="index" v-if="play">
                  <template slot-scope="scope">
                    <div class="tdMask" v-show="!scope.row.isInsert"
                         style="position:absolute;top:0;left:0;right:0;bottom:0;z-index:1"></div>
                    <input :class="{'new':scope.row.isInsert}" v-if="item.field=='CHARACTER_MAXIMUM_LENGTH'"
                           v-model="scope.row[item.field]"
                           type="number" class="tdText" @input="setTableRowIsEdit(scope.row)">
                    <el-select v-else-if="item.field=='DATA_TYPE'" v-model="scope.row[item.field]" placeholder="请选择"
                               class="tdText">
                      <el-option
                        v-for="item in dataTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                        @input="setTableRowIsEdit(scope.row)"
                      >
                      </el-option>
                    </el-select>
                    <el-checkbox v-else-if="item.field=='IS_NULLABLE'" true-label="YES" false-label="NO"
                                 v-model="scope.row[item.field]" @change="setTableRowIsEdit(scope.row)"></el-checkbox>
                    <el-checkbox v-else-if="item.field=='COLUMN_KEY'" true-label="PRI" false-label=""
                                 v-model="scope.row[item.field]" @change="setTableRowIsEdit(scope.row)"></el-checkbox>
                    <input :class="{'new':scope.row.isInsert}" v-else v-model="scope.row[item.field]" type="text"
                           class="tdText" @input="setTableRowIsEdit(scope.row)">
                  </template>
                </el-table-column>
              </el-table>

              <div class="controls" v-show="viewType=='tableInfo'" style="padding-top:5px;padding-left:10px;">
                <el-button
                  type="primary"
                  size="mini"
                  @click="refreshTableInfo">刷新
                </el-button>
              </div>
              <el-table
                :header-cell-style="{background:'#f5f7fa'}"
                height="calc(100% - 110px)"
                v-loading="tableLoading"
                v-if="viewType=='tableInfo'"
                ref="tableInfo"
                :data="currentConfig.data"
                border
                style="width: 100%;margin-top:15px;height:auto !important;"
                @selection-change="handleSelectionChange"
              >
                <el-table-column
                  type="selection"
                  width="55"/>
                <el-table-column
                  v-for="(item,index) in currentConfig.columnHeads"
                  v-if="play"
                  :label="item.label"
                  :width="item.width"
                  :key="index"
                  align="center"
                  style="flex:1">
                  <template slot-scope="scope">

                    <span>{{scope.row[item.field]}}</span>

                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                v-if="activeTabIndex>-1 && currentConfig.total>0 && (viewType=='table'||viewType=='viewTable')"
                :current-page="allGridConfigs.length?allGridConfigs[activeTabIndex].pageNo:1"
                :page-sizes="[10, 15, 20, 25,30]"
                :page-size="allGridConfigs.length?allGridConfigs[activeTabIndex].pageSize:15"
                :total="allGridConfigs.length?allGridConfigs[activeTabIndex].total:0"
                style="margin-top:15px;"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"/>
            </div>

          </template>

        </div>
      </div>
      <RightSql :commonSqlConfig="commonSqlConfig" :mySqlConfig="mySqlConfig" :commonSqlLoading="commonSqlLoading"
                :mySqlLoading="mySqlLoading" @appendSql="appendSql" @removeSqlRow="removeSqlRow"
                @refreshMysql="getMySql"></RightSql>
    </div>
  </div>
</template>

<script>
  import fetch from '@/utils/fetch.js'
  import DataBaseTree from '@/components/dataBaseTree'
  import RightSql from '@/components/rightSql'
  import MouseRightMenu from '@/components/MouseRightMenu'
  import { Message } from 'element-ui'

  import TreeUtil from '@/utils/TreeUtil.js'

  import CodeMirror from 'codemirror'
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/theme/neo.css'
  import 'codemirror/theme/idea.css'
  import 'codemirror/mode/sql/sql.js'

  import 'codemirror/addon/hint/show-hint.js'
  import 'codemirror/addon/hint/show-hint.css'
  import './sql-hint.css'


  export default {
    name: 'Database',
    components: { DataBaseTree, MouseRightMenu, RightSql },
    updated() {
      this.$nextTick(() => {
        var tabBoxWidth = $('.tab-box').outerWidth()
        var rightTabWidth = $('.right-tab').outerWidth()
          ? $('.right-tab').outerWidth() + 4
          : 0
        var w =
          $('.left-tab').outerWidth() +
          $('.center-tab').outerWidth() +
          4 +
          rightTabWidth
        if (w > tabBoxWidth) {
          $('.iconBox,.iconBox2').show()
        } else {
          $('.iconBox,.iconBox2').hide()
        }
      })
    },
    mounted() {
      this.resEditor = CodeMirror.fromTextArea(this.$refs.resTxt, {
        tabSize: 4,
        mode: 'text/x-mysql',
        theme: 'idea',
        lineNumbers: true,
        line: true,
        lineWrapping: true,
        hintOptions: {
          completeSingle: false,
          hint: this.hint
        },
        extraKeys: {
          'Ctrl-Space': editor => {
            editor.showHint()
          }
        }
      })
      this.editor = CodeMirror.fromTextArea(this.$refs.txt, {
        tabSize: 4,
        mode: 'text/x-mysql',
        theme: 'idea',
        lineNumbers: true,
        line: true,
        lineWrapping: true,
        hintOptions: {
          completeSingle: false,
          hint: this.hint
        },
        extraKeys: {
          'Ctrl-Space': editor => {
            editor.showHint()
          }
        }
      })
      this.editor.on('keypress', editor => {
        editor.showHint()
      })
      $(document).on('mousedown', '.tdMask', function() {
        $(this).hide()
      })
      $(document).on('blur', '.tdText', function() {
        if (!$(this).hasClass('new')) {
          $(this).siblings('.tdMask').show()
        }
      })

      $(window).on('resize', function() {

        var tabBoxWidth = $('.tab-box').outerWidth()
        var rightTabWidth = $('.right-tab').outerWidth()
          ? $('.right-tab').outerWidth() + 4
          : 0
        var w =
          $('.left-tab').outerWidth() +
          $('.center-tab').outerWidth() +
          4 +
          rightTabWidth
        if (w > tabBoxWidth) {
          $('.iconBox,.iconBox2').show()
        } else {
          $('.iconBox,.iconBox2').hide()
        }
      })

      var tabBoxWidth = $('.tab-box').outerWidth()
      $('.iconBox').on('click', function() {
        var scrollLeft = $('.tab-box').scrollLeft()
        var left = scrollLeft > tabBoxWidth ? scrollLeft - tabBoxWidth : 0
        $('.tab-box').animate({ scrollLeft: left }, 300)
      })
      $('.iconBox2').on('click', function() {
        var scrollLeft = $('.tab-box').scrollLeft()
        var left = scrollLeft + tabBoxWidth
        $('.tab-box').animate({ scrollLeft: left }, 300)
      })
    },
    data() {
      const _this = this
      return {
        resultConfig: {
          columnHeads: [],
          data: []
        },
        resActiveTabIndex: 0,
        showResult: false,
        addDico: [],
        editorCurDatabase: '',
        commonSqlLoading: false,
        commonSqlConfig: [],
        mySqlConfig: [],
        mySqlLoading: false,
        editor: null,
        resEditor: null,
        dicoBase: [
          { className: 'sql', text: 'SELECT' },
          { className: 'sql', text: 'FROM' },
          { className: 'sql', text: 'ADD' },
          { className: 'sql', text: 'ALTER' },
          { className: 'sql', text: 'TABLE' },
          { className: 'sql', text: 'SET' },
          { className: 'sql', text: 'WHERE' },
          { className: 'sql', text: 'INNER' },
          { className: 'sql', text: 'JOIN' },
          { className: 'sql', text: 'UNION' },
          { className: 'sql', text: 'EXEC' },
          { className: 'sql', text: 'INSERT' },
          { className: 'sql', text: 'INTO' },
          { className: 'sql', text: 'VALUES' },
          { className: 'sql', text: 'UPDATE' },
          { className: 'sql', text: 'DELETE' },
          { className: 'sql', text: 'GROUP' },
          { className: 'sql', text: 'BY' },
          { className: 'sql', text: 'HAVING' },
          { className: 'sql', text: 'IS' },
          { className: 'sql', text: 'DISTINCT' },
          { className: 'sql', text: 'OUTER' },
          { className: 'sql', text: 'TOP' },
          { className: 'sql', text: 'EXISTS' },
          { className: 'sql', text: 'WHEN' },
          { className: 'sql', text: 'CASE' },
          { className: 'sql', text: 'CAST' },
          { className: 'sql', text: 'IN' },
          { className: 'sql', text: 'NULL' },
          { className: 'table', text: 'te_cash_exchange_new' },
          { className: 'table', text: 'ParamsAtos' },
          { className: 'table', text: 'te_client_transfers' },
          { className: 'column', text: 'status_cash' },
          { className: 'column', text: 'datet' },
          { className: 'column', text: 'ammount' },
          { className: 'column', text: 'cash_exchange_id_start' },
          { className: 'column', text: 'cash_exchange_id_end' },
          { className: 'pf', text: 'AddParamAtos' },
          { className: 'pf', text: 'verify_backoffice_user' },
          { className: 'pf', text: 'checkAllowOperation' },
          { className: 'pf', text: 'addMoneyIn_01' }
        ],
        fullScreenLoading: false,
        sourceType: 'MySql',
        tableLoading: false,
        play: true,
        sourceOptions: [],
        sourceId: '1',
        typeConfig: [],
        // showNewTableTabActive: false,
        showNewTableTab: false,
        showNewTable: false,
        newTableConfigs: {},
        treeConfig: [],
        treeLoading: false,
        activeTabIndex: -1,
        mouseRightIndex: '',
        mouseRightTableInfo: {},
        firstTabRightMenuConfig: [
          {
            icon: '',
            title: '关闭其他选项卡',
            callback: function() {
              _this.activeTabIndex = -1
              _this.allGridConfigs = []
            }
          }
        ],
        rightMenuConfig: [
          {
            icon: '',
            title: '关闭选项卡',
            callback: function() {
              if (_this.mouseRightIndex == _this.activeTabIndex) {
                if (_this.mouseRightIndex + 1 in _this.allGridConfigs) {
                  _this.activeTabIndex = _this.mouseRightIndex
                } else {
                  _this.activeTabIndex = _this.mouseRightIndex - 1
                }
              } else if (_this.mouseRightIndex > _this.activeTabIndex) {
              } else if (_this.mouseRightIndex < _this.activeTabIndex) {
                _this.activeTabIndex--
              }
              _this.allGridConfigs.splice(_this.mouseRightIndex, 1)
              if (_this.allGridConfigs.length == 0) {
                _this.activeTabIndex = -1
              }
            }
          },
          {
            icon: '',
            title: '关闭其他选项卡',
            callback: function() {
              _this.activeTabIndex = 0
              const currentArr = _this.allGridConfigs.slice(
                _this.mouseRightIndex,
                _this.mouseRightIndex + 1
              )
              _this.allGridConfigs = [].concat(currentArr)
            }
          },
          {
            icon: '',
            title: '关闭左侧选项卡',
            callback: function() {
              if (_this.mouseRightIndex == 0) {
                return
              } else {
                const distance = _this.mouseRightIndex
                _this.activeTabIndex -= distance
                _this.allGridConfigs = _this.allGridConfigs.slice(
                  _this.mouseRightIndex
                )
              }
            }
          },
          {
            icon: '',
            title: '关闭右侧选项卡',
            callback: function() {
              if (_this.allGridConfigs.length == _this.mouseRightIndex + 1) {
                return
              } else {
                if (_this.activeTabIndex > _this.mouseRightIndex) {
                  _this.activeTabIndex = _this.mouseRightIndex
                }
                _this.allGridConfigs = _this.allGridConfigs.slice(
                  0,
                  _this.mouseRightIndex + 1
                )
              }
            }
          },
          {
            icon: '',
            title: '关闭所有选项卡',
            callback: function() {
              _this.activeTabIndex = -1
              _this.allGridConfigs = []
            }
          }
        ],
        allGridConfigs: []
      }
    },
    created() {
      this.getSourceList()
      this.getTreeConfig()
      this.getCommonSql()
      this.getMySql()
    },
    methods: {
      downLoad(res,name){
        const blob = new Blob([res])
        const fileName = name + '.sql'
        if ('download' in document.createElement('a')) { // 非IE下载
          const elink = document.createElement('a')
          elink.download = fileName
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href) // 释放URL 对象
          document.body.removeChild(elink)
        } else {
          navigator.msSaveBlob(blob, fileName)
        }
      },
      exportTable() {

        let rows = JSON.parse(JSON.stringify(this.allGridConfigs[this.activeTabIndex].selectedArr))
        const primaryKey = this.allGridConfigs[this.activeTabIndex].primaryKey
        rows = rows.map(item => {
          delete item.oldData
          delete item.isInsert
          delete item.isEdit
          return item
        })
        if (!rows.length) {
          Message({
            message: '请至少选中一行数据',
            type: 'warning',
            duration: 3000
          })
        } else {
          fetch({
            url: `table/exportDataToSQL/${this.sourceId}`,
            method: 'post',
            data: {
              databaseName: this.currentDatabaseName,
              tableName: this.currentTableName,
              primary_key: primaryKey,
              checkedItems: JSON.stringify(rows)
            }
          }).then(res => {
            this.downLoad(res,this.currentTableName);
          })

        }
      },
      chooseDatabase(name) {
        this.editorCurDatabase = name
        let arr
        this.treeConfig.forEach(item => {
          if (item.name == name) {
            arr = item.children[0].children.map(v => {
              return { className: 'table', text: v.name }
            })
          }
        })
        this.addDico = arr
      },
      appendSql(sql) {
        // let oldSql = this.editor.getValue()
        // let enter = oldSql ? '\n' : ''
        // let newSql = oldSql + enter + sql
        this.editor.setValue(sql)
      },
      removeSqlRow(id) {

        this.$confirm('你确定要删除？', '操作提醒', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.mySqlLoading = true
          fetch({
            url: `searchHistory/${id}`,
            method: 'delete'
          }).then(res => {
            this.mySqlLoading = false
            res = res.data
            if (res.code == '200') {
              Message({
                message: '删除成功',
                type: 'success',
                duration: 3000
              })
              this.getMySql()
            } else {
              Message({
                message: res.message,
                type: 'error',
                duration: 5000
              })
            }
          }).catch(res=>{
            res={"message":null,"code":200,"data":true};
            this.mySqlLoading = false
            if (res.code == '200') {
              Message({
                message: '删除成功',
                type: 'success',
                duration: 3000
              })
              this.getMySql()
            } else {
              Message({
                message: res.message,
                type: 'error',
                duration: 5000
              })
            }
          })
        })
      },
      implement() {
        let sql = this.editor.getValue()
        this.fullScreenLoading = this.$loading({
          lock: true,
          text: '执行中，请稍等...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.3)'
        })
        fetch({
          url: `sqloperating/executeSqlTest/${this.sourceId}`,
          method: 'post',
          data: {
            sql: sql,
            databaseName: this.editorCurDatabase
          }
        }).then(res => {
          this.fullScreenLoading.close()
          res = res.data
          if (res.code == '200') {
            res = res.data
            let news=`运行时间：${res.time}毫秒`
            this.resEditor.setValue(news)
            this.showResult = true
            this.resActiveTabIndex = 1
            this.resultConfig.columnHeads = JSON.parse(res.columns)[0]
            this.resultConfig.data = res.rows
            this.resultConfig.columnHeads.forEach((item, index) => {
              let width
              if (item.editor == 'datetimebox') {
                width = 220
              } else {
                let headWidth = item.field.toString().length * 12+30
                let tdStr = ''
                this.resultConfig.data.forEach(v => {
                  if (v[item.field]) {
                    if (v[item.field].toString().length > tdStr.length) {
                      tdStr = v[item.field].toString()
                    }
                  } else {
                    v[item.field] = ''
                    if (v[item.field].toString().length > tdStr.length) {
                      tdStr = v[item.field].toString()
                      console.log(tdStr)
                    }
                  }
                })
                let tdWidth =11 * tdStr.length + 20
                width = headWidth >= tdWidth ? headWidth : tdWidth
              }
              this.resultConfig.columnHeads[index].width = width
            })
          } else {
            this.showResult = false
            this.resActiveTabIndex = 0
            this.resEditor.setValue(res.message)
          }
        }).catch(res=>{
          this.fullScreenLoading.close()
          res={"message":null,"code":200,"data":{"total":20,"columns":"[[{\"editor\":\"text\",\"field\":\"id\",\"sortable\":true,\"title\":\"id\"},{\"editor\":\"text\",\"field\":\"data_source_id\",\"sortable\":true,\"title\":\"data_source_id\"},{\"editor\":\"text\",\"field\":\"database_name\",\"sortable\":true,\"title\":\"database_name\"},{\"editor\":\"text\",\"field\":\"file_name\",\"sortable\":true,\"title\":\"file_name\"},{\"editor\":\"text\",\"field\":\"file_path\",\"sortable\":true,\"title\":\"file_path\"},{\"editor\":\"numberbox\",\"field\":\"state\",\"sortable\":true,\"title\":\"state\"},{\"editor\":\"datetimebox\",\"field\":\"backp_date\",\"sortable\":true,\"title\":\"backp_date\"},{\"editor\":\"datetimebox\",\"field\":\"update_date\",\"sortable\":true,\"title\":\"update_date\"},{\"editor\":\"text\",\"field\":\"message\",\"sortable\":true,\"title\":\"message\"}]]","time":377,"rows":[{"id":271993810777485312,"data_source_id":1,"database_name":"test","file_name":"test__20190121132617.sql","file_path":"/dms\\backup\\test__20190121132617.sql","state":5,"backp_date":"2019-01-21 13:26:18","update_date":"2019-01-22 11:09:59","message":"Duplicate entry '3' for key 'PRIMARY'"},{"id":272001159630106624,"data_source_id":1,"database_name":null,"file_name":"前端项目需要的配置文件.rar","file_path":"\\dms\\backup\\前端项目需要的配置文件.rar","state":0,"backp_date":"2019-01-21 13:55:30","update_date":null,"message":null},{"id":272001272251363328,"data_source_id":1,"database_name":null,"file_name":"前端项目需要的配置文件.rar","file_path":"\\dms\\backup\\前端项目需要的配置文件.rar","state":0,"backp_date":"2019-01-21 13:55:57","update_date":null,"message":null},{"id":272001931272990720,"data_source_id":1,"database_name":null,"file_name":"前端项目需要的配置文件.rar","file_path":"\\dms\\backup\\前端项目需要的配置文件.rar","state":0,"backp_date":"2019-01-21 13:58:34","update_date":null,"message":null},{"id":272003696873648128,"data_source_id":1,"database_name":"test","file_name":"test__20190121140534.sql","file_path":"/dms\\backup\\test__20190121140534.sql","state":5,"backp_date":"2019-01-21 14:05:35","update_date":"2019-01-22 10:59:12","message":null},{"id":272004256116977664,"data_source_id":1,"database_name":"test","file_name":"test__20190121140748.sql","file_path":"/dms\\backup\\test__20190121140748.sql","state":0,"backp_date":"2019-01-21 14:07:48","update_date":null,"message":null},{"id":272290823792439296,"data_source_id":1,"database_name":"test","file_name":"test__20190122090631.sql","file_path":"/dms\\backup\\test__20190122090631.sql","state":0,"backp_date":"2019-01-22 09:06:31","update_date":null,"message":null},{"id":272291053116010496,"data_source_id":1,"database_name":"test","file_name":"test__20190122090725.sql","file_path":"/dms\\backup\\test__20190122090725.sql","state":0,"backp_date":"2019-01-22 09:07:26","update_date":null,"message":null},{"id":272293505420701696,"data_source_id":1,"database_name":"test","file_name":"test__20190122091710.sql","file_path":"/dms\\backup\\test__20190122091710.sql","state":4,"backp_date":"2019-01-22 09:17:11","update_date":"2019-01-22 11:40:44","message":"Duplicate entry '0--4302417643438237969--4302417643438237969-method-1540199684175' for key 'trace_id_high'"},{"id":272294216518807552,"data_source_id":1,"database_name":"test","file_name":"test__20190122092000.sql","file_path":"/dms\\backup\\test__20190122092000.sql","state":0,"backp_date":"2019-01-22 09:20:00","update_date":null,"message":null},{"id":272295869317853184,"data_source_id":1,"database_name":"test","file_name":"test__20190122092634.sql","file_path":"/dms\\backup\\test__20190122092634.sql","state":0,"backp_date":"2019-01-22 09:26:34","update_date":null,"message":null},{"id":272296560258134016,"data_source_id":1,"database_name":"test","file_name":"test__20190122092918.sql","file_path":"/dms\\backup\\test__20190122092918.sql","state":0,"backp_date":"2019-01-22 09:29:19","update_date":null,"message":null},{"id":272296608094171136,"data_source_id":1,"database_name":"test","file_name":"test__20190122092930.sql","file_path":"/dms\\backup\\test__20190122092930.sql","state":0,"backp_date":"2019-01-22 09:29:30","update_date":null,"message":null},{"id":272298181897695232,"data_source_id":1,"database_name":"test","file_name":"test__20190122092930.zip","file_path":"/dms/backup\\test__20190122092930.zip","state":0,"backp_date":"2019-01-22 09:35:46","update_date":null,"message":null},{"id":272298229767286784,"data_source_id":1,"database_name":"test","file_name":"test__20190122093557.sql","file_path":"/dms\\backup\\test__20190122093557.sql","state":5,"backp_date":"2019-01-22 09:35:57","update_date":"2019-01-22 11:20:14","message":null},{"id":272327474635812864,"data_source_id":1,"database_name":"test","file_name":"test__20190122113209.sql","file_path":"/dms\\backup\\test__20190122113209.sql","state":0,"backp_date":"2019-01-22 11:32:10","update_date":null,"message":null},{"id":272327513772863488,"data_source_id":1,"database_name":"test","file_name":"test__20190122113218.sql","file_path":"/dms\\backup\\test__20190122113218.sql","state":0,"backp_date":"2019-01-22 11:32:19","update_date":null,"message":null},{"id":272327861623271424,"data_source_id":1,"database_name":"test","file_name":"test__20190122113341.sql","file_path":"/dms\\backup\\test__20190122113341.sql","state":0,"backp_date":"2019-01-22 11:33:42","update_date":null,"message":null},{"id":272327917420097536,"data_source_id":1,"database_name":"test","file_name":"test__20190122113355.sql","file_path":"/dms\\backup\\test__20190122113355.sql","state":5,"backp_date":"2019-01-22 11:33:55","update_date":"2019-01-22 13:26:09","message":"Duplicate entry '69' for key 'PRIMARY'"},{"id":272329809785204736,"data_source_id":1,"database_name":"test","file_name":"test__20190122114126.sql","file_path":"/dms\\backup\\test__20190122114126.sql","state":4,"backp_date":"2019-01-22 11:41:26","update_date":"2019-01-22 13:35:16","message":"Duplicate entry '3' for key 'PRIMARY'"}],"totalCount":20,"primaryKey":"id","tableName":"dc_backup"}};
          if (res.code == '200') {
            res = res.data
            this.showResult = true
            this.resActiveTabIndex = 1
            this.resultConfig.columnHeads = JSON.parse(res.columns)[0]
            this.resultConfig.data = res.rows
            this.resultConfig.columnHeads.forEach((item, index) => {
              let width
              if (item.editor == 'datetimebox') {
                width = 220
              } else {
                let headWidth = item.field.toString().length * 12+30
                let tdStr = ''
                this.resultConfig.data.forEach(v => {
                  if (v[item.field]) {
                    if (v[item.field].toString().length > tdStr.length) {
                      tdStr = v[item.field].toString()
                    }
                  } else {
                    v[item.field] = ''
                    if (v[item.field].toString().length > tdStr.length) {
                      tdStr = v[item.field].toString()
                      console.log(tdStr)
                    }
                  }
                })
                let tdWidth =11 * tdStr.length + 20
                width = headWidth >= tdWidth ? headWidth : tdWidth
              }
              this.resultConfig.columnHeads[index].width = width
            })
          } else {
            this.showResult = false
            this.resActiveTabIndex = 0
            this.resEditor.setValue(res.message)
          }
        })
      },
      clearSql() {
        this.editor.setValue('')
      },
      closeResultTab(){
        this.showResult=false;
        this.resActiveTabIndex=0;
      },
      getMySql() {
        this.mySqlLoading = true
        fetch({
          url: 'searchHistory/getByWhere',
          method: 'get'
        }).then(res => {
          this.mySqlLoading = false
          res = res.data
          this.mySqlConfig = res.data
        }).catch(res=>{
          this.mySqlLoading = false
          res={"message":null,"code":200,"data":[{"id":"270865283097243648","name":"aaa","databaseName":null,"tableName":null,"sqls":"SELECT * from computer_info;","state":null},{"id":"271950293388701696","name":"test","databaseName":null,"tableName":null,"sqls":"SELECT * from dc_backup","state":null},{"id":"272357720609206272","name":"ccc","databaseName":null,"tableName":null,"sqls":"SELECT * from dc_data_source","state":null}]};
          this.mySqlConfig = res.data
        })
      },
      saveSql() {
        this.$prompt('保存查询', '名称', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(({ value }) => {
          let sql = this.editor.getValue()
          fetch({
            url: 'searchHistory',
            method: 'post',
            data: {
              name: value,
              sqls: sql
            }
          }).then(res => {
            res = res.data
            if (res.code == '200') {
              Message({
                message: '保存成功',
                type: 'success',
                duration: 3000
              })
              this.getMySql()
            }
          }).catch(res=>{
            res={"message":null,"code":200,"data":"272359446905040896"};
            if (res.code == '200') {
              Message({
                message: '保存成功',
                type: 'success',
                duration: 3000
              })
              this.getMySql()
            }
          })
        })
      },
      suggest(searchString) {
        let token = searchString
        if (searchString.startsWith('.')) {
          token = searchString.substring(1)
        } else {
          token = searchString.toLowerCase()
        }
        let resu = []
        let N = this.dico.length

        for (let i = 0; i < N; i++) {
          let keyword = this.dico[i].text.toLowerCase()
          let suggestion = null
          if (keyword.startsWith(token)) {
            suggestion = Object.assign({ score: N + (N - i) }, this.dico[i])
          } else if (keyword.includes(token)) {
            suggestion = Object.assign({ score: N - i }, this.dico[i])
          }
          if (suggestion) resu.push(suggestion)
        }

        if (searchString.startsWith('.')) {
          resu.forEach(s => {
            if (s.className == 'column') {
              s.score += N
            } else if (s.className == 'sql') s.score -= N
            return s
          })
        }

        return resu.sort((a, b) => b.score - a.score)
      },
      hint(editor) {
        let cur = editor.getCursor()
        let token = editor.getTokenAt(cur)
        let searchString = token.string
        return {
          list: this.suggest(searchString),
          from: CodeMirror.Pos(cur.line, token.start),
          to: CodeMirror.Pos(cur.line, token.end)
        }
      },
      getCommonSql() {
        this.commonSqlLoading = true
        fetch({
          url: 'sqlStudy/getByWhere',
          method: 'get'
        }).then(res => {
          this.commonSqlLoading = false
          res = res.data
          if (res.code == '200') {
            res = res.data.map(item => {
              item.parentId = item.pid
              item.name = item.title
              return item
            })
            res = TreeUtil(res, ['content'])
            this.commonSqlConfig = res.children

          } else {
            Message({
              message: res.message,
              type: 'error',
              duration: 5000
            })
          }
        }).catch(res=>{
          this.commonSqlLoading = false
          res={"message":null,"code":200,"data":[{"id":"1","icon":"icon-berlin-billing","sort":null,"title":"SQL","content":null,"pid":"-1"},{"id":"2","icon":"icon-berlin-calendar","sort":null,"title":"常用SQL","content":null,"pid":"1"},{"id":"3","icon":"icon-berlin-project","sort":null,"title":"select","content":"SELECT col_name,...\n  FROM table_name\n WHERE where_condition\n GROUP BY col_name,... \nHAVING where_condition\n ORDER BY col_name,...\n LIMIT offset,row_count","pid":"2"},{"id":"4","icon":"icon-berlin-project","sort":null,"title":"insert","content":"INSERT INTO table_name(col_name,...) values(expr,...)","pid":"2"},{"id":"5","icon":"icon-berlin-project","sort":null,"title":"update","content":"UPDATE table_name SET col_name=expr,... WHERE where_condition","pid":"2"},{"id":"6","icon":"icon-berlin-project","sort":null,"title":"delete","content":"DELETE FROM table_name WHERE where_condition","pid":"2"},{"id":"7","icon":"icon-berlin-project","sort":null,"title":"replace","content":"REPLACE INTO table_name(col_name,...) values(expr,...)","pid":"2"},{"id":"8","icon":"icon-berlin-calendar","sort":null,"title":"表/索引","content":null,"pid":"1"},{"id":"9","icon":"icon-berlin-project","sort":null,"title":"alter table","content":"ALTER [ONLINE | OFFLINE] [IGNORE] TABLE tbl_name\n    alter_specification [, alter_specification] ...\n\nalter_specification:\n    table_option ...\n  | ADD [COLUMN] col_name column_definition\n        [FIRST | AFTER col_name ]\n  | ADD [COLUMN] (col_name column_definition,...)\n  | ADD {INDEX|KEY} [index_name]\n        [index_type] (index_col_name,...) [index_option] ...\n  | ADD [CONSTRAINT [symbol]] PRIMARY KEY\n        [index_type] (index_col_name,...) [index_option] ...\n  | ADD [CONSTRAINT [symbol]]\n        UNIQUE [INDEX|KEY] [index_name]\n        [index_type] (index_col_name,...) [index_option] ...\n  | ADD FULLTEXT [INDEX|KEY] [index_name]\n        (index_col_name,...) [index_option] ...\n  | ADD SPATIAL [INDEX|KEY] [index_name]\n        (index_col_name,...) [index_option] ...\n  | ADD [CONSTRAINT [symbol]]\n        FOREIGN KEY [index_name] (index_col_name,...)\n        reference_definition\n  | ALTER [COLUMN] col_name {SET DEFAULT literal | DROP DEFAULT}\n  | CHANGE [COLUMN] old_col_name new_col_name column_definition\n        [FIRST|AFTER col_name]\n  | MODIFY [COLUMN] col_name column_definition\n        [FIRST | AFTER col_name]\n  | DROP [COLUMN] col_name\n  | DROP PRIMARY KEY\n  | DROP {INDEX|KEY} index_name\n  | DROP FOREIGN KEY fk_symbol\n  | DISABLE KEYS\n  | ENABLE KEYS\n  | RENAME [TO] new_tbl_name\n  | ORDER BY col_name [, col_name] ...\n  | CONVERT TO CHARACTER SET charset_name [COLLATE collation_name]\n  | [DEFAULT] CHARACTER SET [=] charset_name [COLLATE [=] collation_name]\n  | DISCARD TABLESPACE\n  | IMPORT TABLESPACE\n  | partition_options\n  | ADD PARTITION (partition_definition)\n  | DROP PARTITION partition_names\n  | COALESCE PARTITION number\n  | REORGANIZE PARTITION partition_names INTO (partition_definitions)\n  | ANALYZE PARTITION partition_names\n  | CHECK PARTITION partition_names\n  | OPTIMIZE PARTITION partition_names\n  | REBUILD PARTITION partition_names\n  | REPAIR PARTITION partition_names\n  | REMOVE PARTITIONING\n\nindex_col_name:\n    col_name [(length)] [ASC | DESC]\n\nindex_type:\n    USING {BTREE | HASH | RTREE}\n\nindex_option:\n    KEY_BLOCK_SIZE [=] value\n  | index_type\n  | WITH PARSER parser_name\n  | COMMENT 'string'","pid":"8"},{"id":"10","icon":"icon-berlin-project","sort":null,"title":"create table","content":"CREATE TABLE tbl_name\n(\ncol_name data_type NOT NULL DEFAULT default_value AUTO_INCREMENT COMMENT 'string',\n...\nKEY index_name index_type (index_col_name,...),\n...\nPRIMARY KEY(index_col_name,...),\nUNIQUE KEY(index_col_name,...)\n) ENGINE=engine_name CHARACTER SET=charset_name COMMENT='string'","pid":"8"},{"id":"11","icon":"icon-berlin-project","sort":null,"title":"create index","content":"CREATE [UNIQUE|FULLTEXT|SPATIAL] INDEX index_name\n    [USING index_type]\n    ON tbl_name (index_col_name,...)\n \nindex_col_name:\n    col_name [(length)] [ASC | DESC]","pid":"8"},{"id":"12","icon":"icon-berlin-project","sort":null,"title":"drop table","content":"DROP [TEMPORARY] TABLE [IF EXISTS]\n    tbl_name [, tbl_name] ...\n    [RESTRICT | CASCADE]","pid":"8"},{"id":"13","icon":"icon-berlin-project","sort":null,"title":"drop index","content":"DROP INDEX index_name ON tbl_name","pid":"8"},{"id":"14","icon":"icon-berlin-project","sort":null,"title":"rename table","content":"RENAME TABLE tbl_name TO new_tbl_name","pid":"8"},{"id":"15","icon":"icon-berlin-project","sort":null,"title":"truncate table","content":"TRUNCATE [TABLE] tbl_name","pid":"8"},{"id":"16","icon":"icon-berlin-calendar","sort":null,"title":"视图","content":null,"pid":"1"},{"id":"17","icon":"icon-berlin-project","sort":null,"title":"create view","content":"CREATE [OR REPLACE] [ALGORITHM = {UNDEFINED | MERGE | TEMPTABLE}]\n    VIEW view_name [(column_list)]\n    AS select_statement\n    [WITH [CASCADED | LOCAL] CHECK OPTION]","pid":"16"},{"id":"18","icon":"icon-berlin-project","sort":null,"title":"alter view","content":"ALTER\n    [ALGORITHM = {UNDEFINED | MERGE | TEMPTABLE}]\n    [DEFINER = { user | CURRENT_USER }]\n    [SQL SECURITY { DEFINER | INVOKER }]\n    VIEW view_name [(column_list)]\n    AS select_statement\n    [WITH [CASCADED | LOCAL] CHECK OPTION]","pid":"16"},{"id":"19","icon":"icon-berlin-project","sort":null,"title":"drop view","content":"DROP VIEW [IF EXISTS]\n    view_name [, view_name] ...\n    [RESTRICT | CASCADE]","pid":"16"},{"id":"20","icon":"icon-berlin-calendar","sort":null,"title":"函数/存储过程","content":null,"pid":"1"},{"id":"21","icon":"icon-berlin-project","sort":null,"title":"alter function","content":"ALTER FUNCTION sp_name [characteristic ...]\n \ncharacteristic:\n    { CONTAINS SQL | NO SQL | READS SQL DATA | MODIFIES SQL DATA }\n  | SQL SECURITY { DEFINER | INVOKER }\n  | COMMENT 'string'","pid":"20"},{"id":"22","icon":"icon-berlin-project","sort":null,"title":"alter procedure","content":"ALTER PROCEDURE sp_name [characteristic ...]\n \ncharacteristic:\n    { CONTAINS SQL | NO SQL | READS SQL DATA | MODIFIES SQL DATA }\n  | SQL SECURITY { DEFINER | INVOKER }\n  | COMMENT 'string'","pid":"20"},{"id":"23","icon":"icon-berlin-project","sort":null,"title":"call procedure","content":"CALL sp_name([parameter[,...]])","pid":"20"},{"id":"24","icon":"icon-berlin-project","sort":null,"title":"create function","content":"CREATE FUNCTION sp_name ([func_parameter[,...]])\n    RETURNS type\n    [characteristic ...]\n routine_body\n\ncharacteristic:\n    LANGUAGE SQL\n  | [NOT] DETERMINISTIC\n  | { CONTAINS SQL | NO SQL | READS SQL DATA | MODIFIES SQL DATA }\n  | SQL SECURITY { DEFINER | INVOKER }\n  | COMMENT 'string'","pid":"20"},{"id":"25","icon":"icon-berlin-project","sort":null,"title":"create procedure","content":"CREATE PROCEDURE sp_name ([proc_parameter[,...]])\n    [characteristic ...]\n routine_body\ncharacteristic:\n    LANGUAGE SQL\n  | [NOT] DETERMINISTIC\n  | { CONTAINS SQL | NO SQL | READS SQL DATA | MODIFIES SQL DATA }\n  | SQL SECURITY { DEFINER | INVOKER }\n  | COMMENT 'string'","pid":"20"},{"id":"26","icon":"icon-berlin-project","sort":null,"title":"drop function","content":"DROP FUNCTION [IF EXISTS] sp_name","pid":"20"},{"id":"27","icon":"icon-berlin-project","sort":null,"title":"drop procedure","content":"DROP PROCEDURE [IF EXISTS] sp_name","pid":"20"},{"id":"28","icon":"icon-berlin-project","sort":null,"title":"MongoDB shell命令","content":null,"pid":"1"},{"id":"29","icon":"icon-berlin-project","sort":null,"title":"创建数据库use","content":"use <databaseName> ","pid":"28"},{"id":"30","icon":"icon-berlin-project","sort":null,"title":"创建数据集合db.createCollection","content":"db.createCollection(<collectionName>)","pid":"28"},{"id":"31","icon":"icon-berlin-project","sort":null,"title":"查看文档db.users.find()","content":"db.users.find({})","pid":"28"},{"id":"32","icon":"icon-berlin-project","sort":null,"title":"插入数据db.users.insert()","content":"db.users.insert(<data>)","pid":"28"},{"id":"33","icon":"icon-berlin-project","sort":null,"title":"删除数据db.users.remove()","content":"db.users.remove({})","pid":"28"},{"id":"34","icon":"icon-berlin-project","sort":null,"title":"更新数据db.users.update()","content":"db.users.update(query,update)","pid":"28"},{"id":"35","icon":"icon-berlin-calendar","sort":null,"title":"Oracle常用查询","content":null,"pid":"1"},{"id":"36","icon":"icon-berlin-project","sort":null,"title":"查看连接用户信息","content":"SELECT s.Osuser Os_User_Name,Decode(Sign(48 - Command),1,To_Char(Command),\n'Action Code #' || To_Char(Command)) Action,\np.Program Oracle_Process, Status Session_Status, s.Terminal Terminal,\ns.Program Program, s.Username User_Name,\ns.Fixed_Table_Sequence Activity_Meter, '' Query, 0 Memory,\n0 Max_Memory, 0 Cpu_Usage, s.Sid, s.Serial# Serial_Num\nFROM V$session s, V$process p\nWHERE s.Paddr = p.Addr\nAND s.TYPE = 'USER'\nORDER BY s.Username, s.Osuser","pid":"35"},{"id":"37","icon":"icon-berlin-project","sort":null,"title":"高速缓冲区命中率","content":"select 1 - sum(decode(name, 'physical reads', value, 0)) /\n(sum(decode(name, 'db block gets', value, 0)) +\nsum(decode(name, 'consistent gets', value, 0))) hit_ratio\nfrom v$sysstat t\nwhere name in ('physical reads', 'db block gets', 'consistent gets')","pid":"35"},{"id":"38","icon":"icon-berlin-project","sort":null,"title":"查看表空间使用情况","content":"SELECT Upper(F.TABLESPACE_NAME)         \"表空间名\",\n       D.TOT_GROOTTE_MB                 \"表空间大小(M)\",\n       D.TOT_GROOTTE_MB - F.TOTAL_BYTES \"已使用空间(M)\",\n       To_char(Round(( D.TOT_GROOTTE_MB - F.TOTAL_BYTES ) / D.TOT_GROOTTE_MB * 100, 2), '990.99')\n       || '%'                           \"使用比\",\n       F.TOTAL_BYTES                    \"空闲空间(M)\",\n       F.MAX_BYTES                      \"最大块(M)\"\nFROM   (SELECT TABLESPACE_NAME,\n               Round(Sum(BYTES) / ( 1024 * 1024 ), 2) TOTAL_BYTES,\n               Round(Max(BYTES) / ( 1024 * 1024 ), 2) MAX_BYTES\n        FROM   SYS.DBA_FREE_SPACE\n        GROUP  BY TABLESPACE_NAME) F,\n       (SELECT DD.TABLESPACE_NAME,\n               Round(Sum(DD.BYTES) / ( 1024 * 1024 ), 2) TOT_GROOTTE_MB\n        FROM   SYS.DBA_DATA_FILES DD\n        GROUP  BY DD.TABLESPACE_NAME) D\nWHERE  D.TABLESPACE_NAME = F.TABLESPACE_NAME\nORDER  BY 1","pid":"35"},{"id":"39","icon":"icon-berlin-project","sort":null,"title":"共享池的命中率","content":"select sum(pinhits)/sum(pins)*100 \"hit radio\" from v$librarycache;","pid":"35"},{"id":"40","icon":"icon-berlin-project","sort":null,"title":"查看还没提交的事务","content":"select * from v$locked_object;","pid":"35"},{"id":"41","icon":"icon-berlin-project","sort":null,"title":"耗资源的进程","content":"select s.schemaname schema_name, decode(sign(48 - command), 1,\nto_char(command), 'Action Code #' || to_char(command) ) action, status\nsession_status, s.osuser os_user_name, s.sid, p.spid , s.serial# serial_num,\nnvl(s.username, '[Oracle process]') user_name, s.terminal terminal,\ns.program program, st.value criteria_value from v$sesstat st, v$session s , v$process p\nwhere st.sid = s.sid and st.statistic# = to_number('38') and ('ALL' = 'ALL'\nor s.status = 'ALL') and p.addr = s.paddr order by st.value desc, p.spid asc, s.username asc, s.osuser asc","pid":"35"},{"id":"42","icon":"icon-berlin-project","sort":null,"title":"查看锁（lock）情况","content":"select /* RULE */ ls.osuser os_user_name, ls.username user_name,\ndecode(ls.type, 'RW', 'Row wait enqueue lock', 'TM', 'DML enqueue lock', 'TX',\n'Transaction enqueue lock', 'UL', 'User supplied lock') lock_type,\no.object_name object, decode(ls.lmode, 1, null, 2, 'Row Share', 3,\n'Row Exclusive', 4, 'Share', 5, 'Share Row Exclusive', 6, 'Exclusive', null)\nlock_mode, o.owner, ls.sid, ls.serial# serial_num, ls.id1, ls.id2\nfrom sys.dba_objects o, ( select s.osuser, s.username, l.type,\nl.lmode, s.sid, s.serial#, l.id1, l.id2 from v$session s,\nv$lock l where s.sid = l.sid ) ls where o.object_id = ls.id1 and o.owner\n<> 'SYS' order by o.owner, o.object_name","pid":"35"},{"id":"43","icon":"icon-berlin-project","sort":null,"title":"查看等待（wait）情况","content":"SELECT v$waitstat.class, v$waitstat.count count, SUM(v$sysstat.value) sum_value\nFROM v$waitstat, v$sysstat WHERE v$sysstat.name IN ('db block gets',\n'consistent gets') group by v$waitstat.class, v$waitstat.count","pid":"35"},{"id":"44","icon":"icon-berlin-project","sort":null,"title":"查看sga情况","content":"SELECT NAME, BYTES FROM SYS.V_$SGASTAT ORDER BY NAME ASC","pid":"35"},{"id":"45","icon":"icon-berlin-project","sort":null,"title":"查看表空间的碎片程度","content":"select tablespace_name,count(tablespace_name) from dba_free_space group by tablespace_name\nhaving count(tablespace_name)>10;\nalter tablespace name coalesce;\nalter table name deallocate unused;\ncreate or replace view ts_blocks_v as\nselect tablespace_name,block_id,bytes,blocks,'free space' segment_name from dba_free_space\nunion all\nselect tablespace_name,block_id,bytes,blocks,segment_name from dba_extents;\nselect * from ts_blocks_v;\nselect tablespace_name,sum(bytes),max(bytes),count(block_id) from dba_free_space\ngroup by tablespace_name;","pid":"35"}]};
          if (res.code == '200') {
            res = res.data.map(item => {
              item.parentId = item.pid
              item.name = item.title
              return item
            })
            res = TreeUtil(res, ['content'])
            this.commonSqlConfig = res.children

          } else {
            Message({
              message: res.message,
              type: 'error',
              duration: 5000
            })
          }
        })
      },
      changeSourceId(newSourceId) {
        this.sourceId = newSourceId
        this.getTreeConfig()
      },
      handleSizeChange(pageSize) {
        this.allGridConfigs[this.activeTabIndex].pageSize = pageSize
        this.allGridConfigs[this.activeTabIndex].pageNo = 1
        this.refreshTable()
      },
      handleCurrentChange(pageNo) {
        this.allGridConfigs[this.activeTabIndex].pageNo = pageNo
        this.refreshTable()
      },
      getSourceList() {
        fetch({
          url: 'dms/allDatabaseList',
          method: 'get'
        }).then(res => {
          res = res.data.data
          this.sourceOptions = res.map(item => {
            return {
              value: item.id,
              label: `【 ${item.databaseType} 】 ${item.databaseName}`
            }
          })
        }).catch(res=>{
          res={"message":null,"code":200,"data":[{"id":"1","name":"mysql","code":"mysql","isdefault":"2","isDefaultView":"1","databaseType":"MySql","ip":"192.168.1.210","port":"3306","databaseName":"dc_dms","userName":"huiqing","password":"aHVpcWluZ2BodWlxaW5n","des":null,"url":null,"state":"0"},{"id":"2","name":"mongo","code":"mongo","isdefault":"2","isDefaultView":"2","databaseType":"MongoDB","ip":"192.168.1.241","port":"27017","databaseName":"dc_test","userName":null,"password":null,"des":null,"url":null,"state":"0"},{"id":"3","name":"oracle","code":"oracle","isdefault":"2","isDefaultView":"2","databaseType":"Oracle","ip":"192.168.1.47","port":"1521","databaseName":"orcl","userName":"SMARTCITY","password":"U01BUlRDSVRZYFNNQVJUQ0lUWSMyMDE4","des":null,"url":null,"state":"0"}]};
          res = res.data;
          this.sourceOptions = res.map(item => {
            return {
              value: item.id,
              label: `【 ${item.databaseType} 】 ${item.databaseName}`
            }
          })
        })
      },
      getTreeConfig() {
        this.treeLoading = true
        fetch({
          url: `dms/databaseList/${this.sourceId}`,
          method: 'get'
        }).then(res => {
          this.treeLoading = false
          res = res.data.data
          res = res.map(item => {
            item.parentId = item.pid
            return item
          })
          res = TreeUtil(res)
          this.treeConfig = res.children
        }).catch(res=>{
          this.treeLoading = false
          res={"message":null,"code":200,"data":[{"name":"dc_dms","icon":"icon-hamburg-database","pid":0,"id":1,"type":"db"},{"name":"表","icon":"icon-berlin-billing","pid":1,"id":2,"type":"direct"},{"name":"视图","icon":"icon-berlin-address","pid":1,"id":3,"type":"direct"},{"name":"函数","icon":"icon-berlin-address","pid":1,"id":4,"type":"direct"},{"name":"computer_info","icon":"icon-berlin-calendar","pid":2,"id":5,"type":"table"},{"name":"dc_backup","icon":"icon-berlin-calendar","pid":2,"id":6,"type":"table"},{"name":"dc_data_source","icon":"icon-berlin-calendar","pid":2,"id":7,"type":"table"},{"name":"dc_search_history","icon":"icon-berlin-calendar","pid":2,"id":8,"type":"table"},{"name":"dc_sql_study","icon":"icon-berlin-calendar","pid":2,"id":9,"type":"table"},{"name":"dc_test","icon":"icon-berlin-calendar","pid":2,"id":10,"type":"table"},{"name":"dc_test_1","icon":"icon-berlin-calendar","pid":2,"id":11,"type":"table"},{"name":"dept","icon":"icon-berlin-calendar","pid":2,"id":12,"type":"table"},{"name":"gisdata","icon":"icon-berlin-calendar","pid":2,"id":13,"type":"table"},{"name":"oauth_client_details","icon":"icon-berlin-calendar","pid":2,"id":14,"type":"table"},{"name":"person_test","icon":"icon-berlin-calendar","pid":2,"id":15,"type":"table"},{"name":"street_community","icon":"icon-berlin-calendar","pid":2,"id":16,"type":"table"},{"name":"stu","icon":"icon-berlin-calendar","pid":2,"id":17,"type":"table"},{"name":"t_food","icon":"icon-berlin-calendar","pid":2,"id":18,"type":"table"},{"name":"t_user","icon":"icon-berlin-calendar","pid":2,"id":19,"type":"table"},{"name":"table3","icon":"icon-berlin-calendar","pid":2,"id":20,"type":"table"},{"name":"test1","icon":"icon-berlin-calendar","pid":2,"id":21,"type":"table"},{"name":"test11","icon":"icon-berlin-calendar","pid":2,"id":22,"type":"table"},{"name":"test111","icon":"icon-berlin-calendar","pid":2,"id":23,"type":"table"},{"name":"test112","icon":"icon-berlin-calendar","pid":2,"id":24,"type":"table"},{"name":"test12","icon":"icon-berlin-calendar","pid":2,"id":25,"type":"table"},{"name":"test2","icon":"icon-berlin-calendar","pid":2,"id":26,"type":"table"},{"name":"test3","icon":"icon-berlin-calendar","pid":2,"id":27,"type":"table"},{"name":"user","icon":"icon-berlin-calendar","pid":2,"id":28,"type":"table"},{"name":"wqwq","icon":"icon-berlin-calendar","pid":2,"id":29,"type":"table"},{"name":"zipkin_annotations","icon":"icon-berlin-calendar","pid":2,"id":30,"type":"table"},{"name":"zipkin_dependencies","icon":"icon-berlin-calendar","pid":2,"id":31,"type":"table"},{"name":"zipkin_spans","icon":"icon-berlin-calendar","pid":2,"id":32,"type":"table"},{"name":"v_test","icon":"icon-berlin-library","pid":3,"id":33,"type":"view"},{"name":"currval","icon":"icon-berlin-settings","pid":4,"id":34,"type":"function"},{"pid":-1,"id":0,"type":"pcode"}]};
          res = res.data;
          res = res.map(item => {
            item.parentId = item.pid
            return item
          })
          res = TreeUtil(res)
          this.treeConfig = res.children
        })
      },
      handleSelectionChange(rows) {
        this.allGridConfigs[this.activeTabIndex].selectedArr = rows
      },
      initTableSelect(rows) {
        if (rows) {
          rows.forEach(row => {
            this.$refs.table.toggleRowSelection(row)
          })
        } else {
          this.$refs.table.clearSelection()
        }
      },
      initSetTableSelect(rows) {
        if (rows) {
          rows.forEach(row => {
            this.$refs.setTable.toggleRowSelection(row)
          })
        } else {
          this.$refs.setTable.clearSelection()
        }
      },
      tableRowIsEdit(row) {
        row.isEdit = true
      },
      setTableRowIsEdit(row) {
        if (row['COLUMN_KEY'] == 'PRI' && row['IS_NULLABLE'] == 'YES') {
          row['IS_NULLABLE'] = 'NO'
        }
        row.isEdit = true
      },
      injectOldData(targetIndex) {
        this.allGridConfigs[targetIndex].data.forEach(item => {
          const row = Object.assign({}, item)
          item.oldData = row
        })
      },
      addTableRow() {
        let { ...obj } = this.allGridConfigs[this.activeTabIndex].data[0]
        for (const key in obj) {
          obj[key] = ''
        }
        obj.isInsert = true
        this.allGridConfigs[this.activeTabIndex].data.unshift(obj)
      },
      copyTableRow() {
        const rows = JSON.parse(JSON.stringify(this.allGridConfigs[this.activeTabIndex].selectedArr))
        if (!rows.length) {
          Message({
            message: '请至少选中一行数据',
            type: 'warning',
            duration: 3000
          })
        } else {
          rows.forEach(item => {
            delete item.oldData
            item.isInsert = true
            for (const key in item) {
              if (item[key] == null) {
                item[key] = ''
              }
            }
          })
          this.allGridConfigs[this.activeTabIndex].data.unshift(...rows)
        }
      },
      deleteTableRow() {
        const rows = JSON.parse(JSON.stringify(this.allGridConfigs[this.activeTabIndex].selectedArr))
        if (!rows.length) {
          Message({
            message: '请至少选中一行数据',
            type: 'warning',
            duration: 3000
          })
        } else {
          let hasInsert = rows.some(item => {
            return item.isInsert
          })
          if (hasInsert) {
            Message({
              message: '请先保存变更内容！',
              type: 'warning',
              duration: 3000
            })
          } else {
            const checkedItems = []
            rows.forEach(item => {
              for (const key in item) {
                if (!item.isInsert) {
                  checkedItems.push(item.oldData)
                }
              }
            })
            this.$confirm('删除选中的数据, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.tableLoading = true
              fetch({
                url: `/table/deleteRows/${this.sourceId}`,
                method: 'post',
                data: {
                  checkedItems: JSON.stringify(checkedItems),
                  databaseName: this.currentConfig.databaseName,
                  tableName: this.currentConfig.tableName,
                  primary_key: this.currentConfig.primaryKey
                }
              }).then(res => {
                this.tableLoading = false
                res = res.data
                if (res.code == '200') {
                  Message({
                    message: '删除成功',
                    type: 'success',
                    duration: 3000
                  })
                  this.refreshTable()
                } else {
                  Message({
                    message: res.message,
                    type: 'error',
                    duration: 5000
                  })
                }
              }).catch(res=>{
                this.tableLoading = false
                res={"message":null,"code":200,"data":"删除成功！"};
                if (res.code == '200') {
                  Message({
                    message: '删除成功',
                    type: 'success',
                    duration: 3000
                  })
                  this.refreshTable()
                } else {
                  Message({
                    message: res.message,
                    type: 'error',
                    duration: 5000
                  })
                }
              })
            }).catch(() => {
              this.$message({
                type: 'info',
                message: '已取消删除'
              })
            })
          }
        }
      },
      refreshTable() {
        this.tableLoading = true
        let targetIndex = this.activeTabIndex
        fetch({
          url: `table/${this.currentTableName}/${this.currentDatabaseName}/${this.sourceId}`,
          method: 'post',
          data: {
            pageNo: this.allGridConfigs[targetIndex].pageNo,
            pageSize: this.allGridConfigs[targetIndex].pageSize
          }
        }).then(res => {
          this.tableLoading = false
          res = res.data.data
          this.allGridConfigs[targetIndex].columnHeads = JSON.parse(res.columns)[0].slice(1)
          this.allGridConfigs[targetIndex].data = res.rows
          this.allGridConfigs[targetIndex].total = res.total
          this.allGridConfigs[targetIndex].primaryKey = res.primaryKey
          this.allGridConfigs[targetIndex].columnHeads.forEach((item, index) => {
            let width
            if (item.editor == 'datetimebox') {
              width = 220
            } else {
              let headWidth = item.field.toString().length * 12
              let tdStr = ''
              this.allGridConfigs[targetIndex].data.forEach(v => {
                if (v[item.field]) {
                  if (v[item.field].toString().length > tdStr.length) {
                    tdStr = v[item.field].toString()
                  }
                } else {
                  v[item.field] = ''
                  if (v[item.field].toString().length > tdStr.length) {
                    tdStr = v[item.field].toString()
                  }
                }
              })
              let tdWidth = 11 * tdStr.length + 40
              width = headWidth >= tdWidth ? headWidth : tdWidth
            }
            this.allGridConfigs[targetIndex].columnHeads[index].width = width
          })

          this.injectOldData(targetIndex)
        }).catch(res=>{
          this.tableLoading = false
          res={"message":null,"code":200,"data":{"total":69,"columns":"[[{\"field\":\"treeSoftPrimaryKey\",\"checkbox\":true},{\"editor\":\"numberbox\",\"field\":\"id\",\"sortable\":true,\"title\":\"id\"},{\"editor\":\"text\",\"field\":\"ip\",\"sortable\":true,\"title\":\"ip\"},{\"editor\":\"text\",\"field\":\"system_name\",\"sortable\":true,\"title\":\"system_name\"},{\"editor\":\"numberbox\",\"field\":\"total_memory\",\"sortable\":true,\"title\":\"total_memory\"},{\"editor\":\"numberbox\",\"field\":\"free_memory\",\"sortable\":true,\"title\":\"free_memory\"},{\"editor\":\"numberbox\",\"field\":\"available_memory\",\"sortable\":true,\"title\":\"available_memory\"},{\"editor\":\"datetimebox\",\"field\":\"current_time\",\"sortable\":true,\"title\":\"current_time\"},{\"editor\":\"text\",\"field\":\"disk_info\",\"sortable\":true,\"title\":\"disk_info\"},{\"editor\":\"numberbox\",\"field\":\"cpu_user_rate\",\"sortable\":true,\"title\":\"cpu_user_rate\"}]]","mess":"执行完成！","rows":[{"id":1,"ip":"192.168.56.1","system_name":"Windows 10 x64","total_memory":8087.0,"free_memory":4557.0,"available_memory":3529.0,"current_time":"2019-01-03 13:21:56","disk_info":"[{\"diskName\":\"C:\\\\\",\"diskRate\":\"55.00000000000001%\",\"diskUsed\":131966,\"diskTotal\":242050,\"diskFree\":110083}]","cpu_user_rate":6.0},{"id":2,"ip":"192.168.56.1","system_name":"Windows 10 x64","total_memory":8087.0,"free_memory":4540.0,"available_memory":3547.0,"current_time":"2019-01-03 13:22:08","disk_info":"[{\"diskName\":\"C:\\\\\",\"diskRate\":\"55.00000000000001%\",\"diskUsed\":131966,\"diskTotal\":242050,\"diskFree\":110083}]","cpu_user_rate":9.0},{"id":3,"ip":"192.168.56.1","system_name":"Windows 10 x64","total_memory":8087.0,"free_memory":4547.0,"available_memory":3540.0,"current_time":"2019-01-03 13:23:36","disk_info":"[{\"diskName\":\"C:\\\\\",\"diskRate\":\"55.00000000000001%\",\"diskUsed\":131960,\"diskTotal\":242050,\"diskFree\":110089}]","cpu_user_rate":4.0},{"id":4,"ip":"192.168.56.1","system_name":"Windows 10 x64","total_memory":8087.0,"free_memory":4558.0,"available_memory":3528.0,"current_time":"2019-01-03 13:23:44","disk_info":"[{\"diskName\":\"C:\\\\\",\"diskRate\":\"55.00000000000001%\",\"diskUsed\":131960,\"diskTotal\":242050,\"diskFree\":110089}]","cpu_user_rate":9.0},{"id":5,"ip":"192.168.56.1","system_name":"Windows 10 x64","total_memory":8087.0,"free_memory":4561.0,"available_memory":3525.0,"current_time":"2019-01-03 13:23:48","disk_info":"[{\"diskName\":\"C:\\\\\",\"diskRate\":\"55.00000000000001%\",\"diskUsed\":131960,\"diskTotal\":242050,\"diskFree\":110089}]","cpu_user_rate":17.0},{"id":6,"ip":"192.168.56.1","system_name":"Windows 10 x64","total_memory":8087.0,"free_memory":4563.0,"available_memory":3524.0,"current_time":"2019-01-03 13:23:52","disk_info":"[{\"diskName\":\"C:\\\\\",\"diskRate\":\"55.00000000000001%\",\"diskUsed\":131960,\"diskTotal\":242050,\"diskFree\":110089}]","cpu_user_rate":8.0},{"id":7,"ip":"192.168.56.1","system_name":"Windows 10 x64","total_memory":8087.0,"free_memory":4564.0,"available_memory":3523.0,"current_time":"2019-01-03 13:23:56","disk_info":"[{\"diskName\":\"C:\\\\\",\"diskRate\":\"55.00000000000001%\",\"diskUsed\":131960,\"diskTotal\":242050,\"diskFree\":110089}]","cpu_user_rate":16.0},{"id":8,"ip":"192.168.56.1","system_name":"Windows 10 x64","total_memory":8087.0,"free_memory":4567.0,"available_memory":3520.0,"current_time":"2019-01-03 13:24:00","disk_info":"[{\"diskName\":\"C:\\\\\",\"diskRate\":\"55.00000000000001%\",\"diskUsed\":131960,\"diskTotal\":242050,\"diskFree\":110089}]","cpu_user_rate":10.0},{"id":9,"ip":"192.168.56.1","system_name":"Windows 10 x64","total_memory":8087.0,"free_memory":4567.0,"available_memory":3520.0,"current_time":"2019-01-03 13:24:04","disk_info":"[{\"diskName\":\"C:\\\\\",\"diskRate\":\"55.00000000000001%\",\"diskUsed\":131960,\"diskTotal\":242050,\"diskFree\":110089}]","cpu_user_rate":10.0},{"id":10,"ip":"192.168.56.1","system_name":"Windows 10 x64","total_memory":8087.0,"free_memory":4515.0,"available_memory":3572.0,"current_time":"2019-01-03 13:24:32","disk_info":"[{\"diskName\":\"C:\\\\\",\"diskRate\":\"55.00000000000001%\",\"diskUsed\":131962,\"diskTotal\":242050,\"diskFree\":110087}]","cpu_user_rate":39.0},{"id":11,"ip":"192.168.56.1","system_name":"Windows 10 x64","total_memory":8087.0,"free_memory":4440.0,"available_memory":3647.0,"current_time":"2019-01-03 13:24:36","disk_info":"[{\"diskName\":\"C:\\\\\",\"diskRate\":\"55.00000000000001%\",\"diskUsed\":131962,\"diskTotal\":242050,\"diskFree\":110087}]","cpu_user_rate":12.0},{"id":12,"ip":"192.168.56.1","system_name":"Windows 10 x64","total_memory":8087.0,"free_memory":4432.0,"available_memory":3654.0,"current_time":"2019-01-03 13:24:40","disk_info":"[{\"diskName\":\"C:\\\\\",\"diskRate\":\"55.00000000000001%\",\"diskUsed\":131962,\"diskTotal\":242050,\"diskFree\":110087}]","cpu_user_rate":16.0},{"id":13,"ip":"192.168.56.1","system_name":"Windows 10 x64","total_memory":8087.0,"free_memory":4443.0,"available_memory":3644.0,"current_time":"2019-01-03 13:24:44","disk_info":"[{\"diskName\":\"C:\\\\\",\"diskRate\":\"55.00000000000001%\",\"diskUsed\":131962,\"diskTotal\":242050,\"diskFree\":110087}]","cpu_user_rate":6.0},{"id":14,"ip":"192.168.56.1","system_name":"Windows 10 x64","total_memory":8087.0,"free_memory":4446.0,"available_memory":3641.0,"current_time":"2019-01-03 13:24:48","disk_info":"[{\"diskName\":\"C:\\\\\",\"diskRate\":\"55.00000000000001%\",\"diskUsed\":131962,\"diskTotal\":242050,\"diskFree\":110087}]","cpu_user_rate":12.0},{"id":15,"ip":"192.168.56.1","system_name":"Windows 10 x64","total_memory":8087.0,"free_memory":4435.0,"available_memory":3652.0,"current_time":"2019-01-03 13:24:52","disk_info":"[{\"diskName\":\"C:\\\\\",\"diskRate\":\"55.00000000000001%\",\"diskUsed\":131962,\"diskTotal\":242050,\"diskFree\":110087}]","cpu_user_rate":0.0}],"totalCount":69,"operator":"edit","primaryKey":"id","status":"success"}};
          res = res.data;
          this.allGridConfigs[targetIndex].columnHeads = JSON.parse(res.columns)[0].slice(1)
          this.allGridConfigs[targetIndex].data = res.rows
          this.allGridConfigs[targetIndex].total = res.total
          this.allGridConfigs[targetIndex].primaryKey = res.primaryKey
          this.allGridConfigs[targetIndex].columnHeads.forEach((item, index) => {
            let width
            if (item.editor == 'datetimebox') {
              width = 220
            } else {
              let headWidth = item.field.toString().length * 12
              let tdStr = ''
              this.allGridConfigs[targetIndex].data.forEach(v => {
                if (v[item.field]) {
                  if (v[item.field].toString().length > tdStr.length) {
                    tdStr = v[item.field].toString()
                  }
                } else {
                  v[item.field] = ''
                  if (v[item.field].toString().length > tdStr.length) {
                    tdStr = v[item.field].toString()
                  }
                }
              })
              let tdWidth = 11 * tdStr.length + 40
              width = headWidth >= tdWidth ? headWidth : tdWidth
            }
            this.allGridConfigs[targetIndex].columnHeads[index].width = width
          })

          this.injectOldData(targetIndex)
        })
      },
      saveTable() {
        this.tableLoading = true
        let inserted = [], updated = []
        const currentRows = JSON.parse(JSON.stringify(this.currentConfig.data))
        currentRows.forEach(item => {
          if (item.isInsert) {
            delete item.isInsert
            delete item.isEdit
            delete item.oldData
            inserted.push(item)
          } else if (item.isEdit) {
            delete item.isEdit
            const oldData = Object.assign({}, item.oldData)
            delete item.oldData
            const changesData = {}
            for (const key in item) {
              if (item[key] != oldData[key]) {
                changesData[key] = item[key]
              }
            }
            updated.push({ oldData: oldData, changesData: changesData })
          }
        })
        const params = {
          databaseName: this.currentConfig.databaseName,
          tableName: this.currentConfig.tableName,
          primary_key: this.currentConfig.primaryKey
        }
        if (inserted.length) {
          params.inserted = JSON.stringify(inserted)
        }
        if (updated.length) {
          params.updated = JSON.stringify(updated)
        }
        fetch({
          url: `table/saveData/${this.sourceId}`,
          method: 'post',
          data: params
        }).then(res => {
          this.tableLoading = false
          res = res.data
          if (res.code == '200') {
            Message({
              message: '保存成功！',
              type: 'success',
              duration: 3000
            })
            this.refreshTable()
          } else {
            Message({
              message: res.message,
              type: 'error',
              duration: 5000
            })
          }
        }).catch(res=>{
          this.tableLoading = false
          res={"message":null,"code":200,"data":"保存成功！"};
          if (res.code == '200') {
            Message({
              message: '保存成功！',
              type: 'success',
              duration: 3000
            })
            this.refreshTable()
          } else {
            Message({
              message: res.message,
              type: 'error',
              duration: 5000
            })
          }
        })
      },
      setTableByRightMouse(fromRightMouseObj) {
        this.setTable('', fromRightMouseObj)
      },
      setTable($event, fromRightMouseObj) {
        let bName, tName
        if (!fromRightMouseObj) {
          bName = this.currentDatabaseName
          tName = this.currentTableName
        } else {
          bName = fromRightMouseObj.database.name
          tName = fromRightMouseObj.table.name
        }

        var num = 0
        var length = this.allGridConfigs.length
        for (var i = 0; i < length; i++) {
          if (this.allGridConfigs[i].databaseName == bName &&
            this.allGridConfigs[i].tableName == tName &&
            this.allGridConfigs[i].type == 'setTable') {
            num++
            this.activeTabIndex = i
          }
        }

        if (num > 0) {
          return

        } else if (num == 0) {
          this.allGridConfigs.push({
            type: 'setTable',
            databaseName: bName,
            tableName: tName,
            selectedArr: [],
            pageNo: 1,
            total: 1,
            pageSize: 15,
            columnHeads: [],
            data: []
          })
          this.activeTabIndex = this.allGridConfigs.length - 1

          this.$nextTick(() => {
            var tabBoxWidth = $('.tab-box').outerWidth()
            var scrollLeft = $('.tab-box').scrollLeft()
            var left = scrollLeft + tabBoxWidth
            $('.tab-box').animate({ scrollLeft: left }, 300)
          })
          this.refreshSetTable()
        }
      },
      addSetTableRow() {
        let obj = {
          CHARACTER_MAXIMUM_LENGTH: null,
          COLUMN_COMMENT: '',
          COLUMN_DEFAULT: null,
          COLUMN_KEY: '',
          COLUMN_NAME: '',
          COLUMN_TYPE: '',
          DATA_TYPE: '',
          IS_NULLABLE: 'NO',
          NUMERIC_PRECISION: '',
          NUMERIC_SCALE: '',
          TREESOFTPRIMARYKEY: '',
          extra: '',
          CHANGDU: '',
          JINGDU: ''
        }
        obj.isInsert = true
        this.allGridConfigs[this.activeTabIndex].data.unshift(obj)
      },
      deleteSetTableRow() {
        let rows = JSON.parse(JSON.stringify(this.allGridConfigs[this.activeTabIndex].selectedArr))
        if (!rows.length) {
          Message({
            message: '请至少选中一行数据',
            type: 'warning',
            duration: 3000
          })
        } else {
          rows = rows.map(item => {
            return item.COLUMN_NAME
          })
          this.tableLoading = true
          fetch({
            url: `table/deleteTableColumn/${this.sourceId}`,
            method: 'post',
            data: {
              databaseName: this.currentDatabaseName,
              tableName: this.currentTableName,
              ids: rows
            }
          }).then(res => {
            this.tableLoading = false
            res = res.data
            if (res.code == '200') {
              Message({
                message: '删除成功',
                type: 'success',
                duration: 3000
              })
              this.refreshSetTable()
            } else {
              Message({
                message: res.message,
                type: 'error',
                duration: 5000
              })
            }
          }).catch(res=>{
            this.tableLoading = false
            res={"message":null,"code":200,"data":{"totalCount":0}};
            if (res.code == '200') {
              Message({
                message: '删除成功',
                type: 'success',
                duration: 3000
              })
              this.refreshSetTable()
            } else {
              Message({
                message: res.message,
                type: 'error',
                duration: 5000
              })
            }
          })
        }
      },
      moveRowUp() {
        let rows = this.allGridConfigs[this.activeTabIndex].selectedArr
        if (!rows.length) {
          Message({
            message: '请至少选中一行数据',
            type: 'warning',
            duration: 3000
          })
        } else {
          let row = rows[0]
          let column_name2 = row.COLUMN_NAME
          let idx = -1
          this.currentConfig.data.forEach((item, index) => {
            if (item['COLUMN_NAME'] == column_name2) {
              idx = index - 1
            }
          })
          if (idx >= 0) {
            let row = this.allGridConfigs[this.activeTabIndex].data[idx]
            let row2 = this.allGridConfigs[this.activeTabIndex].data[idx + 1]

            this.allGridConfigs[this.activeTabIndex].data[idx] = row2
            this.allGridConfigs[this.activeTabIndex].data[idx + 1] = row

            this.initSetTableSelect([this.allGridConfigs[this.activeTabIndex].data[9998]]) //该代码是为了解决移动后复选框选中状态没有跟随移动的坑

            let column_name = this.currentConfig.data[idx + 1]['COLUMN_NAME']
            let params = {
              databaseName: this.currentDatabaseName,
              tableName: this.currentTableName,
              column_name,
              column_name2
            }
            this.tableLoading = true
            fetch({
              url: `table/upDownColumn/${this.sourceId}`,
              method: 'post',
              data: params
            }).then(res => {
              this.tableLoading = false
              res = res.data
              if (res.code == '200') {
                Message({
                  message: '保存成功',
                  type: 'success',
                  duration: 3000
                })
              } else {
                Message({
                  message: res.message,
                  type: 'error',
                  duration: 5000
                })
              }
            }).catch(res=>{
              this.tableLoading = false
              res={"message":null,"code":200,"data":"操作成功！"};
              if (res.code == '200') {
                Message({
                  message: '保存成功',
                  type: 'success',
                  duration: 3000
                })
              } else {
                Message({
                  message: res.message,
                  type: 'error',
                  duration: 5000
                })
              }
            })
          }
        }
      },
      moveRowDown() {
        let rows = this.allGridConfigs[this.activeTabIndex].selectedArr
        if (!rows.length) {
          Message({
            message: '请至少选中一行数据',
            type: 'warning',
            duration: 3000
          })
        } else {
          let row = rows[0]
          let column_name = row.COLUMN_NAME
          let idx = -1
          this.currentConfig.data.forEach((item, index) => {
            if (item['COLUMN_NAME'] == column_name) {
              idx = index
            }
          })
          if (idx < this.currentConfig.data.length - 1) {
            let column_name2 = this.currentConfig.data[idx + 1]['COLUMN_NAME']

            let row = this.allGridConfigs[this.activeTabIndex].data[idx]
            let row2 = this.allGridConfigs[this.activeTabIndex].data[idx + 1]

            this.allGridConfigs[this.activeTabIndex].data[idx] = row2
            this.allGridConfigs[this.activeTabIndex].data[idx + 1] = row

            this.initSetTableSelect([this.allGridConfigs[this.activeTabIndex].data[9998]]) //该代码是为了解决移动后复选框选中状态没有跟随移动的坑

            let params = {
              databaseName: this.currentDatabaseName,
              tableName: this.currentTableName,
              column_name,
              column_name2
            }
            this.tableLoading = true
            fetch({
              url: `table/upDownColumn/${this.sourceId}`,
              method: 'post',
              data: params
            }).then(res => {
              this.tableLoading = false
              res = res.data
              if (res.code == '200') {
                Message({
                  message: '保存成功',
                  type: 'success',
                  duration: 3000
                })
              } else {
                Message({
                  message: res.message,
                  type: 'error',
                  duration: 5000
                })
              }
            }).catch(res=>{
              this.tableLoading = false
              res={"message":null,"code":200,"data":"操作成功！"};
              if (res.code == '200') {
                Message({
                  message: '保存成功',
                  type: 'success',
                  duration: 3000
                })
              } else {
                Message({
                  message: res.message,
                  type: 'error',
                  duration: 5000
                })
              }
            })
          }
        }
      },
      refreshSetTable() {
        this.tableLoading = true
        let targetIndex = this.activeTabIndex
        fetch({
          url: `/table/designTableData/${this.currentTableName}/${this.currentDatabaseName}/${this.sourceId}`,
          method: 'get'
        }).then(res => {
          this.tableLoading = false
          res = res.data.data
          this.allGridConfigs[targetIndex].total = res.total
          this.allGridConfigs[targetIndex].data = res.rows
          this.allGridConfigs[targetIndex].columnHeads = [{
            label: '字段名',
            field: 'COLUMN_NAME',
            width: '220'
          }, { label: '类型', field: 'DATA_TYPE', width: '200' }, {
            label: '长度',
            field: 'CHANGDU',
            width: '100'
          }, {
            label: '精度',
            field: 'JINGDU',
            width: '100'
          }, { label: '注释', field: 'COLUMN_COMMENT' }, {
            label: '允许空值',
            field: 'IS_NULLABLE',
            width: '100'
          }, { label: '主键设置', field: 'COLUMN_KEY', width: '100' }]

        }).catch(res=>{
          this.tableLoading = false
          res={"message":null,"code":200,"data":{"total":9,"rows":[{"TREESOFTPRIMARYKEY":"id","COLUMN_NAME":"id","COLUMN_TYPE":"int(11)","DATA_TYPE":"int","COLUMN_DEFAULT":null,"CHARACTER_MAXIMUM_LENGTH":null,"NUMERIC_PRECISION":10,"NUMERIC_SCALE":0,"IS_NULLABLE":"NO","COLUMN_KEY":"PRI","extra":"auto_increment","COLUMN_COMMENT":"","CHANGDU":"11","JINGDU":0},{"TREESOFTPRIMARYKEY":"ip","COLUMN_NAME":"ip","COLUMN_TYPE":"varchar(50)","DATA_TYPE":"varchar","COLUMN_DEFAULT":null,"CHARACTER_MAXIMUM_LENGTH":50,"NUMERIC_PRECISION":null,"NUMERIC_SCALE":null,"IS_NULLABLE":"YES","COLUMN_KEY":"","extra":"","COLUMN_COMMENT":"","CHANGDU":"50","JINGDU":0},{"TREESOFTPRIMARYKEY":"system_name","COLUMN_NAME":"system_name","COLUMN_TYPE":"varchar(50)","DATA_TYPE":"varchar","COLUMN_DEFAULT":null,"CHARACTER_MAXIMUM_LENGTH":50,"NUMERIC_PRECISION":null,"NUMERIC_SCALE":null,"IS_NULLABLE":"YES","COLUMN_KEY":"","extra":"","COLUMN_COMMENT":"","CHANGDU":"50","JINGDU":0},{"TREESOFTPRIMARYKEY":"total_memory","COLUMN_NAME":"total_memory","COLUMN_TYPE":"double(50,2)","DATA_TYPE":"double","COLUMN_DEFAULT":null,"CHARACTER_MAXIMUM_LENGTH":null,"NUMERIC_PRECISION":50,"NUMERIC_SCALE":2,"IS_NULLABLE":"YES","COLUMN_KEY":"","extra":"","COLUMN_COMMENT":"","CHANGDU":"50","JINGDU":"2"},{"TREESOFTPRIMARYKEY":"free_memory","COLUMN_NAME":"free_memory","COLUMN_TYPE":"double(50,0)","DATA_TYPE":"double","COLUMN_DEFAULT":null,"CHARACTER_MAXIMUM_LENGTH":null,"NUMERIC_PRECISION":50,"NUMERIC_SCALE":0,"IS_NULLABLE":"YES","COLUMN_KEY":"","extra":"","COLUMN_COMMENT":"","CHANGDU":"50","JINGDU":"0"},{"TREESOFTPRIMARYKEY":"available_memory","COLUMN_NAME":"available_memory","COLUMN_TYPE":"double(50,0)","DATA_TYPE":"double","COLUMN_DEFAULT":null,"CHARACTER_MAXIMUM_LENGTH":null,"NUMERIC_PRECISION":50,"NUMERIC_SCALE":0,"IS_NULLABLE":"YES","COLUMN_KEY":"","extra":"","COLUMN_COMMENT":"","CHANGDU":"50","JINGDU":"0"},{"TREESOFTPRIMARYKEY":"current_time","COLUMN_NAME":"current_time","COLUMN_TYPE":"datetime","DATA_TYPE":"datetime","COLUMN_DEFAULT":null,"CHARACTER_MAXIMUM_LENGTH":null,"NUMERIC_PRECISION":null,"NUMERIC_SCALE":null,"IS_NULLABLE":"YES","COLUMN_KEY":"","extra":"","COLUMN_COMMENT":"","CHANGDU":0,"JINGDU":0},{"TREESOFTPRIMARYKEY":"disk_info","COLUMN_NAME":"disk_info","COLUMN_TYPE":"text","DATA_TYPE":"text","COLUMN_DEFAULT":null,"CHARACTER_MAXIMUM_LENGTH":65535,"NUMERIC_PRECISION":null,"NUMERIC_SCALE":null,"IS_NULLABLE":"YES","COLUMN_KEY":"","extra":"","COLUMN_COMMENT":"","CHANGDU":0,"JINGDU":0},{"TREESOFTPRIMARYKEY":"cpu_user_rate","COLUMN_NAME":"cpu_user_rate","COLUMN_TYPE":"double(50,0)","DATA_TYPE":"double","COLUMN_DEFAULT":null,"CHARACTER_MAXIMUM_LENGTH":null,"NUMERIC_PRECISION":50,"NUMERIC_SCALE":0,"IS_NULLABLE":"YES","COLUMN_KEY":"","extra":"","COLUMN_COMMENT":"","CHANGDU":"50","JINGDU":"0"}]}};
          res = res.data;
          this.allGridConfigs[targetIndex].total = res.total
          this.allGridConfigs[targetIndex].data = res.rows
          this.allGridConfigs[targetIndex].columnHeads = [{
            label: '字段名',
            field: 'COLUMN_NAME',
            width: '220'
          }, { label: '类型', field: 'DATA_TYPE', width: '200' }, {
            label: '长度',
            field: 'CHANGDU',
            width: '100'
          }, {
            label: '精度',
            field: 'JINGDU',
            width: '100'
          }, { label: '注释', field: 'COLUMN_COMMENT' }, {
            label: '允许空值',
            field: 'IS_NULLABLE',
            width: '100'
          }, { label: '主键设置', field: 'COLUMN_KEY', width: '100' }]
        })
      },
      cancelSetTable() {
        if (this.currentTableName == '新增表') {
          let index = this.activeTabIndex
          if (index + 1 in this.allGridConfigs) {
            this.activeTabIndex = index
          } else {
            this.activeTabIndex = index - 1
          }

          this.allGridConfigs.splice(index, 1)
          if (this.allGridConfigs.length == 0) {
            this.activeTabIndex = -1
          }
        } else {
          this.refreshSetTable()
        }
      },
      saveSetTable() {
        if (this.currentTableName != '新增表') {
          let inserted = [], updated = []
          const currentRows = JSON.parse(JSON.stringify(this.currentConfig.data))
          currentRows.forEach(item => {
            if (item.isInsert) {
              delete item.isInsert
              delete item.isEdit
              inserted.push(item)
            } else if (item.isEdit) {
              delete item.isEdit
              updated.push(item)
            }
          })
          const params = {
            databaseName: this.currentConfig.databaseName,
            tableName: this.currentConfig.tableName
          }
          if (inserted.length) {
            params.inserted = JSON.stringify(inserted)
          }
          if (updated.length) {
            params.updated = JSON.stringify(updated)
          }
          this.tableLoading = true
          fetch({
            url: `/table/designTableUpdate/${this.sourceId}`,
            method: 'post',
            data: params
          }).then(res => {
            this.tableLoading = false
            res = res.data
            if (res.code == '200') {
              Message({
                message: '保存成功！',
                type: 'success',
                duration: 3000
              })
              this.refreshSetTable()
            } else {
              Message({
                message: res.message,
                type: 'error',
                duration: 5000
              })
            }
          }).catch(res=>{
            this.tableLoading = false
            res={"message":null,"code":200,"data":"保存成功！"};
            if (res.code == '200') {
              Message({
                message: '保存成功！',
                type: 'success',
                duration: 3000
              })
              this.refreshSetTable()
            } else {
              Message({
                message: res.message,
                type: 'error',
                duration: 5000
              })
            }
          })
        } else {
          this.$prompt('请输入表名', '新增表名', {
            confirmButtonText: '确定',
            cancelButtonText: '取消'
          }).then(({ value }) => {
            this.fullScreenLoading = this.$loading({
              lock: true,
              text: 'Loading',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.3)'
            })
            let inserted = { total: '', rows: [] }
            let data = this.allGridConfigs[this.activeTabIndex].data
            inserted.total = data.length
            inserted.rows = JSON.parse(JSON.stringify(data)).map(item => {
              delete item.isInsert
              delete item.isEdit
              return Object.assign({}, item)
            })
            let params = {
              databaseName: this.mouseRightTableInfo.database.name,
              tableName: value,
              inserted: JSON.stringify(inserted)
            }
            fetch({
              url: `table/saveNewTable/${this.sourceId}`,
              method: 'post',
              data: params
            }).then(res => {
              this.fullScreenLoading.close()
              res = res.data
              if (res.code == '200') {
                this.allGridConfigs[this.activeTabIndex].tableName = value
                this.refreshSetTable()
                this.getTreeConfig()
                Message({
                  message: `新增表${value}成功`,
                  type: 'success',
                  duration: 3000
                })
              } else {
                Message({
                  message: res.message,
                  type: 'error',
                  duration: 5000
                })
              }
            }).catch(res=>{
              this.fullScreenLoading.close()
              res={"message":null,"code":200,"data":"保存成功！"};
              if (res.code == '200') {
                this.allGridConfigs[this.activeTabIndex].tableName = value
                this.refreshSetTable()
                this.getTreeConfig()
                Message({
                  message: `新增表${value}成功`,
                  type: 'success',
                  duration: 3000
                })
              } else {
                Message({
                  message: res.message,
                  type: 'error',
                  duration: 5000
                })
              }
            })
          })
        }
      },
      changeTable(obj, bool) {
        let viewType = bool ? 'viewTable' : 'table'
        let t = obj.table, b = obj.database
        let num = 0
        this.allGridConfigs.forEach((gridItem, index) => {
          if (
            gridItem.databaseName == b.name &&
            gridItem.tableName == t.name &&
            (gridItem.type == 'table' || gridItem.type == 'viewTable')
          ) {
            num++
            this.activeTabIndex = index
          }
        })
        if (num > 0) {

        } else if (num == 0) {
          this.allGridConfigs.push({
            type: viewType,
            databaseName: b.name,
            tableName: t.name,
            primaryKey: '',
            selectedArr: [],
            pageNo: 1,
            total: 1,
            pageSize: 15,
            order: '',
            orderBy: '',
            columnHeads: [],
            data: []
          })
          this.activeTabIndex = this.allGridConfigs.length - 1
          this.$nextTick(() => {
            var tabBoxWidth = $('.tab-box').outerWidth()
            var scrollLeft = $('.tab-box').scrollLeft()
            var left = scrollLeft + tabBoxWidth
            $('.tab-box').animate({ scrollLeft: left }, 300)
          })
          this.refreshTable()
        }
      },
      tableRename(obj) {
        const bName = obj.database.name, tName = obj.table.name
        this.$prompt('新表名', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(({ value }) => {
          if (value.toString().trim() == '') {
            Message({
              message: '表名不能为空',
              type: 'warning',
              duration: 3000
            })
          } else {
            this.fullScreenLoading = this.$loading({
              lock: true,
              text: 'Loading',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.3)'
            })
            fetch({
              url: `table/renameTable/${this.sourceId}`,
              method: 'post',
              data: {
                databaseName: bName,
                tableName: tName,
                newTableName: value
              }
            }).then(res => {
              this.fullScreenLoading.close()
              res = res.data
              if (res.code == '200') {
                Message({
                  message: '操作成功',
                  type: 'success',
                  duration: 3000
                })
                this.getTreeConfig()
              } else {
                Message({
                  message: res.message,
                  type: 'error',
                  duration: 5000
                })
              }
            }).catch(res=>{
              this.fullScreenLoading.close()
              res={"message":null,"code":200,"data":"操作成功！"};
              if (res.code == '200') {
                Message({
                  message: '操作成功',
                  type: 'success',
                  duration: 3000
                })
                this.getTreeConfig()
              } else {
                Message({
                  message: res.message,
                  type: 'error',
                  duration: 5000
                })
              }
            })
          }
        }).catch(() => {

        })
      },
      copyTable(obj) {
        const bName = obj.database.name, tName = obj.table.name
        this.fullScreenLoading = this.$loading({
          lock: true,
          text: '复制中，请稍等...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.3)'
        })
        fetch({
          url: `table/copyTable/${this.sourceId}`,
          method: 'post',
          data: {
            databaseName: bName,
            tableName: tName
          }
        }).then(res => {
          this.fullScreenLoading.close()
          res = res.data
          if (res.code == '200') {
            Message({
              message: '复制成功',
              type: 'success',
              duration: 3000
            })
            this.getTreeConfig()
          } else {
            Message({
              message: res.message,
              type: 'error',
              duration: 5000
            })
          }
        }).catch(res=>{
          this.fullScreenLoading.close()
          res={"message":null,"code":200,"data":"操作成功！"};
          if (res.code == '200') {
            Message({
              message: '复制成功',
              type: 'success',
              duration: 3000
            })
            this.getTreeConfig()
          } else {
            Message({
              message: res.message,
              type: 'error',
              duration: 5000
            })
          }
        })
      },
      deleteTable(obj) {
        let bName = obj.database.name, tName = obj.table.name
        this.$confirm(`你确定要删除表${tName}吗?`, '操作提醒', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.fullScreenLoading = this.$loading({
            lock: true,
            text: 'Loading',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.3)'
          })
          fetch({
            url: `/table/dropTable/${this.sourceId}`,
            method: 'post',
            data: {
              databaseName: bName,
              tableName: tName
            }
          }).then(res => {
            res = res.data
            this.fullScreenLoading.close()
            if (res.code == '200') {
              Message({
                message: '删除表成功',
                type: 'success',
                duration: 3000
              })
              this.getTreeConfig()
            } else {
              Message({
                message: res.message,
                type: 'error',
                duration: 5000
              })
            }
          }).catch(res=>{
            this.fullScreenLoading.close()
            res={"message":null,"code":200,"data":"删除成功！"};
            if (res.code == '200') {
              Message({
                message: '删除表成功',
                type: 'success',
                duration: 3000
              })
              this.getTreeConfig()
            } else {
              Message({
                message: res.message,
                type: 'error',
                duration: 5000
              })
            }
          })
        })
      },
      emptyTable(obj) {
        let bName = obj.database.name, tName = obj.table.name
        this.$confirm(`你确定要清空表${tName}吗?`, '操作提醒', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.fullScreenLoading = this.$loading({
            lock: true,
            text: 'Loading',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.3)'
          })
          fetch({
            url: `table/clearTable/${this.sourceId}`,
            method: 'post',
            data: {
              databaseName: bName,
              tableName: tName
            }
          }).then(res => {
            this.fullScreenLoading.close()
            res = res.data
            if (res.code == '200') {
              Message({
                message: '清空表成功',
                type: 'success',
                duration: 3000
              })
            } else {
              Message({
                message: res.message,
                type: 'error',
                duration: 5000
              })
            }
          }).catch(res=>{
            this.fullScreenLoading.close()
            res={"message":null,"code":200,"data":"操作成功！"};
            if (res.code == '200') {
              Message({
                message: '清空表成功',
                type: 'success',
                duration: 3000
              })
            } else {
              Message({
                message: res.message,
                type: 'error',
                duration: 5000
              })
            }
          })
        })
      },
      tableInfo(obj) {
        let bName = obj.database.name, tName = obj.table.name
        let num = 0
        let length = this.allGridConfigs.length
        for (let i = 0; i < length; i++) {
          if (this.allGridConfigs[i].databaseName == bName &&
            this.allGridConfigs[i].tableName == tName &&
            this.allGridConfigs[i].type == 'tableInfo') {
            num++
            this.activeTabIndex = i
          }
        }

        if (num > 0) {
          return

        } else if (num == 0) {
          this.allGridConfigs.push({
            type: 'tableInfo',
            databaseName: bName,
            tableName: tName,
            selectedArr: [],
            pageNo: 1,
            total: 1,
            pageSize: 15,
            columnHeads: [{ label: '名称', field: 'propName' }, { label: '信息', field: 'propValue' }],
            data: []
          })
          this.activeTabIndex = this.allGridConfigs.length - 1

          this.$nextTick(() => {
            var tabBoxWidth = $('.tab-box').outerWidth()
            var scrollLeft = $('.tab-box').scrollLeft()
            var left = scrollLeft + tabBoxWidth
            $('.tab-box').animate({ scrollLeft: left }, 300)
          })
          this.refreshTableInfo()
        }
      },
      refreshTableInfo() {
        this.tableLoading = true
        fetch({
          url: `table/viewTableMess/${this.currentTableName}/${this.currentDatabaseName}/${this.sourceId}`,
          method: 'get'
        }).then(res => {
          this.tableLoading = false
          res = res.data
          this.allGridConfigs[this.activeTabIndex].data = res.data.rows
        }).catch(res=>{
          this.tableLoading = false
          res={"message":null,"code":200,"data":{"total":16,"rows":[{"propValue":"computer_info","propName":"表名"},{"propValue":"dc_dms","propName":"数据库"},{"propValue":"69","propName":"总记录数"},{"propValue":"InnoDB","propName":"表类型"},{"propValue":70,"propName":"自动递增数值"},{"propValue":"Dynamic","propName":"栏格式"},{"propValue":"2019-01-22 13:25:58","propName":"刷新时间"},{"propValue":"2019-01-22 13:25:24","propName":"创建时间"},{"propValue":null,"propName":"校验时间"},{"propValue":0,"propName":"索引长度"},{"propValue":49152,"propName":"数据长度"},{"propValue":0,"propName":"最大数据长度"},{"propValue":0,"propName":"数据空闲"},{"propValue":"utf8_general_ci","propName":"整理"},{"propValue":"","propName":"创建选项"},{"propValue":"","propName":"注释"}]}};
          this.allGridConfigs[this.activeTabIndex].data = res.data.rows
        })
      },
      getMouseRightTableInfo(mouseRightTableInfo) {
        this.mouseRightTableInfo = mouseRightTableInfo
      },
      addTable(obj) {
        let bName = obj.database.name, tName = '新增表'
        let num = 0
        let length = this.allGridConfigs.length
        for (var i = 0; i < length; i++) {
          if (this.allGridConfigs[i].databaseName == bName &&
            this.allGridConfigs[i].tableName == tName &&
            this.allGridConfigs[i].type == 'setTable') {
            num++
            this.activeTabIndex = i
          }
        }
        if (num == 0) {

          this.allGridConfigs.push({
            type: 'setTable',
            databaseName: bName,
            tableName: tName,
            selectedArr: [],
            pageNo: 1,
            total: 1,
            pageSize: 15,
            columnHeads: [{
              label: '字段名',
              field: 'COLUMN_NAME',
              width: '220'
            }, { label: '类型', field: 'DATA_TYPE', width: '200' }, {
              label: '长度',
              field: 'CHANGDU',
              width: '100'
            }, {
              label: '精度',
              field: 'JINGDU',
              width: '100'
            }, { label: '注释', field: 'COLUMN_COMMENT' }, {
              label: '允许空值',
              field: 'IS_NULLABLE',
              width: '100'
            }, { label: '主键设置', field: 'COLUMN_KEY', width: '100' }],
            data: []
          })
          this.activeTabIndex = this.allGridConfigs.length - 1

          let row = {
            CHARACTER_MAXIMUM_LENGTH: null,
            COLUMN_COMMENT: '',
            COLUMN_DEFAULT: null,
            COLUMN_KEY: '',
            COLUMN_NAME: '',
            COLUMN_TYPE: '',
            DATA_TYPE: '',
            IS_NULLABLE: 'NO',
            NUMERIC_PRECISION: '',
            NUMERIC_SCALE: '',
            TREESOFTPRIMARYKEY: '',
            extra: '',
            CHANGDU: '',
            JINGDU: ''
          }
          row.isInsert = true
          this.allGridConfigs[this.activeTabIndex].data.push(row)

          this.$nextTick(() => {
            var tabBoxWidth = $('.tab-box').outerWidth()
            var scrollLeft = $('.tab-box').scrollLeft()
            var left = scrollLeft + tabBoxWidth
            $('.tab-box').animate({ scrollLeft: left }, 300)
          })
        }

      },
      toggleTab(index) {
        if (this.activeTabIndex == index) {
          return
        }
        this.activeTabIndex = index
      },
      deleteTab(index) {
        if (index == this.activeTabIndex) {
          if (index + 1 in this.allGridConfigs) {
            this.activeTabIndex = index
          } else {
            this.activeTabIndex = index - 1
          }
        } else if (index > this.activeTabIndex) {

        } else if (index < this.activeTabIndex) {
          this.activeTabIndex--
        }
        this.allGridConfigs.splice(index, 1)
        if (this.allGridConfigs.length == 0) {
          this.activeTabIndex = -1
        }
      },
      getMouseRightIndex(index) {
        this.mouseRightIndex = index
      }
    },
    watch: {
      activeTabIndex(val) {
        if (val >= 0) {
          this.play = false
          setTimeout(() => {
            this.play = true
            const rows = this.allGridConfigs[this.activeTabIndex].selectedArr
            if (this.allGridConfigs[this.activeTabIndex].type == 'table') {
              this.initTableSelect(rows)
            } else if (this.allGridConfigs[this.activeTabIndex].type == 'setTable') {
              this.initSetTableSelect(rows)
            }
          }, 10)
        }
      }
    },
    computed: {
      dico() {
        return this.dicoBase.concat(this.addDico)
      },
      dataTypeOptions() {
        switch (this.sourceType) {
          case 'MySql':
            return [{ label: 'char', value: 'char' }, {
              label: 'character',
              value: 'character'
            }, { label: 'character varying', value: 'character varying' }, {
              label: 'binary',
              value: 'binary'
            }, { label: 'bigint', value: 'bigint' }, { label: 'bit', value: 'bit' }, {
              label: 'blob',
              value: 'blob'
            }, { label: 'date', value: 'date' }, { label: 'datetime', value: 'datetime' }, {
              label: 'double',
              value: 'double'
            }, { label: 'decimal', value: 'decimal' }, { label: 'enum', value: 'enum' }, {
              label: 'float',
              value: 'float'
            }, { label: 'int', value: 'int' }, { label: 'integer', value: 'integer' }, {
              label: 'longtext',
              value: 'longtext'
            }, { label: 'longblob', value: 'longblob' }, {
              label: 'mediumint',
              value: 'mediumint'
            }, { label: 'mediumblob', value: 'mediumblob' }, {
              label: 'mediumtext',
              value: 'mediumtext'
            }, { label: 'number', value: 'number' }, { label: 'numeric', value: 'numeric' }, {
              label: 'nvarchar',
              value: 'nvarchar'
            }, { label: 'real', value: 'real' }, { label: 'set', value: 'set' }, {
              label: 'smallint',
              value: 'smallint'
            }, { label: 'string', value: 'string' }, { label: 'tinyint', value: 'tinyint' }, {
              label: 'tinytext',
              value: 'tinytext'
            }, { label: 'text', value: 'text' }, { label: 'tinyblob', value: 'tinyblob' }, {
              label: 'timestamp',
              value: 'timestamp'
            }, { label: 'time', value: 'time' }, { label: 'varchar', value: 'varchar' }, {
              label: 'varchar2',
              value: 'varchar2'
            }, { label: 'varbinary', value: 'varbinary' }, { label: 'year', value: 'year' }]
        }
      },
      currentConfig() {
        return this.allGridConfigs[this.activeTabIndex] || []
      },
      viewType() {
        return this.activeTabIndex == -1
          ? 'home'
          : this.allGridConfigs[this.activeTabIndex].type
      },
      currentTableName() {
        return this.allGridConfigs[this.activeTabIndex].tableName
      },
      currentDatabaseName() {
        return this.allGridConfigs[this.activeTabIndex].databaseName
      }
    }
  }
</script>
<style lang="scss">

  .database img {
    vertical-align: middle;
  }

  ::-webkit-scrollbar {
    width: 8px;
    background-color: transparent;
    border-radius: 4px;
    height: 8px;

  }

  /*定义滚动条轨道 内阴影+圆角*/

  ::-webkit-scrollbar-track {
    background-color: transparent;
    border: none;
    border-radius: 4px;
  }

  /*定义滑块 内阴影+圆角*/

  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: #ddd;
    background-color: rgba(222, 222, 222, .7);
  }

  ::-webkit-scrollbar-thumb:hover {
    border-radius: 4px;
    /*background-color:#35baf6;*/
    background-color: #aaa;
  }
</style>
<style lang="scss" scoped>
  /deep/ #editor .CodeMirror {
    height: calc(100% - 40px);
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
  }

  /deep/ .resultBox .CodeMirror {
    height: 100%;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
  }

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

  .database {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .tdText {
      background-color: transparent;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      border: 1px solid transparent;
      outline: none;
      padding: 0 8px;
      border-radius: 3px;

      &:focus {
        border-color: #409EFF;
      }

      &.new {
        border-color: #409EFF;
      }
    }

    #mainContent {
      flex: 1;
      display: flex;
      height: 100%;

      #centerContent {
        flex: 1;
        width: 1px; //该样式是为了限制flex为1的div被撑大
        #editor {
          width: 100%;
          height: 40%;

          .txt {
            width: 100%;
            height: calc(100% - 50px);
          }
        }

        #result {
          width: 100%;
          height: 60%;
          padding-top: 6px;

          .resultBox {
            height: calc(100% - 65px);

            & > div {
              height: 100%;
            }
          }

          .title {
            font-size: 14px;
            height: 30px;
            padding-left: 10px;
            line-height: 30px;
            border-top: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
          }

          .resultTabs {
            height: 35px;
            padding-top: 4px;
            background-color: #f0f2f5;
            border-bottom: 1px solid #ddd;

            .tabSign {
              height: 30px;
              line-height: 30px;
              padding-left: 28px;
              padding-right: 28px;
              position: relative;
              overflow: hidden;

              .resTabItem {
                display: inline-block;
                padding-left: 10px;
                padding-right: 10px;
                border: 1px solid #ddd;
                border-top-left-radius: 6px;
                border-top-right-radius: 6px;
                border-bottom: none;
                background-color: #eff1f5;
                cursor: pointer;

                span {
                  font-size: 14px;
                  vertical-align: middle;
                }

                i {
                  margin-left: 3px;
                  display: inline-block;
                  width: 16px;
                  height: 16px;
                  font-size: 10px;
                  line-height: 16px;
                  border-radius: 50%;
                  text-align: center;
                  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
                  transform-origin: 100% 50%;

                  &:before {
                    transform: scale(0.8);
                    display: inline-block;
                  }

                  &:hover {
                    background-color: #b4bccc;
                    color: #fff;
                  }
                }

                &.active {
                  background-color: #fff;
                  /* border-bottom: 1px solid #fff; */
                }
              }
            }
          }
        }

        .home {
          height: 100%;
        }

        #tBox {
          height: calc(100% - 35px);
          padding: 6px 0;

          .tableDetail {
            width: 100%;
            height: 100%;
          }
        }

        .pageTabs {
          height: 35px;
          background-color: #f0f2f5;
          padding-top: 4px;
          border-bottom: 1px solid #ddd;

          ul.pageSign {
            height: 30px;
            line-height: 30px;
            padding-left: 28px;
            padding-right: 28px;
            position: relative;
            overflow: hidden;

            p.iconBox2 {
              display: none;
              position: absolute;
              right: 0;
              top: 0;
              width: 28px;
              height: 35px;
              text-align: center;
              line-height: 38px;
              cursor: pointer;

              &:hover {
                i {
                  color: #000;
                }
              }

              i {
                color: #888;
                font-size: 18px;
              }
            }

            p.iconBox {
              display: none;
              position: absolute;
              left: 0;
              top: 0;
              width: 28px;
              height: 35px;
              text-align: center;
              line-height: 38px;
              cursor: pointer;

              &:hover {
                i {
                  color: #000;
                }
              }

              i {
                color: #888;
                font-size: 18px;
              }
            }

            .tab-box {
              /*height: 44px;*/
              white-space: nowrap;
              overflow-x: auto;

              .center-tab {
                li:not(:first-child) {
                  margin-left: 4px;
                }
              }
            }

            li {
              /*float: left;*/
              display: inline-block;
              padding-left: 10px;
              padding-right: 10px;
              border: 1px solid #ddd;
              /*margin-left: 5px;*/
              border-top-left-radius: 6px;
              border-top-right-radius: 6px;
              border-bottom: none;
              background-color: #eff1f5;
              cursor: pointer;

              img {
                margin-right: 5px;
              }

              span {
                font-size: 14px;
                vertical-align: middle;
              }

              &.active {
                background-color: #fff;
                /*border-bottom: 1px solid #fff;*/
              }

              .el-icon-close {
                margin-left: 3px;
                display: inline-block;
                width: 16px;
                height: 16px;
                font-size: 10px;
                line-height: 16px;
                border-radius: 50%;
                text-align: center;
                transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
                transform-origin: 100% 50%;

                &:before {
                  transform: scale(0.8);
                  display: inline-block;
                }

                &:hover {
                  background-color: #b4bccc;
                  color: #fff;
                }
              }
            }
          }
        }
      }
    }

    .toolBar {
      height: 30px;
      padding: 0 5px;
      background-color: #f0f2f5;
      border-bottom: 1px solid $themeBorder1;
      background: -webkit-linear-gradient(top, #fff 0, $themeBg1 100%);
      background: -moz-linear-gradient(top, #fff 0, $themeBg1 100%);
      background: -o-linear-gradient(top, #fff 0, $themeBg1 100%);
      background: linear-gradient(to bottom, #fff 0, $themeBg1 100%);

      .viewControl {
        float: right;
        height: 100%;
        font-size: 14px;

        .fullToggle {
          padding: 0 6px;
          display: inline-block;
          background: transparent;
          border: 0;
          border-radius: 5px 5px 5px 5px;
          height: 26px;
          line-height: 26px;
          margin-top: 2px;
          cursor: pointer;

          &:hover {
            background: #fff;
          }
        }
      }
    }
  }
</style>
