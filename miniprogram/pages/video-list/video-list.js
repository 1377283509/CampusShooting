const cloud = require("../../utils/cloud.js")
Page({

  data: {
    offset: 0,
    hotOffset: 0,
    videoList: [],
    curTab: 0,
    isLoading: false,
    hotVideoList: []
  },

  selectTab(e) {
    let {
      id
    } = e.currentTarget.dataset
    this.setData({
      curTab: id
    })
    if (id == 0 && this.data.videoList.length == 0) {
      this.getVideoList()
    }
    if (id == 1 && this.data.hotVideoList.length == 0) {
      this.getVideoList()
    }
  },

  async getVideoList() {
    this.setData({
      isLoading: true
    })
    var ishot = this.data.curTab == 1
    var offset = ishot ? this.data.hotOffset : this.data.offset
    var res = await cloud.callFunction("video", {
      $url: "getVideos",
      orderField: ishot ? "viewCount" : "createTime",
      fields: {
        cover: true,
        title: true,
        topic: true,
        university: true,
        likeCount: true,
        viewCount: true,
        createTime: true
      },
      limit: 10,
      offset: offset
    }, false)
    var list = ishot ? this.data.hotVideoList : this.data.videoList
    list = list.concat(res)
    if (ishot) {
      this.setData({
        hotVideoList: list,
        hotOffset: offset + res.length,
        isLoading: false
      })
    } else {
      this.setData({
        videoList: list,
        offset: offset + res.length,
        isLoading: false
      })
    }
  },

  onLoad: function (options) {
    this.getVideoList()
  },


  onReachBottom: function () {
    this.getVideoList()
  },

})