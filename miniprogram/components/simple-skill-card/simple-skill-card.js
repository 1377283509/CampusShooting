// components/simple-skill-card/simple-skill-card.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    skill: {
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
      let {url} = e.currentTarget.dataset
      url = encodeURIComponent(url)
      wx.navigateTo({
        url: '../../pages/web-page/web-page?url='+url,
      })
    }
  }
})
