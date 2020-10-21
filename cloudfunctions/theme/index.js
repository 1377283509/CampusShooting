// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init({
  env: "school-shoot-msw1y"
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate
const themeCollectionName = "weekly-theme"

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

  // 获取主题列表
  app.router("getThemeList", 
  async(ctx, next)=>{
    try {
      var offset = 0
      if(event.offset) offset = event.offset 
      const res = await db.collection(themeCollectionName).orderBy("endTime", "desc").skip(offset).limit(20).get()
      ctx.body = {
        data:res.data,
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

  // 获取主题
  app.router("getTheme", async(ctx, next)=>{
    try {
      const res = db.collection(themeCollectionName).where({
        _id: event.id
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

  // 搜索主题
  app.router("search", async(ctx, next)=>{
    try {
      const res = await db.collection(themeCollectionName).where({
        title: db.RegExp({
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

  // 获取最新主题
  app.router("getNewTheme", async(ctx, next)=>{
    try {
      const res = await db.collection(themeCollectionName).orderBy("endTime", "desc").limit(1).get()
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

  return app.serve()
}