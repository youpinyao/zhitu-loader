/*
 * 数据的逻辑操作 函数
 * @author colorcai
 * @update 2016/3/15
 * edit: 2016/10/28 添加了重新处理上一批文件的功能
 */

// var qualitySelect = {/*质量选择,每次在默认质量上减少，比如选q1就是默认质量减去80*/
//   q1 : (4*20),
//   q2 : (3*20),
//   q3 : (2*20),
//   q4 : (1*20),
//   q5 : 0,
//   q6 : -15
// };

var qualityNum = process.env.ZHITU_QUALITY || 0;
const {
  makeDir,
  contains,
  copy,
} = require('./function');
const {
  pngDeal,
  pngDeal_With_TypeChange,
  jpgDeal,
  jpgDeal_With_TypeChange,
  gifDeal,
  png8Deal,
} = require('./image');
const path = require('path');
const fs = require('fs');

const Img = require('./img');

var dirName = 'zhitu-des';
var webpDirName = 'webp';
var tempDirName = 'temp';
var tempDirArray = [];
var isWebp = true;
var legalImgType = ["png", "jpg", "gif", "bmp", "webp"];
var isResize = false;
var replaceFile = false;

/*数组的深度拷贝*/
function getType(o){
    var _t;
    return ((_t = typeof(o)) == "object" ? o==null && "null" || Object.prototype.toString.call(o).slice(8,-1):_t).toLowerCase();
}
function extend(destination,source){
    for(var p in source)
    {
        if(getType(source[p])=="array"||getType(source[p])=="object")
        {
            destination[p]=getType(source[p])=="array"?[]:{};
            arguments.callee(destination[p],source[p]);
        }
        else
        {
            destination[p]=source[p];
        }
    }
}

var qualitySelect = {/*质量选择,每次在默认质量上减少，比如选q1就是默认质量减去80*/
    q1 : (4*20),
    q2 : (3*20),
    q3 : (2*20),
    q4 : (1*20),
    q5 : 0,
    q6 : -15
};
/*选择了压缩率按钮之后触发*/
// $('.quality-box .quality-btn').click(function(){
//     $('.quality-box .quality-btn').removeClass('active');
//     $(this).addClass('active');
//     qualityNum = qualitySelect[$(this).attr('id')];
//     console.log(qualityNum);
//     if(isDeal || lastFileArray.length == 0) {
//         console.log('请先上传文件！');
//         // alert('请先上传文件！');
//         // return false;
//     }else{
//         file_deal(lastFileArray);
//     }
// });

/*每次更新要处理的文件数组*/
function file_add(info,file) {
    var fileItem={
        name:info.file.name,
        path:info.file.path,
        size:info.file.size,
        id:info.id/*每张图片的编号*/
    };
    fileArray.push(fileItem);
    if(fileArray.length==fileCount) {/*所有图片读取完之后才开始处理*/
        console.log('图片处理中！');
        file_deal();
    }
}

