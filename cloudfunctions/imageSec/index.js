// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const imgmsg = (await cloud.downloadFile({
    fileID: event.img,
  })).fileContent;

  //将文件内容构造image，使用云调用检测结果
  return cloud.openapi.security.imgSecCheck({
      media: {
        contentType: 'image/png',
        value: imgmsg
      }
    })
}