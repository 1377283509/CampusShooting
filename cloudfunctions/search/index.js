const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init({
  env: "school-shoot-msw1y"
})

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

  // 全局搜索
  app.router("search", async(ctx, next)=>{

  })


  return app.serve()
}