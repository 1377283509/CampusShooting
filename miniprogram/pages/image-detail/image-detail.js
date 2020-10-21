const cloud = require("../../utils/cloud.js")
Page({
  data: {
    image: null,
    user: null,
    hasFocus: false,
    isLike: false,
    commentList: [],
    keyboardHeight: 0
  },

  navBack(){
    wx.navigateBack({
      complete: (res) => {},
    })
  },

  // 喜欢点击回调
  async changeLikeStatus(e){
    let isLike = this.data.isLike
    this.setData({
      isLike: !isLike
    })
    // 同步云端
    await cloud.callFunction("image", {
      $url: isLike ? "removeLike" : "addLike",
        id: this.data.image._id
    })
  },

  previewImage(e){
    wx.previewImage({
      urls: this.data.image.images,
    })
  },

  async getImageById(id){
    var that = this
    wx.showLoading({
      title: "加载中"
    })
    var res = await cloud.callFunction("image", {
      $url: 'getImageById',
      id: id
    })
    this.setData({
      image: res.image,
      user: res.user,
      isLike: res.isLike,
      hasFocus: res.hasFocus
    })
  },

  onLoad: function (options) {
    let {id} = options
    this.getImageById(id)
    wx.onKeyboardHeightChange((result) => {
        this.setData({
          keyboardHeight: result.height
        })
    })
  },
})