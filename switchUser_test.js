/*
 * Copy Right: Tencent ISUX
 * Project: Switcher（网页端QQ登录一键切换）
 * Comments: 主逻辑代码
 * Author: tysonpan
 * Date: 2012-9-19
 */

//本工具目前只适用于qq.com及pengyou.com
//if (document.domain.indexOf('qq.com') >= 0 || document.domain.indexOf('pengyou.com') >= 0 || document.domain.indexOf('paipai.com') >= 0) {

    //如果当前页面已经加入了本工具，则不需要再注入js(防止重复点击收藏夹中的链接)
    if (!document.getElementById('switch_user_win')) {

        //公用账号和密码
        var public_users =
            [
                ['特定尾号',
                    [
                        ['尾号为0', '822991830', '19860324pb'],
                        ['尾号为1', '822991831', '19860324pb'],
                        ['尾号为2', '822991832', '19860324pb'],
                        ['尾号为3', '822991833', '19860324pb'],
                        ['尾号为4', '822991834', '19860324pb'],
                        ['尾号为5', '822991835', '19860324pb'],
                        ['尾号为6', '822991836', '19860324pb'],
                        ['尾号为7', '822991837', '19860324pb'],
                        ['尾号为8', '822991838', '19860324pb'],
                        ['尾号为9', '822991839', '19860324pb']
                    ]
                ],
                ['社平开平',
                    [
                        ['非黄钻', '822991836', '19860324pb'],
                        ['年费黄钻', '900000477', 'isdqzone'],
                        ['认证空间', '706290154', 'tencent2010'],
                        ['认证空间', '706290146', 'nicky1981526'],
                        ['应用开发者', '1971661137', 'testtest']
                    ]
                ],
                ['SNS测试',
                    [

                    ]
                ],
                ['预留',
                    [

                    ]
                ]
            ];

        /**
         * 模拟QQ登录
         */
        var qqLogin = {
            //qq.com域的登录界面
            //qqLoginUrl:'http://ui.ptlogin2.paipai.com/cgi-bin/login?hide_title_bar=1&appid=636014201&s_url=' + window.location.href,
            //pengyou.com域的登录界面
            //pengyouLoginUrl:'http://ui.ptlogin2.pengyou.com/cgi-bin/login?appid=15000901&s_url=http://www.pengyou.com/index.php%3Fmod%3Dlogin%26act%3Dapp&needqrlogin=1&css=http://www.pengyou.com/asset/login.css',
            //bns.qq.com域的登录界面
            //bnsLoginUrl : 'http://ui.ptlogin2.qq.com/cgi-bin/login?appid=21000501&target=self&s_url=http%3A%2F%2Fbns.qq.com%2Fcomm-htdocs%2Flogin%2Flogincallback.htm&daid=8',
            //登录iframe里面的各元素的id引用
            qlogin_form:'qlogin',
            weblogin_form:'web_login',
            u:'u',
            p:'p',
            login_button:'login_button',
            verify_form:'verifyinput',
            verify_input:'verifycode',
            verify_img:'imgVerify',
            change_verify_img:'changeimg_link',
            error_tips:'err_m',


            //iframe对象
            elIframe:document.createElement('iframe'),
            //全局QQ号
            global_user:'',
            //全局密码
            global_pwd:'',


            /**
             * 降域并生成ptlogin的登录地址
             */
            getLoginUrl : function(){
                var domain_arr = document.domain.split('.');
                var topDomain = domain_arr[domain_arr.length-2] + '.' + domain_arr[domain_arr.length-1];
                document.domain = topDomain;
                return 'http://ui.ptlogin2.' + topDomain + '/cgi-bin/login?hide_title_bar=1&appid=636014201&s_url=' + window.location.href;
            },

            /**
             * 绑定iframe的onload事件
             */
            prepareLoad:function () {

                if (navigator.userAgent.indexOf("MSIE") > 0) {         //ie
                    this.elIframe.attachEvent('onload', this.iframeOnLoad);
                }
                else {                                      //非ie
                    this.elIframe.addEventListener('load', this.iframeOnLoad);
                }
            },

            /**
             * iframe载入登录界面
             * @param domain(网站的顶级域名)
             */
            loadLoginUrl:function (domain) {
                //剑灵特殊处理
                /*if(domain == 'bns.qq.com'){
                 this.elIframe.setAttribute('src',this.bnsLoginUrl);
                 this.weblogin_form = 'web_qr_login';
                 this.verify_form = 'verifyArea';
                 this.verify_input = 'verifycode';
                 this.verify_img = 'verifyimg';
                 this.change_verify_img = 'verifyimg';

                 }*/
                //一般的qq.com域
                /*if (domain.indexOf('qq.com') >= 0) {
                    document.domain = 'qq.com';
                    this.elIframe.setAttribute('src', this.qqLoginUrl);
                }*/
                //pengyou.com域
                /*else if (domain.indexOf('pengyou.com') >= 0) {
                    document.domain = 'pengyou.com';
                    this.elIframe.setAttribute('src', this.qqLoginUrl);
                }*/
                //paipai.com域
                /*else if (domain.indexOf('paipai.com') >= 0) {
                    document.domain = 'paipai.com';
                    this.elIframe.setAttribute('src', this.qqLoginUrl);
                }*/
                this.elIframe.setAttribute('src', this.getLoginUrl());
                this.elIframe.setAttribute('frameborder', '0');
                this.elIframe.setAttribute('id', 'login_iframe');
                document.body.appendChild(this.elIframe);
            },

            /**
             * iframe载入完毕的回调
             * 对于qq.com的登录界面，需要先触发一个check的请求，之后再请求login时才会有效
             */
            iframeOnLoad:function () {
                var elIframeDocument = document.getElementById('login_iframe').contentWindow.document;

                //进入到普通登录
                if (elIframeDocument.getElementById(qqLogin.u)) {
                    elIframeDocument.getElementById(qqLogin.qlogin_form).style.display = 'none';
                    elIframeDocument.getElementById(qqLogin.weblogin_form).style.display = 'block';
                    elIframeDocument.getElementById(qqLogin.u).focus();      //触发第一次check
                }

                //针对互娱进行ptv5改造的处理（他们把用户信息记在IED_LOG_INFO2，而非uin）
                var loginInfo = objCookie.getCookie('IED_LOG_INFO2');
                if(loginInfo){
                    var objLoginInfo = objCookie.unSerialize(loginInfo);
                    objLoginInfo.userUin =  qqLogin.global_user;
                    loginInfo = objCookie.serialize(objLoginInfo);
                    objCookie.setCookie('IED_LOG_INFO2',loginInfo,null,'/','.qq.com');
                }
            },

            /**
             * 输出提示信息
             * @param info(提示信息)
             * @param type(提示类别)
             */
            log:function (info, type) {
                var switcher_message = document.getElementById('switcher_message');
                if (type == 'warning') {
                    if (switcher_message.className.indexOf('warning') < 0) switcher_message.className += ' warning';
                }
                else {
                    switcher_message.className = 'switcher_message';
                }
                switcher_message.innerHTML = info;
            },

            /**
             * 触发登录
             * @param user(QQ号)
             * @param pwd(密码)
             */
            login:function (user, pwd) {
                //获取登录iframe的文档引用
                var elIframeDocument = document.getElementById('login_iframe').contentWindow.document;
                //写入QQ号码
                if (user) {
                    this.global_user = user;
                    elIframeDocument.getElementById(qqLogin.u).value = user;
                }
                else {
                    elIframeDocument.getElementById(qqLogin.u).value = this.global_user;
                }
                //写入密码
                if (pwd) {
                    this.global_pwd = pwd;
                    elIframeDocument.getElementById(qqLogin.p).value = pwd;
                }
                else {
                    elIframeDocument.getElementById(qqLogin.p).value = this.global_pwd;
                }
                //写入验证码（如果需要的话）
                if (elIframeDocument.getElementById(qqLogin.verify_form) && elIframeDocument.getElementById(qqLogin.verify_form).style.display != 'none') {
                    elIframeDocument.getElementById(qqLogin.verify_input).value = document.getElementById('switcher_verify_code').value;
                }
                //点击登录按钮
                elIframeDocument.getElementById(qqLogin.login_button).click();
                //输出提示信息
                this.log('正在登录，请稍候...', '');
                window.setTimeout(function () {
                    //警告信息
                    var tips = '请输入验证码';

                    if (elIframeDocument.getElementById(qqLogin.error_tips).firstChild) {
                        tips = elIframeDocument.getElementById(qqLogin.error_tips).firstChild.nodeValue;
                    }

                    //要输入验证码
                    if (elIframeDocument.getElementById(qqLogin.verify_form) && elIframeDocument.getElementById(qqLogin.verify_form).style.display != 'none') {
                        var ori_img = elIframeDocument.getElementById(qqLogin.verify_img);
                        qqLogin.log('<p class="switcher_verify_input"><img id="switcher_verify_img" width="130" height="53" src="' + ori_img.getAttribute('src') + '" /><input type="text" class="switcher_verify_code" id="switcher_verify_code" width="40" /></p><p>' + tips + '</p>', 'warning');
                        document.getElementById('switcher_verify_code').focus();

                        //点击验证码图片可以换一张
                        document.getElementById('switcher_verify_img').onclick = function () {
                            elIframeDocument.getElementById(qqLogin.change_verify_img).click();
                            window.setTimeout(function () {
                                document.getElementById('switcher_verify_img').setAttribute('src', ori_img.getAttribute('src'));
                                document.getElementById('switcher_verify_code').focus();
                            }, 100);
                        };

                        //马上先换一张，因为第一张总是会提示输入有误，目前还不清楚原因
                        document.getElementById('switcher_verify_img').click();
                    }

                    //提示验证码输入不正确，但是又不用再输，这种情况往往再登录一次就可以了
                    //通常这种情况出现在点了某个账号之后，输正确验证码了，然后又点了另外一个账号进行登录；后来增加了回车提交之后，这种情况就很少出现了，因为不存在输了验证码后再切换账号的情况
                    else if (tips == '您输入的验证码不正确，请重新输入。') {
                        qqLogin.login(user, pwd);
                    }

                    //普通提示信息
                    else {
                        qqLogin.log(tips, 'warning');
                    }

                }, 400);
            }

        };


        /**
         * Cookie类，封装了有关cookie的读写操作
         */

        var objCookie = {

            /*
             * 获得Cookie解码后的值
             * @param offset
             * @return 解码后的值
             */
            getCookieVal:function (offset) {
                var endstr = document.cookie.indexOf(";", offset);
                if (endstr == -1)
                    endstr = document.cookie.length;
                return unescape(document.cookie.substring(offset, endstr));
            },

            /**
             * 设定Cookie值
             * @param name
             * @param value
             */
            setCookie:function (name, value) {
                var expdate = new Date();
                var argc = arguments.length;
                var expires = (argc > 2) ? arguments[2] : null;
                var path = (argc > 3) ? arguments[3] : null;
                var domain = (argc > 4) ? arguments[4] : null;
                var secure = (argc > 5) ? arguments[5] : false;
                if (expires != null) expdate.setTime(expdate.getTime() + ( expires * 1000 ));
                document.cookie = name + "=" + escape(value) + ((expires == null) ? "" : ("; expires=" + expdate.toGMTString()))
                    + ((path == null) ? "" : ("; path=" + path)) + ((domain == null) ? "" : ("; domain=" + domain))
                    + ((secure == true) ? "; secure" : "");
            },

            /**
             * 获得Cookie的原始值
             * @param name
             * @return {String} cookie的原始值
             */
            getCookie:function (name) {
                var arg = name + "=";
                var alen = arg.length;
                var clen = document.cookie.length;
                var i = 0;
                while (i < clen) {
                    var j = i + alen;
                    if (document.cookie.substring(i, j) == arg)
                        return this.getCookieVal(j);
                    i = document.cookie.indexOf(" ", i) + 1;
                    if (i == 0) break;
                }
                return null;
            },

            /**
             * 删除Cookie
             * @param name
             */
            delCookie:function (name) {
                var exp = new Date();
                exp.setTime(exp.getTime() - 1);
                var cval = this.getCookie(name);
                document.cookie = name + "=" + cval + "; expires=" + exp.toGMTString();
            },

            /**
             * 序列化JSON对象
             * 对object转化为url参数字符串，各属性间以&分隔，如a=1&b=2&c=3
             * 对象属性为string 则进行encodeURIComponent编码
             * 对象属性为bool 则以0代表false 1代表true
             * 对象属性为对象，则会继续进行递归序列化
             * 对象属性为function 则返回function.toString
             * @param {object} jsonObj json对象
             * @return {string}
             */
            serialize:function (jsonObj) {
                var newJsonObj = null;
                if (typeof(jsonObj) == 'undefined' || typeof(jsonObj) == 'function')
                    newJsonObj = '';
                if (typeof(jsonObj) == 'number')
                    newJsonObj = jsonObj.toString();
                if (typeof(jsonObj) == 'boolean')
                    newJsonObj = (jsonObj) ? '1' : '0';
                if (typeof(jsonObj) == 'object') {
                    if (!jsonObj) newJsonObj = '';
                    if (jsonObj instanceof RegExp) newJsonObj = jsonObj.toString();
                }
                if (typeof(jsonObj) == 'string')
                    newJsonObj = jsonObj;
                if (typeof(newJsonObj) == 'string')
                    return encodeURIComponent(newJsonObj);

                var ret = [];
                if (jsonObj instanceof Array) {
                    for (var i = 0; i < jsonObj.length; i++) {
                        if (typeof(jsonObj[i]) == 'undefined')     continue;
                        ret.push(typeof(jsonObj[i]) == 'object' ? '' : objCookie.serialize(jsonObj[i]))
                    }
                    return ret.join('|')
                }
                else {
                    for (var i in jsonObj) {
                        if (typeof(jsonObj[i]) == 'undefined')     continue;
                        newJsonObj = null;
                        if (typeof(jsonObj[i]) == 'object') {
                            if (jsonObj[i] instanceof Array) {
                                newJsonObj = jsonObj[i];
                                ret.push(i + '=' + objCookie.serialize(newJsonObj));
                            } else {
                                ret.push(i + '=')
                            }
                        } else {
                            newJsonObj = jsonObj[i];
                            ret.push(i + '=' + objCookie.serialize(newJsonObj));
                        }
                    }
                    return ret.join('&')
                }
            },

            /**
             * 反序列化为JSON对象
             * 对url参形形式的对象反序列化成为JSON对象
             * 与serialize相对应
             * @param {String} jsonStr
             * @return {object} json对象
             */
            unSerialize:function (jsonStr, de) {
                de = de || 0;
                jsonStr = jsonStr.toString();
                if (!jsonStr) return {};
                var retObj = {},
                    obj1Ret = jsonStr.split('&');
                if (obj1Ret.length == 0) return retObj
                for (var i = 0; i < obj1Ret.length; i++) {
                    if (!obj1Ret[i]) continue;
                    var ret2 = obj1Ret[i].split('=');
                    if (ret2.length >= 2) {
                        var ret0 = obj1Ret[i].substr(0, obj1Ret[i].indexOf('=')),
                            ret1 = obj1Ret[i].substr(obj1Ret[i].indexOf('=') + 1);
                        if (!ret1) ret1 = '';
                        if (ret0) retObj[ret0] = de == 0 ? decodeURIComponent(ret1) : ret1;
                    }
                }
                return retObj;
            }
        };

        /*
         * objStorage类，存储本地的数据
         * 支持localStorage时使用localStorage，否则使用cookie
         */
        var objStorage = {

            /**
             * 写键值
             * @param key(键)
             * @param value(值)
             */
            setValue:function (key, value) {
                if (window.localStorage) {
                    window.localStorage.setItem(key, value);
                }
                else {
                    objCookie.setCookie(key, value);
                }
            },

            /**
             * 读键值
             * @param key(键)
             * @return value(值)
             */
            getValue:function (key) {
                var value;
                if (window.localStorage) {
                    value = window.localStorage.getItem(key);
                }
                else {
                    value = objCookie.getCookie(key);
                }
                return value;
            }
        };

        /**
         * 有关本地账号存储的处理
         * 一维数组分隔符为,，二维数组分隔符为||
         */
        var objPrivateUser = {

            /**
             * 数组转字符串
             * @param array
             * @return String
             */
            arrayToString:function (array) {
                return array.join('||');
            },

            /*
             * 字符串转数组
             * @param String
             * @return array
             */
            stringToArray:function (string) {
                var array = new Array();

                //有私人账号记录
                if (string != null && string != '') {
                    if (string.indexOf('||') < 0) {           //只有一个账号
                        array[0] = (string.split(','));
                    }
                    else {                                 //有两个或以上账号
                        var outerArray = string.split('||');
                        for (var i = 0; i < outerArray.length; i++) {
                            array[i] = outerArray[i].split(',');
                        }
                    }
                }

                return array;
            },

            /**
             * 添加一个账号
             * @param desc
             * @param user
             * @param pwd
             */
            addUser:function (desc, user, pwd) {
                //去重
                var allUsers = this.getUsers();
                for (var i = 0; i < allUsers.length; i++) {
                    if (allUsers[i][1] == user) {
                        qqLogin.log('账号已存在', 'warning');
                        return false;
                    }
                }

                //没有重复的，则添加之
                var userArray = new Array(desc, user, pwd);
                allUsers.push(userArray);

                //写回到本地存储中
                objStorage.setValue('private_users', this.arrayToString(allUsers));

                return true;
            },

            /**
             * 删除一个账号
             * @param user
             */
            deleteUser:function (user) {
                var allUsers = this.getUsers();
                for (var i = 0; i < allUsers.length; i++) {
                    if (allUsers[i][1] == user) {
                        allUsers.splice(i, 1);
                    }
                }

                //写回到本地存储中
                objStorage.setValue('private_users', this.arrayToString(allUsers));
            },

            /*
             * 获取所有账号
             * @return Array
             */
            getUsers:function () {
                return this.stringToArray(objStorage.getValue('private_users'));
            }
        };


        //加入切换账号浮层的样式
        var elStyle = document.createElement('link');
        elStyle.setAttribute('type', 'text/css');
        elStyle.setAttribute('rel', 'stylesheet');
        elStyle.setAttribute('href', 'http://172.25.32.141/open_proj/demo/switcher/switchUser.css');
        document.getElementsByTagName('head')[0].appendChild(elStyle);
        //document.appendChild(elStyle);

        //加入切换账号浮层的结构
        var switchUserHtml = '';
        switchUserHtml += '<div class="switch_user_win" id=switch_user_win>';
        switchUserHtml += '    <div class="switch_user_win_hd" id="switch_user_win_hd">';
        switchUserHtml += '        <a class="tab current" id="public_tab">公用账号</a>';
        switchUserHtml += '        <a class="tab" id="private_tab">私人账号</a>';
        switchUserHtml += '        <span class="switcher_close_button" id="switcher_close_button"></span>';
        switchUserHtml += '    </div>';
        switchUserHtml += '    <div class="switch_user_win_bd">';
        switchUserHtml += '        <div class="switcher_message" id="switcher_message">请点击一个账号进行登录';
        switchUserHtml += '        </div>';
        switchUserHtml += '        <!-- 公用账号 -->';
        switchUserHtml += '        <div class="public_panel" id="public_panel" >';
        switchUserHtml += '            <!-- 不同业务的tab -->';
        switchUserHtml += '            <div class="public_users_tab" id="public_users_tab" >';
        switchUserHtml += '                 <div class="public_users_tab_inner">';
        switchUserHtml += '                     <a href="###" name="0" id="public_users_tab0" class="current"></a><a href="###" name="1" id="public_users_tab1"></a><a href="###" name="2" id="public_users_tab2"></a><a href="###" name="3" id="public_users_tab3"></a>';
        switchUserHtml += '                 </div>';
        switchUserHtml += '            </div>';
        switchUserHtml += '            <!-- 不同业务的号码列表 -->';
        switchUserHtml += '            <div class="users_list_container" id="public_users" >';
        switchUserHtml += '                 <ul class="user_nums" id="public_users0"></ul>';
        switchUserHtml += '                 <ul class="user_nums" id="public_users1" style="display: none"></ul>';
        switchUserHtml += '                 <ul class="user_nums" id="public_users2" style="display: none"></ul>';
        switchUserHtml += '                 <ul class="user_nums" id="public_users3" style="display: none"></ul>';
        switchUserHtml += '            </div>';
        switchUserHtml += '            <p class="copyright">任何建议或bug反馈，请联系tysonpan</p>';
        switchUserHtml += '        </div>';
        switchUserHtml += '        <!-- 私人账号 -->';
        switchUserHtml += '        <div class="private_panel" id="private_panel" style="display: none">';
        switchUserHtml += '            <div class="users_list_container">';
        switchUserHtml += '                 <ul class="user_nums" id="private_users">';
        switchUserHtml += '                     <!--<li><a class="num_link"><span class="num_info">黄钻：</span><span class="num">654644316</span><i class="delete_num">删除</i></a></li>-->';
        switchUserHtml += '                 </ul>';
        switchUserHtml += '            </div>';
        switchUserHtml += '            <div class="add_num">';
        switchUserHtml += '                <h5><a id="toggle_form">添加私人账号</a></h5>';
        switchUserHtml += '                <div id="private_user_form" class="private_user_form" style="display: none">';
        switchUserHtml += '                     <p><label for="desc">描述：</label><input type="text" name="desc" id="switcher_desc" class="switcher_private_input"></p>';
        switchUserHtml += '                     <p><label for="user">QQ号：</label><input type="text" name="user" id="switcher_user" class="switcher_private_input"></p>';
        switchUserHtml += '                     <p><label for="password">密码：</label><input type="password" name="password" id="switcher_pwd" class="switcher_private_input"></p>';
        switchUserHtml += '                     <a class="add_num_btn" id="switcher_add_num_btn">添加</a>';
        switchUserHtml += '                </div>';
        switchUserHtml += '            </div>';
        switchUserHtml += '        </div>';
        switchUserHtml += '    </div>';
        switchUserHtml += '</div>';
        var elDiv = document.createElement('div');
        elDiv.innerHTML = switchUserHtml;
        document.body.appendChild(elDiv);

        //根据不同的域创建iframe，准备登录
        qqLogin.prepareLoad();
        qqLogin.loadLoginUrl(window.location.host);

        //默认显示最后一次使用的公用账号的tab
        var default_public_tab = objStorage.getValue('default_public_tab');
        if (default_public_tab) window.setTimeout(function () {
            document.getElementById('public_users_tab' + default_public_tab).click()
        }, 30);

        //读取公用账号
        if (public_users.length > 0) {
            //遍历不同业务
            for (var i = 0; i < public_users.length; i++) {
                //设置公用账号下不同业务的tab名称
                document.getElementById('public_users_tab' + i).innerHTML = public_users[i][0];
                //遍历该业务下的号码列表
                var public_users_ul = document.getElementById('public_users' + i);
                var public_users_list = public_users[i][1];
                for (var j = 0; j < public_users_list.length; j++) {
                    var public_user = public_users_list[j];
                    public_users_ul.innerHTML += '<li><a href="###" class="num_link" name="' + public_user[1] + '" type="' + public_user[2] + '"><span class="num_info">' + public_user[0] + '</span><span class="num">' + public_user[1] + '</span></a></li>';
                }
            }
        }

        //读取私人账号
        var private_users_list = document.getElementById('private_users');
        var private_users = objPrivateUser.getUsers();
        if (private_users.length > 0) {
            for (var i = 0; i < private_users.length; i++) {
                var private_user = private_users[i];
                private_users_list.innerHTML += '<li><a href="###" class="num_link" name="' + private_user[1] + '" type="' + private_user[2] + '"><span class="num_info">' + private_user[0] + '</span><span class="num">' + private_user[1] + '</span><i class="delete_num">删除</i></a></li>';
            }
        }

        //绑定公用账号下的不同业务的tab切换
        document.getElementById('public_users_tab').onclick = function (evt) {
            //获取Event对象
            var e = (evt) ? evt : window.event;
            //获取事件的点击来源元素
            var target = e.target || e.srcElement;
            //获取来源元素的节点名
            var node_name = target.nodeName.toLowerCase();
            //点击tab时作出处理
            if (node_name == 'a') {
                if (target.className != 'current') {      //对非当前tab作出处理
                    //取消其他所有tab的高亮
                    var tabs_a = document.getElementById('public_users_tab').getElementsByTagName('a');
                    for (var i = 0; i < tabs_a.length; i++) {
                        tabs_a[i].className = '';
                    }
                    //当前tab高亮
                    target.className = 'current';
                    //隐藏其他所有业务的号码列表
                    var public_users_uls = document.getElementById('public_users').getElementsByTagName('ul');
                    for (var i = 0; i < public_users_uls.length; i++) {
                        public_users_uls[i].style.display = 'none';
                    }
                    //显示当前tab对应的业务的号码列表
                    var current_index = target.getAttribute('name');
                    document.getElementById('public_users' + current_index).style.display = 'block';
                    //记录下最后一次点击的tab，下次使用默认显示这个tab
                    objStorage.setValue('default_public_tab', current_index);
                }
            }

            return false;
        };

        //绑定公用账号和私人账号的tab切换
        var el_tabs = document.getElementById('switch_user_win_hd').getElementsByTagName('a');
        for (var i = 0; i < el_tabs.length; i++) {
            el_tabs[i].onclick = function () {
                if (this.className.indexOf('current') < 0) {
                    for (var j = 0; j < el_tabs.length; j++) {
                        el_tabs[j].className = 'tab';
                    }
                    this.className += ' current';
                    if (this.id == 'public_tab') {
                        document.getElementById('public_panel').style.display = 'block';
                        document.getElementById('private_panel').style.display = 'none';
                    }
                    else if (this.id == 'private_tab') {
                        document.getElementById('public_panel').style.display = 'none';
                        document.getElementById('private_panel').style.display = 'block';
                    }

                    //清空提示区
                    qqLogin.log('请点击一个账号进行登录', '');
                }

                return false;
            }
        }

        //绑定添加私人账号的表单切换
        document.getElementById('toggle_form').onclick = function () {
            var private_user_form = document.getElementById('private_user_form');
            if (private_user_form.style.display == 'none') {
                private_user_form.style.display = 'block';
            }
            else {
                private_user_form.style.display = 'none';
            }

            return false;
        };

        //绑定公用账号的点击登录事件
        document.getElementById('public_users').onclick = function (evt) {
            //获取Event对象
            var e = (evt) ? evt : window.event;
            //获取事件的点击来源元素
            var target = e.target || e.srcElement;
            //获取来源元素的节点名
            var node_name = target.nodeName.toLowerCase();
            //在a标签中，用属性name存储QQ号，用属性type存储密码
            var user, pwd;
            if (node_name == 'span') {
                user = target.parentNode.getAttribute('name');
                pwd = target.parentNode.getAttribute('type');
            }
            else if (node_name == 'a') {
                user = target.getAttribute('name');
                pwd = target.getAttribute('type');
            }
            //进行登录
            qqLogin.login(user, pwd);

            return false;
        };

        //绑定私人账号的点击登录事件
        document.getElementById('private_users').onclick = function (evt) {
            //获取Event对象
            var e = (evt) ? evt : window.event;
            //获取事件的点击来源元素
            var target = e.target || e.srcElement;
            //获取来源元素的节点名
            var node_name = target.nodeName.toLowerCase();
            //在a标签中，用属性name存储QQ号，用属性type存储密码
            var user, pwd;
            if (node_name == 'i') {                //删除该账号
                //删除本地的账号记录
                user = target.parentNode.getAttribute('name');
                objPrivateUser.deleteUser(user);

                //删除本行
                var user_li = target.parentNode.parentNode;
                user_li.parentNode.removeChild(user_li);

                //阻止冒泡
                if (window.event) {
                    e.cancelBubble = true;
                } else {
                    e.stopPropagation();
                }
            }
            else {                                //点击登录
                if (node_name == 'span') {
                    user = target.parentNode.getAttribute('name');
                    pwd = target.parentNode.getAttribute('type');
                }
                else if (node_name == 'a') {
                    user = target.getAttribute('name');
                    pwd = target.getAttribute('type');
                }
                //进行登录
                qqLogin.login(user, pwd);
            }

            return false;
        };

        //绑定添加私人账号的点击事件
        document.getElementById('switcher_add_num_btn').onclick = function () {
            //获取值
            var desc = document.getElementById('switcher_desc').value;
            var user = document.getElementById('switcher_user').value;
            var pwd = document.getElementById('switcher_pwd').value;
            //合法性检查
            if (desc == '' || user == '' || pwd == '') {
                qqLogin.log('信息不完整', 'warning');
                return false;
            }
            //写入到本地存储
            if (objPrivateUser.addUser(desc, user, pwd)) {
                //添加到页面显示
                private_users_list.innerHTML += '<li><a class="num_link" name="' + user + '" type="' + pwd + '"><span class="num_info">' + desc + '</span><span class="num">' + user + '</span><i class="delete_num">删除</i></a></li>';
            }

            return false;
        };

        //绑定切换账号浮层的隐藏事件
        document.getElementById('switcher_close_button').onclick = function () {
            document.getElementById('switch_user_win').style.display = 'none';
        };

        //监听键盘事件（目前只处理回车）
        document.onkeydown = function (evt) {
            //获取Event对象
            var e = (evt) ? evt : window.event;
            //获取事件的来源元素
            var target = e.target || e.srcElement;
            //获取按键码
            var key_code = e.keyCode || e.which;

            //输入验证码
            if (target.className == 'switcher_verify_code') {
                if (key_code == '13') {
                    qqLogin.login();
                }
            }

            //添加私人账号
            else if (target.className == 'switcher_private_input') {
                if (key_code == '13') {
                    document.getElementById('switcher_add_num_btn').click();
                }
            }

        };

        //剑灵的特殊处理
        //if(window.location.host == 'bns.qq.com' && typeof (LoginManager) == 'object') LoginManager.logout();

        //流量统计
        var statistics_iframe = document.createElement('iframe');
        statistics_iframe.setAttribute('src', 'http://172.25.32.141/open_proj/demo/switcher/switcher_analysis.html');
        //statistics_iframe.setAttribute('src','http://game.qq.com/act/logout.html');
        statistics_iframe.setAttribute('frameborder', '0');
        statistics_iframe.setAttribute('id', 'statistics_iframe');
        document.body.appendChild(statistics_iframe);
    }

    //如果切换账号的浮层被隐藏了，再次点击则显示出来
    if (document.getElementById('switch_user_win').style.display == 'none') {
        document.getElementById('switch_user_win').style.display = 'block';
    }
/*
}
else {
    alert('请在qq.com或pengyou.com的域名下使用它。 :)');
}*/
