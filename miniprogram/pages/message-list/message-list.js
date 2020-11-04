var that = null
const cloud = require("../../utils/cloud.js")
const db = wx.cloud.database()
const collection = db.collection("message")
Page({
  data: {
    myId: null,
    chatList: [],
    historyList: [],
    curTab: 0,
  },

  selectTab(e) {
    let {
      id
    } = e.currentTarget.dataset
    if (id == 0 && that.data.chatList.length == 0) {
      this.getChatList()
    }
    if (id ==1 && that.data.historyList.length == 0) {
      this.getHisrory()
    }
    that.setData({
      curTab: id
    })
  },
  // 获取消息列表
  async getChatList() {
    var res = await cloud.callFunction("message", {
      $url: 'getChatList',
      myId: that.data.myId
    })
    this.setData({
      chatList: res
    })
    wx.stopPullDownRefresh({
      success: (res) => {},
    })
  },

  // 获取历史
  async getHisrory() {
    var res = await cloud.callFunction("message", {
      $url: 'getHistory',
      myId: that.data.myId
    })

    this.setData({
      historyList: res
    })
  },

  // 导航去聊天界面
  navToChatPage(e) {
    let {
      user,
      id
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: `../chat-page/chat-page?id=${id}&userName=${user.nickName}&avatarUrl=${user.avatarUrl}`,
    })
  },

  // 删除回调
  delete(e) {
    wx.showModal({
      title: "提示",
      content: "删除后，将清空该聊天记录",
      success: res => {
        // 删除
        if (res.confirm) {
          // 获取用户id
          var {
            id
          } = e.currentTarget.dataset
          // 删除本地记录
          var list = that.data.chatList
          var delId = null;
          for (let i = 0; i < list.length; i++) {
            if (list[i]._id == id) {
              delId = i
              break
            }
          }
          list.splice(delId, 1)
          // 更改与用户消息的所有状态
          that.updateStatus(id)
        }
      }
    })
  },

  // 更新状态回调
  update(e) {
    var {
      id
    } = e.currentTarget.dataset
    that.updateStatus(id)
  },

  // 调用云函数更新状态
  async updateStatus(id) {
    var res = await cloud.callFunction("message", {
      $url: "updateStatus",
      userId: id,
      myId: that.data.myId,
    })
    for (let i = 0; i < list.length; i++) {
      if (list[i]._id == id) {
        list[i].msgNums = 0
        break
      }
    }
    that.setData({
      chatList: list
    })
  },

  // ListTouch触摸开始
  ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  // ListTouch计算方向
  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  // ListTouch计算滚动
  ListTouchEnd(e) {
    if (this.data.ListTouchDirection == 'left') {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
  },

  onLoad: function (options) {
    that = this
    // 获取用户Id
    wx.getStorage({
      key: 'userInfo',
      success: res => {
        that.setData({
          myId: res.data._id
        })
        this.getChatList()
        this.getHisrory()
      }
    })
  },

  onShow(){ 
    this.getChatList()
  },

  // 刷新回调
  onPullDownRefresh: function () {
    this.getChatList()
    this.getHisrory()
  },

  onHide(){
    wx.setStorage({
      data: that.data.historyList,
      key: 'history',
    })
  }
})