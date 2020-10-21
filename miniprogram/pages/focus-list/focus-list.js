const cloud = require("../../utils/cloud.js")
Page({

  data: {
    focuslist: []

  },

  navToUserDetail(e){
    let {id} = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../userDetail/userDetail?id='+id,
    })
  },

  navToChat(e){
    let {index} = e.currentTarget.dataset
    let user = this.data.focuslist[index]
    wx.navigateTo({
      url: `../chat-page/chat-page?id=${user._id}&avatarUrl=${user.avatarUrl}&userName=${user.nickName}`,
    })
  },

  // 获取关注列表
  async getFocusList(){
    var res = await cloud.callFunction("user", {
      $url:"getFocusDetail"
    }, true)
    var list = []
    res.map(i=>{
      list.push(i.user[0])
    })
    this.setData({
      focuslist: list
    })
  },

  onLoad: function (options) {
    this.getFocusList()
  },
})