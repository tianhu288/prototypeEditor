/*!
 * panelEvent.js
 * PanelEvent，侧边栏列表，操作类
 * PanelTool，按钮、功能实现
 */

/********************************************
 *************** 侧边栏基础操作 *************
 ********************************************/
class PanelEvent {
    /********************************************
     ***************** 常量定义 *****************
     ********************************************/
    static toolDisableClass = "disable";

    /********************************************
     ****************** 初始化 ******************
     ********************************************/
    // 初始化
    static init() {
        /**************************
        * 常量定义
        * **************************/
        // 侧边栏对象
        PanelTool.$leftPanel = Z("#container_left");
        PanelTool.$rightPanel = Z("#container_right");

        /*
         * 顶部 dom
         */
        // 顶部页面导航
        PanelTool.$topNavigation = Z("#proEditor_topPageNav");
        // 顶部工具按钮组
        PanelTool.$topToolBar = Z("#proEditor_topNav>.proEditor-toolBar");

        // 按钮组：撤消重做
        PanelTool.$tollGroupUndo = PanelTool.$topToolBar.find(".toolGroup-undo");
        PanelTool.$tollUndo = PanelTool.$tollGroupUndo.find(".toolBtn:nth-child(1)");
        PanelTool.$tollRedo = PanelTool.$tollGroupUndo.find(".toolBtn:nth-child(2)");
        // 按钮组：编辑
        PanelTool.$tollGroupEdit = PanelTool.$topToolBar.find(".toolGroup-edit");
        PanelTool.$toolCut = PanelTool.$tollGroupEdit.find(".toolBtn:nth-child(1)");
        PanelTool.$toolCopy = PanelTool.$tollGroupEdit.find(".toolBtn:nth-child(2)");
        PanelTool.$toolPaste = PanelTool.$tollGroupEdit.find(".toolBtn:nth-child(3)");
        PanelTool.$toolDelete = PanelTool.$tollGroupEdit.find(".toolBtn:nth-child(4)");
        // 按钮组：页面/画布展示
        PanelTool.$tollGroupScreen = PanelTool.$topToolBar.find(".toolGroup-screen");
        PanelTool.$toolScaleMinus = PanelTool.$tollGroupScreen.find(".toolBtn:nth-child(1)");
        PanelTool.$toolScale = PanelTool.$tollGroupScreen.find(".toolBtn:nth-child(2)");
        PanelTool.$toolScalePlus = PanelTool.$tollGroupScreen.find(".toolBtn:nth-child(3)");
        PanelTool.$toolScreenSet = PanelTool.$tollGroupScreen.find(".toolBtn:nth-child(4)");
        PanelTool.$toolScreenAll = PanelTool.$tollGroupScreen.find(".toolBtn:nth-child(5)");
        // 按钮组：帮助
        PanelTool.$tollGroupHelp = PanelTool.$topToolBar.find(".toolGroup-help");
        PanelTool.$toolShortCutKey = PanelTool.$tollGroupHelp.find(".toolBtn:nth-child(1)");
        // 按钮组：保存
        PanelTool.$tollGroupUndo = PanelTool.$topToolBar.find(".toolGroup-save");
        PanelTool.$toolDownload = PanelTool.$tollGroupUndo.find(".toolBtn:nth-child(1)");
        PanelTool.$toolSave = PanelTool.$tollGroupUndo.find(".toolBtn:nth-child(2)");
        PanelTool.$toolPreview = PanelTool.$tollGroupUndo.find(".toolBtn:nth-child(3)");

        /*
         * 选项卡 dom
         */
        PanelTool.$$tabNav = Z("ul.sideNav");
        PanelTool.$$tabNavItem = Z("ul.sideNav > li");
        PanelTool.$$widgetList = Z(".widgetList");
        PanelTool.$$widgetTitle = Z(".widgetList > .widgetList-title");

        /**************************
        * 页面展示初始化
        * **************************/
        // tabNav 选项、列表初始化
        PanelEvent.tabNavInit();
        // 素材列表高度初始化
        PanelEvent.widgetListInit();

        /**************************
        * 页面展示方法
        * **************************/
        // 侧边栏展示
        PanelEvent.showPanel();

        /**************************
        * 按钮重置
        * **************************/
        // toolBar 按钮重置
        PanelTool.resetPanelToolBar();

        /**************************
        * 事件绑定
        * **************************/
        PanelEvent.eventOn();
    }
    // 选项卡选中、选项展示初始化
    static tabNavInit() {
        PanelTool.$$tabNav.each(($tabNav)=> {
            // 按钮添加样式
            $tabNav.children[0].classList.add("active");
            // 列表展示
            let $$list = $tabNav.parentElement.querySelector(".sideList").children;
            $$list[0].classList.add("active");
        });
    }
    // 素材列表高度样式初始化
    static widgetListInit() {
        PanelTool.$$widgetList.each(($widgetList)=> {
            // 无内容则填充
            let $content = $widgetList.querySelector(".widgetList-content");
            if ($content.children.length === 0) {
                $content.classList.add("widgetList-none");
            }

            // 第一个添加 active
            let $$list = $widgetList.parentElement.querySelectorAll(".widgetList");
            let index = [].indexOf.call($$list, $widgetList);
            if (index !== 0)
                return;

            $widgetList.classList.add("active");
            let $container = $widgetList.querySelector(".widgetList-container");
            let fullHeight = Math.ceil($content.getBoundingClientRect().height);
            $container.style.height = fullHeight + "px";
        });
    }
    // 事件绑定
    static eventOn() {
        // 面板切换按钮
        PanelTool.$$tabNavItem.on("click", PanelEvent.switchSideNavTab);
        PanelTool.$$widgetList.each(($widgetList)=> {
            let $widgetTitle = Z($widgetList).find(".widgetList-title");
            $widgetTitle.on("click", PanelEvent.switchWidgetList);
        });
    }

    /********************************************
     ****************** 功能 ********************
     ********************************************/


    /********************************************
     ***************** 面板展示 *****************
     ********************************************/
    // 侧边栏展示
    static showPanel() {
        // 左侧边栏
        if (canvasModel.showLeftPanel){
            PanelTool.$leftPanel.removeClass(CanvasEvent.hidePanelClass);}
        else
            PanelTool.$leftPanel.addClass(CanvasEvent.hidePanelClass);

        // 右侧边栏
        if (canvasModel.showRightPanel){
            PanelTool.$rightPanel.removeClass(CanvasEvent.hidePanelClass);}
        else
            PanelTool.$rightPanel.addClass(CanvasEvent.hidePanelClass);
    }

    /********************************************
     ***************** 切换面板 *****************
     ********************************************/
    // 切换选项卡
    static switchSideNavTab(event) {
        let $item = Z(event.currentTarget);
        $item.addClass("active").siblings("li").removeClass("active");
        let $parent = $item.parent();
        let $$btnList = $parent[0].children;
        // 索引值
        let index = [].indexOf.call($$btnList, $item[0]);
        // 展示列表
        let $$showList = $parent[0].parentElement.querySelector(".sideList").children;
        let $showList = Z($$showList[index]);
        $showList.addClass("active").siblings(".list-item").removeClass("active");
    }
    // 切换素材列表展示
    static switchWidgetList(event) {
        let $title = Z(event.currentTarget);
        let $list = $title.parent();
        let $container = $list.find(".widgetList-container");
        let $content = $container.find(".widgetList-content");
        let fullHeight = Math.ceil($content[0].getBoundingClientRect().height);
        let classList = $list[0].classList;

        // 切换样式
        let isActive = classList.toggle("active");
        if (!isActive) {
            $container.css("height", 0);
        } else {
            $container.css("height", fullHeight);
            let $$siblings = $list.siblings(".widgetList");
            $$siblings.each(($sibling)=> {
                Z($sibling).removeClass("active")
                    .find(".widgetList-container").css("height", 0);
            });
        }
    }
}

/********************************************
 *************** 按钮、功能实现 *************
 ********************************************/
class PanelTool {
    /********************************************
     **************** 按钮工具展示 **************
     ********************************************/
    // 按钮重置
    static resetPanelToolBar() {
        PanelTool.resetToolUndoRedo();
        PanelTool.resetToolScale();
    }
    // 按钮重置：撤销、重做
    static resetToolUndoRedo() {
        if (HistoryDB.index === 0)
            PanelTool.$tollUndo.addClass(PanelEvent.toolDisableClass);
        else
            PanelTool.$tollUndo.removeClass(PanelEvent.toolDisableClass);

        if (HistoryDB.index === HistoryDB.list.length-1)
            PanelTool.$tollRedo.addClass(PanelEvent.toolDisableClass);
        else
            PanelTool.$tollRedo.removeClass(PanelEvent.toolDisableClass);
    }
    // 按钮重置：缩放比例
    static resetToolScale() {
        let scalePercent = Math.round(canvasModel.scale * 100) + "%";
        PanelTool.$toolScale.html(scalePercent);
    }

    /********************************************
     **************** 数据操作方法 **************
     ********************************************/
    // 撤销操作
    static undo () {
        // 历史记录读取
        HistoryDB.undo();
        // 撤销、重做按钮重置
        PanelTool.resetToolUndoRedo();
    }
    // 重做操作
    static redo () {
        // 历史记录读取
        HistoryDB.redo();
        // 撤销、重做按钮重置
        PanelTool.resetToolUndoRedo();
    }








