/*!
 * prototype.js
 * 原型，对象原型
 */
/********************************************
**************** 画布 Canvas ****************
********************************************/
class Canvas {
    constructor(data){
        data = data || {};
        Canvas.prototype.$prototype = data.$prototype || null;      // 0.原型对象

        this.prototypeId = data.prototypeId;                        // 1.原型id
        this.prototypeTitle = data.prototypeTitle || "未命名原型";  // 2.原型名称
        this.prototypeType = data.prototypeType || 0;               // 3.原型类型：0：通用，1：后台管理
        this.thumbUrl = data.thumbUrl || "";                        // 4.原型缩略图地址
        this.appIconUrl = data.appIconUrl || "";                    // 5.启动图标（手机端）

        this.createTime = data.createTime;                          // 6.创建时间
        this.updateTime = data.updateTime || null;                  // 7.更新时间

        this.width = data.width;                                    // 8.画布宽度缺省值
        this.height = data.height;                                  // 9.画布高度缺省值
        this.widthMin = 100;                                        // 10.画布最小宽度
        this.heightMin = 100;                                       // 11.画布最小高度
        this.canvasLeft = data.canvasLeft || 0;                     // 12.当前页面偏移left
        this.canvasTop = data.canvasTop || 0;                       // 13.当前页面偏移top
        this.widthBgScale = 5;                                      // 14.背景宽度放大比例
        this.heightBgScale = 4;                                     // 15.背景高度放大比例
        this.widthBg = this.width * this.widthBgScale;              // 16.背景宽度
        this.heightBg = this.height * this.heightBgScale;           // 17.背景高度
        this.scale = data.scale || 1;                               // 18.当前页面缩放比例
        this.scaleMin = 0.1;                                        // 19.页面最小缩放比例
        this.scaleMax = 8;                                          // 20.页面最小缩放比例
        this.screenId = data.screenId || 1;                         // 21.当前页面id

        this.showRuler = data.showRuler || true;                    // 22.是否显示标尺
        this.showLeftPanel = data.showLeftPanel || true;            // 23.是否显示左编辑区
        this.showRightPanel = data.showRightPanel || true;          // 24.是否显示右编辑区
        this.showGrid = data.showGrid || false;                     // 25.是否显示网格
        this.showLayout = data.showLayout || false;                 // 26.是否显示布局
        this.layoutRowSpace = data.layoutRowSpace || 20;            // 27.布局行间隔
        this.layoutRowHeight = data.layoutRowHeight || 180;         // 28.布局行高度
        this.layoutRowNum = data.layoutRowNum ||                    // 29.布局行数
            Math.round(this.height/(this.layoutRowSpace + this.layoutRowHeight));
        this.layoutColumnNum = data.layoutColumnNum || 3;           // 30.布局列数
        this.layoutColumnSpace = data.layoutColumnSpace || 20;      // 31.布局列间隔
        this.layoutColumnWidth = data.layoutColumnWidth ||          // 32.布局列宽度
            (this.width - (this.layoutColumnNum-1)*this.layoutColumnSpace)/3;

        this.initDone = data.initDone || false;                     // 33.是否完成初始化，首次页面加载设置画布属性
    }
}

/********************************************
*************** 页面 Screen *****************
********************************************/
class Screen {
    constructor(data){
        data = data || {};
        let $prototype = data.$prototype || null;
        let $canvas = $prototype && $prototype.canvasModel || null;
        Screen.prototype.$prototype = $prototype;                    // 0.原型对象

        this.prototypeId = data.prototypeId;                         // 1.原型id
        this.id = data.id || 0;                                      // 2.页面 id，最大值累积，唯一的数字
        this.pId = data.pId || 0;                                    // 3.页面索引值，连续的数字，从0开始
        this.title = data.title || "未命名页面";                     // 4.页面标题
        this.groupId = data.groupId || "";                           // 5.页面标题
        this.groupTitle = data.groupTitle || "未命名分组";           // 6.页面标题
        this.fileName = data.fileName || "index";                    // 7.英文标题、指定文件名
        this.thumbUrl = data.thumbUrl || null;                       // 8.页面缩略图地址
        this.editable = data.editable || 0;                          // 9.属性可编辑，不影响页面内元素：0：正常，1：不允许增减组件、删除页面、修改filename
        this.systematic = data.systematic || 0;                      // 10.系统页面，功能限定，editable 属性不可更改
        this.width = data.width || $canvas && $canvas.width;         // 11.页面宽度
        this.height = data.height || $canvas && $canvas.height;      // 12.页面高度
        this.heightAuto = data.heightAuto || false;                  // 13.页面高度
        this.linesHorizontal = data.linesHorizontal || [             // 14.水平标尺辅助线
            // {
            //     left/top:
            //     value:
            //     $line:
            // }
        ];
        this.linesVertical = data.linesVertical || [];               // 15.垂直标尺辅助线

        this.actions = data.id || [                                  // 16.绑定事件
        // {
        //     targetType: "tap",
        //     sort: 1,
        //     guid: "31a41f25-28f1-40a2-981f-fe1f0b73f39c",
        //     delay: "0",
        //     title: "Go to screen \"Screen 2\"",
        //     pageId: "2",
        //     actionId: "go-to-page",
        //     callback: false,
        //     animation: "slide",
        //     animationEasing: "Cubic.easeOut",
        //     duration: "400",
        //     quickAction: true,
        //     wizard: true
        // },
        ];
    }
    static getScreen(id) {
        for (let screen of screenList)
            if (screen.id === id)
                return screen;
    }
}

/********************************************
*************** 元素 Element ***************
********************************************/
class Element {
    constructor(data){
        data = data || {};
        Element.prototype.$prototype = data.$prototype || null;     // 0：原型对象

        /******************************************/
        /**************** 基础参数 ****************/
        /******************************************/
        this.prototypeId = data.prototypeId;                        // 1.原型id
        this.screenId = data.screenId;                              // 2.页面id
        this.id = data.id;                                          // 3：唯一id，可直接查找元素
        this.zIndex = data.zIndex || 1;                             // 4：层级
        this.title = data.title || "未命名元素";                    // 5：元素名
        this.type = data.type;                                      // 6：类型，必须指定
        this.secType = data.secType || "";                          // 7：次级类型，某些
        this.eleStatus = data.eleStatus || 1;                       // 8：当前状态
        this.thumbUrl = data.thumbUrl || null;                      // 9.缩略图地址
        this.editable = data.editable || 0;                         // 10.可编辑：0：正常，1：不可编辑，2：仅大小，3：仅位置，4：基础样式，5：仅文字内容
        this.eleKeys = data.eleKeys || "";                          // 11.关键词
        this.htmlSource = data.htmlSource || "";                    // 12.特殊类型的素材，只能用源码表示
        this.width = data.width;                                    // 13：宽
        this.height = data.height;                                  // 14：高
        this.x = this.x || 0;                                       // 15：水平偏移大小
        this.xRight = this.xRight || false;                         // 16：偏移标准：true：right，false：left，默认false
        this.y = this.y || 0;                                       // 17：垂直偏移大小
        this.yBottom = this.yBottom || false;                       // 18：偏移标准：true：bottom，false：top，默认false
        this.rotation = data.rotation || 0;                         // 19：旋转角度
        this.opacity = data.opacity || 100;                         // 20：不透明度

        this.autoSize = data.autoSize || false;                     // 21：是否自动大小
        this.locked = data.locked || false;                         // 22：是否自动大小
        this.visible = data.visible || false;                       // 23：是否显示
        this.propagateEvents = data.propagateEvents || false;       // 24：是否事件穿透

        this.libId = data.libId || "";                              // 25：所属分组id
        this.libTitle = data.libTitle || "编组";                    // 26：所属分组名称
        this.backgroundColor = data.backgroundColor || "none";      // 27：背景色

        // 20：边框（只有极少数不存在边框：text）
        this.borderWidth = data.borderWidth || 0;                   // 28：边框大小
        this.borderStyle = data.borderStyle || "solid";             // 29：边框类型
        this.borderColor = data.borderColor || "#D1D1D1";           // 30：边框填充颜色
        this.radiusTopLeft = data.radiusTopLeft || 0;               // 31：边框圆角度
        this.radiusTopRight = data.radiusTopRight || 0;             // 32：边框圆角度
        this.radiusBottomLeft = data.radiusBottomLeft || 0;         // 33：边框圆角度
        this.radiusBottomRight = data.radiusBottomRight || 0;       // 34：边框圆角度

        // 22：事件
        this.actions = data.actions || [                            // 35：绑定事件列表
            // {
            //     targetType: "tap",
            //     sort: 1,
            //     guid: "31a41f25-28f1-40a2-981f-fe1f0b73f39c",
            //     delay: "0",
            //     title: "Go to screen \"Screen 2\"",
            //     pageId: "2",
            //     actionId: "go-to-page",
            //     callback: false,
            //     animation: "slide",
            //     animationEasing: "Cubic.easeOut",
            //     duration: "400",
            //     quickAction: true,
            //     wizard: true
            // },
        ];

        // 21：蒙版
        this.enableMask = data.enableMask || false;                  // 36：是否开启蒙版
        this.mask = data.mask || [];                                 // 37：蒙版

        // 21：投影:filter:drop-shadow(1px 1px 3px rgba(0,0,0,0.5))
        this.enableShadow = data.enableShadow || false;              // 38：是否开启投影
        this.shadowColor = data.shadowColor || "rgba(0,0,0,0.5)";    // 39：投影颜色
        this.shadowX = data.shadowX || 0;                            // 40：投影x偏移
        this.shadowY = data.shadowY || 0;                            // 41：投影y偏移
        this.shadowBlur = data.shadowBlur || "rgba(0,0,0,0.5)";      // 42：投影模糊大小

        // 21：滤镜
        this.enableFilter = data.enableFilter || false;              // 43：是否开启滤镜
        this.filterBlur = data.filterBlur || 0;                      // 44：模糊
        this.filterSaturation = data.filterSaturation || 1;          // 45：饱和
        this.filterBrightness = data.filterBrightness || 1;          // 46：亮度
        this.filterContrast = data.filterContrast || 1;              // 47：对比
        this.filterGrayscale = data.filterGrayscale || 0;            // 48：灰度
        this.filterSepia = data.filterSepia || 0;                    // 49：加深
        this.filterHue = data.filterHue || 0;                        // 50：色相
        this.filterInvert = data.filterInvert || 0;                  // 51：反相

        // 21：动态特效
        this.enableTransition = data.enableTransition || false;      // 52：是否开启动态特效


        /******************************************/
        /*************** 文字：text ***************/
        /**************** 包含文字的：*************/
        /****** 矩形：rectangle、圆形：circle *****/
        /****** 形状：shape、日期：datetime *******/
        /************** 备注：remark **************/
        /******** 所有按钮、导航、选择框类型 ******/
        /******************************************/
        this.text = data.text;                                       // 53：文字内容
        this.textHeightAuto = data.textHeightAuto || false;          // 54：文字高度自动
        this.textFont = data.textFont ||
            "Microsoft YaHei,Arial,sans-serif";                      // 55：文字类型
        this.textSize = data.textSize || "16";                       // 56：文字大小
        this.textColor = data.textColor || "#444444";                // 57：文字颜色
        this.lineHeight = data.lineHeight;                           // 58：行高
        this.lineHeightAuto = data.lineHeightAuto || true;           // 59：行高是否自动
        this.letterSpacing = data.letterSpacing || 0;                // 60：文字间距
        this.textAlign = data.textAlign || "center";                 // 61：水平对齐方式
        this.verticalAlign = data.verticalAlign || "center";         // 62：垂直对齐方式
        this.textBold = data.textBold || false;                      // 63：是否粗体
        this.textItalic = data.textItalic || false;                  // 64：是否斜体
        this.textUnderLine = data.textUnderLine || false;            // 65：是否有下划线
        this.textShadowX = data.textShadowX || 0;                    // 66：文字投影偏移x
        this.textShadowY = data.textShadowY || 0;                    // 67：文字投影偏移y
        this.textShadowBlur = data.textShadowBlur || 0;              // 68：文字投影模糊

        /******************************************/
        /*************** 图片：image **************/
        /*************** 图标：icon ***************/
        /******************************************/
        this.iconClass = data.iconClass || "";                       // 69：图标样式
        this.imageSrc = data.imageSrc || {                           // 70：图片地址
            "fileId": "", "assetType": "", "name": "", "url": ""
        };
        this.imageRepeat = data.imageRepeat || false;                // 71：是否重复平铺
        this.aspectRatio = data.aspectRatio || 1;                    // 72：图片原始纵横比

        /******************************************/
        /************ 基础形状：shape *************/
        /******* 矩形、图形、三角形、菱形 ********/
        /******* 梯形、平行四边形、多边形 ********/
        /***************** 星形 ******************/
        /******************************************/
        this.shapeTypeName = data.shapeTypeName || "star";           // 73：形状类型

        /******************************************/
        /********* 水平线：horizontalLine *********/
        /********* 垂直线：verticalLine ***********/
        /******************************************/

        /******************************************/
        /********** 事件区域：actionArea **********/
        /******************************************/

        /******************************************/
        /************** 备注：remark **************/
        /******************************************/

        /******************************************/
        /*********** 内嵌网页：webview ************/
        /******************************************/
        this.url = this.url || "about:blank";                        // 74：网页地址
        this.scrollable = this.scrollable || true;                   // 75：可滚动

        /******************************************/
        /************** 源码：html ****************/
        /******************************************/
        this.html = this.html || "";                                 // 76：源码内容

        /******************************************/
        /************** 音频：audio ***************/
        /************** 视频：video ***************/
        /******************************************/
        this.audioFileWAV = this.audioFileWAV || {                   // 77：音频文件：wav
            "fileId": "", "assetType": "", "name": "", "url": ""
        };
        this.audioFileMP3 = this.audioFileMP3 || {                   // 78：音频文件：mp3
            "fileId": "", "assetType": "", "name": "", "url": ""
        };
        this.audioFileOGG = this.audioFileOGG || {                   // 79：音频文件：ogg
            "fileId": "", "assetType": "", "name": "", "url": ""
        };
        this.audioFileAAC = this.audioFileAAC || {                   // 80：音频文件：aac
            "fileId": "", "assetType": "", "name": "", "url": ""
        };
        this.videoType = this.videoType || "html5";                  // 81：视频引用类型
        this.videoFileMP4 = this.videoFileMP4 || {                   // 82：视频文件：mp4
            "fileId": "", "assetType": "", "name": "", "url": ""
        };
        this.videoFileOGG = this.videoFileOGG || {                   // 83：视频文件：ogg
            "fileId": "", "assetType": "", "name": "", "url": ""
        };
        this.videoFileWEBM = this.videoFileWEBM || {                 // 84：视频文件：webM
            "fileId": "", "assetType": "", "name": "", "url": ""
        };
        this.placeholder = this.placeholder || {                     // 85：视频封面
            "fileId": "", "assetType": "", "name": "", "url": ""
        };
        this.controls = this.controls || true;                       // 86：是否显示控制条
        this.preload = this.preload || false;                        // 87：是否预加载
        this.autoplay = this.autoplay || false;                      // 88：是否自动播放
        this.autoplayOff = this.autoplayOff || true;                 // 89：是否自动停止
        this.doLoop = this.doLoop || false;                          // 90：是否循环

        /******************************************/
        /************** 时间：dateTime ****************/
        /******************************************/
        this.dateGeneralFormat = this.dateGeneralFormat ||           // 91：显示内容：dateTime、timeDate、data、time
            "dateTime";
        this.dateFormat = this.dateFormat || "dayMonthYear";         // 92：日期显示格式：dayMonthYear、monthDayYear、yearMonthDay
        this.dayFormat = this.dayFormat || "superscript";            // 93：日显示格式：
        this.monthFormat = this.monthFormat || "long";               // 94：月显示格式：
        this.yearFormat = this.yearFormat || "long";                 // 95：年显示格式：
        this.timeFormat = this.timeFormat || "24";                   // 96：时间制式：24/12
        this.dayNameFormat = this.dayNameFormat || "long";           // 97：星期显示格式：
        this.dateSeparator = this.dateSeparator || " ";              // 98：日期分隔符

    }
}

