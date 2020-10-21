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

    // 轮播图列表
    swiperList:[
      {
        coverImage:"https://ns-strategy.cdn.bcebos.com/ns-strategy/upload/fc_big_pic/part-00132-3823.jpg",
        url:"",
      },
      {
        coverImage:"https://ns-strategy.cdn.bcebos.com/ns-strategy/upload/fc_big_pic/part-00483-3283.jpg",
        url:"",
      },
      {
        coverImage:"https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=276711261,3145669979&fm=26&gp=0.jpg",
        url:"",
      },
    ]
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
  onHide(){
    clearTimeout(timeOut)
  }
})
