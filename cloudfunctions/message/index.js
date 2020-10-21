// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init({
  env: "school-shoot-msw1y"
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate
const messageCollectionName = "message"

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  // 全局中间件，获取用户的id,并检测用户状态
  app.use(async (ctx, next) => {
    ctx.data = {}
    await next()
  })

  // 获取消息
  app.router("getMessages", async (ctx, next) => {
    try {
      var list = []
      var offset = 0
      if (event.offset) {
        offset = event.offset
      }
      var time = 0
      if(event.time){
        time = event.time
      }
      list.push(event.userId)
      list.push(event.myId)
      const res = await db.collection(messageCollectionName).where({
        to: _.in(list),
        from: _.in(list),
        time: _.gt(time)
      }).orderBy('time', 'asc').skip(offset).limit(30).get()
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

  // 获取未读消息数
  app.router("getNewMessageNums", async(ctx, next)=>{
    try {
    const res = await db.collection(messageCollectionName).where({
      to: event.myId,
      status: false
    }).count()
    ctx.body = {
      data: res.total,
      code: 1
    }
    } catch (error) {
      ctx.body = {
        data: "数据库异常",
        code: 0
      }
    }


  })

  // 发送消息
  app.router("send",
    async (ctx, next) => {
      try {
        await db.collection(messageCollectionName).add({
          data: {
            to: event.userId,
            from: event.myId,
            time: Date.now(),
            status: false,
            type: event.type,
            content: event.content
          }
        })
        ctx.body = {
          data: "发送成功",
          code: 1
        }
      } catch (error) {
        console.log(error)
        ctx.body = {
          data: "数据库异常",
          code: 0
        }
      }
    }
  )

  // 获取消息列表
  app.router("getChatList",
    async (ctx, next) => {
      try {
        const res = await db.collection(messageCollectionName).aggregate().match({
          to: event.myId,
          status: false
        }).group({
          _id: "$from",
          msgNums: $.sum(1),
          lasttime: $.max("$time")
        }).lookup({
          from: "user",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }).project({
          _id: true,
          msgNums: true,
          lasttime: true,
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

    // 获取历史列表
  app.router("getHistory", async (ctx, next) => {
    try {
      const res = await db.collection(messageCollectionName).aggregate().match({
        to: event.myId,
      }).group({
        _id: "$from",
        msgNums: $.sum(1),
        lasttime: $.max("$time")
      }).lookup({
        from: "user",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }).project({
        _id: true,
        msgNums: true,
        lasttime: true,
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

  // 更新消息状态
  app.router("updateStatus", async (ctx, next) => {
    try {
      const res = await db.collection(messageCollectionName).where({
        to: event.myId,
        from: event.userId,
        status: false
      }).update({
        data: {
          status: true
        }
      })
      ctx.body = {
        data: "更新成功",
        code: 1
      }
    } catch (error) {
      ctx.body = {
        data: "数据库异常",
        code: 0
      }
    }
  })

  return app.serve()
}