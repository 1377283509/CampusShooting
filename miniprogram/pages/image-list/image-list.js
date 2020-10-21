const cloud = require("../../utils/cloud.js")
const newField = "createDate"
const hotField = "viewCount"
Page({

  data: {
    curTab: 0,
    imageList: [],
    hotImageList: [],
    isLoading: false
  },

  selectTab(e){
    let {id} = e.currentTarget.dataset
    this.setData({
      curTab: id
    })
    if(id == 0 && this.data.imageList.length == 0){
      this.getNewData()
    }
    if(id == 1 && this.data.hotImageList.length == 0){
      this.getHotData()
    }
  },

  // 加载最新数据
  async getNewData(){
    this.setData({
      isLoading: true
    })
    var that = this
    var res = await cloud.callFunction("image", {
      $url: 'getImageList',
      offset: that.data.imageList.length,
      orderField: newField
    })
    console.log(res)
    var list = that.data.imageList
    list = list.concat(res)
    this.setData({
      imageList: list,
      isLoading:false
    })
  },

  // 加载热门数据
  async getHotData(){
    var that = this
    this.setData({
      isLoading: true
    })
    var res = await cloud.callFunction("image", {
      $url: 'getImageList',
      offset: that.data.hotImageList.length,
      orderField: hotField
    })
    console.log(res)
    var list = that.data.hotImageList
    list = list.concat(res)
    this.setData({
      hotImageList: list,
      isLoading: false
    })
  },

  onLoad: function (options) {
    if(this.data.curTab == 0){
      this.getNewData()
    }else{
      this.getHotData()
    }
  },

  onPullDownRefresh: function () {

  },
  
  onReachBottom: function () {
    if(this.data.curTab == 0){
      this.getNewData()
    }else{
      this.getHotData()
    }
  },


  onShareAppMessage: function () {

  }
})