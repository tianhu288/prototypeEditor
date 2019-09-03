/*!
 * const.js v1.5.0
 *
 * 全局常量、变量定义
 * 页面初始化载入、事件绑定
 *
 */


/********************************************
 ***********  定义页面全局变量  ***********
 ********************************************/
let prototypeModel = window.prototypeModel = null;   // 当前原型模型
let canvasModel = window.canvasModel = null;         // 当前原型画布对象
let screenList = window.screenList = null;           // 原型页面列表
let elementList = window.elementList = null;         // 原型元素列表
let screenModel = window.screenModel = null;         // 当前页面对象

/********************************************
 *********** 载入完成，初始化加载 ***********
 ********************************************/
Z.onload(()=> {
    // 项目类型判断
    Prototype.typeInit();

    // 数据库历史加载
    HistoryDB.init();

    // 画布加载
    CanvasEvent.init();

    // 操作面板加载
    PanelEvent.init();

    // 大文件上传初始化
    UploadImage.init();

    // 颜色选择器初始化
    ColorPicker.init();

    // 快捷键操作初始化
    ShortCutKey.init();
});




/********************************************
********** 常量/变量，页面基础操作 **********
********************************************/
class Const {
    // 获取鼠标位置信息
    static getMouseLocation(event) {//获取鼠标位置
        let mouseLocation = {};
        mouseLocation.x = Z.E.clientX(event);
        mouseLocation.y = Z.E.clientY(event);
        return mouseLocation;
    }
    // 获取鼠标相对距离
    static getFixedCoords(event, node, fixed){
        let nodeRect = Z(node)[0].getBoundingClientRect();
        let mouseLoc = Const.getMouseLocation(event);
        let x = mouseLoc.x;
        let y = mouseLoc.y;
        x = (x - nodeRect.left);
        y = (y - nodeRect.top);
        if (fixed) {
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x > nodeRect.width - 1) x = nodeRect.width - 1;
            if (y > nodeRect.height - 1) y = nodeRect.height - 1;
        }
        return {x: x, y: y};
    }
    // 所有弹窗隐藏
    static docPopupHide() {
        // 颜色选择器、透明度滑块、弹窗隐藏
        Z(".fte-colorPicker,.rangeWrap,.miniPopup").removeAttr("style");
        Z(".fte-colorPicker-dropperCover").removeClass("fte-active");
        EditBtnTool.docPopupHideExPicker();
    }
    // 遍历父节点，是否存在 class
    static hasClassParent($node,className) {
        let $pNode = Z($node)[0];
        if (className.charAt(0) === ".")
            className = className.substring(1);

        while ($pNode.tagName.toLowerCase() !== "body") {
            if (Z($pNode).hasClass(className)) {
                return true;
            }
            $pNode = $pNode.parentNode;
        }
        return false;
    }
    // 查找最近的匹配的class的父节点
    static closetParentByClass($node,className){
        let $pNode = $node;
        if (className.charAt(0) === ".")
            className = className.substring(1);

        while ($pNode.tagName.toLowerCase() !== "body") {
            if (Z($pNode).hasClass(className)) {
                return $pNode;
            }
            $pNode = $pNode.parentNode;
        }
        return null;
    }
    // 定位右键菜单
    static createContextMenu(itemsObj) {
        if (!itemsObj)
            return Z.alert("方法 Const.createContextMenu 的参数不存在！");
        if (!itemsObj.elemId)
            return Z.alert("方法 Const.createContextMenu 的 elemId 为空！");
        if (!itemsObj.editItem && !itemsObj.showItem)
            return Z.alert("方法 Const.createContextMenu的editItem 参数和 showItem 参数至少要存在一个！");
        if(itemsObj.event)
            Z.E.forbidden(itemsObj.event);
        Z(".newContentMenu").hide();
        let $shapeMenu = Z.D.id(itemsObj.elemId);
        if (!!$shapeMenu)
            Z($shapeMenu).remove();

        let shapeMenu = '<div id="'+itemsObj.elemId+'" class="newContentMenu">';
        if (itemsObj.editItem) {
            shapeMenu += '<ul>';
            for (let $editUl of itemsObj.editItem) {
                let $firstItem = $editUl[0];
                // 分割线
                if(!$firstItem) {
                    shapeMenu += '</ul><ul>';
                } else if (Z.T.isString($firstItem)) {
                    shapeMenu += '<li data-fun="'+ $editUl[1] +'">'+$editUl[0]+'</li>';
                } else if (typeof $firstItem === "object") {
                    shapeMenu += '<li class="newContentMenu-more">'+ $firstItem[0] +'<i></i><ul>';
                    for (let $firstInside of $editUl) {
                        if (!$firstInside[0])
                            shapeMenu += '</ul><ul>';
                        else
                            shapeMenu += '<li data-fun="'+ $firstInside[1] +'">' + $firstInside[0] + '</li>';
                    }
                    shapeMenu += '</ul></li>';
                }
            }
            shapeMenu += '</ul>';
        }
        shapeMenu += '</ul>';
        if (itemsObj.showItem) {
            shapeMenu += '<ul>';
            for (let item of itemsObj.showItem){
                shapeMenu += '<li>' + item + '</li>';
            }
            shapeMenu += '</ul>';
        }
        shapeMenu += '</div>';
        Z.D.id("sidebar").insertAdjacentHTML("beforeend",shapeMenu);

        /** 菜单列表事件 **/
        $shapeMenu = Z.D.id(itemsObj.elemId);
        Z($shapeMenu).on("contextmenu mousedown click",Z.E.forbidden);
        let itemArr = [];
        itemsObj.editItem.map(($item)=> $item.length>0 && itemArr.push($item));
        // 事件绑定
        Z($shapeMenu).find("li[data-fun]").each(function(item) {
            let fun = item.getAttribute('data-fun');
            if (!fun)
                return;
            item.removeAttribute('data-fun');
            if (fun.indexOf("(") > -1)
                item.setAttribute("onclick",fun);
            else
                Z(item).on("click",eval(fun));
            Z(item).on("click",function(){Z($shapeMenu).hide();});
        });
        Z($shapeMenu).css("left",itemsObj.event.pageX).css("top",itemsObj.event.pageY).show();
    }
    // 是否当前焦点对象是输入类型
    static isActiveInput() {
        let activeEle = document.activeElement;
        if (activeEle.hasAttribute("contenteditable")){
            if (activeEle.getAttribute("contenteditable") === "true") {
                return true;
            }
        }
        let tagName = activeEle.tagName.toLowerCase();
        let tagNameList = ["textarea"];
        if (tagNameList.includes(tagName))
            return true;

        if (tagName === "input"){
            let inputType = activeEle.type || "text";
            let inputTypeList = ["button", "checkbox", "color", "file", "hidden", "image", "radio", "range", "reset", "submit"];
            if (!inputTypeList.includes(inputType))
                return true;
        }
        return false;
    }
    // 获取字符串长度，中文算2个字符，英文1个
    static getLength(str) {
        let realLength = 0;
        for(let i = 0;i < str.length;i++) {
            let charCode = str.charCodeAt(i);
            if(charCode > 0 && charCode <= 128)
                realLength +=1;
            else
                realLength += 2;
        }
        return realLength;
    }
    // 获取字符串长度，包含中英文字符，中文字符算俩个，英文字符算一个
    static subStr(str, len, suffix) {
        //var suffix = suffix || "..."
        if(!str)
            return "";

        if (typeof(suffix) === "undefined")
            suffix = "...";
        let char_length = 0;
        for (let i = 0; i < str.length; i++)
        {
            let son_str = str.charCodeAt(i);
            (son_str>0 && son_str<=128)? char_length += 1: char_length += 2;
            if (char_length >= len) {
                return str.substr(0, i+1) + suffix;
            }
        }
        return str;
    }
    // 去除字符串的多空格结尾，仅保留一个空格
    static cutDoubleSpaceEnd(str) {
        while(/\s\s$/.test(str)){
            str = str.substring(0, str.length -1);
        }
        return str;
    }
    // 查找指定的父级
    static getClosestParent($node, target, limit) {
        limit = limit || "body";
        while ($node.tagName.toLowerCase() !== limit.toLowerCase()) {
            if ($node.tagName.toLowerCase() === target.toLowerCase()) {
                return $node;
            }
            $node = $node.parentNode;
        }
        return null;
    }
    // 获取当前浏览器DPI
    static getScreenDPI() {
        let arrDPI = new Array();
        let tmpNode = document.createElement("DIV");
        tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
        document.body.appendChild(tmpNode);
        arrDPI[0] = parseInt(tmpNode.offsetWidth);
        arrDPI[1] = parseInt(tmpNode.offsetHeight);
        tmpNode.parentNode.removeChild(tmpNode);
        return arrDPI;
    }
    // 判断富文本修改是否全选
    static isSelectAll() {
        let selection = window.getSelection();
        if (selection.isCollapsed) {
            return false;
        }
        let selectText = selection + "";
        let activeEle = document.activeElement;
        let editorText = Z(activeEle).text();
        return Z.S.trim(selectText) === Z.S.trim(editorText);
    }
    // 选择素材分类
    static doQueryCatMaterial(catCode, resultType, clickStr, menuStr) {
        let $wrap = Z("#" + resultType + "_result");
        let $resultUl = $wrap.find(".result-ul");
        let $resultTip = $wrap.find(".result-tips");
        let $resultPage = $wrap.find(".result-page");

        let wrapHeight = parseInt($wrap.offsetHeight());
        let liItemHeight = 84;
        fMaterial.pageSize = Math.round(wrapHeight / liItemHeight) * 3 + 6;

        if (catCode !== fMaterial.catCode) {
            fMaterial.catCode = catCode;
            fMaterial.page = 1;
            fMaterial.q = "";
            $resultUl.html("");
            $resultTip.hide();
        }

        let ajax = new Z.Ajax();
        ajax.setClassName("MediaPresenter");
        ajax.setMethodName("doQueryMaterial");
        ajax.addParam("typeCode", fMaterial.typeCode);
        ajax.addParam("catCode", catCode);
        ajax.addParam("q", fMaterial.q);
        ajax.addParam("page", fMaterial.page);
        ajax.addParam("pageSize", fMaterial.pageSize);
        ajax.setSuccess((response)=> {
            let obj = Z.J.toObject(response.responseText);
            let list = obj.result.records;
            let ulHtml = "<ul>";
            for (let i = 0;i < list.length;i++) {
                let data = list[i];
                ulHtml += '<li onclick="' + clickStr + '(' + data.svgId + ');"';
                if (menuStr)
                    ulHtml += ' oncontextmenu="' + menuStr + '(event,' + data.svgId + ');"';
                ulHtml += '><img src="' + data.svgThumbnail + '"></li>';
            }
            ulHtml += "</ul>";
            $resultUl.append(Z(ulHtml));

            fMaterial.totalPages = obj.result.totalPages;

            fMaterial.couldLoad = true;                               // 定义可加载列表
            if (fMaterial.page >= fMaterial.totalPages) {
                $resultTip.show();
                fMaterial.couldLoad = false;                          // 定义不可加载列表
            }
            // 显示页数
            let clientRect = Z("#image_result")[0].getBoundingClientRect();
            let setWidth = Z("#image_result").parent().offsetWidth();
            if (fMaterial.page === 1) {
                $resultPage.css("width",setWidth).css("top",clientRect.top).css("left",clientRect.left)
                    .children("span").html("1/" + fMaterial.totalPages);
            }
            // 去除加载框
            Const.loadingList.queryCatMaterial.$dialog.remove();
            Const.loadingList.queryCatMaterial.$shadow.remove();
            Const.loadingList.queryCatMaterial = null;
        });
        ajax.setLoading(function(){
            Const.loadingList.queryCatMaterial = Z.loading({target: $wrap.parent()[0], shadow: true});
            Const.loadingList.queryCatMaterial.$shadow.css("left", 0).css("top", 0);
        });
        ajax.execute();
    }
    // 切换工具栏
    static doChangeToolbar(ele, sidebarType) {
        Z(ele).addClass("active").siblings("li").removeClass("active");
    }
    // 素材列表右键菜单
    static tagMenuShow(event, svgId) {
        Z.E.forbidden(event);
        let ajax = new Z.Ajax();
        ajax.setClassName("MediaPresenter");
        ajax.setMethodName("getMediaSvg");
        ajax.addParam(svgId);
        ajax.setFailure((responseText)=> Z.failure(responseText));
        ajax.setSuccess((responseText)=> {
            let mediaSvg = Z.J.toObject(responseText);
            let keywords = mediaSvg.keywords;
            Const.createContextMenu({
                "event": event,
                "elemId": "tagEditMenu",
                "editItem": [
                    ["修改标签","EditBtnTool.editTagStart(this)"],
                ],
                "showItem": [
                    keywords,
                ],
            });
            Z("#tagEditMenu ul:nth-child(1)>li:first-child").attr("data-id",svgId);
            Z("#tagEditMenu ul:nth-child(1)>li:first-child").attr("data-keyword",keywords);
            Z("#tagEditMenu ul:nth-child(2)>li:first-child").html(keywords);
        });
        ajax.execute();
    }
    // 生成二维码
    static doCreateQrcode() {
        let ajax = new Z.Ajax();
        ajax.setClassName("MediaPresenter");
        ajax.setMethodName("doCreateQrcode");
        ajax.addParam("qrcodeText", Z("#qrcodeText").val());
        ajax.addParam("showLogo", Z("#showLogo").val());
        ajax.addParam("qrcodeData", Z("#qrcodeData").val());
        ajax.setSuccess((response)=> {
            let obj = Z.J.toObject(response.responseText);
            let fileUrl = obj.fileUrl;
            let fileId = obj.fileId;
            MaterialTool.newImage({source:fileUrl, type: 2, fileId: fileId});
            UploadImage.doRecordUpload('${mediaId}', fileId, 1);
        });
        ajax.setFailure((responseText)=> Z.failure(responseText));
        ajax.setLoading(document);
        ajax.execute();
    }
    // 自动识别二维码
    static doAutoQrcode(data) {
        if (!data.files || !data.files[0])
            return;
        let reader = new FileReader();//5.实例化一个FileReader()接口
        reader.readAsDataURL(data.files[0]);//6.通过readAsDataURL()方法读取文件，将图片内嵌在网页之中
        reader.onload = (event)=> {//7.调用FileReader()的onload事件，当文件读取成功时，执行8
            let ajax = new Z.Ajax();
            ajax.setClassName("MediaPresenter");
            ajax.setMethodName("doAutoQrcode");
            ajax.addParam("showLogo", data.value);
            ajax.addParam("qrcodeData", event.target.result);
            ajax.setSuccess((responseText)=> Z("#qrcodeText").val(responseText));
            ajax.setFailure((responseText)=> Z.failure(responseText));
            ajax.setLoading(document);
            ajax.execute();
        }
    }
    // 上传图片转base64
    static doTransforImage(data) {
        if (!data.files || !data.files[0])
            return;
        let reader = new FileReader();//5.实例化一个FileReader()接口
        reader.readAsDataURL(data.files[0]);//6.通过readAsDataURL()方法读取文件，将图片内嵌在网页之中
        reader.onload = function(event)
        {//7.调用FileReader()的onload事件，当文件读取成功时，执行8
            Z("#qrcodeData").val(event.target.result);
        }
    }
    // 获取对比对象
    static guideGetInfo(isAll) {
        // 1：定义变量
        // 第一个数组存放“竖列”（left、right），
        // 第二个数组存放“横行”（top、bottom），
        // 第三个数组存放对应的对象
        SelectionTool.allSvgElemInfo = [[],[],[]];

        // 2：记录其他素材的位置信息，添加到数组
        Z.each(Z("[id^=svgElementSon]"), ($elem)=> {
            let thisId = parseInt(Z($elem).attr("data-mid"));
            let $childRect = $elem.querySelector("rect");
            let thisRect = $elem.getBoundingClientRect();
            if ($childRect)
                thisRect = $childRect.getBoundingClientRect();

            // 是否是所有对象
            if (!isAll) {
                // 如果是当前选中对象，或是被删除、被隐藏、；则返回
                for (let i = 0;i < media.selectedList.length;i++)
                    if (thisId === media.tool.getCurMaterial(i).mid)
                        return;
            }
            SelectionTool.allSvgElemInfo[0].push(thisRect.left, thisRect.left + thisRect.width/2, thisRect.right);
            SelectionTool.allSvgElemInfo[1].push(thisRect.top, thisRect.top + thisRect.height/2, thisRect.bottom);
            SelectionTool.allSvgElemInfo[2].push($elem);
        });
    }
    // 对比数据，设置辅助线
    static guideSetInfo(deviation) {
        deviation = deviation || 6;
        // 记录当前对象的位置信息
        let elemInfo = [];
        let elemRect = Z("#selection_tool")[0].getBoundingClientRect();
        //“竖列”
        elemInfo.push(elemRect.left, elemRect.left + elemRect.width/2, elemRect.right);
        //“横行”
        elemInfo.push(elemRect.top, elemRect.top + elemRect.height/2, elemRect.bottom);

        // 辅助线设置之前，先移除，避免反复设置
        Z(".guide-line").remove();
        // 遍历6个参数，进行对比，找到最接近的值
        Z.each(elemInfo, (info, index)=> {
            let arr = (index < 3)?(SelectionTool.allSvgElemInfo[0]):(SelectionTool.allSvgElemInfo[1]);
            let cssStyle = (index < 3)?("left"):("top");
            SelectionTool.guideSetInfoAppend(info, arr, cssStyle, deviation, index);
        });
    }
    // 辅助线样式、插入
    static guideSetInfoAppend(info, arr, cssStyle, deviation, index) {
        // 1：定义变量
        let minusArr = arr.map(function(item) {
            return Math.abs(item - info)
        });
        let minMinus = deviation, minMinusIndex = 0;
        let showRatio = media.tool.showRatio;

        // 2：取出 minusArr 中最小值，及其索引
        minusArr.forEach((num, arrIndex)=> {
            if (num >= minMinus)
                return;
            minMinus = num;
            minMinusIndex = arrIndex;
        });

        // 3：差值不在显示范围，返回
        if (minMinus >= deviation)
            return;

        // 4：则显示虚线框
        // 4.1：定义变量
        let canvasRect = media.tool.$canvasSvg.getBoundingClientRect();
        let bgRect = media.tool.$canvasBg.getBoundingClientRect();
        let setGuideLoc = arr[minMinusIndex] - canvasRect[cssStyle];                                  // 对齐线的相对位置
        let guideBaseElem = SelectionTool.allSvgElemInfo[2][Math.floor(minMinusIndex / 3)];       // 后续可能有用，对比的对象素材

        // 4.2：计算素材位置
        let dataType = (cssStyle === "left")?("x"):("y");
        let shouldLoc = media.event.startData.targData[dataType] + media.event.doingData[dataType];
        shouldLoc *= showRatio;
        let toolRect = Z("#selection_tool")[0].getBoundingClientRect();
        let setToolLoc = setGuideLoc;                                   // 设置值
        switch (index) {
            case 0:                                                     // left
                break;
            case 1:                                                     // left + width/2
                setToolLoc -= toolRect.width / 2;
                break;
            case 2:                                                     // right
                setToolLoc -= toolRect.width;
                break;
            case 3:                                                     // top
                break;
            case 4:                                                     // top + width/2
                setToolLoc -= toolRect.height / 2;
                break;
            case 5:                                                     // bottom
                setToolLoc -= toolRect.height;
                break;
        }
        let styleSpace = bgRect[cssStyle] - canvasRect[cssStyle];
        let deSetLoc = setToolLoc - (shouldLoc + styleSpace);
        if (Math.abs(deSetLoc) > deviation)
            return;

        // 4.4：插入对齐辅助线
        let $guideElem = Z('<div class="guide-line z-absolute z-w100p z-h100p" style="border-style:dashed;border-color:#bbb;border-width:1px 1px 0 0"></div>');
        let guideStyle_left = (cssStyle === "left")?("top"):("left"), guideStyle_width = (cssStyle === "left")?("width"):("height");
        $guideElem.appendTo(Z("#selection_guide")).css(cssStyle, setGuideLoc).css(guideStyle_left, 0).css(guideStyle_width, 1);

        // 4.5：选择框定位
        Z("#selection_tool").css(cssStyle, setToolLoc);

        // 4.6：素材位移，通过选择框反算
        let setSvgLoc = (setToolLoc - styleSpace) / showRatio;
        if (media.selectedList.length === 1) {
            let curElem = media.tool.tempElement || media.tool.getCurSvgElement();
            let x = curElem.transform.baseVal[0].matrix.e;
            let y = curElem.transform.baseVal[0].matrix.f;
            if (cssStyle === "left") ElementUpdate.updateMaterialPos(setSvgLoc, y, i);
            if (cssStyle === "top") ElementUpdate.updateMaterialPos(x, setSvgLoc, i);
        } else {
            toolRect = Z("#selection_tool")[0].getBoundingClientRect();
            let deGroupSetX = (toolRect.left - canvasRect.left) / showRatio - media.event.startData.targData.x;
            let deGroupSetY = (toolRect.top - canvasRect.top) / showRatio - media.event.startData.targData.y;
            for (let elemData of media.event.startData.elemsData) {
                let mLeft = elemData.left + deGroupSetX;
                let mTop = elemData.top + deGroupSetY;
                let $elem = media.tool.getCurSvgElement(elemData.index);
                // 画布展示
                let trans = $elem.getAttribute("transform");
                trans = trans.replace(/translate\([^)]+\)/, 'translate(' + mLeft + ' ' + mTop + ')');
                $elem.setAttribute("transform",trans);
            }
        }
    }
    // 多素材，选中
    static selectTheElement_group() {
        if (media.selectedList.length === 0)
            return;
        // 单素材
        if (media.selectedList.length === 1)
            return SelectionTool.selectTheElement();
        // 显示工具栏
        SelectionTool.selectionToolsShow_group();
    }
    // 选中指定素材
    static selectTheElement(material, $curElem) {
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();
        if (!$curElem)
            return;
        material = material || media.tool.getMaterialByMid(parseInt(Z($curElem).attr("data-mid")));
        // 去除编辑工具
        EditBtnTool.removeAllEditTool();
        // 通常单个素材选中
        material.doSelected();
        // 记录对象数据
        media.event.startData.targData = media.tool.getEleData($curElem);
        // 设置tempCurrent
        media.tool.setTempCurrent(material,$curElem);
        // 显示缩放框，并绑定拖动事件
        if (material.status === 0)
            SelectionTool.selectionTool_show();
        else if (material.status === 3)
            SelectionTool.selectionLock_show();
        // 显示编辑工具条
        EditBtnTool.showEditToolbar();
        // 文字类型，额外处理
        if (material.targetType === 1) {
            // 插入内容到文本编辑器
            media.event.insertToSideEditor(material);
            // 侧边栏对齐样式
            Z("#sideTextEditor").css("text-align",material.textAlign);
        }
        // 显示坐标值
        if (Z.T.isFunction(SelectionTool.getXY)) {
            let suffix = {}.createMode === 1 ? "px" : "mm";
            Z("#xy_site").text("");
            Z("#wh_site").text("");
            let xy = SelectionTool.getXY($curElem);
            Z("#xy_site").text("位置，X：" + xy[0] + suffix + "   Y：" + xy[1] + suffix);
            let wh = SelectionTool.getWH($curElem);
            Z("#wh_site").text("尺寸，W：" + wh[0] + suffix + "   H：" + wh[1] + suffix);
        }
        // 选中图层
        let layerItem = Z(media.tool.$layerList).find("li[data-mid='" + material.mid + "']");
        if (layerItem.length !== 0)
            layerItem.addClass("active").siblings("li").removeClass("active");
        else
            Z(media.tool.$layerList).children("li").removeClass("active");
    }
    // 框选素材
    static getSvgElementGroup() {
        let tempList = [];
        let innerNum = 0;
        //计算选区范围内的SVG
        let selGroup = Z.D.id("selection_group").getBoundingClientRect();
        if (selGroup.width <= 2 || selGroup.height <= 2)
            return;

        media.tool.clearSelected();
        let itemXArr = SelectionTool.allSvgElemInfo[0];
        let itemYArr = SelectionTool.allSvgElemInfo[1]
        let itemArr = SelectionTool.allSvgElemInfo[2];

        // 遍历所有素材
        for (let i = 0;i < itemArr.length;i++) {
            let mid = parseInt(itemArr[i].getAttribute("data-mid"));
            let material = media.tool.getMaterialByMid(mid);

            let itemLeft = itemXArr[3*i];
            let itemTop = itemYArr[3*i];
            let itemRight = itemXArr[3*i + 2];
            let itemBottom = itemYArr[3*i + 2];
            if (itemLeft > selGroup.right || itemRight < selGroup.left ||
                itemTop > selGroup.bottom || itemBottom < selGroup.top) { // 不符合要求，跳过操作
                continue;
            }
            innerNum++;
            material.status = parseInt(material.status);
            // 选中的素材，加入选中列表
            if (material.status === 0) {// 默认选中正常素材
                if (!material.tool.selectGroup(material))
                    material.doMultiSelected();
            }
            if (material.status === 3) {// 临时数组用来存储 “已锁定” 素材
                tempList.push(mid);
            }
        }
        if (innerNum > 0 && tempList.length === innerNum)
        {//所有素材都是已锁定时；重新选中
            media.tool.clearSelected();
            for (i = 0;i < tempList.length;i++) {
                let material = media.tool.getMaterialByMid(parseInt(tempList[i]));
                if (!media.tool.selectGroup(material))
                    material.doMultiSelected();
            }
        }
        //执行缩放框显示定位
        SelectionTool.selectionToolsShow_group();
    }
    // 选框对象的右键菜单
    static selectionToolContextMenu(event) {
        let selectLength = media.selectedList.length;
        if (selectLength === 0)
            return;
        let material = media.tool.getCurMaterial();
        if (material.status === 3) {
            Const.createContextMenu({
                "event": event,
                "elemId": "selectionToolUnlockMenu",
                "editItem": [
                    ["解锁","MaterialTool.unlockMaterial"],
                ],
            });
            return;
        }
        Const.createContextMenu({
            "event": event,
            "elemId": "selectionToolMenu",
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
                ['添加到"我的素材"',"MaterialTool.addToCollectionList"],
            ],
        });
    }
    // 获取素材的 rect 对象：包含 width、height、left、top
    static getSelectedElemRect() {
        let topArr= [], rightArr= [], bottomArr= [], leftArr = [];
        for (let i = 0;i < media.selectedList.length;i++) {
            let material = media.tool.getCurMaterial(i);
            let $curElem = media.tool.getSvgElementByMid(material.mid);
            let $rect = $curElem.querySelector('rect');
            let elemRect = $rect.getBoundingClientRect();
            topArr.push(elemRect.top);
            rightArr.push(elemRect.right);
            bottomArr.push(elemRect.bottom);
            leftArr.push(elemRect.left);
        }
        return {
            'left' : Const.getMinNum(leftArr),
            'top' : Const.getMinNum(topArr),
            'width' : Const.getMaxNum(rightArr) - Const.getMinNum(leftArr),
            'height' : Const.getMaxNum(bottomArr) - Const.getMinNum(topArr),
        }
    }
    // 获取元素，距离画布四边数据
    static getEleClientRect($elem) {
        if (!$elem)
            return null;

        let $childRect = $elem.querySelector("rect");
        let svgElemData;
        if ($childRect)
            svgElemData = $childRect.getBoundingClientRect();
        else
            svgElemData = $elem.getBoundingClientRect();

        let stageRect = media.tool.$stageCanvas.getBoundingClientRect();
        let svgClientRect = {};
        svgClientRect.left = svgElemData.left - stageRect.left;               //元素左-盒子左
        svgClientRect.top = svgElemData.top - stageRect.top;                  //元素上-盒子顶
        svgClientRect.left_right = svgElemData.right - stageRect.left;        //元素右-盒子左
        svgClientRect.top_bottom = svgElemData.bottom - stageRect.top;        //元素下-盒子顶
        svgClientRect.right = stageRect.width - svgClientRect.left_right;     //元素右-盒子右
        svgClientRect.bottom = stageRect.width - svgClientRect.top_bottom;    //元素下-盒子底
        return svgClientRect;
    }
    // 计算鼠标位移，相对旋转对象的真实变化
    static getElementTrueEX(nowMouseLoc, startX, starY, angle) {
        let data = {x:0, y:0};
        let mx = nowMouseLoc.x - startX;
        let my = nowMouseLoc.y - starY;
        if (mx === 0 && my === 0)
            return data;

        let mouseAngle;
        let l = Math.sqrt(Math.pow(mx, 2) + Math.pow(my, 2));
        let absAngle = Math.atan(Math.abs(my) / Math.abs(mx));
        let rectAngle = 90 * Math.PI / 180;
        if (mx > 0 && my === 0)           //x正轴
            mouseAngle = 0;
        else if (mx > 0 && my > 0)    //第一象限
            mouseAngle = absAngle;
        else if (mx === 0 && my > 0)   //y正轴
            mouseAngle = rectAngle;
        else if (mx < 0 && my > 0)    //第二象限
            mouseAngle = 2 * rectAngle - absAngle;
        else if (mx < 0 && my === 0)   //x负轴
            mouseAngle = 2 * rectAngle;
        else if (mx < 0 && my < 0)    //第三象限
            mouseAngle = 2 * rectAngle + absAngle;
        else if (mx === 0 && my < 0)   //y负轴
            mouseAngle = 3 * rectAngle;
        else if (mx > 0 && my < 0)    //第四象限
            mouseAngle = 4 * rectAngle - absAngle;

        let dataAngle = angle * Math.PI/180;
        data.x = l * Math.cos(mouseAngle - dataAngle);
        data.y = l * Math.sin(mouseAngle - dataAngle);

        return data;
    }
    // 获取素材的位置信息
    static getXY($curElem) {
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();
        let x = $curElem.transform.baseVal[0].matrix.e;
        let y = $curElem.transform.baseVal[0].matrix.f;
        x = parseFloat(x.toFixed(4));
        y = parseFloat(y.toFixed(4));

        if({}.createMode === 0) { //毫米
            x = Exchange.px2mm(x, {}.dpi);
            y = Exchange.px2mm(y, {}.dpi);
        }
        return [x,y];
    }
    // 获取素材的大小信息
    static getWH($curElem) {
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();
        let $gWrap = $curElem.querySelector('g');
        let $svg = [...$gWrap.children].pop();
        let width = $svg.getAttribute("width");
        let height = $svg.getAttribute("height");
        if({}.createMode === 0) { //像素转毫米
            width = Exchange.px2mm(width, {}.dpi);
            height = Exchange.px2mm(height, {}.dpi);
        }
        return [width,height];
    }
}



