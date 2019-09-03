/*!
 * canvasEvent.js
 * 画布操作事件
 * 包括：滚动、缩放、画布拖拽、刻度尺绘制、刻度辅助线
 */

class CanvasEvent {
    /********************************************
     ***************** 常量定义 *****************
     ********************************************/
    // 类型：stageGrabbing：画布拖拽；stageScroll：画布滚动；stageSelection：画布框选；
        // rulerLineGrabbing：标尺拖拽
    static mouseDownType;
    // 框选容器 id
    static stageSelectionBoxId = "stageSelectionBox";
    // 本地数据库历史超前提示 id
    static dbHistoryLeadTipsId = "dbHistoryLeadTips";
    // 隐藏标尺的样式
    static hideRulerClass = "rulerHidden";
    // 显示网格的样式
    static showGridClass = "gridHidden";
    // 显示布局的样式
    static showLayoutClass = "layoutHidden";
    // 隐藏边栏的样式
    static hidePanelClass = "panelHidden";
    // 标尺常量、变量定义
    static rulerDate = {
        // 常量
        minStepSpace: 5,                          // 单刻度最小的物理长度，px
        maxStepSpace: 10,                         // 单刻度最大的物理长度，px
        textStepNum: 10,                          // 大刻度包含的小刻度数量

        normalLineTo: 5,                          // 普通刻度绘制偏移
        textLineTo: 15,                           // 有刻度显示的刻度绘制偏移
        textX: 3,                                 // 文字主方向偏移
        textY: 17,                                // 文字纵方向偏移
        textFont: "12px monospace",               // 文字样式
        lineColor: "#666666",                     // 刻度颜色
        textColor: "#666666",                     // 文字颜色
        lineHorizontalId: "lineHorizontalTemp",   // 水平临时辅助线id
        lineVerticalId: "lineVerticalTemp",       // 垂直临时辅助线id
        lineClass: "ruler-line",                  // 水平临时辅助线class
        // 变量
        startRulerX: 0,                           // x 标尺，起点，所表示的标尺大小
        endRulerX: 0,                             // x 标尺，末点，所表示的标尺大小
        startRulerY: 0,                           // y 标尺，起点，所表示的标尺大小
        endRulerY: 0,                             // y 标尺，末点，所表示的标尺大小
    };

    /********************************************
     ****************** 初始化 ******************
     ********************************************/
    // 载入初始化
    static init() {
        /******************
        * 常量定义
        * *****************/
        // 画布设计区
        Canvas.$canvas = Z("#container_canvas");
        Canvas.$design = Z("#canvas_design");
        Canvas.$stage = Z("#canvas_stage");
        Canvas.$box = Z("#canvas_box");
        Canvas.$content = Z("#canvas_content");
        // 标尺、滚动条
        Canvas.$rulerContainer = Z("#canvas_ruler");
        Canvas.$rulerList = Canvas.$rulerContainer.find(".canvasModel-ruler");
        Canvas.$rulerHorizontal = Canvas.$rulerContainer.find(".ruler-horizontal");
        Canvas.$rulerHorizontalLines = Canvas.$rulerHorizontal.find(".ruler-lineList");
        Canvas.$rulerVertical = Canvas.$rulerContainer.find(".ruler-vertical");
        Canvas.$rulerVerticalLines = Canvas.$rulerVertical.find(".ruler-lineList");
        Canvas.$scrollContainer = Z("#canvas_scroll");
        Canvas.$scrollList = Canvas.$scrollContainer.find(".scroll-bar");
        Canvas.$scrollHorizontal = Canvas.$scrollContainer.find(".scroll-horizontal");
        Canvas.$scrollVertical = Canvas.$scrollContainer.find(".scroll-vertical");
        // 额外工具
        Canvas.$toolContainer = Z("#canvas_toolContainer");

        /******************
         * 画布数据初始化
         * *****************/
        // 画布初始化数据
        CanvasEvent.canvasDataInit();

        /******************
         * 画布展示初始化
         * *****************/
        // 画布展示，初始化
        CanvasEvent.loadCanvasInit();
        // 页面元素载入
        CanvasEvent.loadScreen();

        /******************
         * 事件初始化
         * *****************/
        // 标尺事件添加
        CanvasEvent.rulerEventInit();
        // 滚动条事件
        CanvasEvent.scrollEventInit();
        // 画布事件
        Canvas.$stage.on("click", console.log)
            .on("mousedown", CanvasEvent.stageMouseDown)
            .on("mousemove", CanvasEvent.stageMouseMove)
            .on("mouseup", CanvasEvent.stageMouseUp)
            .on("mousewheel DOMMouseScroll", CanvasEvent.mouseWheel);
        Z(window).on("resize", CanvasEvent.canvasResize);
        Z(document).on("keydown", CanvasEvent.canvasResize);

        Canvas.$design.on("mousemove", CanvasEvent.designMouseMove)
            .on("mouseup", CanvasEvent.stageMouseUp);
    };
    // 初始化数据
    static canvasDataInit() {
        // 未初始化时，进行页面自适应设置，并更新相关参数
        if (canvasModel.initDone)
            return;

        let spaceWidth = 50;
        let spaceHeight = 50;
        let stageRect = Z.D.id("canvas_stage").getBoundingClientRect();
        let stageWidth = stageRect.width;
        let stageHeight = stageRect.height;

        let setWidth = stageWidth - spaceWidth * 2;
        let setScale = setWidth/canvasModel.width;
        setScale = Math.round(setScale*100)/100;
        let setHeight = canvasModel.height * setScale;

        let setLeft = (stageWidth - canvasModel.width)/2;
        let setTop = (stageHeight - canvasModel.height)/2;
        if ((stageHeight - setHeight)/2 < spaceHeight){
            setTop = (setHeight - canvasModel.height)/2 + spaceHeight;
        }

        // canvasModel 实例属性
        canvasModel.screenLeft = setLeft;
        canvasModel.screenTop = setTop;
        canvasModel.scale = setScale;
        canvasModel.initDone = true;

        let screenFirst = screenList[0];
        canvasModel.screenId = screenFirst && screenFirst.id || 1;

        // 更新到本地数据库


        // 更新到服务器

    }
    // 原型对象第一次加载，初始化缩放、偏移等
    static loadCanvasInit() {
        // 画布标尺滚动条重建
        CanvasEvent.loadCanvas();
        // 画布大小、缩放
        CanvasEvent.setTransform();
        // 标尺展示
        CanvasEvent.showRuler();
        // 网格工具展示
        CanvasEvent.showGrid();
        // 布局工具展示
        CanvasEvent.showLayout();
        // 布局工具展示
        CanvasEvent.showLayout();
    }

