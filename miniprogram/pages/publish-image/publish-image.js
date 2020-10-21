const utlis = require("../../utils/utils.js")
Page({
  data: {
    // 图片列表
    imgList: [],
    index: null,
    // 大学
    university: "",
    // 文案
    title: "",
    // 话题
    topic: "",
    // 用户头像
    userAvatar: "",
    // 用户昵称
    userName: "",
  },

  async done(e) {
    //开始执行上传
    let that = this;
    let title = that.data.title
    // 检查是否含有图片
    if (that.data.imgList.length == 0) {
      wx.showToast({
        title: '请至少上传一张图片',
      })
      return
    }
    // 检查文字是否安全
    if (title.length > 0) {
      if (!await utlis.textSec(title)) {
        wx.showModal({
          title: '提示',
          content: '文案中包含敏感信息，请重新编辑',
          showCancel: false
        })
        return
      }
    }
    wx.showLoading({
      title: '上传中',
    })
    // 如果用户授权，开始上传图片
    if (e.detail.userInfo) {
      that.uploadImg(that.data.imgList);
    } else {
      wx.showModal({
        title: '提示',
        content: '请先授权登录',
        showCancel: false
      })
    }
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 9 - this.data.imgList.length, //默认9
      sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        this.setData({
          imgList: this.data.imgList.concat(res.tempFilePaths)
        })
      }
    });
  },

  // 预览图片
  viewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  // 删除图片
  delImg(e) {
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

  // 选择话题回调
  onSelectTopic() {
    wx.navigateTo({
      url: '../topic-list/topic-list',
    })
  },

  // 输入文案回调
  onInput(e) {
    let data = e.detail.value;
    this.setData({
      title: data
    })
  },

  // 选择学校回调
  onSelectSchool() {
    wx.navigateTo({
      url: '../university-list/university',
    })
  },

  // 上传图片
  async uploadImg(imgs) {
    let result = [];
    for (let item of imgs) {
      wx.showLoading({
        title: '图片上传中',
        mask: true
      })
      // 获取md5
      var digest = await utlis.getDigest(item)
      // 获取图片后缀
      let stuffix = utlis.getStuffix(item)
      let fileres = await wx.cloud.uploadFile({
        cloudPath: `image/${digest}.${stuffix}`,
        filePath: item
      });
      let secres = await utlis.imgSec(fileres.fileID);
      if (secres)
        result.push(fileres.fileID);
    }
    this.publish(result)
  },

  // 发布校拍
  publish(images) {
    const that = this
    wx.cloud.callFunction({
      name: "image",
      data: {
        $url: "addImage",
        images: images,
        title: that.data.title,
        topic: that.data.topic,
        university: that.data.university,
      },
      success: res => {
        console.log(res)
        if(res.result.code == 1){
          wx.navigateBack({
            complete: (res) => {
              wx.showToast({
                title: '发布成功',
              })
            },
          })
        }else{
          wx.showToast({
            title: res.result.data,
            icon:'none'
          })
        }
      },
      fail: res => {
        wx.showToast({
          title: "云函数调用失败",
          icon: "none"
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getStorage({
      key: 'userInfo',
      success: res => {
        this.setData({
          university: res.data.university,
        })
      }
    })
  },

  
})