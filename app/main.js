//var app = require('app');  // 控制应用生命周期的模块。
//var BrowserWindow = require('browser-window');  // 创建原生浏览器窗口的模块

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
/*注册快捷键*/
const globalShortcut = electron.globalShortcut;

var is_Command_Q=false;

// 保持一个对于 window 对象的全局引用，不然，当 JavaScript 被 GC，
// window 会被自动地关闭
var mainWindow = null;


function createWindow() {
      // 创建浏览器窗口。
    mainWindow = new BrowserWindow({
        width: 960,
        height: 760,
        minWidth:600,
        autoHideMenuBar: true
    });

    // 加载应用的 index.html
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    // 打开开发工具
    //mainWindow.openDevTools();


    /*一直在桌面，会占用快捷键*/
//    mainWindow.setAlwaysOnTop(true);
//
    // 当 window 被关闭，这个事件会被发出
    mainWindow.on('closed', function(e) {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 但这次不是。
        mainWindow = null;

    }); 

    mainWindow.on('close',function(e){
        if (process.platform == 'darwin') {
            app.quit();
            return true;
            if(mainWindow.isMinimized()){//如果已经最小化，允许右击选择关闭
                return true;
            }else{//如果不是最小化的情况下，点击关闭将app最小化
                if(is_Command_Q){
                    is_Command_Q=false;
                    return true;
                }else{
                    e.preventDefault();
                    mainWindow.minimize();
                }
            }
        }
    });
    globalShortcut.register('Command+Q',() =>{
        is_Command_Q=true;
        app.quit();
    });
}


// 当所有窗口被关闭了，退出。
app.on('window-all-closed', function(event) {
    // 在 OS X 上，通常用户在明确地按下 Cmd + Q 之前
    // 应用会保持活动状态
    if (process.platform != 'darwin') {
        app.quit();
    }
    app.quit();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});


// 当 Electron 完成了初始化并且准备创建浏览器窗口的时候
// 这个方法就被调用
app.on('ready', function() {
    createWindow();
});