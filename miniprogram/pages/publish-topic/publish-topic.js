const utils = require("../../utils/utils")
Page({

  data: {
    topic: "",
    maxLength: 20,
  },

  // 检查重复
  checkRepeat(topic){
   return new Promise((resolve, rejects)=>{
    wx.cloud.callFunction({
      name: "topic",
      data:{
        $url: "checkRepeat",
        topic: topic
      },
      success:res=>{
        if(res.result.code == 0){
          wx.showToast({
            title: res.result.data,
            icon: 'none'
          })
          return
        }else{
          if(res.result.data){
            resolve(true)
          }else{
            resolve(false)
          }
        }
      },
    })
   })
  },

  // 发布
  async done(e){
    let topic = this.data.topic
    // 检查是否为空
    if(topic.length == 0){
      wx.showToast({
        title: '话题名不能为空',
        icon:"none"
      })
      return
    }
    wx.showLoading({
      title: '发布中',
    })
    if(await this.checkRepeat(topic)){
      wx.showModal({
        title: "提示",
        content: "话题已经存在了哦",
        confirmText: "查看",
        success:res=>{
          if(res.confirm){
            wx.navigateTo({
              url: '../topic-details/topic-details?name='+topic,
            })
          }
        }
      })
      return
    }
    if(!await utils.textSec(topic)){
      wx.showModal({
        showCancel: false,
        title: "警告",
        content: "内容包含敏感信息,请及时更正" 
      })
      return
    }
    let userInfo = e.detail.userInfo
    if(userInfo){
      this.publish(topic, userInfo)
    }else{
      wx.showModal({
        title: "提示",
        content: "未授权登录",
        showCancel: false
      })
    }
  },

  // 发布
  publish(topic, userInfo){
    wx.cloud.callFunction({
      name: "topic",
      data: {
        $url:"addTopic",
        topic: topic,
        userName: userInfo.nickName,
        userAvatar: userInfo.avatarUrl
      },
      success:res=>{
        if(res.result.code == 1){
          wx.navigateBack({
            complete: (res) => {
              wx.showToast({
                title: "发布成功",
              })
            },
          })
        }else{
          wx.showToast({
            title: res.result.data,
            icon: 'none'
          })
        }
      },
      fail:res=>{
        wx.showToast({
          title: '云函数调用失败',
          icon: "none"
        })
      }
    })
  },

  // 输入回调
  onInput(e){
    this.setData({
      topic: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})