    /********************************************
     *************** 画布显示处理 ***************
     ********************************************/
    // 设计区载入
    static loadCanvas() {
        // 标尺重建
        CanvasEvent.rulerRebuild();
        // 滚动条位置
        CanvasEvent.scrollRelocation();
        // 操作历史超前提示
        CanvasEvent.showHistoryLead();
    }
    // 画布位置设置
    static setTransform() {
        // 画布位置更新
        Canvas.$box.css({
            width: canvasModel.width,
            height: canvasModel.height,
            transform: "translate(" + canvasModel.screenLeft + "px," + canvasModel.screenTop + "px)",
        });
        Canvas.$content.css({
            transform: "scale(" + canvasModel.scale + ")",
        });
    }
    // 标尺重建
    static rulerRebuild() {
        if (canvasModel.showRuler){
            Canvas.$canvas.removeClass(CanvasEvent.hideRulerClass);
        } else {
            Canvas.$canvas.addClass(CanvasEvent.hideRulerClass);
            return;
        }

        let width = canvasModel.width;
        let height = canvasModel.height;
        let left =  canvasModel.screenLeft;
        let top = canvasModel.screenTop;
        let scale = canvasModel.scale;

        let halfWidth = width / 2;
        let halfHeight = height / 2;
        let originX = halfWidth + left - halfWidth * scale;
        let originY = halfHeight + top - halfHeight * scale;
        let startRulerX = -originX / scale;
        let startRulerY = -originY / scale;
        let $rulerX = Canvas.$rulerHorizontal;
        let $rulerY = Canvas.$rulerVertical;
        let rulerRectX = $rulerX[0].getBoundingClientRect();
        let rulerRectY = $rulerY[0].getBoundingClientRect();
        let rulerWidthX = rulerRectX.width;
        let rulerHeightY = rulerRectY.height;
        let $canvasX = $rulerX.find("canvas");
        let $canvasY = $rulerY.find("canvas");
        $canvasX.attr("width", rulerWidthX).attr("height", rulerRectX.height);
        $canvasY.attr("width", rulerRectY.width).attr("height", rulerHeightY);
        let endRulerX = startRulerX + rulerWidthX / scale;
        let endRulerY = startRulerY + rulerHeightY / scale;

        // 定义标尺属性
        CanvasEvent.rulerDate.startRulerX = startRulerX;    // x 标尺，起点，所表示的标尺大小
        CanvasEvent.rulerDate.endRulerX = endRulerX;        // x 标尺，末点，所表示的标尺大小
        CanvasEvent.rulerDate.startRulerY = startRulerY;    // y 标尺，起点，所表示的标尺大小
        CanvasEvent.rulerDate.endRulerY = endRulerY;        // y 标尺，末点，所表示的标尺大小

        // 重定义标尺属性
        let stepPx = 10;            // 单刻度物理长度
        let textStepWidth = 25;     // 单个大刻度表示的基础长度
        for (let i = 1; ; i++) {
            let width = textStepWidth * i;
            let trueWidth = width * scale;
            let space = trueWidth / CanvasEvent.rulerDate.textStepNum;
            if (space < CanvasEvent.rulerDate.minStepSpace)
                continue;
            if (space > CanvasEvent.rulerDate.maxStepSpace)
                stepPx = CanvasEvent.rulerDate.minStepSpace;
            else
                stepPx = space;
            textStepWidth = width;
            break;
        }
        // 单个刻度表示的长度
        let stepWidth = textStepWidth / CanvasEvent.rulerDate.textStepNum;

        // 计算标尺起始位置
        let fromRulerX = Math.floor(startRulerX / stepWidth) * stepWidth;     // 起点附近最近的刻度，到缩放后的画布，距离
        let fromX = (fromRulerX - startRulerX) * scale;                          // 确定起点位置，物理位置
        let fromRulerY = Math.floor(startRulerY / stepWidth) * stepWidth;
        let fromY = (fromRulerY - startRulerY) * scale;
        let toRulerX = Math.ceil(endRulerX / stepWidth) * stepWidth;
        let toX = rulerWidthX + (toRulerX - endRulerX) * scale;
        let toRulerY = Math.ceil(endRulerY / stepWidth) * stepWidth;
        let toY = rulerHeightY + (toRulerY - endRulerY) * scale;

        // 起始向左、末端向右，额外添加一个刻度，使边缘更平滑
        fromX -= stepPx * CanvasEvent.rulerDate.textStepNum;
        fromY -= stepPx * CanvasEvent.rulerDate.textStepNum;
        toX += stepPx * CanvasEvent.rulerDate.textStepNum;
        toY += stepPx * CanvasEvent.rulerDate.textStepNum;
        let rulerX = fromRulerX - textStepWidth;
        let rulerY = fromRulerY - textStepWidth;

        // 绘制刻度
        let ctxX = $canvasX[0].getContext("2d");
        for (let pos = fromX; pos < toX; pos += stepPx) {
            ctxX.beginPath();
            ctxX.moveTo(pos, 0);
            ctxX.strokeStyle = CanvasEvent.rulerDate.lineColor;
            ctxX.lineWidth = 1;
            if (rulerX % textStepWidth === 0) {
                ctxX.lineTo(pos, CanvasEvent.rulerDate.textLineTo);
                ctxX.stroke();
                // 文字，刻度大小
                ctxX.fillStyle = CanvasEvent.rulerDate.textColor;
                ctxX.font = CanvasEvent.rulerDate.textFont;
                ctxX.fillText(rulerX + "", pos + CanvasEvent.rulerDate.textX, CanvasEvent.rulerDate.textY);
            } else {
                ctxX.lineTo(pos, CanvasEvent.rulerDate.normalLineTo);
                ctxX.stroke();
            }
            rulerX += stepWidth;
        }

        let ctxY = $canvasY[0].getContext("2d");
        for (let pos = fromY; pos < toY; pos += stepPx) {
            ctxY.beginPath();
            ctxY.moveTo(0, pos);
            ctxY.strokeStyle = CanvasEvent.rulerDate.lineColor;
            ctxY.lineWidth = 1;
            if (rulerY % textStepWidth === 0) {
                ctxY.lineTo(CanvasEvent.rulerDate.textLineTo, pos);
                ctxY.stroke();
                // 文字，刻度大小
                ctxY.fillStyle = CanvasEvent.rulerDate.textColor;
                ctxY.font = CanvasEvent.rulerDate.textFont;
                ctxY.translate(CanvasEvent.rulerDate.textY, pos);
                ctxY.rotate(270 * Math.PI / 180);
                ctxY.fillText(rulerY + "", CanvasEvent.rulerDate.textX, 0);
                ctxY.rotate(-270 * Math.PI / 180);
                ctxY.translate(-CanvasEvent.rulerDate.textY, -pos);
            } else {
                ctxY.lineTo(CanvasEvent.rulerDate.normalLineTo, pos);
                ctxY.stroke();
            }
            rulerY += stepWidth;
        }

        // 重建辅助线
        CanvasEvent.rulerLineReset();
    }
    // 标尺辅助线重建
    static rulerLineReset() {
        // 重建水平辅助线
        let linesHList = screenModel && screenModel.linesHorizontal || [];
        let hLength = linesHList.length;
        for (let i=0;i<hLength;i++) {
            let obj = linesHList[i];
            let valueX = obj.value;
            let $line = obj.$line;
            let rulerX = valueX - CanvasEvent.rulerDate.startRulerX;
            rulerX *= canvasModel.scale;
            rulerX = Math.round(rulerX);
            Z($line).css("left", rulerX)
                .find(".ruler-value").html(valueX);
        }

        // 重建垂直辅助线
        let linesVList = screenModel && screenModel.linesVertical || [];
        let vLength = linesVList.length;
        for (let i=0;i<vLength;i++) {
            let obj = linesVList[i];
            let valueY = obj.value;
            let $line = obj.$line;
            let rulerY = valueY - CanvasEvent.rulerDate.startRulerY;
            rulerY *= canvasModel.scale;
            rulerY = Math.round(rulerY);
            Z($line).css("top", rulerY)
                .find(".ruler-value").html(valueY);
        }
    }
    // 标尺事件初始化
    static rulerEventInit() {
        Canvas.$rulerHorizontal.on("mousemove", CanvasEvent.rulerHorizontalMouseMove)
            .on("mouseleave", CanvasEvent.rulerHorizontalMouseLeave)
            .on("click", CanvasEvent.rulerHorizontalClick);
        Canvas.$rulerVertical.on("mousemove", CanvasEvent.rulerVerticalMouseMove)
            .on("mouseleave", CanvasEvent.rulerVerticalMouseLeave)
            .on("click", CanvasEvent.rulerVerticalClick);
    }
    // 滚动条位置定位
    static scrollRelocation() {
        let stageRect = Canvas.$stage[0].getBoundingClientRect();
        let stageWidth = stageRect.width;
        let stageHeight = stageRect.height;
        let widthAbs = canvasModel.widthBg * canvasModel.scale;
        let heightAbs = canvasModel.heightBg * canvasModel.scale;

        let setWidth = stageWidth * (stageWidth / widthAbs);
        let setHeight = stageHeight * (stageHeight / heightAbs);
        if (setWidth >= stageWidth)
            setWidth = 0;
        if (setHeight >= stageHeight)
            setHeight = 0;

        // canvas_content，缩放后的内容，距离 stage 边缘偏移，正负值
        let boxLeft = canvasModel.width * (1 - canvasModel.scale)/2;
        let boxTop = canvasModel.height * (1 - canvasModel.scale)/2;
        boxLeft += canvasModel.screenLeft;
        boxTop += canvasModel.screenTop;

        // canvas_content，缩放后的内容，距离最大可视画布的偏移，绝对值
        let leftAbs = (canvasModel.widthBg - canvasModel.width)/2;
        let topAbs = (canvasModel.heightBg - canvasModel.height)/2;
        leftAbs *= canvasModel.scale;
        topAbs *= canvasModel.scale;
        // stage，距离最大可视画布的偏移，绝对值
        leftAbs -= boxLeft;
        topAbs -= boxTop;

        let setLeft = stageWidth * (leftAbs / widthAbs);
        let setTop = stageHeight * (topAbs / heightAbs);
        if (setLeft <= 0)
            setLeft = 0;
        if (setLeft + setWidth >= stageWidth)
            setLeft = stageWidth - setWidth;
        if (setTop <= 0)
            setTop = 0;
        if (setTop + setHeight >= stageHeight)
            setTop = stageHeight - setHeight;

        Canvas.$scrollHorizontal.css({
            width: setWidth,
            left: setLeft,
        });
        Canvas.$scrollVertical.css({
            height: setHeight,
            top: setTop,
        });
    }
    // 滚动条事件初始化
    static scrollEventInit() {
        Canvas.$scrollList.on("mousedown", (event)=> {
            let $scroll = Z(Z.E.current(event));
            let scrollType = $scroll.hasClass("scroll-horizontal") ? "horizontal" : "vertical";
            let scrollLeft = parseFloat($scroll.css("left"));
            let scrollTop = parseFloat($scroll.css("top"));
            CanvasEvent.mouseDownData = {
                x: event.clientX,
                y: event.clientY,
                scrollType: scrollType,
                scrollLeft: scrollLeft,
                scrollTop: scrollTop,
                $scroll: $scroll,
            };
            CanvasEvent.mouseDownType = "stageScroll";
        }).on("mousemove", CanvasEvent.stageMouseMove);
    }
    // 画布展示：标尺工具
    static showRuler() {
        if (canvasModel.showRuler)
            Canvas.$canvas.removeClass(CanvasEvent.hideRulerClass);
        else
            Canvas.$canvas.addClass(CanvasEvent.hideRulerClass);
    }
    // 画布展示：网格工具
    static showGrid() {
        if (canvasModel.showGrid){
            Canvas.$canvas.addClass(CanvasEvent.showGridClass);}
        else
            Canvas.$canvas.removeClass(CanvasEvent.showGridClass);
    }
    // 画布展示：布局工具
    static showLayout() {
        if (canvasModel.showLayout){
            Canvas.$canvas.addClass(CanvasEvent.showLayoutClass);}
        else
            Canvas.$canvas.removeClass(CanvasEvent.showLayoutClass);
    }
    // 画布展示：操作历史超前提示
    static showHistoryLead() {
        let indexListMax = HistoryDB.list.length - 1;
        if (HistoryDB.index < indexListMax) {
            if (CanvasEvent.dbHistoryLeadTipsId)
                return;

            let htmlStr = '<div id="' + CanvasEvent.dbHistoryLeadTipsId + '"><div>最新操作</div></div>';
            let $historyTip = Z(htmlStr).appendTo(Canvas.$toolContainer);
            $historyTip.find("div").on("click",(event)=> {

            });
        } else {
            Z("#" + CanvasEvent.dbHistoryLeadTipsId).remove();
        }
    }
    // 载入：当前页面、元素
    static loadScreen() {
        // 当前页面对象
        let screen = Screen.getScreen(canvasModel.screenId) || new Screen();

        // 页面标尺辅助线展示
        screen.linesHorizontal.forEach((lineObj)=> {
            if (lineObj.left === undefined && lineObj.top === undefined)
                return;
            lineObj.$line = CanvasEvent.insertHorizontalLine(lineObj);
        });
        screen.linesVertical.forEach((lineObj)=> {
            if (lineObj.left === undefined && lineObj.top === undefined)
                return;
            lineObj.$line = CanvasEvent.insertVerticalLine(lineObj);
        });


    }
    // 依数据插入辅助线
    static insertHorizontalLine(dataObj) {
        // 定义 $line
        let lineHtml = '<div class="' + CanvasEvent.rulerDate.lineClass + '" style="' +
            'height:' + Canvas.$design.offsetHeight() + 'px;' +
            'left:' + dataObj.left + 'px;' +
            ';">' +
            '   <div class="ruler-value">' + dataObj.value + '</div>' +
            '   <div class="ruler-delete"><i class="z-font z-error"></i></div>' +
            '</div>';
        let $line = Z(lineHtml).appendTo(Canvas.$rulerHorizontalLines);

        // 为辅助线添加事件
        CanvasEvent.rulerLineEventInit($line);

        return $line;
    }
    static insertVerticalLine(dataObj) {
        // 定义 $line
        let lineHtml = '<div class="' + CanvasEvent.rulerDate.lineClass + '" style="' +
            'width:' + Canvas.$design.offsetWidth() + 'px;' +
            'top:' + dataObj.top + 'px;' +
            ';">' +
            '   <div class="ruler-value">' + dataObj.value + '</div>' +
            '   <div class="ruler-delete"><i class="z-font z-error"></i></div>' +
            '</div>';
        let $line = Z(lineHtml).appendTo(Canvas.$rulerVerticalLines);

        // 为辅助线添加事件
        CanvasEvent.rulerLineEventInit($line);

        return $line;
    }
    // 为辅助线添加事件
    static rulerLineEventInit($line) {
        $line = Z($line);
        $line.on("mousedown", CanvasEvent.rulerLineMouseDown);
        $line.find(".ruler-delete").on("click", CanvasEvent.deleteRulerLine);
    }