/********************************************
 ************* 基础的转换方法 *************
 ********************************************/
class Exchange {
    // 默认返回原值，不处理透明度 alpha，返回值含 # 号
    static rgbToHex(rgbStr) {
        if (!/rgba?/.test(rgbStr.toLowerCase()))
            return rgbStr;

        rgbStr = rgbStr.toLowerCase();
        let array = rgbStr.split(",");
        if (array.length > 3)
            array = array.slice(0, 3);
        let hexStr = "#";
        for (let color of array) {
            color = parseInt(color.replace(/[^\d]/gi, ""), 10).toString(16);
            hexStr += color.length === 1 ? "0" + color : color;
        }
        hexStr = hexStr.toLowerCase();
        return  hexStr;
    }
    // 颜色格式转换，传入obj
    static rgbObjToHex(rgbObj) {
        let r = rgbObj.red || 0;
        let g = rgbObj.green || 0;
        let b = rgbObj.blue || 0;
        let rgbStr = "rgb(" + r + "," + g + "," + b + ")";
        return  Exchange.rgbToHex(rgbStr);
    }
    // 颜色格式转换，默认返回原值
    static hexToRgb(hexStr) {
        let rgbObj = Exchange.hexToRgbObj(hexStr);
        return "rgb(" + rgbObj.red + "," + rgbObj.green + "," + rgbObj.blue + ")";;
    }
    // 颜色格式转换，默认返回原值
    static hexToRgbObj(hexStr) {
        let resultStr = hexStr;

        if (/^#/.test(hexStr))
            hexStr = hexStr.substr(1);
        let red, green, blue;
        if (hexStr.length === 3){
            red = hexStr.substr(0, 1);
            red += red;
            green = hexStr.substr(1, 1);
            green += green;
            blue = hexStr.substr(2, 1);
            blue += blue;
        } else if (hexStr.length === 6) {
            red = hexStr.substr(0, 2);
            green = hexStr.substr(2, 2);
            blue = hexStr.substr(4, 2);
        } else {
            return resultStr;
        }

        red = parseInt(red, 16);
        green = parseInt(green, 16);
        blue = parseInt(blue, 16);
        if (isNaN(red) || isNaN(green) || isNaN(blue))
            return resultStr;
        else
            return {red: red, green: green, blue: blue};
    }
    // rgb 转换为 hsv 颜色模式，返回对象
    static rgbToHsvObj(rgbStr) {
        if (!/rgba?/.test(rgbStr.toLowerCase()))
            return rgbStr;

        rgbStr = rgbStr.toLowerCase();
        let array = rgbStr.split(",");
        if (array.length > 3)
            array = array.slice(0, 3);
        let red = Exchange.getStringNum(array[0]);
        let green = Exchange.getStringNum(array[1]);
        let blue = Exchange.getStringNum(array[2]);

        let rgbObj = {
            red: red,
            green: green,
            blue: blue,
        };
        return Exchange.rgbObjToHsvObj(rgbObj);
    }
    // rgbObj 转换为 hsv 颜色模式，返回相对大小
    static rgbObjToHsvObj(rgbObj) {
        let red = (rgbObj.red || 0) / 255;
        let green = (rgbObj.green || 0) / 255;
        let blue = (rgbObj.blue || 0) / 255;

        let max = Math.max(Math.max(red, green), blue);
        let min = Math.min(Math.min(red, green), blue);

        let hue, saturation;
        let value = max;
        if (min === max) {
            hue = 0;
            saturation = 0;
        } else {
            let delta = (max - min);
            saturation = delta / max;
            if (parseFloat(red) === max) {
                hue = (green - blue) / delta;
            } else if (parseFloat(green) === max) {
                hue = 2 + ((blue - red) / delta);
            } else {
                hue = 4 + ((red - green) / delta);
            }
            hue /= 6;
            if (hue < 0)
                hue += 1;
            if (hue > 1)
                hue -= 1;
        }
        return {
            hue: hue,
            saturation: saturation,
            value: value,
        };
    }
    // HSV颜色模型转rgb，返回字符串
    static hsvObjToRgb(hsvObj) {
        let rgbObj = Exchange.hsvObjToRgbObj(hsvObj);
        return "rgb(" + rgbObj.red + "," + rgbObj.green + "," + rgbObj.blue + ")";
    }
    // HSV颜色模型转rgb，返回对象
    static hsvObjToRgbObj(hsvObj) {
        let hue = hsvObj.hue || 0;
        let saturation = hsvObj.saturation || 0;
        let value = hsvObj.value || 0;
        let red, green, blue;
        if (parseFloat(value) === 0) {
            red = 0;
            green = 0;
            blue = 0;
        } else {
            let i = Math.floor(hue * 6);
            let f = (hue * 6) - i;
            let p = value * (1 - saturation);
            let q = value * (1 - (saturation * f));
            let t = value * (1 - (saturation * (1 - f)));
            switch (i) {
                case 1: red = q; green = value; blue = p; break;
                case 2: red = p; green = value; blue = t; break;
                case 3: red = p; green = q; blue = value; break;
                case 4: red = t; green = p; blue = value; break;
                case 5: red = value; green = p; blue = q; break;
                case 6: // fall through
                case 0: red = value; green = t; blue = p; break;
            }
        }

        red = Math.round(red * 255);
        green = Math.round(green * 255);
        blue = Math.round(blue * 255);
        return {
            red: red,
            green: green,
            blue: blue,
        };
    }
    // hsvObj 转 hex，返回值含 # 号
    static hsvObjToHex(hsvObj){
        let rgbObj = Exchange.hsvObjToRgbObj(hsvObj);
        return Exchange.rgbObjToHex(rgbObj);
    }
    // 去除字符串前后的空白行
    static reBlankLine(str){
        if (Z.S.trim(str) === "")
            return str;
        str =  Exchange.reBlankLinePre(str);
        str =  Exchange.reBlankLineLast(str);
        return str;
    }
    // 去除字符串前的空白行
    static reBlankLinePre(str){
        let newLineFirst = str.indexOf("\n");
        let preHtml = "";
        for(let i = 0;i < newLineFirst;i++){
            preHtml += str[i];
        }
        if (newLineFirst === 0 || (preHtml.length && !Z.S.trim(preHtml))) {
            return Exchange.reBlankLinePre(str.substring(newLineFirst + 1));
        }
        return str;
    }
    // 去除字符串后的空白行
    static reBlankLineLast(str) {
        let newLineLast = str.lastIndexOf("\n");
        let lastHtml = "";
        for(let i = newLineLast + 1;i < str.length;i++) {
            lastHtml += str[i];
        }
        if ((newLineLast === str.length - 1) || (lastHtml.length && !Z.S.trim(lastHtml))){
            return Exchange.reBlankLineLast(str.substring(0, newLineLast));
        }
        return str;
    }
    // 字符串提取数字
    static getStringNum(str) {
        str = str.replace(/[^\d.-]/g, "");
        return str * 1;
    }
}

/********************************************
 **************** 颜色选择器 ****************
 ********************************************/
class ColorPicker{
    /********************************************
     ***************** 常量定义 *****************
     ********************************************/
    // 默认颜色
    static listDefault =[
        "EB3D00","EC3A3E","F25F61","FA9D99","F67D6F","C28482","C26A74","976D6B","C16B61","955942",
        "F48000","F47E36","F99F3D","F99F61","D76F4C","F99E7E","FCC78C","FEC7AF","BF6C35","C18557",
        "FDC800","FDFA00","FDFC72","FDFE99","FEFEC6","C1A25F","C0C165","94946A","968064","71624E",
        "009049","1E8F6E","6AC334","AADC7D","8FAE6B","8FAE84","75886C","75887E","95947E","72635B",
        "AADBC7","62C2A1","90AD9F","00AEC4","218E9E","1E8F85","2B726C","567C7E","455F60","4D4A42",
        "340C70","0074C5","0089E1","60BFF3","90ABBD","758792","5C676E","5F6D84","706F61","414548",
        "EF2F72","FD9CB9","C4A0AB","C38296","C371A0","C3538B","A14875","A06186","97576D","824275",
        "653B73","774389","97679F","C18DB8","BBB0D4","9081B6","715D9D","7A6F95","977F87","73545D",
        "9B2575","9E7996","495577","6476B3","624F5D","4F495C","684B6C","7F647A","FFFFFF","000000",
    ];
    // 定义列数
    static columns = 10;
    // 鼠标操作类型
    static moveTypeCanvas = "canvas";
    static moveTypeToning = "toning";
    static moveTypeAlpha = "alpha";
    // 触发显示选择器的按钮样式
    static triggerClass = "setting-colorBox";
    // 触发按钮类型属性名
    static triggerTypeAttr = "data-type";
    // 默认唯一ID
    static containerId = "colorPicker_container";

