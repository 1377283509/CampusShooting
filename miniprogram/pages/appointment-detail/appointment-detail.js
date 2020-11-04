const cloud = require("../../utils/cloud.js")
const utils = require("../../utils/utils.js")
var that = this
Page({
  data: {
    appointment: null,
    userInfo: null,
    keyboardHeight: 0,
    hasFocus: false,
    isLike: false,
    comments: [],
    // 评论内容
    commentValue: null,
    // 评论
    commentTo: null,
    keyboardFocus: false,
    myInfo: null
  },

  // 获取约拍数据
  async getData(id) {
    var res = await cloud.callFunction("appointment", {
      $url: "getAppointmentById",
      id: id
    }, true)
    this.getComments(res._id)
    this.getFocus(res.user[0]._id)
    this.setData({
      appointment: {
        _id: res._id,
        content: res.content,
        createTime: res.createTime,
        university: res.university,
        commentCount: res.commentCount,
      },
      userInfo: res.user[0]
    })
  },

  // 获取是否关注
  async getFocus(userId){
    var res = await cloud.callFunction("user", {
      $url: "isFocus",
      id: userId
    })
    console.log(res)
    this.setData({
      hasFocus: res
    })
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
      name: 'appointment',
      data: {
        $url: isChild ? 'deleteChildComment' : "deleteComment",
        id: id,
        appointmentId: that.data.appointment._id
      },
      success: res => {
        if (res.result.code == 1) {
          var comments = that.data.comments
          var appointment = that.data.appointment
          // 从本地删除
          if (isChild) {
            var childComments = comments[index].comments
            childComments.splice(idx, 1)
            comments[index].comments = childComments
          } else {
            appointment.commentCount = appointment.commentCount - 1
            comments.splice(index, 1)
          }

          that.setData({
            comments: comments,
            appointment: appointment
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
      name: "appointment",
      data: {
        $url: "getComments",
        appointmentId: id
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
      name: 'appointment',
      data: {
        $url: commentTo == null ? "addComment" : "addChildComment",
        comment: comment,
        appointmentId: that.data.appointment._id,
        hasParent: !that.data.commentTo === null,
        commentTo: commentTo
      },
      success: res => {
        let appointment = that.data.appointment
        // 一级评论
        if (!commentTo) {
          appointment.commentCount = appointment.commentCount + 1
        }
        that.setData({
          appointment: appointment,
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

  navBack(){
    wx.navigateBack({})
  },
  
    // 喜欢点击回调
    async changeLikeStatus(e) {
      let isLike = this.data.isLike
      this.setData({
        isLike: !isLike
      })
      // 同步云端
      await cloud.callFunction("appointment", {
        $url: isLike ? "removeLike" : "addLike",
        id: this.data.appointment._id
      })
    },


  onLoad: function (options) {
    that = this
    this.getData(options.id)
    wx.getStorage({
      key: 'userInfo',
      success: res => {
        that.setData({
          myInfo: res.data
        })
      }
    })
    wx.onKeyboardHeightChange((result) => {
      this.setData({keyboardHeight: result.height})
    })
    wx.onKeyboardHeightChange((result) => {
      this.setData({
        keyboardHeight: result.height
      })
    })
  },
})