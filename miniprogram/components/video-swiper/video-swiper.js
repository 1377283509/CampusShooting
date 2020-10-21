// components/video-swiper/video-swiper.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
    },
    moreUrl: {
      type: String
    },
    detailUrl:{
      type: String
    },
    videoList: {
      type: Array
    },

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
      console.log(e)
      wx.navigateTo({
        url: this.properties.detailUrl + "?id="+ e.currentTarget.dataset.id,
      })
    },
  
    navToList(e){
      wx.navigateTo({
        url: this.properties.moreUrl,
      })
    },

  }
})
