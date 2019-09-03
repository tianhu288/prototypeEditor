/*
 * 版权所有 (C) 2015 知启蒙(ZHIQIM) 保留所有权利。
 * 
 * 指定登记&发行网站： https://www.zhiqim.com/ 欢迎加盟知启蒙，[编程有你，知启蒙一路随行]。
 *
 * 本文采用《知启蒙许可证》，除非符合许可证，否则不可使该文件！
 * 1、您可以免费使用、修改、合并、出版发行和分发，再授权软件、软件副本及衍生软件；
 * 2、您用于商业用途时，必须在原作者指定的登记网站进行实名登记；
 * 3、您在使用、修改、合并、出版发行和分发时，必须包含版权声明、许可声明，及保留原作者的著作权、商标和专利等知识产权；
 * 4、您在互联网、移动互联网等大众网络下发行和分发再授权软件、软件副本及衍生软件时，必须在原作者指定的发行网站进行发行和分发；
 * 5、您可以在以下链接获取一个完整的许可证副本。
 * 
 * 许可证链接：http://zhiqim.org/licenses/LICENSE.htm
 *
 * 除非法律需要或书面同意，软件由原始码方式提供，无任何明示或暗示的保证和条件。详见完整许可证的权限和限制。
 */
+(function(Z)
{
//BEGIN

/**
 * 图片裁切
*/
Z.ImageClipper = Z.Class.newInstance();
Z.ImageClipper.prototype = 
{
    defaults:
    {
        elem : null,
        ratio: 1,
        state : {},
        img: null,
        clipWidth: [50, 100, 150],
        save: null
    },
    
    execute: function()
    {
        this.$elem = Z.$elem(this.elem, "Z.ImageClipper");
        if (this.clipWidth == null || this.clipWidth.length == 0)
        {
            Z.alert("[Z.ImageClipper]没有设置clipWidth，或不是数组");
            return;
        }
    
        this.id = Z.random(10);
        var html = '<div id="ZImageClipper_'+this.id+'" class="z-relative" style="width:620px;height:460px;">'
                 + '    <div id="ZImageClipper_image_'+this.id+'" class="z-relative z-w400 z-h400 z-bd z-overflow-hidden z-bg-white" style="cursor:move;background-repeat: no-repeat;">'
                 + '       <div id="ZImageClipper_square_'+this.id+'" class="z-absolute z-w200 z-h200 z-bd" style="top:100px;left:100px;box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.5);"></div>'
                 + '       <div id="ZImageClipper_loading_'+this.id+'" class="z-absolute-center-middle z-w60 z-h30 z-hide">加载中...</div>'
                 + '    </div>'
                 + '    <div class="z-w400 z-h30 z-mg-t10">'
                 + '        <button type="button" class="z-button z-cyan z-w120 z-h50 zi-px20" id="ZImageClipper_upload_'+this.id+'">上传图像 </button>'
                 + '        <button type="button" class="z-button z-cyan z-w50 z-h50 zi-px30" id="ZImageClipper_zoomIn_'+this.id+'">+</button>'
                 + '        <button type="button" class="z-button z-cyan z-w50 z-h50 zi-px30" id="ZImageClipper_zoomOut_'+this.id+'">-</button>'
                 + '        <button type="button" class="z-button z-cyan z-w80 z-h50 zi-px20" id="ZImageClipper_clip_'+this.id+'">裁切</button>'
                 + '        <button type="button" class="z-button z-cyan z-w80 z-h50 zi-px20" id="ZImageClipper_save_'+this.id+'">保存</button>'
                 + '    </div>'
                 + '    <div id="ZImageClipper_clipped_'+this.id+'" class="z-absolute z-w200 z-text-center z-pd-t20 z-bd" style="top:0;right:0;height:460px;"></button>'
                 + '</div>';
                 
        this.$elem.html(html);
        this.$imageBox = this.$elem.find("#ZImageClipper_image_"+this.id);
        this.$square =  this.$elem.find("#ZImageClipper_square_"+this.id);
        this.$loading = this.$elem.find("#ZImageClipper_loading_"+this.id).show();
        
        this.image = new Image();
        Z(this.image).load(function() 
        {
            this.$loading.hide();
            this.setBackground();

            this.$imageBox.mousedown(this.onMouseDown, this).mousemove(this.onMouseMove, this);
            Z(window).mouseup(this.onMouseUp, this);
        }, this);
        this.image.src = this.img;
        
        Z("#ZImageClipper_zoomIn_"+this.id).click(this.onZoomIn, this);
        Z("#ZImageClipper_zoomOut_"+this.id).click(this.onZoomOut, this);
        
        this.$file = Z("<input id='ZImageClipper_upload_file_"+this.id+"' type='file' accept='image/jpg,image/jpeg,image/png' class='z-hide' single>");
        this.$file.appendTo("body").change(function()
        {
            var file = this.$file[0].files[0];
            var reader = new FileReader();
            reader.onload = Z.bind(function(e)
            {
                this.img = e.target.result;
                this.image.src = this.img;
            }, this);

            reader.readAsDataURL(file);
        }, this);
        
        Z("#ZImageClipper_upload_"+this.id).click(function(){this.$file[0].click();}, this);
        Z("#ZImageClipper_clip_"+this.id).click(function()
        {
            var imgData = this.getDataURL();
            var imgDiv = '';
            Z.each(this.clipWidth, function(elem){
                imgDiv += '<div class="z-w200 z-mg-b20"><img src="'+imgData+'" class="z-bd-rd50p" style="width:'+elem+'px;"><br>'+elem+' * '+elem+'</div>'
            });
            Z("#ZImageClipper_clipped_"+this.id).html(imgDiv);
        }, this);
        
        if (Z.T.isFunction(this.save)){
            Z("#ZImageClipper_save_"+this.id).click(this.save, this);
        }
    },
    
    setBackground: function()
    {
        var w =  parseInt(this.image.width) * this.ratio;
        var h =  parseInt(this.image.height) * this.ratio;

        var pw = (400 - w) / 2;
        var ph = (400 - h) / 2;

        this.$imageBox.css({
            "background-image": "url(" + this.image.src + ")",
            "background-size": w +"px " + h + "px",
            "background-position": pw + "px " + ph + "px",
            "background-repeat": "no-repeat"});
    },
    
    onMouseDown: function(e)
    {
        Z.E.stop(e);
        this.state.dragging = true;
        this.state.mouseX = e.clientX;
        this.state.mouseY = e.clientY;
    },
    
    onMouseMove: function(e)
    {
        Z.E.stop(e);
        if (!this.state.dragging)
            return;
            
        var x = e.clientX - this.state.mouseX;
        var y = e.clientY - this.state.mouseY;

        var bg = this.$imageBox.css('background-position').split(' ');

        var bgX = x + parseInt(bg[0]);
        var bgY = y + parseInt(bg[1]);

        this.$imageBox.css('background-position', bgX +'px ' + bgY + 'px');

        this.state.mouseX = e.clientX;
        this.state.mouseY = e.clientY;
    },
    
    onMouseUp: function(e)
    {
        Z.E.stop(e);
        this.state.dragging = false;
    },
    
    onZoomIn: function()
    {
        this.ratio *= 1.1;
        this.setBackground();
    },
    
    onZoomOut: function()
    {
        this.ratio *= 0.9;
        this.setBackground();
    },
    
    getDataURL: function()
    {
        var width = this.$square.offsetWidth(),
            height = this.$square.offsetHeight(),
            canvas = document.createElement("canvas"),
            dim = this.$imageBox.css('background-position').split(' '),
            size = this.$imageBox.css('background-size').split(' '),
            dx = parseInt(dim[0]) - this.$imageBox.offsetWidth()/2 + width/2,
            dy = parseInt(dim[1]) - this.$imageBox.offsetHeight()/2 + height/2,
            dw = parseInt(size[0]),
            dh = parseInt(size[1]),
            sh = parseInt(this.image.height),
            sw = parseInt(this.image.width);

        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext("2d");
        context.drawImage(this.image, 0, 0, sw, sh, dx, dy, dw, dh);
        var imageData = canvas.toDataURL('image/png');
        return imageData;
    },
    
    getBlob: function()
    {
        var imageData = this.getDataURL();
        var b64 = imageData.replace('data:image/png;base64,','');
        var binary = atob(b64);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], {type: 'image/png'});
    }
}

//END
})(zhiqim);