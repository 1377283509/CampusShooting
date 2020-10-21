// components/theme-card/theme-card.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    theme: {
      type: Object
    },
    isNew: {
      type: Boolean
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  methods: {
    navToDetail(e){
      let {url} = e.currentTarget.dataset
      url = encodeURIComponent(url)
      wx.navigateTo({
        url: '/pages/web-page/web-page?url='+url
      })
    },

    navToList(e){
      let {id, type} = e.currentTarget.dataset
      wx.navigateTo({
        url: `/pages/theme-products/theme-products?id=${id}&type=${type}`,
      })
    }
  }
})
