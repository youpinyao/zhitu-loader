async.series([/*只有上一个函数调用了callback，下一个函数才会继续被触发执行*/
    function(callback){
        e.imgConvert(tempPath,tempPng,qua,function(){/*生成临时png,jpg文件*/
            e.imgConvert(tempPath,tempJpg,(qua-5),function(){
                tempJpgSize=fs.statSync(tempJpg).size;
                callback(null, 'step1');/*接下来执行 step2*/
            });
        });
    },
    function(callback){
        e.png_crush(tempPng,tempPng2,function(){
            tempPngSize=fs.statSync(tempPng2).size;
            if(tempPngSize < info.size){/*用png和原图对比*/
                if(tempPngSize < tempJpgSize){/*用png*/
                    desSrc=tempPng2;
                }else{/*用jpg*/
                    desSrc=tempJpg;
                }
            }else{
                if(tempJpgSize < info.size){/*用jpg*/
                    desSrc=tempJpg;
                }
            }
            callback(null,'step2');/*接下来执行 result*/
        });
    }
],function(err, results){
    copy(desSrc,desPath,function(){
        fs.unlink(tempPath);
        fs.unlink(tempPng2);
        fs.unlink(tempPng);
        fs.unlink(tempJpg);
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