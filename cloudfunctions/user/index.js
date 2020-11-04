// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init({
  env: "school-shoot-msw1y"
})

const db = cloud.database()
const userCollection = db.collection("user")
const _ = db.command
const focusCollection = db.collection("focus-realtion")
const imageLikeCollection = db.collection("image-like-realtion")
const videoLikeCollection = db.collection("video-like-realtion")
const wallpaperLikeCollection = db.collection("wallpaper-like-realtion")
const appointmentLikeCollection = db.collection("appointment-like-realtion")

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.use(async (ctx, next) => {
    ctx.data = {}
    await next()
  })

  // 登录
  app.router("login", async (ctx, next) => {
    try {
      let data = await userCollection.where({
        _openid: event.userInfo.openId
      }).field({
        _openid: false,
        status: false,
      }).get()
      // 如果用户存在
      if (data.data.length != 0) {
        ctx.body = {
          data: data.data[0],
          code: 1
        }
      } else {
        ctx.body = {
          data: "账号未授权",
          code: 0
        }
      }
    } catch (error) {
      ctx.body = {
        data: error,
        code: 0
      }
    }
  })

  // 注册
  app.router("register", 
  // 检查数据库中是否有该用户
  async(ctx, next)=>{
    try {
      let res = await userCollection.where({
        _openid: event.userInfo.openId
      }).field({
        status: false,
        _openid: false,
      }).get()
      if(res.data.length > 0){
        ctx.body = {data:res.data[0], code: 1}
      }else{
        await next()
      }
    } catch (error) {
      ctx.body = {data:"数据库异常", code: 0}
    }
  },
  // 添加进数据库
  async (ctx, next) => {
    try {
      let res = await userCollection.add({
        data: {
          // 昵称
          nickName: event.nickName,
          // 头像
          avatarUrl: event.avatarUrl,
          // 性别
          gender: event.gender,
          // 创建时间
          createTime: Date.now(),
          // openid
          _openid: event.userInfo.openId,
          // 粉丝数
          fans: 0,
          // 关注数
          focusCount: 0,
          // 账号状态：true表示可用
          status: true,
          // 发布的约拍数
          appointmentCount: 0,
          // 创建的话题数
          createTopicCount: 0,
          // 发布的图片数
          imageCount: 0,
          // 参与的话题数
          joinTopicCount: 0,
          // 发布的视频数
          videoCount: 0,
          // 发布的壁纸数
          wallpaperCount: 0
        }
      })
      if(res.errMsg == "collection.add:ok"){
        await next()
      }else{
        ctx.body = {data: "注册失败", code: 0}
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        data: "数据库异常",
        code: 0
      }
    }
  },
  async(ctx, next)=>{
    try {
      let res = await userCollection.where({
        _openid: event.userId.openId
      }).field({
        status: false,
        _openid: false
      }).get()
      if(res.data){
        ctx.body = {data: res.data[0], code: 1}
      }else{
        ctx.body = {data: "数据库异常", code: 0}
      }
    } catch (error) {
      console.log(error)
      ctx.body = {data: "数据库异常", code: 0}
    }
  }
  )

  // 编辑信息
  app.router("editInfo", async (ctx, next) => {
    try {
      var res = await userCollection.where({
        _openid: event.userInfo.openId
      }).update({
        university: event.university,
        introduction: event.introduction
      })
      console.log(res)
      ctx.body = {
        data: "更新成功",
        code: 1
      }
      
    } catch (error) {
      console.log(error)
      ctx.body = {
        data: "数据库异常",
        code: 0
      }
    }
  })

  // 更新头像和用户名
  app.router("updateUserInfo", async (ctx, next) => {
    // TODO:更新用户信息

  })

  // 检测用户状态
  app.router("verifyUserStatus", async (ctx, next) => {
    try {
      let user = await userCollection.where({
        _openid: event.userInfo.openId
      }).get()
      if (user.data[0].status) {
        ctx.body = {
          data: true
        }
      } else {
        ctx.body = {
          data: false
        }
      }
    } catch (error) {
      ctx.body = {
        data: error
      }
    }
  })

  // 添加关注
  app.router("addFocus",
    // 检查是否已关注
    async (ctx, next) => {
        try {
          let res = await focusCollection.where({
            _openid: event.userInfo.openId,
            userId: event.id
          }).count()
          if (res.total > 0) {
            ctx.body = {
              data: "已关注",
              code: 1
            }
          } else {
            await next()
          }
        } catch (error) {
          console.log(error)
          ctx.body = {
            data: "数据库异常",
            code: 0
          }
        }
      },
      // 添加关注
      async (ctx, next) => {
        try {
          const transaction = await db.startTransaction()
          const addRes = await transaction.collection("focus-realtion").add({
            data: {
              _openid: event.userInfo.openId,
              userId: event.id
            }
          })
          const incRes = await transaction.collection("user").where({
            _id: event.id
          }).update({
            data: {
              fans: _.inc(1)
            }
          })
          if (addRes && incRes) {
            await transaction.commit()
            ctx.body = {
              data: "关注成功",
              code: 1
            }
          } else {
            await await transaction.rollback()
            ctx.body = {
              data: "操作失败",
              code: 0
            }
          }
        } catch (error) {
          ctx.body = {
            data: "数据库异常",
            code: 0
          }
        }
      })

  // 取消关注
  app.router("removeFocus",
    async (ctx, next) => {
      try {
        const transaction = await db.startTransaction()
        const remRes = await transaction.collection("focus-realtion").where({
          _openid: event.userInfo.openId,
          userId: event.id
        }).remove()

        const decRes = await transaction.collection("user").where({
          _id: event.id
        }).update({
          data: {
            fans: _.inc(-1)
          }
        })

        if (decRes && remRes) {
          await transaction.commit()
          ctx.body = {
            data: "已取消关注",
            code: 1
          }
        } else {
          transaction.rollback()
          ctx.body = {
            data: "操作失败",
            code: 0
          }
        }
      } catch (error) {
        ctx.body = {
          data: "数据库异常",
          code: 0
        }
      }
    })

  // 获取关注列表（头像和ID）
  app.router("getFocusList", async(ctx, next)=>{
    try {
        const res = await focusCollection.aggregate().match({
          _openid: event.userInfo.openId
        }).lookup({
          from: 'user',
          localField: 'userId',
          foreignField: '_id',
          as: "user",
        }).project({
          user: {
            avatarUrl: true,
            _id: true
          }
        }).limit(10).end()
      ctx.body = {
        data: res.list,
        code: 1
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        data: "数据库异常",
        code: 0
      }
    }
  })

  // 获取关注详情
  app.router("getFocusDetail", async(ctx, next)=>{
    try {
      const res = await focusCollection.aggregate().match({
        _openid: event.userInfo.openId
      }).lookup({
        from: 'user',
        localField: 'userId',
        foreignField: '_id',
        as: "user",
      }).project({
        user: {
          avatarUrl: true,
          _id: true,
          gender: true,
          fans: true,
          university: true,
          nickName: true
        }
      }).end()
      ctx.body = {
        data: res.list,
        code: 1
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        data: "数据库异常",
        code: 0
      }
    }
  })

  // 获取头像和昵称
  app.router("getBaseInfo", async(ctx, next)=>{
    try {
      const res = await userCollection.where({
        _id: event.userId
      }).field({
        nickName: true,
        avatarUrl:true,
        _id: true
      }).get()
      ctx.body = {
        data: res.data[0],
        code: 1
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        data: "数据库异常",
        code: 0
      }
    }
  })

  // 获取喜欢的统计
  app.router("getLikeCount", 
  // 获取喜欢的视频数
  async(ctx, next)=>{
    try {
      const res = await videoLikeCollection.where({
        _openid: event.userInfo.openId
      }).count()
      ctx.data.videoCount = res.total
      await next()
    } catch (error) {
      ctx.body = {
        data: "数据库异常",
        code: 0
      }
    }
  },
  // 获取喜欢的图片数
  async(ctx, next)=>{
    try {
      const res = await imageLikeCollection.where({
        _openid: event.userInfo.openId
      }).count()
      ctx.data.imageCount = res.total
      await next()
    } catch (error) {
      ctx.body = {
        data: "数据库异常",
        code: 0
      }
    }
  },

  // 获取喜欢的壁纸数
  async(ctx, next)=>{
    try {
      const res = await wallpaperLikeCollection.where({
        _openid: event.userInfo.openId
      }).count()
      ctx.data.wallpaperCount = res.total
      await next()
    } catch (error) {
      ctx.body = {
        data: "数据库异常",
        code: 0
      }
    }
  },

  // 获取喜欢的约拍数
  async(ctx, next)=>{
    try {
      const res = await appointmentLikeCollection.where({
        _openid: event.userInfo.openId
      }).count()
      ctx.data.appointmentCount = res.total
      ctx.body = {
        data: ctx.data,
        code: 1
      }
    } catch (error) {
      ctx.body = {
        data: "数据库异常",
        code: 0
      }
    }
  }
  )

  // 获取用户信息
  app.router("getUserInfo", 
  async(ctx, next)=>{
    try {
      const res = await userCollection.where({
        _id: event.id,
      }).field({
        _openid: false
      }).get()

      ctx.body = {
        data: res.data,
        code: 1
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        data: "数据库异常",
        code: 0
      }
    }
  })

  // 判断是否关注
  app.router("isFocus", async(ctx, next)=>{
    try {
      const res = await focusCollection.where({
        _openid: event.userInfo.openId,
        userId: event.id
      }).count()
      var isFocus = false
      if(res.total>0){
        isFocus = true
      }
      ctx.body = {
        data: isFocus,
        code: 1
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        data: "数据库异常",
        code: 0
      }
    }
  })


  return app.serve()
}