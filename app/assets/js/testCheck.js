/*
 * 检测imagemagick 函数
 * @author colorcai
 * @update 2016/6/14
 * usage:
 */
function consolelog() {

}
 var cp = require('child_process');
 var fs = require('fs');
 var binDir = 'opt/ImageMagick/bin/';
 var convert_path = binDir + 'convert';
 var identify_path = binDir + 'identify';
 var shell_path = '/System/Library/CoreServices/Installer.app ';
 var shell_code = 'open -a ';
 var pkg_path = __dirname + '/pkg/ImageMagick-6.9.1-0.pkg';

 function checkBin(){
    if(fs.existsSync(convert_path) && fs.existsSync(identify_path)){
        document.getElementById('install').style.display="none";
    }else{
        shell_code += shell_path;
        shell_code += pkg_path;
        cp.exec(shell_code , function(error, stdout, stderr) {
            if (error !== null) {
              consolelog('exec error: ' + error);
            }else{

            }
        });
    }
 }
