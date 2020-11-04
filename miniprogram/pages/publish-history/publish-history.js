const cloud = require("../../utils/cloud.js")
var that = null
Page({

  data: {
    userId: null,
    tabList: [{
        name: '动态',
        icon: 'cuIcon-camera',
      },
      {
        name: '视频',
        icon: 'cuIcon-video',
      },
      {
        name: '壁纸',
        icon: 'cuIcon-pic',
      },
      {
        name: '约拍',
        icon: 'cuIcon-friendfill',
      },
    ],
    isLoading: false,
    curTab: 0,
    imageList: [],
    videoList: [],
    topicList: [],
    appointmentList: [],
    wallpaperList: []
  },

  getData() {
    var id = this.data.curTab
    switch (id) {
      case 0: {
        this.getImageList()
        break
      }
      case 1: {
        this.getVideoList()
        break
      }
      case 2: {
        this.getWallpaperList()
        break
      }
      case 3: {
        this.getAppointmentList()
        break
      }
    }
  },

  async getList(url, data) {
    this.setData({
      isLoading: true
    })
    var res = await cloud.callFunction(url, data)
    return res
  },

  async getImageList() {
    var list = that.data.imageList
    var res = await this.getList("image", {
      $url: "getMyImages",
      offset: list.length,
      id: that.data.userId
    })
    list = list.concat(res)
    this.setData({
      imageList: list,
      isLoading: false
    })
  },

  async getVideoList() {
    var list = that.data.videoList
    var res = await this.getList("video", {
      $url: "getMyVideos",
      offset: list.length,
      id: that.data.userId
    })
    list = list.concat(res)
    this.setData({
      videoList: list,
      isLoading: false
    })
  },

  async getAppointmentList() {
    var list = that.data.appointmentList
    var res =await this.getList("appointment", {
      $url: "getMyAppointments",
      offset: list.length,
      id: that.data.userId
    })
    list = list.concat(res)
    this.setData({
      appointmentList: list, 
      isLoading: false
    })

  },

  async getWallpaperList() {
    var list = that.data.wallpaperList
    var res = await this.getList("wallpaper", {
      $url: "getMyWallpapers",
      offset: list.length,
      id: that.data.userId
    })
    list = list.concat(res)
    this.setData({
      wallpaperList: list,
      isLoading: false
    })
  },

  selectTab(e) {
    var that = this
    let {
      id
    } = e.currentTarget.dataset
    this.setData({
      curTab: id
    })
    switch (id) {
      case 0: {
        if (that.isNeed(that.data.imageList)) {
          that.getImageList()
        }
        break;
      }
      case 1: {
        if (that.isNeed(that.data.videoList)) {
          that.getVideoList()
        }
        break;
      }
      case 2: {
        if (that.isNeed(that.data.wallpaperList)) {
          that.getWallpaperList()
        }
        break;
      }
      case 3: {
        if (that.isNeed(that.data.appointmentList)) {
          that.getAppointmentList()
        }
        break;
      }
      case 4: {
        if (that.isNeed(that.data.topicList)) {
          that.getTopicList()
        }
        break;
      }
    }
  },

  isNeed(list) {
    if (list && list.length == 0) {
      return true
    } else {
      return false
    }
  },

  // 删除
  onDelete(e){
    var {type, id, index} = e.currentTarget.dataset
    wx.showModal({
      cancelColor: 'gray',
      confirmColor: 'red',
      confirmText: "删除",
      cancelText: "取消",
      title: "确定要删除吗？",
      success: res=>{
        if(res.confirm){
          switch(type){
            case "image":{
              break
            }
            case "video":{
              break
            }
          }
        }
      }
    })
  },

  onLoad: function (options) {
    that = this
    let {id} = options
    console.log(options)
    // 读取缓存数据
    if(!id){
      wx.getStorage({
        key: 'userInfo',
        success: res => {
          that.setData({
            userId: res.data._id
          })
          this.getData()
        }
      })
    }else{
      this.setData({
        userId: id
      })
    }
  },

  onReachBottom(){
    this.getData()
  }
})