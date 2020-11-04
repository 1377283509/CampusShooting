const app = getApp()
const cloud = require("../../utils/cloud.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: undefined,
    focuslist: [],
    medals: [],
    likeCount: [{
        icon: "cuIcon-camerafill",
        color: "text-green",
        name: "动态",
        nums: ""
      },
      {
        icon: "cuIcon-videofill",
        color: "text-purple",
        name: "视频",
        nums: ""
      },
      {
        icon: "cuIcon-friendfill",
        color: "text-blue",
        name: "约拍",
        nums: ""
      },
      {
        icon: "cuIcon-picfill",
        color: "text-red",
        name: "壁纸",
        nums: ""
      },
    ],

    publishCount: [
      {
        icon: "cuIcon-camerafill",
        color: "text-green",
        name: "动态",
        nums: 0
      },
      {
        icon: "cuIcon-videofill",
        color: "text-purple",
        name: "视频",
        nums: 0
      },
      {
        icon: "cuIcon-friendfill",
        color: "text-blue",
        name: "约拍",
        nums: 0
      },
      {
        icon: "cuIcon-picfill",
        color: "text-red",
        name: "壁纸",
        nums: 0
      },
    ]

  },

  // 导航去发布页
  navToPublishHistory(){
    var id = this.data.userInfo._id
    wx.navigateTo({
      url: '../publish-history/publish-history?id' + id,
    })
  },

  // 导航去喜欢页
  navToLikePage(e) {
    var {
      index
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: '../like-page/like-page?index=' + index,
    })
  },

  // 编辑信息
  editUserInfo(e) {
    wx.navigateTo({
      url: '../edit-userinfo/edit-userinfo'
    })
  },

  // 获取用户信息
  getUserInfo(e) {
    wx.showLoading({
      title: "登录中"
    })
    var {
      userInfo
    } = e.detail;
    var nickName = userInfo.nickName;
    var avatarUrl = userInfo.avatarUrl;
    var gender = userInfo.gender == 1 ? "男" : "女";
    wx.cloud.callFunction({
      name: "user",
      data: {
        $url: "register",
        nickName: nickName,
        avatarUrl: avatarUrl,
        gender: gender
      },
      success: res => {
        if (res.result.code == 1) {
          this.setData({
            userInfo: res.result.data
          })
          wx.setStorage({
            data: res.result.data,
            key: "userInfo",
          })
        } else {
          wx.showToast({
            title: res.result.data,
            icon: 'none'
          })
        }
        wx.hideLoading({
          complete: (res) => {},
        })
      }
    })
  },

  // 导航到关注页
  navToFocusList() {
    wx.navigateTo({
      url: '../focus-list/focus-list',
    })
  },

  // 获取关注用户
  async getFocusList() {
    var res = await cloud.callFunction("user", {
      $url: "getFocusList"
    })
    var list = []
    res.map(i => {
      list.push(i.user[0])
    })
    this.setData({
      focuslist: list
    })
  },

  // 获取喜欢统计
  async getLikeCount() {
    var that = this
    var count = await cloud.callFunction("user", {
      $url: 'getLikeCount'
    })
    var likeCount = that.data.likeCount
    likeCount[2].nums = count.appointmentCount,
      likeCount[0].nums = count.imageCount,
      likeCount[1].nums = count.videoCount,
      likeCount[3].nums = count.wallpaperCount,
      that.setData({
        likeCount: likeCount
      })
  },

  // 获取勋章
  async getMedals(id){
    var res = await cloud.callFunction("medal", {
      $url: "getMedals",
      id: id
    })
    this.setData({
      medals: res
    })
  },

  onLoad: function (options) {
    var publishCount = this.data.publishCount
    wx.getStorage({
      key: 'userInfo',
      success: user => {
        publishCount[0].nums = user.data.imageCount
        publishCount[1].nums = user.data.videoCount
        publishCount[2].nums = user.data.appointmentCount
        publishCount[3].nums = user.data.wallpaperCount
        this.getMedals(user.data._id)
        this.setData({
          userInfo: user.data,
          publishCount: publishCount
        })
      }
    })
    this.getFocusList()
    this.getLikeCount()
  },

  onShow: function () {
    
  },
  onPullDownRefresh: function () {}
})