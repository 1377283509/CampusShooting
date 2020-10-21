const cloud = require("../../utils/cloud.js")
Page({

  data: {
    searchValue: null,
     topicList: [],
     wallpaperList: [],
     imageList: [],
     videoList: [],
     themeList: [],
     skillList: [],
     tabList: [
      {
        name: '动态',
        icon: 'cuIcon-camera',
      },
      {
        name: '视频',
        icon: 'cuIcon-video',
      },
      {
        name: '视频',
        icon: 'cuIcon-video',
      },
      {
        name: '约拍',
        icon: 'cuIcon-friendfill',
      },
      {
        name: '技巧',
        icon: 'cuIcon-friendfill',
      },
      {
        name: '话题',
        icon: 'cuIcon-friendfill',
      },
      {
        name: '壁纸',
        icon: 'cuIcon-pic',
      },
    ],
     curTab: 0
  },

  async search(){
    var value = this.data.searchValue
    var res = await cloud.callFunction("search", {
      $url: "search",
      value: value
    })
    console.log(res)
    this.setData({

    })
  },

  onLoad: function (options) {
    var {value} = options
    this.setData({
      searchValue: value
    })
    this.search()
  },
})