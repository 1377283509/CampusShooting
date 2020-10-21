var that = null
const cloud = require("../../utils/cloud.js")
Page({

  data: {
    curTab: 0,
    tabList: [
      {
        name: "动态",
        icon: "cuIcon-camerafill"
      },
      {
        name: "视频",
        icon: "cuIcon-videofill"
      },
      {
        name:  "约拍",
        icon: "cuIcon-friendfill"
      },
      {
        name: "壁纸",
        icon: "cuIcon-picfill"
      },
    ],
    imageList: [],
    videoList: [],
    appointmentList: [],
    wallpaperList: [],
    skillList: []
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
      $url: "getLikeImages",
      offset: list.length,
    })
    list = list.concat(res)
    console.log(res)
    this.setData({
      imageList: list,
      isLoading: false
    })
  },

  async getVideoList() {
    var list = that.data.videoList
    var res = await this.getList("video", {
      $url: "getLikeVideos",
      offset: list.length,
    })
    list = list.concat(res)
    console.log(res)
    this.setData({
      videoList: list,
      isLoading: false
    })
  },

  async getAppointmentList() {
    var list = that.data.appointmentList
    var res =await this.getList("appointment", {
      $url: "getLikeAppointments",
      offset: list.length,
    })
    list = list.concat(res)
    console.log(res)
    this.setData({
      appointmentList: list, 
      isLoading: false
    })

  },

  async getWallpaperList() {
    var list = that.data.wallpaperList
    var res = await this.getList("wallpaper", {
      $url: "getLikeWallpapers",
      offset: list.length,
    })
    list = list.concat(res)
    console.log(res)
    this.setData({
      wallpaperList: list,
      isLoading: false
    })
  },

  selectTab(e) {
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

  onLoad: function (options) {
    that = this
    that.setData({
      curIndex: Number.parseInt(options.index)
    })
    this.getData()
  },

  onReachBottom(){
    this.getData()
  }
})