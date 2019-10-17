# 腾讯智图 webpack loader

## ImageMagick

```node
需先安装
https://imagemagick.org/script/download.php
```

## 配置
```node
npm i zhitu-loader -D

{
  test: /\.(jpeg|jpg|png|gif)$/,
  exclude: /(node_modules)/,
  use: [
    {
      loader: 'zhitu-loader',
      options: {
        quality: 5, // 0 10%, 1 30%, 2 50%, 3  80%, 4 默认, 5 保真
        type_change: false, // 自动格式转换
        webp: false, // 转webp
        dir_name: '.zhitu-des' // 临时文件路径
      },
    },
  ],
};
```