/*开始对文件数组进行处理*/
function file_deal(last,quality){

    $('body').addClass('hide-drop');
    $('.upload-progress').addClass('active');
    $('.upload-progress').show();
    buffArray=[];
    if(last){/*带last表示重新处理上一批文件*/
        beforeSize=0;/*压缩前的总体积（包括多图）*/
        afterSize=0;/*压缩后的总体积*/
        $('.log-box,.end-log-box').html('');/*清空log框*/
        var txt='<p class="tips head">文件上传中，请稍后！</p>';
        $('.log-box').append(txt);
        extend(fileArray,lastFileArray);    /*需要深度复制二维数组*/
        fileCount = dealCount = last.length;
        rightDealFile = 0;
        beforeTime=new Date().getTime();
        isDeal = true;
        console.log('now file array：');
        console.log(fileArray);
        for(var x=0;x<fileCount;x++){
            $('.log-box').append('<p class="log-item active" id="item-'+x+'"><span class="img-name">'+path.basename(fileArray[x].path)+'</span><span class="img-info">（文件上传处理中 ...）</span><i class="img-ico"></i></p>');
            //$('.log-box').scrollTop((x+1)*41);
        }
    }else{
        /*需要深度复制二维数组*/
        lastFileArray = [];
        extend(lastFileArray,fileArray);
    }
    for(var i=0;i<fileCount;i++){
        (function(index){
            fs.readFile(fileArray[index].path,function(err,buff){/*这里每张图片文件都做异步处理*/
                if(err){
                    console.log(err);
                    var txt='<p class="log-item error" id="item-'+fileArray[index].id+'"><span class="img-name">'+fileArray[index].name+'</span><span class="img-info">（读取出错-13，请检查文件类型！）</span><i class="img-ico"></i></p>';
                    //$('.log-box').append(txt);
                    if(!$('.log-box').find('#item-'+fileArray[index].id).hasClass('error')){/*如果不是error的话*/
                        $('.log-box').find('#item-'+fileArray[index].id).removeClass('active').addClass('error').html(txt);
                    }
                    if(buffArray.length==fileCount){
                        console.log(buffArray);
                        buffArray.forEach(function(o){
                            each(o.fileInfo, o.buff);
                        })
                    }
                }else{
                    //each(fileArray[index],buff);
                    var o={buff:buff,fileInfo:fileArray[index]};
                    buffArray.push(o);
                    if(buffArray.length == fileCount){/*全部填入后开始操作*/
                        //buffArray.forEach(function(o){
                        //    each(o.fileInfo, o.buff);
                        //});
                        /*2016.12.27 add*/
                        if(_max >= buffArray.length) _max = buffArray.length;
                        for(var _i = 0; _i < _max; _i++){/*第一次先处理max个文件*/
                            each(buffArray[_i].fileInfo, buffArray[_i].buff);
                        }
                        /*2016.12.27 add*/
                    }
                }
            });
        })(i);
    }

}

/*处理完每一个文件之后的计数操作*/
function dealCountNum(){
    dealCount-=1;/*每次处理完之后图片数-1*/
    rightDealFile+=1;

    /*2016.12.27 add
    * 每次处理完一张图片，动态处理下一张图片
    * */
    var _parent = $('.end-log-box');/*提示*/
    if(_parent.find('.processing-tips').length){/*提示已存在*/
        _parent.find('.processing-tips .doneNum').html(rightDealFile);
    }else{
        var str = '<p class="tips info processing-tips">已处理<span class="success doneNum">'+ rightDealFile +'</span> / 共有<span class="success">'+ fileCount +'</span>个文件</p>';
        _parent.prepend(str);
    }
    _index += 1;
    if(_index < fileCount){/*继续下一个文件*/
        each(buffArray[_index].fileInfo, buffArray[_index].buff);
    }
    /*2016.12.27 add*/

    if(dealCount<=0){/*表示当前这一批图片处理完了，才能开始下一批图片的上传*/
        /*2016.12.27 add*/
        _index = _max - 1;/*重置计数器*/
        $('.end-log-box .processing-tips').remove();
        /*2016.12.27 add*/
        overDone();
        console.log('此批图片已处理完毕');
        if(afterSize>=beforeSize) afterSize=beforeSize;
        afterTime=new Date().getTime();
        $('.end-log-box').prepend('<p class="tips info all">处理<span class="success">'+rightDealFile+'</span>个文件，共压缩了：<span class="img-size success">'+(Math.ceil(beforeSize/1024)-Math.ceil(afterSize/1024))+'K</span>，压缩率：<span class="success">'+Math.ceil((beforeSize- afterSize)/beforeSize*100)+'%</span>，用时 <span class="success">'+((afterTime-beforeTime)/1000)+'s</span>       <a class="success" id="open-dir">查看文件</a></p>');
        $('.upload-progress').removeClass('active');
        $('.tips-box.tips-succeed').show(function(){
            $('.upload-progress').hide();
            $(this).addClass('active');
        });
        window.setTimeout(function(){
            $('.tips-box.tips-succeed').hide().removeClass('active');
        },3500);
    }
}

