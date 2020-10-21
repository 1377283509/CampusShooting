// components/image-card/image-card.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    image: {
      type: Object
    },

  },

  data: {
    cardCur: 0

  },

  methods: {

    navToDetail(e){
      let {id} = e.currentTarget.dataset
      wx.navigateTo({
        url: '../../pages/image-detail/image-detail?id='+id,
      })
    },


    cardSwiper(e){
        let {current} = e.detail 
        this.setData({
          cardCur: current
        })
    }

  }
})
