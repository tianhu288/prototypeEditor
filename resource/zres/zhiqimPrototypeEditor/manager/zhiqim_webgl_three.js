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
 * WebGL+three.js 3D动画，当前有波浪和光线球两种
*/
Z.WebGLThree = Z.Class.newInstance();
Z.WebGLThree.prototype = 
{
    defaults:
    {
        //常量
        SEPARATION: 125, 
        AMOUNTX: 35,
        AMOUNTY: 35, 
        
        //传入参数
        threePath: null,
        elem: null,
        
        //内部对象
        camera: null, 
        scene: null, 
        renderer: null, 
        particles_ware: [], 
        particles_globe: [], 
        
        //运行时
        count: 0, 
        mouseX: 0, 
        mouseY: 0, 
        windowHalfX: window.innerWidth / 2, 
        windowHalfY: window.innerHeight / 2, 
        rotation_speed: .002, 
        timeout: null
    },
    
    execute: function()
    {
        if (Z.B.mobile || Z.B.msieVer <= 9)
        {//移动端和IE9以下不支持
            return;
        }
        
        if (this.threePath == null || this.elem == null)
        {//两个参数必须，未传不处理
            return;
        }
            
        //先加载three.js，再初始化init
        this.$elem = Z.$elem(this.elem, "Z.WebGLThree");
        Z.loads(this.threePath, Z.bind(this.initWebGL, this));
    },
    
    initWebGL: function()
    {
        var animationType = Math.floor(2 * Math.random());
        if (animationType == 0)
        {//波浪
            this.initWave(); 
            this.animateWave();
        }
        else
        {//光球
            this.initGlobe(); 
            this.animateGlobe();
        }
        
        //增加事件处理
        Z(document).mousemove(this.onDocumentMouseMove, this)
                   .on("touchstart", this.onDocumentTouchStart, this)
                   .on("touchmove", this.onDocumentTouchMove, this);
        Z(window).resize(this.onWindowResize, this);
    },

    /******************************************************************************************/
    //光球
    /******************************************************************************************/
    initGlobe: function initGlobe() 
    {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1e4), 
        this.camera.position.z = 500, 
        this.scene = new THREE.Scene;
        
        for (var t = 2 * Math.PI, i = function (e) {e.beginPath(), e.arc(0, 0, 25, 0, t, true), e.fill()}, t = 2 * Math.PI, n = 0; 500 > n; n++) 
        {
            var o = new THREE.SpriteCanvasMaterial({color: 16777215, 
                                                     transparent: true, 
                                                     program: function (e) {e.beginPath(), e.arc(0, 0, .5, 0, t, true), e.fill()}});
            var particle = new THREE.Sprite(o);
            particle.position.x = 2 * Math.random() - 1;
            particle.position.y = 2 * Math.random() - 1;
            particle.position.z = 2 * Math.random() - 1;
            particle.position.normalize();
            particle.position.multiplyScalar(10 * Math.random() + 450);
            particle.scale.multiplyScalar(4 + 2 * Math.random());
            particle.material.opacity = .1;
            this.scene.add(particle);
            this.particles_globe.push(particle);
        }
        for (var n = 0; 500 > n; n++) 
        {
            var s = new THREE.Geometry;
            var r = new THREE.Vector3(2 * Math.random() - 1, 2 * Math.random() - 1, 2 * Math.random() - 1);
            r.normalize();
            r.multiplyScalar(450);
            s.vertices.push(r);
            
            var a = r.clone();
            a.multiplyScalar(.3 * Math.random() + 1), s.vertices.push(a);
            var l = new THREE.Line(s, new THREE.LineBasicMaterial({color: 16777215, opacity: .3}));
            this.scene.add(l)
        }
        this.renderer = new THREE.CanvasRenderer({alpha: true});
        this.renderer.setClearColor(0, 0);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.$elem.append(this.renderer.domElement)
    },
    
    animateGlobe: function() 
    {
        requestAnimationFrame(Z.bind(this.animateGlobe, this));
        this.renderGlobe();
    },
    
    renderGlobe: function() 
    {
        var e = Z("body:hover"), t = this.camera.position.x, i = this.camera.position.y, n = this.camera.position.z;
        if (e.length != 0 && this.timeout != null)
        {
            this.camera.position.x += .05 * (this.mouseX - this.camera.position.x);
        }
        else
        {
            this.camera.position.x = t * Math.cos(this.rotation_speed) - n * Math.sin(this.rotation_speed);
            this.camera.position.z = n * Math.cos(this.rotation_speed) + t * Math.sin(this.rotation_speed);
        }
                                          
        this.camera.position.y += .05 * (-this.mouseY + 200 - this.camera.position.y);
        this.camera.lookAt(this.scene.position);
        
        Z(document).mousemove(function () {
            this.timeout !== null && clearTimeout(this.timeout), this.timeout = setTimeout(function () {this.timeout = null}, 600)
        });
        
        for (var o = 0; o < this.particles_globe.length; o++)
        {
            var particle = this.particles_globe[o++];
            temp = 50 * Math.sin(.3 * (o + this.count)) + .5 * Math.sin(.5 * (o + this.count));
            opacity = Math.abs(temp) / 50 + .1;
            opacity > 1 && (opacity = 1);
            particle.material.opacity = opacity;
        }
        
        this.renderer.render(this.scene, this.camera);
        this.count += .1;
    },
    
    /******************************************************************************************/
    //波浪
    /******************************************************************************************/
    initWave: function() 
    {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1e4);
        this.camera.position.z = 1e3;
        this.camera.position.y = 100; 
        this.camera.position.y = 1e3; 
        
        this.scene = new THREE.Scene;
        for (var t = 2 * Math.PI, i = 0, n = 0; this.AMOUNTX > n; n++)for (var o = 0; this.AMOUNTY > o; o++)
        {
            var s = new THREE.SpriteCanvasMaterial({color: 16777215, 
                                                     transparent: true, 
                                                     program: function (e) {e.beginPath(), e.arc(0, 0, .5, 0, t, true), e.fill()}});
                                                     
            var particle = this.particles_ware[i++] = new THREE.Sprite(s);
            particle.position.x = n * this.SEPARATION - this.AMOUNTX * this.SEPARATION / 2;
            particle.position.z = o * this.SEPARATION - this.AMOUNTY * this.SEPARATION / 2;
            this.scene.add(particle), particle.material.opacity = .4;
        }
        
        this.renderer = new THREE.CanvasRenderer({alpha: true});
        this.renderer.setClearColor(0, 0);
        this.renderer.setSize(window.innerWidth, window.innerHeight); 
        this.$elem.append(this.renderer.domElement);
    },
    
    animateWave: function() 
    {
        requestAnimationFrame(Z.bind(this.animateWave, this));
        this.renderWave();
    },
    
    renderWave: function() 
    {
        this.camera.position.x += .01 * (this.mouseX - this.camera.position.x), 
        this.camera.position.y += .005 * (this.mouseY - this.camera.position.y), 
        this.camera.lookAt(this.scene.position);
        
        for (var e = 0, t = 0; this.AMOUNTX > t; t++)
        {
            for (var i = 0; this.AMOUNTY > i; i++)
            {
                var particle = this.particles_ware[e++];
                particle.position.y = 50 * Math.sin(.3 * (t + this.count)) + 50 * Math.sin(.5 * (i + this.count));
                particle.scale.x = particle.scale.y = 4 * (Math.sin(.3 * (t + this.count)) + 1) + 4 * (Math.sin(.5 * (i + this.count)) + 1);
                opacity = Math.abs(particle.position.y) / 100;
                opacity < .5 && (opacity = .5);
                opacity > 1 && (opacity = 1);
                particle.material.opacity = opacity;
            }
        }
        
        this.renderer.render(this.scene, this.camera);
        this.count += .03
    },
    
    /******************************************************************************************/
    //事件处理
    /******************************************************************************************/
    
    onWindowResize: function() 
    {//缩放
        this.windowHalfX = window.innerWidth / 2, 
        this.windowHalfY = window.innerHeight / 2, 
        this.camera.aspect = window.innerWidth / window.innerHeight, 
        this.camera.updateProjectionMatrix(), 
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    
    onDocumentMouseMove: function(e) 
    {//鼠标移动
        this.mouseX = e.clientX - this.windowHalfX, this.mouseY = e.clientY + 150;
    },
    
    onDocumentTouchStart: function(e) 
    {//iOS触摸开始
        1 === e.touches.length && (e.preventDefault(), this.mouseX = e.touches[0].pageX - this.windowHalfX, this.mouseY = -e.touches[0].pageY);
    },
    
    onDocumentTouchMove: function(e) 
    {//iOS触摸移动
        1 === e.touches.length && (e.preventDefault(), this.mouseX = e.touches[0].pageX - this.windowHalfX, this.mouseY = -e.touches[0].pageY);
    }
};

//END
})(zhiqim);