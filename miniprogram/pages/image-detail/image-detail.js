const cloud = require("../../utils/cloud.js")
const utils = require("../../utils/utils.js")
var that = null
Page({
  data: {
    image: null,
    userInfo: null,
    hasFocus: false,
    isLike: false,
    keyboardHeight: 0,
    comments: [],
    // 评论内容
    commentValue: null,
    // 评论
    commentTo: null,
    keyboardFocus: false,
    myInfo: null
  },

  // 删除评论
  async deleteComment(e) {
    wx.showLoading({
      title: '正在删除',
    })
    // index为一级评论索引，idx为子评论索引，id为评论id
    const {
      id,
      index,
      idx
    } = e.currentTarget.dataset
    var isChild = false
    if (idx != undefined) {
      isChild = true
    }
    wx.cloud.callFunction({
      name: 'image',
      data: {
        $url: isChild ? 'deleteChildComment' : "deleteComment",
        id: id,
        imageId: that.data.image._id
      },
      success: res => {
        if (res.result.code == 1) {
          var comments = that.data.comments
          var image = that.data.image
          // 从本地删除
          if (isChild) {
            var childComments = comments[index].comments
            childComments.splice(idx, 1)
            comments[index].comments = childComments
          } else {
            image.commentCount = image.commentCount - 1
            comments.splice(index, 1)
          }

          that.setData({
            comments: comments,
            image: image
          })
          wx.showToast({
            title: '删除成功',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: res.result.data,
          })
        }
      }
    })
  },

  // 键盘失去焦点回调
  onBlur() {
    that.setData({
      keyboardHeight: 0,
      commentTo: null
    })
  },

  // 点击评论回调
  onTapComment(e) {
    var {
      user,
      id
    } = e.currentTarget.dataset
    that.setData({
      keyboardFocus: true,
      commentTo: {
        parentId: id,
        userName: user.userName,
        userId: user.userId
      }
    })
  },

  // 获取评论
  getComments(id) {
    wx.cloud.callFunction({
      name: "image",
      data: {
        $url: "getComments",
        imageId: id
      },
      success: res => {
        if (res.result.code == 1) {
          that.setData({
            comments: res.result.data,
          })
        } else {
          wx.showToast({
            title: res.result.data,
          })
        }
      }
    })
  },

  // 评论发送回调
  async onComment(e) {
    wx.showLoading({
      title: '发送中',
    })
    let comment = that.data.commentValue
    if (comment == null) {
      wx.showToast({
        title: '评论不能为空',
        icon: 'none'
      })
      return
    }
    // 检查文字安全性 
    if (!await utils.textSec(comment)) {
      wx.showModal({
        title: '警告',
        content: "评论中含有敏感内容,请及时更正",
        showCancel: false
      })
      return
    }
    var commentTo = that.data.commentTo
    var comments = that.data.comments
    wx.hideKeyboard({
      complete: (res) => {
        that.setData({
          keyboardHeight: 0
        })
      },
    })
    if (commentTo) {
      commentTo = {
        parentId: commentTo.parentId,
        userId: commentTo.userId,
        userName: commentTo.userName
      }
      for (let com of comments) {
        if (commentTo.parentId == com._id) {
          com.comments.push({
            to: {
              userId: com.from.userId,
              userName: com.from.userName
            },
            from: {
              userId: that.data.myInfo._id,
              userName: that.data.myInfo.nickName,
            },
            value: comment,
            date: Date.now()
          })
          break;
        }
      }
    } else {
      comments.push({
        from: {
          userId: that.data.myInfo._id,
          userName: that.data.myInfo.nickName,
          userAvatar: that.data.myInfo.avatarUrl,
        },
        value: comment,
        comments: [],
        date: Date.now()
      })
    }
    that.setData({
      comments: comments
    })
    // 调用云函数发送
    wx.cloud.callFunction({
      name: 'image',
      data: {
        $url: commentTo == null ? "addComment" : "addChildComment",
        comment: comment,
        imageId: that.data.image._id,
        hasParent: !that.data.commentTo === null,
        commentTo: commentTo
      },
      success: res => {
        let image = that.data.image
        // 一级评论
        if (!commentTo) {
          image.commentCount = image.commentCount + 1
        }
        that.setData({
          image: image,
          commentValue: '',
          commentTo: null
        })
        wx.showToast({
          title: '评论成功',
          icon: 'none'
        })
      }
    })
  },

  // 输入回调
  onInput(e) {
    that.setData({
      commentValue: e.detail.value
    })
  },

  navToUserDetail(e) {
    let {
      userId
    } = e.currentTarget.dataset
    if (!userId) {
      userId = that.data.userInfo._id
    }
    wx.navigateTo({
      url: '../userDetail/userDetail?id=' + userId,
    })
  },

  // 点击关注回调
  onFocus(e) {
    let hasFocus = that.data.hasFocus
    that.setData({
      hasFocus: !hasFocus
    })
    wx.cloud.callFunction({
      name: "user",
      data: {
        $url: hasFocus ? "removeFocus" : "addFocus",
        id: that.data.userInfo._id
      },
      success: res => {
        wx.showToast({
          title: res.result.data,
          icon: 'none'
        })
        if (res.result.code == 1) {
          that.setData({
            hasFocus: !hasFocus,
          })
        } else {
          that.setData({
            hasFocus: hasFocus
          })
        }
      }
    })
  },


  navBack() {
    wx.navigateBack({
      complete: (res) => {},
    })
  },

  // 喜欢点击回调
  async changeLikeStatus(e) {
    let isLike = this.data.isLike
    this.setData({
      isLike: !isLike
    })
    // 同步云端
    await cloud.callFunction("image", {
      $url: isLike ? "removeLike" : "addLike",
      id: this.data.image._id
    })
  },

  previewImage(e) {
    wx.previewImage({
      urls: this.data.image.images,
    })
  },

  async getImageById(id) {
    wx.showLoading({
      title: "加载中"
    })
    var res = await cloud.callFunction("image", {
      $url: 'getImageById',
      id: id
    })
    this.setData({
      image: res.image,
      userInfo: res.user,
      isLike: res.isLike,
      hasFocus: res.hasFocus
    })
  },

  onLoad: function (options) {
    let {
      id
    } = options
    that = this
    wx.getStorage({
      key: 'userInfo',
      success: res => {
        that.setData({
          myInfo: res.data
        })
      }
    })
    this.getImageById(id)
    this.getComments(id)
    wx.showShareMenu({
      withShareTicket: true,
    })
    wx.onKeyboardHeightChange((result) => {
      this.setData({
        keyboardHeight: result.height
      })
    })
  },
})