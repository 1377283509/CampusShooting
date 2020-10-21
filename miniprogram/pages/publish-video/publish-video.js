var that = null
const utils = require("../../utils/utils")
Page({
  data: {
    // 所属大学
    university: null,
    // 话题
    topic: null,
    // 文案
    title: null,
    // video
    video: null,
    cover: null
  },

  chooseImage(e) {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        this.setData({
          cover: res.tempFilePaths[0]
        })
      }
    });
  },

  // 发布
  async done(e) {
    let video = that.data.video
    if (video === null) {
      wx.showToast({
        title: '请选择视频',
        icon: "none",
      })
      return
    }
    let cover = that.data.cover
    if (!cover) {
      wx.showModal({
        title: "提示",
        content: "选一个封面来吸引更多的人吧",
        showCancel: false
      })
      return
    }
    wx.showLoading({
      title: '上传中',
    })
    let userInfo = e.detail.userInfo;
    if (userInfo) {
      let videoRes = await that.uploadFile(video, "video")
      let coverRes = await that.uploadFile(cover, "image")
      wx.cloud.callFunction({
        name: 'video',
        data: {
          $url: "addVideo",
          video: videoRes.fileID,
          userName: userInfo.userName,
          userAvatar: userInfo.avatarUrl,
          title: that.data.title,
          topic: that.data.topic,
          university: that.data.university,
          cover: coverRes.fileID
        },
        success: res => {
          if (res.result.code == 1) {
            wx.navigateBack({
              complete: (res) => {
                wx.showToast({
                  title: '发布成功',
                })
              },
            })
          } else {
            wx.showToast({
              title: res.result.data,
              icon: 'none'
            })
          }
        }
      })
    }
  },

  // 上传视频
  async uploadFile(path, dir) {
    let stuffix = utils.getStuffix(path)
    let digest = await utils.getDigest(path)
    return wx.cloud.uploadFile({
      cloudPath: `${dir}/${digest}.${stuffix}`,
      filePath: path
    })
  },

  // 选择视频
  chooseVideo(e) {
    wx.chooseVideo({
      camera: 'back',
      maxDuration: 60,
      success: res => {
        that.setData({
          video: res.tempFilePath
        })
      },
      fail: res => {
        wx.showToast({
          title: res.errMsg,
          icon: "none"
        })
      }
    })
  },

  // 选择话题回调
  onSelectTopic() {
    wx.navigateTo({
      url: '../topic-list/topic-list',
    })
  },

  // 选择学校回调
  onSelectSchool() {
    wx.navigateTo({
      url: '../university-list/university',
    })
  },

  // 输入文案回调
  onInput(e) {
    let data = e.detail.value;
    this.setData({
      title: data
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this
    wx.getStorage({
      key: 'userInfo',
      success: res => [
        that.setData({
          university: res.data.university
        })
      ]
    })
  },
})