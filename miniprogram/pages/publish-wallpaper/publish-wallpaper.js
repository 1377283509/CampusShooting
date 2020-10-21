const utils = require("../../utils/utils")
Page({
  data: {
    university: null,
    imgList: []
  },

  // 发布
  publish(images) {
    wx.showLoading({
      title: '上传中',
    })
    let university = this.data.university
    wx.cloud.callFunction({
      name: "wallpaper",
      data: {
        $url: "addWallpaper",
        images: images,
        university: university
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
      },
      fail: res => {
        wx.showToast({
          title: '云函数调用失败',
          icon: "none"
        })
      },
      complete: res => {
        wx.hideLoading({
          complete: (res) => {},
        })
      }
    })
  },

  async done(e) {
    var result = []
    let userInfo = e.detail.userInfo
    if (!userInfo) {
      wx.showModal({
        title: "提示",
        content: "请先授权登录",
        showCancel: false
      })
      return
    }
    // 校验图片
    wx.showLoading({
      title: '安全检测中',
    })
    for (let img of this.data.imgList) {
      let stuffix = utils.getStuffix(img)
      let digest = await utils.getDigest(img)
      let res = await wx.cloud.uploadFile({
        cloudPath: `image/${digest}.${stuffix}`,
        filePath: img
      })
      if (await utils.imgSec(res.fileID)) {
        result.push(res.fileID)
      }
    }
    this.publish(result)
  },

  // 选择图片
  ChooseImage() {
    wx.chooseImage({
      count: 9 - this.data.imgList.length, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        this.setData({
          imgList: this.data.imgList.concat(res.tempFilePaths)
        })
      }
    });
  },
  // 预览图片
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },

  // 删除图片
  DelImg(e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      cancelText: '取消',
      confirmText: '删除',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },

  // 选择学校回调
  onSelectSchool() {
    wx.navigateTo({
      url: '../university-list/university',
    })
  },


  onLoad: function (options) {
    wx.getStorage({
      key: 'userInfo',
      success: res => {
        this.setData({
          university: res.data.university
        })
      }
    })
  },
})