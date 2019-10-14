/*
 * 页面交互 函数
 * @author colorcai
 * @update 2016/3/15
 * usage:
 */
function consolelog() {

}
// F5刷新
$(document).bind('keyup',function(e){
    if(e.keyCode === 116) {
        isRefresh=true;
        window.localStorage.setItem('loginActive', true);
        window.location.reload();
    }
});

/*页面交互*/
$('.btn-nav').click(function () {
    if (!$('body').hasClass('hide-setting')) {
        $('body').removeClass('show-contact');
        $('body').addClass('hide-setting');
        $(this).attr('title','收起设置');
    }else{
        $('body').removeClass('hide-setting');
        $(this).attr('title','展开设置');
    }
});
$('#contact-us').click(function () {
    if (!$('body').hasClass('show-contact')) {
        $('body').removeClass('hide-setting');
        $('.btn-nav').attr('title','展开设置');
        $('body').addClass('show-contact');
    }else{
        $('body').removeClass('show-contact');
    }
});



$('.mod-nav .logo').click(function () {//打开网站
    shell.openExternal('http://zhitu.isux.us');
});
$('.qa-link').click(function () {//打开网站
    shell.openExternal('http://zhitu.isux.us/index.php/preview/install');
});
$('.end-log-box').on('click', '#open-dir', function () {//打开压缩后的文件夹目录
    consolelog('我出发了');
    shell.showItemInFolder(desDir);
});
/*逻辑功能处理*/
/*初始化点是否生成webP*/
$('#item-chkwebP.setting-item').click(function () {
    if($('#chkwebP').attr("checked")=='checked'){
        $('#chkwebP').attr("checked", false);
        isWebp = false;
    }else{
        $('#chkwebP').attr("checked", true);
        isWebp = true;
    }
    window.localStorage.setItem('isWebP', isWebp);
    consolelog('是否生成webp:' + window.localStorage.getItem('isWebP'));
});
$('#chkwebP').change(function () {
    if ($(this).attr('checked') == undefined) {
        isWebp = false;
    } else {
        if ($(this).attr('checked') == 'checked') {
            isWebp = true;
        }
    }
    window.localStorage.setItem('isWebP', isWebp);
    consolelog('是否生成webp:' + window.localStorage.getItem('isWebP'));
});
/*初始化点是否展示log*/
$('#item-isTypeChange.setting-item').click(function () {
    if($('#isTypeChange').attr("checked")=='checked'){
        $('#isTypeChange').attr("checked", false);
        isTypeChange = false;
    }else{
        $('#isTypeChange').attr("checked", true);
        isTypeChange = true;
    }
    window.localStorage.setItem('isTypeChange', isTypeChange);
    consolelog('isTypeChange:' + window.localStorage.getItem('isTypeChange'));
});
$('#isTypeChange').change(function () {
    if ($(this).attr('checked') == undefined) {
        isTypeChange = false;
    } else {
        if ($(this).attr('checked') == 'checked') {
            isTypeChange = true;
        }
    }
    window.localStorage.setItem('isTypeChange', isTypeChange);
    consolelog('isTypeChange:' + window.localStorage.getItem('isTypeChange'));
});
$('#item-replaceFile.setting-item').click(function () {
    if($('#replaceFile').attr("checked")=='checked'){
        $('#replaceFile').attr("checked", false);
        replaceFile = false;
    }else{
        $('#replaceFile').attr("checked", true);
        replaceFile = true;
    }
    window.localStorage.setItem('replaceFile', replaceFile);
    consolelog('是否替换原图:' + window.localStorage.getItem('replaceFile'));
});
/*初始化点是否替换原图*/
$('#replaceFile').change(function () {
    if ($(this).attr('checked') == undefined) {
        replaceFile = false;
    } else {
        if ($(this).attr('checked') == 'checked') {
            replaceFile = true;
        }
    }
    window.localStorage.setItem('replaceFile', replaceFile);
    consolelog('是否替换原图:' + window.localStorage.getItem('replaceFile'));
});
$('#item-isResize.setting-item').click(function () {
    if($('#isResize').attr("checked")=='checked'){
        $('#isResize').attr("checked", false);
        isResize = false;
        $('.input-resize').hide(150);
    }else{
        $('#isResize').attr("checked", true);
        isResize = true;
        $('.input-resize').show(150);
    }
    window.localStorage.setItem('isResize', isResize);
    consolelog('是否裁剪:' + window.localStorage.getItem('isResize'));
});
/*初始化点是否替换原图*/
$('#isResize').change(function () {
    if ($(this).attr('checked') == undefined) {
        isResize = false;
        $('.input-resize').hide(150);
    } else {
        if ($(this).attr('checked') == 'checked') {
            isResize = true;
            $('.input-resize').show(150);
        }
    }
    window.localStorage.setItem('isResize', isResize);
    consolelog('是否裁剪:' + window.localStorage.getItem('isResize'));
});
/*初始化点击选择文件上传*/
$('.btn-file-select,.upload-area').click(function (event) {
    openFolderByFiles();
    event.stopPropagation();
});
/*初始化点击选择文件夹上传*/
$('.btn-dir-select').click(function (event) {
    openFolderByDir();
    event.stopPropagation();
});
/*初始化拖拽上传*/
dragirl('.drop-body', '.drop-body', file_add);

/*点击等比例裁剪*/
$('.input-wrap .ratio-link').click(function(){
    if($('.input-resize .input-wrap').hasClass('active')){
        $('.input-resize .input-wrap').removeClass('active');
        isRatio = false;
        window.localStorage.setItem('isRatio', isRatio);
    }else{
        $('.input-resize .input-wrap').addClass('active');
        isRatio = true;
        window.localStorage.setItem('isRatio', isRatio);
    }
});
/*判断input是否是数字*/
function checkNum(ele){
    var value = ele.value;
    var reg=/^[1-9]\d*$|^0$/;   // 注意：故意限制了 0321 这种格式，如不需要，直接reg=/^\d+$/;
    if(reg.test(value)==true){
        return true;
    }else{
        return false;
    }
}
$('.input-text').blur(function(){
    if(!checkNum($(this)[0])){
        $(this).attr('value','');
    }
});
