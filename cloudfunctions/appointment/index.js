const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init({
  env: "school-shoot-msw1y"
})

const appointmentCollectionName = "appointments"
const userCollectionName = "user"
const commentCollectionName = "appointment-comments"
const childCommentCollectionName = "child-comments"
const likeCollectionName = "appointment-like-realtion"


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

  app.router("getAppointments", async (ctx, next) => {
    try {
      var offset = 0
      if (event.offset) offset = event.offset
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

  app.router("getMyAppointments", async (ctx, next) => {
    try {
      var offset = 0
      if (event.offset) offset = event.offset
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

  app.router("getAppointmentById",
    // 判断是否喜欢
    async (ctx, next) => {
        try {
          const res = await db.collection(likeCollectionName).where({
            _openid: event.userInfo.openid,
            appointmentId: event.id
          }).count()
          if (res.total > 0) {
            ctx.data.isLike = true
          }
          await next()
        } catch (error) {
          console.log(error)
          ctx.body = {
            data: "数据库异常",
            code: 0
          }
        }
      },
      async (ctx, next) => {
        try {
          const res = await db.collection(appointmentCollectionName).aggregate().match({
            _id: event.id
          }).lookup({
            from: "user",
            foreignField: "_id",
            localField: "userId",
            as: "user"
          }).project({
            commentCount: true,
            _id: true,
            content: true,
            createTime: true,
            university: true,
            user: {
              _id: true,
              avatarUrl: true,
              nickName: true
            }
          }).end()

          ctx.body = {
            data: res.list[0],
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

  // 添加评论
  app.router("addComment",
    // 检测用户状态
    async (ctx, next) => {
        try {
          let user = await db.collection(userCollectionName).where({
            _openid: event.userInfo.openId
          }).field({
            _id: true,
            avatarUrl: true,
            nickName: true,
            status: true
          }).get()
          // 如果用户不存在
          if (!user.data) {
            ctx.body = {
              data: "未登录",
              code: 0
            }
          } else {
            // 如果用户账号异常
            if (!user.data[0].status) {
              ctx.body = {
                data: '账号异常',
                code: 0
              }
            } else {
              ctx.data.userInfo = user.data[0]
              await next()
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
      // 添加评论
      async (ctx, next) => {
        try {
          const transaction = await db.startTransaction()
          var data = {
            appointmentId: event.appointmentId,
            value: event.comment,
            from: {
              userId: ctx.data.userInfo._id,
              userAvatar: ctx.data.userInfo.avatarUrl,
              userName: ctx.data.userInfo.nickName,
            },
            date: Date.now(),
            likeCount: 0
          }
          var incRes = await transaction.collection(appointmentCollectionName).where({
            _id: event.appointmentId
          }).update({
            data: {
              commentCount: _.inc(1)
            }
          })
          var addRes = await transaction.collection(commentCollectionName).add({
            data: data
          })
          let addStatus = addRes.errMsg == "collection.add:ok"
          let incStatus = incRes.errMsg == "collection.update:ok"
          if (addStatus && incStatus) {
            await transaction.commit()
            ctx.body = {
              data: '发布成功',
              code: 1
            }
          } else {
            await transaction.rollback()
            ctx.body = {
              data: '发布失败',
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
      }
  )

  // 获取评论
  app.router("getComments", async (ctx, next) => {
    try {
      let res = await db.collection(commentCollectionName).aggregate().match({
        appointmentId: event.appointmentId
      }).lookup({
        from: childCommentCollectionName,
        localField: "_id",
        foreignField: 'parentId',
        as: 'comments'
      }).end()
      if (res.errMsg == "collection.aggregate:ok") {
        ctx.body = {
          data: res.list,
          code: 1
        }
      } else {
        ctx.body = {
          data: "加载失败",
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
  })

  // 删除评论
  app.router("deleteComment",
    async (ctx, next) => {
      try {
        const transaction = await db.startTransaction()
        // 删除原评论
        const delRes = await transaction.collection(commentCollectionName).where({
          _id: event.id
        }).remove()
        // 评论数 -1
        const decRes = await transaction.collection(appointmentCollectionName).where({
          _id: event.appointmentId
        }).update({
          data: {
            commentCount: _.inc(-1)
          }
        })
        // 删除子评论
        const delChildrenRes = await transaction.collection(childCommentCollectionName).where({
          parentId: event.id
        }).remove()

        let delStatus = delRes.errMsg == "collection.remove:ok"
        let decStatus = decRes.errMsg == "collection.update:ok"
        let delChildrenStatus = delChildrenRes.errMsg == "collection.remove:ok"
        if (delStatus && decStatus && delChildrenStatus) {
          ctx.body = {
            data: "删除成功",
            code: 1
          }
          await transaction.commit()
        } else {
          ctx.body = {
            data: "删除失败",
            code: 0
          }
          await transaction.rollback()
        }
      } catch (error) {
        console.log(error)
        ctx.body = {
          data: "数据库异常",
          code: 0
        }
      }
    })

  // 删除子评论
  app.router("deleteChildComment",
    async (ctx, next) => {
      try {
        let res = await db.collection(childCommentCollectionName).where({
          _id: event.id
        }).remove()
        if (res.errMsg == "collection.remove:ok") {
          ctx.body = {
            data: "删除成功",
            code: 1
          }
        } else {
          ctx.body = {
            data: "删除失败",
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

  // 判断用户是否喜欢
  app.router("isLike", async (ctx, next) => {
    try {
      let res = await db.collection(likeCollectionName).where({
        _openid: event.userInfo.openId,
        appointmentId: event.id
      }).count()
      if (res.total > 0) {
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
        data: false
      }
    }
  })

  // 添加喜欢
  app.router("addLike",
    // 判断是否喜欢
    async (ctx, next) => {
        let res = await cloud.callFunction({
          name: 'appointment',
          data: {
            $url: 'isLike',
            id: event.id,
            userInfo: {
              openId: event.userInfo.openId
            }
          }
        })
        if (res.result.data) {
          ctx.body = {
            data: "添加成功",
            code: 1
          }
        } else {
          await next()
        }
      },
      // 添加进数据库
      async (ctx, next) => {
        try {
          const addRes = await db.collection(likeCollectionName).add({
            data: {
              _openid: event.userInfo.openId,
              appointmentId: event.id
            }
          })
          ctx.body = {
            data: "操作成功",
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
  // 取消喜欢
  app.router("removeLike", async (ctx, next) => {
    try {
      const remRes = await db.collection(imageLikeCollectionName).where({
        _openid: event.userInfo.openId,
        appointmentId: event.id
      }).remove()
      ctx.body = {
        data: "操作成功",
        code: 1
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        data: "操作失败",
        code: 0
      }
    }
  })

  return app.serve()
}