    /********************************************
     ***************** 事件定义 *****************
     ********************************************/
    // 窗口变化
    static canvasResize() {
        // 偏移设置
        CanvasEvent.setTransform();
        // 标尺
        CanvasEvent.rulerRebuild();
        // 滚动条
        CanvasEvent.scrollRelocation();
        // 缩放值更新
        PanelTool.resetToolScale();
    }
    // 拖拽准备
    static stageGrabStart(event) {
        if (CanvasEvent.isSpacePress)
            return Z.E.forbidden(event);
        CanvasEvent.isSpacePress = true;
        Canvas.$design.addClass("grab");
    }
    // 拖拽结束
    static stageGrabEnd() {
        CanvasEvent.isSpacePress = false;
        Canvas.$design.removeClass("grab");
        Canvas.$design.removeClass("grabbing");
    }
    // stage：MouseDown
    static stageMouseDown(event) {
        // 记录当前鼠标
        CanvasEvent.mouseDownData = {
            x: event.clientX,
            y: event.clientY,
            canvasLeft: canvasModel.screenLeft,
            canvasTop: canvasModel.screenTop,
        };
        CanvasEvent.mouseDownType = CanvasEvent.isSpacePress ? "stageGrabbing" : "stageSelection";
        if (CanvasEvent.isSpacePress)
            Canvas.$design.addClass("grabbing");
    }
    // stage：MouseMove
    static stageMouseMove(event) {
        let isLeftButton = event["buttons"] === 1;
        if (!isLeftButton){
            CanvasEvent.stageMouseCancel();
            return;
        }

        // 判断是否有操作实现
        let eventList = ["stageGrabbing", "stageScroll", "stageSelection"];
        if (!eventList.includes(CanvasEvent.mouseDownType))
            return;

        // 执行操作
        Z.E.forbidden(event);
        let stageRect = Canvas.$stage[0].getBoundingClientRect();
        let data = CanvasEvent.mouseDownData;
        let mx = event.clientX - data.x;
        let my = event.clientY - data.y;

        // 画布操作判断
        switch (CanvasEvent.mouseDownType) {
            case eventList[0]:
            case eventList[1]: { // 画布拖拽、滚动条判断
                // canvas_content，缩放后的内容，距离最大可视画布的偏移， 绝对值
                let leftAbs = (canvasModel.widthBg - canvasModel.width)/2 * canvasModel.scale;
                let topAbs = (canvasModel.heightBg - canvasModel.height)/2 * canvasModel.scale;
                let rightAbs = (canvasModel.widthBg + canvasModel.width)/2 * canvasModel.scale;
                let bottomAbs = (canvasModel.heightBg + canvasModel.height)/2 * canvasModel.scale;

                // canvas_content，缩放后的内容，距离缩放前边缘的距离，绝对值
                let leftScaled = canvasModel.width * (1 - canvasModel.scale)/2;
                let topScaled = canvasModel.height * (1 - canvasModel.scale)/2;

                let transX = canvasModel.screenLeft;
                let transY = canvasModel.screenTop;
                switch (CanvasEvent.mouseDownType) {
                    case "stageGrabbing": {
                        transX = data.canvasLeft + mx;
                        transY = data.canvasTop + my;
                    } break;
                    case "stageScroll": {
                        if (data.scrollType !== "horizontal" && data.scrollType !== "vertical")
                            return;
                        if (data.scrollType === "horizontal") {
                            // 相对比例
                            let exRatio = (data.scrollLeft + mx)/stageRect.width;
                            // stage 距离边缘的距离
                            let stageLeftAbs = exRatio * canvasModel.widthBg * canvasModel.scale;
                            // content 距离 stage 的距离
                            transX = leftAbs - stageLeftAbs;
                            // box 距离 stage 的距离，即所求的left偏移
                            transX -= leftScaled;
                        } else {
                            // 相对比例
                            let exRatio = (data.scrollTop + my) / stageRect.height;
                            // stage 距离边缘的距离
                            let stageTopAbs = exRatio * canvasModel.heightBg * canvasModel.scale;
                            // content 距离 stage 的距离
                            transY = topAbs - stageTopAbs;
                            // box 距离 stage 的距离，即所求的top偏移
                            transY -= topScaled;
                        }
                    } break;
                }

                // box, 偏移最值
                let leftMax = leftAbs - leftScaled;
                let topMax = topAbs - topScaled;
                let leftMin = stageRect.width - rightAbs - leftScaled;
                let topMin = stageRect.height - bottomAbs - topScaled;

                // 赋值
                if (transX >= leftMax)
                    transX = leftMax;
                if (transX <= leftMin)
                    transX = leftMin;
                if (transY >= topMax)
                    transY = topMax;
                if (transY <= topMin)
                    transY = topMin;

                canvasModel.screenLeft = transX;
                canvasModel.screenTop = transY;

                // 偏移更新
                CanvasEvent.setTransform();
                // 画布自适应
                CanvasEvent.canvasResize();
            } break;
            case eventList[2]: { // 画布框选
                let $selection = Z.D.id(CanvasEvent.stageSelectionBoxId);
                if (!$selection){
                    $selection = document.createElement("div");
                    $selection.id = CanvasEvent.stageSelectionBoxId;
                    $selection.style.position = "absolute";
                    $selection.style.border = "1px solid #3399ff";
                    $selection.style.backgroundColor = "rgba(51,153,255,.5)";
                    Canvas.$toolContainer.append($selection);
                }
                Z($selection).css({
                    width: mx,
                    height: my,
                    left: data.x - stageRect.left,
                    top: data.y - stageRect.top,
                });
            } break;
        }
    }
    // stage：MouseUp
    static stageMouseUp(event) {
        Z.E.forbidden(event);
        CanvasEvent.stageMouseCancel();
    }
    // design：MouseMove
    static designMouseMove(event) {
        let isLeftButton = event["buttons"] === 1;
        if (!isLeftButton){
            CanvasEvent.stageMouseCancel();
            return;
        }

        // 判断是否有操作实现
        let eventList = ["rulerLineGrabbing"];
        if (!eventList.includes(CanvasEvent.mouseDownType))
            return;

        // 执行操作
        Z.E.forbidden(event);

        // 画布操作判断
        switch (CanvasEvent.mouseDownType) {
            case eventList[0]: {
                let $line = CanvasEvent.mouseDownData.$line;
                let $target = CanvasEvent.mouseDownData.$target;
                CanvasEvent.updateRulerLineMove(event, $line, $target);

                // 更新 screen 辅助线数据
                ScreenUpdate.rulerLine($line);
            } break;
        }
    }
    // 取消鼠标操作
    static stageMouseCancel() {
        // 重置类型
        CanvasEvent.mouseDownType = "";
        // 画布拖拽样式
        Canvas.$design.removeClass("grabbing");
        // 框选容器
        Z("#" + CanvasEvent.stageSelectionBoxId).remove();
        // 标尺事件
        Canvas.$rulerList.removeClass("event-none");
    }
    // mouseWheel
    static mouseWheel(event) {
        Z.E.forbidden(event);
        let eventType = event.type; //"DOMMouseScroll" ：火狐，"wheel"：谷歌，"mousewheel"：IE、Edge
        let wheelUp;
        if (eventType === "DOMMouseScroll")
            wheelUp = (event["detail"] < 0) ? 1 : 0;
        else if (eventType === "wheel" || eventType === "mousewheel")
            wheelUp = (event["wheelDeltaY"] > 0) ? 1 : 0;
        else
            return;

        let wheelPer = (wheelUp ? 1 : -1) * 80;
        let isCtrl = event.ctrlKey;
        let isAlt = event.altKey;

        if (!isCtrl && !isAlt) { // 普通轮滑，进行滚动
            let setTop = canvasModel.screenTop + wheelPer;

            // canvas_content，缩放后的内容，距离最大可视画布的偏移， 绝对值
            let topAbs = (canvasModel.heightBg - canvasModel.height)/2;
            let bottomAbs = (canvasModel.heightBg + canvasModel.height)/2;
            topAbs *= canvasModel.scale;
            bottomAbs *= canvasModel.scale;

            // canvas_content，缩放后的内容，距离缩放前边缘的距离，绝对值
            let heightScaled = canvasModel.height * (1 - canvasModel.scale)/2;

            // box, 偏移最值
            let topMax = topAbs - heightScaled;
            let stageRect = Canvas.$stage[0].getBoundingClientRect();
            let topMin = stageRect.height - bottomAbs - heightScaled;

            // 赋值
            if (setTop >= topMax)
                setTop = topMax;
            if (setTop <= topMin)
                setTop = topMin;
            canvasModel.screenTop = setTop;
        } else { // 进行缩放
            let setLeft = canvasModel.screenLeft;
            let setTop = canvasModel.screenTop;
            // 计算鼠标相对位置
            let contentRect = Canvas.$content[0].getBoundingClientRect();
            let contentWidth = contentRect.width;
            let contentHeight = contentRect.height;

            // 计算缩放大小
            let setWidth = contentWidth + wheelPer;
            if (setWidth <= canvasModel.widthMin)
                setWidth = canvasModel.widthMin;
            let setScale = setWidth/canvasModel.width;
            if (setScale <= canvasModel.scaleMin)
                setScale = canvasModel.scaleMin;
            if (setScale >= canvasModel.scaleMax)
                setScale = canvasModel.scaleMax;
            setScale = parseFloat(setScale.toFixed(2));

            if (isAlt) { // alt 键：鼠标位置不变，画布缩放
                (()=> {
                    if (setScale === canvasModel.scale)
                        return ;
                    // content 相对stage的left、top
                    setWidth = canvasModel.width * setScale;
                    let setHeight = canvasModel.height * setScale;
                    let mouseLoc = {x: event.clientX, y: event.clientY};
                    let leftRatio = (mouseLoc.x - contentRect.left)/contentWidth;
                    let topRatio = (mouseLoc.y - contentRect.top)/contentHeight;
                    let stageRect = Canvas.$stage[0].getBoundingClientRect();
                    let leftToPage = mouseLoc.x - leftRatio * setWidth;
                    let topToPage = mouseLoc.y - topRatio * setHeight;
                    setLeft = leftToPage - stageRect.left;
                    setTop = topToPage - stageRect.top;

                    // box 相对stage的 left、top
                    setLeft -= (canvasModel.width - setWidth)/2;
                    setTop -= (canvasModel.height - setHeight)/2;
                })();
            }

            // canvasModel 实例属性
            canvasModel.screenLeft = setLeft;
            canvasModel.screenTop = setTop;
            canvasModel.scale = setScale;
        }

        // 画布自适应
        CanvasEvent.canvasResize();
    }
    // 标尺的的mouseMove
    static rulerHorizontalMouseMove(event) {
        if (event.buttons > 0)
            return;

        // 判断是不是有效范围
        let mouseLoc = Const.getFixedCoords(event, Canvas.$rulerHorizontal);
        if (mouseLoc.y < 0 || mouseLoc.y > Canvas.$rulerHorizontal.offsetHeight())
            return;

        // 绘制更新辅助线
        CanvasEvent.getEventRulerLine(event);
    }
    static rulerVerticalMouseMove(event) {
        if (event.buttons > 0)
            return;

        // 判断是不是有效范围
        let mouseLoc = Const.getFixedCoords(event, Canvas.$rulerVertical);
        if (mouseLoc.x < 0 || mouseLoc.x > Canvas.$rulerVertical.offsetWidth())
            return;

        // 绘制更新辅助线
        CanvasEvent.getEventRulerLine(event);
    }
    // 标尺，鼠标离开移除辅助线
    static rulerHorizontalMouseLeave(){
        // 移除临时辅助
        Z("#" + CanvasEvent.rulerDate.lineHorizontalId).remove();
    }
    static rulerVerticalMouseLeave() {
        // 移除临时辅助
        Z("#" + CanvasEvent.rulerDate.lineVerticalId).remove();
    }
    // 标尺，设置辅助线
    static rulerHorizontalClick(event) {
        // 判断是不是有效范围
        let mouseLoc = Const.getFixedCoords(event, Canvas.$rulerHorizontal);
        if (mouseLoc.y < 0 || mouseLoc.y > Canvas.$rulerHorizontal.offsetHeight())
            return;

        // 设置辅助线
        let $line = CanvasEvent.getEventRulerLine(event);
        let nreLineObj = {
            "value": parseFloat($line.find(".ruler-value").html()),
            "$line": $line[0],
        };
        screenModel.linesHorizontal.push(nreLineObj);
    }
    static rulerVerticalClick(event) {
        // 判断是不是有效范围
        let mouseLoc = Const.getFixedCoords(event, Canvas.$rulerVertical);
        if (mouseLoc.x < 0 || mouseLoc.x > Canvas.$rulerVertical.offsetWidth())
            return;

        // 设置辅助线
        let $line = CanvasEvent.getEventRulerLine(event);
        let nreLineObj = {
            "value": parseFloat($line.find(".ruler-value").html()),
            "$line": $line[0],
        };
        screenModel.linesVertical.push(nreLineObj);
    }
    // 返回当前鼠标move事件的辅助线：新建或获取
    static getEventRulerLine(event) {
        let $target = event.currentTarget;
        let isHorizontal = $target === Canvas.$rulerHorizontal[0];
        let eventType = event.type;
        let lineId = eventType === "mousemove" ?
            (isHorizontal ? CanvasEvent.rulerDate.lineHorizontalId : CanvasEvent.rulerDate.lineVerticalId) :
            "";

        // 定义辅助线
        let $line = Z.D.id(lineId);
        if (!$line) {
            // 新建辅助线
            let $lines = Z($target).find(".ruler-lineList");
            let lineHtml = '<div id="' + lineId + '" class="' + CanvasEvent.rulerDate.lineClass + '">' +
                '   <div class="ruler-value"></div>';
            if (!lineId)
                lineHtml += '<div class="ruler-delete"><i class="z-font z-error"></i></div>' +
                    '</div>';
            $line = Z(lineHtml).appendTo($lines);

            // 赋值长度、宽度
            if (isHorizontal) {
                $line.css("height", Canvas.$design.offsetHeight());
            } else {
                $line.css("width", Canvas.$design.offsetWidth());
            }

            // 添加事件
            !lineId && CanvasEvent.rulerLineEventInit($line);
        }
        $line = Z($line);

        // 更新位置
        CanvasEvent.updateRulerLineMove(event, $line, $target);

        // 返回当前辅助线
        return $line;
    }
    // 更新指定辅助线位置、值
    static updateRulerLineMove(event, $line, $target) {
        $line = Z($line);
        $target = Z($target || event.currentTarget);
        let isHorizontal = $target[0] === Canvas.$rulerHorizontal[0];
        // 计算位置
        let mouseLoc = Const.getFixedCoords(event, $target);
        let rulerX = Math.round(mouseLoc.x);
        let rulerY = Math.round(mouseLoc.y);
        let valueX = rulerX / canvasModel.scale;
        let valueY = rulerY / canvasModel.scale;
        valueX = Math.round(valueX + CanvasEvent.rulerDate.startRulerX);
        valueY = Math.round(valueY + CanvasEvent.rulerDate.startRulerY);
        // 更新位置和显示值
        if (isHorizontal) {
            Z($line).css("left", rulerX)
                .find(".ruler-value").html(valueX);
        } else {
            Z($line).css("top", rulerY)
                .find(".ruler-value").html(valueY);
        }
    }
    // 辅助线操作
    static rulerLineMouseDown(event) {
        // 记录点击数据
        let $line = event.currentTarget;
        let $target = Const.hasClassParent($line, "ruler-horizontal") ?
            Canvas.$rulerHorizontal : Canvas.$rulerVertical;
        CanvasEvent.mouseDownData = {};
        CanvasEvent.mouseDownData.$line = $line;
        CanvasEvent.mouseDownData.$target = $target;
        CanvasEvent.mouseDownType = "rulerLineGrabbing";

        // 修改标尺样式
        Canvas.$rulerList.addClass("event-none");
    }
    // 删除辅助线
    static deleteRulerLine(event) {
        Z.E.forbidden(event);

        let $line = event.currentTarget.parentElement;
        let isHorizontal = Const.hasClassParent($line, "ruler-horizontal");
        let linesArr = isHorizontal ? screenModel.linesHorizontal : screenModel.linesVertical;

        // 遍历，移除指定数据
        for (let i = 0;i < linesArr.length;i++) {
            let obj = linesArr[i];
            if (Z(obj.$line)[0] !== $line) {
                continue;
            }
            linesArr.splice(i, 1);
            break;
        }

        // 移除页面元素
        Z($line).remove();
        CanvasEvent.rulerHorizontalMouseLeave();
        CanvasEvent.rulerVerticalMouseLeave();
    }







