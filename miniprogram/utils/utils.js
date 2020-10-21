// 获取文件名后缀
var getStuffix = function(str){
  var stuffix = str.match("(?<=\.)([^\.]+)$")
  return stuffix[0]
}

// 获取文件md5
var getDigest = function(path){
  return new Promise((resolve, reject)=>{
    wx.getFileInfo({
      filePath: path,
      success:res=>{
        resolve(res.digest)
      },
      fail:res=>{
        resolve(false)
      }
    })
  })
}

// 图片安全检测
var imgSec = function(img){
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'imageSec',
      data: {
        img: img
      },
      success(res) {
        resolve(true)
      },
      fail(res){
        resolve(false)
      }
    });
  })
}

// 文本内容校验
var textSec = function(text){
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'textSec',
      data: {
        text: text
      },
      success(res) {
        resolve(true)
      },
      fail(res){
        resolve(false)
      }
    });
  })
}


module.exports = {
  getStuffix:getStuffix,
  getDigest:getDigest,
  imgSec: imgSec,
  textSec: textSec
}
