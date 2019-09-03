/*!
 * MediaEvent.js v1.5.0
 *
 * media相关的事件操作
 *
 */

class MediaEvent {
    constructor($media) {
        MediaEvent.prototype.$media = $media;
        MediaEvent.prototype.$tool = $media.tool;
        this.startData = {};                           //  事件操作开始时的数据
        this.doingData = {};                           //  拖动操作进行时的数据
        this.textMaterial = null;                      //  文字编辑过程，临时素材对象
        this.textElement = null;                       //  文字编辑过程，临时节点元素
        this.dragMaterial = null;                      //  拖拽事件时，拖拽的对象
        this.dragFrameImg = null;                      //  拖拽事件时，存储临时的容器图片对象
        this.shapeType = null;                         //  形状编辑工具类型；
                                                       //      1：线条，2：矩形，3:矩形框， 4：圆形，11：钢笔
        this.elemEditToolData = {};                    //  钢笔编辑过程，数据存储
        this.penEditHistory = null;                    //  历史纪录对象
    }

    /********************************************
     ************ 一: mousedown判断 *************
     ********************************************/
    // 1.1: 画布的mousedown判断
    canvasMouseDown(event) {
        // 1：是否左键鼠标操作
        if (event.button !== 0)
            return;

        // 2：校验是否在 textEditor 内，文本编辑状态
        let isInTextEditor = false;
        let $target = Z.E.target(event);
        let $tempTarget = $target;
        while ($tempTarget !== this.$tool.$designStage) {
            if ($tempTarget.id === "textEditor"){
                isInTextEditor = true;
                break;
            }
            $tempTarget = $tempTarget.parentNode;
        }
        if (isInTextEditor)
            return;

        // 3：禁用冒泡事件，
        Z.E.stop(event);
        EditBtnTool.miniPopupHide();

        // 4: 根据点击对象，分情况处理
        if ($target === this.$tool.$designStage || $target === this.$tool.$canvasSvg) {
            EditBtnTool.stageDefault();                                        // 1：框选素材
            this.boxSelectStart(event);
            // 2：画布拖动
        } else if ($target === this.$tool.$svgCover) {
            this.canvasDragStart(event);                                // 2：移动画布
            // 3：素材拖动
        } else if ($target.id === "selection_tool") {
            let selectLength = this.$media.selectedList.length;
            if (selectLength === 1)
                this.singleDragStart(event);                           // 3.1：单素材拖动
            else if (selectLength > 1)
                this.groupDragStart(event);                            // 3.2：素材组拖动
            // 4：缩放操作
        } else if ($target.tagName.toLowerCase() === "div" && $target.className.indexOf("point") > -1) {
            let pNode = $target.parentNode;
            if (pNode.id === "selection_tool"){
                let selectLength = this.$media.selectedList.length;
                // 4.1:素材缩放操作
                if (selectLength === 1) {
                    this.singleZoomStart(event);                        // 4.1.1：单素材缩放
                } else if (selectLength > 1) {
                    this.groupZoomStart(event);                         // 4.1.2：素材组缩放
                }
            } else if (pNode.id === "textEditorPoint") {
                // 4.2:文字编辑框缩放操作
                this.editorResizeStart(event);                          // 4.2：文本输入框缩放
            }
            // 5：绘制形状
        } else if ($target.id === "shapeEditorCover") {
            this.drawShapeStart(event);                                 // 5：形状绘制
            // 5：钢笔工具
        } else if ($target.id === "penEditorCover") {
            this.penDrawStart(event);                                  // 6：钢笔工具
        }
    }
    // 1.2: 素材的mousedown操作，选中操作
    eleMouseDown(event) {
        Z.E.stop(event);
        // 隐藏弹窗
        EditBtnTool.miniPopupHide();
        // 去除编辑工具
        EditBtnTool.removeAllEditTool();
        // 文字编辑
        if (Z.D.id("textEditorWrap").getAttribute("style"))
            return;
        // 图片容器编辑
        if (!Z("#imgFrameEditor")[0].hasAttribute("style"))
            this.$tool.setTempCurrent();
        // 背景图层校验
        let $curElem = event.currentTarget;
        let material = this.$tool.getMaterialByMid(parseInt($curElem.getAttribute('data-mid')));
        if (!material.bgMaterial && $curElem.getAttribute('data-bgmaterial'))
            $curElem.removeAttribute('data-bgmaterial');
        // 是否按下了shift键，且已存在选中，执行多选
        event.shiftKey ? this.multipleSelectStart(event) : this.singleSelectStart(event);
    }

    /********************************************
     ************* 二: 拖拽与缩放 ***************
     ********************************************/
    // 2.1: 移动画布
    canvasDragStart(event) {
        this.startData.mouseLoc = Const.getMouseLocation(event);
        this.startData.stageX = this.$tool.$stageCanvas.offsetLeft;
        this.startData.stageY = this.$tool.$stageCanvas.offsetTop;

        // 事件绑定
        Z(this.$tool.$designStage).on("mousemove",this.canvasDragDoing,this);
        Z(this.$tool.$designStage).on("mouseup mouseleave",this.canvasDragDone,this);
    }
    canvasDragDoing(event) {
        Z.E.cancel(event);
        let nowMouseLoc = Const.getMouseLocation(event);
        let mouseMetabolic = {
            "x": nowMouseLoc.x - this.startData.mouseLoc.x,
            "y": nowMouseLoc.y - this.startData.mouseLoc.y,
        };
        if (mouseMetabolic.x === 0 && mouseMetabolic.y === 0)
            return;

        // 赋值画布的坐标样式
        Z(this.$tool.$stageCanvas).css({
            "left": this.startData.stageX + mouseMetabolic.x,
            "top": this.startData.stageY + mouseMetabolic.y,
        });
        // 设置缩略图位置
        Const.refreshZoomArea();
        // 选择框定位
        SelectionTool.selectionToolsShow_group();
    }
    canvasDragDone() {
        Z(this.$tool.$designStage).off("mousemove",this.canvasDragDoing,this);
        Z(this.$tool.$designStage).off("mouseup mouseleave",this.canvasDragDone,this);
    }
    // 2.2：素材框选
    boxSelectStart(event) {
        this.startData.boxSelectLoc = Const.getMouseLocation(event);
        //储存素材数据
        SelectionTool.guideGetInfo(true);
        Z(this.$tool.$designStage).on("mousemove",this.boxSelectDoing,this);
        Z(this.$tool.$designStage).on("mouseup mouseleave",this.boxSelectDone,this);
    }
    boxSelectDoing(event) {
        Z.E.cancel(event);
        let nowMouseLoc = Const.getMouseLocation(event);
        let width = nowMouseLoc.x - this.startData.boxSelectLoc.x;
        let height = nowMouseLoc.y - this.startData.boxSelectLoc.y;
        if (width === 0 && height === 0)
            return;

        let clientRect = this.$tool.$stageCanvas.getBoundingClientRect();
        let left = this.startData.boxSelectLoc.x - clientRect.left;
        let top = this.startData.boxSelectLoc.y - clientRect.top;
        if (width < 0){
            width = Math.abs(width);
            left -= width;
        }
        if (height < 0){
            height = Math.abs(height);
            top -= height;
        }
        Z('#selection_group').css({
            "width": width, "height": height, "left": left, "top": top,
        });
    }
    boxSelectDone() {
        Z(this.$tool.$designStage).off("mousemove",this.boxSelectDoing,this);
        Z(this.$tool.$designStage).off("mouseup mouseleave",this.boxSelectDone,this);
        //执行多选结果，显示缩放框
        SelectionTool.getSvgElementGroup();
        Z('#selection_group').removeAttr("style");
    }
    // 2.3：单素材拖动
    singleDragStart(event) {
        // 判断，如果
        let $target = this.$tool.tempElement || this.$tool.getCurSvgElement();
        this.startData.targData = this.$tool.getEleData($target);
        this.startData.mouseLoc = Const.getMouseLocation(event);

        // 显示半透明效果
        let $curElem = this.$tool.tempElement || this.$tool.getCurSvgElement();
        let material = this.$tool.tempMaterial || this.$tool.getCurMaterial();
        if (!$curElem || !material) {
            return;
        }

        $curElem.setAttribute("opacity", ".7");

        // 辅助线
        SelectionTool.guideGetInfo();
        // 事件绑定
        Z(this.$tool.$designStage).on("mousemove",this.singleDragDoing,this);
        Z(this.$tool.$designStage).on("mouseup mouseleave",this.singleDragDone,this);

        //设置当前拖拽对象
        this.dragMaterial = material;
    }
    singleDragDoing(event) {
        Z.E.cancel(event);

        let material = this.dragMaterial || this.$tool.tempMaterial || this.$tool.getCurMaterial();
        let $curElem = this.$tool.getSvgElementByMid(material.mid);
        if (!this.startData.mouseLoc) {
            Z("g[id^=svgElementSon_]").removeAttr("opacity");
            Z(this.$tool.$designStage).off("mousemove",this.singleDragDoing,this);
            Z(this.$tool.$designStage).off("mouseup mouseleave",this.singleDragDone,this);
            this.dragMaterial = null;
            return;
        }

        let nowMouseLoc = Const.getMouseLocation(event);
        this.doingData = {
            "x": (nowMouseLoc.x - this.startData.mouseLoc.x) / this.$tool.showRatio,
            "y": (nowMouseLoc.y - this.startData.mouseLoc.y) / this.$tool.showRatio,
        };
        if (this.doingData.x === 0 && this.doingData.y === 0) {
            return;
        }

        material.type = parseFloat(material.type);
        // 图片素材，特殊处理；为拖动至容器做准备，pointer-events：none
        if (material.type === 0 || material.type === 2) {
            let curElemClass = $curElem.getAttribute("class") || "";
            if (curElemClass && curElemClass.indexOf("imgDragging") === -1) {
                curElemClass = Z.S.trim(curElemClass) + " imgDragging";
                $curElem.setAttribute("class",curElemClass);
            } else if (!curElemClass) {
                $curElem.setAttribute("class","imgDragging");
            }
        }
        // transform，相关参数
        let x = this.startData.targData.x + this.doingData.x;
        let y = this.startData.targData.y + this.doingData.y;

        // 更新素材坐标
        ElementUpdate.updateSvgLocation(x, y);

        // 更新辅助线
        SelectionTool.guideSetInfo();
        SelectionTool.setToolStaticLoc();
    }
    singleDragDone() {
        // 清除对齐辅助线
        Z(".guide-line").remove();
        // 去除半透明效果
        Z("g[id^=svgElementSon_]").removeAttr("opacity");

        let $curElem = this.$tool.tempElement || this.$tool.getCurSvgElement();
        let material = this.$tool.tempMaterial || this.$tool.getCurMaterial();
        if (!$curElem || !material)
            return;

        // 图片素材，复原事件
        this.removeImgDraging(material, $curElem);
        // 更新素材存储
        ElementUpdate.updateMaterialSource();
        // 保存历史
        PrototypeHistory.saveHistory();
        // 清除事件
        Z(this.$tool.$designStage).off("mousemove",this.singleDragDoing,this);
        Z(this.$tool.$designStage).off("mouseup mouseleave",this.singleDragDone,this);
        // 清空保存数据
        this.dragMaterial = null;
    }
    // 2.4：素材组拖动
    groupDragStart(event) {
        this.startData.mouseLoc = Const.getMouseLocation(event);
        this.startData.targData = {
            "x": Z('#selection_tool').offsetLeft() / this.$tool.showRatio,
            "y": Z('#selection_tool').offsetTop() / this.$tool.showRatio,
        };
        this.startData.elemsData = (()=> {
            let arr = [];
            for (let i = 0;i < this.$media.selectedList.length;i++){
                let mid = this.$media.selectedList[i];
                let $elem = this.$tool.getCurSvgElement(i);
                let transformList = $elem.transform.baseVal;
                let x, y;
                for (let j = 0;j < transformList.length;j++){
                    if (transformList[j].targetType === 2){
                        x = transformList[j].matrix.e;
                        y = transformList[j].matrix.f;
                        break;
                    }
                }
                // 显示半透明效果
                $elem.setAttribute("opacity", ".7");
                // 保存数据
                arr.push({
                    "index": i,
                    "mid": mid,
                    "left": x,
                    "top": y,
                });
            }
            return arr;
        })();

        // 辅助线
        SelectionTool.guideGetInfo();
        // 事件绑定
        Z(this.$tool.$designStage).on("mousemove",this.groupDragDoing,this);
        Z(this.$tool.$designStage).on("mouseup mouseleave",this.groupDragDone,this);
    }
    groupDragDoing(event) {
        Z.E.cancel(event);
        let nowMouseLoc = Const.getMouseLocation(event);
        this.doingData = {
            "x": (nowMouseLoc.x - this.startData.mouseLoc.x) / this.$tool.showRatio,
            "y": (nowMouseLoc.y - this.startData.mouseLoc.y) / this.$tool.showRatio,
        };
        if (this.doingData.x === 0 && this.doingData.y === 0) {
            return;
        }

        //辅助框展示
        let toolX = (this.startData.targData.x + this.doingData.x) * this.$tool.showRatio;
        let toolY = (this.startData.targData.y + this.doingData.y) * this.$tool.showRatio;
        Z("#selection_tool").css("left",toolX).css("top",toolY);

        for (let elemData of this.startData.elemsData) {
            let mLeft = elemData.left + this.doingData.x;
            let mTop = elemData.top + this.doingData.y;

            let material = this.$tool.getCurMaterial(elemData.index);
            let $elem = this.$tool.getCurSvgElement(elemData.index);

            material.x = mLeft;
            material.y = mTop;
            // 画布展示
            let trans = $elem.getAttribute("transform");
            trans = trans.replace(/translate\([^)]+\)/,"translate(" + mLeft + " " + mTop + ")");
            $elem.setAttribute("transform",trans);
        }

