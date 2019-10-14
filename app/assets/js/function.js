/*
 * 基本操作 函数
 * @author colorcai
 * @update 2016/3/15
 * usage:
 */
const fs = require('fs');
var imageinfo = require('imageinfo');/*获取图片真实格式*/
/*创建文件夹*/
module.exports.makeDir = makeDir;
function makeDir(path){
//    fs.exists(path, function (exists) {
//        if(!exists) fs.mkdirSync(path, 0777);/*存储目录不存在则创建*/
//    });

    if(!fs.existsSync(path)){
        fs.mkdirSync(path, 0777);/*存储目录不存在则创建*/
    }
}


/*判断图片类型是否可用*/
module.exports.contains = contains;
function contains(arr, obj) {
    var i = arr.length;
    while (i--) {
        if (arr[i] === obj) {
            return true;
        }
    }
    return false;
}

/*大文件copy*/
module.exports.copy = copy;
function copy(src, dst,callback) {
    var s=fs.createReadStream(src);
    var d=fs.createWriteStream(dst);
    s.pipe(d);
    d.on('finish', function() {
        if(callback) callback();
    });
}

/*小文件copy*/
module.exports.copyMini = copyMini;
function copyMini(src, dst) {
    fs.writeFileSync(dst, fs.readFileSync(src));
}

/*遍历文件夹返回文件数组——支持递归*/
module.exports.searchDir = searchDir;
function searchDir(dir, callback) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return callback(err);
        var pending = list.length;
        if (!pending) return callback(null, results);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    if(path.basename(file) != dirName){
                        searchDir(file, function(err, res) {
                            results = results.concat(res);
                            if (!--pending) callback(null, results);
                        });
                    }else{
                        console.log('过滤了非法目录 ' + file);
                        var txt='<p class="tips info ignore">过滤了非法目录 '+file+'</p>';
                        $('.log-box').append(txt);
                        if (!--pending) callback(null, results);
                    }
                } else {
                    /*过滤不对的格式文件*/
                    if(imageinfo(fs.readFileSync(file))){
                        results.push({
                            path : file,
                            stat : stat
                        });
                    }
                    if (!--pending) callback(null, results);
                }
            });
        });
    });
};

/*打开选择文件（多文件）*/
function openFolderByFiles(){
    dialog.showOpenDialog({
        filters: [
            { name: 'Image Files', extensions: ['jpg', 'png', 'gif'] }
        ],
        // properties: ['openFile','openDirectory','multiSelections','createDirectory']
        properties: ['openFile','multiSelections']
    }, function (fileNames) {
        if(fileNames&&fileNames.length>0){
            beforeSize=0;/*压缩前的总体积（包括多图）*/
            afterSize=0;/*压缩后的总体积*/
            $('.log-box,.end-log-box').html('');/*清空log框*/
            var txt='<p class="tips head">文件上传中，请稍后！</p>';
            $('.log-box').append(txt);
            if(!isDeal){
                if(fileNames) {
                    rightDealFile=0;
                    beforeTime=new Date().getTime();
                    fileCount=fileNames.length;
                    // 获取文件信息
//                    fileNames.forEach(function (file) {
//                        fileArray.push({
//                            path : file
//                        });
//                    });
                    for(var x=0;x<fileCount;x++){
                        $('.log-box').append('<p class="log-item active" id="item-'+x+'"><span class="img-name">'+path.basename(fileNames[x])+'</span><span class="img-info">（文件上传处理中 ...）</span><i class="img-ico"></i></p>');
                        $('.log-box').scrollTop((x+1)*41);
                        fileArray.push({
                            path : fileNames[x],
                            id:x
                        });
                    }
                    fileCount=fileArray.length;
                    console.log('图片处理中！');
                    dealCount=fileCount;
                    file_deal();
                }
            }else{
                console.log('当前有图片正在处理，请稍后！');
            }
        }
    })
}