    /********************************************
     ***************** 元素操作 *****************
     ********************************************/
    // 定位select-tool的位置、大小
    static setToolStaticLoc($curElem) {
        // 1：定义变量
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();
        let $gWrap = $curElem.querySelector('g');
        let $svg = [...$gWrap.children].pop();
        let transformList = $curElem.transform.baseVal;
        let svgType = $svg.getAttribute("data-targetType");
        let lt = Const.matrixTranslate($curElem);
        let setLeft = 0, setTop = 0;
        if (svgType !== "shape-line" && !lt){
            setLeft = transformList[0].matrix.e;
            setTop = transformList[0].matrix.f;
        } else {
            setLeft = lt[0];
            setTop = lt[1];
        }
        let setTrans = "rotate(" + transformList[1].angle + "deg)";

        // 3：计算 width、height
        let showRatio = media.tool.showRatio;
        let setWidth = $svg.width.baseVal.value;
        let setHeight = $svg.height.baseVal.value;
        setWidth *= showRatio;
        setHeight *= showRatio;

        // 4：计算 left、top
        let designStage = media.tool.$designStage.getBoundingClientRect();
        let bgRect = media.tool.$canvasBg.getBoundingClientRect();
        setLeft *= showRatio;
        setTop *= showRatio;
        setLeft += bgRect.left - designStage.left;
        setTop += bgRect.top - designStage.top;

        // 5：形状“线条”，特殊处理
        if (svgType === "shape-line") {
            setWidth += 10;
            setHeight += 10;
            setLeft -= 5;
            setTop -= 5;
        }

        // 6：定位
        Z("#selection_tool").css({
            "width": setWidth,
            "height": setHeight,
            "left": setLeft,
            "top": setTop,
            "transform": setTrans
        })
    }
    // 多选状态的辅助框位置显示实现
    static selectionToolsShow_group() {
        if (media.selectedList.length === 0)
            return;
        // 显示工具栏
        EditBtnTool.showEditToolbar();
        // 单素材
        if (media.selectedList.length === 1)
            return SelectionTool.selectionToolsShow();
        // 多素材，最终的参数
        let width, height, left, top;
        // 过度数据
        let leftArr = [], topArr = [], rightArr = [], bottomArr = [];
        for (let mid of media.selectedList) {
            let elem = media.tool.getSvgElementByMid(parseInt(mid));
            let elemData = SelectionTool.getEleClientRect(elem);
            leftArr.push(elemData.left);
            topArr.push(elemData.top);
            rightArr.push(elemData.left_right);
            bottomArr.push(elemData.top_bottom);
        }

        // 赋值大小，定位
        let stageRect = media.tool.$designStage.getBoundingClientRect();
        let bgRect = media.tool.$canvasBg.getBoundingClientRect();
        left = Const.getMinNum(leftArr);
        top = Const.getMinNum(topArr);
        width = Const.getMaxNum(rightArr) - left;
        height = Const.getMaxNum(bottomArr) - top;
        left += bgRect.x - stageRect.x;
        top += bgRect.y - stageRect.y;

        // 页面呈现效果
        let firstMaterial = media.tool.getMaterialByMid(parseInt(media.selectedList[0]));
        let selector = "#selection_tool";
        if (firstMaterial.status === 3)
            selector = "#selection_lock";

        // 显示辅助框前，先隐藏所有
        SelectionTool.selectionAll_hide();
        Z(selector).removeAttr("style").css({"width": width, "height": height, "left": left, "top": top}).addClass("groupTool").show();
        if (Z(selector).hasClass("lineRotate"))
            Z(selector).removeClass("lineRotate");

        // 显示对应的图层选中
        Z(media.tool.$layerList).children("li").removeClass("active");
        for (let mid of media.selectedList)
            Z(media.tool.$layerList).find("li[data-mid='" + mid + "']").addClass("active");

        // 隐藏参数列表的选中参数
        Z("#paramList>li").removeClass("active");
    }
    // 素材组的情况，保存数据
    static saveGroupElemData() {
        let dataArr = [];
        for (let i=0;i<media.selectedList.length;i++) {
            let mid = media.selectedList[i];
            let $elem = media.tool.getCurSvgElement(i);
            let transformList = $elem.transform.baseVal;
            let e, f;
            for (let j=0;j<transformList.length;j++){
                if (transformList[j].targetType === 2){
                    e = transformList[j].matrix.e;
                    f = transformList[j].matrix.f;
                    break;
                }
            }
            //保存数据
            dataArr.push({
                "index": i,
                "mid": mid,
                "left": e,
                "top": f,
            });
        }
        media.event.startData.elemsData = dataArr;

        let x = Z('#material_x').val();
        let y = Z('#material_y').val();
        if({}.createMode === 0) {//毫米
            x = Exchange.mm2px(x, {}.dpi);
            y = Exchange.mm2px(y, {}.dpi);
        }
        x = parseFloat(x.toFixed(4));
        y = parseFloat(y.toFixed(4));
        media.event.startData.targData = {
            "x": x,
            "y": y,
        }
    }
    // 缩放编辑框
    static selectionTool_show($elem) {
        $elem = $elem || media.tool.tempElement || media.tool.getCurSvgElement();
        SelectionTool.selectionAll_hide();
        SelectionTool.selectionToolsShow("#selection_tool", $elem);
    }
    // 全部隐藏
    static selectionAll_hide(clear) {
        SelectionTool.selectionToolsHide(".selection-tool", clear);
    }
    // 辅助框位置显示实现
    static selectionToolsShow(id, $curElem) {
        // 1：定义变量
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();
        if (!$curElem)
            return;
        let material = media.tool.getMaterialByMid(parseInt($curElem.getAttribute("data-mid")));
        if (!material)
            return;
        if (!id) {
            if (material.status === 0)
                id = "#selection_tool";
            else if (material.status === 3)
                id = "#selection_lock";
        }
        let $gWrap = $curElem.querySelector('g');
        let $svg = [...$gWrap.children].pop();
        let showRatio = media.tool.showRatio;
        let $selTool = Z(id);

        // 2：获取素材偏移，考虑翻转后的效果
        let transAngle, setLeft, setTop;
        for (let item of $curElem.transform.baseVal) {
            if (item.targetType === 2){
                setLeft = item.matrix.e;
                setTop = item.matrix.f;
            }
            if (item.targetType === 4){
                transAngle = item.angle;
            }
        }

        // 3：计算 width、height
        let setWidth = $svg.width.baseVal.value;
        let setHeight = $svg.height.baseVal.value;
        setWidth *= showRatio;
        setHeight *= showRatio;

        // 4：计算 left、top
        let canvasRect = media.tool.$designStage.getBoundingClientRect();
        let bgRect = media.tool.$canvasBg.getBoundingClientRect();
        setLeft *= showRatio;
        setTop *= showRatio;
        setLeft += bgRect.left - canvasRect.left;
        setTop += bgRect.top - canvasRect.top;

        // 5：形状“线条”特殊处理
        if ($svg.getAttribute("data-targetType") === "shape-line") {
            setWidth += 10;
            setHeight += 10;
            setLeft -= 5;
            setTop -= 5;
            $selTool.addClass("lineRotate");
        } else {
            $selTool.removeClass("lineRotate");
        }

        // 6：定位
        $selTool.css({
            "width": setWidth,
            "height": setHeight,
            "left": setLeft,
            "top": setTop,
            "transform": "rotate(" + transAngle + "deg)",
            "display": "block",
        });

        // 7：显示辅助框时，如果是选中框，判断参数列表是否需要显示
        if (id !== "#selection_tool" && id !== "#selection_lock")
            return;
        Z('#paramList>li').removeClass("active");
        if (media.selectedList.length === 1) {
            if (!material.paramKey || !material.paramName)
                return;
            let $targLi = Z('#paramList>li[data-mid="'+material.mid+'"][data-bid="'+material.bid+'"]');
            if (parseFloat($targLi.attr("data-bid")) === parseFloat(media.curPage))
                $targLi.addClass("active");
            else
                Z("#paramList>li").removeClass("active");
        }

        // 8：缩放选择框显示，区分不同类型
        if (id === "#selection_lock")
            return;
        Z("#selection_tool>.rotate>span").html("");
        let svgType = $curElem.querySelector("svg").getAttribute("data-targetType");
        if (material.targetType === 1)
            $selTool.attr("class", "selection-tool resizePoint textTool");
        else if (material.targetType === 4)
            $selTool.attr("class", "selection-tool resizePoint frameTool");
        else if (material.targetType === 5) {
            if (svgType === "shape-line")
                $selTool.attr("class", "selection-tool resizePoint lineRotate");
            else
                $selTool.attr("class", "selection-tool resizePoint");
        } else
            $selTool.attr("class", "selection-tool resizePoint");
    }
    // 更新画布中显示的辅助框位置
    static setAllToolLoc() {
        // 悬浮框
        let $hoverTool = Z("#selection_hover");
        !$hoverTool.isHide() && SelectionTool.selectionHover_show($hoverTool[0].$targ);
        // 选中框、锁定框
        SelectionTool.selectionToolsShow_group();
        // 如果存在编辑框
        if (!Z.D.id("textEditor") || !Z.D.id("textEditor").hasAttribute("style"))
            return;
        // 同步缩放文本编辑框
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $wrap = Z.D.id("textEditorWrap");
        let $editor = Z.D.id("textEditor");
        let showRatio = media.tool.showRatio;
        let oldR = media.event.startData.editorOldLoc.r;
        let setWidth = parseFloat(Z($editor).css('width')) * showRatio / oldR;
        let setHeight = parseFloat(Z($editor).css('height')) * showRatio / oldR;
        let setLeft = parseFloat(Z($wrap).css('left')) * showRatio / oldR;
        let setTop = parseFloat(Z($wrap).css('top')) * showRatio / oldR;

        let textZoom = material.textZoom.split(" ");
        let fontSize = material.fontSize;
        let transOrigin = setWidth * parseFloat(textZoom[0]) / 2 + "px " + setHeight * parseFloat(textZoom[1]) / 2 + "px 0px";
        if (parseFloat({}.createMode) === 0)
            fontSize = Exchange.pt2px(fontSize);

        Z($editor).css({
            "width": setWidth,
            "fontSize" : fontSize * showRatio,
            "letterSpacing": parseFloat(material.letterSpacing) * showRatio + "px",
            "lineHeight": parseFloat(material.lineHeight) * showRatio + "px",
        });
        Z($wrap).css({
            "left": setLeft,
            "top": setTop,
            "transform-origin": transOrigin,
        });

        // 重计算 editorOldLoc
        let oldX = media.event.startData.editorOldLoc.x;
        let oldY = media.event.startData.editorOldLoc.y;
        media.event.startData.editorOldLoc = {
            'x' : oldX * showRatio / oldR,
            'y' : oldY * showRatio / oldR,
            'r' : showRatio,
        }

    }
    // 锁定框辅助框
    static selectionLock_show($elem) {
        $elem = $elem || media.tool.tempElement || media.tool.getCurSvgElement();
        SelectionTool.selectionAll_hide();
        SelectionTool.selectionToolsShow("#selection_lock",$elem);
    }
    // 鼠标悬浮显示框
    static selectionHover_show($elem) {
        $elem = $elem || media.tool.tempElement || media.tool.getCurSvgElement();
        SelectionTool.selectionToolsShow("#selection_hover",$elem);
    }
    // 隐藏辅助框
    static selectionHover_hide(clear) {
        SelectionTool.selectionToolsHide("#selection_hover", clear);
    }
    // 缩放编辑框
    static selectionTool_hide(clear) {
        SelectionTool.selectionToolsHide("#selection_tool", clear);
    }
    // 锁定框
    static selectionLock_hide(clear) {
        SelectionTool.selectionToolsHide("#selection_lock", clear);
    }
    static selectionToolsHide(selector, clear) {
        Z(selector).removeAttr("style").removeClass("groupTool");
        if (clear)
            media.tool.clearSelected();
    }

}
