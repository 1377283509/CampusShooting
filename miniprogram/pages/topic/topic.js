const cloud = require("../../utils/cloud.js")
Page({
  data: {
    topicList: [],
    searchRes: [],
    isLoading: false,
    showModal: false,
    searchValue: '',
  },

  hideModal(){
    this.setData({
      showModal: false,
      searchRes: [],
      searchValue: ''
    })
  },  

  async onSearch(){
    this.setData({
      isLoading:true,
      showModal: true
    })
    var value = this.data.searchValue
    var res = await cloud.callFunction("topic", {
      $url: 'search',
      name: value
    })
    console.log(res)
    this.setData({
      searchRes: res,
      isLoading:false
    })
  },


  onInput(e){
    this.setData({
      searchValue: e.detail.value
    })
  },

  async getTopicList(){
    const res = await cloud.callFunction("topic", {
      $url: 'getTopicList'
    }, true)
    this.setData({
      topicList: res
    })
  },



  onLoad: function (options) {
    this.getTopicList()
  },
})