/*打开选择文件夹目录*/
function openFolderByDir(){
    dialog.showOpenDialog({
        filters: [
            { name: 'Image Files', extensions: ['jpg', 'png', 'gif'] }
        ],
        // properties: ['openFile','openDirectory','multiSelections','createDirectory']
        properties: ['openFile','multiSelections','openDirectory']
    }, function (fileNames) {
        if(fileNames&&fileNames.length>0){
            if(!isDeal){
                rightDealFile=0;
                beforeSize=0;/*压缩前的总体积（包括多图）*/
                afterSize=0;/*压缩后的总体积*/
                beforeTime=new Date().getTime();
                $('.log-box,.end-log-box').html('');/*清空log框*/
                //var txt='<p class="tips head">文件处理中<span class="dotting"></span></p>';
                //$('.log-box').append(txt);
                if(fileNames) {
                    searchDir(fileNames[0], function(err, results) {
                        if (err){
                            console.log(err);
                            return false;
                        }else{
                            fileArray=results;
                            fileCount=fileArray.length;

                            console.log('图片处理中！');
                            console.log(fileArray);
                            dealCount=fileCount;
                            file_deal();
                        }
                    });
                }
            }else{
                console.log('当前有图片正在处理，请稍后！');
            }
        }
    })
}


/*递归删除文件*/
deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};


/*处理完毕后的执行函数：主要是给发生错误的时候用的结束控制*/
function overDone(){
    fileArray=[];
    dealCount=fileCount=percentAll=percentCur=0;
    isDeal=false;
    try{
        for(var i =0; i < tempDirArray.length; i++){
//            deleteFolderRecursive(tempDir);
            deleteFolderRecursive(tempDirArray[i]);
        }
    }catch (e){
        console.log(e);
        $('.end-log-box').prepend('<p class="tips info">警告：删除临时目录！(可忽略)</p>');
    }
    $('.end-log-box').prepend('<p class="tips done">此批文件处理完毕！</p>');
    if((!$('body').hasClass('hide-drop'))){
        $('body').addClass('hide-drop');
    }
    $('.log-box .head').remove();
}

/*获取本地网络域，如tencent.com，可以判断是否在公司内部的网络
* 需兼容mac命令，目前还没兼容
* */
function getDomain(callback){
    exec('ifconfig -a',{encoding: 'utf8'},function (error, stdout, stderr) {
        if(error){
            console.log(error);
            return;
        }
        var lines_detail=[];
        var lines = stdout.split('\n');
        for(var i=0;i<lines.length;i++){
            var line_detail=lines[i].split(' ').pop().replace(/(^s*)|(s*$)/g, "").replace(/[\r\n]/g,"");/*最后去空格去掉换行符*/
            lines_detail.push(line_detail);
            if(line_detail === hostname){
                domain=lines[i+1].split(' ').pop().replace(/(^s*)|(s*$)/g, "").replace(/[\r\n]/g,"");
            }
        }
        console.log(lines_detail);
        if(callback) callback();
    });
}

function setAjax(o){
    var urlStr = "http://zhitu.isux.us/index.php/preview/clientinfo";
    var data = new FormData();
    data.append('name', o.name);
    data.append('hostname', o.hostname);
    data.append('domain', o.domain);
    data.append('ip', o.ip);
    data.append('date', o.date);
    data.append('type', o.type);
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4 && request.status==200){
            try {
                var resp = JSON.parse(request.response);
            } catch (e){
                var resp = {
                    status: 'error',
                    data: 'Unknown error occurred: [' + request.responseText + ']'
                };
            }
            console.log(resp);
        }
    };
    request.addEventListener("error", function(){console.log("error")}, false);
    request.addEventListener("abort", function(){console.log("abort")}, false);
    request.open('POST', urlStr);
    request.send(data);
}

function ip(){
    var ifaces = os.networkInterfaces();
    var ip='127.0.0.1';
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                ip=iface.address;
            } else {
                // this interface has only one ipv4 adress
                ip=iface.address;
            }
            ++alias;
        });
    });
    return ip;
}