/********************************************
 ************* 媒体 Prototype ***************
 ********************************************/
class Prototype {
    constructor(data){
        data = data || {};
        if (data.canvasModel)
            data.canvasModel.$prototype = this;
        this.canvasModel = new Canvas(data.canvasModel);                            // 画布类
        this.id = this.canvasModel.prototypeId;

        let screenList = data.screenList || [];                          // 页面列表
        let elementList =  data.elementList || [];                       // 元素列表

        // 背景定义为 PageBg List 类
        let tempScreenList = [];
        for(let screen of screenList) {
            screen.$prototype = this;
            let tempScreen = new Screen(screen);
            tempScreenList.push(tempScreen);
        }
        this.screenList = tempScreenList;

        // 素材定义为 Material 类
        let temElementList = [];
        for(let element of elementList) {
            element.$prototype = this;
            let temElement = new Element(element);
            temElementList.push(temElement);
        }
        this.elementList = temElementList;
    }
    // 初始化定义，全局变量
    static init(data) {
        data = data || Prototype.model;
        window.prototypeModel = prototypeModel = new Prototype(data);
        window.canvasModel = canvasModel = prototypeModel.canvasModel;
        window.screenList = screenList = prototypeModel.screenList;
        window.elementList = elementList = prototypeModel.elementList;
        window.screenModel = screenModel = Screen.getScreen(canvasModel.screenId) || new Screen();
    }
    // 判断原型类型，并相应处理
    static typeInit() {
        // 初始化 prototype 对象
        Prototype.init();
        return;
        // 获取，并分析原型类型
        let prototypeType = canvasModel.prototypeType;
        switch (prototypeType) {
            case 0: { // 通用原型

            } break;
            case 1: { // 后台管理
                // “首页”和“主页”
                let indexScreen = screenList[0];
                let indexId = indexScreen && indexScreen.id || 0;
                let mainScreen = screenList[1];
                let mainId = mainScreen && mainScreen.id || 0;

                // 判断“首页”和“主页”是否存在元素
                let indexEleList = [];
                let mainEleList = [];
                for (let ele of elementList) {
                    let eleScreenId = ele.screenId;
                    if (eleScreenId === indexId) {
                        indexEleList.push(ele);
                    } else if (eleScreenId === mainId) {
                        mainEleList.push(ele);
                    }
                }

                // 需要选择“新首页”或“新主页”
                let indexEleLength = indexEleList.length;
                let mainEleLength = mainEleList.length;
                if (indexEleLength > 0 && mainEleLength > 0)
                    return;

                let dialogHtml = '<div class="z-absolute z-l0 z-t0 z-r0 z-b0" style="background: rgba(0,0,0,.5);z-index: 999;">' +
                    '   <div class="z-w1000 z-h800 z-absolute z-l0 z-t0 z-r0 z-b0 z-bg-white z-mg-auto z-pd20">' +
                    '       <div class="z-px24 z-pd10 z-lh40 z-bd-b">';
                // 标题
                dialogHtml += indexEleLength === 0 ? '选择首页模板' : '选择主页模板';
                // 列表容器
                dialogHtml += '</div>' +
                    '       <div>' +
                    '       </div>';

                dialogHtml += '</div>' +
                    '</div>';
                document.body.insertAdjacentHTML("beforeend", dialogHtml);
                // 手动中断执行
                throw "\"后台管理\"原型，页面元素缺失";
            }
        }
    }
}









/********************************************
 *************** 素材工具 *******************
 ********************************************/
