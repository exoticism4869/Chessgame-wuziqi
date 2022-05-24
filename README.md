# 单机/局域网五子棋

![image-20220524170248896](C:\Users\86177\AppData\Roaming\Typora\typora-user-images\image-20220524170248896.png)

## 单机五子棋[链接](https://exoticism4869.github.io/Chessgame-wuziqi/#/mode-choose)

## 局域网五子棋

本地需启动两个 node 服务器，一个为 httpServer，一个为 websocketServer

```js
// git clone 后进入到游戏目录
// npm install 下载依赖包
// 开启两个终端，分别执行如下代码，开启服务器
npm run httpServer
npm run websocketServer
```

接下来点击终端中打印出的地址访问即可进行在线游戏

![image-20220524170140411](C:\Users\86177\AppData\Roaming\Typora\typora-user-images\image-20220524170140411.png)

_在线游戏还有一些交互不是很完善，接下来会逐渐完善_
