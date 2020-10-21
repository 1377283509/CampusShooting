const app = getApp()
const cloud = require("../../utils/cloud.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusBar: app.globalData.StatusBar,
    userInfo: undefined,
    focuslist: [],
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
    pubList: [{
        name: "照片",
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
      {
        name: "我发布的",
        url: "../publish-history/publish-history",
        icon: "cuIcon-time",
        color: "bg-gray"
      },
    ]
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

  navToFocusList() {
    wx.navigateTo({
      url: '../focus-list/focus-list',
    })
  },

  navToUserDetail(e) {
    let {
      id
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: "../userDetail/userDetail?id=" + id,
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

  onLoad: function (options) {
    this.getFocusList()
    this.getLikeCount()
  },

  onShow: function () {
    wx.getStorage({
      key: 'userInfo',
      success: user => {
        this.setData({
          userInfo: user.data
        })
      }
    })
  },
  onPullDownRefresh: function () {}
})