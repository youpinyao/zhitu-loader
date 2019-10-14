//img.js
var fs = require('fs'),
    im = require('imagemagick'),
    pngcrush = require('pngcrush'),
    pngquant = require('pngquant'),
    paths = require('path'),/*文件路径处理*/
    imageinfo = require('imageinfo');/*获取图片真实格式*/

var jpegquality = require('jpegquality');/*获取jpg质量*/


/*获取png是否有alpha通道

 使用方法：这个不太精确，只检测alpha通道，没有检测是否alpha为1还是0.
 对于半透明图片是返回true，对于不带半透明但是png32的也返回true

 var hasAlpha = require('png-has-alpha');

 var buf = fs.readFileSync(that.path);
 console.log('是否带了alpha: %s', hasAlpha(buf) ? 'yes' : 'no');

 */

/*获取png是否有alpha通道

 这个方法是自己改造过的，比较可靠一些，判断了aplha通道的值

 * */
var palette = require('image-palette');



/*  以下两api可用于png压缩，这里主要用来png8压缩，
 上面的png8压缩有bug
 */
var Imagemin = require('imagemin');
var imageminPngquant = require('imagemin-pngquant');
var gulpRename = require("gulp-rename");
//var imageminGifsicle = require('imagemin-gifsicle');
var imageminWebp = require('imagemin-webp');


