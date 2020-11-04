const app = getApp()
const db = wx.cloud.database()
const cloud = require("../../utils/cloud.js")
var timeOut = null
Page({
  data: {
    // 宣传片
    promotionalVideos:[],

    // 话题
    topicList:[],

    // 热门学校
    schoolList:[],

    // 热门视频
    hotVideos: [],

    // 精选壁纸
    wallpapers: [],

    // 美拍列表
    imageList: [],
    
    // 技巧列表
    skillList: [],

    showPublish: false,

    // 轮播图列表
    swiperList:[
    ],
    pubList: [{
      name: "动态",
      url: "../publish-image/publish-image",
      color: "bg-green",
      icon: "cuIcon-camera"
    },
    {
      name: "视频",
      url: "../publish-video/publish-video",
      color: "bg-purple",
      icon: "cuIcon-video"
    },
    {
      name: "约拍",
      url: "../publish-appointment/publish-appointment",
      color: "bg-blue",
      icon: "cuIcon-group"
    },
    {
      name: "壁纸",
      url: "../publish-wallpaper/publish-wallpaper",
      color: "bg-red",
      icon: "cuIcon-pic"
    },
    {
      name: "话题",
      url: "../publish-topic/publish-topic",
      icon: "cuIcon-magic",
      color: "bg-orange"
    },
  ]
  },

  showModal(){
    this.setData({
      showPublish: true
    })
  },

  hideModal(){
    this.setData({
      showPublish: false
    })
  },

  onTapSearch(){
    wx.navigateTo({
      url: '../search-result/search-result',
    })
  },

  // 点击学校回调
  onSelectSchool(e){
    let {name} = e.currentTarget.dataset
    var app = getApp()
    app.globalData.university = name
    wx.switchTab({
      url: '../university/university',
    })
  },

  // 获取热门话题
  async getTopicList(){
    var res = await cloud.callFunction("topic", {
      $url: 'getTopicList'
    }, false)
    this.setData({
      topicList: res
    })
  },

  // 根据url导航到指定页面
  navToPage(e){
    var {url} = e.currentTarget.dataset
    wx.navigateTo({
      url: url,
    })
  },

  // 跳转视频详情页
  navToVideoDetail(e){
    wx.navigateTo({
      url: '../video-details/video-details?id='+e.currentTarget.dataset.id,
    })
  },

  // 获取热门学校
  async getHotSchool(){
    var res = await cloud.callFunction("hot-school", {
      $url: "getList"
    })
    this.setData({
      schoolList: res
    })
  },

  // 获取宣传片
  async getPromotionalVideos(){
    var res = await cloud.callFunction("video", {
      $url: "getVideos",
      condition: {
        topic: "宣传片",
        status: 1
      },
      fields: {
        _id: true,
        university: true,
        cover: true
      },
      limit: 8,
    })
    this.setData({
      promotionalVideos: res
    })
  },

  // 获取美拍列表
  async getImageList(){
    var res = await cloud.callFunction("image", {
      $url: "getSimpleImage"
    })
    this.setData({
      imageList: res
    })
  },

  // 获取热门视频
  async getHotVideos(){
    var res = await cloud.callFunction("video", {
      $url: "getVideos",
      condition: {
        status: 1
      },
      fields: {
        _id: true,
        cover: true,
        university: true,
        topic:true,
        viewCount: true,
      },
      limit: 8,
      orderField: "viewCount"
    })
    this.setData({
      hotVideos: res,
    })
  },

  // 获取最新技巧
  async getSkillList(){
    var res = await cloud.callFunction("skills",{
      $url: "getSkillList"
    })
    this.setData({
      skillList: res
    })
  },

  // 获取壁纸
  async getWallpapers(){
    var res = await cloud.callFunction("wallpaper", {
      $url: "getList",
      orderField: "createTime"
    })
    this.setData({
      wallpapers: res
    })
  },

  // 导航到话题详情
  navToTopicDetail(e){
    let {id} = e.currentTarget.dataset
    wx.navigateTo({
      url: '/pages/topic-details/topic-details?id='+id,
    })
  },

  // 获取轮播列表
  async getSwiperList(){
    var res = await cloud.callFunction("swiper", {
      $url: "getList"
    })
    this.setData({
      swiperList: res
    })
  },

  // 导航到话题详情页
  navToTopicList(){
    wx.navigateTo({
      url: '/pages/topic/topic',
    })
  },
 
  onLoad: function () {
    this.getSwiperList()
    this.getImageList()
    this.getTopicList()
    this.getHotVideos()
    var that = this
    timeOut = setTimeout(()=>{
      that.getSkillList()
      that.getPromotionalVideos()
      that.getWallpapers()
      that.getHotSchool()
    }, 2000)
  },
  onUnload(){
    clearTimeout(timeOut)
  }
})
