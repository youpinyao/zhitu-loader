/*
 * 图片处理分支 函数
 * @author colorcai
 * @update 2016/3/15
 * usage:
 */

const path = require('path');
const fs = require('fs');
const {
  makeDir,
  contains,
  copy,
} = require('./function');

var replaceFile = false;
var dirName = 'zhitu-des';
var webpDirName = 'webp';
var tempDirName = 'temp';
var tempDirArray = [];
var isWebp = true;
var legalImgType = ["png", "jpg", "gif", "bmp", "webp"];
var isResize = false;
var replaceFile = false;
var qualityNum = process.env.ZHITU_QUALITY || 0;
var isTypeChange = process.env.ZHITU_TYPECHANGE || false;



 module.exports.pngDeal = pngDeal;
function pngDeal(e,buff,tempPath,desPath,cb){
    var max=Math.floor(Math.random()*100000+1);
    var desSrc=tempPath;/*最终存储的文件，暂时先当做tempPath处理*/
    var qua=80;/*png压缩到jpg的压缩率*/
    var info={/*为了透传到函数里面去*/
        basename: e.basename,
        size: e.size,
        path: e.path,
        colorNum: e.colorNum,
//      is_alpha: e.is_alpha()
        is_alpha: e.has_alpha
    };
    var tempPngCrush=tempDir+ info.basename+'.temp-'+max+'-crush.png';
    copy(tempPath,tempPngCrush,function(){
        //e.png_crush(tempPath,tempPngCrush,function(){/*暂时关掉pngcrush压缩*/
            var tempPng=tempDir+ info.basename+'.temp-'+max+'.png';
            var tempJpg=tempDir+ info.basename+'.temp-'+max+'.jpg';
            var tempPngSize = 0,tempJpgSize = 0;
            if(!info.is_alpha){/*没有半透明像素*/
                if(info.colorNum<256 && e.area <=10000){/*to png8*/
                    e.to_png8(info.path,tempPath,function(){
                        e.png_crush(tempPath,tempPngCrush,function(){
                            copy(desSrc,desPath,function(){
                                fs.unlink(tempPath, function(err) {
                                  console.log(err);
                                });
//                                fs.unlink(tempPng, function(err) { console.log(err) });
                                fs.unlink(tempPngCrush, function(err) { console.log(err) });
                                e.newsize=fs.statSync(desPath).size;
                                if(isWebp){
                                    console.log('正在生成webp图片！');
                                    e.to_webp(buff,desPath,webpDir,function(){
                                        if(cb){
                                            cb(info);
                                        }
                                    });
                                }else{
                                    if(cb){
                                        cb(info);
                                    }
                                }
                            });
                        });
                    });
                }else{/*不转格式了直接压缩png*/
                    var qua=93;
                    if(info.colorNum > 10000) qua=90;
                    if(info.area > (1024*1024) || info.colorNum > 30000){
                        qua=90;
                        if(info.colorNum < 3000){
                            qua=92;
                        }
                    }
                    if(qualityNum != 0){/*选择了压缩质量*/
                        qua -= qualityNum;
                        if(qua <= 0) qua = 10;
                        if(qua >=100) qua = 99;
                    }
                    console.log('压缩质量1:'+qua);
                    e.png_quant(tempPngCrush,tempPng,qua-1,qua,function(){/*压缩png*/
                        console.log(2);
                        tempPngSize=fs.statSync(tempPng).size;
                        if(tempPngSize < info.size){
                            desSrc=tempPng;
                        }
                        copy(desSrc,desPath,function(){
                            fs.unlink(tempPath, function(err) { console.log(err) });
                            e.newsize=fs.statSync(desPath).size;
                            fs.unlink(tempPng, function(err) { console.log(err) });
                            fs.unlink(tempPngCrush, function(err) { console.log(err) });
                            if(isWebp){
                                console.log('正在生成webp图片！');
                                e.to_webp(buff,desPath,webpDir,function(){
                                    if(cb){
                                        cb(info);
                                    }
                                });
                            }else{
                                if(cb){
                                    cb(info);
                                }
                            }
                        });
                    });
                }
            }else{/*有半透明像素*/
                var qua2=80;
                if(info.colorNum > 10000) qua2=70;
                if(info.size > (1024*1024) || info.colorNum > 30000){
                    qua2=10;
                }
                if(qualityNum != 0){/*选择了压缩质量*/
                    qua2 -= qualityNum;
                    if(qua2 <= 0) qua2 = 10;
                    if(qua2 >=100) qua2 = 99;
                }
                console.log('压缩质量3:'+qua2);
                e.png_quant(tempPngCrush,tempPng,qua2-1,qua2,function(){/*对比原图，压缩jpg，压缩png*/
                    tempPngSize=fs.statSync(tempPng).size;
                    if(tempPngSize < info.size){
                        desSrc=tempPng;
                    }
                    copy(desSrc,desPath,function(){
                        fs.unlink(tempPath, function(err) { console.log(err) });
                        e.newsize=fs.statSync(desPath).size;
                        fs.unlink(tempPngCrush, function(err) { console.log(err) });
                        fs.unlink(tempPng, function(err) { console.log(err) });
                        if(isWebp){
                            console.log('正在生成webp图片！');
                            e.to_webp(buff,desPath,webpDir,function(){
                                if(cb){
                                    cb(info);
                                }
                            });
                        }else{
                            if(cb){
                                cb(info);
                            }
                        }
                    });
                });
            }
        //});/*暂时关掉pngcrush压缩*/
    });

}
module.exports.pngDeal_With_TypeChange = pngDeal_With_TypeChange;
function pngDeal_With_TypeChange(e,buff,tempPath,desPath,cb){

    /*本来这里可以不用重新设置，不过为了每张图片保持独立，和logic.js中同步*/
    var desDir,
        webpDir,
        tempDir;
    if(replaceFile){/*替换原图*/
        desDir =path.dirname(e.path)+path.sep;/*最终目录*/
        webpDir=path.dirname(e.path)+path.sep+webpDirName+path.sep;/*最终目录*/
        tempDir=path.dirname(e.path)+path.sep+tempDirName+path.sep;/*临时目录*/
    }else{/*生成目标目录*/
        desDir =path.dirname(e.path)+path.sep+dirName+path.sep;/*最终目录*/
        webpDir=path.dirname(e.path)+path.sep+dirName+path.sep+webpDirName+path.sep;/*最终目录*/
        tempDir=path.dirname(e.path)+path.sep+dirName+path.sep+tempDirName+path.sep;/*临时目录*/
    }
    /*本来这里可以不用重新设置，不过为了每张图片保持独立，和logic.js中同步*/

    var max=Math.floor(Math.random()*100000+1);
    var desSrc=tempPath;/*最终存储的文件，暂时先当做tempPath处理*/
    var qua=80;/*png压缩到jpg的压缩率*/
    var info={/*为了透传到函数里面去*/
        basename: e.basename,
        size: e.size,
        path: e.path,
        colorNum: e.colorNum,
//      is_alpha: e.is_alpha()
        is_alpha: e.has_alpha
    };
    var tempPngCrush=tempDir+ info.basename+'.temp-'+max+'-crush.png';
    copy(tempPath,tempPngCrush,function(){
        //e.png_crush(tempPath,tempPngCrush,function(){/*暂时关掉pngcrush压缩*/
        var tempPng=tempDir+ info.basename+'.temp-'+max+'.png';
        var tempJpg=tempDir+ info.basename+'-jpg.jpg';
        var desJpg=desDir+ info.basename+'-jpg.jpg';
        var tempPngSize = 0,tempJpgSize = 0;
        if(!info.is_alpha){/*没有半透明像素*/
            if(isTypeChange){/*判断转格式*/
                var qua_jpg=93;
                if(info.colorNum > 10000) qua_jpg=90;
                if(info.area > (1024*1024) || info.colorNum > 30000){
                    qua_jpg=90;
                    if(info.colorNum < 3000){
                        qua_jpg=92;
                    }
                }
                if(qualityNum != 0){/*选择了压缩质量*/
                    qua_jpg -= qualityNum;
                    if(qua_jpg <= 0) qua_jpg = 10;
                    if(qua_jpg >=100) qua_jpg = 99;
                }
                console.log('压缩质量jpg:'+qua_jpg);
                e.imgConvert(info.path, tempJpg, qua_jpg, function(){/*不管怎样先生成jpg，毕竟前面已经同意了*/
                    tempJpgSize = fs.statSync(tempJpg).size;
                    if(info.colorNum<256 && e.area <=10000){/*to png8*/
                        e.to_png8(info.path,tempPath,function(){
                            e.png_crush(tempPath,tempPngCrush,function(){
                                copy(desSrc,desPath,function(){
                                    fs.unlink(tempPath, function(err) { console.log(err) });
//                                fs.unlink(tempPng, function(err) { console.log(err) });
                                    fs.unlink(tempPngCrush, function(err) { console.log(err) });
                                    e.newsize=fs.statSync(desPath).size;
                                    if(tempJpgSize < e.newsize){/*保留jpg*/
                                        copy(tempJpg,desJpg,function(){
                                           fs.unlink(tempJpg);
                                           info.typeChange = true;
                                           info.changeSize = tempJpgSize;
                                            if(isWebp){
                                                console.log('正在生成webp图片！');
                                                e.to_webp(buff,desPath,webpDir,function(){
                                                    if(cb){
                                                        cb(info);
                                                    }
                                                });
                                            }else{
                                                if(cb){
                                                    cb(info);
                                                }
                                            }
                                        });
                                    }else{
                                        fs.unlink(tempJpg);
                                        info.typeChange = false;
                                        if(isWebp){
                                            console.log('正在生成webp图片！');
                                            e.to_webp(buff,desPath,webpDir,function(){
                                                if(cb){
                                                    cb(info);
                                                }
                                            });
                                        }else{
                                            if(cb){
                                                cb(info);
                                            }
                                        }
                                    }
                                });
                            });
                        });
                    }else{
                        e.png_quant(tempPngCrush,tempPng,qua_jpg-1,qua_jpg,function(){/*压缩png*/
                            console.log(22);
                            tempPngSize=fs.statSync(tempPng).size;
                            if(tempPngSize < info.size){
                                desSrc=tempPng;
                            }
                            copy(desSrc,desPath,function(){
                                fs.unlink(tempPath, function(err) { console.log(err) });
                                e.newsize=fs.statSync(desPath).size;
                                fs.unlink(tempPng, function(err) { console.log(err) });
                                fs.unlink(tempPngCrush, function(err) { console.log(err) });
                                if(tempJpgSize < e.newsize){
                                    copy(tempJpg,desJpg,function(){/*保存jpg*/
                                        fs.unlink(tempJpg);
                                        info.typeChange = true;
                                        info.changeSize = tempJpgSize;
                                        if(isWebp){
                                            console.log('正在生成webp图片！');
                                            e.to_webp(buff,desPath,webpDir,function(){
                                                if(cb){
                                                    cb(info);
                                                }
                                            });
                                        }else{
                                            if(cb){
                                                cb(info);
                                            }
                                        }
                                    });
                                }else{
                                    fs.unlink(tempJpg);
                                    info.typeChange = false;
                                    if(isWebp){
                                        console.log('正在生成webp图片！');
                                        e.to_webp(buff,desPath,webpDir,function(){
                                            if(cb){
                                                cb(info);
                                            }
                                        });
                                    }else{
                                        if(cb){
                                            cb(info);
                                        }
                                    }
                                }
                            });
                        });
                    }
                });
            }else{
                if(info.colorNum<256 && e.area <=10000){/*to png8*/
                    e.to_png8(info.path,tempPath,function(){
                        e.png_crush(tempPath,tempPngCrush,function(){
                            copy(desSrc,desPath,function(){
                                fs.unlink(tempPath, function(err) { console.log(err) });
//                                fs.unlink(tempPng, function(err) { console.log(err) });
                                fs.unlink(tempPngCrush, function(err) { console.log(err) });
                                e.newsize=fs.statSync(desPath).size;
                                if(isWebp){
                                    console.log('正在生成webp图片！');
                                    e.to_webp(buff,desPath,webpDir,function(){
                                        if(cb){
                                            cb(info);
                                        }
                                    });
                                }else{
                                    if(cb){
                                        cb(info);
                                    }
                                }
                            });
                        });
                    });
                }else{/*不转格式了直接压缩png*/
                    var qua=93;
                    if(info.colorNum > 10000) qua=90;
                    if(info.area > (1024*1024) || info.colorNum > 30000){
                        qua=90;
                        if(info.colorNum < 3000){
                            qua=92;
                        }
                    }
                    if(qualityNum != 0){/*选择了压缩质量*/
                        qua -= qualityNum;
                        if(qua <= 0) qua = 10;
                        if(qua >=100) qua = 99;
                    }
                    console.log('压缩质量1:'+qua);
                    e.png_quant(tempPngCrush,tempPng,qua-1,qua,function(){/*压缩png*/
                        console.log(2);
                        tempPngSize=fs.statSync(tempPng).size;
                        if(tempPngSize < info.size){
                            desSrc=tempPng;
                        }
                        copy(desSrc,desPath,function(){
                            fs.unlink(tempPath, function(err) { console.log(err) });
                            e.newsize=fs.statSync(desPath).size;
                            fs.unlink(tempPng, function(err) { console.log(err) });
                            fs.unlink(tempPngCrush, function(err) { console.log(err) });
                            if(isWebp){
                                console.log('正在生成webp图片！');
                                e.to_webp(buff,desPath,webpDir,function(){
                                    if(cb){
                                        cb(info);
                                    }
                                });
                            }else{
                                if(cb){
                                    cb(info);
                                }
                            }
                        });
                    });
                }
            }
        }else{/*有半透明像素*/
            var qua2=80;
            if(info.colorNum > 10000) qua2=70;
            if(info.size > (1024*1024) || info.colorNum > 30000){
                qua2=10;
            }
            if(qualityNum != 0){/*选择了压缩质量*/
                qua2 -= qualityNum;
                if(qua2 <= 0) qua2 = 10;
                if(qua2 >=100) qua2 = 99;
            }
            console.log('压缩质量4:'+qua2);
            e.png_quant(tempPngCrush,tempPng,qua2-1,qua2,function(){/*对比原图，压缩jpg，压缩png*/
                console.log('压缩图片成功...');
                tempPngSize=fs.statSync(tempPng).size;
                if(tempPngSize < info.size){
                    desSrc=tempPng;
                }
                copy(desSrc,desPath,function(){
                    console.log('复制文件中...');
                    fs.unlink(tempPath, function(err) { console.log(err) });
                    e.newsize=fs.statSync(desPath).size;
                    fs.unlink(tempPngCrush, function(err) { console.log(err) });
                    fs.unlink(tempPng, function(err) { console.log(err) });
                    if(isWebp){
                        console.log('正在生成webp图片！');
                        e.to_webp(buff,desPath,webpDir,function(){
                            if(cb){
                                cb(info);
                            }
                        });
                    }else{
                        if(cb){
                            cb(info);
                        }
                    }
                });
            });
        }
        //});/*暂时关掉pngcrush压缩*/
    });

}
module.exports.jpgDeal = jpgDeal;
function jpgDeal(e,buff,tempPath,desPath,cb){
    var max=Math.floor(Math.random()*100000+1);
    /*先确定压缩率*/
    var qua=0;
    if(e.quality > 93){/*原压缩率大于PS中的75*/
        if(e.quality >= 97){/*原质量超过90%*/
            qua=88;/*变为65%*/
        }else{
            qua=93;
        }
    }else{
        if(e.quality==0) qua=75;
        else qua= e.quality;
    }
    if(qualityNum != 0){/*选择了压缩质量*/
        qua -= qualityNum;
        if(qua <= 0) qua = 10;
        if(qua >=100) qua2 = 99;
    }
    var info={/*为了透传到函数里面去*/
        basename: e.basename,
        size: e.size,
        path: e.path,
        colorNum: e.colorNum
    };
    var desSrc=tempPath;/*最终存储的文件，暂时先当做tempPath处理*/
    if ((info.colorNum < 256 || info.area < 500) && isTypeChange){/*小图片将其转为png8*/
        e.to_png8(info.path,tempPath,function(){
            var tempcrush=tempDir+ info.basename+'.temp-'+max+'-.png';
            e.png_crush(tempPath,tempcrush,function(){
                copy(desSrc,tempcrush,function(){
                    fs.unlink(tempcrush, function(err) { console.log(err) });
                    fs.unlink(tempPath, function(err) { console.log(err) });
                    e.newsize=fs.statSync(desSrc).size;
                });
            });
        });
    }else{/*不转png8，需要对比png和jpg*/
        var tempJpg=tempDir+ info.basename+'.temp-'+max+'.jpg';
        var tempJpgSize = 0;
        var quality=qua-5;
        if(info.colorNum>10000){
            quality=qua-10;
        }
        if(info.colorNum>30000){
            quality=qua-15;
        }
        if(qualityNum != 0){/*选择了压缩质量*/
            quality -= qualityNum;
            if(quality <= 0) quality = 10;
            if(quality >=100) quality = 99;
        }
        e.imgConvert(tempPath,tempJpg,quality,function(){
            tempJpgSize=fs.statSync(tempJpg).size;
            if(tempJpgSize<=info.size){
                desSrc=tempJpg;
            }else{
                desSrc=tempPath;
            }
            copy(desSrc,desPath,function(){
                fs.unlink(tempPath, function(err) { console.log(err) });
                fs.unlink(tempJpg, function(err) { console.log(err) });
//                fs.unlink(desSrc);
                e.newsize=fs.statSync(desPath).size;
                if(isWebp){
                    console.log('正在生成webp图片！');
                    e.to_webp(buff,desPath,webpDir,function(){
                        if(cb){
                            cb(info);
                        }
                    });
                }else{
                    if(cb){
                        cb(info);
                    }
                }
            });
        });
    }
}
module.exports.jpgDeal_With_TypeChange = jpgDeal_With_TypeChange;
function jpgDeal_With_TypeChange(e,buff,tempPath,desPath,cb){

    /*本来这里可以不用重新设置，不过为了每张图片保持独立，和logic.js中同步*/
    var desDir,
        webpDir,
        tempDir;
    if(replaceFile){/*替换原图*/
        desDir =path.dirname(e.path)+path.sep;/*最终目录*/
        webpDir=path.dirname(e.path)+path.sep+webpDirName+path.sep;/*最终目录*/
        tempDir=path.dirname(e.path)+path.sep+tempDirName+path.sep;/*临时目录*/
    }else{/*生成目标目录*/
        desDir =path.dirname(e.path)+path.sep+dirName+path.sep;/*最终目录*/
        webpDir=path.dirname(e.path)+path.sep+dirName+path.sep+webpDirName+path.sep;/*最终目录*/
        tempDir=path.dirname(e.path)+path.sep+dirName+path.sep+tempDirName+path.sep;/*临时目录*/
    }
    /*本来这里可以不用重新设置，不过为了每张图片保持独立，和logic.js中同步*/

    var max=Math.floor(Math.random()*100000+1);
    /*先确定压缩率*/
    var qua=0;
    if(e.quality > 93){/*原压缩率大于PS中的75*/
        if(e.quality >= 97){/*原质量超过90%*/
            qua=88;/*变为65%*/
        }else{
            qua=93;
        }
    }else{
        if(e.quality==0) qua=75;
        else qua= e.quality;
    }
    if(qualityNum != 0){/*选择了压缩质量*/
        qua -= qualityNum;
        if(qua <= 0) qua = 10;
        if(qua >=100) qua = 99;
    }
    var info={/*为了透传到函数里面去*/
        basename: e.basename,
        size: e.size,
        path: e.path,
        colorNum: e.colorNum
    };
    var desSrc=tempPath;/*最终存储的文件，暂时先当做tempPath处理*/
    var tempcrush=tempDir+ info.basename+'.temp-'+max+'-.png';/*转格式用的png地址*/
    var descrush=desDir +e.basename+ '-png.png';/*如果最终用了的png地址*/
    var tempJpg=tempDir+ info.basename+'.temp-'+max+'.jpg';/*压缩jpg用的地址*/
    var tempJpgSize = 0;
    var tempcrushSize = 0;
    /*先生成压缩jpg*/
    console.log(qua);
    var quality=qua-5;
    if(info.colorNum>10000){
        quality=qua-10;
    }
    if(info.colorNum>30000){
        quality=qua-15;
    }
    if(qualityNum != 0){/*选择了压缩质量*/
        quality -= qualityNum;
        if(quality <= 0) quality = 10;
        if(quality >=100) quality = 99;
    }
    console.log('质量选取:'+quality);
    e.imgConvert(tempPath,tempJpg,quality,function(){
        tempJpgSize=fs.statSync(tempJpg).size;
        if(tempJpgSize < info.size){
            desSrc=tempJpg;
            e.newsize = tempJpgSize
        }else{
            desSrc=tempPath;
            e.newsize = info.size;
        }
        if(isTypeChange && e.colorNum <= 30000){/*允许转格式,jpg转png也有在颜色值少的情况下才允许转换*/
            var deal = function(){
                console.log('允许转格式代码执行：');
                e.png_crush(tempcrush,descrush,function(){/*压缩下png*/
                    var c_size = fs.statSync(descrush).size;
                    if(c_size < e.newsize){/*如果png体积小于压缩过的jpg，留着png*/
                        fs.unlink(tempcrush, function(err) { console.log(err) });
                        info.typeChange = true;
                        info.changeSize = c_size;
                    }else{/*还是用jpg，png也就不用保存了*/
                        fs.unlink(tempcrush, function(err) { console.log(err) });
                        fs.unlink(descrush, function(err) { console.log(err) });
                        info.typeChange = false;
                    }
                    copy(desSrc,desPath,function(){/*最后保存jpg并保存webp*/
                        fs.unlink(tempPath, function(err) { console.log(err) });
                        fs.unlink(tempJpg, function(err) { console.log(err) });
                        if(isWebp){
                            console.log('正在生成webp图片！');
                            e.to_webp(buff,desPath,webpDir,function(){
                                if(cb){
                                    cb(info);
                                }
                            });
                        }else{
                            if(cb){
                                cb(info);
                            }
                        }
                    });
                });
            };
            if((info.colorNum < 256)){/*转png8*/
                e.to_png8(info.path,tempcrush,function(){
                    deal();
                });
            }else{/*转png24*/
                e.typeConvert(desSrc, tempcrush, function(){
                    deal();
                });
            }
        }else{/*不允许转换格式，直接生成webp然后结束*/
            copy(desSrc,desPath,function(){/*最后保存jpg并保存webp*/
                fs.unlink(tempPath, function(err) { console.log(err) });
                fs.unlink(tempJpg, function(err) { console.log(err) });
                if(isWebp){
                    console.log('正在生成webp图片！');
                    e.to_webp(buff,desPath,webpDir,function(){
                        if(cb){
                            cb(info);
                        }
                    });
                }else{
                    if(cb){
                        cb(info);
                    }
                }
            });
        }
    });
}
module.exports.gifDeal = gifDeal;
function gifDeal(e,buff,tempPath,desPath,cb){

    /*本来这里可以不用重新设置，不过为了每张图片保持独立，和logic.js中同步*/
    var desDir,
        webpDir,
        tempDir;
    if(replaceFile){/*替换原图*/
        desDir =path.dirname(e.path)+path.sep;/*最终目录*/
        webpDir=path.dirname(e.path)+path.sep+webpDirName+path.sep;/*最终目录*/
        tempDir=path.dirname(e.path)+path.sep+tempDirName+path.sep;/*临时目录*/
    }else{/*生成目标目录*/
        desDir =path.dirname(e.path)+path.sep+dirName+path.sep;/*最终目录*/
        webpDir=path.dirname(e.path)+path.sep+dirName+path.sep+webpDirName+path.sep;/*最终目录*/
        tempDir=path.dirname(e.path)+path.sep+dirName+path.sep+tempDirName+path.sep;/*临时目录*/
    }
    /*本来这里可以不用重新设置，不过为了每张图片保持独立，和logic.js中同步*/

    var max=Math.floor(Math.random()*100000+1);
    var desSrc=tempPath;/*最终存储的文件，暂时先当做tempPath处理*/
    var tempgifQuant='tempCrush' + path.sep;
    var tempgifSize = 0;
    var info={/*为了透传到函数里面去*/
        basename: e.basename,
        size: e.size,
        path: e.path,
        colorNum: e.colorNum
    };
    e.gif_quant(buff,tempPath,tempgifQuant,function(){
        tempgifSize=fs.statSync(tempDir + tempgifQuant + info.basename + '.gif').size;
        if(tempgifSize < info.size){
            desSrc=tempDir + tempgifQuant + info.basename + '.gif';
        }
        copy(desSrc,desPath,function(){
            fs.unlink(tempPath, function(err) { console.log(err) });
            e.newsize=fs.statSync(desPath).size;
            fs.unlink(tempDir + tempgifQuant + info.basename + '.gif');
            if(cb){
                cb(info);
            }
        });
    });
}
module.exports.png8Deal = png8Deal;
function png8Deal(e,buff,tempPath,desPath,cb){

    /*本来这里可以不用重新设置，不过为了每张图片保持独立，和logic.js中同步*/
    var desDir,
        webpDir,
        tempDir;
    if(replaceFile){/*替换原图*/
        desDir =path.dirname(e.path)+path.sep;/*最终目录*/
        webpDir=path.dirname(e.path)+path.sep+webpDirName+path.sep;/*最终目录*/
        tempDir=path.dirname(e.path)+path.sep+tempDirName+path.sep;/*临时目录*/
    }else{/*生成目标目录*/
        desDir =path.dirname(e.path)+path.sep+dirName+path.sep;/*最终目录*/
        webpDir=path.dirname(e.path)+path.sep+dirName+path.sep+webpDirName+path.sep;/*最终目录*/
        tempDir=path.dirname(e.path)+path.sep+dirName+path.sep+tempDirName+path.sep;/*临时目录*/
    }
    /*本来这里可以不用重新设置，不过为了每张图片保持独立，和logic.js中同步*/

    var max=Math.floor(Math.random()*100000+1);
    var desSrc=tempPath;/*最终存储的文件，暂时先当做tempPath处理*/
    var tempPngCrush='tempCrush' + path.sep;
    var tempPngSize = 0;
    var info={/*为了透传到函数里面去*/
        basename: e.basename,
        size: e.size,
        path: e.path,
        colorNum: e.colorNum
    };
    e.png8(buff,tempPath,tempPngCrush,function(){
        tempPngSize=fs.statSync(tempDir + tempPngCrush + info.basename + '.png').size;
        if(tempPngSize < info.size){
            desSrc=tempDir + tempPngCrush + info.basename + '.png';
        }
        copy(desSrc,desPath,function(){
            fs.unlink(tempPath, function(err) { console.log(err) });
            e.newsize=fs.statSync(desPath).size;
            fs.unlink(tempDir + tempPngCrush + info.basename + '.png');
            if(isWebp){
                console.log('正在生成webp图片！');
                e.to_webp(buff,desPath,webpDir,function(){
                    if(cb){
                        cb(info);
                    }
                });
            }else{
                if(cb){
                    cb(info);
                }
            }
        });
    });
}
