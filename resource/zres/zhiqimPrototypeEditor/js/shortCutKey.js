/****************************************
**************** 快捷键  ****************
*****************************************/
class ShortCutKey {
    static init() {
        Z(document).on("keydown", ShortCutKey.documentKeyDown)
            .on("keyup", ShortCutKey.documentKeyUp)
            .on("copy", ShortCutKey.documentCopy)
            .on("paste", ShortCutKey.documentPaste);
    }
    static documentKeyDown(event) {
        let keyCode = event["keyCode"];                // 按键键值, 字符串型
        let isCtrl = event.ctrlKey;                    // 是否按下Ctrl
        let isShift = event.shiftKey;                  // 是否按下Shift
        let isAlt = event.altKey;                      // 是否按下Alt

        /******** keydown事件开始 ******/
        // 输入内容操作，搜索输入框执行搜索，其他不处理
        if (Const.isActiveInput()) {// 输入框内容，分情况执行特殊处理
            if (keyCode === 13) {// 单独按下回车键
                if (isCtrl || isShift || isShift)
                    return;
                let activeEle = document.activeElement;
                if (activeEle.tagName.toLowerCase() !== "input")
                    return;

                switch (activeEle.id) {
                    case "0":
                        break;
                    case "1":
                        break;
                }
            }
            return;
        }

        /* 空格键按下标识 */
        if (keyCode === 32){
            CanvasEvent.stageGrabStart(event);
            return;
        }

        /****************************************
         ************** 全局组合操作 **************
         *****************************************/
            //   1):=====任何状态都可以进行操作，以下为已实现的操作=====
            //   2):全选素材（Ctrl + A [ctrlKey + 65]）
            //   3):重做操作（Ctrl + Y [ctrlKey + 89]）
            //   4):撤销操作（Ctrl + Z [ctrlKey + 90]）
            //   5):移动画布（Space + mousedown + mousemove[32 + mousedown + mousemove]），鼠标事件在 wrapMouseMove 中处理
            //   6):多选素材（Shift + mousedown[shiftKey + mousedown]），鼠标事件在 eleMouseDown 中处理
            //   7):跨模板粘贴素材（Ctrl + Alt + V [ctrlKey + altKey + 86]）
            //   8):全素材锁定（Ctrl + Alt + L [ctrlKey + altKey + 76]）
            //   9):全素材解锁（Ctrl + Alt + U [ctrlKey + altKey + 85]）
        let globalEditKey = ["65", "89", "90"];
        // 全选、重做、撤销
        if (globalEditKey.includes(keyCode)) {
            if (!isCtrl || isShift || isAlt)
                return;
            switch (keyCode) {
                case "65":// 全选，仅限正常素材
                    Z.E.forbidden(event);
                    EditBtnTool.doGlobalSelect();
                    break;
                case "89":// 重做
                    PanelTool.redo();
                    break;
                case "90":// 撤销
                    PanelTool.undo();
                    break;
            }
            return;
        }
        // 多选
        if (isShift){
            Z("#selection_tool").css("pointer-events","none");
        }

        // Ctrl + Alt + ...
        if (isCtrl && isAlt && !isShift) {
            globalEditKey = ["86", "76", "85"];
            if (globalEditKey.includes(keyCode)) {
                switch (keyCode) {
                    case "86":// 跨模板粘贴素材
                        MaterialTool.pasteOverPage();
                        break;
                    case "76":// 全素材锁定
                        MaterialTool.doGlobalLock();
                        break;
                    case "85":// 全素材解锁
                        MaterialTool.doGlobalUnlock();
                        break;
                }
                return;
            }
        }

        /****************************************
         ************** 素材操作类型 **************
         *****************************************/
            //   1):=====需要存在选中对象，以下为已实现的操作=====
            //   2):移动素材（left [37]、up [38]、right [39]、down [40]）
            //   3):删除素材（Del [46]）
            //   4):剪切操作（Ctrl + X [ctrlKey + 88]）
            //   5.1):下移图层（Crtl + [ [ctrlKey + 219]）
            //   5.2):上移图层（Crtl + ] [ctrlKey + 221]）
            //   5.3):置底图层（Crtl + Shift + [ [ctrlKey + shiftKey + 219]）
            //   5.4):置顶图层（Crtl + Shift + ] [ctrlKey + shiftKey + 221]）
            //   5.5):跨模板复制素材（Ctrl + Shift + C [ctrlKey + shiftKey + 67]）

        let materialEditKey = ["37", "38", "39", "40", "46", "88", "219", "221"];
        if (materialEditKey.includes(keyCode)) {// 存在于素材操作类型
            if (selectedList.length === 0 || isAlt)
                return;

            // 取第一个素材，判断是否可编辑
            let firstMid = parseInt(selectedList[0]);
            let firstMaterial = media.tool.getMaterialByMid(firstMid);
            if (parseFloat(firstMaterial.status) !== 0)
                return;

            switch (keyCode) {
                case "37": {// s左移
                    if (isCtrl || isShift || isAlt)
                        break;
                    for (let i = 0;i < selectedList.length;i++){
                        let $curElem = media.tool.getCurSvgElement(i);
                        let x = $curElem.transform.baseVal[0].matrix.e;
                        let y = $curElem.transform.baseVal[0].matrix.f;
                        ElementUpdate.updateMaterialPos(x - 1, y, i);
                    }
                    Z("#selection_tool").css({
                        "left": parseFloat(Z("#selection_tool").css("left")) - media.tool.showRatio,
                        "top": parseFloat(Z("#selection_tool").css("top"))
                    });
                } break;
                case "38": {// 上移
                    if (isCtrl || isShift || isAlt)
                        break;
                    for (let i = 0;i < selectedList.length;i++){
                        let $curElem = media.tool.getCurSvgElement(i);
                        let x = $curElem.transform.baseVal[0].matrix.e;
                        let y = $curElem.transform.baseVal[0].matrix.f;
                        ElementUpdate.updateMaterialPos(x, y - 1, i);
                    }
                    Z("#selection_tool").css({
                        "left": parseFloat(Z("#selection_tool").css("left")),
                        "top": parseFloat(Z("#selection_tool").css("top")) - media.tool.showRatio
                    });
                } break;
                case "39": {// 右移
                    if (isCtrl || isShift || isAlt)
                        break;
                    for (let i = 0;i < selectedList.length;i++) {
                        let $curElem = media.tool.getCurSvgElement(i);
                        let x = $curElem.transform.baseVal[0].matrix.e;
                        let y = $curElem.transform.baseVal[0].matrix.f;
                        ElementUpdate.updateMaterialPos(x + 1, y, i);
                    }
                    Z("#selection_tool").css({
                        "left": parseFloat(Z("#selection_tool").css("left")) + media.tool.showRatio,
                        "top": parseFloat(Z("#selection_tool").css("top"))
                    });
                } break;
                case "40": {// 下移
                    if (isCtrl || isShift || isAlt)
                        break;
                    for (let i = 0;i < selectedList.length;i++) {
                        let $curElem = media.tool.getCurSvgElement(i);
                        let x = $curElem.transform.baseVal[0].matrix.e;
                        let y = $curElem.transform.baseVal[0].matrix.f;
                        ElementUpdate.updateMaterialPos(x, y + 1, i);
                    }
                    Z("#selection_tool").css({
                        "left": parseFloat(Z("#selection_tool").css("left")),
                        "top": parseFloat(Z("#selection_tool").css("top")) + media.tool.showRatio
                    });
                } break;
                case "46": {// 删除
                    if (isCtrl || isShift || isAlt)
                        break;
                    MaterialTool.deleteMaterial();
                } break;
                case "88": {// 剪切
                    if (!isCtrl || isShift || isAlt)
                        break;
                    MaterialTool.copyMaterialData();
                    MaterialTool.deleteMaterial();
                } break;
                case "219": {
                    if (!isCtrl || isAlt)
                        break;
                    if (isShift)        // 置底图层
                        MaterialTool.topMaterial();
                    else                // 下移图层
                        MaterialTool.upMaterial();
                } break;
                case "221": {
                    if (!isCtrl || isAlt)
                        break;
                    if (isShift)        // 置顶图层
                        MaterialTool.bottomMaterial();
                    else                // 上移图层
                        MaterialTool.downMaterial();
                } break;
            }
            let exSaveCode = ["37", "38", "39", "40"];
            if (!exSaveCode.includes(keyCode)) {
                PrototypeHistory.saveHistory();
            }
            return;
        }
        if (keyCode === "67" && isCtrl && isAlt && !isShift) {// 跨模板复制素材
            MaterialTool.copyOverPage();
            return;
        }


        /****************************************
         ************** 素材对齐操作 **************
         ****** 分为素材组对齐/单个画布对齐 ********
         *****************************************/
            //   1):=====仅当有选时才能操作，以下为已实现的操作=====
            //   2):左对齐（L [76]）
            //   3):右对齐（R [82]）
            //   4):顶对齐（T [84]）
            //   5):底对齐（B [66]）
            //   6):水平居中对齐（C [67]）
            //   7):垂直居中对齐（E [69]）
            //   8):水平均匀分布（）
            //   9):垂直均与分布（）
        let materialGroupEditKey = ["76", "82", "84", "66", "67", "69"];
        if (materialGroupEditKey.includes(keyCode)) {// 存在于素材操作类型
            if (selectedList.length < 1 || isCtrl || isShift || isAlt){
                return;
            }
            // 执行单个素材的对齐
            if (selectedList.length === 1) {
                let  theCurMaterial = media.tool.tempMaterial || media.tool.getCurMaterial();
                if (!theCurMaterial || parseFloat(theCurMaterial.status) !== 0)
                    return;
                let  type = '';
                switch (keyCode) {
                    case "76":// 左对齐
                        type = "left"; break;
                    case "82":// 右对齐
                        type = "right"; break;
                    case "84":// 顶对齐
                        type = "top"; break;
                    case "66":// 底对齐
                        type = "bottom"; break;
                    case "67":// 水平居中对齐
                        type = "center"; break;
                    case "69":// 垂直居中对齐
                        type = "middle"; break;
                }
                if (type) {
                    ElementUpdate.doSetMaterialPos(type);
                    PrototypeHistory.saveHistory();
                }
                return;
            }

            //取第一个素材，判断是否可编辑
            let firstMid = parseInt(selectedList[0]);
            let firstMaterial = media.tool.getMaterialByMid(firstMid);
            if (parseFloat(firstMaterial.status) !== 0)
                return;
            // 执行多素材的对齐
            switch (keyCode) {
                case "76"://左对齐
                    ElementUpdate.alignLocation("left");
                    break;
                case "82"://右对齐
                    ElementUpdate.alignLocation("left_right");
                    break;
                case "84"://顶对齐
                    ElementUpdate.alignLocation("top");
                    break;
                case "66"://底对齐
                    ElementUpdate.alignLocation("top_bottom");
                    break;
                case "67"://水平居中对齐
                    ElementUpdate.alignByaxis("center");
                    break;
                case "69"://垂直居中对齐
                    ElementUpdate.alignByaxis("middle");
                    break;
            }
            PrototypeHistory.saveHistory();
        }
    }
    static documentKeyUp(event) {
        let keyCode = event["keyCode"];                   // 按键键值, 字符串型
        let isCtrl = event.ctrlKey;                         // 是否按下Ctrl
        let isShift = event.shiftKey;                       // 是否按下Shift
        let isAlt = event.altKey;                           // 是否按下Alt

        /* 空格键松开标识 */
        if (keyCode === 32){
            CanvasEvent.stageGrabEnd(event);
        }
        /* shift松开标识 */
        if (keyCode === "16"){
            Z("#selection_tool").css("pointer-events","auto");
        }

        //上下左右 素材操作完，进行保存
        let materialEditKey = ["37", "38", "39", "40"];
        if (materialEditKey.includes(keyCode)) {
            if (selectedList.length === 0) { return;}
            if (isCtrl || isShift || isAlt) { return;}
            if (Const.isActiveInput()) { return;}
            PrototypeHistory.saveHistory();
        }
    }
    static documentCopy(event) {

    }
    static documentPaste(event) {

    }
}