    /********************************************
     ***************** 变量定义 *****************
     ********************************************/
    // 当前有效颜色值
    static colorRgba = "rgba(255,255,255,1)";
    // 数据
    static alpha = 100;
    // 修改对象类型
    static targetType = "";
    // 触发按钮
    static $trigger = null;
    // 历史记录保存列表
    static list = [];
    // 历史记录最大行
    static listMaxLine = 2;
    // 鼠标事件相对位置
    static mouseX = 0;
    static mouseY = 0;
    // 颜色值：rgb 对象
    static rgbObj = {
        red: 0,
        green: 0,
        blue: 0,
    };
    // 颜色值：hsv 对象
    static hsvObj = {
        hue: 0,
        saturation: 0,
        value: 0,
    };
    // 鼠标操作类型:canvasModel\toning\alpha
    static moveType = null;
    // 取色滑块高度
    static toningSliderHeight = null;
    // 取色画布宽度
    static toningCanvasWidth = null;
    // 取色画布高度
    static toningCanvasHeight = null;

    /********************************************
     ****************** 初始化 ******************
     ********************************************/
    static init() {
        /****************************
         * 插入颜色选择器
         * *************************/
        ColorPicker.insertColorPicker();

        /****************************
         * 常量定义
         * *************************/
        // dom 对象
        ColorPicker.$container = Canvas.$toolContainer.find(".colorPickerContainer");
        ColorPicker.$tabBar = ColorPicker.$container.find(".tabBar");
        ColorPicker.$tabBtnList = ColorPicker.$tabBar.find("span");
        ColorPicker.$table = ColorPicker.$container.find(".tableContainer");
        ColorPicker.$pickerList = ColorPicker.$table.find("a");
        ColorPicker.$toning = ColorPicker.$container.find(".toning");
        ColorPicker.$canvas = ColorPicker.$toning.find(".canvasModel");
        ColorPicker.$canvasCursor = ColorPicker.$canvas.find(".canvasCursor");
        ColorPicker.$toningSlider = ColorPicker.$toning.find(".toningSlider");
        ColorPicker.$toningBtn = ColorPicker.$toningSlider.find(".sliderBtn");
        ColorPicker.$alphaSlider = ColorPicker.$toning.find(".alphaSlider");
        ColorPicker.$alphaBtn = ColorPicker.$alphaSlider.find(".sliderBtn");
        ColorPicker.$inputWrap = ColorPicker.$toning.find(".inputList");
        ColorPicker.$inputList = ColorPicker.$inputWrap.find("input[targetType=text]");
        ColorPicker.$inputHex = ColorPicker.$inputWrap.find("label:nth-child(1)>input[targetType=text]");
        ColorPicker.$inputR = ColorPicker.$inputWrap.find("label:nth-child(2)>input[targetType=text]");
        ColorPicker.$inputG = ColorPicker.$inputWrap.find("label:nth-child(3)>input[targetType=text]");
        ColorPicker.$inputB = ColorPicker.$inputWrap.find("label:nth-child(4)>input[targetType=text]");
        ColorPicker.$inputA = ColorPicker.$inputWrap.find("label:nth-child(5)>input[targetType=text]");

        // 临时变量

        /****************************
         * 事件绑定
         * *************************/
        // 禁用默认事件、冒泡事件
        ColorPicker.$container.on("mousedown mouseup click dblclick",Z.E.stop);
        ColorPicker.$inputList.on("mousedown mouseup click dblclick", Z.E.stop);
        ColorPicker.$pickerList.on("mousedown",Z.E.forbidden);
        ColorPicker.$tabBar.on("mousedown",Z.E.forbidden);

        // 选色操作事件
        ColorPicker.$tabBtnList.on("click", ColorPicker.tabSwitch);
        ColorPicker.$pickerList.on("click",ColorPicker.doPick);
        // 调色板的事件
        ColorPicker.$canvas.on("mousedown",ColorPicker.toningCanvasDown)
            .on("mousemove",ColorPicker.toningCanvasMove)
            .on("mouseup mouseleave",ColorPicker.mouseEventCancel);
        ColorPicker.$toningSlider.on("mousedown",ColorPicker.toningSliderDown)
            .on("mousemove",ColorPicker.toningSliderMove)
            .on("mouseup mouseleave",ColorPicker.mouseEventCancel);
        ColorPicker.$alphaSlider.on("mousedown",ColorPicker.alphaSliderDown)
            .on("mousemove",ColorPicker.alphaSliderMove)
            .on("mouseup mouseleave",ColorPicker.mouseEventCancel);

        // 输入框事件
        ColorPicker.$inputHex.on("change",ColorPicker.inputHexChange)
            .on("input",ColorPicker.inputHexInput);
        ColorPicker.$inputR.on("change",ColorPicker.inputRGBChange)
            .on("input",ColorPicker.inputRGBInput);
        ColorPicker.$inputG.on("change",ColorPicker.inputRGBChange)
            .on("input",ColorPicker.inputRGBInput);
        ColorPicker.$inputB.on("change",ColorPicker.inputRGBChange)
            .on("input",ColorPicker.inputRGBInput);
        ColorPicker.$inputA.on("change",ColorPicker.inputAChange)
            .on("input",ColorPicker.inputAInput);

        // 触发器事件绑定
        Z("." + ColorPicker.triggerClass).on("click", ColorPicker.show);
    }
    // 插入颜色选择器
    static insertColorPicker() {
        // 若存在，则取消插入
        if (Z.D.id(ColorPicker.containerId) && Z(".colorPickerContainer")[0])
            return;

        // 计算列表行
        let lines = Math.ceil(ColorPicker.listDefault.length / ColorPicker.columns);
        // 计算灰度色值
        let grayNum = 15 / (lines - 2);
        // 组合html
        let html_colorList = '<div id="' + ColorPicker.containerId + '" class="colorPickerContainer"><div class="content">' +
            '   <div class="tabBar">' +
            '       <span class="active">选择颜色</span><span>调色板</span>' +
            '   </div>' +
            '   <div class="tableContainer">' +
            '       <table class="colorTable">';
        // 循环，所有颜色
        for (let i = 0;i < lines;i++) {
            html_colorList += '<tr>';
            let hexNum = Math.abs(Math.floor(15 - (i - 1) * grayNum)).toString(16);
            let grayColor = '#' + new Array(7).join(hexNum);
            if (i === 0)
                html_colorList += '<td><a class="bgTransparent" data-value="none" title="none"></a></td>';
            else
                html_colorList += '<td><a style="background-color:' + grayColor + ';" data-value="' + grayColor + '" title="' + grayColor + '"></a></td>';
            html_colorList += '<td style="border:none;"></td>';
            for (let j = 0;j < ColorPicker.columns;j++) {
                let colorVal = ColorPicker.listDefault[i * ColorPicker.columns + j];
                if (!colorVal) {
                    break;
                }
                colorVal = colorVal.toLowerCase();
                html_colorList += '<td><a style="background:#' + colorVal + ';" data-value="#' + colorVal + '" title="#' + colorVal + '"></a></td>';
            }
            html_colorList += '</tr>';
        }
        html_colorList += '</table>' +
            '       <table>' +
            '           <tr>' +
            '               <td colspan=12 class="title">最近使用</td>' +
            '           </tr>' +
            '           <tr class="lastColors"></tr>' +
            '       </table>' +
            '   </div>' +
            '   <div class="toning">' +
            '       <div class="canvasModel"><div class="canvasCursor"></div></div>' +
            '       <div class="toningSlider"><div class="sliderBtn"></div></div>' +
            '       <div class="alphaSlider bgTransparent"><div class="sliderBtn"></div></div>' +
            '       <div class="inputList">' +
            '           <label><input class="z-input z-blue" targetType="text" value=""><span>Hex</span></label>' +
            '           <label><input class="z-input z-blue" targetType="text" value=""><span>R</span></label>' +
            '           <label><input class="z-input z-blue" targetType="text" value=""><span>G</span></label>' +
            '           <label><input class="z-input z-blue" targetType="text" value=""><span>B</span></label>' +
            '           <label><input class="z-input z-blue" targetType="text" value=""><span>A</span></label>' +
            '       </div>' +
            '   </div>' +
            '</div></div>';

        Z(html_colorList).appendTo(Canvas.$toolContainer);
    }