    // 显示编辑工具
    static showEditToolbar() {
        // 主方法，定义变量
        let selectedLength = media.selectedList.length;
        let curMaterial;
        if (selectedLength <= 0)
            return;

        // 1：通用的显示隐藏
        media.tool.$toolbar.addClass('active');
        // 侧边栏文字输入框
        Z("#sideTextEditor").removeClass('active');
        // 富文本编辑隐藏按钮
        Z(Const.richTextHideId).show();
        // 右侧通用编辑工具
        media.tool.$toolsWrapRight.removeClass('zi-hide');
        // 两端对齐按钮
        Z("#textAlign_box > .justify").removeClass('zi-hide');

        // 2：依类型显示
        if (selectedLength === 1) {
            curMaterial = media.tool.tempMaterial || media.tool.getCurMaterial();
            curMaterial.type = parseFloat(curMaterial.type);
            switch (curMaterial.type){
                case 1: EditBtnTool.showTextToolbar(); break;
                case 0:
                case 2: EditBtnTool.showImageToolbar(); break;
                case 3: EditBtnTool.showSvgToolbar(); break;
                case 4: EditBtnTool.showFrameToolbar(); break;
                case 5: EditBtnTool.showShapeToolbar(); break;
            }
        } else {
            EditBtnTool.showGroupToolbar();
        }
    }
    // 显示文字编辑工具
    static showTextToolbar() {
        // 显示预设按钮
        EditBtnTool.showDefaultTools('text');
        // 字体状态按钮状态
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        if (!material)
            return;

        material.textVertical = material.textVertical || 'normal';
        material.textAlign = material.textAlign || 'left';
        // 加粗
        if (material.fontWeight)
            Z("#tool_fontWeight").addClass("active");
        else
            Z("#tool_fontWeight").removeClass("active");
        // 斜体
        if (material.fontItalic)
            Z("#tool_fontStyle").addClass("active");
        else
            Z("#tool_fontStyle").removeClass("active");
        // 下划线
        if (material.textDecoration)
            Z("#tool_fontDecoration").addClass("active");
        else
            Z("#tool_fontDecoration").removeClass("active");
        // 对齐
        Z('#tool_fontAlign .textAlign-btn')[0].className = 'textAlign-btn ' + material.textAlign;
        if (material.textVertical !== 'normal')
            Z('#tool_fontAlign').addClass('eventDisable');
        else
            Z('#tool_fontAlign').removeClass('eventDisable');

        // 侧边栏文字输入框
        Z("#sideTextEditor").addClass('active');

        // 颜色按钮状态
        EditBtnTool.resetColorToolBtn();
        // 文字类型、大小按钮状态
        EditBtnTool.resetFontToolBtn();
        // 锁定按钮状态
        EditBtnTool.resetLockToolBtn();
    }
    // 显示图片编辑工具
    static showImageToolbar() {
        // 显示预设按钮
        EditBtnTool.showDefaultTools('image');
        // 锁定按钮状态
        EditBtnTool.resetLockToolBtn();
    }
    // 显示普通素材编辑工具
    static showSvgToolbar() {
        // 显示预设按钮
        EditBtnTool.showDefaultTools('svg');
        // 插入颜色工具
        EditBtnTool.insertColorBtn();
        // 颜色按钮状态
        EditBtnTool.resetColorToolBtn();
        // 锁定按钮状态
        EditBtnTool.resetLockToolBtn();
    }
    // 显示容器编辑工具
    static showFrameToolbar() {
        // 显示预设按钮
        EditBtnTool.showDefaultTools('frame');
        // 裁剪按钮
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        let $image = $curElem.querySelector(".svgFrame-img image");
        let imageHref = $image ? $image.getAttribute("xlink:href") : "";
        if (/inc\/img\/container_default\.png$/.test(imageHref))
            Z("#tool_svgCut").hide();
        else
            Z("#tool_svgCut").show();

        // 锁定按钮状态
        EditBtnTool.resetLockToolBtn();
    }
    // 显示形状编辑工具
    static showShapeToolbar() {
        // 显示预设按钮
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        let $svg = $curElem.querySelector("svg");
        let childType = $svg.getAttribute("data-targetType");
        EditBtnTool.showDefaultTools('shape', childType);

        // 插入表格属性按钮
        if (childType === "shape-table"){
            let getBtnStr = (idMark, color, type, text)=> {
                return '<div id="tool_svgColor_' + idMark + '" style="background-color:' + color + ';" ' +
                    'class="tool-item tool-colorPicker' + (color.toLowerCase()==='none'?' bgTransparent':'') + '" ' +
                    'data-targetType="' + type + '" data-text="' + text + '" onmousedown="Z.E.forbidden(event);" onclick="ColorPicker.show(event);"></div>';
            };
            let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
            let $svg = $curElem.querySelector("svg");
            let textColor = Exchange.rgb2hex(Z($svg).find("path").attr("fill") || "#000000");
            let bdColor = Exchange.rgb2hex(Z($svg).find("line").attr("stroke") || "#000000");
            let bgColor = Exchange.rgb2hex(Z($svg).find("rect").attr("fill") || "#ffffff");

            let $insertWrap = Z('#tool_insertAttr').html("");
            let $textColor = Z(getBtnStr("tableText", textColor, "tableText", "颜色"));
            let $bdColor = Z(getBtnStr("tableStroke", bdColor, "tableStroke", "边框"));
            let $bgColor = Z(getBtnStr("tableFill", bgColor, "tableFill", "背景"));
            let $bdSize = Z('<div id="tool_svgColor_tableBorder" class="tool-item" onclick="EditBtnTool.showShapeStrokeBox(event);" data-text="边框">边框</div>');
            $insertWrap.append($textColor).append($bdColor).append($bgColor).append($bdSize);
        }
        // 文字属性
        if (childType === "shape-table") {
            let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
            let $svg = $curElem.querySelector("svg");
            let $firstTd = $svg.querySelector("g[data-rowspan]");

            if (!Z('#tool_fontFamily').isHide() && !Z('#tool_fontSize').isHide()){
                EditBtnTool.setFontSelectVal($firstTd.getAttribute("data-fontfamily"), 'tool_fontFamily');
                EditBtnTool.setFontSelectVal($firstTd.getAttribute("data-fontsize"), 'tool_fontSize');
            }

            let fontWeight = parseFloat($firstTd.getAttribute("data-fontweight") || 0);
            let fontItalic = parseFloat($firstTd.getAttribute("data-fontitalic") || 0);
            let textDecoration = parseFloat($firstTd.getAttribute("data-textdecoration") || 0);
            let textAlign = $firstTd.getAttribute("data-textalign");

            // 加粗
            if (fontWeight)
                Z("#tool_fontWeight").addClass("active");
            else
                Z("#tool_fontWeight").removeClass("active");
            // 斜体
            if (fontItalic)
                Z("#tool_fontStyle").addClass("active");
            else
                Z("#tool_fontStyle").removeClass("active");
            // 下划线
            if (textDecoration)
                Z("#tool_fontDecoration").addClass("active");
            else
                Z("#tool_fontDecoration").removeClass("active");
            // 对齐
            Z('#tool_fontAlign .textAlign-btn')[0].className = 'textAlign-btn ' + textAlign;
            Z("#textAlign_box > .justify").addClass('zi-hide');
        }
        // 颜色按钮状态
        EditBtnTool.resetColorToolBtn();
        // 锁定按钮状态
        EditBtnTool.resetLockToolBtn();
    }
    // 显示群组编辑工具
    static showGroupToolbar() {
        // 显示预设按钮
        EditBtnTool.showDefaultTools('group');
        // 编组情况，依类型显示隐藏
        // 1：编组按钮，2：颜色按钮，3：字体按钮显示，4：透明度，5：文字属性值
        let equalNum = 0;
        let firstMaterial = media.tool.getCurMaterial(0);
        let groupId = (firstMaterial.groupId && firstMaterial.groupId.trim()) || '0';
        let isColor = true;                               // 颜色按钮标识
        let isText = true;                                // 字体按钮标识
        let textBold = firstMaterial.fontWeight;           // 粗体默认值
        let textItalic = firstMaterial.fontItalic;         // 斜体默认值
        let textUnderline = firstMaterial.textDecoration;  // 下划线默认值
        let textAlign = firstMaterial.textAlign;           // 对齐默认值
        for (let i = 0;i < media.selectedList.length;i++) {
            let material = media.tool.getCurMaterial(i);
            // 1：编组判断
            if (groupId === material.groupId) equalNum ++;

            // 2：颜色判断
            material.type = parseFloat(material.type);
            if (isColor && (material.type === 0 || material.type === 2 || material.type === 4))
                isColor = false;

            // 3：字体判断 + 4：透明判断
            if (isText && material.type !== 1)
                isText = false;

            // 几个文字按钮状态判断
            if (firstMaterial.fontWeight !== material.fontWeight)
                textBold = 0;
            if (firstMaterial.fontItalic !== material.fontItalic)
                textItalic = 0;
            if (firstMaterial.textDecoration !== material.textDecoration)
                textUnderline = 0;
            if (firstMaterial.textAlign !== material.textAlign)
                textAlign = 'left';
        }
        // 1：编组设置
        if (equalNum === media.selectedList.length) {//显示取消按钮
            Z("#tool_groupSet").hide();
            Z("#tool_groupBreak").show();
        } else{    //显示编组按钮
            Z("#tool_groupSet").show();
            Z("#tool_groupBreak").hide();
        }

        // 2 ：颜色设置
        if (isColor)
            Z('#tool_svgColor').show();
        else
            Z('#tool_svgColor').hide();

        // 3 + 4 + 5 ：字体设置、透明设置、文字属性值
        if (isText) {
            Z('.tool-textList.tool-groupList').show();
            // Z('#tool_opacity').show();
            // 加粗
            if (textBold)
                Z("#tool_fontWeight").addClass("active");
            else
                Z("#tool_fontWeight").removeClass("active");
            // 斜体
            if (textItalic)
                Z("#tool_fontStyle").addClass("active");
            else
                Z("#tool_fontStyle").removeClass("active");
            // 下划线
            if (textUnderline)
                Z("#tool_fontDecoration").addClass("active");
            else
                Z("#tool_fontDecoration").removeClass("active");
            // 对齐
            Z('#tool_fontAlign .textAlign-btn')[0].className = 'textAlign-btn ' + textAlign;
        } else {
            Z('.tool-textList.tool-groupList').hide();
            // Z('#tool_opacity').hide();
        }
        // 颜色按钮状态
        EditBtnTool.resetColorToolBtn();
        // 文字类型、大小按钮状态
        EditBtnTool.resetFontToolBtn();
        // 锁定按钮状态
        EditBtnTool.resetLockToolBtn();
    }
    // 属性状态--锁定按钮
    static resetLockToolBtn() {
        if (Z('#tool_lock').isHide())
            return;

        let $lockBtn = Z('#tool_lock');
        let $iconFont = $lockBtn.find('.iconfont');
        let locked = true, i, material;

        // 查看所有素材状态
        for (let i = 0;i < media.selectedList.length;i++) {
            material = media.tool.getCurMaterial(i);
            if (material.status !== 3){
                locked = false;
                break;
            }
        }

        // 依状态显示按钮
        if (locked) {
            media.tool.$toolsWrapLeft.addClass("eventDisable");
            $lockBtn.removeClass("eventDisable").siblings().addClass("eventDisable");
            $iconFont.removeClass('icon-unlock').addClass('icon-lock').addClass('z-text-orange');
        } else {
            media.tool.$toolsWrapLeft.removeClass("eventDisable");
            $lockBtn.parent().find('.tool-item').removeClass("eventDisable");
            $iconFont.removeClass('icon-lock').removeClass('z-text-orange').addClass('icon-unlock');
        }
    }
    // 遍历所有按钮，显示预设的显示按钮
    static showDefaultTools(typeName, childType) {
        let $$tools = document.querySelectorAll('#toolbar_tollsWrap>.toolsWrap>div');
        let listClass = 'tool-' + typeName + 'List';
        let toolsList = Const.toolBarObjList[typeName];
        childType = childType || '';
        toolsList = childType ? toolsList[childType]: toolsList;

        // 循环每一个按钮
        for (let $itemTool of $$tools) {
            if (Z($itemTool).hasClass(listClass) || toolsList.indexOf($itemTool.id) > -1)
                Z($itemTool).show();
            else
                Z($itemTool).hide();
        }
        // 插入类型到 toolbar_tollsWrap
        media.tool.$toolsWrap.attr('data-targetType',typeName).attr('data-second',childType);
    }
    // 属性状态--颜色按钮
    static resetColorToolBtn() {
        // 主方法
        let $colorBtn = Z('#tool_svgColor');
        if ($colorBtn.isHide() || media.selectedList.length === 0)
            return;

        let firstMaterial = media.tool.getCurMaterial(0);
        let $firstElem = media.tool.getSvgElementByMid(firstMaterial.mid);
        let secondType = media.tool.$toolsWrap.attr('data-second');
        let pathColor;

        // 1：循环遍历存在颜色属性的节点 [fill]
        if (secondType === 'shape-line'){
            pathColor = $firstElem.querySelector('line').getAttribute('stroke');
        } else {
            let $$svg = Z($firstElem.querySelector('g')).children('svg');
            let $svg = $$svg[$$svg.length - 1];
            let $$fill = $svg.querySelectorAll('[fill]');
            for (let $path of $$fill) {
                if ($path.hasAttribute('opacity') && $path.getAttribute('opacity') !== '1')
                    continue;
                pathColor = $path.getAttribute('fill');
                if (pathColor !== "rgba(0,0,0,0)")
                    break;
            }
        }
        if (!pathColor)
            $colorBtn.hide();
        else if (pathColor.toLowerCase() === 'none')
            $colorBtn.addClass('bgTransparent').show();
        else
            $colorBtn.css('backgroundColor', pathColor).removeClass("bgTransparent").show();

        // 2：添加 data-targetType 属性，指定颜色对应素材类型
        let dataType;
        if (media.selectedList.length > 1) {
            dataType = 'groupColor';
        } else {
            let materialType = parseFloat(firstMaterial.targetType);
            if (materialType === 1) {
                dataType = 'textColor';
            } else if (materialType === 5) {
                switch (secondType) {
                    case 'shape-line': dataType = 'lineFill'; break;
                    case 'shape-rect': dataType = 'rectFill'; break;
                    case 'shape-rectStroke': dataType = 'rectStrokeFill'; break;
                    case 'shape-ellipse': dataType = 'ellipseFill'; break;
                    case 'shape-pen': dataType = 'penFill'; break;
                    case 'shape-table': dataType = 'tableText'; break;
                }
            }
        }
        $colorBtn.attr('data-targetType', dataType);
    }
    // 属性状态--文字类型/文字大小状态
    static resetFontToolBtn() {
        if (Z('#tool_fontFamily').isHide() || Z('#tool_fontSize').isHide())
            return;

        let firstMaterial = media.tool.getCurMaterial(0);
        EditBtnTool.setFontSelectVal(firstMaterial.fontFamily, 'tool_fontFamily');
        EditBtnTool.setFontSelectVal(firstMaterial.fontSize, 'tool_fontSize');
    }
    // 获取 svg 内可设置的颜色属性，插入颜色替换按钮
    static insertColorBtn(maxLength) {
        maxLength = Math.abs(Z.T.isNumber(maxLength) ? maxLength : 8);
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        let $insertWrap = Z('#tool_insertAttr');
        let $$colorBtn = Z('#tool_insertAttr > [id^="tool_svgColor_"]');
        let $$colorPath = $curElem.querySelectorAll("[fill]");
        for (let $colorBtn of $$colorBtn)
            $insertWrap[0].removeChild($colorBtn);

        let listLength = $$colorPath.length;
        let valReg = /^(#[\da-f][\da-f][\da-f]([\da-f][\da-f][\da-f])?)|(rgba?\(\d+,\d+,\d+(,1)?\))$/;

        let getBtnStr = (index, color, text)=> {
            return '<div id="tool_svgColor_' + index + '" style="background-color:' + color + ';" class="tool-item tool-colorPicker" ' +
                'data-targetType="svgFill" data-text="'+ text +'" onclick="ColorPicker.show(event);"></div>';
        };
        let insertPicker = (pickerIndex, bgColor)=> {
            let indexArr = ('' + pickerIndex).split('_');
            let indexLength = indexArr.length;
            if (indexLength > 1 && indexLength > maxLength) {
                let startIndex = parseInt(pickerIndex);
                let endIndex = /_\d+$/.exec(pickerIndex)[0];
                pickerIndex = startIndex + endIndex;
                let $btn = getBtnStr(pickerIndex, bgColor, '颜色');
                $insertWrap.append(Z($btn));
            } else {
                for (let index of indexArr) {
                    let $btn = getBtnStr(index, bgColor, '颜色');
                    $insertWrap.append(Z($btn));
                }
            }
        };
        let baseColor, iStr, firstColor;
        for (let i = 0;i < listLength;i++) {
            if ($$colorPath[i].hasAttribute('opacity') && $$colorPath[i].getAttribute('opacity') !== '1')
                continue;
            let pathColor = $$colorPath[i].getAttribute("fill").toLowerCase();

            if (!valReg.test(pathColor.toLowerCase()))
                continue;

            if (!firstColor)
                firstColor = pathColor;
            if (!baseColor) {
                baseColor = pathColor;
                iStr = i;
                if (i === listLength - 1)
                    insertPicker(iStr, baseColor);
                continue;
            }
            // 相邻、相同颜色，合并
            if (baseColor === pathColor) {
                iStr += '_' + i;
                if (i === listLength - 1)
                    insertPicker(iStr, baseColor);
                continue;
            }
            insertPicker(iStr, baseColor);

            if (i === listLength - 1) {
                insertPicker(i, pathColor);
            } else {
                baseColor = pathColor;
                iStr = i;
            }
        }

        // 判断所有按钮
        let $$picker = $insertWrap.find('[id^=tool_svgColor_]');
        if ($$picker.length > 1) {
            let $btn = getBtnStr('all', firstColor, '全部') +
                '<div id="tool_svgColor_space" class="z-float-left z-h30 z-mg-t8 z-mg-l3 z-mg-r5 z-bg-gray-deep z-event-none" style="width:2px;"></div>';
            $btn += '<div id="tool_svgColor_switch" class="z-float-left z-mg-t6 z-mg-r3">' +
                '   <a class="z-show-b z-lh16 z-px12" href="javascript:;" onclick="EditBtnTool.insertColorBtn(0);">合并</a>' +
                '   <a class="z-show-b z-lh16 z-px12" href="javascript:;" onclick="EditBtnTool.insertColorBtn(10000);">全显</a>' +
                '</div>' +
                '<div id="tool_svgColor_space2" class="z-float-left z-h30 z-mg-t8 z-mg-l3 z-mg-r5 z-bg-gray-deep z-event-none" style="width:2px;"></div>';
            $insertWrap[0].insertAdjacentHTML('afterbegin', $btn);
        }
    }
    // 显示特殊位置按钮
    static setPoxBoxSpecialBtn() {
        // 1：取得对应索引值
        let isActive = function(a, b) {
            return Math.abs(a - b) < deviation;
        };
        let canvasRect = media.tool.$canvasBg.getBoundingClientRect();
        let targetRect = SelectionTool.getSelectedElemRect();
        let xIndex = -1 , yIndex = -1;
        let deviation = 2;
        if (isActive(canvasRect.left, targetRect.left))
            xIndex = 0;
        if (isActive(canvasRect.left + canvasRect.width / 2, targetRect.left + targetRect.width / 2))
            xIndex = 1;
        if (isActive(canvasRect.right, targetRect.right))
            xIndex = 2;
        if (isActive(canvasRect.top, targetRect.top))
            yIndex = 0;
        if (isActive(canvasRect.top + canvasRect.height / 2, targetRect.top + targetRect.height / 2))
            yIndex = 1;
        if (isActive(canvasRect.top + canvasRect.height, targetRect.top + targetRect.height))
            yIndex = 2;

        // 2：赋值特定按钮
        let $xBtns = Z("#material_pos_box > .sizeeditor:nth-child(1) > .setLocAlign>span");
        let $yBtns = Z("#material_pos_box > .sizeeditor:nth-child(2) > .setLocAlign>span");
        $xBtns.removeClass('active');
        $yBtns.removeClass('active');
        // 赋值特定按钮
        if (xIndex > -1)
            Z($xBtns[xIndex]).addClass("active");
        if (yIndex > -1)
            Z($yBtns[yIndex]).addClass("active");
    }
    // 文字特效颜色,显示编辑
    static showSpecialColorPicker(textSpecial, mid) {
        let $firstElem = media.tool.getSvgElementByMid(mid);
        let $specialColor = $firstElem.querySelectorAll('[data-textspecialcolor]');
        let $textSpecialColor = Z('#textSpecial_box .textSpecialMore-item.item-pickerList');
        let $pickerList = Z('#textSpecial_pickerList').html('');
        let colorLength = $specialColor.length;
        if (colorLength > 0) {
            let pickerStr = '<div class="tool-colorPicker" data-targetType="' + textSpecial + '" ' +
                'onclick="ColorPicker.show(event);"></div>';
            $textSpecialColor.addClass('active');
            for (let i = 0;i < colorLength;i++) {
                let $picker = Z(pickerStr);
                $pickerList.append($picker);
                $picker.attr('id', 'textSpecialColorPicker_' + i);
                $picker.css('background-color', $specialColor[i].getAttribute('data-textspecialcolor'));
            }
        } else {
            $textSpecialColor.removeClass('active');
        }
    }
    // 文字特效大小,显示编辑
    static showTextSpecialSize(textSpecial, mid) {
        let $textSpecialSize = Z('#textSpecial_box .textSpecialMore-item.item-sizeRange');
        let $range = Z.D.id('textSpecial_sizeRange');
        let $btn = Z($range).find('.z-pointer');
        $range.textSpecial = textSpecial;
        $textSpecialSize.addClass('active');

        mid = parseInt(mid);
        let $curElem = media.tool.getSvgElementByMid(mid);
        let material = media.tool.getMaterialByMid(mid);
        let $$svg = Z($curElem).children('g').children('svg');
        let listLength = $$svg.length;
        let setLeft = 0;
        switch (textSpecial) {
            case 'stroke-1':{ // 文字特效：描边1
                if (listLength !== 2)
                    break;
                let strokeWidth = parseFloat($$svg[0].getAttribute('stroke-width'));
                let fontSize = material.fontSize;
                if (parseFloat({}.createMode) === 1)
                    fontSize = Exchange.px2pt(fontSize);
                let sysStroke = 30/20 * fontSize;
                setLeft = strokeWidth / sysStroke * 100 + '%';
            } break;
            default:
                $textSpecialSize.removeClass('active');
                $btn.css('left', 0);
                return;
        }
        $btn.css('left', setLeft);
    }
    // 设置字体大小/类型，不触发change
    static setFontSelectVal(value, wrapId) {
        let $wrap = wrapId.charAt(0) === '#' ? Z(wrapId) : Z('#' + wrapId);
        let isFamily = /fontFamily$/.test(wrapId);
        value = (value + "").replace(/'|"/g,"");
        if (!isFamily)
            value = Math.round(value);

        // 辅助输入框
        let $input = $wrap.find('.fontSet_inputWrap > .z-input');
        $input.val(isFamily ? "" : value);
        $input.attr("placeholder", Const.subStr(value, 14));

        // 取得下拉列表 dropDown
        let $dropDown = $wrap.find(".z-dropdown");
        let $default = $dropDown.children(".z-default");
        let $list = $dropDown.children(".z-list>span");
        let $selectedSpan = $dropDown.find('.z-list > span.z-selected');
        let $shouldSpan = $dropDown.find('.z-list > span[value="' + value + '"]');
        if (isFamily) {
            $default.attr("value", value).text(value);
        } else {
            value = parseFloat(value);
            if (Math.round(value) !== value)
                value = 0;
            $wrap.find('select').val(value);
        }

        // 赋值 dropDown
        $default.html(value);
        $default.attr("value",value);
        $list.removeAttr("selected");
        $selectedSpan.removeClass('z-selected');
        $shouldSpan.addClass('z-selected');
    }
    // 隐藏工具
    static hideToolbar() {
        media.tool.$toolbar.removeClass('active');
        // tempCurrent 重置为空
        media.tool.setTempCurrent();
    }
    // 赋值矩形的圆角编辑框
    static showRectRadiusValue(onlyMore) {
        let $radiusBox = Z.D.id('radiusRange_box');
        let $mainRadius = Z($radiusBox).children('.itemWrap');
        // 显示素材属性
        let $curElem = $radiusBox.targElement || media.tool.getCurSvgElement();
        let $svg = $curElem.querySelector("svg");
        let absX = Math.abs($svg.viewBox.baseVal.width+"");
        let absY = Math.abs($svg.viewBox.baseVal.height+"");
        let nw_r = $svg.querySelector("path.nw").getAttribute("data-radius");
        let ne_r = $svg.querySelector("path.ne").getAttribute("data-radius");
        let sw_r = $svg.querySelector("path.sw").getAttribute("data-radius");
        let se_r = $svg.querySelector("path.se").getAttribute("data-radius");
        let mL = Const.getMinNum([absX,absY])/2;
        //滑块位置、输入值
        let nw_per = Math.round(nw_r/mL * 100);
        let ne_per = Math.round(ne_r/mL * 100);
        let sw_per = Math.round(sw_r/mL * 100);
        let se_per = Math.round(se_r/mL * 100);
        if (!onlyMore){
            $mainRadius.find('.range>i').css("left", nw_per + "%");
            $mainRadius.find('.num>input').val(nw_per);
        }
        Z("#shapeRectRadius_nw>.range>i").css("left", nw_per + "%");
        Z("#shapeRectRadius_nw>.num>input").val(nw_per);
        Z("#shapeRectRadius_ne>.range>i").css("left", ne_per + "%");
        Z("#shapeRectRadius_ne>.num>input").val(ne_per);
        Z("#shapeRectRadius_sw>.range>i").css("left", sw_per + "%");
        Z("#shapeRectRadius_sw>.num>input").val(sw_per);
        Z("#shapeRectRadius_se>.range>i").css("left", se_per + "%");
        Z("#shapeRectRadius_se>.num>input").val(se_per);
    }
    // 隐藏文本编辑器
    static hideTextEditor() {
        // 移除“不可编辑”样式
        Z("#textEditorWrap").removeClass('z-event-none');
        // 隐藏富文本容器
        Z("#textEditorWrap,#textEditorInner,#textEditor").removeAttr("style");
    }
    // 弹窗显示通用方法
    static showMiniPopupBox(event, $popup) {
        EditBtnTool.docPopupReset(event);
        let $thisBtn = Z(Z.E.current(event));
        let setLeft = $thisBtn.offsetLeft() - 2;
        let setTop = $thisBtn.offsetTop() + $thisBtn.offsetHeight() + 9;

        // 计算和工具条的位置偏移，不超出工具条两端
        let toolBarRect = Z.D.id('toolbar').getBoundingClientRect();
        let popupRect = $popup.getBoundingClientRect();
        let maxLeft = setLeft + popupRect.width - toolBarRect.width;
        if (maxLeft > 0){
            setLeft -= maxLeft;
        }
        setLeft = setLeft > 0 ? setLeft : 0;
        // 设置位置
        Z($popup).css({"left": setLeft,"top": setTop});
    }
    // 页面所有弹窗，重置隐藏
    static docPopupReset(event) {
        Z.E.forbidden(event);
        Const.docPopupHide();
        //如果存在编辑的文本，则隐藏
        Const.textEditHide();
    }
    // 除颜色选择器以外的所有弹窗隐藏
    static docPopupHideExPicker() {
        Z(".rangeWrap").each(function($wrap){
            $wrap.isCanRange = $wrap.eleOldLeft = $wrap.mouseOldLocationt = null;
        });
        // 输入框失去焦点
        let activeEle = document.activeElement;
        if (activeEle.className.indexOf("fontSet_input") > -1){
            activeEle.blur();
        }
        // 右键菜单
        Z(".newContentMenu").hide();
    }
    // 文字列表的弹框隐藏事件
    static hideTextDropList($list) {
        // 1：颜色选择器
        if ($list) {
            let $colorPicker = Z('.fte-colorPicker')[0];
            if ($colorPicker.hasAttribute('style')){
                $colorPicker.removeAttribute('style');
            }
        }
        // 2：文字下拉列表隐藏
        let $ffDropDown = Z('#tool_fontFamily .z-dropdown .z-list');
        let $fsDropDown = Z('#tool_fontSize .z-dropdown .z-list');
        if ($list && !Z($list).isHide()){
            return;
        }
        if (!$ffDropDown.isHide() || !$fsDropDown.isHide()) {
            let evClick = new Event("click", {"bubbles":false, "cancelable":true});
            document.dispatchEvent(evClick);
        }
    }
    // 素材宽高比列锁定
    static switchSizeScaleLock(event) {
        let $lockWrap = Z(Z.E.target(event)).parent();
        let $sizeSet = $lockWrap.parent();
        let $widthInput = $sizeSet.find('.sizeSet-width .z-input');
        let $heightInput = $sizeSet.find('.sizeSet-height .z-input');
        if ($lockWrap.hasClass('active')){
            $lockWrap.removeClass('active');
            $lockWrap.removeAttr('data-scale');
        } else {
            $lockWrap.addClass('active');
            $lockWrap.attr('data-scale',parseFloat($widthInput.val()) / parseFloat($heightInput.val()));
        }
    }
    // 全选按钮
    static doGlobalSelect() {
        media.tool.doSelectedAll();
        SelectionTool.selectTheElement_group();
    }
    // 全部锁定按钮
    static doGlobalLock() {
        // 1：取消选中，清空选择列表
        EditBtnTool.hideEditSelected(true);

        // 2：循环锁定
        for (let material of media.materialList) {
            if (material.status !== 0)
                continue;
            material.status = 3;
        }

        // 3：提示
        Z.tips({text:'全部素材已锁定！',width:161});

        // 4：保存历史
        PrototypeHistory.saveHistory();
    }
    // 全部解锁按钮
    static doGlobalUnlock() {
        // 1：取消选中，清空选择列表
        EditBtnTool.hideEditSelected(true);

        // 2：循环解锁
        for (let material of media.materialList) {
            if (material.status !== 3)
                continue;
            material.status = 0;

            // 背景属性去除
            if (material.bgMaterial) {
                material.bgMaterial = false;
                let $curElem = media.tool.getSvgElementByMid(material.mid);
                $curElem.removeAttribute('data-bgmaterial');
            }
        }

        // 3：提示
        Z.tips({text:'全部素材已解锁！',width:161});

        // 4：刷新图层列表
        Const.loadLayerList();

        // 5：保存历史
        PrototypeHistory.saveHistory();
    }
    // 清空画布
    static doGlobalClear() {
        EditBtnTool.hideEditSelected(true);
        media.materialList = [];
        media.tool.$canvasMaterial.innerHTML = "";
        PrototypeHistory.saveHistory();
    }
    // 素材组编组
    static doGroupCreate() {
        // 创建唯一的 groupId
        let groupId = "group_" + new Date().getTime();

        // 处理每个已选中素材
        for (let i = 0;i < media.selectedList.length;i++){
            let theMaterial = media.tool.getCurMaterial(i);
            let $theElem = media.tool.getCurSvgElement(i);
            theMaterial.groupId = groupId;
            $theElem.setAttribute("data-groupid", groupId);
            //刷新数据保存
            ElementUpdate.updateMaterialSource(theMaterial, $theElem);
        }
        // 显示打散按钮
        Z('#tool_groupSet').hide();
        Z('#tool_groupBreak').show();
        // 保存历史记录
        PrototypeHistory.saveHistory();
    }
    // 素材组打散
    static doGroupBreak() {
        //处理每个已选中素材
        for (let i = 0;i < media.selectedList.length;i++){
            let theMaterial = media.tool.getCurMaterial(i);
            let $theElem = media.tool.getCurSvgElement(i);
            theMaterial.groupId = null;
            $theElem.removeAttribute("data-groupid");
            //刷新数据保存
            ElementUpdate.updateMaterialSource(theMaterial, $theElem);
        }
        // 显示群组按钮
        Z('#tool_groupSet').show();
        Z('#tool_groupBreak').hide();
        // 保存历史记录
        PrototypeHistory.saveHistory();
    }
    // 显示位置设置框
    static showMaterialPosBox(event) {
        // 主方法
        // 1：定位输入框
        EditBtnTool.showMiniPopupBox(event, Z.D.id("material_pos_box"));

        // 2：设置输入框的值
        MediaListen.setPoxBoxValueInput();

        // 3：判断是否是特殊位置
        EditBtnTool.setPoxBoxSpecialBtn();

        // 4：针对素材组特殊处理
        SelectionTool.saveGroupElemData();
    }
    // 显示素材尺寸设置
    static showItemSizeBox(event) {
        // 主方法
        // {}.createMode = parseFloat({}.createMode);
        let $posBox = Z('#svg_sizeSet_box');
        let $lockWrap = $posBox.find('.scaleLockWrap');
        let materialType = media.tool.$toolsWrap.attr('data-targetType');
        let secondType = media.tool.$toolsWrap.attr('data-second');
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        let $gWrap = $curElem.querySelector('g');
        let $svg = [...$gWrap.children].pop();

        // 1：定位输入框
        EditBtnTool.showMiniPopupBox(event, $posBox[0]);

        // 2：修改弹窗显示的值
        let typeObj = Const.svgTypeToName[materialType];
        // 标题
        if (secondType){
            typeObj = typeObj[secondType];
        }
        let boxTitle = typeObj.name || '素材';
        boxTitle += '设置';
        // 输入框名称
        let widthName = typeObj.width || '宽度';
        let heightName = typeObj.height || '高度';
        // 设置
        $posBox.find('.sizeSet-title').html(boxTitle);
        $posBox.find('.sizeSet-width > .sizeSet-name').html(widthName);
        $posBox.find('.sizeSet-height > .sizeSet-name').html(heightName);

        // 3：赋值输入框
        let svgWidth = $svg.width.baseVal.value;
        let svgHeight = $svg.height.baseVal.value;
        if (secondType === 'shape-line') {
            let $line = $curElem.querySelector("svg>g>line");
            svgWidth = $line.getAttribute("x2");
            svgHeight = $line.getAttribute("stroke-width");
        }
        if({}.createMode === 0) {//像素转毫米
            svgWidth = Exchange.px2mm(svgWidth, {}.dpi);
            svgHeight = Exchange.px2mm(svgHeight, {}.dpi);
        }
        Z('#svgSize_width').val(svgWidth);
        Z('#svgSize_height').val(svgHeight);

        // 4：锁定缩放更新
        $lockWrap.attr('data-scale', svgWidth / svgHeight + '');
        if (secondType === "shape-table")
            $lockWrap.addClass("active eventNone");
        else
            $lockWrap.removeClass("eventNone");

    }
    // 显示文字对齐选择框
    static showTextAlignBox(event) {
        // 主方法
        let $txtAlignBox = Z.D.id('textAlign_box');
        // 1：定位对齐按钮选择框
        EditBtnTool.showMiniPopupBox(event, $txtAlignBox);
        // 2：设置当前的对齐方式为选中
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let textAlign = (material && material.textAlign) || "left";
        if (material.targetType === 5) {
            let $activeElem = document.activeElement;
            if ($activeElem.className.includes("tableText-editArea"))
                textAlign = $activeElem.style.textAlign;
        }
        Z($txtAlignBox).children("."+ textAlign).addClass("active").siblings(".textAlign_box_btn").removeClass("active");
    }
    // 显示文字竖版编辑框
    static showTextVerticalBox(event) {
        // 主方法，定义变量
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem)
            return;

        let $verticalBox = Z.D.id('textVertical_box');
        // 1：定位编辑框
        EditBtnTool.showMiniPopupBox(event, $verticalBox);
    }
    // 显示文字字距编辑框
    static showTextSpacingBox(event) {
        // 主方法，定义变量
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem){
            return;
        }
        let $svg = [...$curElem.querySelector('g').children].pop();
        if ($svg.getAttribute("data-targetType") === "shape-table")
            $svg = $curElem.querySelector("svg:first-child");
        let $firstLine = $svg.children[0];
        let $$paths = $svg.querySelectorAll("g.font-path");

        // 1：定位编辑框
        EditBtnTool.showMiniPopupBox(event, $spacingBox);

        // 2：计算字间距的极值
        let wordsWidth = [];
        for (let i = 0;i < $$paths.length;i++) {
            let itemWidth = parseFloat($$paths[i].getAttribute("data-width") || 0);
            if (itemWidth < 0) {
                continue;
            }
            wordsWidth.push(itemWidth);
        }
        let textFont = material.fontSize;
        if (parseFloat({}.createMode) === 0) {
            textFont = Exchange.pt2px(textFont);
        }
        wordsWidth.push(textFont);
        let rangeMin = Const.getMinNum(wordsWidth);

        // 3：绑定属性
        let $spacingBox = Z.D.id('textSpacing_box');
        let $letterSpacing = Z.D.id("textLetterSpacing");
        $spacingBox.targMaterial = material;
        $spacingBox.targElement = $curElem;
        $letterSpacing.rangeLimitWidth = rangeMin;

        // 4：得到字间距，滑块偏移量
        let spacingRange = parseFloat(material.letterSpacing);
        if (spacingRange <= 0) {
            spacingRange = (rangeMin + spacingRange) / (rangeMin * 2) * 100;
        } else {
            spacingRange = 50 + spacingRange / 4;
        }
        spacingRange += "%";

        // 5：赋值
        Z($letterSpacing).find('.range>i').css("left", spacingRange);
        Z("#textLetterSpacing").find('.num>input').val(material.letterSpacing);
        Z("#textLineHeight").find('.num>input').val(material.lineHeight);
        Z("#textLineHeight").find('.range>i').css("left", material.lineHeight / 10  + "%");
        // 两端对齐的情况，字间距不能设置
        if (Boolean(parseFloat($firstLine.getAttribute('data-justify')))){
            Z('#textLetterSpacing').addClass('eventDisable');
        } else {
            Z('#textLetterSpacing').removeClass('eventDisable');
        }
    }
    // 显示文字特效编辑框
    static showTextSpecialBox(event) {
        // 1：定义变量
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem){
            return;
        }
        let $strokeBox = Z.D.id('textSpecial_box');

