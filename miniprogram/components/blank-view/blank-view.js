const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    color: {
      type: String,
      default: "white"
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    statusBar: app.globalData.StatusBar,
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
