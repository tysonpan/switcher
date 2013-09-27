switcher
========

switcher是一个QQ登录工具，实现的是网页端不同QQ号码的快速登录，通过点击列表中的某一个QQ号，就可以立刻拥有当前网站下面该QQ号的登录态，该登录态在当前域名下的所有网页中通用。

如何使用
-------

* 在你的页面中引入imageParser.js
* 调用imageParser.init(editorId,imgListId)方法，该方法接受两个参数：editorId是编辑框的id，imgListId是用于显示图片列表的容器id，通常是一个ul标签。
* 修改类里面的appendThumbImg方法，可以自定义显示图片的方式

  just try it!


查看demo
-------

* 请访问 [tysonpan.github.io/imageParser](http://tysonpan.github.io/imageParser)


Licence
-------

* 版权所有 @tysonpan