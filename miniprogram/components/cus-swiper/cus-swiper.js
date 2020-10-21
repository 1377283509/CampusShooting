// components/cus-swiper/cus-swiper.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    swiperList:{
      type:Array,
      defaule: []
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
    navToWebPage:function(e){
      let {url} = e.currentTarget.dataset
      url = encodeURIComponent(url)
      wx.navigateTo({
        url: "/pages/web-page/web-page?url="+url,
      })
    }
  }
})
