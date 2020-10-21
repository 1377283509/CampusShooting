// 封装云函数, name:云函数名 data:数据
var callFunction = function(name, data, showLoading){
  if(showLoading){
    wx.showLoading({
      title: '加载中',
    })
  }
  return new Promise((resolve, reject)=>{
    wx.cloud.callFunction({
      name: name,
      data: data,
      success: res=>{
        if(res.result.code == 1){
          resolve(res.result.data)
        }else{
          wx.showToast({
            title: res.result.data,
            icon: "none"
          })
        }
      },
      fail:res=>{
        wx.showToast({
          title: '云函数调用失败',
          icon: 'none'
        })
      },
      complete: res=>{
        wx.hideLoading({
          complete: (res) => {},
        })
      }
    })
  })
}

module.exports = {
  callFunction: callFunction
}