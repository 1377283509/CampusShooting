const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    placeholder:'',
    currentIndex:0,
    index:0,
    isFocus:false,
    words: app.globalData.hotWords,
    content:'',
    confirmContent:''
  },

  ready(){
    this.setData({
      words:this.properties.words
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeIndex(e){
      this.setData({
        index:e.detail.current
      })
    },
    focusInput(){
      this.setData({
        isFocus:true,
        placeholder:this.data.words[this.data.index]
      })
    },
    blurInput(){
      if (this.data.content == ""){
        this.setData({
          isFocus: false,
          currentIndex: this.data.index,
          placeholder: ''
        })
      }
    },
    confirm(e){
      var confirmContent = ''
      if(e.detail.value==''){
        confirmContent = this.data.placeholder
      }else{
        confirmContent = e.detail.value
      }
      wx.navigateTo({
        url: '/pages/search-result/search-result?value='+confirmContent,
      })
    },
    inputContent(e){
      this.setData({
        content: e.detail.value
      })
    }

  }
})