module.exports = Img;
function Img(path,imgID,buff){
    var id=imgID ? imgID : 0;/*透传一个id进来，实在没办法，为了获取到发生error文件的那一行log*/
    var info={};
    var src=path;
    var color_num=0;
    var that=this;
    var compressArr = {"61":10, "62":10, "63":10, "64":10, "65":10, "66":10, "67":20, "68":20, "69":30, "70":30,
        "71":30, "72":40, "73":40, "74":40, "75":40, "76":40, "77":40, "78":40, "79":40, "80":40,
        "81":40, "82":50, "83":50, "84":55, "85":55, "86":60, "87":60, "88":65, "89":65, "90":65,
        "91":70, "92":70, "93":75, "94":80, "95":85, "96":85, "97":90, "98":95, "99":99, "100":99
    };
    var getOriCompress=function($ori_qua){
        if($ori_qua<61) return 10;
        else return compressArr[$ori_qua];
    };

    /*
     * 暴露的外部变量
     */
    this.path='';

    /*
     * 暴露的外部接口
     */
    /*图片颜色值*/
    this.colorNum = function(){};
    /*是否半透明*/
    this.is_alpha = function(){};
    /*是否png8*/
    this.is_png8 = function(){};
    /*图片原质量*/
    this.quality = function(){};
    /*pngquant有损压缩图片*/
    this.png_quant=function(){};
    /*png_crush无损压缩图片*/
    this.png_crush=function(){};
    /*转换格式-带压缩率*/
    this.imgConvert=function(){};
    /*格式转换-不带压缩率*/
    this.typeConvert = function(){};
    /*转换格式 png8*/
    this.to_png8=function(){};
    /*jpg转成渐进式格式展示(建议图片size大于10K时候转),这里好像默认做了压缩，待查明*/
    this.jpg_mode_progressive=function(){};
    /*png8压缩*/
    this.png8=function(){};
    /*gif压缩*/
    this.gif_quant=function(){};
    /*生成webp*/
    this.to_webp=function(){};
    /*裁剪图片*/
    this.resize=function(){};
    /*裁剪图片*/
    this.crop=function(){};

    this.getQuality=function(){};

    this.init=function(callback){

        /*先检查文件是否符合要求*/
        //if(imageinfo(fs.readFileSync(src))){
        console.log(imageinfo(buff).mimeType);
        if(imageinfo(buff)){
            that.realExtname=(imageinfo(buff).format).toLocaleLowerCase().replace(/jpeg/,'jpg');/*真实格式,类似png,jpeg*/
        }else{
            console.log('文件' + src + '发生错误');
            var img_name=paths.basename(src,'.'+paths.extname(src).replace(/./,'').replace(/jpeg/,'jpg'));
            //var txt='<p class="tips error">文件<span class="img-name">'+img_name+'</span><span class="">出错，请检查文件类型！</span></p>';
            var txt='<span class="img-name">'+img_name+'</span><span class="img-info">出错-01，请检查文件类型！</span><i class="img-ico"></i>';
            $('.log-box').find('#item-'+id).removeClass('active').addClass('error').html(txt);
            //$('.log-box').append(txt);
            dealCount-=1;/*每次处理完之后图片数-1*/
            if(dealCount==0){
                //overDone();
            }
            dealCountNum();
            return false;
        }


        /*获取图片信息和图片颜色值*/
        im.identify(src, function (err, features){
            if (err){
                console.log(err);
                console.log('文件' + src + '发生错误');
//                errorTips('文件发生错误，请检查文件类型');
                var img_name=paths.basename(src,'.'+paths.extname(src).replace(/./,'').replace(/jpeg/,'jpg'));
                //var txt='<p class="tips error">文件<span class="img-name">'+img_name+'</span><span class="">出错，请检查文件类型！</span></p>';
                var txt='<span class="img-name">'+img_name+'</span><span class="img-info">出错-02，请检查文件类型！</span><i class="img-ico"></i>';
                $('.log-box').find('#item-'+id).removeClass('active').addClass('error').html(txt);
                //$('.log-box').append(txt);
                dealCount-=1;/*每次处理完之后图片数-1*/

                if(dealCount==0){
                    //overDone();
                }
                dealCountNum();
                return false;
            }else{
                im.identify(['-format', '%k', src], function(err, colorNum){
                    if (err) {
                        console.log('文件' + src + '发生错误');
//                        errorTips('文件发生错误，请检查文件类型');
                        var img_name=paths.basename(src,'.'+paths.extname(src).replace(/./,'').replace(/jpeg/,'jpg'));
                        //var txt='<p class="tips error">文件<span class="img-name">'+img_name+'</span><span class="">出错，请检查文件类型！</span></p>';
                        var txt='<span class="img-name">'+img_name+'</span><span class="img-info">出错-03，请检查文件类型！</span><i class="img-ico"></i>';
                        $('.log-box').find('#item-'+id).removeClass('active').addClass('error').html(txt);
                        //$('.log-box').append(txt);
                        dealCount-=1;/*每次处理完之后图片数-1*/

                        if(dealCount==0){
                            //overDone();
                        }
                        dealCountNum();
                        return false;
                    }
                    /*重置暴露接口*/
                    exports(features,colorNum);
                    /*判断半透明之后执行回调函数*/
                    var ext=paths.extname(src).replace(/./,'').replace(/jpeg/,'jpg');
                    if(ext=='png'||ext=='PNG'){
                        if(that.area < 1000000){/*大图不做处理*/
                            palette(src, function (colors,is_alpha) {
                                that.has_alpha=is_alpha;
                                callback(that);
                            });
                        }else{
                            that.has_alpha=false;
                            callback(that);
                        }
                    }else{
                        that.has_alpha=false;
                        callback(that);
                    }
                });
            }
        });
    };

    var exports=function(o,colors){
        info=o;
        color_num=colors;
        /*重置暴露属性*/
        that.path=src;
        that.size=fs.statSync(that.path).size;
//        console.log('file size:' + that.size);
        that.newsize=0;
        that.width=info.width;
        that.height=info.height;
        that.area=that.width*that.height;
        that.extname=paths.extname(that.path).replace(/./,'').replace(/jpeg/,'jpg');/*可见格式，类似png,jpeg*/
        that.basename=paths.basename(that.path,'.'+that.extname);/*文件名不含格式*/
        that.has_alpha=false;
        that.getQuality=function(){
            if(that.extname=='jpg' || that.extname=='jpeg' || that.extname=='JPG' || that.extname=='JPEG'){
                try{
                    //var data=fs.readFileSync(that.path);
                    var data=buff;
                    var buf = new Buffer(data);
                    var result = parseInt(jpegquality(buf));
                    if(result==0) return 75;
                    else{
                        return result;
                    }
                }
                catch(e){
                    console.log(e);
                    return 0
                }
            }else{
                return 0;
            }
        };

//        RGBaster.colors(that.path, {
//            paletteSize: that.width*that.height,
//            success: function(payload) {
        // payload.dominant是主色，RGB形式表示
        // payload.secondary是次色，RGB形式表示
        // payload.palette是调色板，含多个主要颜色，数组
//                console.log(payload.dominant);
//                console.log(payload.secondary);
//                console.log(payload.palette);
//                console.log(payload.palette.length);
//            }
//        });

        console.log('颜色数量：'+color_num);
        //if(imageinfo(fs.readFileSync(that.path))){
        if(imageinfo(buff)){
            that.realExtname=(imageinfo(buff).format).toLocaleLowerCase().replace(/jpeg/,'jpg');/*真实格式,类似png,jpeg*/
        }else{
            console.log('文件' + src + '发生错误');
//            errorTips('文件"'+that.basename+'"发生错误，请检查文件类型或内容');
            var img_name=paths.basename(src,'.'+paths.extname(src).replace(/./,'').replace(/jpeg/,'jpg'));
            //var txt='<p class="tips error">文件<span class="img-name">'+img_name+'</span><span class="">出错，请检查文件类型！</span></p>';
            var txt='<span class="img-name">'+img_name+'</span><span class="img-info">出错-04，请检查文件类型！</span><i class="img-ico"></i>';
            $('.log-box').find('#item-'+id).removeClass('active').addClass('error').html(txt);
            //$('.log-box').append(txt);
            dealCount-=1;/*每次处理完之后图片数-1*/

            if(dealCount==0){
                //overDone();
            }
            dealCountNum();
            return false;
        }
        if(that.realExtname!=that.extname){/*文件后缀与真实类型不符合*/
            var img_name=paths.basename(src,'.'+paths.extname(src).replace(/./,'').replace(/jpeg/,'jpg'));
            //var txt='<p class="tips info">警告：文件<span class="img-name">'+img_name+'</span><span class="">后缀与真实文件类型不符合！</span></p>';
            var txt='<span class="img-name">'+img_name+'</span><span class="img-info">后缀与真实文件类型不符合！</span><i class="img-ico"></i>';
            $('.log-box').find('#item-'+id).removeClass('active').addClass('error').html(txt);
            //$('.log-box').append(txt);
        }
        that.colorNum=color_num;
        //that.quality=info.quality?(info.quality*100):0;
        that.quality=that.getQuality();
        that.quality_ps=getOriCompress(that.quality);/*程序质量对应的PS质量*/
        /*重置外露接口*/
        /*
         * imagemagick的方法
         * */

        that.is_alpha=function(){
            if(info["channel depth"].alpha){
                if(info["channel depth"].alpha=='1-bit'){
                    if(info["alpha"]){
                        return true;
                    }else{
                        return false;
                    }
                }else{
                    return true;
                }
            }else{
                return false;
            }
        };

        that.is_png8=function(){
            if(that.realExtname=='png'||that.realExtname=='PNG'){
                console.log(info.type);
                if(info.type && info.type=='Palette') return true;
                else return false;
            }else{
                return false;
            }

        };


        /*如果只有一个参数，那就是imgDes*/
        that.png_crush=function(imgSrc,imgDes,callback){
            var src,des;
            if(imgDes){/*处理缺省参数*/
                des=imgDes;
                src=imgSrc;
            }else{
                if(imgSrc){
                    des=imgSrc;
                    src=that.path;
                }else{
                    des=src=that.path;
                }
            }
            var myCrusher = new pngcrush(['-rem','alla','-reduce']);
            myCrusher.on('error',function(err){
                console.log(err);
                var img_name=paths.basename(src,'.'+paths.extname(src).replace(/./,'').replace(/jpeg/,'jpg'));
                var txt='<span class="img-name">'+img_name+'</span><span class="img-info">出错-05，请检查文件类型或重新单独上传！</span><i class="img-ico"></i>';
                $('.log-box').find('#item-'+id).removeClass('active').addClass('error').html(txt);
                dealCount-=1;/*每次处理完之后图片数-1*/

                if(dealCount==0){
                    //overDone();
                }
                dealCountNum();
                return false;
            });
            var w = fs.createWriteStream(des);
            var r = fs.createReadStream(src);
            r.pipe(myCrusher).pipe(w);
            w.on('finish', function() {
                if(callback) callback();
            });
        };

        /*有损压缩需要一个质量选择*/
        that.png_quant=function(imgSrc,imgDes,min,max,callback){
            var src,des;
            var lock = false;
            if(imgDes){/*处理缺省参数*/
                des=imgDes;
                src=imgSrc;
            }else{
                if(imgSrc){
                    des=imgSrc;
                    src=that.path;
                }else{
                    des=src=that.path;
                }
            }
            /*80-85*/
            var myQuant=new pngquant([256, '--ordered','-s1','--quality='+min+'-'+max,'--floyd=1']);
            myQuant.on('error',function(err){
                console.log(err);
                //var img_name=paths.basename(src,'.'+paths.extname(src).replace(/./,'').replace(/jpeg/,'jpg'));
                //var txt='<span class="img-name">'+img_name+'</span><span class="img-info">出错-06，PNG有损压缩出错！</span><i class="img-ico"></i>';
                //$('.log-box').find('#item-'+id).removeClass('active').addClass('error').html(txt);
                //dealCount-=1;/*每次处理完之后图片数-1*/
//
                //if(dealCount==0){
                //    overDone();
                //}
                //return false;

                if(!lock){
                    lock = true;
                    var s=fs.createReadStream(src);
                    var d=fs.createWriteStream(des);
                    s.pipe(d);
                    d.on('finish', function() {
                        if(callback) callback();
                    });
                }

            });
            var w = fs.createWriteStream(des);
            var r = fs.createReadStream(src);
            r.pipe(myQuant).pipe(w);
            w.on('finish', function() {
                if(callback && !lock) {
                    lock = true;
                    callback();
                }
            });
        };

        /*有损压缩png8*/
        that.png8=function(buf,src,des,callback){
            new Imagemin()
                .src(buf)
                .use(gulpRename(paths.basename(src)))/*拿到buff后命名文件*/
                .dest(paths.dirname(src) + paths.sep + des)
                .use(imageminPngquant({quality: '90', speed: 1}))
                //.use(Imagemin.jpegtran({progressive: true}))
                // .use(imageminWebp({quality: 75}))
                //.use(Imagemin.svgo())
                //.use(Imagemin.gifsicle({interlaced: true}))
                .run(function (err, data) {
                    if(err){
                        console.log(err);
                        var img_name=paths.basename(src,'.'+paths.extname(src).replace(/./,'').replace(/jpeg/,'jpg'));
                        //var txt='<p class="tips error">文件<span class="img-name">'+img_name+'</span><span class="">出错，请检查文件类型！</span></p>';
                        var txt='<span class="img-name">'+img_name+'</span><span class="img-info">出错-07，请检查文件类型！</span><i class="img-ico"></i>';
                        $('.log-box').find('#item-'+id).removeClass('active').addClass('error').html(txt);
                        //$('.log-box').append(txt);
                        dealCount-=1;/*每次处理完之后图片数-1*/

                        if(dealCount==0){
                            //overDone();
                        }
                        dealCountNum();
                        return false;
                    }else{
                        if(callback) {
                            callback();
                        }
                    }
                });
        };

        /*有损压缩gif*/
        that.gif_quant=function(buf,src,des,callback){
            new Imagemin()
                .src(buf)
                .use(gulpRename(paths.basename(src)))/*拿到buff后命名文件*/
                .dest(paths.dirname(src) + paths.sep + des)
//                .use(imageminGifsicle({interlaced: true}))
                .use(Imagemin.gifsicle({interlaced: true}))
                .run(function (err, data) {
                    if(err){
                        console.log(err);
                        var img_name=paths.basename(src,'.'+paths.extname(src).replace(/./,'').replace(/jpeg/,'jpg'));
                        //var txt='<p class="tips error">文件<span class="img-name">'+img_name+'</span><span class="">出错，请检查文件类型！</span></p>';
                        var txt='<span class="img-name">'+img_name+'</span><span class="img-info">出错-08，请检查文件类型！</span><i class="img-ico"></i>';
                        $('.log-box').find('#item-'+id).removeClass('active').addClass('error').html(txt);
                        //$('.log-box').append(txt);
                        dealCount-=1;/*每次处理完之后图片数-1*/

                        if(dealCount==0){
                            //overDone();
                        }
                        dealCountNum();
                        return false;
                    }else{
                        if(callback) {
                            callback();
                        }
                    }
                });
        };

        /*有损压缩webp*/
        that.to_webp=function(buf,src,des,callback){
            new Imagemin()
                .src(buf)
                .use(gulpRename(paths.basename(src)))/*拿到buff后命名文件*/
                .dest(des)
                .use(imageminWebp({quality: 80}))
                .run(function (err, data) {
                    if(err){
                        console.log(err);
                        var img_name=paths.basename(src,'.'+paths.extname(src).replace(/./,'').replace(/jpeg/,'jpg'));
                        //var txt='<p class="tips error">文件<span class="img-name">'+img_name+'</span><span class="">出错，请检查文件类型！</span></p>';
                        var txt='<span class="img-name">'+img_name+'</span><span class="img-info">出错-09，请检查文件类型！</span><i class="img-ico"></i>';
                        $('.log-box').find('#item-'+id).removeClass('active').addClass('error').html(txt);
                        //$('.log-box').append(txt);
                        dealCount-=1;/*每次处理完之后图片数-1*/

                        if(dealCount==0){
                            //overDone();
                        }
                        dealCountNum();
                        return false;
                    }else{
                        if(callback) {
                            callback();
                        }
                    }
                });
        };

        that.imgConvert=function(src,des,quality,callback){
            if(!quality) quality=75;
            im.convert([src, '-quality', quality, des],
                function(err, stdout){
                    if (err) {
                        console.log(err);
                        var img_name=paths.basename(src,'.'+paths.extname(src).replace(/./,'').replace(/jpeg/,'jpg'));
                        //var txt='<p class="tips error">文件<span class="img-name">'+img_name+'</span><span class="">出错，请检查文件类型！</span></p>';
                        var txt='<span class="img-name">'+img_name+'</span><span class="img-info">出错-10，请检查文件类型！</span><i class="img-ico"></i>';
                        $('.log-box').find('#item-'+id).removeClass('active').addClass('error').html(txt);
                        //$('.log-box').append(txt);
                        dealCount-=1;/*每次处理完之后图片数-1*/

                        if(dealCount==0){
                            //overDone();
                        }
                        dealCountNum();
                        return false;
                    }
                    if(callback) callback();
                });
        };

        that.typeConvert = function(src, des, callback){
            im.convert([src, des],
                function(err, stdout){
                    if (err) {
                        console.log(err);
                        var img_name=paths.basename(src,'.'+paths.extname(src).replace(/./,'').replace(/jpeg/,'jpg'));
                        //var txt='<p class="tips error">文件<span class="img-name">'+img_name+'</span><span class="">出错，请检查文件类型！</span></p>';
                        var txt='<span class="img-name">'+img_name+'</span><span class="img-info">出错-11，转换格式失败！</span><i class="img-ico"></i>';
                        $('.log-box').find('#item-'+id).removeClass('active').addClass('error').html(txt);
                        //$('.log-box').append(txt);
                        dealCount-=1;/*每次处理完之后图片数-1*/

                        if(dealCount==0){
                            //overDone();
                        }
                        dealCountNum();
                        return false;
                    }
                    if(callback) callback();
                });
        };

        /*只针对非png8的图片处理，原本就是png8的图片不做这个处理*/
        that.to_png8=function(src,des,callback){
            im.convert([src, '-colors', 256, des],
                function(err, stdout){
                    if (err) {
                        console.log(err);
                        var img_name=paths.basename(src,'.'+paths.extname(src).replace(/./,'').replace(/jpeg/,'jpg'));
                        //var txt='<p class="tips error">文件<span class="img-name">'+img_name+'</span><span class="">出错，请检查文件类型！</span></p>';
                        var txt='<span class="img-name">'+img_name+'</span><span class="img-info">出错-12，请检查文件类型！</span><i class="img-ico"></i>';
                        $('.log-box').find('#item-'+id).removeClass('active').addClass('error').html(txt);
                        //$('.log-box').append(txt);
                        dealCount-=1;/*每次处理完之后图片数-1*/

                        if(dealCount==0){
                            //overDone();
                        }
                        dealCountNum();
                        return false;
                    }
                    if(callback) callback();
                });
        };


        /*裁剪图片，等比，按照小的来*/
        that.resize = function(src, des, w, h, cb){
            im.resize({
                srcPath: src,
                dstPath: des,
                width:   w,
                height:  h,
                quality: 1
            }, function(err, stdout, stderr){
                if (err) throw err;
                if(cb) cb();
                console.log('resized kittens.jpg to fit within 256x256px');
            });
        };


        /*裁剪图片，不等比，按照小的来*/
        that.crop = function(src, des, w, h, cb){
            im.crop({
                srcPath: src,
                dstPath: des,
                width:   w,
                height:  h,
                gravity: "Center",
                quality: 1
            }, function(err, stdout, stderr){
                if (err) throw err;
                if(cb) cb();
                console.log('crop kittens.jpg to fit within 256x256px');
            });
        };

    };
}

module.exports=Img;