        //拖动辅助线，对比信息，设置辅助线
        SelectionTool.guideSetInfo();
    }
    groupDragDone() {
        // 清除事件
        Z(this.$tool.$designStage).off("mousemove",this.groupDragDoing,this);
        Z(this.$tool.$designStage).off("mouseup mouseleave",this.groupDragDone,this);

        // 清除对齐辅助线
        Z(".guide-line").remove();
        for (let elemData of this.startData.elemsData) { // 拖动操作仅改变位移，直接更新source
            let material = this.$tool.getCurMaterial(elemData.index);
            let $elem = this.$tool.getCurSvgElement(elemData.index);
            ElementUpdate.updateMaterialSource(material, $elem);
        }
        // 去除半透明效果
        Z("g[id^=svgElementSon_]").removeAttr("opacity");
        // 保存历史
        PrototypeHistory.saveHistory();
    }
    // 2.5：单素材缩放
    singleZoomStart(event) {
        let $targ = Z.E.target(event);
        if (!$targ.hasAttribute("data-targetType")) {
            return;
        }

        // 定义 this.startData
        let type = Z($targ).attr("data-targetType");
        let $curElem = this.$tool.tempElement || this.$tool.getCurSvgElement();
        let $gWrap = $curElem.querySelector('g');
        let $svg = [...$gWrap.children].pop();
        if ($svg.innerHTML === ''){
            return;
        }

        let svgType = $svg.getAttribute("data-targetType");
        let elemData = this.$tool.getEleData($curElem);
        this.startData.mouseLoc = Const.getMouseLocation(event);
        this.startData.targData = Z.clone(elemData);
        this.startData.rectRatio = parseFloat(elemData.width) / parseFloat(elemData.height);
        this.startData.angle = $curElem.transform.baseVal[1].angle;
        this.startData.targetType = type;
        this.startData.axis = Z($targ).attr("data-axis");

        // 其他类型处理
        if (type === "r") {
            // 显示表格素材
            let className = $curElem.getAttribute("class") || "";
            if (svgType === "shape-table" && className.indexOf("hiddenDoing") > -1) {
                this.resetTableSvgElement();
                this.hideTableEditTool();
                this.showTableSvgElement();

                // 重定义数据
                elemData = this.$tool.getEleData($curElem);
                this.startData.targData = Z.clone(elemData);
                this.startData.rectRatio = parseFloat(elemData.width) / parseFloat(elemData.height);
            }

            Z("#selection_tool>.rotate>span").html(Math.floor($curElem.transform.baseVal[1].angle) + "°");
            // 取得中心点坐标
            let transVal = $curElem.transform.baseVal;
            let px = this.startData.targData.x + this.startData.targData.width / 2;
            let py = this.startData.targData.y + this.startData.targData.height / 2;
            if (svgType === "shape-line"){
                px = this.startData.targData.x;
                py = this.startData.targData.y;
            }
            // 存在翻转
            if (transVal[2] && transVal[2].matrix){
                let a = transVal[2].matrix.a;
                let d = transVal[2].matrix.d;
                if (a === -1){
                    px -= this.startData.targData.width;
                }
                if (d === -1){
                    py -= this.startData.targData.height;
                }
            }
            this.startData.targData.px = px * this.$tool.showRatio;
            this.startData.targData.py = py * this.$tool.showRatio;
        } else {
            // 执行表格缩放
            if (svgType === "shape-table") {
                if (["e", "s", "w", "n"].includes(type))
                    return this.tableZoomStart(event);
            }

            $curElem.querySelector("rect").setAttribute("width","1");
            $curElem.querySelector("rect").setAttribute("height","1");
        }
        // 事件绑定
        Z(this.$tool.$designStage).on("mousemove",this.singleZoomDoing,this);
        Z(this.$tool.$designStage).on("mouseup mouseleave",this.singleZoomDone,this);
    }
    singleZoomDoing(event) {
        Z.E.cancel(event);
        // 判断鼠标左键是否按下状态（考虑特殊情况）
        if (event.button !== 0 || event.buttons === 0)
            return this.singleZoomDone();
        let $curElem = this.$tool.tempElement || this.$tool.getCurSvgElement();

        // 旋转的相对偏移量
        let mouseMetabolic = this.getTrueZoomMetabolic(event);
        if (mouseMetabolic.x === 0 && mouseMetabolic.y === 0) {
            return;
        }
        mouseMetabolic.x /= this.$tool.showRatio;
        mouseMetabolic.y /= this.$tool.showRatio;
        // 缩放变形
        switch (this.startData.targetType) {
            //东方向，右
            case "e": this.singleZoomCoordinateXY ($curElem, mouseMetabolic , "east"); break;
            //东南方向，右下
            case "se": this.singleZoomHypotenuse ($curElem, mouseMetabolic , "southEast"); break;
            //南方向，下
            case "s": this.singleZoomCoordinateXY ($curElem, mouseMetabolic , "south"); break;
            //西南南方向，左下
            case "sw": this.singleZoomHypotenuse($curElem, mouseMetabolic , "southWest"); break;
            //西方向，左
            case "w": this.singleZoomCoordinateXY ($curElem, mouseMetabolic , "west"); break;
            //西北方向，左上
            case "nw": this.singleZoomHypotenuse ($curElem, mouseMetabolic , "northWest"); break;
            //北方向，上
            case "n": this.singleZoomCoordinateXY ($curElem, mouseMetabolic , "north"); break;
            //东北方向，右上
            case "ne": this.singleZoomHypotenuse ($curElem, mouseMetabolic , "northEast"); break;
            //旋转角度
            case "r": this.singleZoomRotate ($curElem, Const.getMouseLocation(event)); break;
        }
        // 更新缩放框位置
        SelectionTool.setToolStaticLoc();
    }
    singleZoomDone() {
        // 1：清除事件
        Z(this.$tool.$designStage).off("mousemove", this.singleZoomDoing, this);
        Z(this.$tool.$designStage).off("mouseup mouseleave", this.singleZoomDone, this);

        // 2：取得素材对象
        let material = this.$tool.tempMaterial || this.$tool.getCurMaterial();
        let $curElem = this.$tool.tempElement || this.$tool.getCurSvgElement();
        if (!material || !$curElem)
            return;

        // 3：角度旋转操作
        if (this.startData.targetType === "r") {
            //清空角度显示
            Z("#selection_tool>.rotate>span").html("");
            ElementUpdate.updateMaterialSource();
            //保存历史
            PrototypeHistory.saveHistory();
        }

        // 4：重设素材大小
        let oldW = this.startData.targData.width;
        let oldH = this.startData.targData.height;
        let $rect = $curElem.querySelector("rect");
        let $gWrap = $curElem.querySelector('g');
        let $svg = [...$gWrap.children].pop();
        let svgType = $svg.getAttribute("data-targetType");
        let setWidth = $svg.width.baseVal.value;
        let setHeight = $svg.height.baseVal.value;

        // 设置辅助矩形大小
        $rect.setAttribute("width", setWidth + "");
        $rect.setAttribute("height", setHeight + "");


        if (material.targetType === 1) {// 文字素材类型，重新绘制
            // 1：文字缩放比，数组形式
            let textZoom = material.textZoom.split(" ");
            let widthZoom = parseFloat(textZoom[0]);
            let heightZoom = parseFloat(textZoom[1]);
            if (this.startData.axis === "xy") {// 等比缩放操作
                let trueHeight = setHeight * this.startData.targData.heightRatio;
                let fontSize = parseFloat((trueHeight * this.startData.targData.sizeRatio).toFixed(2));
                let changeRatio = fontSize / this.startData.targData.fontSize;

                // 素材参数
                material.width = setWidth / widthZoom;
                material.height = setHeight / heightZoom;
                material.fontSize = fontSize;
                material.letterSpacing *= changeRatio;
                material.singleHeight *= changeRatio;
                material.lineHeight *= changeRatio;
                material.mathHeight *= changeRatio;
                material.textY = 1000;
                for (let word of material.wordsList)
                    word.fontSize = fontSize;

                // 设置 data 属性
                Const.setDataInSvg(material, $curElem);
                // 写入最新文字大小
                EditBtnTool.setFontSelectVal(fontSize, 'tool_fontSize');

                // 校准偏移
                Const.editOverSet($curElem);
                // 重新绘制
                MaterialTool.getPathAjax(material, $curElem);
            } else {
                material.width = oldW / widthZoom;
                material.height = oldH / heightZoom;
                if (this.startData.axis === "x") { // 宽度修改
                    widthZoom = setWidth / material.width;
                } else if (this.startData.axis === "y") { // 高度修改
                    heightZoom = setHeight / material.height;
                }
                material.textZoom = widthZoom + " " + heightZoom;
                Z($curElem).attr("data-textzoom", material.textZoom);

                // 校准偏移
                Const.editOverSet($curElem);
                // 更新数据
                ElementUpdate.updateMaterialSource();
                // 保存历史
                PrototypeHistory.saveHistory();
            }
        // } else if (material.isTable) {// 表格单独处理
        //     this.tableZoomDoneEqual();
        } else { // 其他素材类型，直接保存
            if (svgType !== "shape-line")
                Const.editOverSet($curElem);
            // 更新素材
            ElementUpdate.updateMaterialSource();
            PrototypeHistory.saveHistory();
        }
    }
    // 2.6：表格缩放
    tableZoomStart(event) {
        Z.E.forbidden(event);
        let $curElem = this.$tool.getCurSvgElement();
        let className = $curElem.getAttribute("class") || "";
        let tableTool = true;

        // 显示表格，隐藏素材
        let $tableEditor = Z("#tableEditor");
        if (className.indexOf("hiddenDoing") === -1) {
            tableTool = false;
            this.showTableEditTool();
            Z("#tableEditor").find("td").each(function($td) {
                let $div = $td.querySelector(".tableText-editArea");
                Z($td).attr("data-width", $div.offsetWidth);
                Z($td).attr("data-height", $div.offsetHeight);
            });
        }
        let $table = $tableEditor.find("table");

        this.startData.showTableTool = tableTool;
        this.startData.zoomed = false;
        this.startData.tableData = {
            left: $tableEditor[0].offsetLeft,
            top: $tableEditor[0].offsetTop,
            width: $table[0].offsetWidth,
            height: $table[0].offsetHeight,
        };
        let $selTool = Z.D.id("selection_tool");
        this.startData.selToolData = {
            left: $selTool.offsetLeft,
            top: $selTool.offsetTop,
            width: $selTool.offsetWidth,
            height: $selTool.offsetHeight,
        };

        // 事件绑定
        Z(this.$tool.$designStage).on("mousemove",this.tableZoomDoing,this);
        Z(this.$tool.$designStage).on("mouseup mouseleave",this.tableZoomDone,this);
    }
    tableZoomDoing(event) {
        Z.E.cancel(event);
        // 判断鼠标左键是否按下状态（考虑特殊情况）
        if (event.button !== 0 || event.buttons === 0)
            return this.tableZoomDone();

        // 旋转的相对偏移量
        let nowMouseLoc = Const.getMouseLocation(event);
        let mouseMetabolic = {
            "x": (nowMouseLoc.x - this.startData.mouseLoc.x),
            "y": (nowMouseLoc.y - this.startData.mouseLoc.y),
        };
        if (mouseMetabolic.x === 0 && mouseMetabolic.y === 0) {
            return;
        }

        // 开始执行表格缩放
        this.startData.zoomed = true;
        let $tableEditor = Z("#tableEditor");
        let $table = $tableEditor.find("table");
        let type = this.startData.targetType;
        let angle = this.startData.angle * Math.PI / 180;
        let cosMath = Math.cos(angle);
        let sinMath = Math.sin(angle);
        let table_width = this.startData.tableData.width;
        let table_height = this.startData.tableData.height;
        let start_width = table_width;
        let start_height = table_height;
        let table_left = this.startData.tableData.left;
        let table_top = this.startData.tableData.top;
        let mx = 0, my = 0;

        // 计算尺寸
        if (type.indexOf("e") > -1)
            mx = cosMath * mouseMetabolic.x + sinMath * mouseMetabolic.y;
        if (type.indexOf("s") > -1)
            my = -sinMath * mouseMetabolic.x + cosMath * mouseMetabolic.y;
        if (type.indexOf("w") > -1)
            mx = - (cosMath * mouseMetabolic.x + sinMath * mouseMetabolic.y);
        if (type.indexOf("n") > -1)
            my = sinMath * mouseMetabolic.x - cosMath * mouseMetabolic.y;

        table_width += mx;
        table_height += my;

        // 计算偏移
        mx /= 2;
        my /= 2;
        let x1 = -mx, y1 = -my;
        if (type.indexOf("e") > -1) {
            x1 += mx * cosMath;
            y1 += mx * sinMath;
        }
        if (type.indexOf("s") > -1) {
            x1 -= my * sinMath;
            y1 += my * cosMath;
        }
        if (type.indexOf("w") > -1) {
            x1 -= mx * cosMath;
            y1 -= mx * sinMath;
        }
        if (type.indexOf("n") > -1) {
            x1 += my * sinMath;
            y1 -= my * cosMath;
        }

        table_left += x1;
        table_top += y1;

        // 定义属性
        $table.css("width", table_width).css("height", table_height);
        $tableEditor.css("left", table_left).css("top", table_top);

        // 选择框大小更新
        Z("#selection_tool").css({
            width: table_width + 2,
            height: table_height + 2,
            left: this.startData.selToolData.left + x1,
            top: this.startData.selToolData.top + y1,
        });
        // 缩放执行
        let mxHeight = (table_height - start_height) / start_height;
        let mxWidth = (table_width - start_width) / start_width;
        $table.find("td").each($td => {
            let tdHeight = parseFloat(Z($td).attr("data-height"));
            let tdWidth = parseFloat(Z($td).attr("data-width"));
            Z($td).find(".tableText-editArea").css("height", tdHeight + tdHeight * mxHeight)
                .css("width", tdWidth + tdWidth * mxWidth);
        });
    }
    tableZoomDone() {
        // 1：事件解除
        Z(this.$tool.$designStage).off("mousemove",this.tableZoomDoing,this);
        Z(this.$tool.$designStage).off("mouseup mouseleave",this.tableZoomDone,this);

        // 2：显示表格工具，直接返回
        if (this.startData.showTableTool)
            return;

        // 2：重新生成素材
        if (this.startData.zoomed)
            this.resetTableSvgElement();

        // 3：隐藏表格工具
        this.hideTableEditTool();

        // 4：显示素材
        this.showTableSvgElement();

        // 5：更新选择框
        SelectionTool.selectTheElement();

        // 6：更新数据，保存历史
        ElementUpdate.updateMaterialSource();
        PrototypeHistory.saveHistory();
    }
    // 2.7：素材组缩放
    groupZoomStart(event) {
        let $targ = Z.E.target(event);
        if (!$targ.hasAttribute("data-targetType") || Z($targ).attr("data-axis") !== "xy") {
            return;
        }
        if (!Z("#selection_tool").hasClass("groupTool")) {
            return;
        }
        let $tool = Z.D.id('selection_tool');
        let toolRect = $tool.getBoundingClientRect();
        let canvasRect = this.$tool.$canvasBg.getBoundingClientRect();
        this.startData.mouseLoc = Const.getMouseLocation(event);
        this.startData.targetType = Z($targ).attr("data-targetType");
        this.startData.rectRatio = $tool.offsetWidth / $tool.offsetHeight;
        this.startData.targData = {
            "width": toolRect.width,
            "height": toolRect.height,
            "x": $tool.offsetLeft,
            "y": $tool.offsetTop,
            "xSp": toolRect.left - canvasRect.left,
            "ySp": toolRect.top - canvasRect.top,
        };
        this.startData.elemsData = (()=> {
            let showRatio = this.$tool.showRatio;
            let dataArr = [];
            let textElemNum = 0;
            for (let i = 0;i < this.$media.selectedList.length;i++) {
                let mid = parseInt(this.$media.selectedList[i]);
                let $gElem = this.$tool.getSvgElementByMid(mid);
                let material = this.$tool.getMaterialByMid(mid);
                let $svgElem = $gElem.querySelector("svg");
                let trueHeight = $svgElem.getBBox().height;
                let elemData = {
                    "mid": mid,
                    "index": i,
                    "x": $gElem.transform.baseVal[0].matrix.e - this.startData.targData.xSp / showRatio,
                    "y": $gElem.transform.baseVal[0].matrix.f - this.startData.targData.ySp / showRatio,
                    "width": $svgElem.width.baseVal.value,
                    "height": $svgElem.height.baseVal.value,
                };
                if (parseFloat(material.targetType) === 1) {//如果是文字素材，存储字体大小
                    textElemNum++;
                    elemData.fontSize = parseFloat(material.fontSize);
                    elemData.heightRatio = trueHeight / obj.startData.targData.height * showRatio;
                    elemData.sizeRatio = elemData.fontSize / trueHeight;
                }
                dataArr.push(elemData);
            }
            this.startData.textElemNum = textElemNum;
            return dataArr;
        })();

        // 事件绑定
        Z(this.$tool.$designStage).on("mousemove",this.groupZoomDoing,this);
        Z(this.$tool.$designStage).on("mouseup mouseleave",this.groupZoomDone,this);
    }
    groupZoomDoing(event) {
        Z.E.cancel(event);
        let nowMouseLoc = Const.getMouseLocation(event);
        let mouseMetabolic = {
            "x": nowMouseLoc.x - this.startData.mouseLoc.x,
            "y": nowMouseLoc.y - this.startData.mouseLoc.y
        };
        if (mouseMetabolic.x === 0 && mouseMetabolic.y === 0) {
            return;
        }

        let mw, mh;
        let mx = this.startData.targData.x;
        let my = this.startData.targData.y;
        let zoomType = this.startData.targetType;
        if (this.startData.rectRatio > 1) {
            if (zoomType === "se" || zoomType === "ne") {
                mw = this.startData.targData.width + mouseMetabolic.x;
            } else if (zoomType === "sw" || zoomType === "nw") {
                mw = this.startData.targData.width - mouseMetabolic.x;
            }
            mh = mw / this.startData.rectRatio;
        } else {
            if (zoomType === "se" || zoomType === "sw") {
                mh = this.startData.targData.height + mouseMetabolic.y;
            } else {
                mh = this.startData.targData.height - mouseMetabolic.y;
            }
            mw = mh * this.startData.rectRatio;
        }
        let changeRatio = (mw / this.startData.targData.width + mh / this.startData.targData.height) / 2;
        changeRatio = (changeRatio > 0)?(changeRatio):(0);

        if (zoomType === "sw" || zoomType === "nw") {
            mx += this.startData.targData.width - mw;
        }
        if (zoomType === "ne" || zoomType === "nw") {
            my += this.startData.targData.height - mh;
        }
        Z("#selection_tool").css({
            "width": mw,
            "height": mh,
            "left": mx,
            "top": my
        });

        // 处理素材数据
        this.groupZoomCoordinateXY(changeRatio, zoomType);
    }
    groupZoomDone() {
        // 清除事件
        Z(this.$tool.$designStage).off("mousemove",this.groupZoomDoing,this);
        Z(this.$tool.$designStage).off("mouseup mouseleave",this.groupZoomDone,this);

        // 执行保存操作
        let groupTextNum = this.startData.textElemNum;
        let groupTextDoneNum = 0;
        var groupRect = Z.D.id('selection_tool').getBoundingClientRect();
        var material = null, $curElem = null;

        // 循环，更新处理每个素材
        for (let i = 0;i < this.startData.elemsData.length;i++) {
            let elemData = this.startData.elemsData[i];
            material = this.$tool.getCurMaterial(elemData.index);
            $curElem = this.$tool.getCurSvgElement(elemData.index);
            material.type = parseFloat(material.type);

            // 文字缩放，改变字体大小
            if (material.type === 1) {
                let textZoom = "", trueHeight = 0, fontSize = 0, dataFontsize = "";
                let $gWrap = $curElem.querySelector('g');
                let $svg = [...$gWrap.children].pop();
                textZoom = material.textZoom.split(" ");
                trueHeight = (groupRect.height / this.$tool.showRatio) * elemData.heightRatio;
                fontSize = parseFloat((trueHeight * elemData.sizeRatio).toFixed(2));
                let changeRatio = fontSize / elemData.fontSize;

                // 页面呈现，字体大小
                material.width = $svg.width.baseVal.value / parseFloat(textZoom[0]);
                material.height = $svg.height.baseVal.value / parseFloat(textZoom[1]);
                material.fontSize = fontSize;
                material.letterSpacing *= changeRatio;
                material.singleHeight *= changeRatio;
                material.lineHeight *= changeRatio;
                material.mathHeight *= changeRatio;
                material.textY = fontSize * .830512523651123;
                dataFontsize = material.fontSize;
                this.createMode = parseFloat(this.createMode);
                if (this.createMode === 0) {
                    dataFontsize += "pt";
                } else {
                    dataFontsize += "px";
                }
                $curElem.setAttribute("data-fontsize", dataFontsize);
                $curElem.setAttribute("data-letterspacing", material.letterSpacing);
                $curElem.setAttribute("data-singleheight", material.singleHeight);
                $curElem.setAttribute("data-mathheight", material.mathHeight);
                $curElem.setAttribute("data-lineheight", material.lineHeight);
                MaterialTool.getPathAjax(material, $curElem, 1, 1, (material, $curElem)=> {
                    groupTextDoneNum++;
                    ElementUpdate.updateMaterialSource(material, $curElem);
                    if (groupTextDoneNum === groupTextNum) {
                        // 重新选中框定位
                        SelectionTool.selectionToolsShow_group();
                        PrototypeHistory.saveHistory();
                    }
                });
            // } else if (material.isTable) {// 表格缩放
            //     this.tableZoomDoneEqual(material, $curElem);
            // }
            } else {// 其他
                ElementUpdate.updateMaterialSource(material, $curElem);
            }
        }
    }
    // 2.8：文本编辑框缩放
    editorResizeStart(event) {
        Z.E.forbidden(event);
        let $editor = Z.D.id("textEditorWrap");
        let editorStyle = window.getComputedStyle($editor, null);
        let angle = 0;
        let trans = $editor.style.transform;
        if (trans){
            if (/.*rotate\([^)]+\).*/.test(trans)) {
                angle = parseFloat(trans.replace(/.*rotate\(([^)]+)\).*/, "$1"));
            }
        }
        this.startData.mouseLoc = Const.getMouseLocation(event);
        this.startData.targetType = event.target.getAttribute("data-targetType");
        this.startData.angle = angle;
        this.startData.targData = {
            "width" : parseFloat(0 + editorStyle.width) ? parseFloat(0 + editorStyle.width) : $editor.offsetWidth,
            "left" : parseFloat(0 + editorStyle.left) ? parseFloat(0 + editorStyle.left) : $editor.offsetLeft,
            "top" : parseFloat(0 + editorStyle.top) ? parseFloat(0 + editorStyle.top) : $editor.offsetTop,
        };

        // 事件绑定
        Z(this.$tool.$designStage).on("mousemove",this.editorResizeDoing,this);
        Z(this.$tool.$designStage).on("mouseup mouseleave",this.editorResizeDone,this);
    }
    editorResizeDoing(event) {
        let nowMouseLoc = Const.getMouseLocation(event);
        let mouseMetabolic = {
            "x": nowMouseLoc.x - this.startData.mouseLoc.x,
            "y": nowMouseLoc.y - this.startData.mouseLoc.y
        };
        if (mouseMetabolic.x === 0 && mouseMetabolic.y === 0) {
            return;
        }

        let material = this.textMaterial || this.$tool.getCurMaterial();
        let textZoomArr = material.textZoom.split(" ");
        let mx = mouseMetabolic.x / parseFloat(textZoomArr[0]);

        let setWidth = this.startData.targData.width;
        let setLeft = this.startData.targData.left;
        let setTop = this.startData.targData.top;
        switch (this.startData.targetType){
            case "e":
                setWidth += mx;
                break;
            case "w":
                var angle = this.startData.angle * Math.PI / 180;
                setWidth -= mx;
                setLeft += mx * Math.cos(angle);
                setTop += mx * Math.sin(angle);
                break;
        }
        setWidth += "px";
        Z("#textEditor").css({
            "width": setWidth,
        });
        Z("#textEditorWrap").css({
            "left": setLeft,
            "top": setTop,
        });
    }
    editorResizeDone() {
        // 清除事件
        Z(this.$tool.$designStage).off("mousemove",this.editorResizeDoing,this);
        Z(this.$tool.$designStage).off("mouseup mouseleave",this.editorResizeDone,this);
    }

    /********************************************
     ************* 三: 自定义绘制 ***************
     ********************************************/
    // 3.1：形状绘制
    drawShapeStart(event) {
        this.startData.mouseLoc = Const.getMouseLocation(event);
        this.doingData = {
            "mouseLoc": {"x": 0, "y": 0}
        };
        let canvasRect = this.$tool.$canvasBg.getBoundingClientRect();
        let setX = (this.startData.mouseLoc.x - canvasRect.left) / this.$tool.showRatio;
        let setY = (this.startData.mouseLoc.y - canvasRect.top) / this.$tool.showRatio;
        this.startData.targData = {
            "x": setX,
            "y": setY,
        };
        if (!Z.D.id("tempShape")) {
            MaterialTool.shapeDrawReady();
        }
        Z.D.id("tempShape").setAttribute("transform","translate(" + setX + " " + setY + ") rotate(0 0 0)");
        // 事件绑定
        Z(this.$tool.$designStage).on("mousemove",this.drawShapeDoing,this);
        Z(this.$tool.$designStage).on("mouseup mouseleave",this.drawShapeDone,this);
    }
    drawShapeDoing(event) {
        Z.E.forbidden(event);
        let nowMouseLoc = Const.getMouseLocation(event);
        this.doingData.mouseLoc.x = (nowMouseLoc.x - this.startData.mouseLoc.x) / this.$tool.showRatio;
        this.doingData.mouseLoc.y = (nowMouseLoc.y - this.startData.mouseLoc.y) / this.$tool.showRatio;
        switch (this.shapeType) {
            case "1":
                this.drawingLine(event);
                break;
            case "2":
            case "3":
                this.drawingRect(event);
                break;
            case "4":
                this.drawingEllipse(event);
                break;
        }
    }
    drawShapeDone() {
        // 清除事件
        Z(this.$tool.$designStage).off("mousemove",this.drawShapeDoing,this);
        Z(this.$tool.$designStage).off("mouseup mouseleave",this.drawShapeDone,this);
        if (this.shapeType === '1') {
            if (this.doingData.mouseLoc.x === 0 && this.doingData.mouseLoc.y === 0) {
                Z("#tempShape").remove();
            }
        } else {
            if (this.doingData.mouseLoc.x === 0 || this.doingData.mouseLoc.y === 0) {
                Z("#tempShape").remove();
            }
        }
        if (!Z.D.id("tempShape")) {
            return;
        }
        // 添加素材
        let $curElem = Z.D.id("tempShape");
        $curElem.removeAttribute("id");
        let $gSvg = $curElem.querySelector("g");
        let $svg = $gSvg.querySelector("svg");
        let dataType;
        switch(this.shapeType) {
            case "1": dataType = "shape-line";break;
            case "2": dataType = "shape-rect";break;
            case "3":
                dataType = "shape-rectStroke";
                $svg.setAttribute("data-rectstroke","5");
                break;
            case "4": dataType = "shape-ellipse";break;
        }
        $svg.setAttribute("data-targetType",dataType);
        let svgCode = $curElem.outerHTML;

        let setWidth = $svg.getAttribute("width");
        let setHeight = $svg.getAttribute("height");
        let $rect = document.createElementNS(Const.xmlns, "rect");
        $rect.setAttribute("fill","rgba(0,0,0,0)");
        $rect.setAttribute("width",setWidth);
        $rect.setAttribute("height",setHeight);
        $curElem.insertBefore($rect,$gSvg);
        let tempMaterial = {
            "type": 5,
            "source": svgCode,
            "color": "#000000",
        };
        let material = MaterialTool.newMediaMaterial(tempMaterial);
        this.$tool.addMaterial(material);
        $curElem.setAttribute("id","svgElementSon_" + material.mid);
        $curElem.setAttribute("data-mid",material.mid);
        $curElem.setAttribute("data-pos",material.mid);
        let tempTrans = $curElem.getAttribute("transform");
        if (this.shapeType !== '1'){
            tempTrans = tempTrans.replace(/rotate(\s*)?\(([^)]+)\)/,"rotate(0 "+ setWidth/2 +" "+ setHeight/2 +")")
        }
        $curElem.removeAttribute("transform");
        $curElem.setAttribute("transform",tempTrans);
        // 事件绑定
        this.$tool.addEleEvents($curElem);
        // 选中该素材
        SelectionTool.selectTheElement(material, $curElem);
        PrototypeHistory.saveHistory();
        // 结束绘制
        MaterialTool.shapeDrawStop();
    }
    // 3.2：钢笔工具绘制
    penDrawStart(event) {
        // 0：判断是否执行绘制
        // 按钮状态
        let $liActive = Z('.side_containerList > .active');
        if (!$liActive[0]){
            return;
        } else if ($liActive.attr('data-targetType') !== '11')
            return;
        // 两次点击间隔
        if (this.startData.timeStamp) {
            let mStamp = event.timeStamp - this.startData.timeStamp;
            if (mStamp <= 300){
                return this.startData.timeStamp = event.timeStamp;
            }
        }

        // 1：主方法，定义变量
        let $tangentWrap = Z.D.id('penTangentTool');
        let $tempShape = Z.D.id('tempShape');
        let $tempSvg = $tempShape.querySelector('svg');
        let $tempPath = $tempSvg.querySelector('path');
        let setD = $tempPath.getAttribute('d');
        let firstStart = true;

        // 2：判断第一次绘制
        if (setD !== 'M0,0') {
            firstStart = false;
        } else {
            Z($tangentWrap).addClass('active');
            let $canvas = this.$tool.$canvasSvg;
            let canvasViewBox = $canvas.viewBox.baseVal;
            let canvasWidth = canvasViewBox.width;
            let canvasHeight = canvasViewBox.height;
            $tempSvg.setAttribute('viewBox', '0 0 ' + canvasWidth + ' ' + canvasHeight);
            $tempSvg.setAttribute('width', canvasWidth + '');
            $tempSvg.setAttribute('height', canvasHeight + '');
        }

        // 定义 $tempPath
        this.startData.$tempPath = $tempPath;

        // 3：初始化新切线
        let wrapRect = $tangentWrap.getBoundingClientRect();
        let nowLoc = Const.getMouseLocation(event);
        let transX = nowLoc.x - wrapRect.left;
        let transY = nowLoc.y - wrapRect.top;
        // 隐藏所有切线
        Z($tangentWrap).find('.penTangent-item').removeClass('active');
        // 添加新切线
        let $newTangent = Z(Const.newTangentString);
        let $$tangentItem = $tangentWrap.querySelectorAll('.penTangent-item');
        let tangentLength = $$tangentItem.length;
        Z($tangentWrap).append($newTangent);
        $newTangent.attr('data-index', tangentLength);
        $newTangent.css({
            'left' : transX * 100 / wrapRect.width + '%',
            'top' : transY * 100 / wrapRect.height + '%',
        });
        let canvasRect = this.$tool.$canvasBg.getBoundingClientRect();
        let pointX = nowLoc.x - canvasRect.left;
        let pointY = nowLoc.y - canvasRect.top;
        let showRatio = this.$tool.showRatio;
        let newPoint = pointX / showRatio + ',' + pointY / showRatio;
        // 初始化新曲线
        if (firstStart) {
            setD = 'M' + newPoint;
        }
        setD += ' C' + newPoint + ' ' + newPoint + ' ' + newPoint;
        $tempPath.setAttribute('d', setD);

        // 4：保存数据 startData
        this.startData.mouseLoc = nowLoc;
        this.startData.timeStamp = event.timeStamp;
        this.startData.allTangent = $tangentWrap.querySelectorAll('.penTangent-item');
        this.startData.tangentIndex = tangentLength;

        // 5：绘制曲线
        if (!firstStart)
            return;

        // 6：事件绑定
        this.initPenEditHistory();
        Z('#penEditorCover').on("mouseup",this.penDrawTangentDone,this)
            .on("mousemove",this.penDrawDoing,this)
            .on("dblclick",this.penDrawDone,this);
        Z(this.$tool.$designStage).on("mouseleave",this.penDrawDone,this);
        $newTangent.addClass('item-drawDone').on('mousedown', this.penDrawDone, this);
    }
    penDrawDoing(event) {
        // 1：分情况处理
        if (event.buttons === 1) {
            this.penDrawTangentDoing(event);
        } else if (event.buttons === 0) {
            this.penDrawCurveDoing(event);
        }
    }
    // 钢笔切线绘制
    penDrawTangentDoing(event) {
        // 主方法，定义变量
        let nowMouseLoc = Const.getMouseLocation(event);
        let mouseMetabolic = {
            "x": nowMouseLoc.x - this.startData.mouseLoc.x,
            "y": nowMouseLoc.y - this.startData.mouseLoc.y,
        };
        let itemIndex = this.startData.tangentIndex;
        let $tangentItem = this.startData.allTangent[itemIndex];
        let $prevItem = $tangentItem.querySelector('.penTangent-item-prev');
        let $nextItem = $tangentItem.querySelector('.penTangent-item-next');

        // 1：切线偏移
        let setHypotenuse = Math.sqrt(Math.pow(mouseMetabolic.x, 2) + Math.pow(mouseMetabolic.y, 2));
        let transAngle = Math.atan(mouseMetabolic.y / mouseMetabolic.x) * 180 / Math.PI;
        if (mouseMetabolic.x < 0)
            transAngle += 180;
        let setRotate = 'rotate('+ transAngle +'deg)';
        if (!Z($tangentItem).hasClass('active')){
            Z($tangentItem).addClass('active');
        }
        // 旋转角度
        Z($prevItem).css({
            'transform': 'translate(calc(-100% + 5.5px), 0) ' + setRotate,
        });
        Z($nextItem).css({
            'transform': 'translate(5.5px, 0) ' + setRotate,
        });
        // 切线长度
        Z($prevItem).css({
            'width': setHypotenuse,
        });
        Z($nextItem).css({
            'width': setHypotenuse,
        });

        // 2：调整贝塞尔曲线
        let showRatio = this.$tool.showRatio;
        if (this.startData.allTangent.length === 1){
            return;
        }
        let $tempPath = this.startData.$tempPath;
        let setD = $tempPath.getAttribute('d');
        let lastBezier = setD.match(/C([^C]+)(\sC[^C]+)$/);
        let getBezier = lastBezier[1].split(' ');
        let getPoint = getBezier[2].split(',');
        let setPointX = parseFloat(getPoint[0]) - mouseMetabolic.x / showRatio;
        let setPointY = parseFloat(getPoint[1]) - mouseMetabolic.y / showRatio;
        let setPoint = setPointX + ',' + setPointY;
        setD = setD.replace(/[^C]+\sC[^C]+$/, '');
        setD += getBezier[0] + ' ' + setPoint + ' ' + getBezier[2] +
            lastBezier[2];
        $tempPath.setAttribute('d', setD);
    }
    penDrawTangentDone(event) {
        // 1：定义变量
        let showRatio = this.$tool.showRatio;
        let nowMouseLoc = Const.getMouseLocation(event);
        let toolRect = this.$tool.$canvasBg.getBoundingClientRect();
        let mouseMetabolic = {
            "x": (nowMouseLoc.x - toolRect.left) / showRatio,
            "y": (nowMouseLoc.y - toolRect.top) / showRatio,
        };

        // 2：切线节点
        let $tempPath = this.startData.$tempPath;
        let setD = $tempPath.getAttribute('d');
        let fromPoint = mouseMetabolic.x + ',' + mouseMetabolic.y;
        setD = setD.replace(/[^C]+$/, '');
        setD += fromPoint + ' ' + fromPoint + ' ' + fromPoint;
        $tempPath.setAttribute('d', setD);

        // 3：保存历史记录
        this.savePenEditHistory();
    }
    // 钢笔曲线绘制
    penDrawCurveDoing(event) {
        // 主方法，定义变量
        let showRatio = this.$tool.showRatio;
        let $current = Z.E.target(event);
        let nowMouseLoc = Const.getMouseLocation(event);
        let canvasRect = this.$tool.$canvasBg.getBoundingClientRect();
        let mouseMetabolic = {
            "x": (nowMouseLoc.x - canvasRect.left) / showRatio,
            "y": (nowMouseLoc.y - canvasRect.top) / showRatio,
        };

        // 1：设置曲线
        let $tempPath = Z('#tempShape path')[0];
        let setD = $tempPath.getAttribute('d');
        let $doneBtn = Z('.item-drawDone .penTangent-item-this .penTangent-item-btn')[0];
        if ($current === $doneBtn) {
            let startPoint = /M([^C\s]+)/.exec(setD)[1];
            let startPointArr = startPoint.split(',');
            let startPointX = parseFloat(startPointArr[0]);
            let startPointY = parseFloat(startPointArr[1]);

            let firstBezier = /C([^C]+)/.exec(setD);
            let firstTangent = firstBezier[1].split(' ')[0];
            let firstTangentArr = firstTangent.split(',');
            let firstTangentX = parseFloat(firstTangentArr[0]);
            let firstTangentY = parseFloat(firstTangentArr[1]);
            let pointX = startPointX * 2 - firstTangentX;
            let pointY = startPointY * 2 - firstTangentY;

            setD = setD.replace(/[^C\s]+\s[^C\s]+(\sZ)?$/, '');
            setD += pointX + ',' + pointY + ' ' + startPoint + ' Z';
        } else {
            let toPoint = mouseMetabolic.x + ',' + mouseMetabolic.y;
            setD = setD.replace(/[^C\s]+\s[^C\s]+(\sZ)?$/, '');
            setD += toPoint + ' ' + toPoint;
        }
        $tempPath.setAttribute('d', setD);
    }
    penDrawDone(event) {
        // 主方法，定义变量
        Z.E.forbidden(event);
        let eventType = event.type;
        let $tempPath = Z('#tempShape path')[0];
        let setD = $tempPath.getAttribute('d');
        let pointX, pointY;

        // 1：如果是 mouseleave 判断鼠标是否真的离开编辑区域
        if (eventType === 'mouseleave') {
            let mouseLoc = Const.getMouseLocation(event);
            let stageRect = this.$tool.$designStage.getBoundingClientRect();
            if (mouseLoc.x > stageRect.left && mouseLoc.x < stageRect.left + stageRect.width)
                return;
        }

        // 2：设置最终的临时素材路径
        let startPoint = /M([^C\s]+)/.exec(setD)[1];
        let startPointArr = startPoint.split(',');
        let startPointX = parseFloat(startPointArr[0]);
        let startPointY = parseFloat(startPointArr[1]);
        let firstBezier = /C([^C]+)/.exec(setD);
        if (!firstBezier || !firstBezier[1])
            return this.penDrawCancel();
        let firstTangent = firstBezier[1].split(' ')[0];
        let firstTangentArr = firstTangent.split(',');
        let firstTangentX = parseFloat(firstTangentArr[0]);
        let firstTangentY = parseFloat(firstTangentArr[1]);
        pointX = startPointX * 2 - firstTangentX;
        pointY = startPointY * 2 - firstTangentY;

        if (eventType === 'mousedown') {
            if (/\sZ$/.test(setD)) {
                setD = setD.replace(/[^C\s]+\s[^C\s]+\sZ$/, '');
                setD += pointX + ',' + pointY + ' ' + startPoint;
            }
        } else {
            setD = setD.replace(/\sC[^C]+$/, '');
            let lastBezier = /C([^C]+)\s?Z?$/.exec(setD);
            if (!lastBezier || !lastBezier[1])
                return this.penDrawCancel();
            let lastPoint = lastBezier[1].split(' ')[2];
            setD += ' C' + lastPoint + ' ' + startPoint + ' ' + startPoint;
        }
        if (!/\sZ$/.test(setD))
            setD += ' Z';
        $tempPath.setAttribute('d', setD);

        // 3：添加进素材列表
        this.tempToPenMaterial();

        // 4：结束绘制
        this.penDrawCancel();

        // 5：选中该素材，并保存
        SelectionTool.selectTheElement(this.elemEditToolData.material, this.elemEditToolData.$curElem);
        PrototypeHistory.saveHistory();

        // 6：清空数据
        this.clearPenEditHistory();
        this.elemEditToolData = {};
    }
    // 钢笔绘制取消
    penDrawCancel() {
        // 1：结束绘制
        MaterialTool.shapeDrawStop();

        // 2：清除临时对象
        this.startData.mouseLoc = null;
        this.startData.targData = null;
        this.startData.allTangent = null;
        this.startData.$tempPath = null;
        this.clearPenEditHistory();

        // 3：清除事件
        Z('#penEditorCover').off("mouseup",this.penDrawTangentDone,this)
            .off("mousemove",this.penDrawDoing,this)
            .off("dblclick",this.penDrawDone,this);
        Z(this.$tool.$designStage).off("mouseleave",this.penDrawDone,this);
    }

    /*********************************************
     ************** 四: 缩放实现 *****************
     ********************************************/
    // 4.1：单个缩放 XY 坐标方向
    singleZoomCoordinateXY($curElem, mouseMetabolic, type) {
        let material = this.$tool.tempMaterial || this.$tool.getCurMaterial();
        let $gSvg = $curElem.querySelector("g");
        let $$svg = $gSvg.children;
        let svgLength = $$svg.length;
        let $svg = $$svg[svgLength - 1];
        let svgType = $svg.getAttribute("data-targetType");

        // 计算素材 宽高 属性
        let setWidth = this.startData.targData.width;
        let setHeight = this.startData.targData.height;
        if (type === "east" || type === "west") {
            switch (type) {
                case "east": setWidth = this.startData.targData.width + mouseMetabolic.x; break;
                case "west": setWidth = this.startData.targData.width - mouseMetabolic.x; break;
            }
            setWidth = setWidth > 0 ? setWidth : 1;
            material.width = setWidth;
        } else {
            switch (type) {
                case "south": setHeight = this.startData.targData.height + mouseMetabolic.y; break;
                case "north": setHeight = this.startData.targData.height - mouseMetabolic.y; break;
            }
            setHeight = setHeight > 0 ? setHeight : 1;
            material.height = setHeight;
        }

        // 设置素材 宽高 属性
        if (svgType === "shape-line") {
            $svg.setAttribute("viewBox","0 0 " + setWidth + " " + setHeight);
            let $line = $svg.querySelector("line");
            let lineCap = $line.getAttribute("stroke-linecap");
            let setX1, setX2;
            switch (lineCap) {
                case "butt": // 方角
                    setX1 = 0;
                    setX2 = setWidth;
                    break;
                case "round": // 圆角
                    setX1 = setHeight / 2;
                    setX2 = setWidth - setHeight / 2;
                    break;
            }
            $line.setAttribute("x1",setX1);
            $line.setAttribute("x2",setX2);
            $line.setAttribute("y1",setHeight/2 + "");
            $line.setAttribute("y2",setHeight/2 + "");
            $line.setAttribute("stroke-width",setHeight);
        } else if (svgType === "shape-rect" || svgType === "shape-rectStroke" || svgType === "shape-ellipse") {
            let viewWidth = $svg.viewBox.baseVal.width;
            let viewHeight = $svg.viewBox.baseVal.height;
            let viewRatio;
            if (type === "east" || type === "west") {
                viewRatio = viewHeight / this.startData.targData.height;
                viewWidth = viewRatio * setWidth;
            } else {
                viewRatio = viewWidth / this.startData.targData.width;
                viewHeight = viewRatio * setHeight;
            }
            let drawDone;
            if (svgType === "shape-rect") {
                drawDone = this.drawRectResize($svg,viewWidth,viewHeight);
                if(!drawDone){
                    setWidth = parseFloat($svg.getAttribute("width"));
                    setHeight = parseFloat($svg.getAttribute("height"));
                } else {
                    $svg.setAttribute("viewBox","0 0 " + viewWidth + " " + viewHeight);
                }
            } else if (svgType === "shape-rectStroke") {
                drawDone = this.drawRectStrokeResize($svg,viewWidth,viewHeight);
                if(!drawDone){
                    setWidth = parseFloat($svg.getAttribute("width"));
                    setHeight = parseFloat($svg.getAttribute("height"));
                } else {
                    $svg.setAttribute("viewBox","0 0 " + viewWidth + " " + viewHeight);
                }
            } else if (svgType === "shape-ellipse") {
                $svg.setAttribute("viewBox","0 0 " + viewWidth + " " + viewHeight);
                let $ellipse = $svg.querySelector("ellipse");
                let stroke = parseFloat($ellipse.getAttribute("stroke-width"));
                $ellipse.setAttribute("cy",viewHeight/2 + "");
                $ellipse.setAttribute("cx", viewWidth/2 + "");
                $ellipse.setAttribute("ry",viewHeight/2 - stroke/2 + "");
                $ellipse.setAttribute("rx", (viewWidth/2 - stroke/2) + "");
            }
        }
        for (let i = 0;i < svgLength;i++) {
            let $svgElem = $$svg[i];
            $svgElem.setAttribute("width", setWidth + '');
            $svgElem.setAttribute("height", setHeight + '');
        }

        // 设置素材 偏移 属性
        if (type === "west" || type === "north") {
            let angle = (this.startData.angle || $curElem.transform.baseVal[1].angle || 0 ) * Math.PI / 180;
            let mx = setWidth - this.startData.targData.width;
            let my = setHeight - this.startData.targData.height;
            let setTrans = $curElem.getAttribute("transform");
            let tx, ty;
            if (type === "west") {
                tx = this.startData.targData.x - Math.cos(angle) * mx;
                ty = this.startData.targData.y - Math.sin(angle) * mx;
            } else {
                tx = this.startData.targData.x + Math.sin(angle) * my;
                ty = this.startData.targData.y - Math.cos(angle) * my;
            }
            // 设置属性
            setTrans = setTrans.replace(/translate\([^)]+\)/, "translate("+ tx + " " + ty + ")");
            $curElem.setAttribute("transform", setTrans);
        }

        // 判断翻转
        if (material.reversal !== "1 1") {
            let reversalArr = material.reversal.split(" ");
            let transX = 0, transY = 0;
            let trans = $gSvg.getAttribute("transform");
            if (reversalArr[0] === "-1"){
                transX = setWidth;
            }
            if (reversalArr[1] === "-1"){
                transY = setHeight;
            }
            trans = trans.replace(/translate\([^)]+\)/, "translate(" + transX + " " + transY + ")");
            $gSvg.setAttribute("transform", trans);
        }
    }
    // 4.2：单个缩放 斜边 对角方向
    singleZoomHypotenuse($curElem, mouseMetabolic, type) {
        let $gSvg = $curElem.querySelector("g");
        let $$svg = $gSvg.children;
        let svgLength = $$svg.length;

        // 计算等比缩放大小
        let setWidth, setHeight;
        if (this.startData.rectRatio >= 1) {
            if (type.indexOf("East") > -1) {
                setWidth = this.startData.targData.width + mouseMetabolic.x;
            } else {
                setWidth = this.startData.targData.width - mouseMetabolic.x;
            }
            setWidth = setWidth > 1 ? setWidth : 1;
            setHeight = setWidth / this.startData.rectRatio;
        } else {
            if (type.indexOf("south") > -1) {
                setHeight = this.startData.targData.height + mouseMetabolic.y;
            } else {
                setHeight = this.startData.targData.height - mouseMetabolic.y;
            }
            setHeight = setHeight > 1 ? setHeight : 1;
            setWidth = setHeight * this.startData.rectRatio;
        }

        // 计算偏移属性
        let transVal = $curElem.transform.baseVal;
        let angle = (this.startData.angle || transVal[1].angle || 0 ) * Math.PI / 180;
        let mx = setWidth - this.startData.targData.width;
        let my = setHeight - this.startData.targData.height;
        let tx, ty, setTrans = $curElem.getAttribute("transform");
        switch (type) {
            case "southWest":
                tx = this.startData.targData.x - Math.cos(angle) * mx;
                ty = this.startData.targData.y - Math.sin(angle) * mx;
                break;
            case "northWest":
                let hypotenuse = Math.sqrt(Math.pow(mx, 2) + Math.pow(my, 2));
                let tempAngle = Math.atan(Math.abs(my / mx));
                tempAngle = 2 * Math.PI - angle - tempAngle;
                tx = this.startData.targData.x - (mx>=0?1:-1) * Math.cos(tempAngle) * hypotenuse;
                ty = this.startData.targData.y + (mx>=0?1:-1) * Math.sin(tempAngle) * hypotenuse;
                break;
            case "northEast":
                tx = this.startData.targData.x + Math.sin(angle) * my;
                ty = this.startData.targData.y - Math.cos(angle) * my;
                break;
        }

        // 设置属性
        if (tx && ty) {
            setTrans = setTrans.replace(/translate\([^)]+\)/, "translate("+ tx + " " + ty + ")");
            $curElem.setAttribute("transform",setTrans);
        }
        for (let i = 0;i < svgLength;i++) {
            let $svg = $$svg[i];
            $svg.setAttribute("width", setWidth + '');
            $svg.setAttribute("height", setHeight + '');
        }

        // 判断翻转
        let material = this.$tool.tempMaterial || this.$tool.getCurMaterial();
        if (material.reversal !== "1 1") {
            let reversalArr = material.reversal.split(" ");
            let transX = 0, transY = 0;
            let trans = $gSvg.getAttribute("transform");
            if (reversalArr[0] === "-1"){
                transX = setWidth;
            }
            if (reversalArr[1] === "-1"){
                transY = setHeight;
            }
            trans = trans.replace(/translate\([^)]+\)/, "translate(" + transX + " " + transY + ")");
            $gSvg.setAttribute("transform", trans);
        }
    }
    // 4.3：单个旋转
    singleZoomRotate($curElem, nowMouseLoc) {
        let $gWrap = $curElem.querySelector('g');
        let $svg = [...$gWrap.children].pop();
        let svgType = $svg.getAttribute("data-targetType");

        let px = this.startData.targData.px; //元素对象中心 x 坐标
        let py = this.startData.targData.py; //元素对象中心 y 坐标

        // 鼠标相对中心的位移
        let canvasRect = this.$tool.$canvasBg.getBoundingClientRect();
        let mx = nowMouseLoc.x - canvasRect.left;
        let my = nowMouseLoc.y - canvasRect.top;
        //求角度值
        let x = Math.abs(px-mx);
        let y = Math.abs(py-my);
        let z = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
        let angle = Math.acos(y/z) * 180 / Math.PI; //将弧度转换成角度

        //鼠标在第四象限
        if (mx > px && my > py) { angle = 180 - angle;}
        //鼠标在y轴负方向上
        if (mx === px && my > py) { angle = 180;}
        //鼠标在x轴正方向上
        if (mx > px && my === py) { angle = 90;}
        //鼠标在第三象限
        if (mx < px && my > py) { angle = 180 + angle;}
        //鼠标在x轴负方向
        if (mx <px && my === py) { angle = 270;}
        //鼠标在第二象限
        if (mx < px && my < py){ angle = 360 - angle;}

        //特殊角度的处理：0、45、90···
        if (angle > 356 || angle < 4){ angle = 0 }
        if (angle > 41 && angle < 49){ angle = 45 }
        if (angle > 86 && angle < 94){ angle = 90 }
        if (angle > 131 && angle < 139){ angle = 135 }
        if (angle > 176 && angle < 184){ angle = 180 }
        if (angle > 221 && angle < 229){ angle = 225 }
        if (angle > 266 && angle < 274){ angle = 270 }
        if (angle > 311 && angle < 319){ angle = 315 }

        //偏移值：transform
        if (svgType === "shape-line"){
            angle-=90;
        }
        let trans = $curElem.getAttribute("transform");
        trans = trans.replace(/rotate\([^,\s]+[,\s]/, "rotate(" + angle + " ");

        let material = this.$tool.getMaterialByMid(parseInt($curElem.getAttribute("data-mid")));
        material.angle = angle;

        //素材旋转
        $curElem.setAttribute("transform",trans);
        Z(".selection-tool .point.rotate>span").html(Math.floor(angle) + '°');
    }
    // 4.4：素材组缩放 斜边 对角方向
    groupZoomCoordinateXY(changeRatio, zoomType) {
        // 循环处理所有选中的素材
        let showRatio = this.$tool.showRatio;
        let dataWidth = this.startData.targData.width;
        let dataHeight = this.startData.targData.height;
        let dataXSp = this.startData.targData.xSp;
        let dataYSp = this.startData.targData.ySp;
        for (let i = 0;i < this.startData.elemsData.length;i++) {
            let elemData = this.startData.elemsData[i];
            let $curElem = this.$tool.getCurSvgElement(elemData.index);
            let $rect = $curElem.querySelector("rect");
            let $svg = $curElem.querySelector("svg");
            let svgType = $svg.getAttribute("data-targetType");

            let setWidth = elemData.width * changeRatio;
            setWidth = (setWidth > 0)?(setWidth):(1);
            let setHeight = elemData.height * changeRatio;
            setHeight = (setHeight > 0)?(setHeight):(1);

            // 矩形、svg的宽高设置
            $rect.setAttribute("width", setWidth);
            $rect.setAttribute("height", setHeight);
            $svg.setAttribute("width", setWidth);
            $svg.setAttribute("height", setHeight);

            // 不同情况的偏移处理
            let transX, transY;
            switch (zoomType) {
                case "se":
                    transX = elemData.x * changeRatio + dataXSp / showRatio;
                    transY = elemData.y * changeRatio + dataYSp / showRatio;
                    break;
                case "sw":
                    transX = elemData.x * changeRatio + (dataWidth * (1 - changeRatio) + dataXSp) / showRatio;
                    transY = elemData.y * changeRatio + dataYSp / showRatio;
                    break;
                case "nw":
                    transX = elemData.x * changeRatio + (dataWidth * (1 - changeRatio) + dataXSp) / showRatio;
                    transY = elemData.y * changeRatio + (dataHeight * (1 - changeRatio) + dataYSp) / showRatio;
                    break;
                case "ne":
                    transX = elemData.x * changeRatio + dataXSp / showRatio;
                    transY = elemData.y * changeRatio + (dataHeight * (1 - changeRatio) + dataYSp) / showRatio;
                    break;
            }

            // 组装transform
            let r = ($curElem.transform.baseVal[1])?($curElem.transform.baseVal[1].angle):(0);
            let rx = $curElem.getBBox().width / 2;
            let ry = $curElem.getBBox().height / 2;
            if (svgType === "shape-line"){
                rx = 0; ry = 0;
            }
            let trans = "translate(" + transX + " " + transY + ") rotate(" + r + "," + rx + "," + ry + ")";
            $curElem.setAttribute("transform",trans);
        }
    }

    /***********************************************
     *********** 五：素材选中、右键菜单 ************
     ***********************************************/
    // 5.1：素材多选-- mousedown
    multipleSelectStart(event) {
        // 判断是否存在已选，不存在则跳转到单选模式
        let targ = Z.E.current(event);
        let selectLength = this.$media.selectedList.length;
        if (selectLength === 0) {
            return this.singleSelectStart(event);
        }
        // 判断是否已选当前素材
        let material = this.$tool.getMaterialByMid(parseInt(targ.getAttribute("data-mid")));
        let lastMid = parseInt(this.$media.selectedList[this.$media.selectedList.length - 1]);
        let lastMaterial = this.$tool.getMaterialByMid(lastMid);

        // 素材存在表格，取消操作
        // if (material.isTable || lastMaterial.isTable)
        //     return;

        // 点击素材与已选素材状态不同，取消操作
        if (material.status !== lastMaterial.status)
            return;

        if (material.selected){
            if (!this.unSelectGroup(material))
                material.unSelected();
        } else {
            if (!this.$tool.selectGroup(material))
                material.doMultiSelected();
        }

        // 隐藏虚线框
        this.eleMouseLeave(event);

        // 执行多选结果，显示选中框
        SelectionTool.selectionToolsShow_group();

        // 事件绑定，素材组的拖动事件
        if (lastMaterial.status === 0)
            this.groupDragStart(event);
    }
    // 5.2：素材单选-- mousedown
    singleSelectStart(event) {
        Z.E.stop(event);
        let $target = Z.E.current(event);
        let material = this.$tool.getMaterialByMid(parseInt($target.getAttribute("data-mid")));
        this.$tool.clearSelected();

        // 判断是否存在群组（实则为多选）
        if (this.$tool.selectGroup(material)) {
            // 显示素材组选中框
            SelectionTool.selectionToolsShow_group();

            // 绑定素材组拖动事件
            if (material.status === 0)
                return this.groupDragStart(event);
            return;
        }
        let $curElem = this.$tool.getSvgElementByMid(material.mid);

        // 执行选中
        SelectionTool.selectTheElement(material, $curElem);

        // 判断素材状态
        if (material.status === 0) {
            this.singleDragStart(event);                    // 正常状态，绑定单素材拖动事件
        } else if (material.status === 3) {
            this.boxSelectStart(event);                     // 锁定状态，绑定框选操作
        }
    }
    // 5.3: 画布的右键菜单--contextMenu
    canvasContextMenu(event) {
        Const.createContextMenu({
            "event": event,
            "elemId": "canvasMenu",
            "editItem": [
                ["粘贴","contextMenuPaste"],
            ],
        });
    }
    // 5.4: 素材的右键菜单--contextMenu
    materialContextMenu(event) {
        let $curElem = Z.E.current(event);
        let material = this.$tool.getMaterialByMid(parseInt($curElem.getAttribute('data-mid')));
        if (material.status === 3) {
            Const.createContextMenu({
                "event": event,
                "elemId": "materialLockMenu",
                "editItem": [
                    ["解锁","MaterialTool.unlockMaterial"],
                ],
            });
            return;
        }
        Const.createContextMenu({
            "event": event,
            "elemId": "materialMenu",
            "editItem": [
                ["复制","MaterialTool.contextMenuCopy"],
                ["锁定","MaterialTool.doLockMaterial"],
                ["删除","MaterialTool.deleteMaterial"],
                [],
                ["上移一层","MaterialTool.downMaterial"],
                ["下移一层","MaterialTool.upMaterial"],
                ["置顶图层","MaterialTool.bottomMaterial"],
                ["置底图层","MaterialTool.topMaterial"],
                [],
                ['设置为"背景"',"MaterialTool.setBeBgMaterial"],
                // [
                //     ['设置为"背景"'],
                //     ['背景填充',"setBeBgMaterial"],
                //     ['背景适应',"setBeBgMaterial"],
                //     ['背景拉伸',"setBeBgMaterial"],
                //     ['背景平铺',"setBeBgMaterial"],
                //     ['背景居中',"setBeBgMaterial"],
                // ],
                ['添加到"我的素材"',"MaterialTool.addToCollectionList"],
            ],
        });
    }

    /********************************************
     ************** 六：素材双击事件 ************
     ********************************************/
    dblEventStart(event) {
        if (this.$media.selectedList.length !== 1) {
            return;
        }
        let material = this.$tool.tempMaterial || this.$tool.getCurMaterial();
        let $curElem = this.$tool.tempElement || this.$tool.getCurSvgElement();
        if (!material || material.status !== 0) {
            return;
        }
        material.type = parseFloat(material.type);
        // 文字类型,正常状态
        if (material.type === 1) {
            Z.E.forbidden(event);
            Const.docPopupHide(event);
            this.showTextEditor(material, $curElem);
        } else if (material.type === 0) {// 图片类型，执行图片裁剪
            Z.E.forbidden(event);
            Const.docPopupHide(event);
            this.showCutImage(material, $curElem);
        } else if (material.type === 4) {// 容器类型
            let $image = $curElem.querySelector(".svgFrame-img image");
            if (!$image) {
                return;
            }
            let linkHref = $image.getAttribute("xlink:href");
            if (!linkHref || linkHref.indexOf("container_default.png") > -1) {
                return;
            }
            // 容器图片裁剪
            this.showTrimFrameImg();
        } else if (material.type === 5) { // 形状类型
            let $svg = $curElem.querySelector('svg');
            let dataType = $svg.getAttribute('data-targetType');

            // 钢笔路径编辑
            if (dataType === 'shape-pen') {
                this.showPenEditTool(material, $curElem);
            } else if (dataType === 'shape-table') {// 表格内容编辑
                this.showTableToolByDbl();
            }
        }
    }

    /********************************************
     ************ 七：素材移入、移出事件 ***********
     ********************************************/
    // 7.1：进入元素，显示虚线框
    eleMouseEnter(event) {
        Z.E.stop(event);
        let $target = Z.E.current(event);
        let material = this.$tool.getMaterialByMid(parseInt($target.getAttribute("data-mid")));
        let isSelected = ((mid) => {
            for (let i = 0;i < this.$media.selectedList.length;i++){
                if (this.$media.selectedList[i] === mid)
                    return true;
            }
            return false;
        })(material.mid);
        if (material.status === 0 && !isSelected) {
            SelectionTool.selectionHover_show($target);
            Z("#selection_hover")[0].$targ = $target;
        }
    }
    // 7.2：离开元素，取消虚线框
    eleMouseLeave(event) {
        Z.E.stop(event);
        SelectionTool.selectionHover_hide();
        Z("#selection_hover")[0].$targ = null;
    }

    /********************************************
     ************* 八：画布drop事件 *************
     ********************************************/
    wrapFilesDrop(event) {
        Z.E.forbidden(event);
        let dt = event.dataTransfer;
        let files = dt.files;
        if(files.length === 0)
            return;
        Z.loading({
            shadow: true,
            text:"正在加载..."
        });
        // 清空选中列表
       this.$tool.clearSelected();
        //第一次循环，得到所有文本文档、图片
        let newFiles = [];
        for (let i = 0;i < files.length;i++) {
            let thisFile = files[i];
            let thisType = thisFile.type;
            if (thisType.indexOf("text") > -1 || thisType.indexOf("image") > -1)
                newFiles.push(thisFile);
        }
        // 得到所有即将进行AJAX的素材
        let preLength = this.$tool.getBgMaterialList(this.$media.curPage).length;
        this.$tool.ajaxLoadedLength = preLength + newFiles.length;
        for (let i = 0;i < newFiles.length;i++) {
            let file = newFiles[i];
            let reader = new FileReader();
            if (file.targetType.indexOf("text") > -1) {                      //文本读取方式
                reader.readAsText(file, "gb2312");
                reader.newType = "text";
            } else if (file.targetType.indexOf("image") > -1) {             //图片读取方式
                reader.readAsDataURL(file);
                reader.newType = "imgage";
            } else {
                this.$tool.ajaxLoadedLength--;
                continue;
            }
            //传递一些必要参数
            reader.newMid = preLength + i;
            reader.onload = function() {
                if (this.newType === "text") {                         //执行文字素材添加
                    MaterialTool.createTextMaterial(this.result, this.newMid);
                } else {                                              //执行图片素材添加
                    UploadImage.uploadFileRequest(this.result, this.newMid, true);
                }
            };
        }
    }

    /********************************************
     ************** 九：文本编辑器 **************
     ********************************************/
    // 9.1：侧边栏编辑器聚焦，赋值
    textSideFocusPath() {
        let material = this.$tool.tempMaterial || this.$tool.getCurMaterial();
        let $curElem = this.$tool.tempElement || this.$tool.getCurSvgElement();

        // 定义编辑素材和节点对象
        this.textElement = $curElem;
        this.textMaterial = material;

        let blockWidth = this.getSideBlockWidth($curElem, material);
        Z("#sideTextEditor").attr("data-blockWidth", blockWidth);
    }
    // 9.2：侧边栏编辑器，input 改变
    textSideInputPath(event) {
        // 路径生成，完成处理；textEditor
        let sideEditorPathDone = (material, $curElem)=> {
            let listLength = this.sideEditorList.length;
            if (listLength > 0){
                this.sideEditorState = 1;
                let lastM = this.sideEditorList[listLength - 1];
                material.text = lastM.text;
                material.wordsList = Z.clone(lastM.wordsList);
                this.sideEditorList.splice(0,listLength);
                MaterialTool.getPathAjax(material, $curElem, 1, 0, sideEditorPathDone);
            }
            this.sideEditorState = null;
            // 修正偏移
            Const.editOverSet($curElem);
            ElementUpdate.updateMaterialSource(material, $curElem);
            //设置属性
            ElementUpdate.setTextMaterialData(material, $curElem);
            //显示选中框
            let $ele = this.$tool.tempElement || this.$tool.getCurSvgElement();
            if ($ele)
                SelectionTool.selectionTool_show($ele);
        };

        let material = this.textMaterial;
        let $curElem = this.textElement;
        if (!material || !$curElem) {
            return;
        }
        let $gSvg = $curElem.querySelector("g");
        let $$svg = $gSvg.children;
        while ($$svg.length > 1)
            $gSvg.removeChild($$svg[0]);
        let $svg = $$svg[0];
        let $editor = Z.D.id("sideTextEditor") || Z.E.current(event);

        // 获取文字内容，包含自动换行标识
        let blockWidth = parseFloat($editor.getAttribute("data-blockWidth") || this.getSideBlockWidth($curElem, material));
        let text = this.getTextStrFromEditor($editor, blockWidth);

        if (Z.S.trim(text) === "") {
            material.text = text;
            let emptyFont = '<titem><span style="font-family:\''+material.fontFamily+'\'; color:'+material.color+';">'+text+'<br/></span></titem>';
            Z("#sideTextEditor").html(emptyFont);
            let $rect = $curElem.querySelector("rect");
            $rect.setAttribute("width",1);
            $rect.setAttribute("height",1);
            $svg.innerHTML = "";
            $svg.setAttribute("width",1);
            $svg.setAttribute("height",1);
            $svg.setAttribute("viewBox","0 0 1 1");
            SelectionTool.selectionTool_show();
            return;
        }

        // 获取 wordsList
        let wordsList = this.setWordsListFromEditor($editor, material);

        if (this.sideEditorState === 1) {//正在处理，队列添加
            this.sideEditorList.push({
                "text": material.text,
                "wordsList": Z.clone(material.wordsList),
            });
            return;
        }
        material.text = text;
        material.wordsList = wordsList;

        // 初始化队列
        if (!this.sideEditorList)
            this.sideEditorList = [];
        this.sideEditorState = 1;

        // 绘制
        MaterialTool.getPathAjax(material, $curElem, 1, 0, sideEditorPathDone);
    }
    // 9.3：侧边栏编辑器，blur 失去焦点 保存历史，刷新版面
    textSideBlur(event) {
        let $thisEditor = Z.E.current(event);
        let text = $thisEditor.innerText;
        this.textMaterial = this.textElement = null;

        if (Z.S.trim(text) === "") {
            MaterialTool.deleteMaterial();
        }
    }
    // 9.4：文本编辑器，粘贴事件
    textPastePath(event) {
        Z.E.forbidden(event);
        // 判断是不是侧边栏的操作
        let material = this.textMaterial;
        let $target = event.target;
        let isInSideTextor = Const.hasClassParent($target, "sideTextEditor");
        let editorId = "#textEditor";
        if (isInSideTextor) {
            editorId = "#sideTextEditor";
        }

        // 插入原格式粘贴内容，//去除空白行
        let content = event.clipboardData.getData("Text");
        content = Exchange.reBlankLine(content);

        // 获取字体类型和颜色
        let sl = window.getSelection();
        let anchorNode = sl.anchorNode.parentNode;
        let newFamily = this.getNodeFamily(anchorNode, material);
        let newColor = this.getNodeColor(anchorNode, material);
        let insetHtml = "";
        for (let i = 0;i < content.length;i++) {
            let newText = content[i];
            if (i === 0) insetHtml = "<titem" + ">";

            if (/\n/.test(newText)) {                //回车换行
                insetHtml += '</titem><titem><span style="font-family: \'' + newFamily + '\'; color:' + newColor + ';"></span>';
                continue;
            } else if (/\s/.test(newText)){         //空白字符
                newText = "&nbsp;";
            } else if (/\</.test(newText)){         //左尖括号：<
                newText = "&lt;";
            }
            insetHtml += '<span style="font-family:\'' + newFamily + '\'; color:' + newColor + ';">' + newText + '</span>';

            if (i === content.length - 1) insetHtml += "</titem>";
        }
        document.execCommand("insertHTML", false, insetHtml);
        if (isInSideTextor) {
            return;
        }

        // 定义material
        material.text = Z(editorId).text();
    }
    // 9.5：文本编辑器，blur 失去焦点
    textBlurPath(event) {
        // 1：定义可用变量
        let material = this.textMaterial;
        let $curElem = this.textElement;
        let showRatio = this.$tool.showRatio;
        let $target = event ? Z.E.target(event) : Z.D.id('textEditor');
        let text = this.getTextStrFromEditor($target);
        let $editorWrap = Z.D.id("textEditorWrap");
        let editorSetLoc = $editorWrap.editorSetLoc;
        let elemData = this.$tool.getEleData($curElem);
        let textAlign = Z("#textEditor").css("text-align");

        // 2：隐藏文本编辑工具
        // 添加“不可编辑”样式
        Z("#textEditorWrap").addClass('z-event-none');
        // 富文本编辑隐藏按钮
        Z(Const.richTextHideId).show();
        // 右侧通用编辑工具
        this.$tool.$toolsWrapRight.removeClass('zi-hide');
        // 两端对齐按钮
        Z("#textAlign_box > .justify").removeClass('zi-hide');

        // 3：判断是否需要删除
        if (Z.S.trim(text) === ""){
            let emptyFont = '<titem><span style="font-family:\'' + material.fontFamily + '\'; color:' + material.color + '">'+text+'<br/></span></titem>';
            Z("#textEditor").html(emptyFont);
            Z("#svg>g>svg").html("");
            material.doSelected();
            MaterialTool.deleteMaterial();
            return EditBtnTool.hideTextEditor();
        }

        // 5：判断计算参数是否有效
        if (!editorSetLoc)
            return MaterialTool.showTextElement($curElem);

        // 6：判断、重新赋值文字属性
        let toDoAlign = material.textAlign !== textAlign;
        let toDoPathAjax = true;
        let toDoColor = 0, toDoItalic = 0, toDoDecoration = 0;
        let isTextEqual = material.text === text;
        let newWordsList = this.setWordsListFromEditor(Z("#textEditor"));
        let newLength = newWordsList.length;

        // 标识 加粗、斜体、下划线
        let firstWord = newWordsList[0];
        let fontWeight = firstWord.fontWeight;
        let markWeight = true;
        let fontItalic = firstWord.fontItalic;
        let markItalic = true;
        let textDecoration = firstWord.textDecoration;
        let markDecoration = true;
        for (let i = 0;i < newLength;i++) {
            let newWord = newWordsList[i];
            // 获取属性值
            if (!!markWeight || !!markItalic || !!markDecoration){
                if (markWeight && fontWeight !== newWord.fontWeight){
                    markWeight = false;
                    fontWeight = 0;
                }
                if (markItalic && fontItalic !== newWord.fontItalic){
                    markItalic = false;
                    fontItalic = 0;
                }
                if (markDecoration && textDecoration !== newWord.textDecoration){
                    markDecoration = false;
                    textDecoration = 0;
                }
            }
            // 判断是否需要特殊处理
            let mWord = material.wordsList[i];
            if (!mWord)
                return;
            if (!isTextEqual && toDoColor && toDoItalic && toDoDecoration)
                return;
            let newTex = newWord.text.replace(/\s/, '');
            let mText = mWord.text.replace(/\s/, '');
            if (newTex !== mText || newWord.fontFamily !== mWord.fontFamily || newWord.fontWeight !== mWord.fontWeight)
                isTextEqual = false;
            if (newWord.color !== mWord.color)
                toDoColor = 1;
            if (newWord.fontItalic !== mWord.fontItalic)
                toDoItalic = 1;
            if (newWord.textDecoration !== mWord.textDecoration)
                toDoDecoration = 1;
        }
        if (isTextEqual) {
            toDoPathAjax = false;
        }

        // 素材属性赋值
        material.text = text;
        material.textAlign = textAlign;
        material.fontWeight = fontWeight;
        material.fontItalic = fontItalic;
        material.textDecoration = textDecoration;
        material.wordsList = Z.clone(newWordsList);
        newWordsList = null;

        // 7：插入结果文字到侧边栏编辑器
        Z("#sideTextEditor").css("text-align", textAlign);
        this.insertToSideEditor(material);

        // 8：计算绘制数据并绘制
        let editorMl = {};
        // 1：计算偏移位置
        let editorLeft = 0;
        let editorTop = 0;
        if (!$editorWrap.getAttribute('style')) {
            let elemTrans = $curElem.transform.baseVal[0];
            editorLeft = elemTrans.matrix.e;
            editorTop = elemTrans.matrix.f;
        } else {
            editorLeft = parseFloat(Z($editorWrap).css("left")) / showRatio;
            editorTop = parseFloat(Z($editorWrap).css("top")) / showRatio;
        }
        editorMl.mx = editorLeft - editorSetLoc.x / showRatio;
        editorMl.my = editorTop - editorSetLoc.y / showRatio;
        $editorWrap.editorSetLoc = null;
        // 2：重新绘制文字
        if (toDoPathAjax)
            return MaterialTool.getPathAjax(material, $curElem, 1, 1, (material, $curElem)=> {
                let angle = elemData.rotate * Math.PI / 180;
                let newData = this.$tool.getEleData($curElem);
                let mx = newData.width / 2 - elemData.width / 2;
                let my = newData.height / 2 - elemData.height / 2;
                let transX = newData.x - mx;
                let transY = newData.y - my;
                let setTrans;
                transX += mx * Math.cos(angle) - my * Math.sin(angle);
                transY += mx * Math.sin(angle) + my * Math.cos(angle);
                transX += editorMl.mx;
                transY += editorMl.my;

                setTrans = $curElem.getAttribute("transform");
                setTrans = setTrans.replace(/translate\([^/)]+\)/,
                    "translate(" + transX + " " + transY + ")");
                setTrans = setTrans.replace(/rotate\([^/)]+\)/,
                    "rotate(" + newData.rotate + " " + newData.width / 2 + " " + newData.height / 2 + ")");
                $curElem.setAttribute("transform", setTrans);

                // 设置文字特殊属性
                ElementUpdate.setTextMaterialData(material, $curElem);
                // 显示素材
                MaterialTool.showTextElement($curElem);
                // 显示选中框
                let $ele = this.$tool.tempElement || this.$tool.getCurSvgElement();
                if ($ele && $ele === this.textElement)
                    SelectionTool.selectionTool_show($ele);

                this.textMaterial = this.textElement = null;
                // 更新素材存储
                ElementUpdate.updateMaterialSource(material, $curElem);
                // 保存历史
                PrototypeHistory.saveHistory();
            });
        // 3：对齐操作
        toDoAlign && ElementUpdate.setElementAlign(textAlign, material, $curElem);
        // 3.1：修改颜色、斜体、下划线
        let toDo = [toDoColor , toDoItalic, toDoDecoration];
        if (toDo.includes(1)){
            let $$path = $curElem.querySelectorAll('.font-path');
            let wordsLength = material.wordsList.length;
            for (let i = 0;i < wordsLength;i++) {
                let word = material.wordsList[i];
                let $gPath = $$path[i];
                let $path = $gPath.querySelector('path');
                // 1：修改颜色
                if (toDo[0]) {
                    $path.setAttribute('fill', word.color);
                }
                // 2：斜体操作
                if (toDo[1]) {
                    let pathTrans = $gPath.getAttribute('transform');
                    let skewString;
                    if (word.fontItalic) {
                        if(material.textVertical === 'normal')
                            skewString = 'skewX(-18)';
                        else
                            skewString = 'skewY(18)';
                        if (/skew/.test(pathTrans))
                            pathTrans = pathTrans.replace(/skew[^)]+\)/, skewString);
                        else
                            pathTrans += ' ' + skewString;
                    } else {
                        pathTrans = pathTrans.replace(/skew[^)]+\)/, '').replace(/\s\s/g, ' ');
                    }
                    $gPath.setAttribute('transform', pathTrans);
                }
                // 3：下划线操作
                if (toDo[2]) {
                    let $line = $gPath.querySelector('line');
                    if (word.textDecoration && !$line) {
                        $line = document.createElementNS(Const.xmlns, "line");
                        let setX2 = parseFloat($gPath.getAttribute("data-width")) + parseFloat(material.letterSpacing);
                        $line.setAttribute("x1", '0');
                        $line.setAttribute("y1", material.underlineOffset);
                        $line.setAttribute("x2", setX2);
                        $line.setAttribute("y2", material.underlineOffset);
                        $line.setAttribute("stroke", word.color);
                        $line.setAttribute("stroke-width", material.underlineThickness);
                        $gPath.appendChild($line);
                    }
                    if (!word.textDecoration && $line) {
                        $gPath.removeChild($line);
                    }
                }
            }
        }
        // 4：显示素材
        MaterialTool.showTextElement($curElem);
        // 5：选中素材
        SelectionTool.selectTheElement(material, $curElem);
        // 6：保存
        ElementUpdate.updateMaterialSource(material, $curElem);
        PrototypeHistory.saveHistory();
    }

    /*******文本编辑器方法 **********/
    // 9.6：显示文本编辑框
    showTextEditor(material, $curElem) {
        let $svgElem = $curElem.querySelector("svg");
        let baseVal_0 = $curElem.transform.baseVal[0];
        let baseVal_1 = $curElem.transform.baseVal[1];
        let textAlign = material.textAlign;
        let showRatio = this.$tool.showRatio;

        // 设置tempCurrent
        this.$tool.setTempCurrent(material,$curElem);

        // 定义编辑素材和节点对象
        this.textMaterial = material;
        this.textElement = $curElem;

        // 隐藏当前素材
        MaterialTool.hideHiddenElement($curElem);

        // 隐藏编辑过程不需要的元素
        SelectionTool.selectionAll_hide();
        // 富文本编辑隐藏按钮
        Z(Const.richTextHideId).hide();
        // 右侧通用编辑工具
        this.$tool.$toolsWrapRight.addClass('zi-hide');
        // 两端对齐按钮
        Z("#textAlign_box > .justify").addClass('zi-hide');

        // 计算编辑框的样式
        let stageRect = this.$tool.$stageCanvas.getBoundingClientRect();
        let bgRect = this.$tool.$canvasBg.getBoundingClientRect();
        let setLeft = bgRect.left - stageRect.left;
        setLeft += baseVal_0.matrix.e * showRatio - 1;
        let setTop = bgRect.top - stageRect.top;
        setTop += baseVal_0.matrix.f * showRatio - 1;
        let textZoom = material.textZoom || "1 1";
        let zoomData = textZoom.split(" ");
        let setWidth = $svgElem.viewBox.baseVal.width * showRatio;

        let trueWidth = $svgElem.width.baseVal.value * showRatio;
        let trueHeight = $svgElem.height.baseVal.value * showRatio;
        // 定位编辑框
        Z("#textEditorWrap").css({
            "left": setLeft,
            "top": setTop,
            "transform": "rotate(" + baseVal_1.angle + "deg)",
            "transform-origin": trueWidth / 2 + "px " + trueHeight / 2 + "px 0",
        });
        Z("#textEditorPoint").css({
            "width" : parseFloat(zoomData[0]) * 100 + "%",
            "height" : parseFloat(zoomData[1]) * 100 + "%",
        });
        Z("#textEditor").css({
            "font-family": '"' + material.fontFamily + '"',
            "width": setWidth + "px",
            "transform": "scale(" + zoomData[0] + "," + zoomData[1] + ")",
            "transform-origin": "left top",
            "text-align": textAlign,
        }).focus();

        // 绑定当前编辑素材
        Z.D.id("textEditorWrap").editorSetLoc = {
            'x' : setLeft,
            'y' : setTop,
            'r' : showRatio,
        };

        // 插入文字代码
        this.insertToCanvasEditor(material);
        this.insertToSideEditor(material);
    }
    // 9.7：插入到画布编辑器
    insertToCanvasEditor(material) {
        this.insertTextToEditor(material, Z("#textEditor"));
    }
    // 9.8：插入到侧边栏编辑器
    insertToSideEditor(material) {
        let $activeElem = document.activeElement;
        if ($activeElem.id === "sideTextEditor"){
            return;
        }
        this.insertTextToEditor(material, Z("#sideTextEditor"));
    }
    // 9.9：插入文字到文字编辑器
    insertTextToEditor(textAttrObj, $texter) {
        // 主方法，定义变量
        let lineArr = textAttrObj.text.split("\n");
        let showRatio = this.$tool.showRatio;
        let textElemDoing = $texter[0].id === "textEditor";
        let markArr = [], i, j;
        if (textElemDoing) {
            let $curElem = this.$tool.getSvgElementByMid(textAttrObj.mid);
            let $$gInner = $curElem.querySelectorAll("svg > g");
        }

        // 1：插入字符

        // 插入字符文字
        $texter.html("");
        let listIndex = -1;
        for (let i = 0;i < lineArr.length;i++) {
            // 换行标识标记
            let words = lineArr[i];
            markArr[i] = [];
            while(words.indexOf('-%5-%-%5-') > -1){
                markArr[i].push(words.indexOf('-%5-%-%5-'));
                words = words.replace(/-%5-%-%5-/, "");
            }

            // 开始创建文字盒子
            let $titem = document.createElement("titem");
            if (words === "")
                $titem.insertAdjacentHTML("beforeend", '<span>&nbsp;</span>');

            // 遍历每一行的文字
            for (let j = 0;j < words.length;j++) {
                listIndex ++;
                let $word = textAttrObj.wordsList[listIndex];
                if (!$word)
                    return;
                let text = $word.text.replace(/-%6-%-%0-/g, '<');
                if (text === " ") {
                    text = "&nbsp;";
                }
                let $textStr = '<span style="font-family:\'' + $word.fontFamily + '\';';

                if ($word.color.toLowerCase() === 'none')
                    $textStr = '<font color="rgba(0,0,0,0)" >' + $textStr + '">' + text + '</span>' + '</font>';
                else
                    $textStr += 'color:' + $word.color + ';">' + text + '</span>';

                if ($word.textDecoration)
                    $textStr = '<u style="color: ' + $word.color + ';">' + $textStr + '</u>';
                if ($word.fontItalic)
                    $textStr = '<i>' + $textStr + '</i>';
                if ($word.fontWeight)
                    $textStr = '<b>' + $textStr + '</b>';
                $titem.insertAdjacentHTML("beforeend", $textStr);
            }
            $texter.append($titem);

            if (textElemDoing) {
                let $g = $$gInner[i];
                let dx;
                // 赋值，缩进
                if (!$g || $g.innerHTML === '') {
                    dx = 0;
                } else {
                    dx = parseFloat($g.getAttribute("data-dx") || 0);
                    dx = dx > 0 ? dx : 0;
                    dx *= showRatio;
                }
                Z($titem).css("text-indent", dx + "px");
            }
        }

        // 2：编辑器样式
        let fontSize = textAttrObj.fontSize;
        if (parseFloat(this.createMode) === 0) {
            fontSize = Exchange.pt2px(fontSize);
        }
        fontSize *=  showRatio;
        $texter.css({
            "fontSize" : fontSize,
            "letterSpacing": Math.round(parseFloat(textAttrObj.letterSpacing) * showRatio) + "px",
            "lineHeight": Math.round(parseFloat(textAttrObj.lineHeight) * showRatio) + "px",
        });
        $texter.attr("data-mathheight", textAttrObj.mathHeight).attr("data-fontsize", fontSize);

        // 3：校准宽度

        if (!textElemDoing)
            return;
        // 先取消旋转，计算完，再添加
        Z('#textEditorWrap').addClass('rotateNone');
        let wrapWidth = Math.ceil($texter[0].getBoundingClientRect().width);
        let $$titem = Z($texter).children('titem');
        let maxWidthArr = [wrapWidth];
        for (let i = 0;i < $$titem.length;i++) {
            let wordsWidth = 0;
            let $$span = $$titem[i].querySelectorAll('span');
            for (let j = 0;j < $$span.length;j++) {
                if (markArr[i].indexOf(j) > -1) {
                    wordsWidth = Math.ceil(wordsWidth);
                    if (wordsWidth > wrapWidth) maxWidthArr.push(wordsWidth);
                    wordsWidth = 0;
                }
                wordsWidth += Math.ceil($$span[j].getBoundingClientRect().width);
            }
            if (wordsWidth > wrapWidth)
                maxWidthArr.push(wordsWidth);
        }
        // 恢复旋转
        Z('#textEditorWrap').removeClass('rotateNone');
        Z($texter).css('width', Math.ceil(Const.getMaxNum(maxWidthArr)) / parseFloat(textAttrObj.textZoom.split(' ')[0] || 1));
    }
    // 9.10：是否是文本编辑器
    isInTextEditor(event) {
        let $node = Z.E.target(event);
        while ($node !== this.$tool.$designStage) {
            if ($node.id === "textEditor") {
                return true;
            }
            $node = $node.parentNode;
        }
        return false;
    }
    // 9.11：获取素材 text ；包含自动换行标识
    getTextStrFromEditor($editor, blockWidth) {
        // 遍历多文字节点
        let doEditorNodeText = ($node)=> {
            let $$childNodes = $node.childNodes;
            for (let i = 0;i < $$childNodes.length;i++) {
                let $childNode = $$childNodes[i];
                if ($childNode.nodeType !== 3){
                    doEditorNodeText($childNode);
                } else {
                    let nodeText = $childNode.textContent;
                    let $nodeParent = $childNode.parentNode;
                    for (let j = 0;j < nodeText.length;j++) {
                        let nodeStyle = window.getComputedStyle($nodeParent, null);
                        let $newFont = Z('<span style="z-index: -999;opacity: 0;">' + nodeText[j] + '</span>');
                        $newFont.appendTo(document.documentElement);
                        $newFont.css({
                            'fontFamily' : nodeStyle.fontFamily,
                            'fontSize' : nodeStyle.fontSize,
                            'fontStyle' : nodeStyle.fontStyle,
                            'lineHeight' : nodeStyle.lineHeight,
                            'letterSpacing' : nodeStyle.letterSpacing,
                        });
                        let textWidth = $newFont[0].getBoundingClientRect().width;
                        $newFont.remove();

                        wordsWidth += textWidth;
                        if (wordsWidth > blockWidth) {
                            textArr.push(textStr);
                            textArr.push("-%5-%-%5-");
                            // 重置参数
                            wordsWidth = textWidth;
                            textStr = "";
                        }
                        textStr += nodeText[j];
                    }
                }
            }
        }
        // 遍历单个块容器 titem
        let getTextStrFromBlock = ($block, textArr)=> {
            blockWidth = blockWidth || $block.offsetWidth;
            for (let i = 0;i < $block.children.length;i++)
            {
                let $child = $block.children[i];
                if ($child.tagName.toLowerCase() === "titem") {
                    getTextStrFromBlock($child, textArr);
                } else {
                    let childText = $child.innerText;
                    if (childText.length === 1) {// 单文字节点，直接计算
                        wordsWidth += $child.offsetWidth;
                        if (wordsWidth > blockWidth) {
                            textArr.push(textStr);
                            textArr.push("-%5-%-%5-");
                            // 重置参数
                            wordsWidth = $child.offsetWidth;
                            textStr = "";
                        }
                        textStr += childText;
                    } else if (childText.length > 1) {// 多个文字节点，循环处理
                        doEditorNodeText($child);
                    }
                }
            }
            if (textStr !== '')
            {
                textStr = Const.cutDoubleSpaceEnd(textStr);
                textArr.push(textStr);
                textArr.push("\n");
                wordsWidth = 0;
                textStr = '';
            }
            return textArr;
        }

        // 主方法
        let textArr = [];
        let $$children = $editor.children;
        let text, wordsWidth, textStr;
        for (let i = 0;i < $$children.length;i++) {
            let $child = $$children[i];
            // 处理块容器 titem 数据
            if ($child.tagName.toLowerCase() !== "titem"){
                continue;
            }
            wordsWidth = 0;
            textStr = "";
            textArr = getTextStrFromBlock($child, textArr);
        }
        text = Exchange.reBlankLine(textArr.join(""));
        return text;
    }
    // 9.12：计算侧边栏宽度，用于过渡计算
    getSideBlockWidth($curElem, material) {
        let $gWrap = $curElem.querySelector('g');
        let $svg = [...$gWrap.children].pop();
        let elemWidth = $svg.width.baseVal.value;
        elemWidth = Math.ceil(elemWidth / parseFloat(material.textZoom.split(' ')[0]));
        let fontSize = material.fontSize;
        if (this.createMode === 0) {
            fontSize = Exchange.pt2px(fontSize);
        }
        return Math.ceil(elemWidth * 14 / fontSize);
    }
    // 9.13：重新设置新的 wordsList
    setWordsListFromEditor($elem) {
        let addWordsListFromEditor = ($node)=> {// 遍历一行中的文字，添加 word
            if ($node.nodeType !== 3) {
                let $$children = $node.childNodes;
                for (let i = 0;i < $$children.length;i++) {
                    if($$children[i].nodeName.toLowerCase() === "titem") {
                        continue;
                    }
                    addWordsListFromEditor($$children[i]);
                }
                return;
            }

            let text = $node.textContent;
            let arrIndex = newList.length;
            let $pNode = $node.parentNode;

            //获取基础属性
            let fontSize = parseFloat(Z($elem).attr("data-fontsize"));  //获取准确的 px 值
            fontSize /= this.$tool.showRatio;
            if (this.createMode === 0) {
                fontSize = Exchange.px2pt(fontSize);
            }
            for (let j = 0;j < text.length;j++) {
                newList.push({
                    "color": this.getNodeColor($pNode),
                    "fontFamily": this.getNodeFamily($pNode),
                    "fontSize": fontSize,
                    "fontWeight": Const.getClosestParent($pNode, "b", "texter") ? (1) : (0),
                    "fontItalic": Const.getClosestParent($pNode, "i", "texter") ? (1) : (0),
                    "textDecoration": Const.getClosestParent($pNode, "u", "texter") ? (1) : (0),
                    "text": text[j],
                    "index": arrIndex + j,
                })
            }
        };

        // 主方法
        let newList = [];
        Z($elem).find("titem").each(($titem)=> addWordsListFromEditor($titem));
        return newList;
    }
    // 9.14：获取当前的字体
    getNodeFamily(node) {
        let fontFamily = Z(node).css('fontFamily');
        if (fontFamily.indexOf(',') > -1){
            fontFamily = fontFamily.split(',')[0];
        }
        if (/^'|".+/.test(fontFamily)){
            fontFamily = fontFamily.substring(1);
        }
        if (/.+'|"$/.test(fontFamily)){
            fontFamily = fontFamily.substring(0, fontFamily.length - 1);
        }
        return fontFamily;
    }
    // 9.15：获取当前的颜色
    getNodeColor(node) {
        let color = Z(node).css('color');
        if (/^rgb/.test(color)) {
            // 特殊颜色，可能是透明颜色
            if (color.toLowerCase().replace(/\s/g,'') === 'rgb(186,0,0)') {
                let $tempNode = node;
                while ($tempNode.tagName.toLowerCase() !== 'texter') {
                    if ($tempNode.hasAttribute('color'))
                        break;
                    $tempNode = $tempNode.parentNode;
                }
                let attrColor = $tempNode.getAttribute('color');
                if (attrColor && attrColor.toLowerCase().replace(/\s/g, '') === 'rgba(0,0,0,0)')
                    color = 'none';
            } else {
                color = Exchange.rgb2hex(color);
            }
        }
        return color;
    }

    /********************************************
     ************* 十：图片容器处理 *************
     ********************************************/
    // 10.1：容器图片裁剪，显示裁剪框 **/
    showTrimFrameImg($curElem, material) {
        $curElem = $curElem || this.$tool.tempElement || this.$tool.getCurSvgElement();
        material = material || this.$tool.tempMaterial || this.$tool.getCurMaterial();
        let $gSvg = $curElem.querySelector("g");
        let $svg = $gSvg.querySelector("svg");
        let $frameImage = $curElem.querySelector(".svgFrame-img image");
        let $frameRect = $curElem.querySelector(".svgFrame-img rect");

        // 计算
        let svgRatio = $svg.width.baseVal.value / $svg.viewBox.baseVal.width;
        let showRatio = this.$tool.showRatio;
        let wrap_width = $svg.width.baseVal.value;
        let wrap_height = $svg.height.baseVal.value;
        let old_width = $frameImage.width.baseVal.value;
        let old_height = $frameImage.height.baseVal.value;
        let old_trans = $frameImage.getAttribute("transform");
        let rect_width = $frameRect.width.baseVal.value;
        let rect_height = $frameRect.height.baseVal.value;
        let rect_x = $frameRect.x.baseVal.value;
        let rect_y = $frameRect.y.baseVal.value;
        let bg_width = old_width * svgRatio;
        let bg_height = old_height * svgRatio;
        // 偏移
        let elemMatrix = $curElem.transform.baseVal[0].matrix;
        let imgMatrix = $frameImage.transform.baseVal[0].matrix;
        let bg_left = imgMatrix.e * svgRatio;
        let bg_top = imgMatrix.f * svgRatio;
        let wrap_left = elemMatrix.e;
        let wrap_top = elemMatrix.f;
        // 旋转
        let wrap_trans = $curElem.transform.baseVal[1].angle;
        wrap_trans = "rotate(" + wrap_trans + "deg)";
        // 翻转
        let reversal;
        if ($gSvg.hasAttribute("transform")) {
            reversal = $gSvg.getAttribute("transform").replace(/.*scale\(([^)]+)\).*/, "$1");
            reversal = reversal ? reversal : "1 1";
        } else {
            reversal = "1 1";
        }
        material.reversal = reversal;
        let reversalArr = reversal.split(" ");
        if (reversalArr[0] === "-1"){
            bg_left = wrap_width - bg_width - bg_left;
        }
        if (reversalArr[1] === "-1"){
            bg_top = wrap_height - bg_height - bg_top;
        }

        // 赋值
        let stageRect = this.$tool.$stageCanvas.getBoundingClientRect();
        let canvasRect = this.$tool.$canvasBg.getBoundingClientRect();
        let mLeft = canvasRect.left - stageRect.left;
        let mTop = canvasRect.top - stageRect.top;

        wrap_width *= showRatio;
        wrap_height *= showRatio;
        wrap_left *= showRatio;
        wrap_top *= showRatio;

        wrap_left += mLeft;
        wrap_top += mTop;

        bg_width *= showRatio;
        bg_height *= showRatio;
        bg_left *= showRatio;
        bg_top *= showRatio;

        let $frameEditor = Z.D.id("imgFrameEditor");
        let $frameImgBg = Z.D.id("frameImgBg");
        let $bgImg = $frameImgBg.querySelector("img");
        let $frameImgCon = Z.D.id("frameImgCon");
        Z($frameEditor).css({
            "width": wrap_width,
            "height": wrap_height,
            "left": wrap_left,
            "top": wrap_top,
            "transform": wrap_trans,
        });
        Z($frameImgBg).css({
            "width": bg_width,
            "height": bg_height,
            "left": bg_left,
            "top": bg_top,
        });
        Z($frameImgCon).css({
            "width": bg_width,
            "height": bg_height,
            "left": bg_left,
            "top": bg_top,
        });
        Z($bgImg).attr("src",$frameImage.getAttribute("xlink:href"));
        Z($bgImg).css({
            "transform": "scale(" + reversalArr.join(",") + ")",
        });


        // 保存当前数据到frame
        let limitWidth = (rect_width + rect_x) * svgRatio * showRatio;
        let limitHeight = (rect_height + rect_y) * svgRatio * showRatio;
        $frameEditor.oldFrameData = {
            "eWidth": limitWidth,
            "eHeight": limitHeight,
            "width": old_width,
            "height": old_height,
            "trans": old_trans,
        };

        // 隐藏所有
        EditBtnTool.hideEditSelected();
        this.$tool.setTempCurrent(material,$curElem);

        // 事件绑定
        Z($frameEditor).on("click",Z.E.forbidden);
        Z("#frameImgBg>img").on("mousedown",this.frameBgDragStart,this);
        Z("#framePoint>.point").on("mousedown",this.frameBgResizeStart,this);
        Z("#frameBtn>.frameBtn-sure").on("click",this.frameBgDragSure,this);
        Z("#frameBtn>.frameBtn-cancel").on("click",this.frameBgDragCancel,this);
    }
    // 10.2：容器背景拖动事件
    frameBgDragStart(event) {
        Z.E.stop(event);
        let $frameEditor = Z.D.id("imgFrameEditor");
        let $frameImgBg = Z.D.id("frameImgBg");
        let $curElem = this.$tool.tempElement;
        if (!$curElem) {
            return;
        }
        let $image = $curElem.querySelector(".svgFrame-img image");
        let imageMatrix = $image.transform.baseVal[0].matrix;
        this.startData.angle = $curElem.transform.baseVal[1].angle;
        this.startData.mouseLoc = Const.getMouseLocation(event);
        this.startData.targData = {
            "wrap_width": $frameEditor.offsetWidth,
            "wrap_height": $frameEditor.offsetHeight,
            "bg_width": $frameImgBg.offsetWidth,
            "bg_height": $frameImgBg.offsetHeight,
            "x": $frameImgBg.offsetLeft,
            "y": $frameImgBg.offsetTop,
        };
        this.startData.imgData = {
            "x": imageMatrix.e,
            "y": imageMatrix.f,
        };
        // 事件绑定
        Z(this.$tool.$designStage).on("mousemove",this.frameBgDragDoing,this);
        Z(this.$tool.$designStage).on("mouseup mouseleave",this.frameBgDragDone,this);
    }
    frameBgDragDoing(event) {
        Z.E.cancel(event);
        let nowMouseLoc = Const.getMouseLocation(event);
        let mouseMetabolic = {
            "x": nowMouseLoc.x - this.startData.mouseLoc.x,
            "y": nowMouseLoc.y - this.startData.mouseLoc.y,
        };
        if (mouseMetabolic.x === 0 && mouseMetabolic.y === 0){
            return;
        }
        let $frameEditor = Z.D.id("imgFrameEditor");
        let $frameImgBg = Z.D.id("frameImgBg");
        let $curElem = this.$tool.tempElement;
        let $svg = $curElem.querySelector("svg");
        let $frameImage = $curElem.querySelector(".svgFrame-img image");
        let $imageRect = $curElem.querySelector(".svgFrame-img rect");
        let svgRatio = $svg.width.baseVal.value / $svg.viewBox.baseVal.width;
        let showRatio = this.$tool.showRatio;
        let angle = this.startData.angle * Math.PI/180;

        // 计算偏移
        let mouseAngle;
        let l = Math.sqrt(Math.pow(mouseMetabolic.x, 2) + Math.pow(mouseMetabolic.y, 2));
        let absAngle = Math.atan(Math.abs(mouseMetabolic.y) / Math.abs(mouseMetabolic.x));
        let rectAngle = 90 * Math.PI / 180;
        if (mouseMetabolic.x > 0 && mouseMetabolic.y === 0){           //x正轴
            mouseAngle = 0;
        } else if (mouseMetabolic.x > 0 && mouseMetabolic.y > 0){    //第一象限
            mouseAngle = absAngle;
        } else if (mouseMetabolic.x === 0 && mouseMetabolic.y > 0){   //y正轴
            mouseAngle = rectAngle;
        } else if (mouseMetabolic.x < 0 && mouseMetabolic.y > 0){    //第二象限
            mouseAngle = 2 * rectAngle - absAngle;
        } else if (mouseMetabolic.x < 0 && mouseMetabolic.y === 0){   //x负轴
            mouseAngle = 2 * rectAngle;
        } else if (mouseMetabolic.x < 0 && mouseMetabolic.y < 0){    //第三象限
            mouseAngle = 2 * rectAngle + absAngle;
        } else if (mouseMetabolic.x === 0 && mouseMetabolic.y < 0){   //y负轴
            mouseAngle = 3 * rectAngle;
        } else if (mouseMetabolic.x > 0 && mouseMetabolic.y < 0){    //第四象限
            mouseAngle = 4 * rectAngle - absAngle;
        }
        let bg_left = l * Math.cos(mouseAngle - angle) + this.startData.targData.x;
        let bg_top = l * Math.sin(mouseAngle - angle) + this.startData.targData.y;

        // 判断边界、临界点
        let wrap_width = this.startData.targData.wrap_width;
        let wrap_height = this.startData.targData.wrap_height;
        let bg_width = this.startData.targData.bg_width;
        let bg_height = this.startData.targData.bg_height;
        let limit_left = $imageRect.x.baseVal.value * svgRatio * showRatio;
        let limit_top = $imageRect.y.baseVal.value * svgRatio * showRatio;

        bg_left = (bg_left < limit_left)?(bg_left):(limit_left);
        bg_top = (bg_top < limit_top)?(bg_top):(limit_top);

        if (bg_left + bg_width < $frameEditor.oldFrameData.eWidth) {
            bg_left = $frameEditor.oldFrameData.eWidth - bg_width;
        }
        if (bg_top + bg_height < $frameEditor.oldFrameData.eHeight) {
            bg_top = $frameEditor.oldFrameData.eHeight - bg_height;
        }

        Z($frameImgBg).css({
            "left": bg_left,
            "top": bg_top,
        });

        // 对应素材的图片位移
        let material = this.$tool.getMaterialByMid(parseInt($curElem.getAttribute("data-mid")));
        let reversalArr = material.reversal.split(" ");
        let image_x = bg_left;
        let image_y = bg_top;
        if (reversalArr[0] !== "1"){
            image_x = wrap_width - bg_width - image_x;
        }
        if (reversalArr[1] !== "1"){
            image_y = wrap_height - bg_height - image_y;
        }
        image_x /= svgRatio * showRatio;
        image_y /= svgRatio * showRatio;
        $frameImage.setAttribute("transform","translate(" + image_x + " " + image_y + ")");
    }
    frameBgDragDone() {
        //事件清除
        Z(this.$tool.$designStage).off("mousemove",this.frameBgDragDoing,this);
        Z(this.$tool.$designStage).off("mouseup mouseleave",this.frameBgDragDone,this);
    }
    // 10.3：容器背景缩放事件
    frameBgResizeStart(event) {
        Z.E.stop(event);
        let $target = Z.E.current(event);
        let $frameEditor = Z.D.id("imgFrameEditor");
        let $frameImgBg = Z.D.id("frameImgBg");
        let $curElem = this.$tool.tempElement;
        if (!$curElem) {
            return;
        }
        let $image = $curElem.querySelector(".svgFrame-img image");
        let imageMatrix = $image.transform.baseVal[0].matrix;
        this.startData.angle = $curElem.transform.baseVal[1].angle;
        this.startData.mouseLoc = Const.getMouseLocation(event);
        this.startData.targetType = Z($target).attr("data-targetType");
        this.startData.targData = {
            "width": $frameImgBg.offsetWidth,
            "height": $frameImgBg.offsetHeight,
            "left": $frameImgBg.offsetLeft,
            "top": $frameImgBg.offsetTop,
            "bgRect": $frameImgBg.getBoundingClientRect(),
            "editorRect": $frameEditor.getBoundingClientRect(),
            "rectRatio": $frameImgBg.offsetWidth / $frameImgBg.offsetHeight,
        };
        this.startData.imgData = {
            "width": $image.width.baseVal.value,
            "height": $image.height.baseVal.value,
            "x": imageMatrix.e,
            "y": imageMatrix.f,
        };
        // 事件绑定
        Z(this.$tool.$designStage).on("mousemove",this.frameBgResizeDoing,this);
        Z(this.$tool.$designStage).on("mouseup mouseleave",this.frameBgResizeDone,this);
    }
    frameBgResizeDoing(event) {
        Z.E.cancel(event);
        let mouseMetabolic = this.getTrueZoomMetabolic(event);
        let $frameEditor = Z("#imgFrameEditor")[0];
        let $frameImgBg = Z("#frameImgBg")[0];
        let $curElem = this.$tool.tempElement;
        let $svg = $curElem.querySelector("svg");
        let $frameImage = $curElem.querySelector(".svgFrame-img image");
        let svgRatio = $svg.width.baseVal.value / $svg.viewBox.baseVal.width;

        let type = this.startData.targetType;
        let rectRatio = this.startData.targData.rectRatio;
        let bg_width, bg_height;

        // 计算 bg 宽高
        if (rectRatio >= 1) {
            if (type === "se" || type === "ne") {
                bg_width = this.startData.targData.width + mouseMetabolic.x;
            } else {
                bg_width = this.startData.targData.width - mouseMetabolic.x;
            }
            bg_width = (bg_width > 1)?(bg_width):1;
            bg_height = bg_width / rectRatio;
        } else {
            if (type === "se" || type === "sw") {
                bg_height = this.startData.targData.height + mouseMetabolic.y;
            } else {
                bg_height = this.startData.targData.height - mouseMetabolic.y;
            }
            bg_height = bg_height > 1 ? bg_height : 1;
            bg_width = bg_height * rectRatio;
        }

        // 计算 bg 偏移
        let bgRect = this.startData.targData.bgRect;
        let editorRect = this.startData.targData.editorRect;
        let bg_left = this.startData.targData.left;
        let bg_top = this.startData.targData.top;
        let target_ew, target_eh;

        switch (type) {
            case "se":
                if (bg_left + bg_width < $frameEditor.oldFrameData.eWidth) {
                    bg_width = $frameEditor.oldFrameData.eWidth - bg_left;
                    bg_height = bg_width / rectRatio;
                }
                if (bg_top + bg_height < $frameEditor.oldFrameData.eHeight) {
                    bg_height = $frameEditor.oldFrameData.eHeight - bg_top;
                    bg_width = bg_height * rectRatio;
                }
                break;
            case "sw":
                target_ew = this.startData.targData.width + this.startData.targData.left;
                if (bg_height + bgRect.top < editorRect.bottom) {
                    bg_height = editorRect.bottom - bgRect.top;
                    bg_width = bg_height * rectRatio;
                }
                bg_left = target_ew - bg_width ;
                bg_left = bg_left < 0?bg_left:0;
                if (bg_left >= 0) {
                    bg_left = 0;
                    bg_width = target_ew - bg_left;
                    bg_height = bg_width / rectRatio;
                }
                break;
            case "nw":
                target_ew = this.startData.targData.width + this.startData.targData.left;
                target_eh = this.startData.targData.height + this.startData.targData.top;
                if (bg_width + editorRect.left < bgRect.right) {
                    bg_width = bgRect.right - editorRect.left;
                    bg_height = bg_width / rectRatio;
                }
                if (bg_height + editorRect.top < bgRect.bottom) {
                    bg_height = bgRect.bottom - editorRect.top;
                    bg_width = bg_height * rectRatio;
                }
                bg_left = target_ew - bg_width ;
                bg_top = target_eh - bg_height;
                break;
            case "ne":
                target_eh = this.startData.targData.height + this.startData.targData.top;
                if (bg_width + bgRect.left < editorRect.right) {
                    bg_width = editorRect.right - bgRect.left;
                    bg_height = bg_width / rectRatio;
                    console.log(bg_width,bg_height);
                }
                bg_top = target_eh - bg_height;
                if (bg_top >= 0) {
                    bg_top = 0;
                    bg_height = target_eh - bg_top;
                    bg_width = bg_height * rectRatio;
                }
                break;
        }

        // 计算 image 素材 宽高
        let image_width = bg_width / this.$tool.showRatio / svgRatio;
        let image_height = bg_height / this.$tool.showRatio / svgRatio;

        // 赋值
        Z($frameImgBg).css({
            "width": bg_width,
            "height": bg_height,
            "left": bg_left,
            "top": bg_top,
        });
        $frameImage.setAttribute("width", image_width + "");
        $frameImage.setAttribute("height", image_height + "");
        // 对应素材的图片位移
        let image_x = bg_left / this.$tool.showRatio / svgRatio;
        let image_y = bg_top / this.$tool.showRatio / svgRatio;
        $frameImage.setAttribute("transform","translate(" + image_x + " " + image_y + ")");
    }
    frameBgResizeDone() {
        // 事件绑定
        Z(this.$tool.$designStage).off("mousemove",this.frameBgResizeDoing,this);
        Z(this.$tool.$designStage).off("mouseup mouseleave",this.frameBgResizeDone,this);
    }
    // 10.4：清除容器裁剪工具
    frameBgDragCancel(){
        let $curElem = this.$tool.tempElement;
        let $frameImage = $curElem.querySelector(".svgFrame-img image");
        let oldFrameData = Z("#imgFrameEditor")[0].oldFrameData;
        $frameImage.setAttribute("width",oldFrameData.width);
        $frameImage.setAttribute("height",oldFrameData.height);
        $frameImage.setAttribute("transform",oldFrameData.trans);
        // 清除剪切工具
        EditBtnTool.frameBgDragClear();
    }
    frameBgDragSure(){
        // 保存历史记录
        ElementUpdate.updateMaterialSource();
        PrototypeHistory.saveHistory();
        // 清除剪切工具
        EditBtnTool.frameBgDragClear();
    }
    // 10.5：图片容器，替换图片
    svgFrameMouseEnter(event) {
        this.dragFrameImg = null;
        if (!this.dragMaterial) {
            return;
        }
        // 拖动的素材
        let tMaterial = this.dragMaterial;
        if (tMaterial.targetType !== 0 && tMaterial.targetType !== 2) {         //如果不是图片、二维码
            return;
        }

        // 容器对象
        let $frameGelem = Z.E.current(event);
        let $frameImage = $frameGelem.querySelector("image");
        let $thisNode = $frameGelem;
        let $default = $thisNode.previousElementSibling;
        while(!$default || $default.getAttribute('class') !== 'svgFrame-default') {
            $thisNode = $thisNode.parentNode;
            $default = $thisNode.previousElementSibling;
        }

        // 隐藏默认背景
        $default.setAttribute('style', 'display:none;');

        // 获取拖动图片的链接地址
        let $tElem = this.$tool.getSvgElementByMid(tMaterial.mid);
        if (!$tElem) {
            return;
        }
        let $tSvg = $tElem.querySelector("svg");
        let $tImage = $tElem.querySelector("image");
        if (!$tSvg || !$tImage) {
            return;
        }
        let imgHref = $tImage.getAttribute("xlink:href");
        let frameHref = $frameImage.getAttribute("xlink:href");
        if (!imgHref) {
            return;
        }
        // 设置容器中的图片链接地址
        $frameImage.setAttribute("xlink:href", imgHref);
        $frameImage.setAttribute("href", imgHref);

        // 保存原始数据
        let old_trans = $frameImage.getAttribute("transform");
        let $img_rect = $frameImage.nextElementSibling;
        let old_width = parseFloat($frameImage.getAttribute("width"));
        let old_height = parseFloat($frameImage.getAttribute("height"));
        this.dragFrameImg = {
            "$default" : $default,
            "width": old_width,
            "height": old_height,
            "trans": old_trans,
            "url": frameHref || "",
        };
        // 设置图片大小
        let rect_width = $img_rect.width.baseVal.value;
        let rect_height = $img_rect.height.baseVal.value;
        let rect_x = $img_rect.x.baseVal.value;
        let rect_y = $img_rect.y.baseVal.value;
        let rect_ratio = rect_width / rect_height;
        let img_width = $tSvg.viewBox.baseVal.width;
        let img_height = $tSvg.viewBox.baseVal.height;
        let img_ratio = img_width / img_height;
        let set_width = rect_width;
        let set_height = rect_height;
        if (rect_ratio > img_ratio) {
            set_height = set_width / img_ratio;
        } else {
            set_width = set_height * img_ratio;
        }
        $frameImage.setAttribute("width",set_width);
        $frameImage.setAttribute("height",set_height);
        // 设置偏移
        let set_x = (rect_width - set_width)/2 + rect_x;
        let set_y = (rect_height - set_height)/2 + rect_y;
        let set_trans = "translate(" + set_x + " " + set_y + ")";
        $frameImage.setAttribute("transform",set_trans);
    }
    svgFrameMouseLeave(event) {
        if (!this.dragMaterial) {
            return;
        }
        // 拖动的素材
        let tMaterial = this.dragMaterial;
        if (tMaterial.targetType !== 0 && tMaterial.targetType !== 2) {         //如果不是图片、二维码
            return;
        }
        // 容器对象
        let $frameGelem = Z.E.current(event);
        let $frameImage = $frameGelem.querySelector("image");
        // 获取拖动图片的链接地址
        let $tElem = this.$tool.getSvgElementByMid(tMaterial.mid);
        if (!$tElem) {
            return;
        }
        let $tSvg = $tElem.querySelector("svg");
        let $tImage = $tElem.querySelector("image");
        if (!$tSvg || !$tImage) {
            return;
        }
        // 判断是否为同一张图片
        let imgHref = $tImage.getAttribute("xlink:href");
        let frameHref = $frameImage.getAttribute("xlink:href");
        if (!imgHref || !frameHref || frameHref !== imgHref) {
            return;
        }
        if (!this.dragFrameImg) {
            return;
        }

        // 显示默认背景
        if (this.dragFrameImg.url === Const.frameDefaultUrl){
            this.dragFrameImg.$default.removeAttribute('style');
        }
        $frameImage.setAttribute("xlink:href",this.dragFrameImg.url);
        $frameImage.setAttribute("href",this.dragFrameImg.url);
        $frameImage.setAttribute("width",this.dragFrameImg.width);
        $frameImage.setAttribute("height",this.dragFrameImg.height);
        $frameImage.setAttribute("transform",this.dragFrameImg.trans);
        this.dragFrameImg = null;
    }
    svgFrameMouseUp(event){
        if (!this.dragFrameImg)
            return;
        let $frameImage = Z.E.current(event).querySelector("image");
        let $$gElem = Z("[id^=svgElementSon_]");
        let $curElem, material;
        for(let i = 0;i < $$gElem.length;i++){
            let $elem = $$gElem[i];
            let $image = $elem.querySelector(".svgFrame-img image");
            if ($image === $frameImage){
                $curElem = $elem;
                material = this.$tool.getMaterialByMid(parseInt($curElem.getAttribute("data-mid")));
                break;
            }
        }
        // 清除对齐辅助线
        Z(".guide-line").remove();
        // 清除事件
        Z(this.$tool.$designStage).off("mousemove",this.singleDragDoing,this);
        Z(this.$tool.$designStage).off("mouseup mouseleave",this.singleDragDone,this);
        // 清空保存数据
        this.dragMaterial = null;
        this.dragFrameImg = null;
        // 赋值fileId，删除
        material.fileId = this.$tool.getCurMaterial().fileId;
        MaterialTool.deleteMaterial(true);
        // 保存
        ElementUpdate.updateMaterialSource(material, $curElem);
        PrototypeHistory.saveHistory();
    }

    /********************************************
     *************** 十一：图片裁剪 *************
     ********************************************/
    // 11.1：显示图片剪切、裁剪辅助框
    showCutImage(material, $curElem) {
        let showRatio = this.$tool.showRatio;
        let $svg = $curElem.querySelector("svg");
        let $image = $curElem.querySelector("image");
        let svgViewBox = $svg.viewBox.baseVal;
        let source_src = $image.getAttribute("xlink:href") || $image.getAttribute("href");

        let $imageTool = Z.D.id("cutImageTool");
        let $imageRect = Z.D.id("cutToolRect");
        let $imageCut = Z.D.id("cutToolImg");
        let $bgImg = $imageTool.querySelector("img");
        let $cutImg = $imageCut.querySelector("img");

        // 宽高
        let source_width = $image.width.baseVal.valueAsString;
        let source_height = $image.height.baseVal.valueAsString;
        // 兼容处理（image 宽高设置为 100% 的素材）
        if (svgViewBox.x === 0 && svgViewBox.y === 0 && source_width === "100%" && source_height === "100%"){
            source_width = svgViewBox.width;
            source_height = svgViewBox.height;
            $image.setAttribute("width", source_width);
            $image.setAttribute("height", source_height);
        }
        let rect_width = $svg.width.baseVal.value;
        let rect_height = $svg.height.baseVal.value;
        let svgRatio = rect_width / svgViewBox.width;

        // 保存必要数据
        $curElem.svgRatio = svgRatio;

        let wrap_width = source_width * svgRatio;
        let wrap_height = source_height * svgRatio;
        // 偏移
        let elemMatrix = $curElem.transform.baseVal[0].matrix;
        let rect_left = svgViewBox.x * svgRatio;
        let rect_top = svgViewBox.y * svgRatio;

        // 判断是否有翻转，重新计算 rect_left、rect_top
        if (material.reversal !== "1 1"){
            let reversalArr = material.reversal.split(" ");
            if (reversalArr[0] === "-1"){
                rect_left = wrap_width - rect_width - rect_left;
            }
            if (reversalArr[1] === "-1"){
                rect_top = wrap_height - rect_height - rect_top;
            }
            Z($bgImg).css({
                "transform": "scale(" + reversalArr.join(",") + ")",
            });
            Z($cutImg).css({
                "transform": "scale(" + reversalArr.join(",") + ")",
            });
        }

        let wrap_r = $curElem.transform.baseVal[1].angle;
        let wrap_trans = "rotate(" + wrap_r + "deg)";
        wrap_r *= Math.PI / 180;
        let wrap_left = elemMatrix.e - (rect_left * Math.cos(wrap_r) - rect_top * Math.sin(wrap_r));
        let wrap_top = elemMatrix.f - (rect_left * Math.sin(wrap_r) + rect_top * Math.cos(wrap_r));
        wrap_left -= (wrap_width / 2 - rect_width / 2);
        wrap_top -= (wrap_height / 2 - rect_height / 2);
        wrap_left +=  (wrap_width / 2 - rect_width / 2) * Math.cos(wrap_r) - (wrap_height / 2 - rect_height / 2) * Math.sin(wrap_r);
        wrap_top += (wrap_width / 2 - rect_width / 2) * Math.sin(wrap_r) + (wrap_height / 2 - rect_height / 2) * Math.cos(wrap_r);

        // 判断首次裁剪，裁剪框定位；2 为误差范围
        if (Math.abs(wrap_width - rect_width) < 2 && Math.abs(wrap_height - rect_height) < 2) {
            rect_width = wrap_width * 2 / 3;
            rect_height = wrap_height * 2 / 3;
            rect_left = wrap_width / 6;
            rect_top = wrap_height / 6;
        }

        // 展示裁剪工具
        let stageRect = this.$tool.$stageCanvas.getBoundingClientRect();
        let canvasRect = this.$tool.$canvasBg.getBoundingClientRect();
        let mLeft = canvasRect.left - stageRect.left;
        let mTop = canvasRect.top - stageRect.top;

        wrap_width *= showRatio;
        wrap_height *= showRatio;
        wrap_left *= showRatio;
        wrap_top *= showRatio;

        // 偏移计算，添加特殊尺寸删减部分
        wrap_left += mLeft;
        wrap_top += mTop;

        Z($imageTool).css({
            "width": wrap_width,
            "height": wrap_height,
            "left": wrap_left,
            "top": wrap_top,
            "transform": wrap_trans,
        });

        rect_width *= showRatio;
        rect_height *= showRatio;
        rect_left *= showRatio;
        rect_top *= showRatio;

        Z($imageRect).css({
            "width": rect_width,
            "height": rect_height,
            "left": rect_left,
            "top": rect_top,
        });
        $bgImg.setAttribute("src",source_src);
        $cutImg.setAttribute("src",source_src);
        Z($cutImg).css({
            "width": wrap_width,
            "height": wrap_height,
            "left": "-" + rect_left + "px",
            "top": "-" + rect_top + "px",
        });

        // 隐藏所有
        EditBtnTool.hideEditSelected();
        this.$tool.setTempCurrent(material,$curElem);

        // 定义 stargData
        this.startData.targData = this.$tool.getEleData($curElem);

        // 事件绑定
        Z($imageTool).on("click",Z.E.forbidden);
        Z("#cutToolRect").on("mousedown", this.cutImageDragStart, this);
        Z("#cutToolPoint>.point").on("mousedown", this.cutImageZoomStart, this);
        Z("#cutToolBtn .cutToolBtn-sure").on("click", this.cutImageSure, this);
        Z("#cutToolBtn .cutToolBtn-cancel").on("click", this.cutImageCancel, this);
    }
    // 11.2：拖动裁剪框
    cutImageDragStart(event) {
        Z.E.forbidden(event);
        let $imageTool = Z.D.id("cutImageTool");
        let $imageRect = Z.D.id("cutToolRect");

        // 定义 startData
        this.startData.mouseLoc = Const.getMouseLocation(event);
        this.startData.toolData = {
            "w" : parseFloat(Z($imageTool).css("width")),
            "h" : parseFloat(Z($imageTool).css("height")),
            "x" : parseFloat(Z($imageTool).css("left")),
            "y" : parseFloat(Z($imageTool).css("top"))
        };
        this.startData.rectData = {
            "w" : parseFloat(Z($imageRect).css("width")),
            "h" : parseFloat(Z($imageRect).css("height")),
            "x" : parseFloat(Z($imageRect).css("left")),
            "y" : parseFloat(Z($imageRect).css("top"))
        };

        // 事件绑定
        Z(this.$tool.$designStage).on("mousemove",this.cutImageDragDoing,this);
        Z(this.$tool.$designStage).on("mouseup mouseleave",this.cutImageDragDone,this);
    }
    cutImageDragDoing(event) {
        Z.E.cancel(event);
        // 计算鼠标偏移量
        let nowMouseLoc = Const.getMouseLocation(event);
        let mouseMetabolic = {
            "x": nowMouseLoc.x - this.startData.mouseLoc.x,
            "y": nowMouseLoc.y - this.startData.mouseLoc.y,
        };
        if (mouseMetabolic.x == 0 && mouseMetabolic.y == 0) {
            return;
        }
        let mouseAngle;
        let l = Math.sqrt(Math.pow(mouseMetabolic.x, 2) + Math.pow(mouseMetabolic.y, 2));
        let absAngle = Math.atan(Math.abs(mouseMetabolic.y) / Math.abs(mouseMetabolic.x));
        let rectAngle = 90 * Math.PI / 180;
        if (mouseMetabolic.x > 0 && mouseMetabolic.y === 0){           //x正轴
            mouseAngle = 0;
        } else if (mouseMetabolic.x > 0 && mouseMetabolic.y > 0){    //第一象限
            mouseAngle = absAngle;
        } else if (mouseMetabolic.x === 0 && mouseMetabolic.y > 0){   //y正轴
            mouseAngle = rectAngle;
        } else if (mouseMetabolic.x < 0 && mouseMetabolic.y > 0){    //第二象限
            mouseAngle = 2 * rectAngle - absAngle;
        } else if (mouseMetabolic.x < 0 && mouseMetabolic.y === 0){   //x负轴
            mouseAngle = 2 * rectAngle;
        } else if (mouseMetabolic.x < 0 && mouseMetabolic.y < 0){    //第三象限
            mouseAngle = 2 * rectAngle + absAngle;
        } else if (mouseMetabolic.x === 0 && mouseMetabolic.y < 0){   //y负轴
            mouseAngle = 3 * rectAngle;
        } else if (mouseMetabolic.x > 0 && mouseMetabolic.y < 0){    //第四象限
            mouseAngle = 4 * rectAngle - absAngle;
        }
        let true_x = l * Math.cos(mouseAngle - this.startData.targData.rotate*Math.PI/180);
        let true_y = l * Math.sin(mouseAngle - this.startData.targData.rotate*Math.PI/180);

        // 计算 rect 最大值；（最小值为 0）
        let limit_left = this.startData.toolData.w - this.startData.rectData.w;
        let limit_top = this.startData.toolData.h - this.startData.rectData.h;
        let rect_left = this.startData.rectData.x + true_x;
        let rect_top = this.startData.rectData.y + true_y;
        rect_left = rect_left > 0 ? rect_left : 0;
        rect_top = rect_top > 0 ? rect_top : 0;
        rect_left = rect_left < limit_left ? rect_left : limit_left;
        rect_top = rect_top < limit_top ? rect_top : limit_top;

        let $imageRect = Z.D.id("cutToolRect");
        let $cutImg = $imageRect.querySelector("img");
        Z($imageRect).css({
            "left" : rect_left,
            "top" : rect_top,
        });
        //判断是否有翻转

        var material = this.$tool.tempMaterial;
        Z($cutImg).css({
            "left" : "-" + rect_left + "px",
            "top" : "-" +rect_top + "px",
        });
    }
    cutImageDragDone() {
        // 取消绑定事件
        Z(this.$tool.$designStage).off("mousemove",this.cutImageDragDoing,this);
        Z(this.$tool.$designStage).off("mouseup mouseleave",this.cutImageDragDone,this);
    }
    // 11.3：缩放裁剪框
    cutImageZoomStart(event) {
        Z.E.forbidden(event);

        let $imageTool = Z.D.id("cutImageTool");
        let $imageRect = Z.D.id("cutToolRect");

        // 定义 startData
        this.startData.zoomType = Z(Z.E.current(event)).attr("data-targetType");
        this.startData.mouseLoc = Const.getMouseLocation(event);
        this.startData.toolData = {
            "w" : parseFloat(Z($imageTool).css("width")),
            "h" : parseFloat(Z($imageTool).css("height")),
            "x" : parseFloat(Z($imageTool).css("left")),
            "y" : parseFloat(Z($imageTool).css("top"))
        };
        this.startData.rectData = {
            "w" : parseFloat(Z($imageRect).css("width")),
            "h" : parseFloat(Z($imageRect).css("height")),
            "x" : parseFloat(Z($imageRect).css("left")),
            "y" : parseFloat(Z($imageRect).css("top"))
        };

        // 事件绑定
        Z(this.$tool.$designStage).on("mousemove",this.cutImageZoomDoing,this);
        Z(this.$tool.$designStage).on("mouseup mouseleave",this.cutImageZoomDone,this);
    }
    cutImageZoomDoing(event) {
        Z.E.cancel(event);
        //计算鼠标偏移量
        let true_data = SelectionTool.getElementTrueEX(Const.getMouseLocation(event), this.startData.mouseLoc.x, this.startData.mouseLoc.y, this.startData.targData.rotate);
        let true_x = true_data.x;
        let true_y = true_data.y;
        if (true_x === 0 && true_y === 0)
            return;

        //定义 rect 定位临界值
        let limit_left = this.startData.toolData.w;
        let limit_top = this.startData.toolData.h;
        let limit_width = this.startData.toolData.w;
        let limit_height = this.startData.toolData.h;

        // rect 参数
        let rect_left = this.startData.rectData.x;
        let rect_top = this.startData.rectData.y;
        let rect_width = this.startData.rectData.w;
        let rect_height = this.startData.rectData.h;
        // tool 参数
        let tool_width = this.startData.toolData.w;
        let tool_height = this.startData.toolData.h;

        //缩放类型
        switch (this.startData.zoomType) {
            case "ne":
                // 计算 rect 大小临界值
                limit_width = tool_width - rect_left;
                limit_height = rect_height + rect_top;

                // 计算 rect 结果
                rect_top += true_y;
                rect_width += true_x;
                rect_height -= true_y;
                break;
            case "se":
                // 计算 tool 大小临界值
                limit_width = tool_width - rect_left;
                limit_height = tool_height - rect_top;

                // 计算 tool 结果
                rect_width += true_x;
                rect_height += true_y;
                break;
            case "sw":
                // 计算 tool 大小临界值
                limit_width = rect_width + rect_left;
                limit_height = tool_height - rect_top;

                // 计算 tool 结果
                rect_left += true_x;
                rect_width -= true_x;
                rect_height += true_y;
                break;
            case "nw":
                // 计算 tool 大小临界值
                limit_width = rect_width + rect_left;
                limit_height = rect_height + rect_top;

                // 计算 tool 结果
                rect_left += true_x;
                rect_top += true_y;
                rect_width -= true_x;
                rect_height -= true_y;
                break;
        }

        //计算 rect 结果
        rect_left = rect_left > 0 ? (rect_left < limit_left ? rect_left : limit_left) : 0;
        rect_top = rect_top > 0 ? (rect_top < limit_top ? rect_top : limit_top) : 0;
        rect_width = rect_width > 0 ? (rect_width < limit_width ? rect_width : limit_width) : 0;
        rect_height = rect_height > 0 ? (rect_height < limit_height ? rect_height : limit_height) : 0;

        //呈现
        let $imageRect = Z.D.id("cutToolRect");
        let $imageCut = Z.D.id("cutToolImg");
        let $cutImg = $imageCut.querySelector("img");
        Z($imageRect).css({
            "left" : rect_left,
            "top" : rect_top,
            "width" : rect_width,
            "height" : rect_height,
        });
        Z($cutImg).css({
            "left" : "-" + rect_left + "px",
            "top" :  "-" +rect_top + "px",
        });
    }
    cutImageZoomDone() {
        // 取消绑定事件
        Z(this.$tool.$designStage).off("mousemove",this.cutImageZoomDoing,this);
        Z(this.$tool.$designStage).off("mouseup mouseleave",this.cutImageZoomDone,this);
    }
    // 11.4：确认完成剪切
    cutImageSure(event) {
        // 1：定义可以参数
        Z.E.forbidden(event);
        let material = this.$tool.tempMaterial;
        let $curElem = this.$tool.tempElement;
        let $gSvg = $curElem.querySelector("g");
        let $rect = $curElem.querySelector("rect");
        let $svg = $gSvg.querySelector("svg");
        let showRatio = this.$tool.showRatio;
        let svgRatio = $curElem.svgRatio;

        // 2：计算 translate 偏移
        let $imageTool = Z.D.id("cutImageTool");
        let $imageRect = Z.D.id("cutToolRect");
        let tool_width = parseFloat(Z($imageTool).css("width"));
        let tool_height = parseFloat(Z($imageTool).css("height"));
        let svgViewBox = $svg.viewBox.baseVal;
        let view_left = svgViewBox.x;
        let view_top = svgViewBox.y;
        let reversalArr = [1,1];
        if (material.reversal !== "1 1") {
            reversalArr = material.reversal.split(" ");
            reversalArr = reversalArr.map(parseFloat);
        }

        // 3：重新计算 rect_left、rect_top
        // 设置翻转元素 g 偏移
        let rect_left = parseFloat(Z($imageRect).css("left"));
        let rect_top = parseFloat(Z($imageRect).css("top"));
        let rect_width = parseFloat(Z($imageRect).css("width"));
        let rect_height = parseFloat(Z($imageRect).css("height"));
        let gSvgX = 0, gSvgY = 0;
        if (reversalArr[0] === -1){
            rect_left = tool_width - rect_width - rect_left;
            //view_left = source_width - svgViewBox.x - svgViewBox.width;
            gSvgX = rect_width / showRatio;
        }
        if (reversalArr[1] === -1){
            rect_top = tool_height - rect_height - rect_top;
            gSvgY = rect_height / showRatio;
        }
        $gSvg.setAttribute("transform", "translate(" + gSvgX +" " + gSvgY + ") scale(" + material.reversal + ")");

        // 4：计算 $curElem 偏移
        let svg_width = $svg.width.baseVal.value;
        let svg_height = $svg.height.baseVal.value;
        let mLeft = reversalArr[0] * (rect_left / showRatio - view_left * svgRatio);
        let mTop = reversalArr[1] * (rect_top / showRatio - view_top * svgRatio);
        let curTrans = $curElem.transform.baseVal;
        let trans_x = curTrans[0].matrix.e;
        let trans_y = curTrans[0].matrix.f;
        let angle = curTrans[1].angle * Math.PI / 180;
        mLeft += reversalArr[0] === -1 ? (svg_width - rect_width / showRatio) : 0;
        mTop += reversalArr[1] === -1 ? (svg_height - rect_height / showRatio) : 0;
        trans_x += mLeft * Math.cos(angle) - mTop * Math.sin(angle);
        trans_y += mLeft * Math.sin(angle) + mTop * Math.cos(angle);

        let translate_str = "translate(" + trans_x + " " + trans_y + ")";
        let trans = $curElem.getAttribute("transform");
        trans = trans.replace(/translate\([^)]*\)/, translate_str);
        $curElem.setAttribute("transform",trans);

        // 5：计算 viewBox 大小
        let viewBox_x = rect_left / svgRatio;
        let viewBox_y = rect_top / svgRatio;
        let viewBox_w = rect_width / svgRatio;
        let viewBox_h = rect_height / svgRatio;

        viewBox_x /= showRatio;
        viewBox_y /= showRatio;
        viewBox_w /= showRatio;
        viewBox_h /= showRatio;
        $svg.setAttribute("viewBox", viewBox_x + " " + viewBox_y + " " + viewBox_w + " " + viewBox_h);

        // 6：赋值 svg、rect 宽高
        rect_width /= showRatio;
        rect_height /= showRatio;
        $svg.setAttribute("width", rect_width + "");
        $svg.setAttribute("height", rect_height + "");
        $rect.setAttribute("width", rect_width + "");
        $rect.setAttribute("height", rect_height + "");

        // 7：校准偏移
        Const.editOverSet($curElem);

        // 8：更新素材
        ElementUpdate.updateMaterialSource(material, $curElem);
        PrototypeHistory.saveHistory();

        // 9：取消素材选择
       this.$tool.clearSelected();

        // 10：隐藏剪切工具
        EditBtnTool.cutImageToolHide();

        // 11：图片圆角处理
        let $imgRadioDef = $svg.querySelector('[id^=radius_svgElementSon_]');
        if ($imgRadioDef) {
            let $radioRect = $imgRadioDef.querySelector('rect');
            if ($radioRect) {
                $radioRect.setAttribute('x', viewBox_x + '');
                $radioRect.setAttribute('y', viewBox_y + '');
                $radioRect.setAttribute('width', viewBox_w + '');
                $radioRect.setAttribute('height', viewBox_h + '');
            }
        }
    }
    // 11.5：取消剪切
    cutImageCancel(event) {
        Z.E.forbidden(event);
        // 取消素材选择
       this.$tool.clearSelected();
        EditBtnTool.cutImageToolHide();
    }

    /********************************************
     *************** 十二：钢笔工具 *************
     ********************************************/
    // 12.1：钢笔路径，显示为编辑状态
    showPenEditTool(material, $curElem) {
        // 素材宽高缩放、旋转后，像素点的偏移
        let thePointAfterSet = (sPX, sPY)=> {
            sPX = sPX * xPlus;
            sPY = sPY * yPlus;
            let cMX = centerPoint.x - sPX;
            let cMY = centerPoint.y - sPY;
            let absHypotenuse = Math.sqrt(cMX * cMX + cMY * cMY);
            let angle = (180 - elemTrans.rotate) / 2;
            angle *= Math.PI / 180;
            let absM = (absHypotenuse * Math.cos(angle)) * 2;
            angle -= Math.atan(cMY / cMX);
            if (cMX < 0)
                angle += Math.PI;
            let mx = absM * Math.cos(angle);
            let my = absM * Math.sin(angle);
            return {
                'x' : sPX + mx,
                'y' : sPY - my,
            }
        };

        // 主方法，定义变量
        let canvasRect = this.$tool.$canvasBg.getBoundingClientRect();
        let svgView = this.$tool.$canvasSvg.viewBox.baseVal;
        let canvasWidth = svgView.width;
        let canvasHeight = svgView.height;
        let $penCover = Z.D.id('penEditorCover');
        let $tangentWrap = Z.D.id('penTangentTool');
        let coverRect = this.$tool.$designStage.getBoundingClientRect();
        let $rect = $curElem.querySelector("rect");
        let $svg = $curElem.querySelector("svg");
        let $path = $svg.querySelector("path");
        let viewWidth = $svg.viewBox.baseVal.width;
        let viewHeight = $svg.viewBox.baseVal.height;
        let svgWidth = $svg.width.baseVal.value;
        let svgHeight = $svg.height.baseVal.value;
        let xPlus = svgWidth / viewWidth;
        let yPlus = svgHeight / viewHeight;
        let transList = $curElem.transform.baseVal;
        let matrix = {}, rotate = null;
        [].forEach.call(transList, (obj)=> {
            if (obj.targetType !== 2 && obj.targetType !== 4)
                return;
            if (obj.targetType === 2)
                matrix = obj.matrix;
            if (obj.targetType === 4)
                rotate = obj.angle;
        });
        let elemTrans = {
            'x' : matrix.e,
            'y' : matrix.f,
            'rotate' : rotate,
        };
        let centerPoint = {
            'x' : svgWidth / 2,
            'y' : svgHeight / 2,
        };
        let setD = $path.getAttribute('d');
        let pathStart = /^M[^C]+\s/.exec(setD);
        let dBezier = setD.match(/C[^C\s]+\s[^C\s]+\s[^C\s]+/g);
        let pathEnd = /\sZ$/.exec(setD);
        pathStart = pathStart && pathStart[0];
        pathEnd = (pathEnd && pathEnd[0]) || '';

        // 1：设置工具样式
        // 1：隐藏必要工具
        EditBtnTool.hideEditSelected();

        // 2：遮罩层显示
        Z($penCover).addClass('readyDrawing readyEdit');

        // 3：定义操作类型
        this.shapeType = '11';

        // 4：计算并显示新路径
        let startPoint = pathStart.replace(/M|\s$/g, '');
        startPoint = startPoint.split(',');
        let sPX = parseFloat(startPoint[0]);
        let sPY = parseFloat(startPoint[1]);
        startPoint = thePointAfterSet(sPX, sPY);
        pathStart = 'M' + (startPoint.x + elemTrans.x) + ',' + (startPoint.y + elemTrans.y) + ' ';

        // 重设曲线锚点坐标
        dBezier = dBezier.map((bezier)=> {
            bezier = bezier.substring(1);
            let points = bezier.split(' ');
            points = points.map((pointData)=> {
                let pointLoc = pointData.split(',');
                let pLocX = parseFloat(pointLoc[0]);
                let pLocY = parseFloat(pointLoc[1]);
                let resultLoc = thePointAfterSet(pLocX, pLocY);
                return (resultLoc.x + elemTrans.x) + ',' + (resultLoc.y + elemTrans.y);
            });
            return 'C' + points.join(' ');
        });

        setD = pathStart + dBezier.join(' ') + pathEnd;
        $path.setAttribute('d', setD);

        // 5：显示锚点工具
        // 主方法：循环处理
        Z($tangentWrap).addClass('editPath');
        let showRatio = this.$tool.showRatio;
        let mLeft = canvasRect.left - coverRect.left;
        let mTop = canvasRect.top - coverRect.top;
        let coverWidth = coverRect.width;
        let coverHeight = coverRect.height;
        for (let i = 0;i < dBezier.length;i++) {
            // 1：当前曲线
            let pointList = dBezier[i].substring(1).split(' ');
            // 2：所有已存在的切线
            let $$allTangent = $tangentWrap.querySelectorAll('.penTangent-item');
            let tangentLength = $$allTangent.length;
            // 3：插入新切线
            let $theTangent = Z(Const.newTangentString);
            Z($tangentWrap).append($theTangent);
            $theTangent.attr('data-index', tangentLength);
            $theTangent.addClass('active');
            // 4：切线锚点位置
            let thePoint = pointList[2].split(',');
            let thePointX = parseFloat(thePoint[0]);
            let thePointY = parseFloat(thePoint[1]);
            let thePX = (thePointX * showRatio + mLeft) / coverWidth * 100 + '%';
            let thePY = (thePointY * showRatio + mTop) / coverHeight * 100 + '%';
            $theTangent.css({
                'left': thePX,
                'top': thePY,
            });
            // 5：当前切线的 prev ：长度、旋转
            let $thePrev = $theTangent.find('.penTangent-item-prev');
            let prevPoint = pointList[1].split(',');
            let prevPointX = parseFloat(prevPoint[0]);
            let prevPointY = parseFloat(prevPoint[1]);
            let pointMX = thePointX - prevPointX;
            let pointMY = thePointY - prevPointY;
            let prevAngle = Math.atan(pointMY / pointMX) * 180 / Math.PI;
            if (pointMX < 0)
                prevAngle += 180;
            let prevWidth = Math.sqrt(pointMX * pointMX + pointMY * pointMY) * showRatio;
            $thePrev.css({
                'transform': 'translate(calc(-100% + 5.5px), 0) rotate(' + prevAngle + 'deg)',
                'width' : prevWidth + 'px'
            });

            // 6：当前切线的 next：长度、旋转
            let $theNext = $theTangent.find('.penTangent-item-next');
            let nextIndex = (i === dBezier.length - 1) ? 0 : (i + 1);
            let nextPointList = dBezier[nextIndex].substring(1).split(' ');
            let nextPoint = nextPointList[0].split(',');
            let nextPointX = parseFloat(nextPoint[0]);
            let nextPointY = parseFloat(nextPoint[1]);
            pointMX = nextPointX - thePointX;
            pointMY = nextPointY - thePointY;
            let nextAngle = Math.atan(pointMY / pointMX) * 180 / Math.PI;
            if (pointMX < 0)
                nextAngle += 180;
            let nextWidth = Math.sqrt(pointMX * pointMX + pointMY * pointMY) * showRatio;
            $theNext.css({
                'transform': 'translate(5.5px, 0) rotate(' + nextAngle + 'deg)',
                'width' : nextWidth + 'px'
            });

            // 7：检测“分离”属性
            let minMWidth = .5;
            let minMAngle = .5;
            let adsMWidth = Math.abs(nextWidth - prevWidth);
            let adsMAngle = Math.abs(nextAngle - prevAngle);
            let isSeparate = false;
            if (adsMWidth > minMWidth && adsMAngle > minMAngle)
                isSeparate = true;
            if (isSeparate)
                $theTangent.attr('data-separate', 'separate');
        }

        // 2：设置素材的 偏移、大小
        $curElem.removeAttribute('transform');
        $svg.removeAttribute('data-oldwidth');
        $svg.removeAttribute('data-oldheight');
        $svg.setAttribute('viewBox', '0 0 ' + canvasWidth + ' ' + canvasHeight);
        $svg.setAttribute('width', canvasWidth + '');
        $svg.setAttribute('height', canvasHeight + '');
        $curElem.removeChild($rect);

        // 3：定义临时数据，用于编辑
        this.elemEditToolData = {};
        this.elemEditToolData.pathStart = pathStart;
        this.elemEditToolData.pathBezier = dBezier;
        this.elemEditToolData.pathEnd = pathEnd;
        this.elemEditToolData.material = material;
        this.elemEditToolData.$curElem = $curElem;
        this.elemEditToolData.$path = $curElem.querySelector('path');
        this.initPenEditHistory();
        this.savePenEditHistory();

        // 4：绑定事件
        Z($penCover).on('mousedown', this.penEditToolDone, this);
        Z($tangentWrap).find('.penTangent-item-this .penTangent-item-btn').on('mousedown', this.tangentMoveStart, this);
        Z($tangentWrap).find('.penTangent-item-prev .penTangent-item-btn,.penTangent-item-next .penTangent-item-btn').on('mousedown', this.bezierEditStart, this);
    }
    // 12.2：切线拖动、绘制事件
    tangentMoveStart(event) {
        // 1：保存当前数据
        Z.E.forbidden(event);
        let $targ = Z.E.target(event);
        let $item =  $targ.parentNode.parentNode;
        let bezierIndex = parseFloat($item.getAttribute('data-index'));
        let nextIndex = (bezierIndex === this.elemEditToolData.pathBezier.length - 1) ? 0 : (bezierIndex + 1);
        let toolRect = Z.D.id('penTangentTool').getBoundingClientRect();

        this.startData.mouseLoc = Const.getMouseLocation(event);
        this.startData.theIndex = bezierIndex;
        this.startData.nextIndex = nextIndex;
        this.startData.theItem = $item;
        this.startData.targData = {
            'x' : $item.offsetLeft,
            'y' : $item.offsetTop,
            'toolWidth' : toolRect.width,
            'toolHeight' : toolRect.height,
        };

        // 2：判断是否是 alt 按键下的，切线绘制
        let tangentTransform = event.altKey && !event.ctrlKey && !event.shiftKey;
        if (tangentTransform) {
            // 切线长度设置为 0
            Z($item).find('.penTangent-item-prev').css('width', '0');
            Z($item).find('.penTangent-item-next').css('width', '0');
            // 曲线，去除弯曲度
            let theBezier = this.elemEditToolData.pathBezier[bezierIndex];
            let thePointArr = theBezier.split(' ');
            let nextBezier = this.elemEditToolData.pathBezier[nextIndex];
            let nextPointArr = nextBezier.split(' ');
            theBezier = thePointArr[0] + ' ' + thePointArr[2] + ' ' + thePointArr[2];
            nextBezier = 'C' + thePointArr[2] + ' ' + nextPointArr[1] + ' ' + nextPointArr[2];
            this.elemEditToolData.pathBezier[bezierIndex] = theBezier;
            this.elemEditToolData.pathBezier[nextIndex] = nextBezier;
            let setD = this.elemEditToolData.pathStart +
                this.elemEditToolData.pathBezier.join(' ') + this.elemEditToolData.pathEnd;
            this.elemEditToolData.$path.setAttribute('d', setD);
        }

        // 3：事件绑定
        if (tangentTransform) {
            let itemRect = $item.getBoundingClientRect();
            this.startData.targData.cx = itemRect.left + itemRect.width / 2;
            this.startData.targData.cy = itemRect.top + itemRect.height / 2;
            Z(this.$tool.$designStage).on("mousemove",this.tangentTransformDoing,this);
            Z(this.$tool.$designStage).on("mouseup mouseleave",this.tangentTransformDone,this);
        } else {
            Z(this.$tool.$designStage).on("mousemove",this.tangentMoveDoing,this);
            Z(this.$tool.$designStage).on("mouseup mouseleave",this.tangentMoveDone,this);
        }
    }
    // 12.2.1：切线绘制
    tangentTransformDoing(event) {
        Z.E.cancel(event);
        // 1：计算鼠标偏移量
        Z.E.stop(event);
        let nowMouseLoc = Const.getMouseLocation(event);
        let mx = nowMouseLoc.x - this.startData.targData.cx;
        let my = nowMouseLoc.y - this.startData.targData.cy;

        // 2：设置切线的长度和旋转
        let setWidth = Math.sqrt(mx * mx + my * my);
        let setAngle = Math.atan(my / mx) * 180 / Math.PI;
        if (mx < 0)
            setAngle += 180;
        let $item = this.startData.theItem;
        let $itemPrev = Z($item).find('.penTangent-item-prev');
        let $itemNext = Z($item).find('.penTangent-item-next');
        $itemPrev.css('width', setWidth).css('transform', 'translate(calc(-100% + 5.5px), 0px) rotate(' + setAngle + 'deg)');
        $itemNext.css('width', setWidth).css('transform', 'translate(5.5px, 0px) rotate(' + setAngle + 'deg)');

        // 3：计算曲线路径
        let showRatio = this.$tool.showRatio;
        let canvasRect = this.$tool.$stageCanvas.getBoundingClientRect();
        let theBezier = this.elemEditToolData.pathBezier[this.startData.theIndex];
        let thePointArr = theBezier.split(' ');
        let nextBezier = this.elemEditToolData.pathBezier[this.startData.nextIndex];
        let nextPointArr = nextBezier.split(' ');
        // 当前曲线切线锚点
        let thePointX = this.startData.targData.cx - canvasRect.left - mx;
        let thePointY = this.startData.targData.cy - canvasRect.top - my;
        thePointX /= showRatio;
        thePointY /= showRatio;
        let theTangentPoint = thePointX + ',' + thePointY;
        // 下一曲线切线锚点
        let nextPointX = nowMouseLoc.x - canvasRect.left;
        let nextPointY = nowMouseLoc.y - canvasRect.top;
        nextPointX /= showRatio;
        nextPointY /= showRatio;
        let nextTangentPoint = nextPointX + ',' + nextPointY;
        // 曲线路径
        theBezier = thePointArr[0] + ' ' + theTangentPoint + ' ' + thePointArr[2];
        nextBezier = 'C' + nextTangentPoint + ' ' + nextPointArr[1] + ' ' + nextPointArr[2];
        this.elemEditToolData.pathBezier[this.startData.theIndex] = theBezier;
        this.elemEditToolData.pathBezier[this.startData.nextIndex] = nextBezier;
        let setD = this.elemEditToolData.pathStart +
            this.elemEditToolData.pathBezier.join(' ') + this.elemEditToolData.pathEnd;
        this.elemEditToolData.$path.setAttribute('d', setD);
    }
    tangentTransformDone() {
        // 去除“分离”属性
        this.startData.theItem.removeAttribute('data-separate');

        // 去除数据
        this.startData = {};

        // 保存历史记录
        this.savePenEditHistory();

        // 解除事件绑定
        Z(this.$tool.$designStage).off("mousemove",this.tangentTransformDoing,this);
        Z(this.$tool.$designStage).off("mouseup mouseleave",this.tangentTransformDone,this);
    }
    // 12.2.2：切线拖动
    tangentMoveDoing(event) {
        // 坐标点更新（xxx,xxx）
        let updatePointData = (pointData)=> {
            pointData = pointData.split(',');
            let pointX = parseFloat(pointData[0]);
            let pointY = parseFloat(pointData[1]);
            pointX += mx / showRatio;
            pointY += my / showRatio;
            return pointX + ',' + pointY;
        }

        // 1：计算鼠标偏移量
        Z.E.forbidden(event);
        let showRatio = this.$tool.showRatio;
        let nowMouseLoc = Const.getMouseLocation(event);
        let mx = nowMouseLoc.x - this.startData.mouseLoc.x;
        let my = nowMouseLoc.y - this.startData.mouseLoc.y;

        // 2：计算偏移后的曲线路径
        let bezierIndex = this.startData.theIndex;
        let pathStart = this.elemEditToolData.pathStart;
        let allBezier = Z.clone(this.elemEditToolData.pathBezier);
        let pathEnd = this.elemEditToolData.pathEnd;
        // 当前曲线的，终点切线、终点坐标更新
        let thisBesier = allBezier[bezierIndex];
        let thisPointData = thisBesier.substring(1);
        thisPointData = thisPointData.split(' ');
        thisPointData[1] = updatePointData(thisPointData[1]);
        thisPointData[2] = updatePointData(thisPointData[2]);
        thisBesier = 'C' + thisPointData.join(' ');
        allBezier[bezierIndex] = thisBesier;
        // 下一条曲线的，起点切线更新
        let nextBesier = allBezier[bezierIndex + 1] || allBezier[0];
        let nextPointData = nextBesier.substring(1);
        nextPointData = nextPointData.split(' ');
        nextPointData[0] = updatePointData(nextPointData[0]);
        nextPointData = nextPointData.join(' ');
        nextBesier = 'C' + nextPointData;
        if (bezierIndex === allBezier.length - 1) {
            allBezier[0] = nextBesier;
            let startPoint = pathStart.substring(1);
            startPoint = updatePointData(startPoint);
            pathStart = 'M' + startPoint + ' ';
        } else {
            allBezier[bezierIndex + 1] = nextBesier;
        }
        // 赋值路径
        this.elemEditToolData.$path.setAttribute('d', pathStart + allBezier.join(' ') + pathEnd);

        // 3：计算编辑工具的偏移
        let toolX = this.startData.targData.x + mx;
        let toolY = this.startData.targData.y + my;
        toolX = toolX / this.startData.targData.toolWidth * 100 + '%';
        toolY = toolY / this.startData.targData.toolHeight * 100 + '%';
        Z(this.startData.theItem).css({
            'left' : toolX,
            'top' : toolY,
        })
    }
    tangentMoveDone(event) {
        Z.E.forbidden(event);

        let $path = this.elemEditToolData.$curElem.querySelector('path');
        let setD = $path.getAttribute('d');
        let pathStart = /^M[^C]+\s/.exec(setD);
        let dBezier = setD.match(/C[^C\s]+\s[^C\s]+\s[^C\s]+/g);
        let pathEnd = /\sZ$/.exec(setD);
        pathStart = (pathStart && pathStart[0]) || '';
        pathEnd = (pathEnd && pathEnd[0]) || '';

        this.elemEditToolData.pathStart = pathStart;
        this.elemEditToolData.pathBezier = dBezier;
        this.elemEditToolData.pathEnd = pathEnd;
        // 保存历史记录
        this.savePenEditHistory();

        // 解除事件绑定
        Z(this.$tool.$designStage).off("mousemove",this.tangentMoveDoing,this);
        Z(this.$tool.$designStage).off("mouseup mouseleave",this.tangentMoveDone,this);
    }
    // 12.3：曲线曲度拖动事件
    bezierEditStart(event) {
        Z.E.forbidden(event);
        let $target = Z.E.target(event);
        let $btnParent = $target.parentNode;
        let $item = $btnParent.parentNode;
        let bezierIndex = parseFloat($item.getAttribute('data-index'));
        let nextIndex = (bezierIndex === this.elemEditToolData.pathBezier.length - 1) ? 0 : (bezierIndex + 1);
        let itemRect = $item.getBoundingClientRect();
        let canvasRect = this.$tool.$stageCanvas.getBoundingClientRect();
        let isSeparate = (event.altKey && !event.ctrlKey && !event.shiftKey) ||
            Boolean($item.getAttribute('data-separate'));

        // 数据保存
        this.startData.mouseLoc = Const.getMouseLocation(event);
        this.startData.theIndex = bezierIndex;
        this.startData.nextIndex = nextIndex;
        this.startData.theItem = $item;
        this.startData.theBtn = $target;
        this.startData.btnParent = $btnParent;
        this.startData.isPrevItem = Z($btnParent).hasClass('penTangent-item-prev');
        this.startData.isSeparate = isSeparate;
        let itemLeft = itemRect.left + itemRect.width / 2;
        let itemTop = itemRect.top + itemRect.height / 2;
        this.startData.targData = {
            'itemLeft' : itemLeft,
            'itemTop' : itemTop,
            'canvasLeft' : canvasRect.left,
            'canvasTop' : canvasRect.top,
            'itemX' : itemLeft - canvasRect.left,
            'itemY' : itemTop - canvasRect.top,
        };

        // 事件绑定
        Z(this.$tool.$designStage).on("mousemove",this.bezierEditDoing,this);
        Z(this.$tool.$designStage).on("mouseup mouseleave",this.bezierEditDone,this);
    }
    bezierEditDoing(event) {
        // 1：主方法，定义变量
        Z.E.forbidden(event);
        let showRatio = this.$tool.showRatio;
        let $btn = this.startData.theBtn;
        let btnRect = $btn.getBoundingClientRect();
        let $btnParent = this.startData.btnParent;
        let nowMouseLoc = Const.getMouseLocation(event);
        let mx = nowMouseLoc.x - this.startData.targData.itemLeft;
        let my = nowMouseLoc.y - this.startData.targData.itemTop;
        let setWidth = Math.sqrt(mx * mx + my * my);
        let setAngle = Math.atan(my / mx) * 180 / Math.PI;

        // 2：分情况处理
        if (this.startData.isSeparate) {
            // 1：切线偏移
            let setTrans = '';
            if (this.startData.isPrevItem){
                if (mx > 0)
                    setAngle += 180;
                setTrans = 'translate(calc(-100% + 5.5px), 0px) rotate(' + setAngle + 'deg)'
            } else {
                if (mx < 0)
                    setAngle += 180;
                setTrans = 'translate(5.5px, 0px) rotate(' + setAngle + 'deg)'
            }
            Z($btnParent).css({
                'width' : setWidth,
                'transform' : setTrans,
            });

            // 2：曲线设置
            let setX = btnRect.left + btnRect.width / 2 - this.startData.targData.canvasLeft;
            let setY = btnRect.top + btnRect.height / 2 - this.startData.targData.canvasTop;
            setX /= showRatio;
            setY /= showRatio;
            let setPoint = setX + ',' + setY;
            // 分情况计算
            let dBezier = this.elemEditToolData.pathBezier;
            let theIndex, theBezier;
            if (this.startData.isPrevItem) {
                theIndex = this.startData.theIndex;
                let theBezierArr = dBezier[theIndex].split(' ');
                theBezier = theBezierArr[0] + ' ' + setPoint + ' ' + theBezierArr[2];
            } else {
                theIndex = this.startData.nextIndex;
                let theBezierArr = dBezier[theIndex].split(' ');
                theBezier = 'C' + setPoint + ' ' + theBezierArr[1] + ' ' + theBezierArr[2];
            }
            dBezier[theIndex] = theBezier;

            // 3：添加“分离”属性
            this.startData.theItem.setAttribute('data-separate', 'separate');
        } else {
            // 1：切线偏移
            if (this.startData.isPrevItem){
                if (mx > 0) setAngle += 180;
            } else {
                if (mx < 0) setAngle += 180;
            }
            Z(this.startData.theItem).find('.penTangent-item-prev').css({
                'width' : setWidth,
                'transform' : 'translate(calc(-100% + 5.5px), 0px) rotate(' + setAngle + 'deg)',
            });
            Z(this.startData.theItem).find('.penTangent-item-next').css({
                'width' : setWidth,
                'transform' : 'translate(5.5px, 0px) rotate(' + setAngle + 'deg)',
            });

            // 2：曲线设置
            // 按钮坐标
            let setX = btnRect.left + btnRect.width / 2 - this.startData.targData.canvasLeft;
            let setY = btnRect.top + btnRect.height / 2 - this.startData.targData.canvasTop;
            let thatPointX = 2 * this.startData.targData.itemX - setX;
            let thatPointY = 2 * this.startData.targData.itemY - setY;
            let thePoint = (setX / showRatio) + ',' + (setY / showRatio);
            let thatPoint = (thatPointX / showRatio) + ',' + (thatPointY / showRatio);
            // 对应曲线
            let dBezier = this.elemEditToolData.pathBezier;
            let thatIndex, thatBezier, theIndex, theBezier;
            if (this.startData.isPrevItem) {
                thatIndex = this.startData.nextIndex;
                let thatBezierArr = dBezier[thatIndex].split(' ');
                thatBezier = 'C' + thatPoint + ' ' + thatBezierArr[1] + ' ' + thatBezierArr[2];
                theIndex = this.startData.theIndex;
                let theBezierArr = dBezier[theIndex].split(' ');
                theBezier = theBezierArr[0] + ' ' + thePoint + ' ' + theBezierArr[2];
            } else {
                thatIndex = this.startData.theIndex;
                let thatBezierArr = dBezier[thatIndex].split(' ');
                thatBezier = thatBezierArr[0] + ' ' + thatPoint + ' ' + thatBezierArr[2];
                theIndex = this.startData.nextIndex;
                let theBezierArr = dBezier[theIndex].split(' ');
                theBezier = 'C' + thePoint + ' ' + theBezierArr[1] + ' ' + theBezierArr[2];
            }
            dBezier[thatIndex] = thatBezier;
            dBezier[theIndex] = theBezier;
        }
        let setD = this.elemEditToolData.pathStart + this.elemEditToolData.pathBezier.join(' ') + this.elemEditToolData.pathEnd;
        this.elemEditToolData.$path.setAttribute('d', setD);
    }
    bezierEditDone() {
        // 保存历史记录
        this.savePenEditHistory();

        // 解除事件绑定
        Z(this.$tool.$designStage).off("mousemove",this.bezierEditDoing,this);
        Z(this.$tool.$designStage).off("mouseup mouseleave",this.bezierEditDone,this);
    }
    // 12.4：钢笔编辑结束
    penEditToolDone() {
        let $penCover = Z.D.id('penEditorCover');
        let $tangentWrap = Z.D.id('penTangentTool');
        if (!Z($penCover).hasClass('readyEdit'))
            return;

        Z($penCover).removeClass('readyDrawing').removeClass('readyEdit');
        Z($tangentWrap).removeClass('editPath').html('');

        // 转变素材对象
        this.tempToPenMaterial(true);

        // 执行保存
        SelectionTool.selectTheElement(this.elemEditToolData.material, this.elemEditToolData.$curElem);
        ElementUpdate.updateMaterialSource(this.elemEditToolData.material, this.elemEditToolData.$curElem);
        PrototypeHistory.saveHistory();

        // 清空临时数据
        this.clearPenEditHistory();
        this.startData = {};
        this.elemEditToolData = {};

        // 清空历史记录
        this.clearPenEditHistory();

        // 解除事件绑定
        Z($penCover).off('mousedown', this.penEditToolDone, this);
    }
    // 12.5：钢笔路径，临时素材更新为标准素材
    tempToPenMaterial(notNew) {
        // 主方法，定义变量
        let $curElem = this.elemEditToolData.$curElem || Z.D.id("tempShape");
        if (!$curElem)
            return;
        let material = this.elemEditToolData.material;
        let $g = $curElem.querySelector("g");
        let $svg = $g.querySelector("svg");
        let elemBox = $curElem.getBBox();
        let transX = elemBox.x;
        let transY = elemBox.y;
        let setWidth = elemBox.width;
        let setHeight = elemBox.height;

        // 1：设置 path 路径
        let $path = $svg.querySelector("path");
        let setD = $path.getAttribute('d');
        let pathStart = /^M[^C]+\s/.exec(setD);
        let dBezier = setD.match(/C[^C\s]+\s[^C\s]+\s[^C\s]+/g);
        let pathEnd = /\sZ$/.exec(setD);
        pathStart = pathStart && pathStart[0];
        pathEnd = pathEnd && pathEnd[0] || '';
        if (!pathStart || !dBezier)
            return;

        pathStart = pathStart.substring(1);
        let startPoint = pathStart.split(',');
        let startPointX = parseFloat(startPoint[0]) - transX;
        let startPointY = parseFloat(startPoint[1]) - transY;
        pathStart = 'M' + startPointX + ',' + startPointY + ' ';
        // 曲线换算
        dBezier = dBezier.map((bezier)=> {
            bezier = bezier.substring(1);
            let points = bezier.split(' ');
            points = points.map((pointData)=> {
                let pointLoc = pointData.split(',');
                let pLocX = parseFloat(pointLoc[0]) - transX;
                let pLocY = parseFloat(pointLoc[1]) - transY;
                return pLocX + ',' + pLocY;
            });
            return 'C' + points.join(' ');
        });
        setD = pathStart + dBezier.join(' ') + pathEnd;
        $path.setAttribute('d', setD);

        // 2：设置 svg 偏移、大小
        let dataType;
        let tempTrans = 'translate(' + transX + ' ' + transY + ') rotate(0 ' + setWidth/2 + ' ' + setHeight/2 + ')';
        $curElem.setAttribute("transform",tempTrans);
        if (this.shapeType === "11") {
            dataType = "shape-pen";
        }
        $svg.setAttribute("data-targetType", dataType);
        $svg.setAttribute('width', setWidth + '');
        $svg.setAttribute('height', setHeight + '');
        $svg.setAttribute('viewBox', '0 0 ' + setWidth + ' ' + setHeight);

        // 3：定义新素材
        // 定义 rect
        let $rect = document.createElementNS(Const.xmlns, "rect");
        $rect.setAttribute("fill", "rgba(0,0,0,0)");
        $rect.setAttribute("width", setWidth + '');
        $rect.setAttribute("height", setHeight + '');

        // 老素材插入 rect
        if (notNew) {
            $curElem.insertBefore($rect, $g);
        } else {
            // 获取 source
            $curElem.removeAttribute("id");
            let svgCode = $curElem.outerHTML;
            let tempMaterial = {
                "type": 5,
                "source": svgCode,
                "color": "#000000",
            };
            material = MaterialTool.newMediaMaterial(tempMaterial);
            this.$tool.addMaterial(material);
            $curElem.setAttribute("id","svgElementSon_" + material.mid);
            $curElem.setAttribute("data-mid",material.mid);
            $curElem.setAttribute("data-pos",material.mid);
            // 新素材插入 rect
            $curElem.insertBefore($rect, $g);
            // 事件绑定
            this.$tool.addEleEvents($curElem);
        }

        // 4: 定义临时对象
        this.elemEditToolData.material = material;
        this.elemEditToolData.$curElem = $curElem;
    }

    /********************************************
     *************** 十三：表格工具 *************
     ********************************************/
    // 13.1：显示表格工具
    showTableToolByDbl() {
        // 1：显示表格工具
        this.showTableEditTool(true);

        // 2：显示/隐藏表格额外的编辑工具
        //

        // 3：隐藏选中框
        SelectionTool.selectionAll_hide();

        // 4：隐藏部分编辑按钮！
        Z("#tool_svgColor_tableStroke,#tool_svgColor_tableBorder,#tool_svgSize").hide();
    }
    showTableEditTool(doFocus) {
        // 1：主方法，定义变量
        let $curElem = this.$tool.getCurSvgElement();
        let material = this.$tool.getCurMaterial();

        let $$elemTrans = $curElem.transform.baseVal;
        let $elemTranslate = $$elemTrans[0].matrix;
        let $svg = $curElem.querySelector("svg");
        let $firstLine = $svg.querySelector("line");
        let $tableCover = Z.D.id('tableEditorCover');
        let $tableStage = Z.D.id('tableEditorStage');
        let $tableEditor = Z.D.id('tableEditor');
        this.elemEditToolData = {};
        this.elemEditToolData.tempElement = $curElem;
        this.elemEditToolData.tempMaterial = material;

        // 2：计算显示比例
        let showRatio = this.$tool.showRatio;
        let elemWidth = $svg.width.baseVal.value;
        let elemHeight = $svg.height.baseVal.value;
        let viewWidth = $svg.viewBox.baseVal.width;
        let viewHeight = $svg.viewBox.baseVal.height;
        showRatio *= (elemWidth/viewWidth + elemHeight/viewHeight)/2;
        let strokeWidth = showRatio * $firstLine.getAttribute("stroke-width");

        // 3：生成表格HTML
        let strokeFill = Exchange.rgb2hex($firstLine.getAttribute("stroke"));
        let $$gTr = $svg.children;
        let $table = document.createElement("table");
        let tdResizeToolHtml = '<div class="tableText-resizeTool">';
        tdResizeToolHtml += '<div class="tableResizeTool-item" data-targetType="row" data-style="top"></div>';
        tdResizeToolHtml += '<div class="tableResizeTool-item" data-targetType="col" data-style="left"></div>';
        tdResizeToolHtml += '</div>';
        let resizeToolSize = strokeWidth + 4 + "px";
        let resizeToolDeviation = - (strokeWidth + 2) + "px";

        // 遍历单元行
        for (let i = 0;i < $$gTr.length;i++) {
            let lastRow = i === $$gTr.length - 1;
            let $gTr = $$gTr[i];
            let $$gTd = $gTr.children;
            let $tr = document.createElement("tr");

            // 遍历单元格
            for (let j = 0;j < $$gTd.length;j++) {
                let lastCol = j === $$gTd.length - 1;
                let $gTd = $$gTd[j];
                let $rectTd = $gTd.querySelector("rect");
                let $td = document.createElement("td");

                $td.style.borderColor = strokeFill;
                $td.style.borderTopWidth = strokeWidth + "px";
                $td.style.borderLeftWidth = strokeWidth + "px";
                // td 行列属性
                let tdRow = $gTd.getAttribute("data-row");
                let tdCol = $gTd.getAttribute("data-col");
                $td.rowSpan = $gTd.getAttribute("data-rowspan") || 1;
                $td.colSpan = $gTd.getAttribute("data-colspan") || 1;
                $td.setAttribute("data-row", tdRow);
                $td.setAttribute("data-col", tdCol);
                // 背景色设置
                let tdBg = $rectTd.getAttribute("fill").toLowerCase();
                if (tdBg === "none")
                    $td.setAttribute("class", "bgNone");
                else
                    $td.style.backgroundColor = tdBg;

                // div 内容样式，data属性获取
                let textStr = $gTd.getAttribute("data-text");
                let setFFamily = $gTd.getAttribute("data-fontfamily");
                let setFSize = parseFloat($gTd.getAttribute("data-fontsize")) * showRatio;
                setFSize = Exchange.pt2px(setFSize) + "px";
                let setFWeight = parseFloat($gTd.getAttribute("data-fontweight"))?"bold":"normal";
                let setLSpacing = parseFloat($gTd.getAttribute("data-letterspacing") || 0) * showRatio;
                setLSpacing = setLSpacing === 0 ? setLSpacing : setLSpacing + "px";
                let setTAlign = $gTd.getAttribute("data-textalign");
                let setLHeight = parseFloat($gTd.getAttribute("data-lineheight") || 0) * showRatio;
                setLHeight = setLHeight === 0 ? "normal" : setLHeight;
                let minHeight = setLHeight + Const.tableTextAreaPdTop + Const.tableTextAreaPdBottom;
                // div 内容样式，节点属性获取
                let setItalic = $gTd.querySelector("g").querySelector("g").hasAttribute("transform")?"italic":"normal";
                let setULine = $gTd.querySelector("svg>g>line")?"underline":"none";
                let setColor = $gTd.querySelector("svg path")?
                    $gTd.querySelector("svg path").getAttribute("fill"):"#000000";

                let $div = document.createElement("div");
                $div.innerHTML = textStr.split("\n").join("<br>");
                $div.setAttribute("class", "tableText-showArea");

                // td 宽高、边框
                let rectWidth = $rectTd.width.baseVal.value * showRatio - strokeWidth - strokeWidth/2;
                let rectHeight = $rectTd.height.baseVal.value * showRatio - strokeWidth - strokeWidth/2;
                $div.style.width = rectWidth + "px";
                $div.style.height = rectHeight + "px";
                // 编辑框样式
                $div.style.minHeight = minHeight + "px";
                $div.style.padding = Const.tableTextAreaPdTop + "px " + Const.tableTextAreaPdRight
                    + "px " + Const.tableTextAreaPdBottom + "px " + Const.tableTextAreaPdLeft + "px";
                $div.style.fontFamily = setFFamily;
                $div.style.fontSize = setFSize;
                $div.style.fontWeight = setFWeight;
                $div.style.color = setColor;
                $div.style.fontStyle = setItalic;
                $div.style.textDecoration = setULine;
                $div.style.lineHeight = setLHeight + "px";
                $div.style.letterSpacing = setLSpacing;
                $div.style.textAlign = setTAlign;

                // 克隆div辅助显示
                let $divClone = $div.cloneNode(true);
                $divClone.setAttribute("contenteditable", "true");
                $divClone.setAttribute("spellcheck", "false");
                $divClone.setAttribute("class", "tableText-editArea");
                $divClone.style.Height = rectHeight + "px";

                // 边框缩放div辅助框
                let $resizeTool = Z(tdResizeToolHtml)[0];
                let $topTool = $resizeTool.querySelector('[data-targetType=row]');
                let $leftTool = $resizeTool.querySelector('[data-targetType=col]');
                $topTool.style.top = resizeToolDeviation;
                $topTool.style.height = resizeToolSize;
                $leftTool.style.left = resizeToolDeviation;
                $leftTool.style.width = resizeToolSize;
                if (lastRow) {
                    $resizeTool.insertAdjacentHTML('beforeend',
                        '<div class="tableResizeTool-item" data-targetType="row" data-style="bottom" '
                        + 'style="bottom: '+resizeToolDeviation+';height: '+resizeToolSize+';"></div>');
                }
                if (lastCol) {
                    $resizeTool.insertAdjacentHTML('beforeend',
                        '<div class="tableResizeTool-item" data-targetType="col" data-style="right" '
                        + 'style="right: '+resizeToolDeviation+';width: '+resizeToolSize+';"></div>');
                }

                // 插入编辑区
                $td.appendChild($div);
                $td.appendChild($divClone);
                $td.appendChild($resizeTool);
                $tr.appendChild($td);
                // 事件添加
                this.tableTextAreaEventAdd($td);
            }
            $table.appendChild($tr);
        }

        // 定义 table 属性、内容
        let svgViewBox = $svg.viewBox.baseVal;
        let setWidth = svgViewBox.width * showRatio;
        let setHeight = svgViewBox.height * showRatio;
        $table.setAttribute("data-width", setWidth);
        $table.setAttribute("data-height", setHeight);
        $table.style.borderColor =  strokeFill;
        $table.style.borderRightWidth = strokeWidth + "px";
        $table.style.borderBottomWidth = strokeWidth + "px";
        let $oldTable = $tableEditor.querySelector("table");
        $tableEditor.insertBefore($table, $oldTable);
        $tableEditor.removeChild($oldTable);

        // 4：显示表格编辑工具
        // 1：遮罩层显示，位置设置
        Z($tableCover).addClass('tableEditing');
        let stageRect = this.$tool.$designStage.getBoundingClientRect();
        let canvasRect = this.$tool.$canvasBg.getBoundingClientRect();
        Z($tableStage).css({
            left: canvasRect.left - stageRect.left,
            top: canvasRect.top - stageRect.top,
            width: canvasRect.width,
            height: canvasRect.height,
            backgroundColor: "rgba(0,0,0,.1)",
        });
        Z($tableEditor).css({
            left: $elemTranslate.e * this.$tool.showRatio,
            top: $elemTranslate.f * this.$tool.showRatio,
            transform: "rotate(" + $$elemTrans[1].angle + "deg)",
        });
        // 2：取得第一个div焦点
        if (doFocus) {
            let $firstTextArea = $tableEditor.querySelector("div.tableText-editArea");
            $firstTextArea.focus();
        }
        // 3：定义操作类型
        this.shapeType = '21';

        // 5：隐藏素材
        MaterialTool.hideHiddenElement($curElem);
    }
    // 13.2：隐藏表格工具
    hideTableEditTool() {
        let $tableCover = Z.D.id("tableEditorCover");
        let $tableStage = Z.D.id("tableEditorStage");
        let $tableEditor = Z.D.id("tableEditor");
        let $tableTool = $tableEditor.querySelector("table");
        $tableCover.removeAttribute("class");
        $tableStage.removeAttribute("style");
        $tableEditor.removeAttribute("style");
        $tableTool.removeAttribute("style");
    }
    // 13.3：显示表格素材
    showTableSvgElement() {
        let $curElem = this.$tool.getCurSvgElement();
        if (!$curElem)
            return;
        let className = $curElem.getAttribute("class") || "";
        if (className.indexOf("hiddenDoing") === -1)
            return;
        className = className.replace("hiddenDoing", "").replace(/\s\s/g, " ").trim();
        $curElem.setAttribute("class", className);
    }
    // 13.4：生成表格素材
    resetTableSvgElement() {
        // 0：判断可行性
        let tableEditing = Z.D.id("tableEditorCover").className.indexOf("tableEditing") > -1;
        let $tableEditor = Z("#tableEditor");
        if (!tableEditing || !$tableEditor.attr("style"))
            return;

        // 1：定义变量
        let $curElem = this.elemEditToolData.tempElement;
        let $table = $tableEditor.find("table");
        let showRatio = this.$tool.showRatio;
        let borderColor = Exchange.rgb2hex($table.css("borderRightColor"));
        let tableBorderWidth = parseFloat($table.css("borderRightWidth"));
        let borderWidth = tableBorderWidth / showRatio;

        // 2：创建 svg 素材
        let $svg = document.createElementNS(Const.xmlns, "svg");
        $svg.setAttribute("preserveAspectRatio", "none");
        $svg.setAttribute("data-targetType", "shape-table");

        // 3：创建临时对象，用于校准位置
        let $bodySvg = document.createElementNS(Const.xmlns, 'svg');
        $bodySvg.setAttribute('viewBox', '0 0 ' + this.fullWidth + ' ' + this.fullHeight);
        $bodySvg.setAttribute('width', this.fullWidth);
        $bodySvg.setAttribute('height', this.fullHeight);
        $bodySvg.setAttribute('style', 'position:absolute;z-index:-9999;pointer-events:none;opacity:0;');
        let $svgClone = $svg.cloneNode(true);
        $bodySvg.appendChild($svgClone);
        document.documentElement.appendChild($bodySvg);

        // 4：遍历单元格
        let $$tr = $table.find("tr");
        // 取得行列最大值
        let $tdLast = $$tr[$$tr.length - 1].querySelector("td:last-child");
        let rowMax = parseFloat($tdLast.getAttribute("data-row")) + $tdLast.rowSpan;
        let colTrLastTd = [];
        for(let i = 0;i < $$tr.length;i++) {
            $tdLast = $$tr[i].querySelector("td:last-child");
            colTrLastTd.push(parseFloat($tdLast.getAttribute("data-col")) + $tdLast.colSpan);
        }
        let colMax = Const.getMaxNum(colTrLastTd);
        for(let i = 0;i < $$tr.length;i++) {
            let $gTr = document.createElementNS(Const.xmlns, "g");
            let $tr = $$tr[i];
            let transX = 0;
            let transY = $tr.offsetTop / showRatio;
            let trans = "translate(" + transX + " " + transY + ")";
            $gTr.setAttribute("transform", trans);
            $gTr.setAttribute("data-y", transY);
            let $$td = $tr.querySelectorAll('td');
            // 4.1：遍历单元格
            for (let j = 0;j < $$td.length;j++) {
                let $td = $$td[j];
                let $div = $td.querySelector("div.tableText-editArea");
                let $gTd = document.createElementNS(Const.xmlns, "g");

                let firstRow = i === 0;
                let tdRow = parseFloat($td.getAttribute("data-row")) + $td.rowSpan;
                let tdCol = parseFloat($td.getAttribute("data-col")) + $td.colSpan;
                let lastRow = tdRow === rowMax;
                let lastCol = tdCol === colMax;

                // 5.1：单元格大小，填充色
                let tdWidth = parseFloat($td.offsetWidth) / showRatio + borderWidth / 2;
                let tdHeight = parseFloat($td.offsetHeight) / showRatio + borderWidth / 2;
                let fillColor = $td.className.includes("bgNone");
                fillColor = fillColor ? "none" : Z($td).css("backgroundColor") || "none";

                let $rectFill = document.createElementNS(Const.xmlns, "rect");
                $rectFill.setAttribute("width", tdWidth);
                $rectFill.setAttribute("height", tdHeight);
                $rectFill.setAttribute("fill", fillColor);
                $gTd.appendChild($rectFill);

                // 5.2：单元格偏移
                let transX = $td.offsetLeft / showRatio + borderWidth / 2;
                let trans = "translate(" + transX + " " + borderWidth / 2 + ")";
                $gTd.setAttribute("transform", trans);
                $gTd.setAttribute("data-x", transX);

                let mx = borderWidth / 2, my = borderWidth / 2;
                let $line, $line2, $line3, $line4;
                // 5.3.1：单元格边框：左
                if (borderWidth > 0) {
                    $line = document.createElementNS(Const.xmlns, "line");
                    $line.setAttribute("stroke", borderColor);
                    $line.setAttribute("stroke-width", borderWidth);
                    $line.setAttribute("stroke-linecap", "butt");
                    $line.setAttribute("x1", 0);
                    $line.setAttribute("y1", 0);
                    firstRow && $line.setAttribute("y1", - my);
                    $line.setAttribute("x2", 0);
                    $line.setAttribute("y2", tdHeight);
                    $line.setAttribute("data-targetType", "left");
                    $gTd.appendChild($line);
                }

                // 5.3.2：单元格边框：上
                if ($line) {
                    $line2 = $line.cloneNode(true);
                    $line2.setAttribute("x1", 0);
                    $line2.setAttribute("y1", 0);
                    $line2.setAttribute("x2", tdWidth);
                    $line2.setAttribute("y2", 0);
                    $line2.setAttribute("data-targetType", "top");
                    $gTd.appendChild($line2);
                }

                // 5.3.3：单元格边框：下
                if ($line && lastRow) {
                    $rectFill.setAttribute("height", tdHeight);
                    $line3 = $line.cloneNode(true);
                    $line3.setAttribute("x1", tdWidth);
                    $line3.setAttribute("y1", tdHeight - my);
                    $line3.setAttribute("x2", 0);
                    $line3.setAttribute("y2", tdHeight - my);
                    $line3.setAttribute("data-targetType", "bottom");
                    $gTd.appendChild($line3);
                }

                // 5.3.4：单元格边框：右
                if ($line2 && lastCol) {
                    $rectFill.setAttribute("width", tdWidth);
                    $line4 = $line2.cloneNode(true);
                    $line4.setAttribute("x1", tdWidth - mx);
                    $line4.setAttribute("y1", tdHeight);
                    $line4.setAttribute("x2", tdWidth - mx);
                    $line4.setAttribute("y2", 0);
                    $line4.setAttribute("data-targetType", "right");
                    $gTd.appendChild($line4);
                }

                // 5.4：单元格文字，文字属性
                let styleSheets = window.getComputedStyle($div,null);
                let fontFamily = styleSheets.fontFamily.split(",")[0].trim();
                let fontWeight = styleSheets.fontWeight === "400" ? 0 : 1;
                let fontItalic = styleSheets.fontStyle === "italic" ? 1 : 0;
                let textDecoration = styleSheets.textDecoration.indexOf("underline") > -1 ? 1 : 0;
                let fontSize = Exchange.px2pt(parseFloat(styleSheets.fontSize) / showRatio);
                let fontColor = Exchange.rgb2hex(styleSheets.color);
                let letterSpacing = (parseFloat(styleSheets.letterSpacing) || 0) / showRatio;
                let textAlign = styleSheets.textAlign;
                let lineHeight = (parseFloat(styleSheets.lineHeight) || 0)/showRatio;
                let textStr = $div.innerText;

                // 5.4.1：生成文字路径
                let $textPathSvg = Const.getPathSvgFromText(textStr,{
                    fontFamily: fontFamily,
                    fontSize: fontSize + "pt",
                    fontWeight: fontWeight,
                    textDecoration: textDecoration,
                    fontColor: fontColor,
                    lineHeight: lineHeight,
                    letterSpacing: letterSpacing,
                });
                let $gText = document.createElementNS(Const.xmlns, "g");
                $gText.appendChild($textPathSvg);
                if (fontItalic)
                    $gText.setAttribute("transform", "skewX(-18)");
                let $gTextWrap = document.createElementNS(Const.xmlns, "g");
                $gTextWrap.appendChild($gText);

                // 5.4.2：克隆素材计算偏移
                let $gTextClone = $gTextWrap.cloneNode(true);
                $svgClone.appendChild($gTextClone);
                let svgBox = $gTextClone.getBBox();
                let svgWidth = svgBox.width;
                let svgHeight = svgBox.height;
                if (svgWidth > tdWidth) {
                    svgWidth = tdWidth;
                    svgHeight = svgWidth * svgBox.height / svgBox.width;
                }
                if (svgHeight > tdHeight) {
                    svgHeight = tdHeight;
                    svgWidth = svgHeight * svgBox.width / svgBox.height;
                }
                $textPathSvg.setAttribute("width", svgWidth);
                $textPathSvg.setAttribute("height", svgHeight);
                let textTransX = (tdWidth - svgWidth) / 2;
                let textTransY = (tdHeight - svgHeight) / 2;
                if(textAlign === "left") {
                    textTransX = 0;
                } else if (textAlign === "right") {
                    textTransX = tdWidth - svgWidth;
                }
                let textTrans = "translate(" + textTransX + " " + textTransY + ")";
                $gTextWrap.setAttribute("transform", textTrans);

                // 5.5：单元格属性
                $gTd.appendChild($gTextWrap);
                $gTd.setAttribute("data-row", parseFloat($td.getAttribute("data-row") || 1));
                $gTd.setAttribute("data-col", parseFloat($td.getAttribute("data-col") || 1));
                $gTd.setAttribute("data-rowspan", $td.rowSpan);
                $gTd.setAttribute("data-colspan", $td.colSpan);
                $gTd.setAttribute("data-text", textStr);
                $gTd.setAttribute("data-fontfamily", fontFamily);
                $gTd.setAttribute("data-fontweight", fontWeight);
                $gTd.setAttribute("data-fontitalic", fontItalic);
                $gTd.setAttribute("data-textdecoration", textDecoration);
                $gTd.setAttribute("data-textalign", textAlign);
                $gTd.setAttribute("data-fontsize", fontSize);
                $gTd.setAttribute("data-textalign", textAlign);
                $gTd.setAttribute("data-lineheight", $textPathSvg.getAttribute("data-lineheight"));
                $gTd.setAttribute("data-mathheight", $textPathSvg.getAttribute("data-mathheight"));
                $gTd.setAttribute("data-letterspacing", letterSpacing);

                // 插入单元格
                $gTr.appendChild($gTd);
            }
            $svg.appendChild($gTr);
        }

        // 5：移除临时对象
        document.documentElement.removeChild($bodySvg);

        // 6：更新当前素材对象
        let $rect = $curElem.querySelector("rect");
        let $gWrap = $curElem.querySelector("g");
        let $$svg = $gWrap.children;
        while ($$svg.length > 0)
            $gWrap.removeChild($$svg[0]);
        $gWrap.appendChild($svg);

        // 7：校准大小
        let svgBox = $svg.getBBox();
        let setWidth = svgBox.width + svgBox.x;
        let setHeight = svgBox.height + svgBox.y;
        $svg.setAttribute("width", setWidth + "");
        $svg.setAttribute("height", setHeight + "");
        $svg.setAttribute("viewBox", "0 0 " + setWidth + " " + setHeight);
        // 校准偏移
        let setLeft = $tableEditor[0].offsetLeft / showRatio;
        let setTop = $tableEditor[0].offsetTop / showRatio;
        let setRotate = $tableEditor[0].style.transform;
        setRotate = setRotate.replace(/[^\.\d]/g, "");
        let elemTrans = $curElem.getAttribute("transform");
        elemTrans = elemTrans.replace(/translate(\s)*\([^)]+\)/, "translate(" + setLeft + " " + setTop + ")");
        $rect.setAttribute("width", setWidth + "");
        $rect.setAttribute("height", setHeight + "");
        elemTrans = elemTrans.replace(/rotate(\s)*\([^)]+\)/, "rotate(" + setRotate + " " + setWidth/2 + " " + setHeight/2 + ")");
        $curElem.setAttribute("transform", elemTrans);

        // 8：校准边框样式，复制一个svg
        $svgClone = $svg.cloneNode(true);
        $svgClone.querySelectorAll("g[data-row]").forEach(function($dTd){
            $dTd.removeChild($dTd.querySelector("rect"));
            $dTd.removeChild($dTd.querySelector("g[transform]"));
        });
        $gWrap.appendChild($svgClone);

        // 9：素材对象部分属性
        let material = this.elemEditToolData.tempMaterial;
        MaterialTool.tableMaterialTextSet($curElem, material);
    }
    // 13.8：编辑区域 tableTextArea 事件
    tableTextAreaEventAdd($td) {
        Z($td.querySelector("div.tableText-editArea")).on("mousedown", this.tableTextAreaMouseDown, this)
            .on("mouseup", this.tableTextAreaMouseUp, this)
            .on("mouseenter", this.tableTextAreaMouseEnter, this)
            .on("mousemove", this.tableTextAreaMouseMove, this)
            .on("contextmenu", this.tableTextAreaContextMenu, this)
            .on("focus", this.tableTextAreaFocus, this)
            .on("blur", this.tableTextAreaBlur, this)
            .on("input", this.tableTextAreaInput, this);
        let $$tool = $td.querySelectorAll(".tableResizeTool-item");
        $$tool.forEach(function($item){
            Z($item).on("mousedown click", Z.E.forbidden);
            Z($item).on("mousedown", this.tableResizeToolMouseDown, this);
        });
    }
    tableTextAreaBlur() {
        // 1：单元格内边距调整

        // 2：选择框隐藏
        this.tableSelectionHide(true);

        // 3：延迟处理，生成表格数据
        setTimeout(() => {
            let $activeElem = document.activeElement;
            if ($activeElem.className.includes("tableText-editArea")) {
                if (document.hasFocus()) {
                    return;
                }
            }
            // 生成表格素材
            this.resetTableSvgElement();
            // 隐藏表格工具
            this.hideTableEditTool();
            // 显示表格素材
            this.showTableSvgElement();
            // 更新，保存
            ElementUpdate.updateMaterialSource();
            PrototypeHistory.saveHistory();
            // 清空、隐藏
            EditBtnTool.stageDefault();
            Const.clickClearHide();
        }, 10);
    }
    tableTextAreaFocus(event) {
        let $div = Z(Z.E.target(event));

        // 1：选择框隐藏
        this.tableSelectionHide(true);

        // 2：padding计算

        // 3：按钮状态判断
        // 加粗
        if ($div.css("fontWeight").toLowerCase() === "bold") {
            Z("#tool_fontWeight").addClass("active");
        } else {
            Z("#tool_fontWeight").removeClass("active");
        }
        // 斜体
        if ($div.css("fontStyle").toLowerCase() === "italic") {
            Z("#tool_fontStyle").addClass("active");
        } else {
            Z("#tool_fontStyle").removeClass("active");
        }
        // 下划线
        if ($div.css("textDecoration").toLowerCase() === "underline") {
            Z("#tool_fontDecoration").addClass("active");
        } else {
            Z("#tool_fontDecoration").removeClass("active");
        }
        // 文字对齐
        let textAlign = $div.css("textAlign");
        Z("#tool_fontAlign>span")[0].className = "textAlign-btn " + textAlign;
        // 文字颜色
        let textColor = $div.css("color");
        if (textColor === "transparent") {
            Z("#tool_svgColor_tableText").addClass('bgNone');
        } else {
            Z("#tool_svgColor_tableText").removeClass('bgNone').css("backgroundColor", textColor);
        }
        // 单元格背景
        if ($div[0].className.indexOf("bgNone") > -1) {
            Z("#tool_svgColor_tableFill").addClass('bgNone');
        } else {
            Z("#tool_svgColor_tableFill").removeClass('bgNone')
                .css("backgroundColor", $div.css("backgroundColor"));
        }
    }
    tableTextAreaInput(event) {
        let $div = Z.E.target(event);
        let $show = $div.previousElementSibling;
        $show.innerHTML = $div.innerHTML;

        let showHeight = $show.offsetHeight;
        let divHeight = $div.offsetHeight;
        if (showHeight > divHeight){
            $div.style.minHeight = showHeight + "px";
            // 校准所有表格
            this.tableAdjustTdHeight();
        }
    }
    tableTextAreaMouseDown(event) {
        let mouseBtn = event.button;
        let $divEditArea = event.currentTarget;
        let $tdTarget = $divEditArea.parentElement;

        if (Z($tdTarget).hasClass("selected")) {
            if (mouseBtn !== 0) {
                return Z.E.forbidden(event);
            }
        } else {
            //
        }
        this.tableSelectionHide(true);
    }
    tableTextAreaMouseUp(event) {
        // 1：只考虑右键
        let mouseBtn = event.button;
        if (mouseBtn !== 2)
            return;
        let $divEditArea = event.currentTarget;
        let $tdTarget = $divEditArea.parentElement;

        // 2.1：右键菜单内容
        let selData = Z.D.id("tableEditor").selectionTdData;
        let tdSelectedList = null;
        if (Z($tdTarget).hasClass("selected") && !!selData) {
            Z.E.forbidden(event);
            tdSelectedList = selData.tdList;
        } else {
            tdSelectedList = [$tdTarget];
        }

        let tdSelectedLength = tdSelectedList.length;
        let rowBase = new Map(),colBase = new Map(), tdDataMap = new Map();
        let doUnMerge = false;
        for (let i = 0;i < tdSelectedLength;i++) {
            let $td = tdSelectedList[i];
            let tdRow = parseFloat($td.getAttribute("data-row"));
            let tdCol = parseFloat($td.getAttribute("data-col"));
            let tdRowSpan = $td.rowSpan;
            let tdColSpan = $td.colSpan;

            // 选中单元格占行数、占列数
            rowBase.set(tdRow, tdRow);
            colBase.set(tdCol, tdCol);

            // 是否存在合并的单元格
            if(!doUnMerge && (tdRowSpan > 1 || tdColSpan > 1))
                doUnMerge = true;

            // 每行包含单元格数量
            while(tdRowSpan > 0) {
                let rowDataArr = tdDataMap.get(tdRow) || [];
                for (let j = 0;j < tdColSpan;j++) {
                    rowDataArr.push(tdCol + j);
                }
                tdDataMap.set(tdRow, rowDataArr);
                tdRow++;
                tdRowSpan--;
            }
        }

        // 2.1：“插入”菜单
        let editItemInsert = [], editItemMerge = [], editItemDelete = [];
        let tdRowNum = rowBase.size;
        let tdColNum = colBase.size;
        if (!!selData) {
            selData.tdRowNum = tdRowNum;
            selData.tdColNum = tdColNum;
        }
        tdRowNum = tdRowNum > 1 ? tdRowNum : "";
        tdColNum = tdColNum > 1 ? tdColNum : "";
        editItemInsert.push(["在上方插入" + tdRowNum + "行", "MaterialTable.insertTableRowTop"]);
        editItemInsert.push(["在下方插入" + tdRowNum + "行", "MaterialTable.insertTableRowBottom"]);
        editItemInsert.push(["在左侧插入" + tdColNum + "列", "MaterialTable.insertTableColLeft"]);
        editItemInsert.push(["在右侧插入" + tdColNum + "列", "MaterialTable.insertTableColRight"]);

        // 2.2：“合并”菜单
        let doMerge = tdRowNum > 1 || tdColNum > 1;
        let arrFirst;
        if (doMerge) {
            let tdDataArr = [...tdDataMap.values()];
            tdDataArr = tdDataArr.map(function(arr){ return arr.sort(function(x,y){return x - y;})});
            arrFirst = tdDataArr[0];
            tdDataArr = tdDataArr.map(function(arr){return arr.join(",")});
            doMerge = tdDataArr.every(function(item){return item === tdDataArr[0]});
        }
        if (doMerge) {
            for (let i = 0;i < arrFirst.length;i++) {
                if (arrFirst[0] + i !== arrFirst[i]) {
                    doMerge = false;
                    break;
                }
            }
            if (doMerge) {
                editItemMerge.push([]);
                editItemMerge.push(["合并单元格","MaterialTable.mergeTableTd"]);
                if (!!selData) {
                    selData.rowSpanNum = [...tdDataMap.keys()].length;
                    selData.colSpanNum = arrFirst.length;
                }
            }
        }
        if (doUnMerge) {
            !doMerge && editItemMerge.push([]);
            editItemMerge.push(["取消合并单元格","MaterialTable.unMergeTableTd"]);
        }

        // 2.3：“删除”菜单
        editItemDelete.push([]);
        editItemDelete.push(["删除" + tdRowNum + "行", "MaterialTable.deleteTableRow"]);
        editItemDelete.push(["删除" + tdColNum + "列", "MaterialTable.deleteTableCol"]);
        Const.createContextMenu(
        {
            "event": event,
            "elemId": "tableTextAreaContextMenu",
            "editItem": editItemInsert.concat(editItemMerge.concat(editItemDelete)),
        });
    }
    tableTextAreaMouseEnter(event) {
        // 实现表格的框选操作，包括合并的单元格框选
        // 1：判断当前操作类型
        if (Z("#tableResizeLine .active")[0])
            return;
        if (!document.hasFocus())
            return;
        if (event.buttons !== 1)
            return;
        let $dibActive = document.activeElement;
        if (!$dibActive || !$dibActive.className.includes("tableText-editArea"))
            return;
        let $tdActive = $dibActive.parentElement;
        if (!$tdActive || $tdActive.tagName.toLowerCase() !== "td")
            return;

        // 2：获取包含的单元格行数和列数
        let $divEditArea = event.currentTarget;
        let $tdEnter = $divEditArea.parentElement;
        let rowList = [
            parseFloat($tdActive.getAttribute("data-row")),
            parseFloat($tdEnter.getAttribute("data-row")),
        ];
        let colList = [
            parseFloat($tdActive.getAttribute("data-col")),
            parseFloat($tdEnter.getAttribute("data-col")),
        ];
        let rowMin = Const.getMinNum(rowList);
        let rowMax = Const.getMaxNum(rowList);
        let colMin = Const.getMinNum(colList);
        let colMax = Const.getMaxNum(colList);

        // 3：显示选中单元格
        let $$tr = Z("#tableEditor tr");
        let tdSelectedList = [];
        for (let i = 0; i < $$tr.length;i++) {
            let $tr = $$tr[i];
            let $$td = $tr.querySelectorAll("td");
            for(let j = 0;j < $$td.length;j++) {
                let $td = $$td[j];
                let tdRow = parseFloat($td.getAttribute("data-row"));
                let tdCol = parseFloat($td.getAttribute("data-col"));
                if (tdRow < rowMin || tdRow > rowMax || tdCol < colMin  || tdCol > colMax ) {
                    Z($td).removeClass("selected");
                } else {
                    tdSelectedList.push($td);
                    Z($td).addClass("selected");
                }
            }
        }

        // 4：储存选中单元格
        Z.D.id("tableEditor").selectionTdData = {
            tdList: tdSelectedList,
            rowMin: rowMin,
            rowMax: rowMax,
            colMin: colMin,
            colMax: colMax,
        };
    }
    tableTextAreaMouseMove(event) {
        //
    }
    tableTextAreaContextMenu(event) {
        Z.E.forbidden(event);
    }
    // 13.9：单元格缩放操作
    tableResizeToolMouseDown(event) {
        let $curElem = this.$tool.getCurSvgElement();
        if(!$curElem)
            return;

        // 添加事件，拖动操作
        Z(this.$tool.$designStage).on("mousemove", this.tableResizeToolDoing, this)
            .on("mouseleave mouseup", this.tableResizeToolDone, this);

        // 计算辅助线大小
        let $svg = $curElem.querySelector("svg");
        let showRatio = this.$tool.showRatio;
        showRatio *= ($svg.width.baseVal.value/$svg.viewBox.baseVal.width +
            $svg.height.baseVal.value/$svg.viewBox.baseVal.height)/2;
        let strokeWidth = showRatio * $svg.querySelector("line").getAttribute("stroke-width");

        // 计算辅助线位置
        let $targetLine = event.currentTarget;
        let lineType = $targetLine.getAttribute("data-targetType");
        let lineStyle = $targetLine.getAttribute("data-style");
        let setLoc = parseFloat($targetLine.style[lineStyle]);
        if (lineStyle === "right")
            setLoc += $targetLine.parentElement.offsetWidth;
        if (lineStyle === "bottom")
            setLoc += $targetLine.parentElement.offsetHeight;
        let $parent = $targetLine.parentElement;
        let $tableEditor = Z("#tableEditor")[0];
        while($parent !== $tableEditor) {
            setLoc += $parent[lineType === "col" ? "offsetLeft":"offsetTop"];
            $parent = $parent.offsetParent;
        }
        setLoc += strokeWidth + 2;

        // 样式修改
        let $resizeTool = Z("#tableResizeLine");
        let $resizeLine = $resizeTool.find('[data-targetType='+lineType+']');
        $resizeLine.css(lineType==="col"?"width":"height", strokeWidth);
        $resizeLine.css(lineType==="col"?"left":"top", setLoc);
        $resizeLine.addClass("active").siblings(".tableResizeTool-item").removeClass("active");

        // 保存当前处理起始数据
        $resizeTool[0].lineType = lineType;
        $resizeTool[0].lineStyle = $targetLine.getAttribute("data-style");
        $resizeTool[0].$tdElem = $targetLine.parentElement.parentElement;
        $resizeTool[0].mouseStartLoc = Const.getMouseLocation(event);
        $resizeTool[0].lineStartLoc = {
            left: lineType==="col" ? setLoc : 0,
            top: lineType==="col" ? 0 : setLoc,
        };
    }
    tableResizeToolDoing(event) {
        let $resizeTool = Z("#tableResizeLine");
        let lineType = $resizeTool[0].lineType;
        let mouseBase = $resizeTool[0].mouseStartLoc;
        let lineBase = $resizeTool[0].lineStartLoc;
        let mouseLoc = Const.getMouseLocation(event);
        let mx = mouseLoc.x - mouseBase.x;
        let my = mouseLoc.y - mouseBase.y;

        let $resizeLine = $resizeTool.find('[data-targetType='+ lineType +']');
            $resizeLine.css(lineType === "col" ? "left" : "top",
                lineType === "col" ? mx + lineBase.left : my + lineBase.top);
    }
    tableResizeToolDone() {
        // 取消事件，拖动操作
        Z(this.$tool.$designStage).off("mousemove", this.tableResizeToolDoing, this)
            .off("mouseleave mouseup", this.tableResizeToolDone, this);

        // 隐藏辅助线
        let $resizeTool = Z("#tableResizeLine");
        let $line = $resizeTool.find(".active");
        $line.removeClass("active");

        // 缩放操作变化量
        let lineType = $resizeTool[0].lineType;
        let lineStartLoc = $resizeTool[0].lineStartLoc;
        let cssType = lineType === "col" ? "left" : "top";
        let metabolic = parseFloat($line.css(cssType)) - lineStartLoc[cssType];

        // 计算单元格缩放大小
        let lineStyle = $resizeTool[0].lineStyle;
        let $tdElem = $resizeTool[0].$tdElem;
        let $trElem = $tdElem.parentElement;
        let tdElemRow = parseFloat($tdElem.getAttribute("data-row"));
        let tdElemCol = parseFloat($tdElem.getAttribute("data-col"));
        let $tableElem = Z("#tableEditor>table")[0];
        let $$tdAll = $tableElem.querySelectorAll("td");
        let baseRow = tdElemRow, baseCol = tdElemCol;
        let setNextCell = false;
        let shouldEditArr = [];
        let metabolicSet, setEditStyle, setEditNextStyle;
        switch (lineStyle) {
            case "top": {
                metabolicSet = ($td, tdCountRow)=> {
                    if (tdCountRow === baseRow) {
                        let $editDiv = $td.querySelector(".tableText-editArea");
                        shouldEditArr.push($editDiv);
                        let editHeight = $editDiv.offsetHeight;
                        let autoHeight = $td.querySelector(".tableText-showArea").offsetHeight;
                        if (editHeight + metabolic < autoHeight)
                            metabolic = autoHeight - editHeight;
                    }
                    if (baseRow === 1 && !setNextCell)
                        setNextCell = true;
                };
                setEditStyle = ($editDiv)=> {
                    $editDiv.style.height = $editDiv.offsetHeight + metabolic + "px";
                };
                setEditNextStyle = ()=> {
                    let $$tdNextAll = $trElem.querySelectorAll("td");
                    let shouldEditNextArr = [];
                    [].map.call($$tdNextAll, ($tdNext)=> {
                        let $editDiv = $tdNext.querySelector(".tableText-editArea");
                        shouldEditNextArr.push($editDiv);
                        let editHeight = $editDiv.offsetHeight;
                        let autoHeight = $tdNext.querySelector(".tableText-showArea").offsetHeight;
                        if (editHeight - metabolic < autoHeight)
                            metabolic = editHeight - autoHeight;
                    });
                    shouldEditNextArr.map(($editDiv)=> {
                        $editDiv.style.height = $editDiv.offsetHeight - metabolic + "px";
                    });
                };
            } break;
            case "right": {
                metabolicSet= ($td)=> {
                    if ($td.getAttribute("data-col") === tdElemCol + "") {
                        let $editDiv = $td.querySelector(".tableText-editArea");
                        shouldEditArr.push($editDiv);
                        let editWidth = $editDiv.offsetWidth;
                        if (editWidth + metabolic < 0)
                            metabolic = 10 - editWidth;
                    }
                    setNextCell = false;
                };
                setEditStyle = ($editDiv)=> {
                    $editDiv.style.width = $editDiv.offsetWidth + metabolic + "px";
                };
            } break;
            case "bottom": {
                baseRow++;
                metabolicSet= ($td, tdCountRow)=> {
                    if (tdCountRow === baseRow){
                        let $editDiv = $td.querySelector(".tableText-editArea");
                        shouldEditArr.push($editDiv);
                        let editHeight = $editDiv.offsetHeight;
                        let autoHeight = $td.querySelector(".tableText-showArea").offsetHeight;
                        if (editHeight + metabolic < autoHeight)
                            metabolic = autoHeight - editHeight;
                    }
                    setNextCell = false;
                };
                setEditStyle = ($editDiv)=> {
                    $editDiv.style.height = $editDiv.offsetHeight + metabolic + "px";
                };
            } break;
            case "left": {
                metabolicSet= ($td, tdCountRow, tdCountCol)=> {
                    let $editDiv = null, editWidth = 0;
                    if (tdCountCol === baseCol){
                        $editDiv = $td.querySelector(".tableText-editArea");
                        shouldEditArr.push($editDiv);
                        editWidth = $editDiv.offsetWidth;
                        if (editWidth + metabolic < 0)
                            metabolic = 10 - editWidth;
                    }
                    if ($td.getAttribute("data-col") === tdElemCol + "") {
                        $editDiv = $td.querySelector(".tableText-editArea");
                        editWidth = $editDiv.offsetWidth;
                        if (editWidth - metabolic < 0)
                            metabolic = editWidth - 10;
                    }
                    setNextCell = true;
                };
                setEditStyle = ($editDiv)=> {
                    $editDiv.style.width = $editDiv.offsetWidth + metabolic + "px";
                    let autoHeight = $editDiv.parentElement.querySelector(".tableText-showArea").offsetHeight;
                    if ($editDiv.offsetHeight < autoHeight)
                        $editDiv.style.height = autoHeight + "px";
                };
                setEditNextStyle = ()=> {
                    let $$tdNextAll = $tableElem.querySelectorAll('[data-col="' + tdElemCol + '"]');
                    [].map.call($$tdNextAll, function($tdNext){
                        let $editDiv = $tdNext.querySelector(".tableText-editArea");
                        $editDiv.style.width = $editDiv.offsetWidth - metabolic + "px";
                        let editHeight = $editDiv.offsetHeight;
                        let autoHeight = $tdNext.querySelector(".tableText-showArea").offsetHeight;
                        if (editHeight < autoHeight)
                            $editDiv.style.height = autoHeight + "px";
                    });
                };
            } break;
        }
        for(let i = 0;i < $$tdAll.length;i++){
            let $td = $$tdAll[i];
            let tdCountRow = parseFloat($td.getAttribute("data-row")) + $td.rowSpan;
            let tdCountCol = parseFloat($td.getAttribute("data-col")) + $td.rowSpan;
            metabolicSet($td, tdCountRow, tdCountCol);
        }
        shouldEditArr.map(setEditStyle);
        setNextCell && setEditNextStyle && setEditNextStyle();

        // 调整所有表格大小
        this.tableAdjustTdHeight();
    }

    // 13.10：表格调整方法

    // 校准高度
    tableAdjustTdHeight() {
        let $table = Z("#tableEditor>table");
        let $$td = $table.find("td");
        $$td.each(($td)=> {
            let $showDiv = $td.querySelector(".tableText-showArea");
            let $editDiv = $td.querySelector(".tableText-editArea");
            let showHeight = $showDiv.offsetHeight;
            let editHeight = $editDiv.offsetHeight;
            let editCssHeight = parseFloat($editDiv.style.height);
            if (editHeight < showHeight || editCssHeight > showHeight && editHeight > editCssHeight)
                $editDiv.style.minHeight = showHeight + "px";
        });
    }
    // 取消、终止表格编辑过程
    cancelTableElemEdit() {
        let $curElem = this.$tool.getCurSvgElement();
        let material = this.$tool.getCurMaterial();
        if (!$curElem || !material)
            return;
        let $gWrap = $curElem.querySelector('g');
        let $svg = [...$gWrap.children].pop();
        let dataType = $svg.getAttribute("data-targetType");
        if (dataType !== "shape-table")
            return;
        // 隐藏表格工具
        this.hideTableEditTool();
        // 显示表格素材
        this.showTableSvgElement();
    }
    // 表格选择框隐藏
    tableSelectionHide(clearDate) {
        Z("#tableEditor td").removeClass("selected");
        if (clearDate)
            Z.D.id("tableEditor").selectionTdData = null;
    }

    /********************************************
     *********** 十四：钢笔操作历史记录 *********
     ********************************************/
    // 14.1：初始化，可用状态
    initPenEditHistory() {
        this.penEditHistory = {};
        this.penEditHistory.list = [];
        this.penEditHistory.index = 0;
        this.penEditHistory.redoSkip = false;
        this.penEditHistory.revokeSkip = false;

        let coverClass = Z.D.id('penEditorCover').className;
        this.penEditHistory.targetType = coverClass.indexOf('readyEdit') > -1 ? 'edit' :
            (coverClass.indexOf('readyDrawing') > -1 ? 'draw' : null);
    }
    // 14.2：清空，不可用状态
    clearPenEditHistory() {
        this.penEditHistory = null;
    }
    // 14.3：添加历史记录
    savePenEditHistory() {
        let editType = this.penEditHistory.targetType;
        if (!editType)
            return;

        let $path;
        switch(editType){
            case 'draw': $path = this.startData.$tempPath;break;
            case 'edit': $path = this.elemEditToolData.$path;break;
        }

        this.penEditHistory.list.splice(this.penEditHistory.index + 1,
            this.penEditHistory.list.length - 1 - this.penEditHistory.index);
        this.penEditHistory.list.push({
            'path': $path.getAttribute('d'),
        });
        this.penEditHistory.index = this.penEditHistory.list.length - 1;
    }
    // 14.4：加载历史纪录
    loadPenEditHistory() {
        let editType = this.penEditHistory.targetType;
        let obj = this.penEditHistory.list[this.penEditHistory.index];
        let setD = obj.path;

        let $tangentWrap = Z.D.id('penTangentTool');
        let pathStart = /^M[^C]+\s/.exec(setD);
        let dBezier = setD.match(/C[^C\s]+\s[^C\s]+\s[^C\s]+/g);
        let pathEnd = /\sZ$/.exec(setD);
        pathStart = pathStart && pathStart[0];
        pathEnd = (pathEnd && pathEnd[0]) || '';
        Z($tangentWrap).html('');

        let $path;
        switch (editType) {
            case 'draw': {
                // 1：展示路径
                $path = this.startData.$tempPath;
                $path.setAttribute('d', setD);

                // 2：展示切线
                let wrapRect = $tangentWrap.getBoundingClientRect();
                let stageRect = this.$tool.$stageCanvas.getBoundingClientRect();
                let showRatio = this.$tool.showRatio;

                let bezierStart = pathStart.replace(/^[M\s]/, '').split(',');
                let $newTangent = Z(Const.newTangentString);
                let insertPoint = ()=> {
                    let transX = (stageRect.left - wrapRect.left) + parseFloat(bezierStart[0]) * showRatio;
                    let transY = (stageRect.top - wrapRect.top) + parseFloat(bezierStart[1]) * showRatio;
                    Z($tangentWrap).append($newTangent);
                    let tangentLength = $tangentWrap.querySelectorAll('.penTangent-item').length;
                    $newTangent.attr('data-index', tangentLength);
                    $newTangent.css({
                        'left' : transX * 100 / wrapRect.width + '%',
                        'top' : transY * 100 / wrapRect.height + '%',
                    });
                };
                insertPoint();
                for (let i = 0;i < dBezier.length - 1;i++) {
                    bezierStart = dBezier[i].split(' ')[2].replace(/[^\d,.]/, '').split(',');
                    $newTangent = Z(Const.newTangentString);
                    insertPoint();
                }
            } break;
            case 'edit': {
                // 1：展示路径
                $path = this.elemEditToolData.$path;
                $path.setAttribute('d', setD);

                // 2：展示切线
                let $canvasBg = this.$tool.$canvasBg;
                let canvasRect = $canvasBg.getBoundingClientRect();
                let coverRect = this.$tool.$designStage.getBoundingClientRect();
                // 2-1：设置工具样式
                // 主方法：循环处理
                let showRatio = this.$tool.showRatio;
                let mLeft = canvasRect.left - coverRect.left;
                let mTop = canvasRect.top - coverRect.top;
                let coverWidth = coverRect.width;
                let coverHeight = coverRect.height;
                for (let i = 0;i < dBezier.length;i++) {
                    // 1：当前曲线
                    let pointList = dBezier[i].substring(1).split(' ');
                    // 2：所有已存在的切线
                    let $$allTangent = $tangentWrap.querySelectorAll('.penTangent-item');
                    let tangentLength = $$allTangent.length;
                    // 3：插入新切线
                    let $theTangent = Z(Const.newTangentString);
                    Z($tangentWrap).append($theTangent);
                    $theTangent.attr('data-index', tangentLength);
                    $theTangent.addClass('active');
                    // 4：切线锚点位置
                    let thePoint = pointList[2].split(',');
                    let thePointX = parseFloat(thePoint[0]);
                    let thePointY = parseFloat(thePoint[1]);
                    let thePX = (thePointX * showRatio + mLeft) / coverWidth * 100 + '%';
                    let thePY = (thePointY * showRatio + mTop) / coverHeight * 100 + '%';
                    $theTangent.css({
                        'left': thePX,
                        'top': thePY,
                    });
                    // 5：当前切线的 prev ：长度、旋转
                    let $thePrev = $theTangent.find('.penTangent-item-prev');
                    let prevPoint = pointList[1].split(',');
                    let prevPointX = parseFloat(prevPoint[0]);
                    let prevPointY = parseFloat(prevPoint[1]);
                    let pointMX = thePointX - prevPointX;
                    let pointMY = thePointY - prevPointY;
                    let prevAngle = Math.atan(pointMY / pointMX) * 180 / Math.PI;
                    if (pointMX < 0)
                        prevAngle += 180;
                    let prevWidth = Math.sqrt(pointMX * pointMX + pointMY * pointMY) * showRatio;
                    $thePrev.css({
                        'transform': 'translate(calc(-100% + 5.5px), 0) rotate(' + prevAngle + 'deg)',
                        'width' : prevWidth + 'px'
                    });
                    // 6：当前切线的 next：长度、旋转
                    let $theNext = $theTangent.find('.penTangent-item-next');
                    let nextIndex = (i === dBezier.length - 1) ? 0 : (i + 1);
                    let nextPointList = dBezier[nextIndex].substring(1).split(' ');
                    let nextPoint = nextPointList[0].split(',');
                    let nextPointX = parseFloat(nextPoint[0]);
                    let nextPointY = parseFloat(nextPoint[1]);
                    pointMX = nextPointX - thePointX;
                    pointMY = nextPointY - thePointY;
                    let nextAngle = Math.atan(pointMY / pointMX) * 180 / Math.PI;
                    if (pointMX < 0)
                        nextAngle += 180;
                    let nextWidth = Math.sqrt(pointMX * pointMX + pointMY * pointMY) * showRatio;
                    $theNext.css({
                        'transform': 'translate(5.5px, 0) rotate(' + nextAngle + 'deg)',
                        'width' : nextWidth + 'px'
                    });
                    // 7：检测“分离”属性
                    let minMWidth = .5;
                    let minMAngle = .5;
                    let adsMWidth = Math.abs(nextWidth - prevWidth);
                    let adsMAngle = Math.abs(nextAngle - prevAngle);
                    let isSeparate = false;
                    if (adsMWidth > minMWidth && adsMAngle > minMAngle)
                        isSeparate = true;
                    if (isSeparate)
                        $theTangent.attr('data-separate', 'separate');
                }
                // 2-2：定义临时数据，用于编辑
                this.elemEditToolData.pathStart = pathStart;
                this.elemEditToolData.pathBezier = dBezier;
                this.elemEditToolData.pathEnd = pathEnd;
                // 2-3：绑定事件
                Z($tangentWrap).find('.penTangent-item-this .penTangent-item-btn').on('mousedown', this.tangentMoveStart, this);
                Z($tangentWrap).find('.penTangent-item-prev .penTangent-item-btn,.penTangent-item-next .penTangent-item-btn').on('mousedown', this.bezierEditStart, this);
            } break;
        }
    }

    /********************************************
     *************** 十五：复用方法 *************
     ********************************************/
    // 15.1：计算旋转角度的偏移量
    getTrueZoomMetabolic(event,angle) {
        let nowMouseLoc = Const.getMouseLocation(event);
        let mouseMetabolic = {
            "x": (nowMouseLoc.x - this.startData.mouseLoc.x),    //相对SVG中，鼠标横坐标的实际偏移量
            "y": (nowMouseLoc.y - this.startData.mouseLoc.y),    //相对SVG中，鼠标纵坐标的实际偏移量
        };
        if (mouseMetabolic.x === 0 && mouseMetabolic.y === 0) {
            return {"x": 0, "y": 0}
        }

        angle = angle || this.startData.angle;
        if (!angle) {
            return {"x": mouseMetabolic.x, "y": mouseMetabolic.y}
        }
        let transX = mouseMetabolic.x;
        let transY = mouseMetabolic.y;
        let transAngle = 0;
        if (transX !== 0) transAngle = Math.atan(transY / transX) * 180 / Math.PI;
        //按坐标象限，四个象限\四个坐标点
        if (transX > 0 && transY === 0) {transAngle = 0;}
        if (transX > 0 && transY > 0) {transAngle += 0;}
        if (transX === 0 && transY > 0) {transAngle = 90;}
        if (transX < 0 && transY > 0) {transAngle += 180}
        if (transX < 0 && transY === 0) {transAngle = 180;}
        if (transX < 0 && transY < 0) {transAngle += 180}
        if (transX === 0 && transY < 0) {transAngle = 270;}
        if (transX > 0 && transY < 0) {transAngle += 360;}
        //鼠标偏移，减去素材偏移
        transAngle -= angle;
        let hypotR = Math.sqrt(transX * transX + transY * transY);
        transAngle = transAngle * Math.PI / 180;
        let resultX = hypotR * Math.cos(transAngle);
        let resultY = hypotR * Math.sin(transAngle);
        //返回结果
        return {"x": resultX, "y": resultY}
    }
    // 15.2：取消 图片 拖动状态
    removeImgDraging(material, $curElem){
        if (!material || !$curElem) {
            let $$curElem = Z("g.imgDragging");
            for (let i = 0;i < $$curElem.length;i++) {
                $curElem = $$curElem[i];
                material = this.$tool.getMaterialByMid(parseInt($curElem.getAttribute("data-mid")));
                this.removeImgDraging(material, $curElem);
            }
        } else {
            let curElemClass = $curElem.getAttribute("class") || "";
            if (!curElemClass || curElemClass.indexOf("imgDragging") === -1)
                return;
            curElemClass = Z.S.trim(curElemClass.replace("imgDragging",""));
            $curElem.setAttribute("class",curElemClass);
        }
    }
    // 15.3：形状绘制细节
    drawingLine(event){
        let isShift = event.shiftKey;
        let $curElem = Z.D.id("tempShape");
        let $svg = $curElem.querySelector("svg");
        let $line = $curElem.querySelector("line");
        let ingX = this.doingData.mouseLoc.x;
        let ingY = this.doingData.mouseLoc.y;
        let transX = this.startData.targData.x;
        let transY = this.startData.targData.y;
        let absX = Math.abs(ingX);
        let absY = Math.abs(ingY);
        let absL = Math.sqrt(Math.pow(absX,2) + Math.pow(absY,2));
        let absAngle = Math.atan(absY / absX);
        let trueAngle  = absAngle * (180 / Math.PI);
        if (ingY > 0 && ingX < 0) trueAngle = 180 - trueAngle;
        if (ingY === 0 && ingX < 0) trueAngle = 180;
        if (ingY < 0 && ingX < 0) trueAngle = 180 + trueAngle;
        if (ingY < 0 && ingX === 0) trueAngle = 270;
        if (ingY < 0 && ingX > 0) trueAngle = 360 - trueAngle;
        trueAngle = trueAngle > 0?trueAngle:0;
        if (isShift) {
            trueAngle = Math.round(trueAngle/45) * 45;
        }
        $curElem.setAttribute("transform","translate(" + transX + " " + transY + ") rotate(" + trueAngle + " 0 0)");
        $line.setAttribute("x2",absL-1);
        $svg.setAttribute("viewBox", "0 0 " + absL + " 2");
        $svg.setAttribute("width", absL);
        $svg.setAttribute("height", "2");
    }
    drawingRect(event){
        let isShift = event.shiftKey;
        let $curElem = Z.D.id("tempShape");
        let $svg = $curElem.querySelector("svg");
        let transX = this.startData.targData.x;
        let transY = this.startData.targData.y;
        let ingX = this.doingData.mouseLoc.x;
        let ingY = this.doingData.mouseLoc.y;
        let absX = Math.abs(ingX+"");
        let absY = Math.abs(ingY+"");
        if (isShift) {
            absX = absY = Const.getMaxNum([absX,absY]);
            ingX = ingX<0?(-absX):absX;
            ingY = ingY<0?(-absY):absY;
        }
        transX = ingX < 0?transX+ingX:transX;
        transY = ingY < 0?transY+ingY:transY;
        $curElem.setAttribute("transform","translate(" + transX + " " + transY + ") rotate(0 " + absX/2 + " " + absY/2 + ")");
        $svg.setAttribute("viewBox", "0 0 " + absX + " " + absY);
        $svg.setAttribute("width", absX);
        $svg.setAttribute("height", absY);

        //计算形状矩形
        if (this.shapeType === "2") {
            this.drawRectResize($svg,absX,absY);
        } else if (this.shapeType === "3") {
            this.drawRectStrokeResize($svg,absX,absY);
        }
    }
    // 15.3.1：计算形状矩形：成功绘制返回 true，失败返回 false
    drawRectResize($svg,absX,absY) {
        let mL = Const.getMinNum([absX,absY])/2;
        if (mL === 0){
            return false;
        }
        let $path_nw = $svg.querySelector(".nw");
        let $path_ne = $svg.querySelector(".ne");
        let $path_se = $svg.querySelector(".se");
        let $path_sw = $svg.querySelector(".sw");
        let nw_r = parseFloat($path_nw.getAttribute("data-radius"));
        let ne_r = parseFloat($path_ne.getAttribute("data-radius"));
        let se_r = parseFloat($path_se.getAttribute("data-radius"));
        let sw_r = parseFloat($path_sw.getAttribute("data-radius"));
        let nw_t = $path_nw.getAttribute("data-targetType");
        let ne_t = $path_ne.getAttribute("data-targetType");
        let se_t = $path_se.getAttribute("data-targetType");
        let sw_t = $path_sw.getAttribute("data-targetType");

        if (Math.round(Const.getMaxNum([nw_r,ne_r,se_r,sw_r])) > Math.round(mL)){
            return false;
        }
        // 所有 path 路径，衔接处多偏移 2 个单位
        let pML = mL + 2;
        let mML = mL - 2;
        let nw_path = "M" + pML + ",0 h-" + (((pML - nw_r) > 0) ? (pML - nw_r) : 0) +
            " a" + nw_r + "," + nw_r + ",0,0," + nw_t + ",-" + nw_r + "," + nw_r +
            " v" + (((pML - nw_r) > 0) ? (pML - nw_r) : 0) + " h" + pML + " v-" + pML + " Z";
        let ne_path = "M" + absX + "," + pML + " v-" + (((pML - ne_r) > 0) ? (pML - ne_r) : 0) +
            " a" + ne_r + "," + ne_r + ",0,0," + ne_t + ",-" + ne_r + ",-" + ne_r +
            " h-" + (((pML - ne_r) > 0) ? (pML - ne_r) : 0) +" v" + pML + " h" + pML + " Z";
        let se_path, sw_path;
        let se_path_start = "M" + mML + "," + absY;
        let sw_path_start = "M0," + mML;
        if(absX > absY) {
            se_path_start = "M" + (absX - pML) + "," + absY;
        } else if(absX < absY) {
            sw_path_start = "M0," + (absY - pML);
        }
        se_path = se_path_start + " h" + (((pML - se_r) > 0) ? (pML - se_r) : 0) +
            " a" + se_r + "," + se_r + ",0,0," + se_t + "," + se_r + ",-" + se_r +
            " v-" + (((pML - se_r) > 0) ? (pML - se_r) : 0) + " h-" + pML + " v" + pML + " Z";
        sw_path = sw_path_start + " v" + (((pML - sw_r) > 0) ? (pML - sw_r) : 0) +
            " a" + sw_r + "," + sw_r + ",0,0," + sw_t + "," + sw_r + "," + sw_r +
            " h" + (((pML - sw_r) > 0) ? (pML - sw_r) : 0) + " v-" + pML + " h-" + pML + " Z";

        $path_nw.setAttribute("d",nw_path);
        $path_ne.setAttribute("d",ne_path);
        $path_se.setAttribute("d",se_path);
        $path_sw.setAttribute("d",sw_path);
        let $rect_n = $svg.querySelector(".n");
        let $rect_c = $svg.querySelector(".c");
        let $rect_w = $svg.querySelector(".w");
        let $rect_e = $svg.querySelector(".e");
        let $rect_s = $svg.querySelector(".s");
        $rect_n.setAttribute("x", mL + '');
        $rect_n.setAttribute("width", '0');
        $rect_n.setAttribute("height", mL + '');
        if ($rect_c) {
            $rect_c.setAttribute("x", mL - 1 + '');
            $rect_c.setAttribute("y", mL - 1 + '');
            $rect_c.setAttribute("width", '2');
            $rect_c.setAttribute("height", '2');
        }
        $rect_w.setAttribute("y", mL + '');
        $rect_w.setAttribute("width", mL + '');
        $rect_w.setAttribute("height", '0');
        $rect_e.setAttribute("x", mL + '');
        $rect_e.setAttribute("y", mL + '');
        $rect_e.setAttribute("width", mL + '');
        $rect_e.setAttribute("height", '0');
        $rect_s.setAttribute("x", mL + '');
        $rect_s.setAttribute("y", mL + '');
        $rect_s.setAttribute("width", '0');
        $rect_s.setAttribute("height", mL + '');
        if(absX > absY) {
            $rect_n.setAttribute("width", absX - absY + '');
            if ($rect_c) {
                $rect_c.setAttribute("width", absX - absY + '');
            }
            $rect_e.setAttribute("x", absX - mL + '');
            $rect_s.setAttribute("width", absX - absY + '');
        } else if(absX < absY) {
            if ($rect_c) {
                $rect_c.setAttribute("height", absY - absX + '');
            }
            $rect_w.setAttribute("height", absY - absX + '');
            $rect_e.setAttribute("height", absY - absX + '');
            $rect_s.setAttribute("y", absY - mL + '');
        }
        return true;
    }
    // 15.3.2：计算矩形框,形状大小：成功绘制返回 true，失败返回 false
    drawRectStrokeResize($svg,absX,absY) {
        let mL = Const.getMinNum([absX,absY]);
        if (mL === 0){
            return false;
        }
        $svg.setAttribute("data-rectmaxstroke", mL);
        mL = mL / 2;
        let $path_nw = $svg.querySelector(".nw");
        let $path_ne = $svg.querySelector(".ne");
        let $path_se = $svg.querySelector(".se");
        let $path_sw = $svg.querySelector(".sw");
        let nw_r = parseFloat($path_nw.getAttribute("data-radius"));
        let ne_r = parseFloat($path_ne.getAttribute("data-radius"));
        let se_r = parseFloat($path_se.getAttribute("data-radius"));
        let sw_r = parseFloat($path_sw.getAttribute("data-radius"));
        let stroke_width = parseFloat($svg.getAttribute("data-rectstroke") || 5);
        stroke_width = stroke_width > mL ? mL : stroke_width;
        if (Math.round(Const.getMaxNum([nw_r,ne_r,se_r,sw_r])) > Math.round(mL)){
            return false;
        }
        let nw_path = "M0," + (absY / 2) + " h" + stroke_width + " ";
        let ne_path = "M" + (absX / 2) + ",0 v" + stroke_width + " ";
        let se_path = "M" + absX + "," + (absY /2 ) + " h-" + stroke_width + " ";
        let sw_path = "M" + (absX / 2) + "," + absY + " v-" + stroke_width + " ";
        if (nw_r === 0){
            nw_path += "v-" + (absY / 2 - stroke_width) + " ";
            nw_path += "h" + (absX / 2 - stroke_width + 2) + " v-" + stroke_width + " h-" + (absX / 2 + 2) + " ";
            nw_path += "v" + (absY / 2) + " Z";
        } else {
            let nw_x = absX / 2 - nw_r > 0 ? absX / 2 - nw_r : 0;
            let nw_y = absY / 2 - nw_r > 0 ? absY / 2 - nw_r : 0;
            let nw_r2 = nw_r - stroke_width;
            nw_path += "v-" + nw_y + " ";
            nw_path += "a" + nw_r2 + "," + nw_r2 + ",0,0,1," + nw_r2 + "," + (0 - nw_r2) + " ";
            nw_path += "h" + (nw_x + 2) + " v-" + stroke_width + " h-" + (nw_x + 2) + " ";
            nw_path += "a" + nw_r  + "," + nw_r + ",0,0,0,-" + nw_r + "," + nw_r + " ";
            nw_path += "v" + nw_y + " Z";
        }
        if (ne_r === 0){
            ne_path += "h" + (absX / 2 - stroke_width) + " ";
            ne_path += "v" + (absY / 2 - stroke_width + 2) + " h" + stroke_width + " v-" + (absY / 2 + 2) +" ";
            ne_path += "h-" + (absX / 2) + " Z";
        } else {
            let ne_x = absX / 2 - ne_r > 0 ? absX / 2 - ne_r : 0;
            let ne_y = absY / 2 - ne_r > 0 ? absY / 2 - ne_r : 0;
            let ne_r2 = ne_r - stroke_width;
            ne_path += "h" + ne_x + " ";
            ne_path += "a" + ne_r2 + "," + ne_r2 + ",0,0,1," + ne_r2 + "," + ne_r2 + " ";
            ne_path += "v" + (ne_y + 2) + " h" + stroke_width + " v-" + (ne_y + 2) + " ";
            ne_path += "a" + ne_r  + "," + ne_r + ",0,0,0,-" + ne_r + ",-" + ne_r + " ";
            ne_path += "h-" + ne_x + " Z";
        }
        if (se_r === 0){
            se_path += "v" + (absY / 2 - stroke_width) + " ";
            se_path += "h-" + (absX / 2 - stroke_width + 2) + " v" + stroke_width + " h" + (absX / 2 + 2) + " ";
            se_path += "v-" + (absY / 2) + " Z";
        } else {
            let se_x = absX / 2 - se_r > 0 ? absX / 2 - se_r : 0;
            let se_y = absY / 2 - se_r > 0 ? absY / 2 - se_r : 0;
            let se_r2 = se_r - stroke_width;
            se_path += "v" + se_y + " ";
            se_path += "a" + se_r2 + "," + se_r2 + ",0,0,1," + (0 -  se_r2) + "," + se_r2 + " ";
            se_path += "h-" + (se_x + 2) + " v" + stroke_width + " h" + (se_x + 2) + " ";
            se_path += "a" + se_r  + "," + se_r + ",0,0,0," + se_r + "," + (0 - se_r) + " ";
            se_path += "v-" + se_y + " Z";
        }
        if (sw_r === 0){
            sw_path += "h-" + (absX / 2 - stroke_width) + " ";
            sw_path += "v-" + (absY / 2 - stroke_width + 2) +" h-" + stroke_width + " v" + (absY / 2 + 2) + " ";
            sw_path += "h" + (absX / 2) + " Z";
        } else {
            let sw_x = absX / 2 - sw_r > 0 ? absX / 2 - sw_r : 0;
            let sw_y = absY / 2 - sw_r > 0 ? absY / 2 - sw_r : 0;
            let sw_r2 = sw_r - stroke_width;
            sw_path += "h-" + sw_x + " ";
            sw_path += "a" + sw_r2 + "," + sw_r2 + ",0,0,1," + (0 - sw_r2) + "," + (0 - sw_r2) + " ";
            sw_path += "v-" + (sw_y + 2) + " h-" + stroke_width + " v" + (sw_y + 2) + " ";
            sw_path += "a" + sw_r  + "," + sw_r + ",0,0,0," + sw_r + "," + sw_r + " ";
            sw_path += "h" + sw_x + " Z";
        }

        $path_nw.setAttribute("d",nw_path);
        $path_ne.setAttribute("d",ne_path);
        $path_se.setAttribute("d",se_path);
        $path_sw.setAttribute("d",sw_path);

        return true;
    }
    drawingEllipse(event){
        let isShift = event.shiftKey;
        let $curElem = Z.D.id("tempShape");
        let $svg = $curElem.querySelector("svg");
        let $ellipse = $curElem.querySelector("ellipse");
        let ingX = this.doingData.mouseLoc.x;
        let ingY = this.doingData.mouseLoc.y;
        let transX = this.startData.targData.x;
        let transY = this.startData.targData.y;
        let absX = Math.abs(ingX);
        let absY = Math.abs(ingY);
        if (isShift) {
            absX = absY = Const.getMaxNum([absX,absY]);
            ingX = ingX<0?(-absX):absX;
            ingY = ingY<0?(-absY):absY;
        }
        let strokeWidth = parseFloat($ellipse.getAttribute("stroke-width"));
        let cx = absX/2;
        let cy = absY/2;
        let rx = (absX - 2 * strokeWidth)/2;
        let ry = (absY - 2 * strokeWidth)/2;
        transX = ingX < 0?transX+ingX:transX;
        transY = ingY < 0?transY+ingY:transY;
        $curElem.setAttribute("transform","translate(" + transX + " " + transY + ") rotate(0 " + absX/2 + " " + absY/2 + ")");
        $svg.setAttribute("viewBox", "0 0 " + absX + " " + absY);
        $svg.setAttribute("width", absX);
        $svg.setAttribute("height", absY);
        $ellipse.setAttribute("cx",cx);
        $ellipse.setAttribute("cy",cy);
        $ellipse.setAttribute("rx",rx);
        $ellipse.setAttribute("ry",ry);
    }
//END
};