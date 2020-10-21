// components/simple-video-card/simple-video-card.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    video: {
      type: Object
    },
    color: {
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
    navToDetail(e){
      let {id} = e.currentTarget.dataset
      wx.navigateTo({
        url: '/pages/video-details/video-details?id='+id,
      })
    }
  }
})
