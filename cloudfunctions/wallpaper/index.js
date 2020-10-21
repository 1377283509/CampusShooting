const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init({
  env: "school-shoot-msw1y"
})

const wallpaperCollectionName = "wallpapers"
const userCollectionName = "user"

const db = cloud.database()
const _ = db.command


exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  // 全局中间件: 初始化结果，存放每层中间件获取的值
  app.use(async (ctx, next) => {
    ctx.data = {}
    await next()
  })

  // 发布图片
  app.router(
    "addWallpaper",
    // 获取用户_id并检测用户状态
    async (ctx, next) => {
        try {
          let user = await db.collection(userCollectionName).where({
            _openid: event.userInfo.openId
          }).field({
            _id: true,
            status: true
          }).get()
          ctx.data.userId = user.data[0]._id
          if (!user.data[0].status) {
            ctx.body = {
              data: "账号不可用",
              code: 0
            }
          } else {
            await next()
          }
        } catch (error) {
          console.log(error)
          ctx.body = {
            data: error,
            code: 0
          }
        }
      },
      async (ctx, next) => {
        try {
          const transaction = await db.startTransaction()
          const addRes = await transaction.collection(wallpaperCollectionName).add({
            data: {
              createTime: Date.now(),
              images: event.images,
              userId: ctx.data.userId,
              likeCounts: 0,
              downloadCount: 0,
              university: event.university
            }
          })
          const incRes = await transaction.collection(userCollectionName).where({
            _openid: event.userInfo.openId
          }).update({
            data: {
              wallpaperCount: _.inc(1)
            }
          })
          let addStatus = addRes.errMsg === "collection.add:ok"
          let incStatus = incRes.errMsg === "collection.update:ok"
          if (addStatus && incStatus) {
            await transaction.commit()
            ctx.body = {
              data: "发布成功",
              code: 1
            }
          } else {
            await transaction.rollback()
            ctx.body = {
              data: "发布失败",
              code: 0
            }
          }
        } catch (error) {
          console.log(error)
          ctx.body = {
            data: "数据库异常",
            code: 0
          }
        }
      },
  )

  app.router("getList", async (ctx, next) => {
    try {
      var offset = 0
      var orderField = ""
      var condition = {}
      if(event.condition) condition = event.condition
      if (event.offset) offset = event.offset
      if(event.orderField) orderField = event.orderField
      const res = await db.collection(wallpaperCollectionName).where(condition).field({
        images: true,
        likeCount: true
      }).skip(offset).limit(10).orderBy(orderField, 'desc').get()
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

  app.router("getById",
    // 通过id获取数据
    async (ctx, next) => {
      try {
        const res = await db.collection(wallpaperCollectionName).aggregate().match({
          _id: event.id ? event.id : ""
        }).lookup({
          from: "user",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }).project({
          _id: true,
          createTime: true,
          downloadCount: true,
          images: true,
          likeCount: true,
          "user._id": true,
          "user.nickName": true,
          "user.avatarUrl": true
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
  
    // 获取我发布的壁纸
  app.router("getMyWallpapers", async(ctx, next)=>{
    try {
      var offset = 0
      if(event.offset) offset = event.offset
      const res = await db.collection(wallpaperCollectionName).where({
        userId: event.id
      }).skip(offset).limit(10).get()
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

  return app.serve();
}