    /********************************************
     **************** 设置展示 ******************
     ********************************************/
    // 获取 rgba 的有效值
    static getColorRgba(setColor) {
        // 没有参数，比较透明度
        if (!setColor) {
            let colorArr = ColorPicker.colorRgba.split(",");
            let colorAlpha = Exchange.getStringNum(colorArr[3]);
            colorAlpha = Math.round(colorAlpha * 100);
            if (colorAlpha !== ColorPicker.alpha)
                ColorPicker.colorRgba = "rgba("
                    + Exchange.getStringNum(colorArr[0]) + ","
                    + Exchange.getStringNum(colorArr[1]) + ","
                    + Exchange.getStringNum(colorArr[2]) + ","
                    + ColorPicker.alpha/100 + ")";
            return;
        }

        // 分析参数值
        let colorRgba;
        if (Z.T.isObject(setColor)) {
            if (setColor.red === undefined || setColor.green === undefined || setColor.blue === undefined)
                return;
            colorRgba = "rgba(" + setColor.red + "," + setColor.green + "," + setColor.blue + "," + ColorPicker.alpha/100 + ")";
        } else if (Z.T.isString(setColor)) {
            setColor = setColor.toLowerCase();
            if (/^rgba?/.test(setColor)) {                          // rgba 解析
                if (/^rgba/.test(setColor)) {
                    colorRgba = setColor;
                } else {
                    setColor = setColor.replace(/rgb|\(|\)/g, "");
                    colorRgba = "rgba(" + setColor + "," + ColorPicker.alpha/100 + ")";
                }
            } else if (/^#?[0-9a-f]{3,8}/.test(setColor)) {         // hex 解析
                let rgbObj = Exchange.hexToRgbObj(setColor);
                if (/^#/.test(setColor))
                    setColor = setColor.substr(1);
                if (setColor.length === 4 || setColor.length === 8){
                    let a;
                    if (setColor.length === 4) {
                        a = setColor.substr(3, 1);
                        a += a;
                    } else {
                        a = setColor.substr(6, 2);
                    }
                    a = parseInt(a, 16)/256;
                    a = parseFloat(a.toFixed(2));
                    ColorPicker.alpha = Math.round(a * 100);
                }
                ColorPicker.getColorRgba(rgbObj);
                return;
            } else {
                return;
            }
        } else {
            return;
        }

        ColorPicker.colorRgba = colorRgba;
    }
    // 通过 hex 获取 rgbObj、hsvObj、取色画布
    static getColorObj() {
        if (!/^rgba/.test(ColorPicker.colorRgba)) {
            return;
        }
        let rgbaArr = ColorPicker.colorRgba.split(",");
        let r = Exchange.getStringNum(rgbaArr[0]);
        let g = Exchange.getStringNum(rgbaArr[1]);
        let b = Exchange.getStringNum(rgbaArr[2]);
        let a = Exchange.getStringNum(rgbaArr[3]);

        // 数据保存
        ColorPicker.alpha = Math.round(a * 100);
        ColorPicker.rgbObj = { red: r, green: g, blue: b };
        ColorPicker.hsvObj = Exchange.rgbObjToHsvObj(ColorPicker.rgbObj);
    }
    // 获取取色滑块高度
    static getToningRectValue() {
        ColorPicker.toningCanvasWidth = ColorPicker.$canvas.offsetWidth() - 1;
        ColorPicker.toningCanvasHeight = ColorPicker.$canvas.offsetHeight() - 1;
        ColorPicker.toningSliderHeight = ColorPicker.$toningSlider.offsetHeight() - 1;
    }
    // 设置选择器颜色，展示指定颜色，输入框值、滑块位移
    static setPickerValue(setColor) {
        // 定义有效值
        ColorPicker.getColorRgba(setColor);

        // 输入框有效值
        ColorPicker.setInputValue();
        // 未显示时，不处理
        if (ColorPicker.$toning.isHide())
            return;

        // 取色定位
        ColorPicker.setToningCanvasStyle();
        // 不透明度值相关更新
        ColorPicker.setAlphaValue();
    }
    // 设置输入框有效值
    static setInputValue() {
        if (!/^rgba/.test(ColorPicker.colorRgba))
            return;

        let rgbaArr = ColorPicker.colorRgba.split(",");
        let r = Exchange.getStringNum(rgbaArr[0]);
        let g = Exchange.getStringNum(rgbaArr[1]);
        let b = Exchange.getStringNum(rgbaArr[2]);
        let a = Exchange.getStringNum(rgbaArr[3]);
        let hexColor = Exchange.rgbToHex(ColorPicker.colorRgba);
        ColorPicker.alpha = Math.round(a * 100);

        // hex 输入框
        if (hexColor.substr(0, 1) === "#")
            hexColor = hexColor.slice(1);
        ColorPicker.$inputHex.val(hexColor);
        // rgba 输入框
        ColorPicker.$inputR.val(r);
        ColorPicker.$inputG.val(g);
        ColorPicker.$inputB.val(b);
        ColorPicker.$inputA.val(ColorPicker.alpha);
    }
    // 拾色器颜色、位置
    static setToningCanvasStyle() {
        // 计算取色背景颜色
        let hsvObj = {
            hue: ColorPicker.hsvObj.hue,
            saturation: 1,
            value: 1,
        };
        let hueHex = Exchange.hsvObjToHex(hsvObj);
        ColorPicker.$canvas.css("backgroundColor", hueHex);

        // 计算取色按钮座标位置
        let cursorWidth = ColorPicker.$canvasCursor.offsetWidth();
        let cursorHeight = ColorPicker.$canvasCursor.offsetHeight();
        ColorPicker.$canvasCursor.css({
            "left": (ColorPicker.hsvObj.value * ColorPicker.toningCanvasWidth) - Math.ceil(cursorWidth/2),
            "top": ((1 - ColorPicker.hsvObj.saturation) * ColorPicker.toningCanvasHeight) - Math.ceil(cursorHeight/2),
        });
        let btnHeight = ColorPicker.$toningBtn.offsetHeight();
        ColorPicker.$toningBtn.css("top", ((ColorPicker.hsvObj.hue * ColorPicker.toningSliderHeight) - Math.ceil(btnHeight/2)).toString() + "px");
    }
    // 不透明度值相关更新
    static setAlphaValue(setAlpha){
        // 取值、赋值
        setAlpha = setAlpha === undefined ? ColorPicker.alpha : setAlpha;
        ColorPicker.alpha = setAlpha;

        // 滑块位置更新
        let sliderWidth = ColorPicker.$alphaSlider.offsetWidth();
        let setLeft = Math.round(sliderWidth * ColorPicker.alpha / 100);
        let btnWidth = ColorPicker.$alphaBtn.offsetWidth();
        setLeft = setLeft - Math.ceil(btnWidth/2);
        ColorPicker.$alphaBtn.css("left", setLeft);

        // 输入值更新
        ColorPicker.$inputA.val(ColorPicker.alpha);
    }
    // 最终选择颜色值，更新颜色值
    static colorPickerChanged() {
        // 取色区位置设置
        ColorPicker.setPickerValue();
        // 历史记录更新
        PrototypeUpdate.updateColor();
    }

    /********************************************
     ***************** 操作事件 *****************
     ********************************************/
    // 显示（切换）颜色选择容器
    static show(event) {
        // 主方法
        Z.E.forbidden(event);
        let $colorBtn = Z(Z.E.target(event));
        let targetType = $colorBtn.attr(ColorPicker.triggerTypeAttr);
        if (!targetType)
            return;

        // 1：切换颜色选择器
        // 先隐藏文字列表
        EditBtnTool.hideTextDropList();
        // 定义位置
        if (!Const.hasClassParent($colorBtn, "miniPopup"))
            EditBtnTool.docPopupHideExPicker();
        let btnRect = $colorBtn[0].getBoundingClientRect();
        let stageRect = Canvas.$stage[0].getBoundingClientRect();
        let pickerRect = ColorPicker.$container[0].getBoundingClientRect();
        let pickerLeft = btnRect.left - stageRect.left - pickerRect.width - 3;
        let pickerTop = btnRect.top - stageRect.top - pickerRect.height/3;
        pickerLeft = Math.round(pickerLeft);
        pickerTop = Math.round(pickerTop);

        // 判断选择器位置，未变化时，则隐藏
        let theLeft = Math.round(parseFloat(ColorPicker.$container[0].style.left || 0));
        let theTop = Math.round(parseFloat(ColorPicker.$container[0].style.top || 0));
        if (pickerLeft === theLeft && pickerTop === theTop)
            return ColorPicker.hide();

        // 设置基本属性
        ColorPicker.targetType = targetType;
        ColorPicker.$trigger = $colorBtn;

        // 定位选择框
        ColorPicker.$container.css({"left":pickerLeft,"top":pickerTop});
        // 设置 hsvObj、alpha
        ColorPicker.getColorRgba($colorBtn.css("backgroundColor"));
        ColorPicker.getColorObj();

        // 当前颜色展示
        ColorPicker.setPickerValue();
    }
    // 颜色选择器隐藏
    static hide() {
        ColorPicker.$container.removeAttr("style");
        // 执行历史颜色保存
        ColorPicker.insertLastColor();
        // 历史记录更新
        PrototypeUpdate.updateColor();
    }
    // 切换颜色选择方式
    static tabSwitch(event) {
        let $elem = Z.E.current(event);
        Z($elem).addClass("active").siblings("span").removeClass("active");
        let btnIndex = [].indexOf.call(ColorPicker.$tabBtnList, $elem);
        if (btnIndex === 0) {                                   // 选择颜色
            ColorPicker.$table.show();
            ColorPicker.$toning.hide();
        } else if (btnIndex === 1){                             // 调色板
            ColorPicker.$toning.show();
            ColorPicker.$table.hide();
            ColorPicker.getToningRectValue();
            // alpha 设置
            ColorPicker.setPickerValue();
            // alpha 设置
            ColorPicker.setAlphaValue();
        }
    }
    // 在颜色历史插入新颜色
    static insertLastColor(insertColor) {
        // 获取hex颜色值
        if (insertColor === undefined) {
            insertColor = Exchange.rgbToHex(ColorPicker.colorRgba);
        } else if (/^rgb/.test(insertColor)) {
            insertColor = Exchange.rgbToHex(insertColor);
        }

        if (Z.AR.contains(ColorPicker.list, insertColor))
            return;

        // 历史记录最大值
        let maxLength = ColorPicker.listMaxLine * (ColorPicker.columns - 1);
        ColorPicker.list.push(insertColor);
        if (ColorPicker.list.length > maxLength)
            ColorPicker.list.shift();

        let $color = Z('<td><a style="background-color:' + insertColor + ';" data-value="' + insertColor + '" title="' + insertColor + '"></a></td>');
        let $$trs = ColorPicker.$table.find(".lastColors");
        let lastIndex = $$trs.length - 1;
        // 历史记录显示
        $$trs.each(($tr,lineIndex)=> {
            // 插入第一个位置
            let $first = Z($tr).find("td:first-child");
            if ($first[0]) {
                $color.insertBefore($first);
            } else {
                Z($tr).append($color);
            }
            // 添加事件
            if (lineIndex === 0)
                $color.find("a").on("mousedown",function (e){Z.E.forbidden(e)}).on("click",ColorPicker.doPick);
            // 判断换行/新增行
            let $$childTd = Z($tr).children("td");

            $color = Z($tr).find("td:last-child");
            if (lineIndex === lastIndex) {
                if ($$childTd.length !== ColorPicker.columns)
                    return;
                if (lineIndex === ColorPicker.listMaxLine - 1)
                    return $color.remove();
                let $newTr = Z('<tr class="colorPicker-lastColors"></tr>');
                $newTr.insertAfter($tr);
                $newTr.append($color);
            }
        });
    }
    // 点击选则颜色
    static doPick(param) {
        let color;
        if (param.type && param.type === "click"){
            Z.E.forbidden(param);
            color = Z.E.target(param).getAttribute("data-value");
        } else {
            color = param;
        }

        ColorPicker.getColorRgba(color);
        // 元素颜色更新
        ElementUpdate.updateColor(color);
    }
    // 取色鼠标操作
    static toningCanvasDown(event) {
        Z.E.forbidden(event);

        ColorPicker.moveType = ColorPicker.moveTypeCanvas;
        let thisLoc = Const.getFixedCoords(event, ColorPicker.$canvas);
        ColorPicker.mouseX = thisLoc.x;
        ColorPicker.mouseY = thisLoc.y;
        ColorPicker.toningCanvasChanged(ColorPicker.mouseX, ColorPicker.mouseY);
    }
    static toningCanvasMove(event) {
        let isLeftButton = event["buttons"] === 1;
        if (!isLeftButton)
            return ColorPicker.mouseEventCancel();

        if (!ColorPicker.moveType || ColorPicker.moveType !== ColorPicker.moveTypeCanvas)
            return ColorPicker.mouseEventCancel();

        let thisLoc = Const.getFixedCoords(event, ColorPicker.$canvas);
        if (thisLoc.x !== ColorPicker.mouseX || thisLoc.y !== ColorPicker.mouseY) {
            ColorPicker.mouseX = thisLoc.x;
            ColorPicker.mouseY = thisLoc.y;
            ColorPicker.toningCanvasChanged(ColorPicker.mouseX, ColorPicker.mouseY);
        }
    }
    static toningSliderDown(event) {
        Z.E.forbidden(event);

        ColorPicker.moveType = ColorPicker.moveTypeToning;
        let thisLoc = Const.getFixedCoords(event, ColorPicker.$toningSlider);
        ColorPicker.mouseX = thisLoc.x;
        ColorPicker.mouseY = thisLoc.y;
        ColorPicker.toningSliderChanged(ColorPicker.mouseY);
    }
    static toningSliderMove(event) {
        let isLeftButton = event["buttons"] === 1;
        if (!isLeftButton)
            return ColorPicker.mouseEventCancel();

        if (!ColorPicker.moveType || ColorPicker.moveType !== ColorPicker.moveTypeToning)
            return ColorPicker.mouseEventCancel();

        let thisLoc = Const.getFixedCoords(event, ColorPicker.$toningSlider);
        if (thisLoc.x !== ColorPicker.mouseX || thisLoc.y !== ColorPicker.mouseY) {
            ColorPicker.mouseX = thisLoc.x;
            ColorPicker.mouseY = thisLoc.y;
            ColorPicker.toningSliderChanged(ColorPicker.mouseY);
        }
    }
    // 透明度鼠标操作
    static alphaSliderDown(event) {
        let thisLoc = Const.getFixedCoords(event, ColorPicker.$alphaSlider);

        ColorPicker.moveType = ColorPicker.moveTypeAlpha;
        ColorPicker.mouseX = thisLoc.x;
        ColorPicker.mouseY = thisLoc.y;
        let sliderWidth = ColorPicker.$alphaSlider.offsetWidth();
        let setAlpha = ColorPicker.mouseX / sliderWidth;
        setAlpha = Math.round(setAlpha * 100);
        // 设置 alpha
        ColorPicker.alpha = setAlpha;
        ColorPicker.setAlphaValue();
    }
    static alphaSliderMove(event) {
        let isLeftButton = event["buttons"] === 1;
        if (!isLeftButton)
            return ColorPicker.mouseEventCancel();

        if (!ColorPicker.moveType || ColorPicker.moveType !== ColorPicker.moveTypeAlpha)
            return ColorPicker.mouseEventCancel();

        // 执行操作，通按下结果
        ColorPicker.alphaSliderDown(event);
    }
    // 鼠标事件取消
    static mouseEventCancel() {
        ColorPicker.mouseX = null;
        ColorPicker.mouseY = null;
        ColorPicker.moveType = null;
    }
    // 取色位置变化，更新颜色
    static toningCanvasChanged(x, y) {
        ColorPicker.hsvObj.saturation = (1-(y/ColorPicker.toningCanvasHeight));
        ColorPicker.hsvObj.value = (x/ColorPicker.toningCanvasWidth);
        ColorPicker.rgbObj = Exchange.hsvObjToRgbObj(ColorPicker.hsvObj);
        ColorPicker.getColorRgba(Exchange.hsvObjToHex(ColorPicker.hsvObj));
        ColorPicker.colorPickerChanged();
    }
    // 取色区域滑块变化
    static toningSliderChanged(y) {
        ColorPicker.hsvObj.hue = y/ColorPicker.toningSliderHeight;
        ColorPicker.rgbObj = Exchange.hsvObjToRgbObj(ColorPicker.hsvObj);
        ColorPicker.getColorRgba(ColorPicker.rgbObj);
        ColorPicker.colorPickerChanged();
    }
    // hex 输入框变化
    static inputHexChange(event) {
        // 取得颜色有效值
        let color = event.currentTarget.value;
        if (!/[0-9a-fA-F]{3}|[0-9a-fA-F]{6}/.test(color)){
            color = ColorPicker.colorRgba;
        }
        ColorPicker.getColorRgba(color);
        // 输入框更新值
        ColorPicker.inputColorChange();
    }
    // rgb 输入框变化
    static inputRGBChange() {
        // 取得颜色有效值
        let r = ColorPicker.$inputR.val();
        let g = ColorPicker.$inputG.val();
        let b = ColorPicker.$inputB.val();
        let rgbObj = {
            red: r,
            green: g,
            blue: b,
        };
        ColorPicker.getColorRgba(rgbObj);
        // 输入框更新值
        ColorPicker.inputColorChange();
    }
    // alpha 输入框变化
    static inputAChange(event) {
        // 有效不透明度
        ColorPicker.alpha = parseFloat(event.currentTarget.value);
        // 设置不透明度
        ColorPicker.setAlphaValue();
        // 更新颜色
        ColorPicker.colorPickerChanged();
    }
    // 所有输入框公用处理
    static inputColorChange() {
        // 设置 hsvObj
        ColorPicker.getColorObj();
        // 更新颜色
        ColorPicker.colorPickerChanged();
    }
    // 校验输入值
    static inputHexInput() {
        let $input = event.currentTarget;
        let val = $input.value;
        val = val.replace(/[^0-9a-fA-F]/g, '');
        val = val.substr(0, 6);
        $input.value = val;
    }
    static inputRGBInput(event) {
        let $input = event.currentTarget;
        let val = $input.value;
        val = val.replace(/[^\d]/g, '');
        if (val > 255)
            val = 255;
        $input.value = val;
    }
    static inputAInput() {
        let $input = event.currentTarget;
        let val = $input.value;
        val = val.replace(/[^\d]/g, '');
        if (val > 100)
            val = 100;
        $input.value = val;
    }
}

/********************************************
 ************* 大文件上传初始化 *************
 ********************************************/
class UploadImage{
    /********************************************
     ***************** 常量定义 *****************
     ********************************************/
    // 上传路径参数
    static contextPath = "";
    static path = "";
    // 临时参数
    static tempData = {};

