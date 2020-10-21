const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init({
  env: "school-shoot-msw1y"
})

const videoCount = 20

const videoCollectionName = "videos"
const userCollectionName = "user"
const focusCollectionName = "focus-realtion"
const likeCollectionName = "video-like-realtion"
const videoCommentCollectionName = "video-comment"
const childCommentCollectionName = "child-comments"

const db = cloud.database()
const _ = db.command


exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.use(async (ctx, next) => {
    ctx.data = {}
    await next()
  })

  // 发布视频
  app.router(
    "addVideo",
    // 获取用户_id并检测用户状态
    async (ctx, next) => {
        try {
          const user = await db.collection(userCollectionName).where({
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
          const addRes = await transaction.collection(videoCollectionName).add({
            data: {
              userId: ctx.data.userId,
              title: event.title,
              topic: event.topic,
              university: event.university,
              viewCount: 0,
              likeCount: 0,
              commentCount: 0,
              createTime: Date.now(),
              video: event.video,
              status: 1,
              cover: event.cover
            }
          })
          const incRes = await transaction.collection(userCollectionName).where({
            _openid: event.userInfo.openId
          }).update({
            data: {
              videoCount: _.inc(1)
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

  // 获取视频详情
  app.router("getVideoById",
    // 更新数据库信息
    async (ctx, next) => {
        try {
          await db.collection(videoCollectionName).where({
            _id: event.id
          }).update({
            data: {
              viewCount: _.inc(1)
            }
          })
          await next()
        } catch (error) {
          console.log(error)
          await next()
        }
      },
      // 获取当前video的信息
      async (ctx, next) => {
          try {
            let status = 1
            if (event.status != undefined && event.status != null)
              status = event.status
            let data = await db.collection(videoCollectionName).where({
              _id: event.id,
              status: status
            }).field({
              cover: false,
              comments: false
            }).get()
            ctx.data.video = data.data[0]
            await next()
          } catch (error) {
            ctx.data.err = error
            ctx.body = {
              data: ctx.data,
              code: 0
            }
          }
        },
        // 获取用户信息
        async (ctx, next) => {
            try {
              let data = await db.collection(userCollectionName).where({
                _id: ctx.data.video.userId
              }).field({
                _id: true,
                nickName: true,
                avatarUrl: true,
                university: true
              }).get()
              ctx.data.userInfo = data.data[0]
              await next()
            } catch (error) {
              ctx.data.err = error
              ctx.body = {
                data: ctx.data,
                code: 0
              }
            }
          },
          // 是否关注
          async (ctx, next) => {
              try {
                let res = await db.collection(focusCollectionName).where({
                  _openid: event.userInfo.openId,
                  userId: ctx.data.userInfo._id
                }).count()
                if (res.total > 0) {
                  ctx.data.hasFocus = true
                } else {
                  ctx.data.hasFocus = false
                }
                await next()
              } catch (error) {}
            },
            // 是否喜欢
            async (ctx, next) => {
              let res = await cloud.callFunction({
                name: 'video',
                data: {
                  $url: 'isLike',
                  id: event.id,
                  userInfo: {
                    openId: event.userInfo.openId
                  }
                }
              })
              if (res.result.data) {
                ctx.data.isLike = true
              } else {
                ctx.data.isLike = false
              }
              ctx.body = {
                data: ctx.data,
                code: 1
              }
            },

  )

  // 获取相关视频
  app.router("getRelatedVideos",
    // 获取同话题视频
    async (ctx, next) => {
        if (event.topic == "" || event.topic == null || event.topic == undefined) {
          ctx.data.videos = []
          await next()
        }
        try {
          let data = await db.collection(videoCollectionName).where({
            _id: _.neq(event.id),
            topic: event.topic,
            status: 1
          }).orderBy("likeCount", "desc").limit(10).field({
            _openid: false,
            status: false,
            comments: false
          }).get()
          ctx.data.videos = data.data
          await next()
        } catch (error) {
          console.log(error)
          ctx.data.err = error
          ctx.body = {
            data: ctx.data,
            code: 0
          }
        }
      },
      // 获取同学校视频
      async (ctx, next) => {
        try {
          let num = videoCount - ctx.data.videos.length
          let data = await db.collection(videoCollectionName).where({
            _id: _.neq(event.id),
            university: event.university,
            status: 1
          }).limit(num).field({
            _openid: false,
            status: false,
            comments: false
          }).get()
          ctx.data.videos = ctx.data.videos.concat(data.data)
          ctx.body = {
            data: ctx.data,
            code: 1
          }
        } catch (error) {
          console.log(error)
          ctx.data.err = error
          ctx.body = {
            data: ctx.data,
            code: 0
          }
        }
      }
  )

  // 获取视频列表
  app.router("getVideos", async (ctx, next) => {
    // 筛选条件
    var condition = {
      status: 1
    }
    // 限制
    var limit = 8
    // 排序字段
    var orderField = "createTime"
    // 排序方式
    var orderPattern = "desc"
    // 字段
    var fields = {}
    var offset = 0
    if (event.condition)
      condition = event.condition
    if (event.limit)
      limit = event.limit
    if (event.orderPattern)
      orderPattern = event.orderPattern
    if (event.orderField)
      orderField = event.orderField
    if (event.fields)
      fields = event.fields
    if (event.offset)
      offset = event.offset
    try {
      let data = await db.collection(videoCollectionName).where(condition).orderBy(orderField, orderPattern).field(fields).skip(offset).limit(limit).get()
      ctx.body = {
        data: data.data,
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

  // 判断用户是否喜欢
  app.router("isLike", async (ctx, next) => {
    try {
      let res = await db.collection(likeCollectionName).where({
        _openid: event.userInfo.openId,
        videoId: event.id
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

  // 取消喜欢
  app.router("removeLike", async (ctx, next) => {
    try {
      const transaction = await db.startTransaction()
      const remRes = await transaction.collection(likeCollectionName).where({
        _openid: event.userInfo.openId,
        videoId: event.id
      }).remove()
      const decRes = await transaction.collection(videoCollectionName).where({
        _id: event.id
      }).update({
        data: {
          likeCount: _.inc(-1)
        }
      })
      let remStatus = remRes.errMsg == "collection.remove:ok"
      let decStatus = decRes.errMsg = "collection.update:ok"
      if (remStatus && decStatus) {
        await transaction.commit()
        ctx.body = {
          data: "操作成功",
          code: 1
        }
      } else {
        await transaction.rollback()
        ctx.body = {
          data: "操作失败",
          code: 0
        }
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        data: "操作失败",
        code: 0
      }
    }
  })

  // 添加喜欢
  app.router("addLike",
    // 判断是否喜欢
    async (ctx, next) => {
        let res = await cloud.callFunction({
          name: 'video',
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
            data: "操作成功",
            code: 1
          }
        } else {
          await next()
        }
      },
      // 添加进数据库
      async (ctx, next) => {
        try {
          const transaction = await db.startTransaction()
          const addRes = await transaction.collection(likeCollectionName).add({
            data: {
              _openid: event.userInfo.openId,
              videoId: event.id
            }
          })
          const incRes = await transaction.collection(videoCollectionName).where({
            _id: event.id
          }).update({
            data: {
              likeCount: _.inc(1)
            }
          })
          let addStatus = addRes.errMsg === "collection.add:ok"
          let incStatus = incRes.errMsg === "collection.update:ok"
          if (addStatus && incStatus) {
            await transaction.commit()
            ctx.body = {
              data: "操作成功",
              code: 1
            }
          } else {
            await transaction.rollback()
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
      }
  )

  // 添加子评论
  app.router("addChildComment",
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
      async (ctx, next) => {
        try {
          var data = {
            from: {
              userId: ctx.data.userInfo._id,
              userName: ctx.data.userInfo.nickName
            },
            to: {
              userId: event.commentTo.userId,
              userName: event.commentTo.userName,
            },
            parentId: event.commentTo.parentId,
            value: event.comment,
            date: Date.now(),
            videoId: event.videoId,
            likeCount: 0
          }
          var addRes = await db.collection(childCommentCollectionName).add({
            data: data
          })
          if (addRes.errMsg == "collection.add:ok") {
            ctx.body = {
              data: "发布成功",
              code: 1
            }
          } else {
            ctx.body = {
              data: "发布失败",
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
            videoId: event.videoId,
            value: event.comment,
            from: {
              userId: ctx.data.userInfo._id,
              userAvatar: ctx.data.userInfo.avatarUrl,
              userName: ctx.data.userInfo.nickName,
            },
            date: Date.now(),
            likeCount: 0
          }
          var incRes = await transaction.collection(videoCollectionName).where({
            _id: event.videoId
          }).update({
            data: {
              commentCount: _.inc(1)
            }
          })
          var addRes = await transaction.collection(videoCommentCollectionName).add({
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
      let res = await db.collection(videoCommentCollectionName).aggregate().match({
        videoId: event.videoId
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
        const delRes = await transaction.collection(videoCommentCollectionName).where({
          _id: event.id
        }).remove()
        // 评论数 -1
        const decRes = await transaction.collection(videoCollectionName).where({
          _id: event.videoId
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

  // 获取喜欢的视频
  app.router("getLikeVideos",
    // 获取喜欢的列表
    async (ctx, next) => {
        try {
          var offset = event.offset ? event.offset : 0
          const res = await db.collection(likeCollectionName).where({
              _openid: event.userInfo.openId
            })
            .skip(offset)
            .limit(20)
            .field({
              videoId: true
            }).get()
          var list = []
          res.data.map((i) => {
            list.push(i.videoId)
          })
          ctx.data.likeList = list
          await next()
        } catch (error) {
          console.log(error)
          ctx.body = {
            data: "数据库异常",
            code: 0
          }
        }
      },
      // 获取喜欢的视频
      async (ctx, next) => {
        try {
          const res = await db.collection(videoCollectionName).where({
            _id: _.in(ctx.data.likeList),
            status: 1
          }).field({
            cover: true,
            title: true,
            topic: true,
            university: true,
            likeCount: true,
            viewCount: true,
            createTime: true
          }).get()
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
      }
  )

  // 获取视频列表
  app.router('getVideoListByTopic', async (ctx, next) => {
    try {
      var offset = 0
      if (event.offset) offset = event.offset
      const res = await db.collection(videoCollectionName).where({
        topic: event.name ? event.name : "",
        status: 1
      }).field({
        cover: true,
        title: true,
        topic: true,
        university: true,
        likeCount: true,
        viewCount: true,
        createTime: true
      }).skip(offset).limit(10).orderBy("createTime", 'desc').get()
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

  // 获取主题中的视频列表
  app.router('getListByTheme', async(ctx, next)=>{
    try {
      var offset = 0
      if (event.offset) offset = event.offset
      const res = await db.collection(videoCollectionName).where({
        theme: event.id,
        status: 1
      }).field({
        cover: true,
        title: true,
        topic: true,
        university: true,
        likeCount: true,
        viewCount: true,
        createTime: true
      }).skip(offset).limit(10).orderBy("createTime", 'desc').get()
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

  // 获取我发布的视频
  app.router("getMyVideos", 
  async(ctx, next)=>{
    try {
      var offset = 0
      if(event.offset) offset = event.offset
      const res = await db.collection(videoCollectionName).where({
        userId: event.id
      }).field({
        _id: true,
        cover: true,
        topic: true,
        title: true,
        viewCount: true,
        likeCount: true,
        createTime: true,
        university: true
      }).limit(10).skip(offset).get()
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