        // 2：定位编辑框
        EditBtnTool.showMiniPopupBox(event, $strokeBox);

        // 3：显示颜色选择器
        EditBtnTool.showSpecialColorPicker(material.textSpecial, material.mid);

        // 4：显示大小滑块
        EditBtnTool.showTextSpecialSize(material.textSpecial, material.mid);
    }
    // 切换文字加粗
    static changeMaterialWeight() {
        // 主方法，定义变量
        let $btn = Z.D.id('tool_fontWeight');
        let selectedLength = media.selectedList.length;
        if (selectedLength === 0) {
            return;
        }
        let isActive = Z($btn).hasClass('active');
        Z($btn).toggleClass('active');
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();

        // 1：判断是否是编辑器操作
        let activeEle = document.activeElement;
        let activeTag = activeEle.tagName.toLowerCase();
        if (material.targetType === 1) {
            if (activeTag === "texter") {
                let sl = window.getSelection();
                let selectAll = Const.isSelectAll();
                let material = media.tool.tempMaterial || media.tool.getCurMaterial();
                if (!sl.isCollapsed && !selectAll) {
                    // 设置选取索引
                    Const.setSlIndex(material);
                } else {
                    if (isActive)
                        material.fontWeight = 0;
                    else
                        material.fontWeight = 1;
                    // 修改预览
                    Z(activeEle).focus();
                    document.execCommand("selectAll");
                }
                document.execCommand("bold", false);
            } else {
                let updateFontSet_loader;
                let finishedNum = 0;
                // 1：显示加载框
                if (selectedLength > 2){
                    updateFontSet_loader = Z.loading({
                        shadow: true,
                        text:"正在加载..."
                    });
                }
                // 2：循环处理
                for (let i = 0;i < selectedLength;i++) {
                    let material = media.tool.getCurMaterial(i);
                    let $curElem = media.tool.getCurSvgElement(i);
                    // 取消加粗状态
                    if (isActive) {
                        material.fontWeight = 0;
                        $curElem.setAttribute("data-fontweight",0);
                    } else {// 添加加粗状态
                        material.fontWeight = 1;
                        $curElem.setAttribute("data-fontweight",1);
                    }
                    // 如果存在wordsList
                    if (material.wordsList) {
                        for (let word of material.wordsList) {
                            word.fontWeight = material.fontWeight;
                        }
                        //判断是否是特殊文字
                        ElementUpdate.setTextMaterialData(material, $curElem);
                    }
                    // 绘制文字
                    MaterialTool.getPathAjax(material, $curElem, 1, 1, (material, $curElem)=> {
                        finishedNum++;
                        ElementUpdate.allTextPathDoneCheck(material, $curElem, finishedNum, updateFontSet_loader);
                    });
                }
            }
        } else if (material.targetType === 5) {
            let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
            let $svg = $curElem.querySelector("svg");
            let dataType = $svg.getAttribute("data-targetType");
            if (dataType !== "shape-table")
                return;
            if (activeEle.className.includes("tableText-editArea")){
                if (isActive)
                    activeEle.style.fontWeight = "normal";
                else
                    activeEle.style.fontWeight = "bold";
            } else {
                ElementUpdate.changeTableMaterialFontSet(isActive ? 0 : 1, "fontWeight");
            }
        }
    }
    // 切换文字斜体
    static changeMaterialItalic() {
        // 主方法，定义变量
        let $btn = Z.D.id('tool_fontStyle');
        let selectedLength = media.selectedList.length;
        if (selectedLength === 0) {
            return;
        }
        let isActive = Z($btn).hasClass('active');
        Z($btn).toggleClass('active');
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();

        // 1：判断是否是编辑器操作
        let activeEle = document.activeElement;
        let activeTag = activeEle.tagName.toLowerCase();
        if (material.targetType === 1) {
            if (activeTag === "texter") {
                let sl = window.getSelection();
                let selectAll = Const.isSelectAll();

                if (!sl.isCollapsed && !selectAll) {// 局部选中处理
                    Const.setSlIndex(material);// 设置选取索引
                } else {// 全选处理
                    if (isActive)
                        material.fontItalic = 0;
                    else
                        material.fontItalic = 1;
                    //修改预览
                    Z(activeEle).focus();
                    document.execCommand("selectAll");
                }
                document.execCommand("italic", false);
            } else {
                // 1：循环处理
                for (let i = 0;i < selectedLength;i++) {
                    let material = media.tool.getCurMaterial(i);
                    let $curElem = media.tool.getCurSvgElement(i);
                    if (isActive) {
                        ElementUpdate.cancelTextItalic(material, $curElem);
                    } else {
                        ElementUpdate.setTextItalic(material, $curElem);
                    }
                    // 刷新 source
                    ElementUpdate.updateMaterialSource(material, $curElem);
                }
                // 2：选择框定位，保存
                SelectionTool.selectTheElement_group();
                PrototypeHistory.saveHistory();
            }
        } else if (material.targetType === 5) {
            let $svg = $curElem.querySelector("svg");
            let dataType = $svg.getAttribute("data-targetType");
            if (dataType !== "shape-table")
                return;
            if (activeEle.className.includes("tableText-editArea")) {
                if (isActive)
                    activeEle.style.fontStyle = "normal";
                else
                    activeEle.style.fontStyle = "italic";
            } else {
                let $svgMain = $curElem.querySelector("g").querySelector("svg");
                let $$gTd = $svgMain.querySelectorAll("g[data-rowspan]");
                let setItalic = null;
                for (let i = 0;i < $$gTd.length;i++) {
                    let $gTd = $$gTd[i];
                    let $gText = $gTd.querySelector("g").querySelector("g");
                    if (isActive) {
                        $gText.removeAttribute("transform");
                        setItalic = 0;
                    } else {
                        $gText.setAttribute("transform", "skewX(-18)");
                        setItalic = 1;
                    }
                    $gTd.setAttribute("data-fontitalic", setItalic);
                    // 单元格大小/偏移校验
                    ElementUpdate.resetTdTextSizeTrans($gTd);
                }
            }
        }
    }
    // 切换文字下划线
    static changeMaterialUnderline() {
        // 主方法，定义变量
        let $btn = Z.D.id('tool_fontDecoration');
        let selectedLength = media.selectedList.length;
        if (selectedLength === 0) {
            return;
        }
        let isActive = Z($btn).hasClass('active');
        Z($btn).toggleClass('active');
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();

        // 1：判断是否是编辑器操作
        let activeEle = document.activeElement;
        let activeTag = activeEle.tagName.toLowerCase();
        if (material.targetType === 1) {
            if (activeTag === "texter") {
                material = media.tool.tempMaterial || media.tool.getCurMaterial();
                let sl = window.getSelection();
                let selectAll = Const.isSelectAll();
                // 局部选中操作
                if (!sl.isCollapsed && !selectAll) {
                    Const.setSlIndex(material); // 设置选取索引
                } else {//全选操作
                    if (isActive)
                        material.textDecoration = 0;
                    else
                        material.textDecoration = 1;
                    //修改预览
                    Z(activeEle).focus();
                    document.execCommand("selectAll");
                }
                document.execCommand("underline", false);
            } else {
                // 1：循环处理
                for (let i = 0;i < selectedLength;i++) {
                    let material = media.tool.getCurMaterial(i);
                    let $curElem = media.tool.getCurSvgElement(i);
                    if (isActive) {
                        ElementUpdate.cancelTextDecoration(material, $curElem);
                    } else {
                        ElementUpdate.setTextDecoration(material, $curElem);
                    }
                    // 刷新 source
                    ElementUpdate.updateMaterialSource(material, $curElem);
                }
                // 2：选择框定位，保存
                SelectionTool.selectTheElement_group();
                PrototypeHistory.saveHistory();
            }
        } else if (material.targetType === 5) {
            let $svg = $curElem.querySelector("svg");
            let dataType = $svg.getAttribute("data-targetType");
            if (dataType !== "shape-table")
                return;
            if (activeEle.className.includes("tableText-editArea")) {
                if (isActive)
                    activeEle.style.textDecoration = "none";
                else
                    activeEle.style.textDecoration = "underline";
            } else {
                let $svgMain = $curElem.querySelector("g").querySelector("svg");
                let $$gTd = $svgMain.querySelectorAll("g[data-rowspan]");
                for (let i = 0;i < $$gTd.length;i++) {
                    let $gTd = $$gTd[i];
                    let $svgText = $gTd.querySelector("svg");
                    let $textPath = $svgText.querySelector("path");
                    if (!$textPath)
                        continue;
                    let tdColor = $textPath.getAttribute("fill");
                    let underlineOffset = $svgText.getAttribute("data-underlineoffset");
                    let underlineThickness = $svgText.getAttribute("data-underlinethickness");
                    let $$gLine = $svgText.children;
                    for (let j = 0;j < $$gLine.length;j++) {
                        let $gLine = $$gLine[j];
                        if ($gLine.tagName.toLowerCase() !== "g")
                            continue;
                        let $line = $gLine.querySelector("line");
                        $gTd.setAttribute("data-textdecoration", "1");
                        if ($line) {
                            if (isActive){
                                $gTd.setAttribute("data-textdecoration", "0");
                                $gLine.removeChild($line);
                            }
                            continue;
                        }
                        let lineBox = $gLine.getBBox();
                        $line = document.createElementNS(Const.xmlns, "line");
                        $line.setAttribute("x1", lineBox.x);
                        $line.setAttribute("y1", underlineOffset);
                        $line.setAttribute("x2", lineBox.x + lineBox.width);
                        $line.setAttribute("y2", underlineOffset);
                        $line.setAttribute("stroke", tdColor);
                        $line.setAttribute("stroke-width", underlineThickness);
                        $gLine.appendChild($line);
                    }
                    // 单元格大小/偏移校验
                    ElementUpdate.resetTdTextSizeTrans($gTd);
                }
            }
        }
    }
    // 素材组的左对齐
    static groupAlignLeft() {
        if (media.selectedList.length <= 1) {
            return;
        }
        ElementUpdate.alignLocation('left');
    }
    // 素材组的右对齐
    static groupAlignRight() {
        if (media.selectedList.length <= 1) {
            return;
        }
        ElementUpdate.alignLocation('left_right');
    }
    // 素材组的顶对齐
    static groupAlignTop() {
        if (media.selectedList.length <= 1) {
            return;
        }
        ElementUpdate.alignLocation('top');
    }
    // 素材组的水平居中对齐
    static groupAlignCenter() {
        if (media.selectedList.length <= 1) {
            return;
        }
        ElementUpdate.alignByaxis("center")
    }
    // 素材组的垂直居中对齐
    static groupAlignMiddle() {
        if (media.selectedList.length <= 1) {
            return;
        }
        ElementUpdate.alignByaxis("middle");
    }
    // 素材组的底对齐
    static groupAlignBottom() {
        if (media.selectedList.length <= 1) {
            return;
        }
        ElementUpdate.alignLocation('top_bottom');
    }
    // 素材组的垂直等间距分布
    static groupDistributionVertical() {
        if (media.selectedList.length <= 1) {
            return;
        }
        EditBtnTool.groupDistribution('vertical');
    }
    // 等间隔分布
    static groupDistribution(attrType) {
        // 获得位置、id 数组
        let array_loc = [];                                                    //需要对齐的对象，距离的集合
        let workList = [];                                                     //用于计算排列的对象 mid
        let midList = Z.clone(media.selectedList);                             //选中列表的复制对象
        let removeList = [];

        // 1：得到素材数据
        for (let i = 0; i < midList.length; i++) {
            let tMid = midList[i];
            if (removeList.indexOf(tMid) >= 0) {                               //编组成员，跳过
                continue;
            }
            ElementUpdate.alignMultiActiveList (removeList, array_loc, workList, attrType, tMid);
        }
        if (array_loc.length <= 2) {
            return;
        }

        // 2：重排序数组
        for (let i = 0;i < array_loc.length - 1;i++) {
            for(let j = i + 1;j < array_loc.length;j++) {
                let preItem = Z.clone(array_loc[i]);
                let theItem = Z.clone(array_loc[j]);

                if(preItem.min <= theItem.min)
                    continue;
                // 前者大于后者，进行替换
                array_loc[j] = preItem;
                array_loc[i] = theItem;
                //workList
                let preMid = workList[i];
                let theMid = workList[j];
                workList[j] = preMid;
                workList[i] = theMid;
            }
        }

        // 3：按新数组排序，设置每个素材
        let rectArr = [];
        let locLength = array_loc.length;
        let minLoc = array_loc[0].min;
        let conRect = 0;
        for (let i = 0; i < locLength; i++) {
            rectArr.push(array_loc[i].max);
            conRect += array_loc[i].rect;
        }
        let wrapRect = Const.getMaxNum(rectArr) - minLoc;
        let space = (wrapRect - conRect) / (locLength - 1);

        let tempRect = 0;
        for (let i = 0;i < workList.length;i++)
        {
            let d = Math.round(minLoc + tempRect - array_loc[i].min);
            tempRect += array_loc[i].rect + space;
            if (d === 0) {
                continue;
            }
            ElementUpdate.setEachAlignLoc(workList[i], attrType, d);
        }

        // 4：保存历史
        PrototypeHistory.saveHistory();
        SelectionTool.selectionToolsShow_group();
    }
    // 素材组的水平等间距分布
    static groupDistributionLevel() {
        if (media.selectedList.length <= 1) {
            return;
        }
        EditBtnTool.groupDistribution('level');
    }
    // 显示线条的虚线编辑框
    static showLineDashBox(event) {
        // 主方法，定义变量
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem){
            return;
        }
        let $lineDashBox = Z.D.id('shapeLine_dash_box');
        let $line = $curElem.querySelector("svg>g>line");
        let dashArray = $line.getAttribute("stroke-dasharray").split(" ");
        let dashVal1 = dashArray[0] || 1;
        let dashVal2 = dashArray[1] || 0;

        // 1：定位编辑框
        EditBtnTool.showMiniPopupBox(event, $lineDashBox);

        // 2：赋值
        Z("#shapeLine_dasharray1>.range>i").css("left", dashVal1/2 + "%");
        Z("#shapeLine_dasharray1>.num>input").val(dashVal1);
        Z("#shapeLine_dasharray2>.range>i").css("left", dashVal2/2 + "%");
        Z("#shapeLine_dasharray2>.num>input").val(dashVal2);
    }
    // 显示形状的边框设置
    static showShapeStrokeBox(event) {
        // 主方法，定义变量
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem){
            return;
        }
        let $shapeStrokeBox = Z.D.id('shape_stroke_box');
        let $svg = $curElem.querySelector("svg");
        let shapeType = $svg.getAttribute('data-targetType');
        // 1：定位编辑框
        EditBtnTool.showMiniPopupBox(event, $shapeStrokeBox);
        Z('#shape_stroke_box .shapeStrokeBox-item').hide();
        if (shapeType === 'shape-rectStroke' || shapeType === 'shape-table') {
            Z('#shape_stroke_box .item-strokeSize').show();
        } else if (shapeType === 'shape-ellipse'){
            Z('#shape_stroke_box .item-strokeColor,#shape_stroke_box .item-strokeRange').show();
        } else if (shapeType === 'shape-pen') {
            Z('#shape_stroke_box .item-strokeSize,#shape_stroke_box .item-strokeColor').show();
        }
        // 2：赋值
        let strokeWidth = 0;
        let strokeColor = '#ffffff';
        let strokeRangeNum = 0;
        let strokeRange = 0;
        let colorType = 'ellipseStroke';
        switch (shapeType) {
            case 'shape-rectStroke':
                strokeWidth = parseFloat($svg.getAttribute("data-rectstroke"));
                break;
            case 'shape-ellipse':
                let $ellipse = $curElem.querySelector("ellipse");
                strokeColor = $ellipse.getAttribute("stroke");
                let viewWidth = $svg.viewBox.baseVal.width;
                let viewHeight = $svg.viewBox.baseVal.height;
                let viewR = Const.getMinNum([viewWidth,viewHeight])/2;
                strokeRangeNum = parseFloat($ellipse.getAttribute("stroke-width"));
                strokeRangeNum = strokeRangeNum / viewR * 100;
                strokeRange = strokeRangeNum + "%";
                break;
            case 'shape-pen':
                let $path = $curElem.querySelector("path");
                strokeWidth = $path.getAttribute("stroke-width");
                strokeColor = $path.getAttribute("stroke");
                colorType = 'penStroke';
                break;
            case 'shape-table':
                let $line = $curElem.querySelector("line");
                strokeWidth = Math.round(parseFloat($line.getAttribute("stroke-width") || 0) * 100)/100;
                break;
        }
        Z("#shapeStroke_strokeSize").val(strokeWidth);
        Z("#shapeStroke_strokeColor").css("backgroundColor",strokeColor);
        Z("#shapeStroke_strokeRange>.num>input").val(strokeRangeNum);
        Z("#shapeStroke_strokeRange>.range>i").css("left", strokeRange);
        Z("#shapeStroke_strokeColor").attr('data-targetType', colorType);
    }
    // 图片/容器的裁剪
    static imageCutStart() {
        // 主方法，定义变量
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem){
            return;
        }

        // 1：显示剪切工具
        if (material.targetType === 0 || material.targetType === 2){
            media.event.showCutImage(material, $curElem);
        } else if (material.targetType === 4){
            media.event.showTrimFrameImg();
        }
    }
    // 显示图片/形状圆角设置
    static showCurElemRadiusBox() {
        // 主方法，定义变量
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem){
            return;
        }
        let $radiusBox = Z.D.id('radiusRange_box');
        let $svg = $curElem.querySelector("svg");
        let shapeType = $svg.getAttribute('data-targetType');
        if (material.targetType !== 0 && material.targetType !== 2 && material.targetType !== 5)
            return;

        if (material.targetType === 5)
            if (shapeType !== 'shape-rect' && shapeType !== 'shape-rectStroke' && shapeType !== 'shape-table')
                return;

        // 1：定位编辑框
        let $rectMore = Z('.radiusRange-shapeBox');
        EditBtnTool.showMiniPopupBox(event, $radiusBox);
        if (material.targetType === 5){
            $rectMore.show();
        } else {
            $rectMore.hide();
        }

        // 2：编辑框赋值
        $radiusBox.targMaterial = material;
        $radiusBox.targElement = $curElem;
        let $mainRadius = Z($radiusBox).children('.itemWrap');
        if (material.targetType === 5) {
            $mainRadius.attr('id', 'shapeRectRadius');
            EditBtnTool.showRectRadiusValue();
        } else {
            $mainRadius.attr('id', 'imageRadius');
            let $clipRect = Z($svg).find("defs>clipPath>rect")[0];
            let radius = ($clipRect) ? (parseInt($clipRect.getAttribute("rx"))) : (0);
            $mainRadius.find('.range>i').css("left", radius * 2 + "%");
            $mainRadius.find('.num>input').val(radius);
        }
    }
    // 切换素材锁定状态
    static switchMaterialLock(event) {
        // 主方法，定义变量
        let selectedLength = media.selectedList.length;
        if (selectedLength === 0) {
            return;
        }
        let $lockBtn = Z('#tool_lock');
        let type = 'doLock';
        if ($lockBtn.find('.icon-lock')[0]){
            type = 'unLock';
        }
        // 1：执行操作，循环处理
        for (let i = 0;i < selectedLength;i++) {
            let material = media.tool.getCurMaterial(i);
            // 执行解锁
            if (type === 'unLock')
                MaterialTool.unlockMaterial(event, material, media.tool.getCurSvgElement(i));
            // 执行锁定
            else
                MaterialTool.doLockMaterial(event, material);
        }
        // 2：更新保存
        PrototypeHistory.saveHistory();
    }
    // 显示翻转编辑框
    static showReversalBox(event) {
        // 主方法，定义变量
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem){
            return;
        }
        let $reversalBox = Z.D.id('setReversal_box');
        // 1：定位编辑框
        EditBtnTool.showMiniPopupBox(event, $reversalBox);
    }
    // 显示排序编辑框
    static showSortBox() {
        // 主方法，定义变量
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem){
            return;
        }
        let $reversalBox = Z.D.id('sort_box');
        // 1：定位编辑框
        EditBtnTool.showMiniPopupBox(event, $reversalBox);
    }
    // 显示透明度编辑框
    static showOpacityRange() {
        // 主方法，定义变量
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem)
            return;

        let $reversalBox = Z.D.id('opacityRange');
        let $itemWrap = Z($reversalBox).children('.itemWrap');
        // 1：定位编辑框
        EditBtnTool.showMiniPopupBox(event, $reversalBox);
        // 2：属性绑定
        $reversalBox.targMaterial = material;
        $reversalBox.targElement = $curElem;

        // 3：赋值
        let opacity = 100;
        let transArr = [];
        for (let i = 0;i < media.selectedList.length;i++) {
            let $curElem = media.tool.getCurSvgElement(i);
            let showOpacity = parseFloat($curElem.getAttribute("fill-opacity")) || 1;
            transArr.push(Math.round(showOpacity * 100));
        }
        // 只有一个数据，或者都相等，则取其值
        if (transArr.length === 1 || Const.getMaxNum(transArr) === Const.getMinNum(transArr))
            opacity = transArr[0];
        // 显示当前素材透明比
        $itemWrap.find('.range>i').css("left", opacity + "%");
        $itemWrap.find('.num>input').val(opacity);
    }
    // 显示旋转角度编辑框
    static showRotateBox(event) {
        // 主方法，定义变量
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem){
            return;
        }
        let rotate = $curElem.transform.baseVal[1].angle;
        let $rotateBox = Z.D.id('rotateRange');
        let $input = Z($rotateBox).find('.num>input');

        // 1：定位编辑框
        EditBtnTool.showMiniPopupBox(event, $rotateBox);

        // 2：属性绑定
        $rotateBox.targMaterial = material;
        $rotateBox.targElement = $curElem;

        // 3：赋值
        $input.val(rotate);
    }
    // 显示更多圆角设置
    static shapeRectRadiusMoreShow(){
        Z("#radiusRange_box").addClass("showMore");
    }
    // 隐藏更多圆角设置
    static shapeRectRadiusMoreHide(){
        Z("#radiusRange_box").removeClass("showMore");
    }
    // 右键菜单，标签修改弹窗
    static editTagStart(elem) {
        Z("#tagContentMenu").hide();
        let svgId = Z(elem).attr("data-id");
        let keywords = Z(elem).attr("data-keyword");
        Z.prompt("修改标签", keywords, function(value) {
            var ajax = new Z.Ajax();
            ajax.setClassName("MediaPresenter");
            ajax.setMethodName("doAddMaterialKeywords");
            ajax.addParam("svgId", svgId);
            ajax.addParam("keywords", value);
            ajax.execute();
        });
    }
    // 设置文字竖版
    static doSetTextVertical(setType) {
        // 1：判断是否可编辑
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem)
            return;
        let verticalType = $curElem.getAttribute('data-textvertical') || 'normal';
        if (verticalType === setType)
            return;

        // 1：执行竖版操作
        ElementUpdate.setTextVerticalLine(setType, material, $curElem);

        // 2：缩放变换
        ElementUpdate.setTextZoom(null, material, $curElem);

        // 3：对齐
        if (setType === 'normal' && material.textAlign !== 'left')
            ElementUpdate.setElementAlign(material.textAlign, material, $curElem);

        // 4：选中素材
        SelectionTool.selectTheElement(material, $curElem);

        // 5：偏移校准
        Const.editOverSet($curElem);
    }
    // 显示尺寸设置框
    static showSizeSetBox(event) {
        // 1：显示编辑框
        let $thisBtn = Z(Z.E.current(event));
        EditBtnTool.removeAllEditTool();
        EditBtnTool.docPopupReset(event);
        Z("#canvas_size_box").css({
            "left" : $thisBtn.offsetLeftBody() - 2,
            "top" : $thisBtn.offsetTopBody() + $thisBtn.offsetHeight() + 2
        });
        // 2：赋值输入框
        let curBg = media.tool.getCurBg();
        let bleedSize = {}.bleedSize || 0;
        let widthValue = curBg.widthMm - bleedSize;
        let heightValue = curBg.heightMm - bleedSize;
        if ({}.createMode === 1) {
            widthValue = curBg.width - Exchange.mm2px(bleedSize);
            heightValue = curBg.height - Exchange.mm2px(bleedSize);
        }
        Z("#canvas_width").val(widthValue);
        Z("#canvas_height").val(heightValue);

        // 3：赋值锁定倍数
        Z('#canvas_size_box .scaleLockWrap').attr('data-scale', widthValue / heightValue);
    }
    // 显示保存类型列表
    static showMediaSaveList(event) {
        EditBtnTool.showTypeSelectList(event, "mediaSave_box");
    }
    // 显示下载类型列表
    static showDownloadList(event) {
        EditBtnTool.showTypeSelectList(event, "imageDownload_box");
    }
    // 显示类型列表
    static showTypeSelectList(event, id) {
        //去除编辑工具
        EditBtnTool.removeAllEditTool();

        EditBtnTool.docPopupReset(event);
        let $thisBtn = Z(Z.E.current(event));
        let $download_box = Z("#" + id);
        let left = $thisBtn.offsetLeftBody() - 2;
        let top = $thisBtn.offsetTopBody() + $thisBtn.offsetHeight() + 2;

        if (document.documentElement.offsetWidth - left < $download_box.offsetWidth()) {
            left = document.documentElement.offsetWidth - $download_box.offsetWidth();
        }
        //设置显示框位置
        $download_box.css({"left":left,"top":top});
    }
    // 隐藏弹窗、颜色选择器、下拉列表等
    static miniPopupHide() {
        Z(".miniPopup,.fte-colorPicker").removeAttr("style");
        Z(".z-dropdown .z-list").hide();
        Const.resolveUnexpectedError();
    }
    // 画布初始化，隐藏工具、编辑条、选择框
    static stageDefault() {
        // 去除编辑工具
        EditBtnTool.removeAllEditTool();
        // 选中隐藏
        EditBtnTool.hideEditSelected(true);
        // 刷新图层列表
        Const.loadLayerList();
    }
    // 隐藏选中
    static hideEditSelected(isClear) {
        isClear && media.tool.clearSelected();
        SelectionTool.selectionAll_hide(true);
        EditBtnTool.hideToolbar();
    }
    // 隐藏/清除编辑工具，包括容器剪切、图片剪切
    static removeAllEditTool() {
        // 侧边栏文字编辑
        Z("#sideTextEditor").removeClass('active');
        // 去除容器裁剪框
        EditBtnTool.frameBgDragClear();
        // 图片剪切取消
        EditBtnTool.cutImageToolHide();
        // 钢笔工具取消
        media.event.penDrawCancel();
        // 表格工具取消
        media.event.cancelTableElemEdit();
    }
    // 去除容器裁剪框
    static frameBgDragClear() {
        if (!Z("#imgFrameEditor")[0].hasAttribute("style")){
            return;
        }
        media.tool.setTempCurrent();
        Z("#imgFrameEditor").removeAttr("style");
    }
    // 剪切辅助框隐藏
    static cutImageToolHide() {
        if (!Z("#cutImageTool")[0].hasAttribute("style")){
            return;
        }
        // 清空临时变量
        media.tool.setTempCurrent();
        // 剪切工具复原
        Z("#cutImageTool, #cutToolRect, #cutImageTool img").removeAttr("style");
    }
}