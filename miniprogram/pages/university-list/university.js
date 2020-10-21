const db = wx.cloud.database()
const collection = db.collection("university")
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[]
  },

  onTap(e){
    let name = e.currentTarget.dataset.name;
    let pages = getCurrentPages();
    let prePage = pages[pages.length-2]
    prePage.setData({
      university:name
    })
    wx.navigateBack({
    })
  },

  onInput(e){
    let data = e.detail.value;
    this.search(data)
  },

  async search(keyword){
    collection.where({
      name:db.RegExp({
        regexp:`^${keyword}`,
      })
    }).field({
      name:true
    }).get().then(res=>{
      this.setData({
        list:res.data
      })
    }).catch(res=>{
      wx.showToast({
        title: '数据库异常',
        icon:"none"
      })
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