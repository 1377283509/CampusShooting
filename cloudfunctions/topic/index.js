const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init({
  env: "school-shoot-msw1y"
})

const topicCollectionName = "topics"
const userCollectionName = "user"
const imageCollectionName = "images"
const videoCollectionName = "videos"

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

  // 检查是否重复
  app.router("checkRepeat", async (ctx, next) => {
    try {
      let res = await db.collection(topicCollectionName).where({
        name: event.topic,
      }).count()
      ctx.body = {
        data: res.total > 0,
        code: 1
      }
    } catch (error) {
      ctx.body = {
        data: error,
        code: 1
      }
    }
  })
  // 添加话题
  app.router("addTopic",
  // 获取用户id
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
      // 发布
      async (ctx, next) => {
        try {
          const transaction = await db.startTransaction()
          const addRes = await transaction.collection(topicCollectionName).add({
            data: {
              createTime: Date.now(),
              name: event.topic,
              userId: ctx.data.userId,
              postCount: 0
            }
          })
          const incRes = await transaction.collection(userCollectionName).where({
            _openid: event.userInfo.openId
          }).update({
            data: {
              createTopicCount: _.inc(1)
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
            await transaction.collback()
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

  // 获取话题列表
  app.router("getTopicList", async (ctx, next) => {
    try {
      var offset = 0
      if (event.offset) offset = event.offset
      const res = await db.collection(topicCollectionName).field({
        _id: true,
        name: true,
        createTime: true
      }).orderBy("postCount", "desc").skip(offset).limit(10).get()
      ctx.body = {
        data: res.data,
        code: 1
      }
    } catch (error) {
      ctx.body = {
        data: "数据库异常",
        code: 0
      }
    }
  })

  // 获取话题详情
  app.router("getTopicById", 
  async (ctx, next) => {
    try {
      const res = await db.collection(topicCollectionName).aggregate().match({
        _id: event.id
      }).lookup({
        from: "user",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }).project({
        _id: true,
        name: true,
        createTime: true,
        "user.nickName": true,
        "user.avatarUrl": true,
        "user._id": true
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

  // 搜索
  app.router("search", async(ctx, next)=>{
    try {
      const res = await db.collection(topicCollectionName).where({
        name: db.RegExp({
          regexp: event.name,
          options: "i"
        })
      }).get()
      ctx.body = {
        data: res.data,
        code: 1
      }
    } catch (error) {
      ctx.body = {
        data: '数据库异常',
        code: 0
      }
    }
  })

  return app.serve()
}