    /********************************************
     ****************** 初始化 ******************
     ********************************************/
    // 大文件初始化
    static init(){
        /****************************
         * 常量定义
         * *************************/
        UploadImage.$progress = Z('<div id="imgUploadProgress">' +
            '<div class="content">' +
            '   <div class="title">' +
            '       <span class="text">图片上传</span>' +
            '       <i class="z-font z-error"></i>' +
            '   </div>' +
            '<ul class="list"></ul>' +
            '</div></div>').appendTo(Canvas.$toolContainer);
        UploadImage.$content = UploadImage.$progress.find(".content");
        UploadImage.$title = UploadImage.$content.find(".title");
        UploadImage.$titleText = UploadImage.$title.find(".text");
        UploadImage.$closeBtn = UploadImage.$title.find(".z-error");
        UploadImage.$list = UploadImage.$progress.find(".list");
        UploadImage.list = UploadImage.$progress.find(".list");

        /****************************
         * 事件添加
         * *************************/
        UploadImage.$closeBtn.on("click", UploadImage.hide);
    }

    /********************************************
     ******************* 方法 *******************
     ********************************************/
    // 上传初始化方法
    static uploadInit(elemId, onCompleted) {
        let upload = new Z.UploadLarge();
        upload.elem = elemId;
        upload.showResult = false;
        upload.contextPath = UploadImage.contextPath;
        upload.setFileDir(UploadImage.path);
        upload.maxSizeMiB = 5;
        upload.setFileFormatExt("image/png, image/jpeg");
        upload.onSelected = ()=> {
            UploadImage.onSelect(upload);
        };
        upload.onCompleted = (fileId, fileName, fileUrl)=> {
            UploadImage.showListDone(fileName, fileUrl);
            onCompleted(fileId, fileName, fileUrl);
        };
        upload.execute();

        // 样式初始化
        UploadImage.styleInit(upload);
    }
    // 上传选中文件
    static onSelect(upload) {
        UploadImage.tempData = {};
        upload.$progress.show();
        let file = upload.$file[0].files[0];
        let M = 1024 * 1024;
        let size = file.size;
        if (size < M){
            UploadImage.tempData.size = Math.round(size / 1024 * 10) / 10 + " KB";
        }else{
            UploadImage.tempData.size = Math.round(size / M * 100) / 100 + " M";
        }
        //这里我们判断下类型如果不是图片就返回 去掉就可以上传任意文件
        if(!/image\/(png)|(jpg)|(jpeg)/.test(file.type)){
            Z.alert("请确认文件类型为图片！");
            upload.cancel();
            return false;
        }
        let reader = new FileReader();
        reader.$upload = upload;
        reader.readAsDataURL(file);
        reader.onload = (event)=> {
            UploadImage.$titleText.html("正在上传");
            UploadImage.$list.removeClass("loading");
            reader.$upload.$progress.find(".z-font.z-file img").attr('src',event.target.result);
            //保存全局变量
            UploadImage.tempData.src = event.target.result;
        };
        UploadImage.$progress.removeClass("transBottom").addClass("active");;
        UploadImage.$list.addClass("loading");
        UploadImage.$list.find("li.item").remove();
        UploadImage.$titleText.html("读取上传图片...");
    }
    // 样式初始化
    static styleInit(upload) {
        let $progress = upload.$progress;
        upload.$file.attr("accept","image/png,image/jpeg,image/jpg");
        upload.$elem.addClass("zi-visible");
        $progress.removeAttr("style").css({"display":"none","height":"50px","margin":"10px 0",});
        $progress.children(".z-font.z-file").html('<div class="z-bg-white z-text-center" style="display:table-cell;width:32px;height:36px;vertical-align:middle"><img></div>');
        UploadImage.$list.append(Z('<li class="z-relative"></li>').append($progress));
        upload.$result.addClass("zi-hide");
    }
    // 弹窗隐藏
    static hide() {
        UploadImage.$progress.removeClass("active");
    }
    // 显示完成列表
    static showListDone(fileName, fileUrl) {
        if (!fileName || !fileUrl)
            return UploadImage.hide();

        UploadImage.$progress.addClass("transBottom");
        UploadImage.$titleText.html("上传完成");
        let $newLi = Z('<li class="item"><span class="imgBox"><img class="img" src="'
            + UploadImage.tempData.src + '"></span><span class="name">' + fileName + '</span><span class="size">'
            + UploadImage.tempData.size + '<i class="z-font z-success"></i></span></li>');
        $newLi.insertBefore(UploadImage.$list.find("li:first-child"));
        let timer = setTimeout(()=> {//定时器关闭弹窗
            clearTimeout(timer);
            UploadImage.hide();
        },3000);
    }
    //实现网络图片上传，再插入画布
    static uploadFileRequest(source, mid, isLocal) {
        let className = !!isLocal?("saveLocalImage"):("downloadImage");
        let ajax = new Z.Ajax();
        ajax.setClassName("MediaPresenter");
        ajax.setMethodName(className);
        ajax.addParam(source);
        ajax.addParam(media.id);
        ajax.setCallback((event)=> {
            if (event.responseStatus === 701 || event.responseStatus === 703){
                media.tool.ajaxLoadedLength--;
                Z.alert(event.responseText, function(){Const.ajaxLoadedDone();});
                return;
            }

            let obj = Z.J.toObject(event.responseText);
            MaterialTool.newImage({fileId:obj.fileId, source: obj.fileUrl ,mid: mid}, true, (material, svgElement)=> {
                ElementUpdate.updateMaterialSource(material, svgElement);
                material.doMultiSelected();
                Const.ajaxLoadedDone();
            });
        });
        ajax.execute();
    }
}

/********************************************
 *************  历史记录数据库  *************
 ********************************************/
class HistoryDB {
    /********************************************
     ***************** 常量定义 *****************
     ********************************************/
    // 数据库名
    static DBName = "HistoryDB_";
    // 数据库版本
    static DBVersion = 1;
    // 对象仓库名称
    static storeName = "prototype";
    // 对象仓库 key 索引
    static storeKeyPath = "keyIndex";
    // 对象仓库 key 索引值
    static storeKeyPathValue = 0;
    // 当前索引
    static index = 0;
    // 服务器索引
    static indexServer = 0;
    // 历史纪录列表
    static list = [];
    // 列表最大长度
    static max = 50;
    /** 保存数据库名的数据库 **/
    static nameDBName = "HistoryDBNameDB";
    static nameDBStoreName = "listStore";
    static nameDBVersion = 1;
    static nameDBTimeOut = 1000 * 60 * 60 * 24 * 7;    // 7天有效期

