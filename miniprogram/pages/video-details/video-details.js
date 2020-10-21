var that = null
const app = getApp()
const utils = require('../../utils/utils')
Page({
  data: {
    statusBar: app.globalData.StatusBar,
    video: null,
    userInfo: null,
    // 相关视频
    videos: [],
    hasFocus: null,
    isLike: null,
    comments: [],
    currentTab: 0,
    isLoadingVideos: true,
    keyboardHeight: 0,
    // 评论内容
    commentValue: null,
    // 评论
    commentTo: null,
    keyboardFocus: false,
    myInfo: null
  },

  // 删除评论
  deleteComment(e){
    console.log(e)
    wx.showLoading({
      title: '正在删除',
    })
    // index为一级评论索引，idx为子评论索引，id为评论id
    const {id, index, idx} = e.currentTarget.dataset
    var isChild = false
    if(idx!=undefined){
      isChild = true
    }
    console.log(isChild)
    wx.cloud.callFunction({
      name: 'video',
      data:{
        $url: isChild?'deleteChildComment':"deleteComment",
        id: id,
        videoId: that.data.video._id
      },
      success:res=>{
        if(res.result.code == 1){
          var comments = that.data.comments
          var video = that.data.video
          // 从本地删除
          if(isChild){
            var childComments = comments[index].comments
            childComments.splice(idx, 1)
            comments[index].comments = childComments
          }else{
            video.commentCount = video.commentCount-1
            comments.splice(index, 1)
          }

          that.setData({
            comments: comments,
            video: video
          })
          wx.showToast({
            title: '删除成功',
            icon: 'none'
          })
        }else{
          wx.showToast({
            title: res.result.data,
          })
        }
      }
    })
  },

  // 键盘失去焦点回调
  onBlur(){
    that.setData({
      keyboardHeight: 0 
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
      name: "video",
      data: {
        $url: "getComments",
        videoId: id
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
    let comment = that.data.commentValue
    if(comment == null){
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
    wx.showLoading({
      title: '发送中',
    })
    var commentTo = that.data.commentTo
    var comments = that.data.comments
    wx.hideKeyboard({
      complete: (res) => {
        that.setData({
          keyboardHeight:0
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
        comments:[],
        date: Date.now()
      })
    }
    that.setData({
      comments: comments
    })
    // 调用云函数发送
    wx.cloud.callFunction({
      name: 'video',
      data: {
        $url: commentTo==null?"addComment":"addChildComment",
        comment: comment,
        videoId: that.data.video._id,
        hasParent: !that.data.commentTo === null,
        commentTo: commentTo
      },
      success: res => {
        let video = that.data.video
        // 一级评论
        if(!commentTo){
          video.commentCount = video.commentCount + 1
        }
        that.setData({
          video: video,
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

  // 喜欢回调
  likeHandle() {
    let isLike = that.data.isLike
    that.setData({
      isLike: !isLike
    })
    // 同步云端
    wx.cloud.callFunction({
      name: "video",
      data: {
        $url: isLike ? "removeLike" : "addLike",
        id: that.data.video._id
      },
      success: res => {
        if (res.result.code == 1) {
          that.setData({
            isLike: !isLike
          })
        } else {
          wx.showToast({
            title: '操作失败',
          })
          that.setData({
            isLike: isLike
          })
        }
      },
      fail: res => {
        console.log(res)
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    })
  },

  // 点击tab回调
  selectTab(e) {
    let {
      id
    } = e.currentTarget.dataset
    that.setData({
      currentTab: id
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

  // 获取video数据
  getVideo(id) {
    wx.showLoading({
      title: "加载中"
    })
    wx.cloud.callFunction({
      name: "video",
      data: {
        $url: "getVideoById",
        id: id
      },
      success: res => {
        let video = res.result.data.video
        that.setData({
          video: video,
          userInfo: res.result.data.userInfo,
          hasFocus: res.result.data.hasFocus,
          isLike: res.result.data.isLike,
        })
        that.getRelatesVideos(video._id, video.topic, video.university)
        that.getComments(video._id)
        wx.hideLoading({
          complete: (res) => {},
        })
      }
    })
  },

  // 获取相关视频
  getRelatesVideos(id, topic, university) {
    wx.cloud.callFunction({
      name: 'video',
      data: {
        $url: "getRelatedVideos",
        topic: topic,
        university: university,
        id: id
      },
      success: res => {
        if (res.result.code == 1) {
          that.setData({
            videos: res.result.data.videos,
            isLoadingVideos: false,
          })
        } else {
          wx.showToast({
            title: res.result.data,
          })
        }
      }
    })
  },


  onLoad: function (options) {
    that = this;
    let id = options.id;
    that.getVideo(id)
    wx.getStorage({
      key: 'userInfo',
      success: res => {
        that.setData({
          myInfo: res.data
        })
      }
    })
    wx.onKeyboardHeightChange((result) => {
      that.setData({
        keyboardHeight: result.height
      })
    })
  },
})