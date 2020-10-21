
Component({

  properties: {

  },

  data: {
  },

  methods: {
    navBack(e){
      wx.navigateBack({
        complete: (res) => {},
      })
    }
  }
})
