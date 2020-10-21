const cloud = require("../../utils/cloud.js")
Page({
  data: {
    id: null,
    type: null,
    offset: 0,
    list: [],
    isLoading: false
  },

  // 获取图片列表
  async getImageList(){
    var {id, offset} = this.data
    var res = await cloud.callFunction("image", {
      $url: "getListByTheme",
      id: id,
      offset: offset
    })
    var list = this.data.list
    offset = offset + res.length
    list = list.concat(res)
    this.setData({
      list: list,
      offset: offset,
      isLoading:false
    })
  },

  // 获取视频列表
  async getVideoList(){
    var {id, offset} = this.data
    var res = await cloud.callFunction("video", {
      $url: "getListByTheme",
      id: id,
      offset: offset
    })
    var list = this.data.list
    offset = offset + res.length
    list = list.concat(res)
    this.setData({
      list: list,
      offset: offset,
      isLoading:false
    })
  },

  getData(){
    var {type} = this.data
    this.setData({
      isLoading: true
    })
    if(type == 'image'){
      this.getImageList()
    }else{
      this.getVideoList()
    }
  },

  onLoad: function (options) {
    var {id, type} = options
    this.setData({
      id: id,
      type: type
    })
    this.getData()
  },

  onReachBottom(){
    this.getData()
  }
})