module.exports.each = each;
/*针对每一个文件的详细操作*/
function each(info,buff, callback){
    var id=info.id;
    /*本来这里可以不用重新设置，不过为了每张图片保持独立，和image.js中同步*/
    var desDir_single,
        webpDir_single,
        tempDir_single;
    /*本来这里可以不用重新设置，不过为了每张图片保持独立，和image.js中同步*/

    if(replaceFile){/*替换原图*/
        desDir  = desDir_single =path.dirname(info.path)+path.sep;/*最终目录*/
        webpDir = webpDir_single=path.dirname(info.path)+path.sep+webpDirName+path.sep;/*最终目录*/
        tempDir = tempDir_single=path.dirname(info.path)+path.sep+tempDirName+path.sep;/*临时目录*/
    }else{/*生成目标目录*/
        desDir  = desDir_single =path.dirname(info.path)+path.sep+dirName+path.sep;/*最终目录*/
        webpDir = webpDir_single=path.dirname(info.path)+path.sep+dirName+path.sep+webpDirName+path.sep;/*最终目录*/
        tempDir = tempDir_single=path.dirname(info.path)+path.sep+dirName+path.sep+tempDirName+path.sep;/*临时目录*/
    }
    if(tempDirArray.indexOf(tempDir_single) < 0){/*临时目录集合*/
        tempDirArray.push(tempDir_single);
    }
    console.log(desDir_single, tempDir_single);

    makeDir(desDir_single);
    if(isWebp) makeDir(webpDir_single);
    makeDir(tempDir_single);
    var img=new Img(info.path,id,buff);

    img.init(function(e){
        if(!contains(legalImgType,e.realExtname)) return '';/*如果后缀格式不符合图片类型*/
        else{
            var tempPath= tempDir_single + e.basename+'.'+ e.extname;/*临时文件*/
            var desPath= desDir_single + e.basename+'.'+ e.extname;/*最终文件*/
            if(e.realExtname!=e.extname) {/*后缀与真实图片格式不相符*/
                tempPath= tempDir_single +e.basename+'.'+ e.realExtname;
                desPath= desDir_single +e.basename+ '.'+ e.realExtname;
            }
            /*原图做一个备份文件，文件操作基于此备份临时文件*/
            var basename= e.basename;
            var caseType= e.is_png8()?'png8': e.realExtname;
            var that=e;
            var resize = true;
            var d;

            copy(e.path,tempPath,function(){
                d = function(){
                    switch (caseType) {/*e:源文件及对应信息接口，tempPath：临时文件（处理原型），desPath：最终保存的图片*/
                        case 'png':
                            console.log(that.basename + '----png');
                            isDeal = true;
                            /*关闭开关*/
//                        pngDeal(that, buff, tempPath, desPath, function (info) {
//                            console.log(info.basename + ' done');
//                            console.log(e.newsize);
//                            beforeSize+= e.size;
//                            afterSize+= e.newsize;
//                            //var txt='<p class="tips">文件<span class="img-name">'+info.basename+'.'+e.extname+'</span><span class="success">处理完毕！</span><span class="info">（压缩前：<span class="success">'+Math.ceil(e.size/1024)+'K</span><span class="vs">VS</span>压缩后：<span class="success">'+Math.ceil(e.newsize/1024)+'K</span>）</span></p>';
//                            var txt='<span class="img-name">'+info.basename+'.'+e.extname+'</span><span class="img-info">（原图：<span class="img-before-size">'+Math.ceil(e.size/1024)+'Kb</span>压缩后：<span class="img-after-size">'+Math.ceil(e.newsize/1024)+'Kb</span>）</span><i class="img-ico"></i>';
//                            if(!$('.log-box').find('#item-'+id).hasClass('error')){/*如果不是error的话*/
//                                $('.log-box').find('#item-'+id).removeClass('active').addClass('success').html(txt);
//                            }
//                            //$('.log-box').append(txt);
//                            dealCountNum();
//                        });
                            pngDeal_With_TypeChange(that, buff, tempPath, desPath, function (info) {
                                console.log(info.basename + ' done');
                                console.log(e.newsize);
                                // beforeSize += e.size;
                                // afterSize += e.newsize;
                                //var txt='<p class="tips">文件<span class="img-name">'+info.basename+'.'+e.extname+'</span><span class="success">处理完毕！</span><span class="info">（压缩前：<span class="success">'+Math.ceil(e.size/1024)+'K</span><span class="vs">VS</span>压缩后：<span class="success">'+Math.ceil(e.newsize/1024)+'K</span>）</span></p>';

                                // var txt = '<span class="img-name">' + info.basename + '.' + e.extname + '</span><span class="img-info">（原图：<span class="img-before-size">' + Math.ceil(e.size / 1024) + 'Kb</span>压缩后：<span class="img-after-size">' + Math.ceil(e.newsize / 1024) + 'Kb</span>）</span><i class="img-ico"></i>';
                                // if (!$('.log-box').find('#item-' + id).hasClass('error')) {/*如果不是error的话*/
                                //     $('.log-box').find('#item-' + id).removeClass('active').addClass('success').html(txt);
                                // }
                                // if (info.typeChange) {/*如果最后转换了格式*/
                                //     var txt_change = '<p class="log-item success"><span class="img-name">' + info.basename + '-jpg.jpg' + '</span><span class="img-info">（PNG：<span class="img-before-size">' + Math.ceil(e.size / 1024) + 'Kb</span>JPG：<span class="img-after-size">' + Math.ceil(info.changeSize / 1024) + 'Kb</span>）</span><i class="img-ico"></i></p>';
                                //     $('.log-box').find('#item-' + id).after(txt_change);
                                // }

                                //$('.log-box').append(txt);
                                // dealCountNum();
                                callback(info);
                            });
                            break;
                        case 'jpg':
                            console.log(that.basename + '----jpg');
                            isDeal = true;
                            /*关闭开关*/
//                        jpgDeal(that, buff, tempPath, desPath, function (info) {
//                            console.log(info.basename + ' done');
//                            console.log(e.newsize);
//                            beforeSize+= e.size;
//                            afterSize+= e.newsize;
//                            //var txt='<p class="tips">文件<span class="img-name">'+info.basename+'.'+e.extname+'</span><span class="success">处理完毕！</span><span class="info">（压缩前：<span class="success">'+Math.ceil(e.size/1024)+'K</span><span class="vs">VS</span>压缩后：<span class="success">'+Math.ceil(e.newsize/1024)+'K</span>）</span></p>';
//                            var txt='<span class="img-name">'+info.basename+'.'+e.extname+'</span><span class="img-info">（原图：<span class="img-before-size">'+Math.ceil(e.size/1024)+'Kb</span>压缩后：<span class="img-after-size">'+Math.ceil(e.newsize/1024)+'Kb</span>）</span><i class="img-ico"></i>';
//                            if(!$('.log-box').find('#item-'+id).hasClass('error')){/*如果不是error的话*/
//                                $('.log-box').find('#item-'+id).removeClass('active').addClass('success').html(txt);
//                            }
//                            //$('.log-box').append(txt);
//                            dealCountNum();
//                        });
                            jpgDeal_With_TypeChange(that, buff, tempPath, desPath, function (info) {
                                console.log(info.basename + ' done');
                                console.log(e.newsize);
                                // beforeSize += e.size;
                                // afterSize += e.newsize;
                                //var txt='<p class="tips">文件<span class="img-name">'+info.basename+'.'+e.extname+'</span><span class="success">处理完毕！</span><span class="info">（压缩前：<span class="success">'+Math.ceil(e.size/1024)+'K</span><span class="vs">VS</span>压缩后：<span class="success">'+Math.ceil(e.newsize/1024)+'K</span>）</span></p>';
                                // var txt = '<span class="img-name">' + info.basename + '.' + e.extname + '</span><span class="img-info">（原图：<span class="img-before-size">' + Math.ceil(e.size / 1024) + 'Kb</span>压缩后：<span class="img-after-size">' + Math.ceil(e.newsize / 1024) + 'Kb</span>）</span><i class="img-ico"></i>';
                                // if (!$('.log-box').find('#item-' + id).hasClass('error')) {/*如果不是error的话*/
                                //     $('.log-box').find('#item-' + id).removeClass('active').addClass('success').html(txt);
                                // }
                                // if (info.typeChange) {/*如果最后转换了格式*/
                                //     var txt_change = '<p class="log-item success"><span class="img-name">' + info.basename + '-png.png' + '</span><span class="img-info">（JPG：<span class="img-before-size">' + Math.ceil(e.size / 1024) + 'Kb</span>PNG：<span class="img-after-size">' + Math.ceil(info.changeSize / 1024) + 'Kb</span>）</span><i class="img-ico"></i></p>';
                                //     $('.log-box').find('#item-' + id).after(txt_change);
                                // }
                                //$('.log-box').append(txt);
                                // dealCountNum();
                                callback(info);
                            });
                            break;
                        case 'gif':
                            console.log(that.basename + '----gif');
                            isDeal = true;
                            /*关闭开关*/
                            gifDeal(that, buff, tempPath, desPath, function (info) {
                                console.log(info.basename + ' done');
                                console.log(e.newsize);
                                // beforeSize += e.size;
                                // afterSize += e.newsize;
                                //var txt='<p class="tips">文件<span class="img-name">'+info.basename+'.'+e.extname+'</span><span class="success">处理完毕！</span><span class="info">（压缩前：<span class="success">'+Math.ceil(e.size/1024)+'K</span><span class="vs">VS</span>压缩后：<span class="success">'+Math.ceil(e.newsize/1024)+'K</span>）</span></p>';
                                // var txt = '<span class="img-name">' + info.basename + '.' + e.extname + '</span><span class="img-info">（原图：<span class="img-before-size">' + Math.ceil(e.size / 1024) + 'Kb</span>压缩后：<span class="img-after-size">' + Math.ceil(e.newsize / 1024) + 'Kb</span>）</span><i class="img-ico"></i>';
                                // if (!$('.log-box').find('#item-' + id).hasClass('error')) {/*如果不是error的话*/
                                //     $('.log-box').find('#item-' + id).removeClass('active').addClass('success').html(txt);
                                // }
                                //$('.log-box').append(txt);
                                // dealCountNum();
                                callback(info);
                            });
                            break;
                        case 'png8':
                            console.log(that.basename + '----png8');
                            isDeal = true;
                            /*关闭开关*/
                            png8Deal(that, buff, tempPath, desPath, function (info) {
                                console.log(info.basename + ' done');
                                // beforeSize += e.size;
                                // afterSize += e.newsize;
                                //var txt='<p class="tips">文件<span class="img-name">'+info.basename+'.'+e.extname+'</span><span class="success">处理完毕！</span><span class="info">（压缩前：<span class="success">'+Math.ceil(e.size/1024)+'K</span><span class="vs">VS</span>压缩后：<span class="success">'+Math.ceil(e.newsize/1024)+'K</span>）</span></p>';
                                // var txt = '<span class="img-name">' + info.basename + '.' + e.extname + '</span><span class="img-info">（原图：<span class="img-before-size">' + Math.ceil(e.size / 1024) + 'Kb</span>压缩后：<span class="img-after-size">' + Math.ceil(e.newsize / 1024) + 'Kb</span>）</span><i class="img-ico"></i>';
                                // if (!$('.log-box').find('#item-' + id).hasClass('error')) {/*如果不是error的话*/
                                //     $('.log-box').find('#item-' + id).removeClass('active').addClass('success').html(txt);
                                // }
                                //$('.log-box').append(txt);
                                // dealCountNum();
                                callback(info);
                            });
                            break;
                    }
                };
                if(isResize) {
                    console.log('进行裁剪：');
                    var w = $('#cut_w').attr('value');
                    var h = $('#cut_h').attr('value');
                    if(w == '' || parseInt(w) > e.width) w = e.width;
                    if(h == '' || parseInt(h) > e.height) h = e.height;
                    if(isRatio){/*若选择等比*/
                        e.resize(tempPath, tempPath, w, h, function(){
                            d();
                        });
                    }else{/*缩放居中裁剪*/
                        e.crop(tempPath, tempPath, w, h, function(){
                            d();
                        });
                    }
                }else{
                    console.log('不需要裁剪：');
                        d();
                }
            });
        }
    });

}



/*如果页面被关闭了，就发送app被关闭的请求*/
// window.onbeforeunload =function(){
//     if(isRefresh){/*当前是刷新*/
//         /*不鸟他*/
//     }
//     else{/*当前是关闭,发请求*/
//             window.localStorage.setItem('loginActive', false);
//             setAjax({
//                 name:rtx,
//                 hostname:hostname,
//                 domain:domain,
//                 date:Date(),
//                 ip:ip,
//                 type:2
//             });
//     }
// };
