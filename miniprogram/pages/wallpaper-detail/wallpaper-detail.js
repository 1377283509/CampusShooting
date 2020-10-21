const cloud = require("../../utils/cloud.js")
Page({

  data: {
    id: null,
    wallpaper: null,
    user: null
  },

  async getWallpaperById(){
    var {id} = this.data
    var res = await cloud.callFunction("wallpaper", {
      $url: 'getById',
      id: id
    })
    var data  = res[0]
    console.log(data)
    this.setData({
      wallpaper: {
        id: data._id,
        downCount: data.downloadCount,
        images: data.images,
        likeCount: data.likeCount,
        createTime: data.createTime
      },
      user: data.user[0]
    })
  },

  previewImage(e){
    var {index} = e.currentTarget.dataset
    

  },

  onLoad: function (options) {
    var {id}  = options
    this.setData({
      id: id
    })
    this.getWallpaperById()
  },
})