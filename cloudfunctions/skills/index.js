// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init({
  env: "school-shoot-msw1y"
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate
const skillCollectionName = "skill"

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.use(async (ctx, next) => {
    ctx.data = {}
    await next()
  })

  // 获取所有skill
  app.router("getSkillList", async(ctx, next)=>{
    try {
      var offset = 0
      if(event.offset) offset = event.offset
      const res = await db.collection(skillCollectionName).skip(offset).limit(20).get()
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

  // 搜索
  app.router("search", async(ctx, next)=>{
    try {
      const res = await db.collection(skillCollectionName).where({
        title: db.RegExp({
          regexp: event.title,
          options: "i"
        })
      }).get()

      ctx.body = {
        data: res.data,
        code: 1
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        data: '数据库异常',
        code: 0
      }
    }
  })

  return app.serve()
}