    /********************************************
     ****************** 初始化 ******************
     ********************************************/
    // 初始化
    static init() {
        // 设置初始数据
        HistoryDB.DBName += canvasModel.prototypeId;
        HistoryDB.index = 0;
        HistoryDB.indexServer = 0;
        HistoryDB.canvasModel = canvasModel;
        HistoryDB.list = [];
        HistoryDB.listPush();
        if (!!window.indexedDB) {
            // 打开数据库
            HistoryDB.open(HistoryDB.DBName, HistoryDB.DBVersion, HistoryDB.historyDbOpened, HistoryDB.historyDBStoreInit);
        } else {
            // 读取历史记录列表
            HistoryDB.loadModel();
        }
    }

    /********************************************
     ************** H5 indexDB数据库 ************
     ********************************************/
    // 打开、新建数据库
    static open(DBName, version, resolve, upgrade) {
        let request = window.indexedDB.open(DBName, version);
        // 打开\创建成功
        request.onsuccess = resolve;
        // 打开\创建出错
        request.onerror = HistoryDB.DBFailure;
        // 创建一个新的数据库，或指定一个比之前更大的版本号
        request.onupgradeneeded = upgrade;
    }
    // 成功打开数据库
    static historyDbOpened(event) {
        window.prototypeIndexedDB = event.target.result;
        // 读取数据库数据
        HistoryDB.historyDBGet(
            (resultData)=> {
                // 常量更新
                HistoryDB.index = resultData.indexServer;
                HistoryDB.indexServer = resultData.indexServer;
                HistoryDB.canvasModel = canvasModel;
                HistoryDB.list = resultData.list;
                // 读取历史记录列表
                HistoryDB.loadModelServer();
                // 本地所有数据库名的数据库
                HistoryDB.nameDBUpdate();
            },
            HistoryDB.DBFailure);
    }
    // 历史数据库仓库新建
    static historyDBStoreInit(event) {
        window.prototypeIndexedDB = event.target.result;
        // 第一个数据
        let firstItem = {
            index: HistoryDB.index,
            indexServer: HistoryDB.indexServer,
            canvasModel: HistoryDB.canvasModel,
            list: HistoryDB.list,
        };
        firstItem[HistoryDB.storeKeyPath] = HistoryDB.storeKeyPathValue;

        // 创建对象仓库
        let objectStore = prototypeIndexedDB.createObjectStore(HistoryDB.storeName,
            { keyPath: HistoryDB.storeKeyPath });
        // 添加对象
        objectStore.add(firstItem);
    }
    // 数据库更新
    static historyDBUpdate() {
        HistoryDB.historyDBGet((event)=> {
            // 获取我们想要更新的数据
            let data = event.target.result;
            // 更新你想修改的数据
            data.index = HistoryDB.index;
            data.indexServer = HistoryDB.indexServer;
            data.canvasModel = HistoryDB.canvasModel;
            data.list = HistoryDB.list;

            // 把更新过的对象放回数据库
            let requestUpdate = objectStore.put(data);
            requestUpdate.onerror = function(event) {
                console.error(event);
            };
            requestUpdate.onsuccess = function(event) {
                console.log(event);
            };
        },(event)=> {

        });
    }
    // 数据库获取，并执行操作
    static historyDBGet(resolve, reject) {
        reject = reject || HistoryDB.DBFailure;

        return new Promise(()=> {
            let transaction = prototypeIndexedDB.transaction([HistoryDB.storeName], "readwrite");
            // 获取对象仓库
            let objectStore = transaction.objectStore(HistoryDB.storeName);
            let request = objectStore.get(HistoryDB.storeKeyPathValue);
            request.onerror = (event)=> {
                reject && reject(event.target.error);
            };
            request.onsuccess = (event)=> {
                resolve && resolve(event.target.result);
            };
        });
    }
    // 数据名存储数据,更新时间、删除超时数据、过多数据
    static nameDBUpdate() {
        HistoryDB.open(HistoryDB.nameDBName, HistoryDB.nameDBVersion, (event)=> {
            let db = event.target.result;
            let transaction = db.transaction(HistoryDB.nameDBStoreName, "readwrite");
            let objectStore = transaction.objectStore(HistoryDB.nameDBStoreName);
            let request = objectStore.getAllKeys();

            // 所有数据库名
            request.onsuccess = (event)=> {
                let nameList = event.target.result;
                // 判断数据库大小，以及长时间未操作的数据
                let request = objectStore.getAll();
                request.onsuccess = (event)=> {
                    // 数组列表，进行排序
                    let dataList  = event.target.result;
                    dataList.sort((a, b)=> {
                        return a.updateTime - b.updateTime;
                    });

                    // 删除超时数据
                    let now = new Date().getTime();
                    dataList.forEach((data)=> {
                        if (now - data.updateTime > HistoryDB.nameDBTimeOut)
                            objectStore.delete(dataList[i].name);
                    });

                    // 删除超长数据
                    let mx = dataList.length - HistoryDB.max;
                    for (let i=0;i<mx;i++) {
                        objectStore.delete(dataList[i].name);
                    }

                    // 执行新数据更新
                    if (!nameList.includes(HistoryDB.DBName)){
                        let item = {
                            updateTime: new Date().getTime(),
                            name: HistoryDB.DBName,
                        };
                        objectStore.add(item);
                    } else {
                        let request = objectStore.get(HistoryDB.DBName);
                        request.onsuccess = (event)=> {
                            let data  = event.target.result;
                            data.updateTime = new Date().getTime();
                            objectStore.put(data);
                        };
                    }
                };
            };
        }, HistoryDB.nameDBStoreInit);
    }
    // 库名数据库仓库新建
    static nameDBStoreInit(event) {
        let db = event.target.result;
        // 创建对象仓库
        let objectStore = db.createObjectStore(HistoryDB.nameDBStoreName,
            { keyPath: "name" });
        // 添加对象
        let item = {
            updateTime: new Date().getTime(),
            name: HistoryDB.DBName,
        };
        objectStore.add(item);
    }
    // 数据库操作失败
    static DBFailure(event) {
        // 打印错误提示
        console.error(event);

        // 删除本地数据库


        // 读取历史记录列表
        HistoryDB.loadModel();
    }

