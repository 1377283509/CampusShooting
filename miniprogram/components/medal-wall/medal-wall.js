// components/medal-wall/medal-wall.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    medals: {
      type: Array
    },
    userId: {
      type: String
    }

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTapMedal(e){
      var {index} = e.currentTarget.dataset
      console.log(index)
      var medal = this.data.medals[index]
      if(medal.type == "image"){
        wx.navigateTo({
          url: '../image-detail/image-detail?id='+medal.imageId,
        })
      }else{
        wx.navigateTo({
          url: '../video-details/video-details?id+'+medal.videoId,
        })
      }
    },

    navToMedalList(e){
      wx.navigateTo({
        url: '../../pages/medal-list/medal-list?id'+this.properties.userId,
      })
    }

  }
})
