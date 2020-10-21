const cloud = require("../../utils/cloud.js")
Page({

  data: {
    curTheme: null,
    themeList: [],
    searchValue: "",
    showModal: false,
    isLoading: false,
    searchRes: []
  },

  onInput(e) {
    var value = e.detail.value
    this.setData({
      searchValue: value,
      searchRes: [],
      showModal: false
    })
  },

  // 获取主题列表
  async getThemeList() {
    var that = this
    var res = await cloud.callFunction("theme", {
      $url: 'getThemeList'
    })
    var list = res
    var curTheme = list[0]
    list.splice(0, 1)
    that.setData({
      curTheme: curTheme,
      themeList: list
    })
  },

  hideModal(){
    this.setData({
      searchRes: [],
      showModal: false,
      searchValue: ""
    })
  },

  async onSearch(){
    this.setData({
      showModal: true,
      isLoading: true
    })
    var searchValue = this.data.searchValue
    var res = await cloud.callFunction("theme", {
      $url: "search",
      name: searchValue
    })
    this.setData({
      searchRes: res,
      isLoading: false,
    })
  },

  onLoad: function (options) {
    this.getThemeList()
  },
})