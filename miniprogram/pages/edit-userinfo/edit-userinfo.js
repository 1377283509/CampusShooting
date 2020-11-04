const utils = require("../../utils/utils")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    id:undefined,
    university:undefined,
    introduction:undefined,
  },

  // 更新缓存
  updateStorge(){
    wx.getStorage({
      key: 'userInfo',
      success:res=>{
        let userInfo = res.data;
        userInfo.university = this.data.university;
        userInfo.introduction = this.data.introduction;
        wx.setStorage({
          data: userInfo,
          key: 'userInfo',
        })
      },
      fail:res=>{
        console.log(res)
      }
    })
  },

  // 保存回调
  async onSave(){
    var introduction = this.data.introduction
    var university = this.data.university
    // 数据库更新成功后，更新缓存
    if(!await utils.textSec(introduction)){
      wx.showModal({
        title: "提示",
        content: "个人介绍包含敏感信息，请重新编辑",
        showCancel: false
      })
      return
    }
    if(await this.upDateDataBase()){
      var pages = getCurrentPages()
      var prePage = pages[pages.length-2]
      this.updateStorge()
      prePage.setData({
        userInfo: {
          university: university,
          introduction: introduction
        }
      })
      wx.navigateBack({
        complete: (res) => {},
      })
    }else{
      wx.showToast({
        title: '保存失败',
      })
    }    
  },

  async upDateDataBase(){
    wx.showLoading({
      title: '正在保存',
    })
    var that = this
    return new Promise((resolve, reject)=>{
      wx.cloud.callFunction({
        name: "user",
        data: {
          $url: "editInfo",
          university: that.data.university,
          introduction: that.data.introduction
        },
        success: res=>{
          console.log(res)
          if(res.result.code == 1){
            resolve(true)
          }else{
            resolve(false)
          }
        },
        fail:res=>{
          wx.showToast({
            title: '云函数调用失败',
          })
          resolve(false)
        }
      })
    })
  },

  // 输入介绍回调
  onInput(e){
    let data = e.detail.value;
    this.setData({
      introduction:data
    })
  },

  // 选择学校回调
  onSelectSchool(){
    wx.navigateTo({
      url: '../university-list/university',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getStorage({
      key: 'userInfo',
      success:res=>{
        this.setData({
          id:res.data._id,
          university:res.data.university,
          introduction:res.data.introduction
        })
      }
    })
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
    wx.getStorage({
      key: 'university',
      success:res=>{
        this.setData({
          university:res.data
        });
        wx.removeStorage({
          key: 'university',
        })
      }
    })
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