const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init({
  env: "school-shoot-msw1y"
})

const appointmentCollectionName = "appointments"
const userCollectionName = "user"

const db = cloud.database()
const _ = db.command


// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })
  app.use(async (ctx, next) => {
    ctx.data = {}
    await next()
  })

  // 添加约拍
  app.router("addAppointment",
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
        ctx.body = {
          data: error,
          code: 0
        }
      }
    },
      // 添加
      async (ctx, next) => {
        try {
          const transaction = await db.startTransaction()
          const addRes = await transaction.collection(appointmentCollectionName).add({
            data: {
              createTime: Date.now(),
              content: event.content,
              university: event.university,
              userId: ctx.data.userId,
              commentCount: 0,
              status: true
            }
          })
          const incRes = await transaction.collection(userCollectionName).where({
            _openid: event.userInfo.openId
          }).update({
            data: {
              appointmentCount: _.inc(1)
            }
          })
          let addStatus = addRes.errMsg === "collection.add:ok"
          let incStatus = incRes.errMsg === "collection.update:ok"
          if (addStatus && incStatus) {
            await transaction.commit()
            ctx.body = {
              data: "添加成功",
              code: 1
            }
          } else {
            await transaction.rollback()
            ctx.body = {
              data: "添加失败",
              code: 0
            }
          }
        } catch (error) {
          console.log(error)
          ctx.body = {
            data: "数据库异常",
            code: 1
          }
        }
      })

  app.router("getAppointment", async(ctx, next)=>{
    try {
      var offset = 0
      if(event.offset) offset = event.offset
      const res = await db.collection(appointmentCollectionName).aggregate().match({
        status: true,
        university: event.university
      }).lookup({
        from: "user",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }).project({
        content: true,
        createTime: true,
        commentCount: true,
        user: {
          avatarUrl: true,
          nickName: true
        }
      }).skip(offset).limit(10).end()
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

  app.router("getMyAppointments", async(ctx, next)=>{
    try {
      var offset = 0
      if(event.offset) offset=event.offset
      const res = await db.collection(appointmentCollectionName).where({
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

  
  return app.serve()
}