/****************************************
**************** 复制粘贴  ***************
*****************************************/

let types = ['text/html', 'text/plain'];

Z(document).on("copy",(clipboardEvent)=> {//复制：Ctrl + C
    if (Const.isActiveInput()) {// 输入内容操作，不处理
        return;
    }
    if (media.selectedList.length > 0) {// 当前有选中素材时，执行素材复制
        Z.E.forbidden(clipboardEvent);
        MaterialTool.copyMaterialData();
        for (let i = 0;i < types.length;i++) {
            clipboardEvent.clipboardData.setData(types[i], '');
        }
    } else {
        media.tool.tempMetabolic = null;
    }
});
Z(document).on("paste",(clipboardEvent)=> {// 粘贴：Ctrl + V//输入内容操作，不处理
    if (Const.isActiveInput()) {// 输入内容操作，不处理
        return;
    }
    if (Z("#imgFrameEditor")[0].hasAttribute("style")) {// 存在容器操作，不处理
        return;
    }
    // 判断粘贴板是否存在内容
    let items = clipboardEvent.clipboardData.items;
    let isBlank = false;
    if (items.length === 0){
        clipboardEvent.clipboardData.allTypes = types;
        return false;
    }
    for (let i = 0;i < types.length;i++) {
        if (clipboardEvent.clipboardData.getData(types[i])) {
            isBlank = true;
            break;
        }
    }
    if (isBlank) {
        return;
    }

    // 优先判断是否存在粘贴版内容，截取信息，添加内容
    if (clipboardEvent.clipboardData) {
        let $focusDiv = Z('<div id="' + Z.Ids.uuid() + '" contenteditable=true></div>');
        $focusDiv.appendTo(Z(document)).css("position","absolute").css("opacity",0);
        $focusDiv.focus();
        // 延时，获取编辑div中的内容
        let timer = setTimeout(()=> {
            let imgsList = $focusDiv[0].querySelectorAll("img");
            let cText = Z.S.trim( $focusDiv.text());               //获取剪切内容，并去除左右空格
            cText = cText.replace(/\n/g,"-%5-%-%5-");              //保留换行
            cText = cText.replace(/\s/g," ");                      //替换空格
            cText = cText.replace(/-%5-%-%5-/g,"\n");              //保留换行
            // 无内容，清空并返回
            if (!cText && imgsList.length === 0) {
                setTimeout(function(){Z.Dialog.close()},500);
                clearTimeout(timer);
                $focusDiv.remove();
                return;
            }
            // 清空选中列表
            media.tool.clearSelected();
            let preLength = media.tool.getBgMaterialList(media.curPage).length;
            media.tool.ajaxLoadedLength = preLength + imgsList.length;
            // 存在字符串数据，进行添加文字
            if (Z.V.isNotEmpty(cText)) {
                var textMid = preLength;
                preLength++;
                media.tool.ajaxLoadedLength++;
                MaterialTool.createTextMaterial(cText, textMid);
            }
            // 存在图片数据时
            if (imgsList.length > 0) {
                for (let i = 0;i < imgsList.length;i++){
                    let srcStr = imgsList[i].getAttribute("src");
                    UploadImage.uploadFileRequest(srcStr, preLength + i);
                }
            }
            // 清除临时变量
            clearTimeout(timer);
            $focusDiv.remove();
        },100);
    } else if (media.tool.tempMetabolic && media.tool.tempMetabolic.length > 0) {// 临时素材存在，则粘贴该素材
        MaterialTool.copyMaterial(media.tool.tempMetabolic);
    }
});
