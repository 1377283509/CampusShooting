const cloud = require("../../utils/cloud.js")
var university = null
Page({

  data: {
    university: null,
    tabList: [{
        name: '动态',
        icon: "cuIcon-camerafill",
      },
      {
        name: '视频',
        icon: "cuIcon-videofill",
      },
      {
        name: '约拍',
        icon: "cuIcon-friendfill",
      },
      {
        name: '壁纸',
        icon: "cuIcon-picfill",
      },
    ],
    curTab: 2,
    isLoading: false,
    imageList: [],
    videoList: [],
    appointmentList: [],
    wallpaperList: []
  },

  navToWallpaperDetail(e){
    let {id} = e.currentTarget.dataset
    wx.navigateTo({
      url: '../wallpaper-detail/wallpaper-detail?id='+id,
    })
  },

  // 切换tab
  selectTab(e) {
    let {
      id
    } = e.currentTarget.dataset
    var that = this
    switch(id){
      case 0: {
        if(that.data.imageList.length == 0){
          this.getImageList()
        }
        break
      }
      case 1: {
        if(that.data.videoList.length == 0){
          this.getVideoList()
        }
        break
      }
      case 2: {
        if(that.data.appointmentList.length == 0){
          this.getAppointmentList()
        }
        break
      }
      case 3: {
        if(that.data.wallpaperList.length == 0){
          this.getWallpaperList()
        }
        break
      }
    }
    this.setData({
      curTab: id
    })
  },

  selectSchool(){
    university = this.data.university
    wx.navigateTo({
      url: '../university-list/university',
    })
  },

  // 获取当前大学
 getStorage() {
    return new Promise((resolve, reject)=>{
      wx.getStorage({
        key: 'university',
        success: res=>{
          resolve(res.data)
        },
      })
    })
  },

  // 加载动态数据
  async getImageList(){
    var imageList = this.data.imageList
    var university = this.data.university
    this.setData({
      isLoading: true
    })
    var res = await cloud.callFunction("image", {
      $url: "getImageList",
      offset: imageList.length,
      condition: {
        status: true,
        university: university
      }
    })
    imageList = imageList.concat(res)
    this.setData({
      imageList: imageList,
      isLoading: false
    })
  },

  // 加载视频数据
  async getVideoList(){
    var videoList = this.data.videoList
    var university = this.data.university
    this.setData({
      isLoading: true
    })
    var res = await cloud.callFunction("video", {
      $url: "getVideos",
      offset: videoList.length,
      fields: {
        _id: true,
        cover: true,
        university: true,
        topic:true,
        viewCount: true,
        likeCount: true,
        createTime:true
      },
      condition: {
        status: 1,
        university: university
      }
    })
    videoList = videoList.concat(res)
    this.setData({
      videoList: videoList,
      isLoading: false
    })
  },

  // 加载约拍数据
  async getAppointmentList(){
    this.setData({
      isLoading: true
    })
    var university = this.data.university
    var appointmentList = this.data.appointmentList
    var res = await cloud.callFunction("appointment", {
      $url: 'getAppointments',
      university: university,
      offset: appointmentList.length
    })
    appointmentList = appointmentList.concat(res)
    this.setData({
      appointmentList: appointmentList,
      isLoading:false
    })
  },

  // 加载壁纸数据
  async getWallpaperList(){
    this.setData({
      isLoading: true
    })
    var university = this.data.university
    var wallpaperList = this.data.wallpaperList
    var res = await cloud.callFunction("wallpaper", {
      $url: "getList",
      offset: wallpaperList.length,
      orderField: "createTime",
      condition: {
        university: university
      }
    })
    console.log(res)
    wallpaperList = wallpaperList.concat(res)
    this.setData({
      wallpaperList: wallpaperList,
      isLoading: false
    })
  },

  // 加载数据
  getData() {
    var that = this
    var tab = that.data.curTab
    switch (tab) {
      case 0: {
        that.getImageList()
        break
      }
      case 1: {
        that.getVideoList()
        break
      }
      case 2: {
        that.getAppointmentList()
        break
      }
      case 3: {
        that.getWallpaperList()
        break
      }
    }
  },

  onLoad: async function (options) {
    var app = getApp()
    university = app.globalData.university
    if (! university) {
      university = await this.getStorage()
    } 
    this.setData({
      university: university
    })
    this.getData()
  },

  onShow(){
    if(this.data.university != university){
      this.setData({
        imageList: [],
        videoList: [],
        appointmentList: [],
        wallpaperList: []
      })
      this.getData()
    }
  },

  onHide: function () {
    wx.setStorage({
      data: this.data.university,
      key: 'university',
    })
  },

  onReachBottom: function () {
    this.getData()
  },

  onShareAppMessage: function () {
  }
})