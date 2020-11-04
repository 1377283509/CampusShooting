const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init({
  env: "school-shoot-msw1y"
})


const medalCollectionName = "medals"

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
  
  // 获取所以勋章
  app.router("getMedals", async(ctx, next)=>{
    try {
      const res = await db.collection(medalCollectionName).where({
        userId: event.id
      }).orderBy("date", "desc").limit(5).get()

      ctx.body = {
        data: res.data,
        code: 1
      }
      
    } catch (error) {
      console.log(error)
      ctx.body={
        data: "数据库异常",
        code: 0
      }
    }

  })
  
  return app.serve()
}