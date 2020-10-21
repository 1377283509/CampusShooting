// components/sub-title-bar/sub-title.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String
    },
    moreUrl: {
      type: String
    },
    hideMore: {
      type: Boolean
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
    navToMore(){
      wx.navigateTo({
        url: this.properties.moreUrl,
      })
    }

  }
})