class MaterialTool {
    // 指定素材属性，新建媒体素材
    static newMediaMaterial(material) {
        let mid_pos = media.tool.getBgMaterialList(media.curPage).length;
        return new Material( {
            $media: media,
            mediaId: media.id,
            bid: media.curPage,
            mid: mid_pos,
            pos: mid_pos,
            type: material.targetType,
            isTable: material.isTable || 0,
            source: material.source,
            fileId: material.fileId || null,
            angle: material.angle || 0,
            reversal: material.reversal || "1 1",
            transparency: material.transparency || 100,
            groupId: "",

            color: material.color || "#000000",
            fontSize: material.fontSize || 0,
            fontFamily: material.fontFamily || "微软雅黑",
            fontItalic: material.fontItalic || 0,
            text: material.text || "",
            textY: material.textY || (material.fontSize?(material.fontSize * .830512523651123):(0)),
            textDecoration: material.textDecoration || 0,
            underlineOffset: material.underlineOffset || 0,
            underlineThickness: material.underlineThickness || 0,
            letterSpacing: material.letterSpacing || 0,
            lineHeight: material.lineHeight || 0,
            mathHeight: material.mathHeight || 0,
            singleHeight: material.singleHeight || 0,
            fontWeight: material.fontWeight || 0,
            textZoom: material.textZoom || "1 1",
            wordsList: Z.clone(material.wordsList) || null,
            textVertical: material.textVertical || 'normal',
            textAlign: material.textAlign || 'left',
            textSpecial: material.textSpecial || "normal",
            textSpecialColor: material.textSpecialColor || "#000000",
            textSpecialSize: material.textSpecialSize || -1,

            imgRadius: material.imgRadius || 0,
        });
    }
    // 通过源码，自定义类型，创建svg素材
    static createSvgMaterial(svgCode, type) {
        let mid_pos = media.tool.getBgMaterialList(media.curPage).length;
        let $svg = Z(svgCode);
        let w = $svg[0].width.baseVal;
        let h = $svg[0].height.baseVal;
        try {
            w = w.value;
            h = h.value;
        } catch (error){
            return Z.alert('该素材代码有误，请修改后尝试！');
        }
        if (!w || !h) {
            return Z.alert('该素材代码有误，请修改后尝试！');
        }
        let oldw = w;
        let oldh = h;
        let oldRatio = oldw / oldh;
        // 太大时，缩小素材；最大边为画布1/2
        if (w > media.tool.getCurBg().width/2 || h > media.tool.getCurBg().height/2){
            if (oldRatio > 1) {
                w = media.tool.getCurBg().width/2;
                h = w / oldRatio;
            } else {
                h = media.tool.getCurBg().height/2;
                w = h * oldRatio;
            }
        }
        // 太小时，放大素材；最大边为画布1/4
        if (w < media.tool.getCurBg().width/4 && h < media.tool.getCurBg().height/4){
            if (oldRatio > 1) {
                w = media.tool.getCurBg().width/4;
                h = w / oldRatio;
            } else {
                h = media.tool.getCurBg().height/4;
                w = h * oldRatio;
            }
        }
        if (oldw !== w || oldh !== h){
            $svg.attr("width").baseVal.value = w;
            $svg.attr("height").baseVal.value = h;
            svgCode = $svg.htmls();
        }
        return new Material({
            $media: media,
            mediaId: media.id,
            bid: media.curPage,
            mid: mid_pos,
            pos: mid_pos,
            type: type,
            status: 0,
            source: svgCode,
            fileId: null,
            paramKey: null,
            paramName: null,
            selected: true
        });
    }
    // 指定素材属性，新建文字素材
    static newMediaTextMaterial(text) {
        let cont = text || "双击修改文字";
        let mid_pos = media.tool.getBgMaterialList(media.curPage).length;
        media.tool.getCurBg().widthMm = parseFloat(media.tool.getCurBg().widthMm);
        let fontSize = 7;
        if (parseFloat({}.createMode) === 1)
            fontSize = 40;
        return new Material({
            $media: media,
            mediaId: media.id,
            bid: media.curPage,
            mid: mid_pos,
            pos: mid_pos,
            type: 1,
            status: 0,
            source: "",
            text: cont,
            fileId: null,
            paramKey: null,
            paramName: null,
            selected: true,
            reversal: "1 1",
            angle: 0,

            // 以下是文字特有属性
            fontSize: fontSize,
            fontFamily: "微软雅黑",
            fontItalic: 0,
            textDecoration: 0,
            letterSpacing: 0,
            mathHeight: 0,
            textZoom: "1 1",
            textAlign: 'left',
            textVertical: 'normal',
            transparency: 100,
            stroke: "#000000 0",
            textSpecial: "normal",
            textSpecialColor: "#000000",
            textSpecialSize: -1,
        });
    }
    // 新建未知的文字素材
    static createTextMaterial(text, textMid) {
        // 主方法
        textMid = parseInt(textMid);
        let fontSize = 7;
        if (parseFloat({}.createMode) === 1)
            fontSize = 40;
        let material = MaterialTool.newMediaMaterial({text: text, mid: textMid});
        material.type = 1;
        material.mid = textMid;
        material.pos = textMid;
        material.fontSize = fontSize;
        material.text = MaterialTool.textMaterialWidthReset(material);
        media.tool.addMaterial(material);
        material = media.tool.getMaterialByMid(textMid);
        //创建一个新的空白元素
        let gWrap = media.tool.createNewSvgElement();
        gWrap.insertAdjacentHTML("afterbegin",'<rect fill="rgba(0,0,0,0)" width="0" height="0"></rect>');
        media.tool.$canvasMaterial.appendChild(gWrap);           //插入页面
        media.tool.addEleEvents(gWrap);                     //添加事件
        //给素材添加基本属性
        gWrap.setAttribute("id", "svgElementSon_" + textMid);
        gWrap.setAttribute("data-mid", textMid);
        gWrap.setAttribute("data-pos", textMid);
        gWrap.setAttribute("transform", "translate(0 0) rotate(0 0 0)");

        // 调用路径返回方法，写入路径
        MaterialTool.getPathAjax(material, gWrap, 2, 1, function(material){
            MaterialTool.initWordsListFromMaterial(material);
            material.doMultiSelected();
            Const.ajaxLoadedDone();
        });
    }
    // 新增svg代码：系统素材
    static addSvgCode(svgId) {
        // 主方法，ajax 调用
        let ajax = new Z.Ajax();
        ajax.setClassName("MediaPresenter");
        ajax.setMethodName("getMediaSvg");
        ajax.addParam(svgId);
        ajax.setFailure((responseText)=> Z.failure(responseText));
        ajax.setSuccess((responseText)=> {
            // 1：定义变量
            let mediaSvg = Z.J.toObject(responseText);
            let svgCode = mediaSvg.svgCode;

            // 2：添加素材
            let materialType;
            switch (mediaSvg.catCode) {
                case 'image' : materialType = 0; break;
                case 'qcode' : materialType = 2; break;
                case 'text' : materialType = 1; break;
                case 'container' : materialType = 4; break;
                default : materialType = 3;
            }
            let svgMaterial = MaterialTool.createSvgMaterial(svgCode, materialType);
            let $target = media.tool.createSvgCodeElement(svgMaterial);
            media.tool.addMaterial(svgMaterial);
            SelectionTool.selectTheElement(svgMaterial, $target);

            // 3：选中新增素材
            SelectionTool.selectTheElement_group();
            media.selectedList.length > 1 && MaterialTool.doGroupCreate();

            // 4：保存历史
            PrototypeHistory.saveHistory();
        });
        ajax.execute();
    }
    // 新增svg代码：自定义素材
    static addSvgCodeFromMine(svgId, doUseUserMaterial) {
        if(typeof doUseUserMaterial === "function")
            doUseUserMaterial(svgId);
    }
    // 新增指定属性的图片素材/二维码,新增图片，默认保存
    static newImage(imgMaterial, notSaveNew, fun) {
        let mid_pos = media.tool.getBgMaterialList(media.curPage).length;
        let image = new Material({
            $media: media,
            mediaId: media.id,
            bid: media.curPage,
            mid: imgMaterial.mid || mid_pos,
            pos: imgMaterial.mid || mid_pos,
            type: imgMaterial.targetType || 0,
            editorable: imgMaterial.editorable || 1,
            status: 0,
            source: imgMaterial.source || "",
            fileId: imgMaterial.fileId,
            paramKey: null,
            paramName: null,
            selected: true
        });
        media.tool.createImgSvgElement(image, notSaveNew, fun);
    }
    // 添加二维码
    static addQrcode(imageUrl) {
        MaterialTool.newImage({source: imageUrl, type: 2});
    }
    // 新增容器
    static createSvgFrame($curElem) {
        let svgCode = Z($curElem).html();
        svgCode = svgCode.replace(/\n/g,"");
        svgCode = Z.S.trim(svgCode);
        let svgMaterial = MaterialTool.createSvgMaterial(svgCode, 4);         //容器
        let targ = media.tool.createSvgCodeElement(svgMaterial);
        media.tool.addMaterial(svgMaterial);

        SelectionTool.selectTheElement(svgMaterial, targ);
        PrototypeHistory.saveHistory();
    }
    // 添加表格素材模板
    static addShapeTable() {
    }
    // 新增素材到媒体media，重定义 groupId
    static addMediaMaterial(newMaterial, groupIdArr, groupIdNewArr) {
        let groupId = newMaterial.groupId;
        let tempMaterial = MaterialTool.newMediaMaterial(newMaterial);
        media.tool.createSvgGElement(tempMaterial);
        tempMaterial.groupId = groupId;
        media.tool.addMaterial(tempMaterial);
        tempMaterial.doMultiSelected();
        // 重定义 groupId
        if (!groupId)
            return;
        let newTime, newGroupId, idIndex;
        idIndex = groupIdArr.indexOf(groupId);
        if (idIndex === -1) {
            newTime = new Date().getTime();
            newGroupId = "group_" + newTime;
            while (groupIdNewArr.indexOf(newGroupId) !== -1){
                newTime++;
                newGroupId = "group_" + newTime;
            }
            groupIdArr.push(groupId);
            groupIdNewArr[groupIdArr.length - 1] = newGroupId;
            tempMaterial.groupId = newGroupId;
        } else {
            tempMaterial.groupId = groupIdNewArr[idIndex];
        }
        media.tool.getSvgElementByMid(tempMaterial.mid).setAttribute('data-groupid', tempMaterial.groupId);
    }
    // 开始形状绘制
    static shapeDrawTrigger(elem) {
        // 1：先判断是否存在钢笔编辑对象
        if (Z('#penEditorCover').hasClass('readyEdit')) {
            media.event.penEditToolDone();
        }
        // 2：默认清空操作
        EditBtnTool.frameBgDragClear();
        EditBtnTool.cutImageToolHide();
        // 3：标识形状类型
        media.event.shapeType = Z(elem).attr("data-targetType");
        // 4：分情况处理：开始还是结束
        if (Z(elem).hasClass("active"))
            MaterialTool.shapeDrawStop();
        else
            MaterialTool.shapeDrawReady(elem);
    }
    static shapeDrawStop() {
        // 1：钢笔工具编辑中，完成编辑
        if (Z('#penEditorCover.readyEdit')[0]) {
            media.event.penEditToolDone();
        }
        Z("#penTangentTool").removeClass("editPath").html('');

        // 2：通用的形状绘制，结束处理
        Z(".readyDrawing").removeClass("readyDrawing");
        Z("#side_shape .side_containerList li.active").removeClass("active");
        Z("#shapeContentMenu").hide();
        // 移除临时元素
        Z("#tempShape").remove();
    }
    static shapeDrawReady($elem) {
        // 1：样式设置

        if ($elem) {
            let drawCoverId = 'shapeEditorCover';
            let drawType = parseInt($elem.getAttribute('data-targetType'));
            Z("#side_shape .side_containerList li").removeClass("active");
            Z('.readyDrawing').removeClass('readyDrawing');
            Z($elem).addClass("active");
            if ([11, 12].indexOf(drawType) > -1){
                drawCoverId = 'penEditorCover';
            }
            Z.D.id(drawCoverId).className = 'readyDrawing';
        }
        Z("#tempShape").remove();

        // 2：插入临时节点
        let $gItem = media.tool.createNewSvgElement();
        let $svg = $gItem.querySelector("svg");
        let $gInner = $svg.querySelector("g");
        let $elemInner;
        let setView = "0 0 0 0";
        $gItem.setAttribute("id","tempShape");
        $svg.setAttribute("width","0");
        $svg.setAttribute("height","0");
        switch (media.event.shapeType) {
            case "1":
                $elemInner = '<line stroke="#28a3ef" stroke-width="2" x1="0" y1="1" x2="0" y2="1" stroke-linecap="butt" stroke-dasharray="0 0"></line>';
                break;
            case "2":
                setView = "0 0 100 100";
                $elemInner = '<path class="shape-rect-path nw" fill="#28a3ef" d="M50,0 h-50 a0,0,0,0,1,0,0 v50 h50 v-50 Z" data-radius="0" data-targetType="0"></path>';
                $elemInner += '<rect class="shape-rect-path n" x="50" y="0" fill="#28a3ef" stroke="#28a3ef" stroke-width="0" width="0" height="50"></rect>';
                $elemInner += '<path class="shape-rect-path ne" fill="#28a3ef" d="M100,50 v-50 a0,0,0,0,1,0,0 h-50 v50 h50 Z" data-radius="0" data-targetType="0"></path>';
                $elemInner += '<rect class="shape-rect-path e" x="50" y="50" fill="#28a3ef" stroke="#28a3ef" stroke-width="0" width="50" height="0"></rect>';
                $elemInner += '<path class="shape-rect-path se" fill="#28a3ef" d="M50,100 h50 a0,0,0,0,1,0,0 v-50 h-50 v50 Z" data-radius="0" data-targetType="0"></path>';
                $elemInner += '<rect class="shape-rect-path s" x="50" y="50" fill="#28a3ef" stroke="#28a3ef" stroke-width="0" width="0" height="50"></rect>';
                $elemInner += '<path class="shape-rect-path sw" fill="#28a3ef" d="M0,50 v50 a0,0,0,0,1,0,0 h50 v-50 h-50 Z" data-radius="0" data-targetType="0"></path>';
                $elemInner += '<rect class="shape-rect-path w" x="0" y="50" fill="#28a3ef" stroke="#28a3ef" stroke-width="0" width="50" height="0"></rect>';
                $elemInner += '<rect class="shape-rect-path c" x="50" y="50" fill="#28a3ef" stroke="#28a3ef" stroke-width="2" width="0" height="0"></rect>';
                break;
            case "3":
                setView = "0 0 100 100";
                $elemInner = '<path class="shape-rect-path nw" fill="#28a3ef" d="M0,50 h5 v-45 h45 v-5 h-50 v50 Z" data-radius="0" data-targetType="0"></path>';
                $elemInner += '<path class="shape-rect-path ne" fill="#28a3ef" d="M50,0 v5 h45 v45 h5 v-50 h-50 Z" data-radius="0" data-targetType="0"></path>';
                $elemInner += '<path class="shape-rect-path se" fill="#28a3ef" d="M100,50 h-5 v45 h-45 v5 h50 v-50 Z" data-radius="0" data-targetType="0"></path>';
                $elemInner += '<path class="shape-rect-path sw" fill="#28a3ef" d="M50,100 v-5 h-45 v-45 h-5 v50 h50 Z" data-radius="0" data-targetType="0"></path>';
                break;
            case "4":
                $elemInner = '<ellipse fill="#28a3ef" fill-opacity="1" stroke-opacity="1" stroke="#28a3ef" stroke-width="0" cx="0" cy="0" rx="0" ry="0" stroke-dasharray="none"></ellipse>';
                break;
            case "11":
                $elemInner = '<path fill="#ffffff" stroke="#28a3ef" stroke-width="1" d="M0,0"></path>';
                break;
            case "12":
                break;
        }
        $svg.setAttribute("viewBox",setView);
        $gInner.insertAdjacentHTML("beforeend",$elemInner);
        media.tool.$canvasMaterial.appendChild($gItem);
    }
    // 形状绘制右键菜单
    static shapeContextMenu(event) {
        Const.createContextMenu({
            "event": event,
            "elemId": "shapeContentMenu",
            "editItem": [
                ["退出绘制","MaterialTool.shapeDrawStop"],
            ],
        });
    }
    // 钢笔绘制右键菜单
    static penContextMenu(event) {
        Const.createContextMenu({
            "event": event,
            "elemId": "penContentMenu",
            "editItem": [
                ["完成绘制","media.event.penDrawDone"],
                ["取消绘制","media.event.penDrawCancel"],
            ],
        });
    }
    // 复制素材
    static copyMaterial(idObjArr) {
        // 1：获取mid、bid列表
        Const.setIdArr(idObjArr);
        let midLength = Const.midArr.length;
        if (midLength === 0)
            return;

        // 复制操作，循环处理
        let groupIdArr = [];
        let groupIdNewArr = [];
        media.tool.clearSelected();
        for (let i = 0;i < midLength;i++) {
            let material = media.tool.getMaterialByMid(Const.midArr[i], Const.bidArr[i]);
            let newMaterial = {};
            for (let item in material) {
                if (!material.hasOwnProperty(item))
                    continue;
                if (item === "source") {
                    let $g0 = Z(material[item])[0];
                    let trans = $g0.getAttribute("transform");
                    let transExp = /-?\d+(.\d+)?(\s|,)-?\d+(.\d+)?/.exec(trans)[0];
                    transExp = transExp.split(/[^-\d.]/);
                    let transX = parseFloat(transExp[0]) + 10;
                    let transY = parseFloat(transExp[1]) + 10;
                    trans = trans.replace(/translate\([^)]+\)/,"translate(" + transX + " " + transY + ")");
                    $g0.setAttribute("transform", trans);
                    newMaterial[item] = $g0.outerHTML;
                    continue;
                }
                if (item === 'wordsList') {
                    newMaterial[item] = Z.clone(material[item]);
                    continue;
                }
                newMaterial[item] = material[item];
            }
            MaterialTool.addMediaMaterial(newMaterial, groupIdArr, groupIdNewArr);
        }
        media.tool.setTempCurrent();
        // 存储历史
        SelectionTool.selectTheElement_group();
        PrototypeHistory.saveHistory();
    }
    // 素材复制-右键菜单实现
    static contextMenuCopy() {
        let ev = new Event("copy");
        document.dispatchEvent(ev);
    }
    // 素材粘贴-右键菜单实现
    static contextMenuPaste() {
        let ev = new Event("paste");
        document.dispatchEvent(ev);
    }
    // 复制素材数据
    static copyMaterialData() {
        if (media.selectedList.length <= 0)
            return;
        media.tool.tempMetabolic = [];
        let bid = media.curPage;
        for (let item of media.selectedList) {
            media.tool.tempMetabolic.push({"bid": bid, "mid": item});
        }
    }
    // 复制素材，跨版面复制
    static copyOverPage() {
        //剪切板，重新赋值
        let materialList = [];
        for (let i = 0;i < media.selectedList.length;i++) {
            let material = media.tool.getCurMaterial(i);
            let newMaterial = {};
            for (let item in material) {
                if (!material.hasOwnProperty(item))
                    continue;
                if (item === "$media"||item === "bid"||item === "fileId"||item === "immediate"||
                    item === "mediaId"||item === "mid"||item === "paramKey"||item === "paramName"||
                    item === "pos"||item === "selected"||item === "status"||item === "defaults") {
                    continue;
                }
                if (Z.T.isFunction(material[item])){
                    continue;
                }
                if (item === 'wordsList') {
                    newMaterial[item] = Z.clone(material[item]);
                    continue;
                }
                newMaterial[item] = material[item];
            }
            materialList.push(newMaterial);
        }
        let materialListStr = Z.J.toString(materialList);
        localStorage.setItem("materialListStr",materialListStr);
    }
    // 粘贴素材，跨版面粘贴
    static pasteOverPage() {
        let pasteLoading = Z.loading({
            shadow: true,
            text:"正在加载..."
        });
        let materialListStr = localStorage.getItem("materialListStr");
        let closeLoading = ()=> {
            setTimeout(function(){
                pasteLoading.close();
            },500)
        };
        if (!materialListStr) {
            return closeLoading();
        }
        // 3：循环新建/粘贴素材
        let materialList = Z.J.toObject(materialListStr);
        let groupIdArr = [];
        let groupIdNewArr = [];
        media.tool.clearSelected();
        for (let material of materialList) {
            let groupId = material.groupId;
            let material = MaterialTool.newMediaMaterial(material);
            material.groupId = groupId;
            MaterialTool.addMediaMaterial(material, groupIdArr, groupIdNewArr);
        }
        // 4：选中新素材
        SelectionTool.selectTheElement_group();
        // 5：保存历史
        PrototypeHistory.saveHistory();
        // 6：关闭加载框
        closeLoading();
    }
    // 上移素材
    static upMaterial() {
        if (media.selectedList.length === 0) {
            return;
        }
        // 正序循环
        for (let i = 0;i < media.selectedList.length;i++) {
            let material = media.tool.getCurMaterial(i);
            if (i === 0 && material.pos === 0) {// 第一个素材为置顶，则不处理
                return;
            }

            // 页面节点
            let $curElem = media.tool.getCurSvgElement(i);
            let $preElem = $curElem.previousElementSibling;
            if (!!$preElem && /^svgElementSon_/.test($preElem.id)) {
                let preMaterial = media.tool.getMaterialByMid(parseInt(Z($preElem).attr("data-mid")));
                if (preMaterial.bgMaterial)
                    continue;
                media.tool.$canvasMaterial.insertBefore($curElem, $preElem);
            } else {
                continue;
            }

            // 检查上一个素材是否删除状态，如果是则上移，否则跳出循环
            let preMaterial = media.tool.getMaterialByPos(material.pos-1, material.bid);
            while (preMaterial && preMaterial.status === 1) {
                material.doUp();
                preMaterial = media.tool.getMaterialByPos(material.pos-1, material.bid);
            }
            // 执行上移操作
            material.doUp();
        }
        PrototypeHistory.saveHistory();
    }
    // 下移素材
    static downMaterial() {
        if (media.selectedList.length === 0) {//不存在选中素材，返回
            return;
        }
        //倒序循环
        for (let i = media.selectedList.length - 1;i > -1;i--) {
            let material = media.tool.getCurMaterial(i);
            // 最后一个素材为置底，则不处理
            if (i === media.selectedList.length - 1 && material.pos === media.tool.getBgMaterialList(media.curPage).length - 1) {
                return;
            }

            // 页面节点
            let $curElem = media.tool.getCurSvgElement(i);
            let $nextElem = $curElem.nextElementSibling;
            if (!!$nextElem && /^svgElementSon_/.test($nextElem.id)) {
                media.tool.$canvasMaterial.insertBefore($nextElem, $curElem);
            } else {
                continue;
            }

            // 检查上一个素材是否删除状态，如果是则上移，否则跳出循环
            let preMaterial = media.tool.getMaterialByPos(material.pos-1, material.bid);
            while (preMaterial && preMaterial.status === 1) {
                material.doDown();
                preMaterial = media.tool.getMaterialByPos(material.pos-1, material.bid);
            }
            // 执行下移操作
            material.doDown();
        }
        PrototypeHistory.saveHistory();
    }
    // 置顶素材
    static topMaterial() {
        if (media.selectedList.length === 0) {//不存在选中素材，返回
            return;
        }
        //倒序循环
        let $canvasMaterial = media.tool.$canvasMaterial;
        let $firstElem = $canvasMaterial.querySelector('g[id^="svgElementSon_"]:not([data-bgmaterial])');
        let firstMaterial = media.tool.getMaterialByMid(parseInt($firstElem.getAttribute('data-mid')));
        for (let i = media.selectedList.length - 1;i > -1;i--) {
            let material = media.tool.getCurMaterial(i);
            while (material.pos > firstMaterial.pos){
                material.doUp();
            }
            // 更新画布
            let $curElem = media.tool.getCurSvgElement(i);
            $canvasMaterial.insertBefore($curElem, $firstElem);
        }
        PrototypeHistory.saveHistory();
    }
    // 置底素材
    static bottomMaterial() {
        if (media.selectedList.length === 0) {//不存在选中素材，返回
            return;
        }
        let length = media.tool.getBgMaterialList(media.curPage).length-1;
        //正序循环
        let $canvasMaterial = media.tool.$canvasMaterial;
        let $lastElem = $canvasMaterial.querySelector('g[id^="svgElementSon_"]:not([data-bgmaterial]):last-child');
        for (let i = 0;i < media.selectedList.length;i++) {
            let material = media.tool.getCurMaterial(i);
            let $curElem = media.tool.getCurSvgElement(i);
            if ($curElem === $lastElem)
                continue;

            while (material.pos < length){
                material.doDown();
            }
            // 更新画布
            $canvasMaterial.insertBefore($curElem, $lastElem);
            $canvasMaterial.insertBefore($lastElem, $curElem);
        }
        PrototypeHistory.saveHistory();
    }
    // 删除素材
    static deleteMaterial(noSave) {
        let selectedLength = media.selectedList.length;
        // 不存在选中素材，返回
        if (selectedLength === 0) {
            return;
        }
        // 循环删除所有
        while (media.selectedList.length > 0) {
            let material = media.tool.getCurMaterial(0);
            let $curElem = media.tool.getSvgElementByMid(material.mid);
            // 有设置参数，则取消已设置的参数列表
            if (!!material.paramKey && !!material.paramName) {
                let $paramLi = Z("#paramList li[data-param=\"" + material.paramKey + "," + material.paramName + "\"]");
                //页面呈现
                Z($paramLi).removeAttr("data-mid");
                Z($paramLi).removeAttr("data-bid");
                Z($paramLi).find(".paramList-status").removeClass("setted");
            }
            // 删除素材、元素
            material.doDelete();
            Z($curElem).remove();
        }

        media.tool.clearSelected();
        // 保存
        !noSave && PrototypeHistory.saveHistory();
        EditBtnTool.hideEditSelected(true);
    }
    // 执行素材锁定
    static doLockMaterial(event, material) {
        // 定义变量
        material = material || media.tool.tempMaterial || media.tool.getCurMaterial();
        if (!material)
            return;

        // 1：素材锁定
        material.doLock();
        // 2：编辑条样式修改
        let $lockBtn = Z('#tool_lock');
        let $iconFont = $lockBtn.find('.iconfont');
        media.tool.$toolsWrapLeft.addClass("eventDisable");
        $lockBtn.removeClass("eventDisable").siblings().addClass("eventDisable");
        $iconFont.removeClass('icon-unlock').addClass('icon-lock').addClass('z-text-orange');
        // 3：画布内样式修改
        SelectionTool.selectionTool_hide();
        if (media.selectedList.length === 1) {
            SelectionTool.selectionToolsShow("#selection_lock", media.tool.getSvgElementByMid(material.mid));
        }
    }
    // 执行素材解锁
    static unlockMaterial(event, material, $curElem) {
        // 定义变量
        material = material || media.tool.tempMaterial || media.tool.getCurMaterial();
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material)
            return;
        // 1：素材解锁
        material.unLock();
        // 2：背景属性去除
        if (material.bgMaterial) {
            material.bgMaterial = false;
            $curElem.removeAttribute('data-bgmaterial');
        }
        // 3：编辑条样式修改
        let $lockBtn = Z('#tool_lock');
        let $iconFont = $lockBtn.find('.iconfont');
        media.tool.$toolsWrapLeft.removeClass("eventDisable");
        $lockBtn.parent().find('.tool-item').removeClass("eventDisable");
        $iconFont.removeClass('icon-lock').removeClass('z-text-orange').addClass('icon-unlock');
        // 4：画布内样式修改
        SelectionTool.selectionLock_hide();
        if (media.selectedList.length === 1) {
            SelectionTool.selectTheElement(material, media.tool.getSvgElementByMid(material.mid));
        }
        // 5：刷新图层列表
        Const.loadLayerList();
    }
    // 将素材设置为“背景”
    static setBeBgMaterial(event, material, $curElem) {
        // 1：变量定义
        material = material || media.tool.tempMaterial || media.tool.getCurMaterial();
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem)
            return;

        // 2：删除当前“背景”
        let $canvasMaterial = media.tool.$canvasMaterial;
        let $bgWrap = media.tool.$canvasBg;
        if ($bgWrap.querySelector("svg")) {
            $bgWrap.removeChild($bgWrap.querySelector("svg"));
        }
        // 1.1：纯背景
        Z('#bg_color').addClass('bgNone');
        let $bgFillSvg = media.tool.createBgSvgElement();
        let bgObj = media.tool.getBg(media.curPage);
        bgObj.bgUrl = null;
        bgObj.bgMinUrl = null;
        bgObj.fileId = null;
        bgObj.source = $bgFillSvg.outerHTML;
        // 1.2：图层背景
        let $firstElem = $canvasMaterial.querySelector('g[id^="svgElementSon_"][data-bgmaterial]');
        if ($firstElem) {
            let firstMaterial = media.tool.getMaterialByMid(parseInt($firstElem.getAttribute('data-mid')));
            if (firstMaterial.bgMaterial) {
                firstMaterial.doDelete();
                Z($firstElem).remove();
            } else {
                $firstElem.removeAttribute('data-bgmaterial');
            }
        }

        // 3：节点属性设置[data-bgmaterial]
        $curElem.setAttribute('data-bgmaterial', 'bgmaterial');
        ElementUpdate.updateMaterialSource(material, $curElem);

        // 4：属性设置，执行“置底”
        material.status = 3;
        material.bgMaterial = true;
        while (material.pos > 0) {
            material.doUp();
        }

        // 5：素材节点位置“置底”
        $canvasMaterial.insertBefore($curElem, media.tool.$canvasSvg.querySelector('g[id^="svgElementSon_"]'));

        // 6：选中当前素材
        SelectionTool.selectTheElement(material, $curElem);

        // 7：保存历史
        PrototypeHistory.saveHistory();
    }
    // 素材翻转，水平、垂直翻转
    static doReversal(a, d) {
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem) {
            return;
        }
        let $gSvg = $curElem.querySelector("g");
        if (!$gSvg) {
            return;
        }

        let rA = a, rD = d;
        let gVal = $gSvg.transform.baseVal;
        let rMatrix = {"a":1, "d":1};
        for (let i = 0;i < gVal.length;i++){
            if (gVal[i].targetType === 3) {
                rMatrix = gVal[i].matrix;
            }
        }

        material.reversal = rA ? (rMatrix.a === 1 ? -1 : 1) + " " + rMatrix.d
            : rMatrix.a + " " + (rMatrix.d === 1 ? -1 : 1);

        ElementUpdate.setReversal(material, $curElem);

        ElementUpdate.updateMaterialSource(material, $curElem);
        PrototypeHistory.saveHistory();
    }
    // 添加至我的素材：判断类型参数
    static addToCollectionList() {
        // 1：定义变量
        let selectedLength = media.selectedList.length;
        if (selectedLength === 0)
            return;

        // 2：获取类型和分类
        let typeCode, svgType;
        let catCode = "";
        let doSelect = false;
        let material = media.tool.getCurMaterial();
        let theCatList = [];
        if (selectedLength === 1) {
            if (material.targetType === 0 || material.targetType === 2) {// 图片、二维码
                if (material.targetType === 0){
                    typeCode = 'qcode';
                    catCode = 'qcode';
                }
                if (material.targetType === 1){
                    typeCode = 'image';
                    catCode = 'image';
                }
                svgType = 'image';
            } else if (material.targetType === 1) {// 文字
                typeCode = 'text';
                catCode = 'text';
                svgType = 'text';
            } else if (material.targetType === 3) {// 通常 svg
                typeCode = 'image';
                doSelect = true;
                svgType = 'svg';
            } else if (material.targetType === 4) {// 容器
                typeCode = 'image';
                catCode = 'container';
                svgType = 'container';
            } else if (material.targetType === 5) {// 形状
                typeCode = 'image';
                catCode = 'shape';
                svgType = media.tool.getCurSvgElement().querySelector('svg').getAttribute('data-targetType');
            }
        } else {
            typeCode = 'image';
            doSelect = true;
            svgType = 'group';
        }
        if (!doSelect)
            return;
        // 获取对应类型下，所有的分类
        let allLength = allMaterialCatList.length;
        for(let i = 0;i < allLength;i++) {
            let theObj = allMaterialCatList[i];
            if(theObj.typeCode !== typeCode)
                continue;
            theCatList.push({
                'catName': theObj.catName,
                'catCode': theObj.catCode,
            });
        }

        // 3：获取素材源码
        let canvasRect = media.tool.$canvasSvg.getBoundingClientRect();
        let $svg = document.createElementNS(Const.xmlns, "svg");
        let showRatio = media.tool.showRatio;
        let svgString = '';
        $svg.setAttribute("xmlns", Const.xmlns);
        $svg.setAttribute("preserveAspectRatio", "none");
        $svg.setAttribute("data-targetType", svgType);
        // 获取 targetRect、svgString
        let targetRect;
        if (selectedLength === 1) {
            let $curElem = media.tool.getCurSvgElement();
            targetRect = $curElem.getBoundingClientRect();
        } else {
            targetRect = Z.D.id('selection_tool').getBoundingClientRect();
        }
        for (let i = 0;i < selectedLength;i++) {
            let $curElem = media.tool.getCurSvgElement(i);
            svgString += $curElem.outerHTML.replace(/data\-groupid\s?=\s?"[^"]+"/, '');
        }
        // 设置 $svg 属性
        let viewLeft = (targetRect.left - canvasRect.left) / showRatio;
        let viewTop = (targetRect.top - canvasRect.top) / showRatio;
        let viewWidth = targetRect.width / showRatio;
        let viewHeight = targetRect.height / showRatio;
        let setViewBox = viewLeft + ' ' + viewTop + ' ' + viewWidth + ' ' + viewHeight;
        $svg.setAttribute('viewBox', setViewBox);
        $svg.setAttribute('width', viewWidth);
        $svg.setAttribute('height', viewHeight);
        // 取得 svgCode
        $svg.innerHTML = svgString;
        let $$gInner = $svg.children;
        for (let i = 0;i < $$gInner.length;i++){
            let $gInner = $$gInner[i];
            $gInner.removeChild($gInner.querySelector('rect'));
        }
        let svgCode = $svg.outerHTML;
        svgCode = svgCode.replace(/\n/g,'').replace(/\s\s/g,' ');

        // 4：显示输入弹窗
        let dialogTitle = '添加至我的素材';
        let dialogId = 'dialog_' + Z.Ids.uuid();
        let htmlStr = '<div id="' + dialogId + '" class="z-pd15 z-text-center" data-typeCode="' + typeCode + '" data-catCode="' + catCode + '">' +
            '<div class="z-mg-t15 z-mg-b10"><span class="z-show-ib z-w80 z-text-left">关键字：</span><input class="z-input z-w200 input-keyword" targetType="text" value="" placeholder="填入素材关键字"></div>';
        if (doSelect) {
            htmlStr += '<' + 'div class="z-mg-t15 z-mg-b10"><span class="z-show-ib z-w80 z-text-left">素材分类：</span><select class="z-select z-w200 select-catCode">';
            let theCatLength = theCatList.length;
            for (let i = 0;i < theCatLength;i++) {
                let theCat = theCatList[i];
                htmlStr += '<option value="' + theCat.catCode + '"';
                if (i === 0)
                    htmlStr += ' selected';
                htmlStr += '>' + theCat.catName + '</option>';
            }
            htmlStr += '</select></div>';
        }
        htmlStr += '<div class="z-pd-t10 z-text-right">' +
            '<div class="z-button zi-px14 zi-pd0 zi-w80 zi-h35 zi-lh35 z-blue z-mg-r15" onclick="MaterialTool.doAddCollectionList(\'' + dialogId + '\');">确定</div>' +
            '<div class="z-button zi-px14 zi-pd0 zi-w80 zi-h35 zi-lh35" onclick="Z.Dialog.close();">取消</div>' +
            '</div></div>';
        Z.dialog({ title: dialogTitle, text: htmlStr, width: 460, height: doSelect ? 177 : 132});

        // 赋值到dialog
        let $dialog = Z.D.id(dialogId);
        $dialog.svgCodeString = svgCode;
    }
    // 添加至我的素材：实现添加
    static doAddCollectionList(dialogId) {
        // 1：定义变量
        let $dialog = Z.D.id(dialogId);
        let typeCode = $dialog.getAttribute('data-typeCode');
        let catCode = $dialog.getAttribute('data-catCode');
        let $catCodeSelect = $dialog.querySelector('.select-catCode');
        if ($catCodeSelect)
            catCode = $catCodeSelect.value;
        let keyword = $dialog.querySelector('.input-keyword').value;
        let svgCode = $dialog.svgCodeString;

        if(typeof doAddUserMaterial === "function") {
            doAddUserMaterial(typeCode, catCode, keyword, svgCode);
        }
        // 2：关闭弹窗
        Z.Dialog.close();
    }
    // 设置 cover 素材列表
    static setCoverMaterial(bgObj, newWidthMm, newHeightMm) {
        let thisCanvas = media.canvasModel;
        let widthSpace = thisCanvas.fullWidth - thisCanvas.width;
        let heightSpace = thisCanvas.fullHeight - thisCanvas.height;
        let bgIndex = media.bgList.indexOf(bgObj);

        let newList = [];
        let pushCoverElement = (width, height, left, top, mid, textRotate)=> {
            let $gCover = document.createElementNS(Const.xmlns, 'g');
            $gCover.innerHTML = '<rect fill="#FFFBC6" stroke="#E50065" stroke-width="1" width="200" height="100"></rect>' +
                '<g>' +
                '<line stroke-linecap="square" stroke="#E50065" stroke-width="5" x1="0" y1="0" x2="200" y2="100"></line>' +
                '<line stroke-linecap="square" stroke="#E50065" stroke-width="5" x1="0" y1="100" x2="200" y2="0"></line>' +
                '</g><g></g>';
            let $rectBg = $gCover.querySelector('rect');
            let $$crossLine = $gCover.querySelectorAll('line');
            let $$g = $gCover.querySelectorAll('g');
            let $textWrap = $$g[1];

            let bleedSize = thisCanvas.bleedSize;
            let textStr = '完成尺寸：' + (newWidthMm - bleedSize) + ' x ' + (newHeightMm - bleedSize) + 'mm，模位：' +
                Math.ceil(thisCanvas.widthMm / Const.cardBaseData.baseWidthMm) * Math.ceil(thisCanvas.heightMm / Const.cardBaseData.baseHeightMm);
            $textWrap.appendChild(Const.getPathSvgFromText(textStr, {fontFamily:"宋体", fontSize:"35px", fontWeight:0, fontColor: "#000000"}));
            let $textSvg = $textWrap.querySelector("svg");
            let $gText = $textSvg.querySelector("g");

            // 容器属性设置
            $gCover.setAttribute('transform', 'translate(' + left + ' ' + top + ')');
            // 背景属性设置
            $rectBg.setAttribute('width', width);
            $rectBg.setAttribute('height', height);
            // 打叉属性设置
            $$crossLine[0].setAttribute('x2', width);
            $$crossLine[0].setAttribute('y2', height);
            $$crossLine[1].setAttribute('y1', height);
            $$crossLine[1].setAttribute('x2', width);

            // 文字属性设置
            $textSvg.setAttribute('width', width);
            $textSvg.setAttribute('height', height);
            $textSvg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);

            // 插入页面，计算大小
            let $bodySvg = document.createElementNS(Const.xmlns, 'svg');
            $bodySvg.setAttribute('viewBox', '0 0 ' + thisCanvas.fullWidth + ' ' + thisCanvas.fullHeight);
            $bodySvg.setAttribute('width', thisCanvas.fullWidth);
            $bodySvg.setAttribute('height', thisCanvas.fullHeight);
            $bodySvg.setAttribute('style', 'position:absolute;z-index:-9999;pointer-events:none;opacity:0;');
            $bodySvg.appendChild($gCover);
            document.documentElement.appendChild($bodySvg);

            let svgBox = $textSvg.getBBox();
            let textTrans = $gText.getAttribute("transform") || "";

            // 偏移校准
            let translateStr = "translate(" + (width - svgBox.width) / 2 +
                " " + ((height - svgBox.height) / 2 + 29) + ")";
            if (textTrans.indexOf("translate") > -1)
                textTrans = textTrans.replace(/translate[^)]+\)/, translateStr);
            else
                textTrans = (textTrans.trim() + " " + translateStr).trim();
            // 旋转校准
            if (textRotate) {
                let rotateStr = 'rotate(' + textRotate + ' ' +  svgBox.width/2 + ' ' + (svgBox.height/2 - 29) + ')';
                if (textTrans.indexOf("rotate") > -1)
                    textTrans = textTrans.replace(/rotate[^)]+\)/, rotateStr);
                else
                    textTrans = (textTrans.trim() + " " + rotateStr).trim();
            }
            $gText.setAttribute('transform', textTrans);
            svgBox = $textSvg.getBBox();

            if (svgBox.x < 0 || svgBox.y < 0) {
                let setSvgView = (svgBox.x < 0 ? svgBox.x : 0) + ' ';
                setSvgView += (svgBox.y < 0 ? svgBox.y : 0) + ' ';
                setSvgView += (svgBox.x < 0 ? svgBox.width : width) + ' ';
                setSvgView += (svgBox.y < 0 ? svgBox.height : height);
                $textSvg.setAttribute('viewBox', setSvgView);
            }

            // 插入对象
            let html = $gCover.outerHTML;
            media.coverMaterialList.push(new CoverMaterial({
                $media: media,
                mediaId: media.id,               // 1.媒体编号
                bid: bgObj.bid,                              // 2.背景编号
                mid: mid,                                    // 3.素材编号
                source: html,                                // 4.素材内容
            }));
            // 移除辅助对象
            document.documentElement.removeChild($bodySvg);
            // 插入数组
            newList.push(html);
        }
        if (Math.abs(widthSpace) > Const.deviationSizePx) {
            if (bgIndex%2 === 0) {// 位置偏移：偶序版面
                if (bgObj.oddEven === 0) // 横板
                    pushCoverElement(widthSpace, thisCanvas.height, thisCanvas.width, 0, 0, 90);
                else // 竖板
                    pushCoverElement(thisCanvas.height, widthSpace, 0, -widthSpace, 0);
            } else {// 位置偏移：奇序版面
                if (bgObj.oddEven === 0) // 横板
                    pushCoverElement(widthSpace, thisCanvas.height, -widthSpace, 0, 0, 90);
                else // 竖板
                    pushCoverElement(thisCanvas.height, widthSpace, 0, -widthSpace, 0, 180);
            }
        }
        if (Math.abs(heightSpace+"") > Const.deviationSizePx) {// 高度裁切
            if (bgIndex%2 === 0) { // 位置偏移：偶序版面
                // 横板
                if (bgObj.oddEven === 0)
                    pushCoverElement(thisCanvas.fullWidth, heightSpace, 0, thisCanvas.height, 1);
                // 竖板
                else
                    pushCoverElement(heightSpace, thisCanvas.fullWidth, thisCanvas.height, -widthSpace, 1, 270);
            } else { // 位置偏移：奇序版面
                if (bgObj.oddEven === 0) // 横板
                    pushCoverElement(thisCanvas.fullWidth, heightSpace, -widthSpace, thisCanvas.height, 1);
                else // 竖板
                    pushCoverElement(heightSpace, thisCanvas.fullWidth, -heightSpace, -widthSpace, 1, 90);
            }
        }
        // 返回该版面所有coverMaterial;
        return newList;
    }
    static insertCoverMaterial() {
        media.tool.$canvasCover.innerHTML = '';
        for (let coverMaterial of media.coverMaterialList) {
            // 略过非当前版面的素材
            if (coverMaterial.bid !== media.curPage)
                continue;
            let $gSource = Z(coverMaterial.source)[0];
            let $gNew = document.createElementNS(Const.xmlns, 'g');
            for (let item of $gSource.attributes)
                $gNew.setAttribute(item.name, item.value);
            $gNew.innerHTML = $gSource.innerHTML;

            // 插入素材
            media.tool.$canvasCover.appendChild($gNew);

            // 调整合适宽高，以防超出
            let $textSvg = $gNew.querySelector('svg');
            let svgBox = $textSvg.getBBox();
            if (svgBox.x >= 0 && svgBox.y >= 0)
                continue;

            let setSvgView = (svgBox.x < 0 ? svgBox.x : 0) + ' ';
            setSvgView += (svgBox.y < 0 ? svgBox.y : 0) + ' ';
            setSvgView += (svgBox.x < 0 ? svgBox.width : $textSvg.getAttribute('width')) + ' ';
            setSvgView += (svgBox.y < 0 ? svgBox.height : $textSvg.getAttribute('height'));
            $textSvg.setAttribute('viewBox', setSvgView);
            // 更新列表属性
            coverMaterial.source = $gNew.outerHTML;
        }
    }
    // 设置属性值
    static setMaterial(material, $curElem) {
        // 主方法，定义变量
        let hasChangeSource = false;
        // 取得当前版面素材的参数值
        let $g = $curElem.querySelector("g");
        let $svg = [...$g.children].pop();
        let dataType = $svg.getAttribute("data-targetType");
        // 0：验证：样式hiddenDoing、透明度opacity
        let className = $curElem.getAttribute("class") || "";
        if (className.indexOf("hiddenDoing") > -1 || $curElem.hasAttribute('opacity')) {
            className = className.replace(/hiddenDoing/g, "").replace(/\s\s/g," ").trim();
            $curElem.setAttribute("class", className);
            $curElem.removeAttribute('opacity');
            hasChangeSource = true;
        }
        // 1：分组编号
        material.groupId = $curElem.getAttribute("data-groupid") || "";
        // 2：翻转状态
        let elemTransform = $g.getAttribute("transform");
        if (elemTransform && elemTransform.indexOf("scale") > -1) {
            material.reversal = elemTransform.replace(/(.*scale\()([^)]+)(\).*)/,"$2");
        } else {
            material.reversal = "1 1";
        }
        // 3：圆角
        let $clipPath = Z($curElem).find("clipPath[id^=\"radius_svgElementSon_\"]")[0];
        if ($clipPath) {
            let $rect = $clipPath.querySelector("rect");
            if ($rect && $rect.hasAttribute("rx")) {
                material.imgRadius = parseInt($rect.getAttribute("rx"));
            }
        }
        // 4：大小
        material.width = $svg.viewBox.baseVal.width;
        material.height = $svg.viewBox.baseVal.height;
        // 5：偏移
        for (let item of $curElem.transform.baseVal){
            if (item.targetType === 2){
                material.x = item.matrix.e;
                material.y = item.matrix.f;
            } else if (item.targetType === 4) {
                material.angle = item.angle;
            }
        }
        material.x = material.x || 0;
        material.y = material.y || 0;
        material.angle = material.angle || 0;
        // 6：透明度
        if ($curElem.hasAttribute('fill-opacity') && $curElem.hasAttribute('stroke-opacity')) {
            let numReg = /0|1|(0?.\d+)/;
            let fillOpacity = $curElem.getAttribute('fill-opacity');
            let strokeOpacity = $curElem.getAttribute('stroke-opacity');
            if (numReg.test(fillOpacity) && numReg.test(strokeOpacity) && fillOpacity === strokeOpacity) {
                material.transparency = Math.round(parseFloat(fillOpacity) * 100);
            } else {
                $curElem.setAttribute('fill-opacity', material.transparency / 100);
                $curElem.setAttribute('stroke-opacity', material.transparency / 100);
                material.transparency = 100;
                hasChangeSource = true;
            }
        } else {
            material.transparency = 100;
        }
        // 7：文字属性
        if (material.type === 1){
            let $$gLine = $svg.children;
            let $$gPath = $svg.querySelectorAll(".font-path");
            let pathLength = $$gPath.length;
            let $firstPath = $$gPath[0];
            if ($$gLine.length === 0 || pathLength === 0 || !$firstPath){
                material.doDelete();
                hasChangeSource = false;
                return;
            }

            let isItalic = -1;
            // 1：加粗
            material.fontWeight = parseInt($curElem.getAttribute("data-fontweight"));
            // 2：文本类型
            material.fontFamily = $curElem.getAttribute("data-fontfamily") || "微软雅黑";
            // 3：文本对齐
            material.textAlign = $curElem.getAttribute("data-textalign") || "left";
            // 4：文本字体
            // 5：下划线偏移
            material.underlineOffset = $curElem.getAttribute("data-underlineoffset");
            // 6：下划线大小
            material.underlineThickness = $curElem.getAttribute("data-underlinethickness");
            // 7：字间距
            material.letterSpacing = $curElem.getAttribute("data-letterspacing");
            // 8：行间距
            material.lineHeight = $curElem.getAttribute("data-lineheight");
            // 9：行间距计算
            material.mathHeight = $curElem.getAttribute("data-mathheight");
            // 10：单行高度
            material.singleHeight = $curElem.getAttribute("data-singleheight");
            // 11：文本缩放，宽度、高度变化比例
            material.textZoom = $curElem.getAttribute("data-textzoom");
            if (!material.textZoom || !/^\d+(.\d+)?\s\d+(.\d+)?$/.test(material.textZoom))
                material.textZoom = '1 1';
            // 12：svg 默认横坐标偏移
            material.svgboxx = $curElem.getAttribute("data-svgboxx") || 0;
            // 13：竖排对齐方式
            material.textVertical = $curElem.getAttribute("data-textvertical") || 'normal';
            // 14：文字特效
            material.textSpecial = $curElem.getAttribute("data-textspecial") || 'normal';
            material.textSpecialColor = $curElem.getAttribute("data-textspecialcolor") || '#000000';
            material.textSpecialSize = parseFloat($curElem.getAttribute("data-textspecialsize") || -1);
            // 15：下划线
            if (pathLength === $svg.querySelectorAll(".font-path line").length){
                material.textDecoration = 1;
            } else {
                material.textDecoration = 0;
            }
            // 16：文本大小
            let fontSize = $curElem.getAttribute("data-fontsize");
            if (fontSize.indexOf("p") === -1) {// 如果没有单位，表示存储值为px，需要转换单位
                fontSize = parseFloat(fontSize);
                if ({}.createMode === 0) {
                    fontSize = Exchange.px2pt(fontSize);
                    $curElem.setAttribute("data-fontsize", fontSize + 'pt');
                } else {
                    $curElem.setAttribute("data-fontsize", fontSize + 'px');
                }
                hasChangeSource = true;
            }
            material.fontSize = parseFloat(fontSize);
            // 17：文本偏移；之前版本，没有保存“data-texty”，用近似计算
            let fontTrueSize;
            if (!$curElem.hasAttribute("data-texty")) {
                if ({}.createMode === 0)
                    fontTrueSize = Exchange.pt2px(material.fontSize);
                else
                    fontTrueSize = parseInt(material.fontSize);
                material.textY = fontTrueSize * .830512523651123;
            } else {
                material.textY = parseFloat($curElem.getAttribute("data-texty"));
            }
            // 18：文本内容，剔除特殊字符
            let textStr = $curElem.getAttribute("data-text").replace(/-%6-%-%0-/g, '<');
            textStr = Const.getHtmlText(textStr);
            material.text = textStr;
            // 19：颜色
            material.color = $firstPath.querySelector('path').getAttribute('fill') || "#000000";
            // 21：斜体 + 22：设置data-x + 23：wordsList
            textStr = textStr.replace(/(-%5-%-%5-)|\n/g, "");
            let textLength = textStr.length;
            let initWordsList = textLength !== pathLength;
            material.wordsList = [];
            for (let i = 0;i < pathLength;i++) {
                // 斜体校对
                let $gPath = $$gPath[i];
                let $path = $gPath.querySelector('path');
                if ($gPath.hasAttribute('data-heihgt')){
                    $gPath.setAttribute('data-height' , $gPath.getAttribute('data-heihgt'));
                    $gPath.removeAttribute('data-heihgt');
                    hasChangeSource = true;
                }
                let transValueList = $gPath.transform.baseVal;
                for (let j = 0; j < transValueList.length; j++) {
                    if (transValueList[j].targetType === 2) {
                        let pathTransX = transValueList[j].matrix.e;
                        if ($gPath.hasAttribute('data-x'))
                            continue;
                        if (j === 0)
                            $gPath.setAttribute('data-x', '0');
                        else
                            $gPath.setAttribute('data-x', pathTransX - material.letterSpacing);
                    } else if (transValueList[k].targetType !== 5) {
                        continue;
                    }
                    let thisItalic = transValueList[k].angle === -18 ? 1 : 0;
                    if (isItalic === -1) {
                        isItalic = thisItalic;
                    } else {
                        if (isItalic !== thisItalic) {
                            isItalic = 0;
                            break;
                        }
                    }
                }
                // wordsList 设置
                if (initWordsList) {
                    $path.setAttribute('fill', material.color);
                    continue;
                }
                let pathStr = textStr[i];
                let pathT = $gPath.getAttribute("data-text");
                pathT = pathT && pathT.replace(/-%6-%-%0-/g, '<');
                if (pathT !== pathStr) {
                    $gPath.setAttribute("data-text", pathStr.replace(/</g, '-%6-%-%0-'));
                    pathT = pathStr;
                }
                let pathW = $gPath.getAttribute("data-fontweight");
                let pathI = $gPath.getAttribute("data-fontitalic");
                let pathD = $gPath.getAttribute("data-textdecoration");
                material.wordsList.push({
                    'color': $path.getAttribute('fill') || material.color,
                    'fontFamily': $gPath.getAttribute("data-fontfamily") || material.fontFamily,
                    'fontSize': material.fontSize,
                    'fontWeight': pathW === null ? material.fontWeight : ((!/^\d$/.test(pathW)) ? 0 : (eval(pathW) ? 1 : 0)),
                    'fontItalic': pathI === null ? (isItalic === -1 ? 0 : isItalic) : ((!/^\d$/.test(pathI)) ? 0 : (eval(pathI) ? 1 : 0)),
                    'textDecoration': pathD === null ? material.textDecoration : ((!/^\d$/.test(pathD)) ? 0 : (eval(pathD) ? 1 : 0)),
                    'text': pathT,
                    'index': i,
                });
            }
            material.fontItalic = (isItalic === -1) ? 0 : isItalic;
            // 23：初始化 wordsList
            if (initWordsList) {
                for (let i = 0;i < textLength;i++) {
                    material.wordsList.push({
                        'color': material.color,
                        'fontFamily': material.fontFamily,
                        'fontSize': material.fontSize,
                        'fontWeight': material.fontWeight,
                        'fontItalic': material.fontItalic,
                        'textDecoration': material.textDecoration,
                        'text': textStr[i],
                        'index': i,
                    });
                }
            }
        }
        // 8：容器属性
        if (material.type === 4) {
            if(!$curElem.querySelector('.svgFrame-img > image')){
                material.type = 3;
            }
            else{
                let $default = $curElem.querySelector('.svgFrame-default');
                let $image = $curElem.querySelector('.svgFrame-img > image');
                let imgUrl = $image.getAttribute('xlink:href');
                if (imgUrl === Const.frameDefaultUrl) {
                    if ($default.hasAttribute('style')){
                        $default.removeAttribute('style');
                        hasChangeSource = true;
                    }
                } else {
                    if (!$default.hasAttribute('style')){
                        $default.setAttribute('style', 'display:none');
                        hasChangeSource = true;
                    }
                }
            }
        }
        // 9：形状属性
        if (material.type === 5) {
            if(dataType === "shape-table"){
                let $$gTd = $svg.querySelectorAll("g[data-rowspan]");
                let listLength = $$gTd.length;
                if (listLength === 0)
                    return;
                // 给表格添加第二属性
                material.isTable = 1;
                MaterialTool.tableMaterialTextSet($curElem, material);
            }
        }
        // 10：背景图层
        material.bgMaterial = $curElem.hasAttribute("data-bgmaterial");
        // End：修改了 svg 源码，则刷新素材 resource
        hasChangeSource && ElementUpdate.updateMaterialSource(material, $curElem);
    }
    static tableMaterialTextSet($curElem, material) {
        let $firstTd = $curElem.querySelector("g[data-rowspan]");
        let $firstPath = $firstTd.querySelector("g.font-path>path");
        material.color = ($firstPath && $firstPath.getAttribute("fill")) || "#000000";
        material.fontFamily = $firstTd.getAttribute("data-fontfamily") || "微软雅黑";
        material.textAlign = $firstTd.getAttribute("data-textalign") || "center";
        material.fontSize = $firstTd.getAttribute("data-fontsize") || Exchange.px2pt(16/media.tool.showRatio);
        material.fontWeight = parseFloat($firstTd.getAttribute("data-fontweight") || 0);
        material.fontItalic = parseFloat($firstTd.getAttribute("data-fontitalic") || 0);
        material.letterSpacing = parseFloat($firstTd.getAttribute("data-letterspacing") || 0);
        material.lineHeight = parseFloat($firstTd.getAttribute("data-lineheight") || 0);
        material.mathHeight = parseFloat($firstTd.getAttribute("data-mathheight") || 0);
    }
    // 隐藏正常素材
    static hideHiddenElement($curElem) {
        $curElem = Z($curElem)[0];
        let className = $curElem.getAttribute("class") || "";
        className = (className + " hiddenDoing").replace(/\s\s/g," ").trim();
        $curElem.setAttribute("class", className);
    }
    // 显示正常素材
    static showHiddenElement($curElem) {
        $curElem = Z($curElem)[0];
        let className = $curElem.getAttribute("class") || "";
        className = className.replace(/hiddenDoing/g, "").replace(/\s\s/g," ").trim();
        $curElem.setAttribute("class", className);
    }
    // 显示正常素材--文字素材
    static showTextElement($curElem) {
        EditBtnTool.hideTextEditor();
        MaterialTool.showHiddenElement($curElem)
    }
    // 处理自定义返回数据
    static analysisOfResponseMine(responseText) {
        // 1：定义变量
        let mediaSvg = Z.J.toObject(responseText);
        let svgCode = mediaSvg.svgCode;
        let $thisSvg = Z(svgCode);
        let thisType = $thisSvg.attr('data-targetType');

        // 2：添加素材
        // 添加 image
        let addSvgImage = ()=> {
            // 1：添加新素材
            addThisMaterial();
            // 2：重定义素材属性
            let $clipRect = $curElem.querySelector('clipPath[id^="radius_svgElementSon_"] > rect');
            let imgRadius = 0;
            if ($clipRect){
                imgRadius = parseFloat($clipRect.getAttribute('rx'));
            }
            material.type = 0;
            material.imgRadius = imgRadius;
        };
        // 添加 text
        let addSvgText = ()=> {
            // 1：添加新素材
            addThisMaterial();
            // 2：重定义素材属性
            material.type = 1;
            material.letterSpacing = parseFloat($curElem.getAttribute('data-letterspacing'));
            material.mathHeight = parseFloat($curElem.getAttribute('data-mathheight'));
            material.singleHeight = parseFloat($curElem.getAttribute('data-singleheight'));
            material.lineHeight = parseFloat($curElem.getAttribute('data-lineheight'));
            material.fontWeight = parseFloat($curElem.getAttribute('data-fontweight'));
            material.fontItalic = parseFloat($curElem.getAttribute('data-fontitalic'));
            material.underlineOffset = parseFloat($curElem.getAttribute('data-underlineoffset'));
            material.underlineThickness = parseFloat($curElem.getAttribute('data-underlinethickness'));
            material.textY = parseFloat($curElem.getAttribute('data-texty'));
            material.transparency = parseFloat($curElem.getAttribute('fill-opacity')) * 100;
            material.fontFamily = $curElem.getAttribute('data-fontfamily');
            material.fontSize = parseFloat($curElem.getAttribute('data-fontsize'));
            material.text = $curElem.getAttribute('data-text').replace(/-%6-%-%0-/g, '<');
            material.textAlign = $curElem.getAttribute('data-textalign');
            material.textZoom = $curElem.getAttribute('data-textzoom');
            material.textVertical = $curElem.getAttribute('data-textvertical');
            material.textSpecial = $curElem.getAttribute('data-textspecial');
            material.textSpecialColor = $curElem.getAttribute('data-textspecialcolor');
            material.textSpecialSize = $curElem.getAttribute('data-textspecialsize');
            let textDecoration;
            if ($curElem.querySelectorAll('.font-path line').length === $curElem.querySelectorAll('.font-path').length)
                textDecoration = 1;
            else
                textDecoration = 0;
            material.textDecoration = textDecoration;
            material.color = $curElem.querySelector('.font-path path').getAttribute('fill');
            let svgStroke = $svg.getAttribute('stroke');
            let svgStrokeWidth = $svg.getAttribute('stroke-width');
            if (svgStroke && svgStrokeWidth)
                material.stroke = svgStroke + ' ' + svgStrokeWidth;
            let $$gPath = $svg.querySelectorAll(".font-path");
            let textStr = material.text.replace(/(-%5-%-%5-)|\n/g, "");
            let pathLength = $$gPath.length;
            let textLength = textStr.length;
            let initWordsList = textLength !== pathLength;
            material.wordsList = [];
            if (initWordsList) {
                for (let j = 0;j < textLength;j++) {
                    material.wordsList.push({
                        'color': material.color,
                        'fontFamily': material.fontFamily,
                        'fontSize': material.fontSize,
                        'fontWeight': material.fontWeight,
                        'fontItalic': material.fontItalic,
                        'textDecoration': material.textDecoration,
                        'text': textStr[j],
                        'index': j,
                    });
                }
            } else {
                for (let j = 0;j < pathLength;j++) {
                    let $gPath = $$gPath[j];
                    let $path = $gPath.querySelector('path');
                    let pathW = $gPath.getAttribute("data-fontweight");
                    let pathI = $gPath.getAttribute("data-fontitalic");
                    let pathD = $gPath.getAttribute("data-textdecoration");
                    let pathT = $gPath.getAttribute('data-text');
                    pathT = pathT && pathT.replace('-%6-%-%0-', '<');
                    material.wordsList.push({
                        'color': $path.getAttribute('fill'),
                        'fontFamily': $gPath.getAttribute("data-fontfamily"),
                        'fontSize': material.fontSize,
                        'fontWeight': pathW === null ? material.fontWeight : ((!/^\d$/.test(pathW)) ? 0 : (eval(pathW) ? 1 : 0)),
                        'fontItalic': pathI === null ? material.fontItalic : ((!/^\d$/.test(pathI)) ? 0 : (eval(pathI) ? 1 : 0)),
                        'textDecoration': pathD === null ? material.textDecoration : ((!/^\d$/.test(pathD)) ? 0 : (eval(pathD) ? 1 : 0)),
                        'text': pathT,
                        'index': j,
                    });
                }
            }
        };
        // 添加 container
        let addSvgContainer = ()=> {
            // 1：添加新素材
            addThisMaterial();
            // 2：重定义素材属性
            material.type = 4;
        };
        // 添加 shape
        let addSvgShape = ()=> {
            // 1：添加新素材
            addThisMaterial();
            // 2：重定义素材属性
            material.type = 5;
        };
        // 添加 pen
        let addSvgPen = ()=> {
            // 1：添加新素材
            addThisMaterial();
            // 2：重定义素材属性
            material.type = 5;
        };
        // 添加 svg
        let addSvgSvg = ()=> {
            // 1：添加新素材
            addThisMaterial();
            // 2：重定义素材属性
            material.type = 3;
        };
        // 添加 group
        let addSvgGroup = ()=> {
            doGroup = true;
            for(let i = 0;i < childrenLength;i++) {
                $curElem = $$curElem[0];
                $svg = [...$curElem.querySelector('g').children].pop();
                svgType = $svg.getAttribute('data-targetType');

                if ((()=> { // 1：纯图片
                    let $$g = $svg.children;
                    let childrenLength = $$g.length;
                    if (childrenLength < 1 || childrenLength > 2)
                        return false;
                    let $g;
                    if (childrenLength === 1) {
                        $g = $$g[0];
                        if ($g.tagName.toLowerCase() !== 'g')
                            return false;
                    } else {
                        let $defs = $$g[0];
                        if ($defs.tagName.toLowerCase() !== 'defs')
                            return false;
                        if ($defs.children.length !== 1)
                            return false;
                        let $clipPath = $defs.children[0];
                        if ($clipPath.tagName.toLowerCase() !== 'clipPath' ||
                            !$clipPath.id || !/^radius_svgElementSon_/.test($clipPath.id))
                            return false;
                        $g = $$g[1];
                    }
                    let $$image = $g.children;
                    if ($$image.length !== 1)
                        return false;
                    return $$image[0].tagName.toLowerCase() === 'image';
                })()){
                    addSvgImage();
                } else if (!!$curElem.getAttribute('data-text')) {// 2：文字
                    addSvgText();
                } else if (!!svgType && svgType === 'container') {// 3：容器
                    addSvgContainer();
                } else if (!!svgType && ['shape-line', 'shape-rect', 'shape-rectStroke', 'shape-ellipse'].includes(svgType)) {// 4：形状
                    addSvgShape();
                } else if (!!svgType && svgType === 'shape-pen') {// 5：钢笔
                    addSvgPen();
                } else {// 6：通用
                    addSvgSvg();
                }
            }
        };
        // 插入新素材
        let addThisMaterial = ()=> {
            // 1：插入节点到画布
            let elemTrans = $curElem.getAttribute('transform');
            let $canvasSvg = media.tool.$canvasSvg;
            let $canvasMaterial = media.tool.$canvasMaterial;
            $canvasMaterial.appendChild($curElem);
            $gChild = $curElem.querySelector('g');
            $svg = [...$gChild.children].pop();
            svgViewBox = $svg.viewBox.baseVal;
            // 2：插入rect矩形
            $curElem.insertAdjacentHTML("afterbegin",'<rect fill="rgba(0,0,0,0)" width="0" height="0"></rect>');
            let $rect = $curElem.querySelector('rect');
            $rect.setAttribute('width', $svg.getAttribute('width'));
            $rect.setAttribute('height', $svg.getAttribute('height'));
            // 3：居中位置
            let mx, my;
            if (doGroup) {
                let wrapView = $thisSvg[0].viewBox.baseVal;
                let canvasView = $canvasSvg.viewBox.baseVal;
                let wrapMx = (canvasView.width - wrapView.width) / 2;
                let wrapMy = (canvasView.height - wrapView.height) / 2;
                let transVal = $curElem.transform.baseVal[0].matrix;
                mx = transVal.e - wrapView.x + wrapMx;
                my = transVal.f - wrapView.y + wrapMy;
            } else {
                let canvasRect = $canvasSvg.getBoundingClientRect();
                let elemRect = $curElem.getBoundingClientRect();
                mx = (canvasRect.width - elemRect.width) / 2;
                my = (canvasRect.height - elemRect.height) / 2;
                mx /= showRatio;
                my /= showRatio;
            }
            elemLoc = {'x' : mx, 'y' : my};
            elemTrans = elemTrans.replace(/translate\([^)]+\)/, 'translate(' + elemLoc.x + ' ' + elemLoc.y +')');
            // 4：旋转
            rotate = $curElem.transform.baseVal[1].angle;
            // 5：翻转
            reversal = /scale\(([^)]+)\)/.exec($gChild.getAttribute('transform'));
            reversal = reversal && reversal[1] || '1 1';
            // 6：添加新素材
            material = MaterialTool.newMediaMaterial({
                'width': svgViewBox.width,
                'height': svgViewBox.height,
                'x': elemLoc.x,
                'y': elemLoc.y,
                'angle': rotate,
                'reversal': reversal,
            });
            $curElem.setAttribute('transform', elemTrans);
            $curElem.setAttribute('id', 'svgElementSon_' + material.mid);
            $curElem.setAttribute('data-mid', material.mid);
            $curElem.setAttribute('data-pos', material.mid);
            ElementUpdate.updateMaterialSource(material, $curElem);
            media.tool.addMaterial(material);
            // 7：添加素材操作事件
            media.tool.addEleEvents($curElem);
            // 8：选中列表
            media.selectedList.push(material.mid);
        };
        // 1：添加素材到画布
        let showRatio = media.tool.showRatio;
        let $$curElem = $thisSvg[0].children;
        let childrenLength = $$curElem.length;
        let $curElem = $$curElem[0];
        let doGroup = false;
        let $gChild, $svg, svgType, material, svgViewBox, elemLoc, rotate, reversal;
        media.selectedList = [];
        switch(thisType) {
            case 'image': {
                addSvgImage();
            } break;
            case 'text': {
                addSvgText();
            } break;
            case 'container': {
                addSvgContainer();
            } break;
            case 'shape-line':
            case 'shape-rect':
            case 'shape-rectStroke':
            case 'shape-ellipse': {
                addSvgShape();
            } break;
            case 'shape-pen': {
                addSvgPen();
            } break;
            case 'shape-table': {
                console.log("添加表格类型素材！");
            } break;
            case 'svg': {
                addSvgSvg();
            } break;
            case 'group': {
                addSvgGroup();
            } break;
            default:{
                MaterialTool.addSvgCode();
            }
        }

        // 3：选中新增素材
        media.tool.setTempCurrent();
        SelectionTool.selectTheElement_group();
        if (media.selectedList.length > 1) {
            MaterialTool.doGroupCreate();
        }

        // 4：保存历史
        PrototypeHistory.saveHistory();
    }

    /********************************************
     *************** 文字相关方法 ***************
     ********************************************/
    // 文字素材宽度检测
    static textMaterialWidthReset(material) {
        function getWordWidth(word)
        {// 获取指定文字的宽度
            var $newFont = Z('<span style="z-index: -999;opacity: 0;">' + word + '</span>');
            var fontSizePX = material.fontSize;
            if (parseFloat({}.createMode) === 0) {
                fontSizePX = Exchange.pt2px(fontSizePX);
            }
            $newFont.appendTo(document.documentElement);
            $newFont.css({
                'fontFamily' : material.fontFamily,
                'fontSize' : fontSizePX,
                'fontStyle' : material.fontStyle,
                'letterSpacing' : material.letterSpacing,
            });
            var fontWidth = $newFont[0].getBoundingClientRect().width;
            $newFont.remove();
            return fontWidth;
        }
        let $canvasSvg = media.tool.$canvasSvg;
        let bleedWidth = Exchange.mm2px({}.bleedSize, {}.dpi);
        // 出去出血的有效宽度
        let maxWidth = $canvasSvg.viewBox.baseVal.width - 2 * bleedWidth;
        let textArr = material.text.split('\n');
        let totalWidth = 0, newArr = [], newWords = '';
        // 有效宽度的 100%
        maxWidth *= 1;
        for (let $line of textArr) {
            for (let word of $line) {
                let wordWidth = getWordWidth(word);
                totalWidth += getWordWidth(word);
                if (totalWidth >= maxWidth) {
                    newArr.push(newWords);
                    newArr.push('-%5-%-%5-');
                    newWords = '';
                    totalWidth = wordWidth;
                }
                newWords += word;
            }
            newArr.push(newWords);
            newArr.push('\n');
            newWords = '';
            totalWidth = 0;
        }
        return newArr.join('').trim();
    };
    // 初始化 wordList
    static initWordsListFromMaterial (material) {
        material.wordsList = [];
        let words = material.text.replace(/(-%5-%-%5-)|(\n)/g,"");
        for (let i = 0;i < words.length;i++) {
            material.wordsList.push({
                "color": material.color,
                "fontFamily": material.fontFamily,
                "fontSize": material.fontSize,
                "fontWeight": material.fontWeight,
                "fontItalic": material.fontItalic,
                "textDecoration": material.textDecoration,
                "text": words[i],
                "index": i,
            });
        }
    }
    // 获取文字路径
    static getPathAjax(material, $curElem, groupType, showLoading, fun) {
        // 调用路径生成方法
        let setPathFromResult = (result)=> {
            MaterialTool.setPathForText(result, wordsLoading, groupType, fun, material, $curElem);
        };
        // 通过远程服务端，绘制文字
        let getPathByService = ()=> {
            var ajax = new Z.Ajax();
            ajax.setClassName("MediaPresenter");
            ajax.setMethodName("getPathData");
            ajax.addParam(material.fontFamily);
            ajax.addParam(style);
            ajax.addParam(fontSize);
            ajax.addParam(textStr);
            ajax.addParam(wordsList);
            ajax.setSuccess(function () {
                setPathFromResult(this.responseText);
            });
            ajax.execute();
        };

        // 1：显示加载框
        let wordsLoading = showLoading ? null : null;
        // let wordsLoading = Z.loading({shadow: true, text:"正在加载...", target: 'stage_design'});

        // 2：取得绘制需要参数
        material = material || media.tool.tempMaterial || media.tool.getCurMaterial();
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();
        groupType = parseFloat(groupType + '');
        let style = (material.fontWeight)?(1):(0);
        let wordsList = Const.formatWordsList(material.wordsList);
        let fontSize = material.fontSize;
        let textStr = material.text.replace(/-%5-%-%5-/g,"\n");
        if (parseFloat({}.createMode) === 0) {
            fontSize += "pt";
        } else {
            fontSize += "px";
        }

        // 3：依浏览器判断
        if (typeof(ServiceAPI) === "undefined" || !Const.isUseLocalFont) {
            getPathByService();
        } else {
            ServiceAPI.text2Svg(material.fontFamily, style, fontSize, textStr, wordsList)
                .then(setPathFromResult, getPathByService);
        }
    }
    // 解析路径数据结果，生成文字排版
    static setPathForText(result, wordsLoading, groupType, fun, material, $curElem) {
        // 1：解析数据内容
        let resultObj = Z.J.toObject(result);
        let lineList = Z.J.toObject(resultObj.data);
        material.underlineOffset = parseFloat(resultObj.underlineOffset);
        material.underlineThickness = parseFloat(resultObj.underlineThickness);
        material.singleHeight = parseFloat(resultObj.lineHeight);
        material.mathHeight = parseFloat(material.mathHeight);
        material.lineHeight = Math.round(material.singleHeight + material.mathHeight);
        material.textY = Math.abs(resultObj.textY);

        // 2：定义素材对象
        let newElem = false;
        if (!$curElem){
            newElem = true;
            $curElem = media.tool.createNewSvgElement();
        }
        let $rect = $curElem.querySelector("rect");
        if (!$rect){
            $curElem.insertAdjacentHTML("afterbegin",'<rect fill="rgba(0,0,0,0)"></rect>');
            $rect = $curElem.querySelector("rect");
        }
        let $gSvg = $curElem.querySelector("g");
        let $$svg = $gSvg.children;
        while ($$svg.length > 1)
            $gSvg.removeChild($$svg[0]);
        let $svg = $$svg[0];

        // 3：重置对象大小
        $rect.setAttribute("width",'1');
        $rect.setAttribute("height",'1');
        $svg.innerHTML = "";
        $svg.removeAttribute("viewBox");
        $svg.removeAttribute("width");
        $svg.removeAttribute("height");

        // 4：循环处理每行path
        let widthArr = [];
        let pathIndex = 0;
        let letterSpacing = parseFloat(material.letterSpacing + '');
        let textStr = material.text.replace(/(-%5-%-%5-)|\n/g, "");
        let resetWordsList = false;
        if (!material.wordsList){
            resetWordsList = true;
            material.wordsList = [];
        }
        // 循环处理
        for (let i = 0;i < lineList.length;i++) {
            let lineData = Z.J.toObject(lineList[i]);
            let lineWidth = lineData.width;
            let $gLine = document.createElementNS(Const.xmlns, "g");
            let dx = -lineData.dx > 0 ? -lineData.dx : 0;
            let transX = lineData.x + dx;
            let transY = -lineData.y + (material.lineHeight) * i;
            $gLine.setAttribute("transform","translate("+ transX +" " + transY + ")");
            $gLine.setAttribute("data-dx", (0 - lineData.dx) + "");
            if (!lineData.pathList) {
                $svg.appendChild($gLine);
                continue;
            }
            // 循环每个字符
            for (let j = 0;j < lineData.pathList.length;j++) {
                let pathData = Z.J.toObject(lineData.pathList[j]);
                let $gItem = document.createElementNS(Const.xmlns, "g");
                let $pathItem = document.createElementNS(Const.xmlns, "path");
                let pathWidth = pathData.width;
                let pathHeight = pathData.height;
                let pathD = pathData.d;
                // 通过 wordsList 获取单个文字信息，不存在则新建
                if (resetWordsList) {
                    material.wordsList[pathIndex] = {
                        'color' : material.color,
                        'fontFamily' : material.fontFamily,
                        'fontItalic' : material.fontItalic,
                        'fontWeight' : material.fontWeight,
                        'fontSize' : material.fontSize,
                        'textDecoration' : material.textDecoration,
                        'text' : textStr[j],
                        'index' : pathIndex,
                    }
                }
                let word = material.wordsList[pathIndex];
                let gItemX = parseFloat(pathData.x) + letterSpacing * j;
                let gItemTrans = "translate(" + gItemX + " 0)";
                let pathColor = word.color;
                // 空白字符不显示
                if (j === lineData.pathList.length - 1 && !pathD) {
                    pathWidth = Math.round((parseFloat({}.createMode) === 0 ?
                        Exchange.pt2px(material.fontSize) : material.fontSize) / 3);
                    pathD = 'M0 0 L'+ pathWidth +' 0 L'+ pathWidth +' -1 L0 -1 L0 0 Z';
                    $pathItem.setAttribute('style', 'visibility: hidden;');
                    $pathItem.setAttribute('data-hidden', '1');
                }
                // 斜体判断
                if (word.fontItalic)
                    gItemTrans += 'skewX(-18)';
                // 下划线判断
                if (word.textDecoration) {
                    let $line = document.createElementNS(Const.xmlns, "line");
                    let setX2 = pathWidth + parseFloat(material.letterSpacing);
                    $line.setAttribute("x1", '0');
                    $line.setAttribute("y1", material.underlineOffset);
                    $line.setAttribute("x2", setX2);
                    $line.setAttribute("y2", material.underlineOffset);
                    $line.setAttribute("stroke", word.color);
                    $line.setAttribute("stroke-width", material.underlineThickness);
                    $gItem.appendChild($line);
                }
                // path 元素设置属性
                $pathItem.setAttribute("d", pathD);
                $pathItem.setAttribute("fill", pathColor);
                // g 元素设置属性
                $gItem.setAttribute("class", "font-path");
                $gItem.setAttribute("transform", gItemTrans);
                $gItem.setAttribute("data-x", pathData.x);
                $gItem.setAttribute("data-width", pathWidth);
                $gItem.setAttribute("data-height", pathHeight);
                $gItem.setAttribute("data-color", pathColor);
                $gItem.setAttribute("data-fontfamily", word.fontFamily);
                $gItem.setAttribute("data-fontsize", word.fontSize);
                $gItem.setAttribute("data-fontweight", word.fontWeight);
                $gItem.setAttribute("data-fontitalic", word.fontItalic);
                $gItem.setAttribute("data-textdecoration", word.textDecoration);
                $gItem.setAttribute("data-text", word.text.replace(/</g, '-%6-%-%0-'));
                $gItem.appendChild($pathItem);
                $gLine.appendChild($gItem);
                pathIndex++;
            }
            $svg.appendChild($gLine);

            // 定义每一行的宽度
            if (Math.ceil($gLine.getBBox().width) !== lineWidth){
                lineWidth = Math.ceil($gLine.getBBox().width);
            }
            widthArr.push(lineWidth);
            $gLine.setAttribute("data-width", lineWidth + "");
        }
        // 新建素材，插入元素到画布
        newElem && media.tool.$canvasMaterial.appendChild($curElem);

        // 5：素材宽度、高度
        material.width = Math.max(Const.getMaxNum(widthArr), $curElem.getBBox().width);
        let singleMax = Math.max(material.lineHeight, material.singleHeight);
        material.height = material.lineHeight * (lineList.length - 1) + singleMax;
        $svg.setAttribute("viewBox","0 0 " + material.width + " " + material.height);
        $svg.setAttribute("width",material.width);
        $svg.setAttribute("height",material.height);
        $rect.setAttribute("width",material.width);
        $rect.setAttribute("height",material.height);
        material.svgboxx = $svg.getBBox().x;

        // 6：文字参数写入SVG
        Const.setDataInSvg (material,$curElem);

        // 7：新素材文字处理
        let transStr = '';
        let rotateStr = '';
        if (newElem) {
            $curElem.setAttribute("id", "svgElementSon_" + material.mid);
            $curElem.setAttribute("data-mid", material.mid);
            $curElem.setAttribute("data-pos", material.pos);
            $curElem.setAttribute("fill-opacity", (material.transparency || 100) / 100);
            $curElem.setAttribute("stroke-opacity", (material.transparency || 100) / 100);
            material.x = (media.tool.getCurBg().width - material.width) / 2;
            material.y = (media.tool.getCurBg().height - material.height) / 2;
            transStr = "translate(" + material.x + " " + material.y + ")";
            rotateStr = "rotate(0 " +material.width/2 + " " + material.height/2 +")";
            $curElem.setAttribute("transform", transStr + " " + rotateStr);
            // 更新 source
            ElementUpdate.updateMaterialSource(material, $curElem);
            // 添加操作事件
            media.tool.addEleEvents($curElem);
            // 选中素材
            SelectionTool.selectTheElement(material, $curElem);
            // 保存记录，刷新预览列表
            PrototypeHistory.saveHistory();
            return;
        }

        // 8：文字特效处理（斜体、下划线在路径绘制一并完成）
        // 文字对齐
        if (material.textAlign !== 'left')
            ElementUpdate.setElementAlign(material.textAlign, material, $curElem);
        // 竖排文字
        if (material.textVertical !== 'normal') {
            let setStyle = material.textVertical;
            material.textVertical = 'normal';
            ElementUpdate.setTextVerticalLine(setStyle, material, $curElem);
        }
        // 文字缩放
        if (material.textZoom !== '1 1')
            ElementUpdate.setTextZoom(null, material, $curElem);
        // 文字特效
        ElementUpdate.doTextSpecialSet(material.textSpecial, Const.getIdObjArrFromMaterial(material));

        // 9：编辑模式
        // groupType 定义为2；粘贴文本的情况 ---- 重定义定位，更新 source；
        if (groupType === 2) {
            material.x = (media.tool.getCurBg().width - material.width) / 2;
            material.y = (media.tool.getCurBg().height - material.height) / 2;
            material.x = (material.x > 10)?material.x:10;
            material.y = (material.y > 10)?material.y:10;
            transStr = "translate(" + material.x + " " + material.y + ")";
            rotateStr = "rotate(0 " +material.width/2 + " " + material.height/2 +")";
            $curElem.setAttribute("transform", transStr + " " + rotateStr);
            // 更新 source 数据
            ElementUpdate.updateMaterialSource(material, $curElem);
        } else if (groupType === 1) {// groupType 定义为1；多素材绘制的情况 ---- 仅更新 source；
            // 更新 source 数据
            // ElementUpdate.updateMaterialSource(material, $curElem);
        } else if (!groupType) {// groupType 未定义，或定义为0；单个素材的情况 ---- 进行偏移校准，更新 source 并保存
            // 更新 source 数据
            ElementUpdate.updateMaterialSource(material, $curElem);
            // 更新选中框
            SelectionTool.setToolStaticLoc($curElem);
            // 保存
            PrototypeHistory.saveHistory();
        }

        // 10：去除加载框
        if (wordsLoading){
            setTimeout(()=> {
                wordsLoading.close();
                wordsLoading = null;
            }, 600);
        }

        // 11：自定义回调方法
        Z.T.isFunction(fun) && fun(material, $curElem);
    }
    // 新增文字路径
    static addNewTextPath(text) {
        // 1：定义素材
        let textObj = MaterialTool.newMediaTextMaterial(text);
        textObj.text = MaterialTool.textMaterialWidthReset(textObj);
        let textStr = textObj.text.replace(/-%5-%-%5-/g,"\n");
        // 调用路径生成方法
        let setPathFromResult = (result)=> {
            MaterialTool.setPathForText(result, null, null, null, material, null);
        };
        let getPathByService = ()=> {
            // 生成 SVG 对象
            var ajax = new Z.Ajax();
            ajax.setClassName("MediaPresenter");
            ajax.setMethodName("getPathData");
            ajax.addParam(material.fontFamily);
            ajax.addParam(0);
            ajax.addParam(fontSize);
            ajax.addParam(textStr);
            ajax.addParam("");
            ajax.setSuccess(function(){
                setPathFromResult(this.responseText);
            });
            ajax.execute();
        };

        media.tool.addMaterial(textObj);
        let material = media.tool.getMaterialByMid(textObj.mid, textObj.bid);
        let fontSize = material.fontSize;
        if (parseFloat({}.createMode) === 0) {
            fontSize += "pt";
        } else {
            fontSize += "px";
        }

        // 2：依浏览器判断
        if (typeof(ServiceAPI) === "undefined" || !Const.isUseLocalFont)
            getPathByService();
        else {
            ServiceAPI.text2Svg(material.fontFamily, 0, fontSize, textStr)
                .then(setPathFromResult, getPathByService);
        }
    }
}

