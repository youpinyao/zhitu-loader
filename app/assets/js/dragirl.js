/*
 * dragirl 把妹
 * @author damao
 * @update 20120327
 * usage:
 *  dragirl("#tigger"); //拖入 #tigger 显示在 #trigger
 *  dragirl("#tigger", ".showcase"); //拖入 #tigger 显示在 .showcase
 *  dragirl("#tigger", ".showcase", function (obj_callback) {
		consolelog(obj_callback.e.target.result,obj_callback.file.name,obj_callback.file.mozFullPath);
	});//回调
 */

 function consolelog() {

 }
function addGlobalStyle(id, css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) {
        return;
    }
    style = document.createElement('style');
    style.type = 'text/css';
    style.id = id;
    var hasID = document.getElementById(id);
    if (hasID) {
        hasID.innerHTML = css;
    } else {
        head.appendChild(style);
        try {
            style.innerHTML = css;
        } catch (e) {
            alert(e);
        }
    }
}

// jQuery creates it's own event object, and it doesn't have a
// dataTransfer property yet. This adds dataTransfer to the event object.

var gbStyle;

var filesArray=[];
var filesArrayObject=[];/*下载多图用的数组，带原图片得名字（因为在服务器上是以随机数命名的）*/
var filesArrayWebp=[];
jQuery.event.props.push('dataTransfer');

function dragirl(tigger, showcase, callback) {
    if (!showcase) {
        showcase = tigger;
    }
    $(tigger).bind('dragenter', false)
        .bind('dragover',function(e){
//            $(tigger).css("border","3px dashed #58a6ed");
            $('body').addClass('hover');
            $('.upload-area .title-txt').text('Release the mouse to upload files');
            e.stopPropagation();
            e.preventDefault();
        })
        .bind('dragleave',function(e){
//            $(tigger).css("border","3px dashed #a9a9a9");
            $('body').removeClass('hover');
            $('.upload-area .title-txt').text('Drop your PNGs or JPGs here!');
            e.stopPropagation();
            e.preventDefault();
        })
        .bind('drop', function (e) {
//            $(tigger).css("border","3px dashed #a9a9a9");
            $('body').removeClass('hover');
            $('.upload-area .title-txt').text('Drop your PNGs or JPGs here!');
            e.stopPropagation();
            e.preventDefault();
            beforeSize=0;/*压缩前的总体积（包括多图）*/
            afterSize=0;/*压缩后的总体积*/
            if(isDeal){/*已经有图片在处理中了*/
                consolelog('当前有图片正在处理，请稍后！');
                var txt='<p class="tips error">当前有图片正在处理，请稍候！</p>';
                $('.log-box').append(txt);
                return false;
            }else{
                $('.log-box,.end-log-box').html('');/*清空log框*/
                consolelog('图片上传中！');
                rightDealFile=0;
                beforeTime=new Date().getTime();
                var txt='<p class="tips head">文件上传中，请稍后！</p>';
                $('.log-box').append(txt);
                fileCount=e.dataTransfer.files.length;
                filesArray=[];
                dealCount=fileCount;
                jQuery.each(e.dataTransfer.files, function (index, file) {
                    if(file.type==""){/*如果不是文件，可能是目录,zip包之类的*/
                        if(!fs.statSync(file.path).isDirectory()){/*如果不是目录*/
                            consolelog('文件' + file.path + '发生错误');
                            var img_name=path.basename(file.path,'.'+path.extname(file.path).replace(/./,'').replace(/jpeg/,'jpg'));
                            //var txt='<p class="tips error">文件<span class="img-name">'+img_name+'</span><span class="">出错，请检查文件类型！</span></p>';
                            var txt='<p class="log-item error"><span class="img-name">'+img_name+'</span><span class="img-info">出错code:013，请检查文件类型！</span><i class="img-ico"></i></p>';
                            $('.log-box').append(txt);
                            dealCount-=1;/*每次处理完之后图片数-1*/
                            if(dealCount==0){
                                overDone();
                            }
                            return false;
                        }
                        /*如果是拖拽目录上传*/
                        filesHaveDirctory=true;
                        consolelog('拖拽文件夹上传');
                        searchDir(file.path, function(err, results) {
                            fileCount-=1;/*减掉本身文件夹的量1*/
                            dealCount-=1;/*减掉本身文件夹的量1*/
                            fileCount+=results.length;
                            dealCount+=results.length;
                            /*这里要过滤下文件是否为图片还有图片的格式*/
                            for(var x=0;x<results.length;x++){
                                var o={file:{}};
                                var extname=path.extname(results[x].path).replace(/./,'').replace(/jpeg/,'jpg');/*可见格式，类似png,jpeg*/
                                var basename=path.basename(results[x].path,'.'+extname);/*文件名不含格式*/
                                o.file.name=basename;
                                o.file.path=results[x].path;
                                o.file.size=results[x].stat.size;
                                o.id=x;
                                if(callback){
                                    $('.log-box').append('<p class="log-item active" id="item-'+x+'"><span class="img-name">'+o.file.name+'</span><span class="img-info">（文件上传处理中 ...）</span><i class="img-ico"></i></p>');
                                    $('.log-box').scrollTop((x+1)*41);
                                    callback(o, o.file);
                                }
                            }
                        });
                    }else{
                        var obj_callback=new Object();
                        obj_callback.file=file;
                        obj_callback.id=index;
                        if(callback){
                            $('.log-box').append('<p class="log-item active" id="item-'+index+'"><span class="img-name">'+obj_callback.file.name+'</span><span class="img-info">（文件上传处理中 ...）</span><i class="img-ico"></i></p>');
                            $('.log-box').scrollTop((index+1)*41);
                            callback(obj_callback,file);
                        }
                    }
                });
            }


        });
}


