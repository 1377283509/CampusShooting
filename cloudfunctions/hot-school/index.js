const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
cloud.init({
  env: "school-shoot-msw1y"
})

const hotSchoolCollectionName = "hot-school"
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

  app.router("getList", async(ctx, next)=>{
    try {
      const res = await db.collection(hotSchoolCollectionName).where({
        status:true
      }).limit(8).get()
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