    /********************************************
     *************** 历史记录操作 ***************
     ********************************************/
    // 历史更新
    static update() {
        // 去尾
        if (HistoryDB.index < HistoryDB.list.length-1)
            HistoryDB.list = HistoryDB.list.slice(0, HistoryDB.index + 1);
        // 掐头
        if (HistoryDB.list.length >= HistoryDB.max) {
            let startIndex = HistoryDB.list.length - HistoryDB.max + 1;
            HistoryDB.list = HistoryDB.list.slice(startIndex, HistoryDB.list.length);
            HistoryDB.index -= startIndex;
            HistoryDB.indexServer -= startIndex;
        }
        // 插入新数据
        HistoryDB.listPush();
        HistoryDB.index++;
        // 本地历史数据库更新
        HistoryDB.historyDBUpdate();
    }
    // list 新增
    static listPush(index) {
        let obj = {
            screenList: prototypeModel.screenList,
            elementList: prototypeModel.elementList,
        };
        index = index || HistoryDB.list.length;
        HistoryDB.list[index] = Z.J.toString(obj);
    }
    // 载入服务器数据
    static loadModelServer() {
        // 不在列表中
        if (HistoryDB.indexServer < 0 || HistoryDB.indexServer > HistoryDB.list.length-1){
            // 读取服务器数据，并插入到列表第一个
            Prototype.init();
            HistoryDB.index = 0;
            HistoryDB.indexServer = 0;
            HistoryDB.canvasModel = canvasModel;
            HistoryDB.listPush(0);
            return;
        }

        let modelStr = HistoryDB.list[HistoryDB.indexServer];
        // 模型字符串初始化
        HistoryDB.modelStringInit(modelStr);
    }
    // 载入数据
    static loadModel() {
        let modelStr = HistoryDB.list[HistoryDB.index];
        // 模型字符串初始化
        HistoryDB.modelStringInit(modelStr);
    }
    // 载入数据，初始化
    static modelStringInit(modelStr) {
        let modelObj = Z.J.toObject(modelStr);
        modelObj = {
            canvasModel: HistoryDB.canvasModel,
            screenList: modelObj.screenList,
            elementList: modelObj.elementList,
        };
        // 重定义 prototypeModel
        Prototype.init(modelObj);
        // 重定义 HistoryDB.canvasModel
        HistoryDB.canvasModel = canvasModel;
    }
    // 撤销操作
    static undo () {
        if (HistoryDB.index === 0)
            return;
        HistoryDB.index--;
        HistoryDB.loadModel();
    }
    // 重做操作
    static redo () {
        if (HistoryDB.index === HistoryDB.list.length-1)
            return;
        HistoryDB.index++;
        HistoryDB.loadModel();
    }
}