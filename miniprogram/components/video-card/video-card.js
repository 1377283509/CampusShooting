// components/video-card/video-card.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    video: {
      type:Object
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
    navToDetails(){
      wx.navigateTo({
        url: '../../pages/video-details/video-details?id='+ this.properties.video._id,
      })
    }
  }
})
