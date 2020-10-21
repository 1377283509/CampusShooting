const cloud = require("../../utils/cloud.js")
Page({
  data: {
    newList: [],
    curTab: 0,
    hotList: [],
    downList: []
  },

  selectTab(e){
    var {id} = e.currentTarget.dataset
    if(id == 0 && this.data.newList.length == 0){
      this.getNewList()
    }
    if(id == 1 && this.data.hotList.length == 0){
      this.getHotList()
    }
    if(id == 2 && this.data.downList.length == 0){
      this.getDownList()
    }
    this.setData({
      curTab: id
    })
  },

  navToDetail(e){
    var {id} = e.currentTarget.dataset
    wx.navigateTo({
      url: '/pages/wallpaper-detail/wallpaper-detail?id='+id,
    })
  },

  async getList(orderField, offset){
    const res = await cloud.callFunction("wallpaper", {
      $url: 'getList',
      orderField: orderField,
      offset: offset
    }, true)
    return res
  },

  async getDownList(){
    var offset = this.data.downList.length
    var res = await this.getList("downloadCount",offset)
    var list = this.data.downList
    list = list.concat(res)
    this.setData({
      downList: list
    })
  },

  async getNewList(){
    var offset = this.data.newList.length
    var res = await this.getList("createTime",offset)
    var list = this.data.newList
    list = list.concat(res)
    this.setData({
      newList: list
    })
  },

  async getHotList(){
    var offset = this.data.hotList.length
    var res = await this.getList("likeCount",offset)
    var list = this.data.hotList
    list = list.concat(res)
    this.setData({
      hotList: list
    })
  },

  onLoad: function (options) {
    this.getNewList()
  },

  onReachBottom(){
    var id = this.data.curTab
    if(id == 0){
      this.getNewList()
    }
    if(id == 1){
      this.getHotList()
    }
    if(id == 2){
      this.getDownList()
    }
  }

})