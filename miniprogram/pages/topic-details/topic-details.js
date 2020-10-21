const cloud = require("../../utils/cloud.js")
Page({


  data: {
    id: null,
    topic: null,
    user: null,
    curTab: 0,
    imageList: [],
    videoList: [],
    isLoading: false
  },

  navToUserDetail(e){
    var id = this.data.user._id
    wx.navigateTo({
      url: '../userDetail/userDetail?id='+id,
    })
  },

  // 获取topic详情
  async getTopicById() {
    var id = this.data.id
    var res = await cloud.callFunction("topic", {
      $url: "getTopicById",
      id: id
    }, true)
    console.log(res)
    this.setData({
      topic: {
        name: res[0].name,
        createTime: res[0].createTime,
        _id: res[0]._id
      },
      user: res[0].user[0]
    })
    this.getImageList()
  },

  selectTab(e){
    var {id} = e.currentTarget.dataset
    if(id == 0 && this.data.imageList.length == 0){
      this.getImageList()
    }
    if(id == 1 && this.data.videoList.length == 0){
      this.getVideoList()
    }
    this.setData({
      curTab: id
    })
  },
  
  // 获取动态资源
  async getImageList(){
    this.setData({
      isLoading: true
    })
    var name = this.data.topic.name
    var offset = this.data.imageList.length
    var res = await cloud.callFunction("image", {
      $url: 'getImageListByTopic',
      name: name,
      offset: offset
    })
    var list = this.data.imageList
    list = list.concat(res)
    this.setData({
      imageList: list,
      isLoading: false
    })
  },

  // 获取视频资源
  async getVideoList(){
    this.setData({
      isLoading: true
    })
    var name = this.data.topic.name
    var offset = this.data.videoList.length
    var res = await cloud.callFunction("video", {
      $url: 'getVideoListByTopic',
      name: name,
      offset: offset
    })
    var list = this.data.videoList
    list = list.concat(res)
    this.setData({
      videoList: list,
      isLoading: false
    })
  },

  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    this.getTopicById()
  },

  onReachBottom(){
    if(this.data.curTab == 0){
      this.getImageList()
    }else{
      this.getVideoList()
    }
  }
})