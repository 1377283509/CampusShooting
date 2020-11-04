const cloud = require("../../utils/cloud.js")
Page({

  data: {
    userInfo: null,
    medals: [],
    hasFocus: false
  },

  navToChat(){
    let user = this.data.userInfo
    wx.navigateTo({
      url: `../chat-page/chat-page?id=${user._id}&avatarUrl=${user.avatarUrl}&userName=${user.nickName}`,
    })
  },

  // 加载用户信息
  async getUserInfo(id){
    var res = await cloud.callFunction("user", {
      $url: "getUserInfo",
      id: id
    },true)
    this.setData({
      userInfo:res[0]
    })
  },

  // 加载勋章信息
  async getMedals(id){
    var res = await cloud.callFunction("medal", {
      $url: "getMedals",
      id: id
    })
    this.setData({
      medals: res
    })
  },

  // 导航到作品页
  navToProductList(e){
    var id = this.data.userInfo._id
    console.log(id)
    wx.navigateTo({
      url: '../product-list/product-list?id=' + id,
    })
  },

  // 判断是否关注
  async getFocus(id){
    var res = await cloud.callFunction("user", {
      $url: "isFocus",
      id: id
    })
    this.setData({
      hasFocus: res
    })
  },

  // 点击关注
  async onTapButton(e){
    var id = this.data.userInfo._id
    var hasFocus = this.data.hasFocus
    var res = await cloud.callFunction("user", {
      $url: hasFocus?"removeFocus":"addFocus",
      id: id
    })
    this.setData({
      hasFocus: !hasFocus
    })
    wx.showToast({
      title: res,
      icon: 'none'
    })
  },

  onLoad: function (options) {
    let id = options.id
    this.getUserInfo(id)
    this.getMedals(id)
    this.getFocus(id)
  },

  onShareAppMessage: function () {

  }
})