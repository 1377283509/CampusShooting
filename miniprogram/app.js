const cloud = require("./utils/cloud.js")

App({
  globalData: {
    chatList: [],
  },


  onLaunch: function () {
    // 初始化云环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'env-id',
        traceUser: true,
      })
    }
    this.getSystemInfo()
    this.login()
    var that = this
  },

  // 获取系统信息
  getSystemInfo() {
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let capsule = wx.getMenuButtonBoundingClientRect();
        if (capsule) {
          this.globalData.Custom = capsule;
          this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight + 30;
        } else {
          this.globalData.CustomBar = e.statusBarHeight + 80;
        }
      }
    })
  },

  // 登录
  login() {
    wx.cloud.callFunction({
      name: "user",
      data: {
        $url: "login"
      },
      success: res => {
        // 如果账号可用
        if (res.result.code) {
          // 设置缓存
          wx.setStorage({
            data: res.result.data,
            key: 'userInfo',
          })
          setInterval(function () {
            wx.cloud.callFunction({
              name: 'message',
              data: {
                $url: 'getNewMessageNums',
                myId: res.result.data._id
              },
              success: data => {
                if (data.result.code == 1) {
                  if (data.result.data != 0) {
                    wx.showTabBarRedDot({
                      index: 2,
                    })
                  } else {
                    wx.hideTabBarRedDot({
                      index: 2,
                    })
                  }
                }
              },
            })
          }, 2000)      
        }
      },
      fail: res => {
        wx.showToast({
          title: res.errMsg,
          icon: "none"
        })
      }
    })
  }
})