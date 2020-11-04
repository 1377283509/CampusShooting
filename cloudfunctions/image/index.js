// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init({
  env: "school-shoot-msw1y"
})

const imageCollectionName = "images"
const userCollectionName = "user"
const focusCollectionName = "focus-realtion"
const imageLikeCollectionName = "image-like-realtion"
const imageCommentCollectionName = "image-comments"
const childCommentCollectionName = "child-comments"

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  // 全局中间件: 初始化结果，存放每层中间件获取的值
  app.use(async (ctx, next) => {
    ctx.data = {}
    await next()
  })

  // 发布图片
  app.router(
    "addImage",
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
      // 添加进数据库
      async (ctx) => {
        try {
          const transaction = await db.startTransaction()
          // 添加进数据库
          const addRes = await transaction.collection(imageCollectionName).add({
            data: {
              userId: ctx.data.userId,
              title: event.title,
              topic: event.topic,
              images: event.images,
              university: event.university,
              createDate: Date.now(),
              likeCount: 0,
              viewCount: 0,
              commentCount: 0,
              status: true
            }
          })
          // 更新用户数据
          const incRes = await transaction.collection(userCollectionName).where({
            _openid: event.userInfo.openId
          }).update({
            data: {
              imageCount: _.inc(1)
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
          console.log(error)
          ctx.body = {
            data: error,
            code: 0
          }
        }
      },
  )

  app.router("getMyImages",
    async (ctx, next) => {
      try {
        var offset = 0
        if (event.offset) offset = event.offset
        const res = await db.collection(imageCollectionName).where({
          userId: event.id
        }).orderBy('createTime', 'desc').skip(offset).limit(20).get()
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

  app.router('getImageById',
    // 更新访问量
    async (ctx, next) => {
        try {
          const res = await db.collection(imageCollectionName).where({
            _id: event.id
          }).update({
            data: {
              viewCount: _.inc(1)
            }
          })
          await next()
        } catch (error) {
          console.log(error)
        }
      },
      // 获取图片信息
      async (ctx, next) => {
          try {
            const res = await db.collection(imageCollectionName).where({
              _id: event.id
            }).get()
            ctx.data.image = res.data[0],
              await next()
          } catch (error) {
            console.log(error)
            ctx.body = {
              data: "数据库异常",
              code: 0
            }
          }
        },
        // 获取用户信息
        async (ctx, next) => {
            try {
              const res = await db.collection(userCollectionName).where({
                _id: ctx.data.image.userId
              }).field({
                avatarUrl: true,
                nickName: true
              }).get()
              ctx.data.user = res.data[0]
              await next()
            } catch (error) {
              console.log(error)
              ctx.body = {
                data: "数据库异常",
                code: 0
              }
            }
          },
          // 获取是否关注
          async (ctx, next) => {
              try {
                const res = await db.collection(focusCollectionName).where({
                  _openid: event.userInfo.openId,
                  userId: ctx.data.image.userId
                }).count()
                ctx.data.hasFocus = res.total > 0
                await next()
              } catch (error) {
                console.log(error)
                ctx.body = {
                  data: "数据库异常",
                  code: 0
                }
              }
            },
            // 获取是否喜欢
            async (ctx, next) => {
              try {
                const res = await db.collection(imageLikeCollectionName).where({
                  _openid: event.userInfo.openId,
                  imageId: ctx.data.image._id
                }).count()
                ctx.data.isLike = res.total > 0
                ctx.body = {
                  data: ctx.data,
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

  // 获取最新动态
  app.router("getImageList", async (ctx, next) => {
    try {
      var offset = 0
      var orderField = "createDate"
      var condition = {
        status: true
      }
      if (event.condition) condition = event.condition
      if (event.offset) offset = event.offset
      if (event.orderField) orderField = event.orderField
      const res = await db.collection(imageCollectionName).where(condition).skip(offset).limit(10).orderBy(orderField, "desc").get()
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

  // 获取话题列表
  app.router('getImageListByTopic', async (ctx, next) => {
    try {
      var offset = 0
      if (event.offset) offset = event.offset
      const res = await db.collection(imageCollectionName).where({
        topic: event.name ? event.name : "",
        status: true
      }).skip(offset).limit(10).orderBy('createDate', 'desc').get()
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

  // 获取主题列表
  app.router("getListByTheme", async (ctx, next) => {
    try {
      var offset = 0
      if (event.offset) offset = event.offset
      const res = await db.collection(imageCollectionName).where({
        theme: event.id,
        status: true
      }).orderBy("createDate", "desc").skip(offset).limit(20).get()
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

  // 获取首页动态
  app.router("getSimpleImage", async (ctx, next) => {
    try {
      const res = await db.collection(imageCollectionName).field({
        _id: true,
        images: true,
        university: true,
        viewCount: true,
        topic: true
      }).orderBy("viewCount", "desc").limit(10).get()
      ctx.body = {
        data: res.data,
        code: 1
      }
    } catch (error) {
      console.log(error)
      ctx.body = {
        data: "数据库异常 ",
        code: 0
      }
    }


  })

  // 判断用户是否喜欢
  app.router("isLike", async (ctx, next) => {
    try {
      let res = await db.collection(imageLikeCollectionName).where({
        _openid: event.userInfo.openId,
        imageId: event.id
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
          name: 'image',
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
          const transaction = await db.startTransaction()
          const addRes = await transaction.collection(imageLikeCollectionName).add({
            data: {
              _openid: event.userInfo.openId,
              imageId: event.id
            }
          })
          const incRes = await transaction.collection(imageCollectionName).where({
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
  // 取消喜欢
  app.router("removeLike", async (ctx, next) => {
    try {
      const transaction = await db.startTransaction()
      const remRes = await transaction.collection(imageLikeCollectionName).where({
        _openid: event.userInfo.openId,
        imageId: event.id
      }).remove()
      const decRes = await transaction.collection(imageCollectionName).where({
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

  // 获取喜欢的动态
  app.router("getLikeImages",
    // 获取喜欢的列表
    async (ctx, next) => {
        try {
          var offset = event.offset ? event.offset : 0
          var res = await db.collection(imageLikeCollectionName).where({
              _openid: event.userInfo.openId
            })
            .skip(offset)
            .limit(20)
            .field({
              imageId: true
            }).get()
          var list = []
          console.log(res.data)
          res.data.map((i) => {
            list.push(i.imageId)
          })
          ctx.data.likeList = list
          console.log(list)
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
          const res = await db.collection(imageCollectionName).where({
            _id: _.in(ctx.data.likeList),
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
  })

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
            imageId: event.imageId,
            value: event.comment,
            from: {
              userId: ctx.data.userInfo._id,
              userAvatar: ctx.data.userInfo.avatarUrl,
              userName: ctx.data.userInfo.nickName,
            },
            date: Date.now(),
            likeCount: 0
          }
          var incRes = await transaction.collection(imageCollectionName).where({
            _id: event.imageId
          }).update({
            data: {
              commentCount: _.inc(1)
            }
          })
          var addRes = await transaction.collection(imageCommentCollectionName).add({
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
      let res = await db.collection(imageCommentCollectionName).aggregate().match({
        imageId: event.imageId
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
        const delRes = await transaction.collection(imageCommentCollectionName).where({
          _id: event.id
        }).remove()
        // 评论数 -1
        const decRes = await transaction.collection(imageCollectionName).where({
          _id: event.imageId
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


  return app.serve();
}