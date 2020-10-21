// components/simple-wallpaper-card/simple-wallpaper-card.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

    wallpaper: {
      type: Object
    }
  },
  data: {

  },

  methods: {
    navToDetail(e){
      let {id} = e.currentTarget.dataset
      wx.navigateTo({
        url: '/pages/wallpaper-detail/wallpaper-detail?id=' + id,
      })
    }

  }
})
