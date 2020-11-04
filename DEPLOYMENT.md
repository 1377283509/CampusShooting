# 校拍部署




## 方法1 微信开发者工具内部署

1. 修改project.config.js中的appId为自己的appId；
2. 在开发者工具中开通云环境；
3. 修改app.js，初始化云环境函数中的env为自己创建的环境；
4. 编译、上传。

> 完成后，手动上传一些数据，才有效果。


## 方法2 CloudBase cli部署

1. 安装node.js环境。（具体步骤略）

2. 开通云开发环境，安装Cli工具。

   具体可参考官方文档：https://github.com/TencentCloudBase/cloudbase-framework/blob/master/CLI_GUIDE.md#wx-miniprogram

3. 填写cloudbaserc.json中的appid和privateKsyPath（可到小程序后台下载）

4. 部署

   ```
   cloudbase framework deploy
   ```

   

