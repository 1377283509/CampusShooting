const cloud = require("../../utils/cloud.js")
Page({

  data: {
    skillList: [],
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
    var res = await cloud.callFunction("skills", {
      $url: "search",
      title: searchValue
    })
    this.setData({
      searchRes: res,
      isLoading: false,
    })
  },

  async getData(){
    var res = await cloud.callFunction("skills", {
      $url: "getSkillList",
    }, true)
    this.setData({
      skillList: res
    })
  },


  onLoad: function (options) {
    this.getData()
  },

})