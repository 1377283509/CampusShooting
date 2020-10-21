const cloud = require("../../utils/cloud.js")

Page({

  data: {
    content: null,
    university: null
  },

  // 选择学校回调
  onSelectSchool() {
    wx.navigateTo({
      url: '../university-list/university',
    })
  },

  // 发布
  async done(e) {
    let {
      content,
      university
    } = this.data
    // 检查内容是否为空
    if (content.length == 0) {
      wx.showToast({
        title: '内容不能为空',
        icon: "none"
      })
      return
    }
    // 检测是否选择了学校
    if (university == null) {
      wx.showToast({
        title: '请选择一个学校',
        icon: "none"
      })
      return
    }
    wx.showLoading({
      title: '发布中',
    })
    let userInfo = e.detail.userInfo
    if (userInfo) {
      this.publish(content, university)
    } else {
      wx.showModal({
        title: "提示",
        content: "未授权登录",
        showCancel: false
      })
    }
  },

  // 发布
  async publish(content, university) {
    var res = await cloud.callFunction("appointment", {
      $url: "addAppointment",
      content: content,
      university: university
    })
    wx.navigateBack({
      complete: (res) => {
        wx.showToast({
          title: "发布成功",
          icon: 'success'
        })
      },
    })
  },

  // 输入回调
  onInput(e) {
    this.setData({
      content: e.detail.value
    })
  },

  // 加载学校
  getSchool() {
    wx.getStorage({
      key: 'userInfo',
      success: res => {
        this.setData({
          university: res.data.university
        })
      }
    })
  },

  onLoad: function (options) {
    this.getSchool()
  },
})