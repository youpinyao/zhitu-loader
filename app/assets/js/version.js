/*
 * 检测新版本 函数
 * @author colorcai
 * @update 2016/6/14
 * usage:
 */
function consolelog() {

}
var config = require("./package.json");

var version = config.version;

var hasNewVersion = false;

function checkVersion(src, cb){
        var urlStr = src;
        var data = new FormData();
        var request = new XMLHttpRequest();
        request.onreadystatechange = function(){
            if(request.readyState == 4 && request.status==200){
                consolelog(request);
                var resp = '';
                resp =  request.responseText;
                if(cb){
                    cb(resp);
                }
            }
        };
        request.addEventListener("error", function(){consolelog("error")}, false);
        request.addEventListener("abort", function(){consolelog("abort")}, false);
        request.open('POST', urlStr);
        request.send(data);
}

checkVersion('http://zhitu.isux.us/index.php/preview/version', function(v){
    if(v === version){
        consolelog('没有新版本');
        $('.version-tips, #contact-us').removeClass('show');
    }else{
        if(v.length > 15 || v == ''){
            return "";
        }
        hasNewVersion = true;
        $('.version-tips, #contact-us').addClass('show');
        consolelog('有新版本');
    }
});

$('.download-link').click(function () {//打开下载链接
    shell.openExternal('http://zhitu.isux.us/index.php/preview/download');
});
