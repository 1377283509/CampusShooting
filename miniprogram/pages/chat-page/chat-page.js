var that = null
const utils = require("../../utils/utils")
const db = wx.cloud.database()
const collection = db.collection("message")
const _ = db.command
var watcher;
Page({

  data: {
    // 对方信息
    userInfo: null,
    // 我的信息
    myInfo: null,
    offset: 0,
    keyboardHeight: 0,
    content: "",
    lastItem: null,
    lastTime: null,
    msgList: [],
    showMenuCard: false,
    menusHeight: 75,
    menus: [{
        url: "../../static/icons/image.png",
        name: "图片",
        handler: "chooseImage"
      },
      {
        url: "../../static/icons/video.png",
        name: "视频",
        handler: "chooseImage "
      },
    ]
  },

  // 下拉刷新
  async refresh(){
    console.log("刷新")
  },

  // 监听数据库
  listener() {
    var msgList = this.data.msgList
    var last = msgList[msgList.length-1]
    var lastTime  = last?last.time:0
    var list = [that.data.myInfo.id, that.data.userInfo.id]
    watcher = collection
      .where({
        to: _.in(list),
        from: _.in(list),
        time: _.gt(lastTime)
      })
      .watch({
        onChange: function (snapshot) {
          var list = []
          snapshot.docChanges.map(i=>{
            list.push(i.doc)
          })
          msgList = msgList.concat(list)
          var lastItem = `item${msgList.length}`
          that.setData({
            msgList: msgList,
            lastItem: lastItem
          })
        },
        onError: function (err) {
          wx.showToast({
            title: '开启监听失败',
            icon: 'none'
          })
        }
      })
  },

  // 点击图片回调
  tapImage(e) {
    var {
      url
    } = e.currentTarget.dataset
    var list = []
    list.push(url)
    wx.previewImage({
      urls: list,
      current: 0
    })
  },

  // 隐藏menu
  click() {
    that.setData({
      showMenuCard: false
    })
  },

  // 显示menu
  showMenuCard() {
    that.setData({
      showMenuCard: true
    })
  },

  // 选择图片
  chooseImage() {
    // 选择图片
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths
        that.uploadImage(tempFilePaths)
      }
    })
  },

  // 上传图片 images：临时图片列表
  async uploadImage(images) {
    for (var i = 0; i < images.length; i++) {
      // 获取md5值
      let digest = await utils.getDigest(images[i])
      // 获取文件后缀
      let stuffix = utils.getStuffix(images[i])
      // 上传
      let upRes = await wx.cloud.uploadFile({
        cloudPath: `tempImages/${digest}.${stuffix}`,
        filePath: images[i],
      })
      // 上传成功，校验图片
      if (upRes) {
        // 校验合法性
        let res = await utils.imgSec(upRes.fileID)
        // 如果通过校验，发送
        if (res) {
          that.sendImage(upRes.fileID)
        } else {
          wx.showModal({
            showCancel: false,
            title: "警告",
            content: `第${i+1}张图片包含敏感信息，发送失败`
          })
        }
      } else {
        // 提示上传失败
        wx.showToast({
          title: `第${i+1}张图片上传失败`,
          icon: 'none'
        })
      }
    }
  },

  // 发送图片
  sendImage(url) {
    wx.cloud.callFunction({
      name: 'message',
      data: {
        $url: "send",
        type: 'image',
        content: url,
        myId: that.data.myInfo.id,
        userId: that.data.userInfo.id
      },
      success: res => {
        if (res.result.code == 0) {
          wx.showToast({
            title: '发送失败',
            icon: 'none'
          })
        }
      },
      fail: res => {
        wx.showToast({
          title: '云函数调用失败',
          icon: 'none'
        })
      }
    })
  },

  // 发送视频
  sendVideo() {

  },

  // 发送消息
  sendMessage(e) {
    var content = that.data.content
    wx.cloud.callFunction({
      name: 'message',
      data: {
        $url: "send",
        content: content,
        type: "text",
        userId: that.data.userInfo.id,
        myId: that.data.myInfo.id
      },
      success: res => {
        if (res.result.code == 1) {
          that.setData({
            content: ""
          })
        } else {
          wx.showToast({
            title: '发送失败',
            icon: 'none'
          })
        }
      },
      fail: res => {
        wx.showToast({
          title: '云函数调用失败',
          icon: 'none'
        })
      }
    })
  },

  // 输入回调
  onInput(e) {
    that.setData({
      content: e.detail.value
    })
  },

  onLoad: function (options) {
    that = this
    wx.setNavigationBarTitle({
      title: options.userName,
    })
    wx.getStorage({
      key: options.id,
      success: res => {
        that.setData({
          lastTime: res.data.lastTime,
          msgList: res.data.msgList
        })
      },
      complete: res => {
        // 获取缓存的用户信息
        wx.getStorage({
          key: 'userInfo',
          success: res => {
            that.setData({
              myInfo: {
                id: res.data._id,
                avatarUrl: res.data.avatarUrl
              },
              userInfo: {
                id: options.id,
                avatarUrl: options.avatarUrl
              },
            })
            that.listener()
          },
        })
      }
    })
    wx.onKeyboardHeightChange((result) => {
      that.setData({
        keyboardHeight: result.height
      })
    })
  },

  // 监听页面卸载，设置缓存，更改状态
  onUnload() {
    // 更新未读消息状态
    wx.cloud.callFunction({
      name: "message",
      data: {
        $url: "updateStatus",
        userId: that.data.userInfo.id,
        myId: that.data.myId,
      },
    })
    // 设置缓存，将最后一条消息的时间和消息列表进行缓存
    // 更新消息时只获取最后时间之后的
    var msgList = that.data.msgList
    var last = msgList[msgList.length - 1]
    var lastTime = 0
    if (last) {
      lastTime = last.time
    }
    var data = {
      lastTime: lastTime,
      msgList: msgList,
    }
    wx.setStorage({
      data: data,
      key: that.data.userInfo.id,
    })
  },
})