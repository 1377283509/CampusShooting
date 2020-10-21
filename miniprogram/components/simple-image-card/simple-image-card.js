// components/simple-image-card/simple-image-card.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    image: {
      type: Object
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
      let {id} = e.currentTarget.dataset;
      wx.navigateTo({
        url: '/pages/image-detail/image-detail?id='+id,
      })
    }

  }
})
