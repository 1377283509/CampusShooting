// components/appointment-card/appointment-card.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    appointment: {
      type: Object
    },
    hideUser: {
      type: Boolean
    }
  },

  data: {

  },

  methods: {
    navToDetail(e){
      var {id} = e.currentTarget.dataset
      wx.navigateTo({
        url: '../../pages/appointment-detail/appointment-detail?id='+id,
      })
    }

  }
})
