/*
* prototypeUpdate.js
* 元素操作类
* */

/*******************************************
 **************** 模型更新 *****************
 ********************************************/
class PrototypeUpdate {
    static updateColor() {
        let setColor = ColorPicker.colorRgba;
    }
}

/*******************************************
 **************** 画布更新 *****************
 ********************************************/
class CanvasUpdate {

}

/*******************************************
 **************** 页面更新 *****************
 ********************************************/
class ScreenUpdate {
    static rulerLine($line) {
        $line = Z($line)[0];
        let isHorizontal = Const.hasClassParent($line, "ruler-horizontal");
        let linesArr = isHorizontal ? screenModel.linesHorizontal : screenModel.linesVertical;
        let styleName = isHorizontal ? "left" : "top";
        for (let obj of linesArr) {
            if (Z(obj.$line)[0] !== $line) {
                continue;
            }
            obj.value = parseFloat($line.querySelector(".ruler-value").innerHTML);
            obj[styleName] = parseFloat($line.style[styleName]);
            return;
        }
    }
}

/*******************************************
 **************** 元素更新 *****************
 ********************************************/
class ElementUpdate {
    // 位置设置---特殊位置设置（上、下、左、右、中）
    static doSetMaterialPos(type) {
        let canvasRect = Canvas.$canvasBg.getBoundingClientRect();
        let showRatio = canvasModel.showRatio;
        let material, $curElem;

        // 1：获取素材的 targetRect 参数
        let targetRect = SelectionTool.getSelectedElemRect();

        // 2：获取理论偏移量
        let move_x = 0, move_y = 0;
        let x = targetRect.left - canvasRect.left;
        let y = targetRect.top - canvasRect.top;
        switch (type) {
            case "left":
                x = 0;
                move_x = canvasRect.left - targetRect.left;
                break;
            case "center":
                x = (canvasRect.width - targetRect.width) / 2;
                move_x = x + canvasRect.left - targetRect.left;
                break;
            case "right":
                x = (canvasRect.width - targetRect.width);
                move_x = x + canvasRect.left - targetRect.left;
                break;
            case "top":
                y = 0;
                move_y = canvasRect.top - targetRect.top;
                break;
            case "middle":
                y = (canvasRect.height - targetRect.height) / 2;
                move_y = y + canvasRect.top - targetRect.top;
                break;
            case "bottom":
                y = canvasRect.height - targetRect.height;
                move_y = y + canvasRect.top - targetRect.top;
                break;
        }
        x /= showRatio;
        y /= showRatio;
        move_x /= showRatio;
        move_y /= showRatio;
        if({}.createMode === 0) {
            x = Exchange.px2mm(x, {}.dpi);
            y = Exchange.px2mm(y, {}.dpi);
        }

        // 3：处理每个素材的偏移
        for(let i = 0;i < media.selectedList.length;i++) {
            material = media.tool.getCurMaterial(i);
            $curElem = media.tool.getCurSvgElement(i);
            let elemTransList = $curElem.transform.baseVal;
            let elemMatrix;
            for(let j = 0;j < elemTransList.length;j++) {
                if (elemTransList[j].targetType === 2){
                    elemMatrix = elemTransList[j].matrix;
                    break;
                }
            }
            material.x = elemMatrix.e + move_x;
            material.y = elemMatrix.f + move_y;
            let trans = $curElem.getAttribute('transform');
            trans = trans.replace(/translate\s?\([^)]+\)/, 'translate(' + material.x + ' ' + material.y + ')');
            $curElem.setAttribute('transform', trans);
            // 刷新source
            ElementUpdate.updateMaterialSource(material, $curElem);
        }

        // 4：更新选中框、输入框的值
        SelectionTool.selectionToolsShow_group();
        MediaListen.setPoxBoxValueInput(x, y);

        // 5：保存历史
        PrototypeHistory.saveHistory();
    }
    // 位置更新
    static updateMaterialPos(x, y, index) {
        let material = media.tool.getCurMaterial(index);
        let $curElem = media.tool.getCurSvgElement(index);
        if (!material || !$curElem)
            return;

        ElementUpdate.updateSvgLocation(x, y, index);
        ElementUpdate.updateMaterialSource(material, $curElem);
        media.selectedList.length === 1 && SelectionTool.setToolStaticLoc();
    }
    // 更新展示坐标
    static updateSvgLocation(x, y, index) {
        let material = media.tool.getCurMaterial(index);
        let $curElem = media.tool.getCurSvgElement(index);
        if (!material || !$curElem)
            return;

        material.x = x;
        material.y = y;

        let trans = $curElem.getAttribute("transform");
        trans = trans.replace(/translate\([^)]+\)/,"translate(" + x + " " + y + ")");
        $curElem.setAttribute("transform",trans);
    }
    // 更新素材source
    static updateMaterialSource(material, $curElem) {
        material = material || media.tool.tempMaterial || media.tool.getCurMaterial();
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem)
            return;
        let $gSvg = $curElem.querySelector("g");
        let $g = document.createElementNS(Const.xmlns, "g");
        let attrs = $curElem.attributes, attrName = "", attrVal = "";
        for (let i = 0; i < attrs.length; i++)
        {
            attrName = attrs[i].name;
            if (attrName === "id" || attrName === "data-mid" || attrName === "data-pos" || attrName === "opacity")
                continue;
            attrVal = attrs[i].value;
            if (attrName === "class"){
                attrVal = attrVal || "";
                attrVal = attrVal.replace(/hiddenDoing/g, "").replace(/\s\s/g," ").trim();
            }
            $g.setAttribute(attrName, attrVal);
        }
        $g.innerHTML = $gSvg.outerHTML;
        material.source = $g.outerHTML;
        $g = null;
    }
    // 更新形状，边框尺寸大小
    static updateStrokeStrokeSize(val, $input) {
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        let $svg = $curElem.querySelector("svg");
        if (material.targetType !== 5)
            return;
        let svgType = $svg.getAttribute("data-targetType");
        // 分情况处理
        switch (svgType){
            case 'shape-rectStroke': {
                let absX = $svg.viewBox.baseVal.width;
                let absY = $svg.viewBox.baseVal.height;
                let maxVal = Const.getMinNum([absX,absY]) / 2;
                if (val > maxVal)
                    val = maxVal.toFixed(4);
                if ($input.tagName.toLowerCase() === 'input' && $input.targetType === 'text')
                    $input.value = val;
                $svg.setAttribute("data-rectstroke", val);
                // 更新并保存
                if (media.event.drawRectStrokeResize($svg,absX,absY)) {
                    ElementUpdate.updateMaterialSource(material, $curElem);
                    SelectionTool.setToolStaticLoc();
                    PrototypeHistory.saveHistory();
                }
            }break;
            case 'shape-ellipse': {
                let $ellipse = $curElem.querySelector("ellipse");
                let viewWidth = $svg.viewBox.baseVal.width;
                let viewHeight = $svg.viewBox.baseVal.height;
                let viewR = Const.getMinNum([viewWidth,viewHeight])/2;
                val = viewR * val/100;
                let setRx = viewWidth/2 - val/2;
                let setRy = viewHeight/2 - val/2;
                $ellipse.setAttribute("stroke-width",val);
                $ellipse.setAttribute("rx",setRx);
                $ellipse.setAttribute("ry",setRy);
                // 更新并保存
                ElementUpdate.updateMaterialSource(material, $curElem);
                SelectionTool.setToolStaticLoc();
                PrototypeHistory.saveHistory();
            }break;
            case 'shape-pen': {
                if ($input.tagName.toLowerCase() === 'input' && $input.targetType === 'text')
                    $input.value = val;
                let $path = $svg.querySelector('path');
                $path.setAttribute("stroke-width", val);
                // 更新并保存
                ElementUpdate.updateMaterialSource(material, $curElem);
                SelectionTool.setToolStaticLoc();
                PrototypeHistory.saveHistory();
            }break;
            case 'shape-table': {
                if ($input.tagName.toLowerCase() === 'input' && $input.targetType === 'text')
                    $input.value = val;
                val = parseFloat(val);
                // 去除多余的svg
                let $svgWrap = $svg.parentElement;
                let $$svg = $svgWrap.children;
                while ($$svg[1])
                    $svgWrap.removeChild($$svg[1]);
                // 取得设置前的边框大小
                let strokeWidth_before = parseFloat($svg.querySelector('line').getAttribute("stroke-width"));
                // 设置“单元格”
                let $$gTr = $svg.children;
                for (let i = 0;i < $$gTr.length;i++) {
                    let firstRow = i === 0;
                    let $gTr = $$gTr[i];
                    // 单元格处理
                    for (let $gTd of $gTr.children) {
                        let $$line = $gTd.querySelectorAll('line');
                        // rect大小设置
                        let $rect = $gTd.querySelector("rect");
                        let rectWidth = $rect.width.baseVal.value + (val - strokeWidth_before) / 2;
                        let rectHeight = $rect.height.baseVal.value + (val - strokeWidth_before) / 2;
                        $rect.setAttribute("width", rectWidth + "");
                        $rect.setAttribute("height", rectHeight + "");
                        // 边框设置
                        $$line.forEach($line => {
                            $line.setAttribute("stroke-width", val);
                            switch ($line.getAttribute("data-targetType")) {
                                case "left":
                                    firstRow && $line.setAttribute("y1", - val / 2 + "");
                                    $line.setAttribute("y2", rectHeight + "");
                                    break;
                                case "top":
                                    $line.setAttribute("x2", rectWidth + "");
                                    break;
                                case "right":
                                    $line.setAttribute("y1", rectHeight + "");
                                    break;
                                case "bottom":
                                    $line.setAttribute("x1", rectWidth + "");
                                    break;
                            }
                        });
                        // 单元格偏移
                        let matrix = $gTd.transform.baseVal[0].matrix;
                        let setTrans = "translate(" + (matrix.e + (val - strokeWidth_before) / 2) + " "
                            + (matrix.f + (val - strokeWidth_before) / 2) + ")";
                        $gTd.setAttribute("transform", setTrans);
                    }
                }
                // 重设素材大小
                let $rect = $curElem.querySelector("rect");
                $rect.setAttribute("width", "1");
                $rect.setAttribute("height", "1");
                $svg.removeAttribute("viewBox");
                $svg.removeAttribute("width");
                $svg.removeAttribute("height");
                let elemRect = $curElem.getBBox();
                let setWidth = elemRect.width + "";
                let setHeight = elemRect.height + "";
                $rect.setAttribute("width", setWidth);
                $rect.setAttribute("height", setHeight);
                $svg.setAttribute("width", setWidth);
                $svg.setAttribute("height", setHeight);
                $svg.setAttribute("viewBox", "0 0 " +  setWidth + " " + setHeight);

                // 校准边框样式，复制一个svg
                let $svgClone = $svg.cloneNode(true);
                $svgClone.querySelectorAll("g[data-row]").forEach(function($dTd) {
                    $dTd.removeChild($dTd.querySelector("rect"));
                    if (($dTd.querySelector("g[transform]")))
                        $dTd.removeChild($dTd.querySelector("g[transform]"));
                });
                $svg.parentElement.appendChild($svgClone);
                // 更新并保存
                ElementUpdate.updateMaterialSource(material, $curElem);
                SelectionTool.setToolStaticLoc();
                PrototypeHistory.saveHistory();
            }break;
        }
    }
    // 图片圆角
    static setImageEffectRadius(imgRadius, material, $curElem) {
        // 获取素材，节点
        material = material || media.tool.tempMaterial || media.tool.getCurMaterial();
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();

        if (!material || !$curElem)
            return;

        let $svg = $curElem.querySelector("svg");
        let $img = $svg.querySelector("image");
        material.type = parseFloat(material.type);

        // 处理
        if (material.type !== 0 && material.type !== 2)
            return;

        imgRadius = Math.round(imgRadius || material.imgRadius || 0);   // imgRadius = "11 11 11 11"
        material.imgRadius = imgRadius;
        // 判断圆角是否为0
        if (imgRadius === 0) {
            $img.hasAttribute("clip-path") && Z($img).removeAttr("clip-path");
            $defs && Z($defs).remove();
            return;
        }
        let viewBox = $svg.viewBox.baseVal;
        let clipId = "#radius_" + $curElem.id;
        let $defs = Z($svg).find(clipId).parent()[0];
        // 判断是否存在圆角节点
        if (!$defs) {
            // 移除所有可能存在的 $defs
            let $allDefs = Z($svg).find('[id^="radius_svgElementSon_"]');
            $allDefs.each((item)=> Z(item).parent().remove());
            // 移除绑定的 圆角
            $img.removeAttribute("clip-path");

            // 插入新的 $defs
            let defs = '<defs><clipPath id="radius_' + $curElem.id + '">' +
                '<rect x="' + viewBox.x + '" y="' + viewBox.y + '" ' +
                'width="' + viewBox.width + '" height="' + viewBox.height + '" rx="' + imgRadius + '%">' +
                '</rect></clipPath></defs>';
            $svg.insertAdjacentHTML("afterbegin",defs);
        } else {
            let $rect = Z($defs).find("rect")[0];
            $rect.setAttribute("x", viewBox.x);
            $rect.setAttribute("y", viewBox.y);
            $rect.setAttribute("width", viewBox.width);
            $rect.setAttribute("height", viewBox.height);
            $rect.setAttribute("rx", imgRadius + "%");
        }
        // 给 image 绑定 clip-path
        if (!$img.hasAttribute("clip-path"))
            $img.setAttribute("clip-path", "url(" + clipId + ")");
    }
    // 更新透明度
    static updateSvgTransparency(transparency) {
        if (media.selectedList.length === 0)
            return;
        transparency /= 100;
        for (let i = 0;i < media.selectedList.length;i++) {
            let svgElement = media.tool.getCurSvgElement(i);
            let material = media.tool.getCurMaterial(i);
            svgElement.removeAttribute("opacity");
            if (material.targetType === 1 || material.targetType === 5){
                svgElement.setAttribute("fill-opacity",transparency);
                svgElement.setAttribute("stroke-opacity",transparency);
            }
        }
    }
    // 更新文字字间距
    static updateFontLetterSpacing(letterSpacing) {
        // 主方法
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        if (!material || (material.targetType !== 1 && material.targetType !== 5))
            return;

        letterSpacing = parseFloat(letterSpacing + "");
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        let $gWrap = $curElem.querySelector('g');
        let $svg = [...$gWrap.children].pop();

        if (material.targetType === 5) {
            let dataType = $svg.getAttribute("data-targetType");
            if (dataType === "shape-table")
                return ElementUpdate.updateTableFontLetterSpacing(letterSpacing);
        }

        let $gSvg = $curElem.querySelector("g");
        let $$svg = $gSvg.children;
        while ($$svg.length > 1)
            $gSvg.removeChild($$svg[0]);
        let $rect = $curElem.querySelector("rect");

        // 1：保存变化前的值，去除宽高限制
        let oldData = media.tool.getEleData($curElem);
        $svg.removeAttribute("viewBox");
        $svg.removeAttribute("width");
        $svg.removeAttribute("height");
        $rect.setAttribute("width", '1');
        $rect.setAttribute("height", '1');

        // 2：循环处理每个字符路径
        // 主方法
        for (let $gLine of Z($svg).children("g")) {
            if (material.textVertical === 'normal') {
                let dx = parseFloat($gLine.getAttribute('data-dx'));
                let gTrans = $gLine.getAttribute('transform');
                dx = dx > 0 ? dx : 0;
                gTrans = gTrans.replace(/translate\s?\(\s?-?\d+(\.\d+)?/, 'translate(' + dx);
                $gLine.setAttribute('transform', gTrans);
            }
            let $$gPath = $gLine.querySelectorAll(".font-path");

            // 第一个字的偏移
            let transX = $$gPath[0].transform.baseVal[0].matrix.e;
            let transY;
            for (let i = 0;i < $$gPath.length;i++) {
                let $gPath = $$gPath[i];
                let pathText = $gPath.getAttribute('data-text').replace(/-%6-%-%0-/g, '<');
                let pathTrans = $gPath.getAttribute("transform");
                let transDataVal = parseFloat($gPath.getAttribute("data-x"));
                let transMatrix = $gPath.transform.baseVal[0].matrix;
                let matrixE = transMatrix.e;
                let matrixF = transMatrix.f;
                if (material.textVertical === 'normal'){
                    transY = matrixF;
                    transX = transDataVal + letterSpacing * i;
                } else {
                    transX = matrixE;
                    transY = transDataVal + letterSpacing * i;
                    if (/[\u4e00-\u9fa5]/.test(pathText))
                        transY -= $gPath.getBBox().y;
                }
                pathTrans = pathTrans.replace(/translate\([^)]+\)/, 'translate(' + transX + ' ' + transY +')');
                $gPath.setAttribute("transform", pathTrans);

                // 下划线判断
                let $line = Z($gPath).children("line")[0];
                if (material.textDecoration && $line) {
                    let tempX = parseFloat($gPath.getAttribute("data-width")) + letterSpacing;
                    $line.setAttribute("x2",tempX);
                }
            }
        }

        // 3：设置素材的宽高、属性
        let setWidth, setHeight;
        if (material.textVertical !== 'normal') {
            setWidth = $curElem.getBBox().width;
            setHeight = $curElem.getBBox().height;
        } else {
            material.width =  $curElem.getBBox().width;
            if (!material.height) {
                material.height = oldData.height;
            }
            setWidth = material.width;
            setHeight = material.height;
        }

        material.letterSpacing = letterSpacing;
        $svg.setAttribute("viewBox","0 0 " + setWidth + " " + setHeight);
        $svg.setAttribute("width", setWidth);
        $svg.setAttribute("height", setHeight);
        $rect.setAttribute("width", setWidth);
        $rect.setAttribute("height", setHeight);
        $curElem.setAttribute("data-letterspacing", material.letterSpacing);

        // 4：特效和展示
        // 文字缩放
        ElementUpdate.setTextZoom();
        // 文字对齐
        let textAlign = material.textAlign;
        if (material.textVertical === 'normal')
            ElementUpdate.setElementAlign(textAlign, material, $curElem);
        // 文字特效
        ElementUpdate.doTextSpecialSet();
        Const.editOverSet($curElem);      // 位置较准
        SelectionTool.setToolStaticLoc();         // 选择框定位
    }
    // 文字缩放
    static setTextZoom(textZoom, material, $curElem) {
        //获取参数，节点
        material = material || media.tool.tempMaterial || media.tool.getCurMaterial();
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();

        if (!material || !$curElem)
            return;

        material.type = parseFloat(material.type);
        let $gSvg = $curElem.querySelector("g");
        let $$svg = $gSvg.children;
        let svgLength = $$svg.length;
        let $svg = $$svg[svgLength - 1];
        let $rect = $curElem.querySelector("rect");

        //处理
        textZoom = textZoom || material.textZoom;   //textZoom = "111 111"
        if (material.type !== 1 || !textZoom)
            return;

        let zoomData = textZoom.split(" ");
        let zoomFirst = parseFloat(zoomData[0]);
        let zoomSecond = parseFloat(zoomData[1]);
        let widthZoom, heightZoom;
        if (material.textVertical === 'normal'){
            widthZoom = zoomFirst;
            heightZoom = zoomSecond;
        } else {
            widthZoom = zoomSecond;
            heightZoom = zoomFirst;
        }
        let svgWidth = parseFloat($svg.getAttribute("width"));
        let svgHeight = parseFloat($svg.getAttribute("height"));
        let setWidth = svgWidth * widthZoom;
        let setHeight = svgHeight * heightZoom;

        // 设置宽高
        for (let $svgElem of $$svg) {
            $svgElem.setAttribute("width", setWidth + '');
            $svgElem.setAttribute("height", setHeight + '');
        }
        $rect.setAttribute("width", setWidth + '');
        $rect.setAttribute("height", setHeight + '');
    }
    // 更新表格字间距
    static updateTableFontLetterSpacing(letterSpacing) {
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        if (!material || material.targetType !== 5)
            return;

        letterSpacing = parseFloat(letterSpacing + "");
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        let $gWrap = $curElem.querySelector('g');
        let $svg = $gWrap.querySelector("svg");
        let $$svg = $gWrap.children;
        while ($$svg.length > 1)
            $gWrap.removeChild($$svg[$$svg.length - 1]);
        let dataType = $svg.getAttribute("data-targetType");
        if (dataType !== "shape-table")
            return;

        let $activeElem = document.activeElement;
        if ($activeElem.className.includes("tableText-editArea")) {
            $activeElem.style.letterSpacing = letterSpacing + "px";
        } else {
            material.letterSpacing = letterSpacing;
            let $$gTd = $svg.querySelectorAll("g[data-colspan]");
            for (let $gTd of $$gTd) {
                $gTd.setAttribute("data-letterspacing", letterSpacing);
                let $gPathSvg = $gTd.querySelector("g");
                let $svgText = $gPathSvg.querySelector("svg");
                let $$line = $svgText.children;
                // 遍历每行
                for (let $line of $$line) {
                    let $$path = $line.querySelectorAll("g.font-path");
                    let allPathLength = $$path.length;
                    // path偏移
                    for (let i = 0;i < allPathLength;i++) {
                        let $path = $$path[i];
                        let pathX = parseFloat($path.getAttribute("data-x")) + i * letterSpacing;
                        let pathTrans = $path.getAttribute("transform");
                        pathTrans = pathTrans.replace(/translate\s*\([^\s]+/, "translate(" + pathX);
                        $path.setAttribute("transform", pathTrans);
                    }
                }
                // 尺寸校准
                let svgTextBox = $svgText.getBBox();
                let svgTextView = $svgText.viewBox.baseVal;
                $svgText.setAttribute("width", svgTextBox.width);
                $svgText.setAttribute("height", svgTextBox.height);
                $svgText.setAttribute("viewBox", svgTextView.x + " " + svgTextView.y + " " + svgTextBox.width + " " + svgTextBox.height);
                // 内容对齐
                let tdAlign = $gTd.getAttribute("data-textalign") || "center";
                let gPathSvgTrans = $gPathSvg.transform.baseVal[0].matrix;
                let gTdWidth = $gTd.querySelector("rect").width.baseVal.value;
                let gPathSvgWidth = $gPathSvg.getBBox().width;
                let setGPathSvgTrans;
                switch(tdAlign) {
                    case "left":
                        setGPathSvgTrans = 0;
                        break;
                    case "center":
                        setGPathSvgTrans = (gTdWidth - gPathSvgWidth)/2;
                        break;
                    case "right":
                        setGPathSvgTrans = gTdWidth - gPathSvgWidth;
                        break;
                }
                setGPathSvgTrans = "translate(" + setGPathSvgTrans + " " + gPathSvgTrans.f + ")";
                $gPathSvg.setAttribute("transform", setGPathSvgTrans);
                // 多行处理
                if ($$line.length <= 1)
                    continue;

                let svgLineWidth = $svgText.getBBox().width;
                for (let $line of $$line) {
                    let lineBoxWidth = $line.getBBox().width;
                    let lineTransX;
                    switch(tdAlign) {
                        case "left":
                            lineTransX = 0;
                            break;
                        case "center":
                            lineTransX = (svgLineWidth - lineBoxWidth)/2;
                            break;
                        case "right":
                            lineTransX = svgLineWidth - lineBoxWidth;
                            break;
                    }
                    let lineTransY = $line.transform.baseVal[0].matrix.f;
                    let setLineTrans = "translate(" + lineTransX + " " + lineTransY +")";
                    $line.setAttribute("transform", setLineTrans);
                }
                // 位置较准
                ElementUpdate.resetTdTextSizeTrans($gTd);
            }
            // 更新素材source
            ElementUpdate.updateMaterialSource();
        }
    }
    // 文字内多行文本对齐
    static setElementAlign(alignType, material, $curElem) {
        // 处理每行 path 路径的偏移
        let setPathsTrans = ($g, wrapWidth, width, justify)=> {
            // 1：不存在 data-x 属性、或只有一个 path，返回
            let $$gPaths = $g.querySelectorAll('.font-path');
            let pathsNum = $$gPaths.length;
            if (pathsNum === 0)
                return;

            let $lastPath = $$gPaths[pathsNum - 1];
            let lastX = parseFloat($lastPath.getAttribute('data-x') || 0);
            if (!lastX)
                return;

            // 2：取 data-justify，判断对齐模式、是否需要计算
            let justifyDone = Boolean(parseFloat($g.getAttribute('data-justify')));
            if (justify) {
                if (justifyDone)
                    return;
                $g.setAttribute('data-justify', '1');
            } else {
                if (!justifyDone)
                    return;
                $g.setAttribute('data-justify', '0');
            }
            // 3：计算偏移量
            if (justifyDone) {
                let letterSpacing = parseFloat(material.letterSpacing + '');
                for (let i = 0;i < $$gPaths.length;i++)
                {
                    let $gPath = $$gPaths[i];
                    let setX = parseFloat($gPath.getAttribute('data-x')) + letterSpacing * i;
                    let trans = $gPath.getAttribute('transform');
                    trans = trans.replace(/translate\s?\(\s?-?\d+(\.\d+)?/, 'translate(' + setX);
                    $gPath.setAttribute('transform', trans);
                }
            } else {
                let spaceWidth = wrapWidth - width;
                let space = spaceWidth / ($$gPaths.length - 1);
                for (let i = 0;i < $$gPaths.length;i++) {
                    let $gPath = $$gPaths[i];
                    let pathX = parseFloat($gPath.getAttribute('data-x'));
                    let setX = pathX + (space + letterSpacing) * i;

                    let trans = $gPath.getAttribute('transform');
                    trans = trans.replace(/translate\s?\(\s?-?\d+(\.\d+)?/, 'translate(' + setX);
                    $gPath.setAttribute('transform', trans);
                }
            }
        };

        // 获取参数，节点
        material = material || media.tool.tempMaterial || media.tool.getCurMaterial();
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem)
            return;

        // 对齐操作之前，取消文字特效
        let textSpecial = material.textSpecial;
        let idObjArr = Const.getIdObjArrFromMaterial(material);
        ElementUpdate.doTextSpecialSet('normal', idObjArr);

        // 主方法，执行对齐
        material.textAlign = alignType;
        $curElem.setAttribute("data-textalign",alignType);

        let letterSpacing = parseFloat(material.letterSpacing + '');
        let $gSvg = $curElem.querySelector("g");
        let $$svg = $gSvg.children;
        while ($$svg.length > 1)
            $gSvg.removeChild($$svg[0]);
        let $svg = $$svg[0];
        let wrapWidth = $svg.viewBox.baseVal.width;
        let $$gLine = $svg.children;
        wrapWidth = Math.round(wrapWidth);

        [].map.call($$gLine, ($g)=> {
            // 计算前，非 justify 则先复位
            if (alignType !== 'justify')
                setPathsTrans($g, wrapWidth);

            // 执行计算
            let dx, boxX, boxWidth, transX;
            dx = parseFloat($g.getAttribute("data-dx") || 0);
            dx = dx > 0 ? dx : 0;
            boxX = $g.getBBox().x;
            boxX = boxX > 0 ? Math.ceil(boxX) : 0;
            boxWidth = Math.round($g.getBBox().width + boxX);

            switch(alignType) {
                case "left": transX = dx; break;
                case "center":
                    transX = dx + (wrapWidth - boxWidth) / 2;
                    transX = transX > 0 ? transX : 0;
                    break;
                case "right":
                    transX = dx + wrapWidth - boxWidth;
                    transX = transX > 0 ? transX : 0;
                    break;
                case "justify":
                    setPathsTrans($g, wrapWidth, boxWidth, 1);
                    transX = dx;
                    break;
            }
            $g.setAttribute("transform", "translate(" + transX + " " + $g.transform.baseVal[0].matrix.f + ")");
        });

        // 文字特效
        ElementUpdate.doTextSpecialSet(textSpecial, idObjArr);
    }
    // 文字特效
    static doTextSpecialSet(textSpecial, idObjArr, doDefault) {
        // 1：主方法，定义变量
        if (!textSpecial) {// 1.1：当前素材参数
            let curMaterial = media.tool.getCurMaterial();
            if (curMaterial && curMaterial.textSpecial)
                textSpecial = curMaterial.textSpecial;
        }
        if (!textSpecial)
            return;

        // 2：获取midArr、bidArr
        Const.setIdArr(idObjArr);
        let midLength = Const.midArr.length;
        if (midLength === 0)
            return;

        // 3：循环所有待处理素材
        for (let i = 0;i < midLength;i++) {
            if (Const.bidArr[i] !== media.curPage)
                continue;
            let $curElem = media.tool.getSvgElementByMid(Const.midArr[i]);
            let material = media.tool.getMaterialByMid(Const.midArr[i], Const.bidArr[i]);

            // 1：重置素材
            ElementUpdate.resetTextSpecial(material, $curElem);
            // 2：修改素材
            switch(textSpecial) {
                case 'shadow-1': ElementUpdate.setTextShadow_1(material, $curElem); break;
                case 'stroke-1': ElementUpdate.setTextStroke_1(material, $curElem, doDefault); break;
                case 'stroke-2': ElementUpdate.setTextStroke_2(material, $curElem, doDefault); break;
                case 'stroke-3': ElementUpdate.setTextStroke_3(material, $curElem, doDefault); break;
                case 'stroke-4': break;
                case 'stroke-5': ElementUpdate.setTextStroke_5(material, $curElem); break;
                case 'cartoon-1': break;
                case 'cartoon-2': break;
                case 'gradient-1': ElementUpdate.setTextGradient_1(material, $curElem); break;
                case 'gradient-2': ElementUpdate.setTextGradient_2(material, $curElem); break;
                case 'gradient-3': ElementUpdate.setTextGradient_3(material, $curElem); break;
                case 'gradient-4': ElementUpdate.setTextGradient_4(material, $curElem); break;
                case 'pattern-1': ElementUpdate.setTextPattern_1(material, $curElem); break;
            }
            // 3：素材属性
            material.textSpecial = textSpecial;
            // 4：选择框定位
            SelectionTool.selectionTool_show();
            // 5：设置标识
            $curElem.setAttribute('data-textspecial', textSpecial);
            $curElem.setAttribute('data-textspecialcolor', material.textSpecialColor);
            ElementUpdate.updateMaterialSource(material,$curElem);
        }

        // 4：显示额外的颜色设置
        EditBtnTool.showSpecialColorPicker(textSpecial, Const.midArr[0]);

        // 5：显示大小滑块
        EditBtnTool.showTextSpecialSize(textSpecial, Const.midArr[0]);
    }
    // 文字特效_0：normal
    static resetTextSpecial(material, $curElem) {
        let $rect = $curElem.querySelector('rect');
        let $gInner = $curElem.querySelector('g');
        let $$svg = Z($gInner).children('svg');
        let svgListLength = $$svg.length;
        let $svg = $$svg[svgListLength - 1];
        // 1：去除阴影
        let removeShadow1 = ()=> {
            let $feBlend = $gInner.querySelector('defs[data-targetType="shadow-1"]');
            if (!$feBlend)
                return;
            let resetSize = parseFloat($feBlend.getAttribute('data-resetsize') || 0);
            $gInner.removeChild($feBlend);
            let svgViewBox = $svg.viewBox.baseVal;
            let setWidth = parseFloat($svg.getAttribute('width')) - resetSize;
            let setHeight = parseFloat($svg.getAttribute('height')) - resetSize;
            $rect.setAttribute('width', setWidth);
            $rect.setAttribute('height', setHeight);
            $svg.setAttribute('viewBox', '0 0 ' + (svgViewBox.width - resetSize) + ' ' + (svgViewBox.height - resetSize));
            $svg.setAttribute('width', setWidth);
            $svg.setAttribute('height', setHeight);
            $svg.removeAttribute('filter');
        };
        // 2：去除描边(多余的svg)
        let removeStroke1 = ()=> {
            if (svgListLength <= 1)
                return;
            let i = 0;
            while(svgListLength > 1) {
                $gInner.removeChild($$svg[i]);
                svgListLength--;
                i++;
            }
            ElementUpdate.resetViewBoxByStrokeWidth(0, material, $curElem);
            material.textSpecialSize = -1;
            $curElem.removeAttribute("data-textspecialsize");
        };
        // 3：去除渐变1、渐变2、渐变4；去除mask属性
        let removeGradient1 = ()=> {
            let $gradient1 = $gInner.querySelector('defs[data-targetType="gradient-1"]');
            let $gradient2 = $gInner.querySelector('defs[data-targetType="gradient-2"]');
            let $gradient4 = $gInner.querySelector('defs[data-targetType="gradient-4"]');
            if ($gradient1)
                $gInner.removeChild($gradient1);
            if ($gradient2)
                $gInner.removeChild($gradient2);
            if ($gradient4)
                $gInner.removeChild($gradient4);
            $svg.removeAttribute('mask');
        };
        // 4：去除渐变3
        let removeGradient3 = ()=> {
            let $$gradient = $gInner.querySelectorAll('defs[data-targetType="gradient-3"]');
            if ($$gradient.length === 0)
                return;
            [].forEach.call($$gradient, function($gradient){
                $gInner.removeChild($gradient);
            });
        };
        // 5：去除图案1
        let removePattern1 = ()=> {
            let $pattern = $gInner.querySelector('defs[data-targetType="pattern-1"]');
            if (!$pattern)
                return;
            $gInner.removeChild($pattern);
            $svg.removeAttribute('fill');
        };

        // 1：去除阴影1
        // removeShadow1();
        // 2：去除描边1、描边2、描边3、描边5
        removeStroke1();
        // 3：去除渐变1、渐变2
        // removeGradient1();
        // 4：去除渐变3
        // removeGradient3();
        // 5：去除图案1
        removePattern1();
    }
    // 文字特效_1：shadow-1：偏移 13 对应 阴影 10，阴影 10 对应 字体 30pt
    static setTextShadow_1(material, $curElem) {
        let $rect = $curElem.querySelector('rect');
        let $gInner = $curElem.querySelector('g');
        let $$svg = Z($gInner).children('svg');
        let svgListLength = $$svg.length;
        let $svg = $$svg[svgListLength - 1];
        let textSize = material.fontSize;
        if (parseFloat({}.createMode) === 1)
            textSize = Exchange.px2pt(textSize);
        let blurSize = 10/30 * textSize;
        let offsetSize = 13/10 * blurSize;
        let resetSize = 3 * offsetSize;
        let filterId = 'textSpecialFilter_' + new Date().getTime();
        let feBlendStr = '<defs data-targetType="shadow-1" data-resetsize="' + resetSize +'">\n' +
            '    <filter id="' + filterId + '" x="-100%" y="-100%" width="300%" height="300%">\n' +
            '      <feOffset result="offOut" in="SourceGraphic" dx="' + offsetSize + '" dy="' + offsetSize + '" />\n' +
            '      <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="' + blurSize + '" />\n' +
            '      <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />\n' +
            '    </filter>\n' +
            '</defs>';
        $gInner.insertAdjacentHTML('afterbegin', feBlendStr);
        $svg.setAttribute('filter', 'url(#' + filterId + ')');
        // 重设 SVG 宽高
        let svgViewBox = $svg.viewBox.baseVal;
        let setWidth = parseFloat($svg.getAttribute('width')) + resetSize;
        let setHeight = parseFloat($svg.getAttribute('height')) + resetSize;
        $rect.setAttribute('width', setWidth);
        $rect.setAttribute('height', setHeight);
        $svg.setAttribute('viewBox', '0 0 ' + (svgViewBox.width + resetSize) + ' ' + (svgViewBox.height + resetSize));
        $svg.setAttribute('width', setWidth);
        $svg.setAttribute('height', setHeight);
    }
    // 文字特效_2：stroke-1：描边 15 对应 字体 20pt
    // 默认：字体颜色（#FFFFFF）特殊颜色（#000000）
    static setTextStroke_1(material, $curElem, doDefault) {
        let $gInner = $curElem.querySelector('g');
        let $$svg = Z($gInner).children('svg');
        let svgListLength = $$svg.length;
        let $svg = $$svg[svgListLength - 1];
        if (svgListLength === 0)
            return;

        // 1：定义素材颜色
        if (doDefault)
            ElementUpdate.updateTextColor(material, $curElem, "#FFFFFF");

        // 2：定义描边属性
        if (doDefault)
            material.textSpecialColor = "#000000";
        let specialColorArr = material.textSpecialColor.split(',');
        let strokeFill = specialColorArr[0];
        let textSize = material.fontSize;
        if (parseFloat({}.createMode) === 1)
            textSize = Exchange.px2pt(textSize);
        let textSpecialSize = material.textSpecialSize;
        if (textSpecialSize <= 0)
            textSpecialSize = 15/20;
        let strokeWidth = textSpecialSize * textSize;

        // 3：计算大小
        ElementUpdate.resetViewBoxByStrokeWidth(strokeWidth, material, $curElem);

        // 4：插入克隆元素
        let $svgCopy = $svg.cloneNode(true);
        $svgCopy.setAttribute('stroke', strokeFill);
        $svgCopy.setAttribute('stroke-width', strokeWidth);
        $svgCopy.setAttribute('data-textspecialcolor', strokeFill);
        $svg.insertAdjacentElement('beforebegin', $svgCopy);

        // 4：定义属性特殊大小
        material.textSpecialSize = textSpecialSize;
        $curElem.setAttribute("data-textspecialsize", material.textSpecialSize);
    }
    // 文字特效_3：stroke-2：内描边 6 对应 外描边 18，外描边 18 对应 字体 30pt
    // 默认：字体颜色（#FFFFFF）特殊颜色（#000000）
    static setTextStroke_2(material, $curElem, doDefault){
        let $gInner = $curElem.querySelector('g');
        let $$svg = Z($gInner).children('svg');
        let svgListLength = $$svg.length;
        let $svg = $$svg[svgListLength - 1];
        if (svgListLength === 0)
            return;

        // 1：定义素材颜色
        if (doDefault)
            ElementUpdate.updateTextColor(material, $curElem, "#000000");

        // 2：定义描边属性
        if (doDefault)
            material.textSpecialColor = "#000000";
        let specialColorArr = material.textSpecialColor.split(',');
        let strokeFill = specialColorArr[0];
        let textSize = material.fontSize;
        if (parseFloat({}.createMode) === 1)
            textSize = Exchange.px2pt(textSize);
        let strokeWidthOuter = 18/30 * textSize;
        let strokeWidthInner = 6/18 * strokeWidthOuter;

        // 2：计算大小
        ElementUpdate.resetViewBoxByStrokeWidth(strokeWidthOuter, material, $curElem);

        // 3：插入克隆元素
        let $svgInner = $svg.cloneNode(true);
        $svgInner.setAttribute('stroke', '#ffffff');
        $svgInner.setAttribute('stroke-width', strokeWidthInner);
        $svg.insertAdjacentElement('beforebegin', $svgInner);
        let $svgOuter = $svg.cloneNode(true);
        $svgOuter.setAttribute('stroke', strokeFill);
        $svgOuter.setAttribute('stroke-width', strokeWidthOuter);
        $svgOuter.setAttribute('data-textspecialcolor', strokeFill);
        $svgInner.insertAdjacentElement('beforebegin', $svgOuter);
    }
    // 文字特效_4：stroke-3：内描边 10 对应 中描边 12，中描边 12 对应 外描边 20pt，外描边 20 对应 字体 30pt
    // 默认：字体颜色（#FFFFFF）特殊颜色（#000000）
    static setTextStroke_3(material, $curElem, doDefault) {
        let $gInner = $curElem.querySelector('g');
        let $$svg = Z($gInner).children('svg');
        let svgListLength = $$svg.length;
        let $svg = $$svg[svgListLength - 1];
        if (svgListLength === 0)
            return;

        // 1：定义素材颜色
        if (doDefault)
            ElementUpdate.updateTextColor(material, $curElem, "#FFFFFF");

        // 2：定义描边属性
        if (doDefault)
            material.textSpecialColor = '#BB0000,#BB0000';
        let specialColorArr = material.textSpecialColor.split(',');
        let strokeOuterFill = specialColorArr[0];
        let strokeInnerFill = specialColorArr[1] || '#BB0000';
        let textSize = material.fontSize;
        if (parseFloat({}.createMode) === 1)
            textSize = Exchange.px2pt(textSize);
        let strokeWidthOuter = 20/30 * textSize;
        let strokeWidthMiddle = 12/20 * strokeWidthOuter;
        let strokeWidthInner = 10/12 * strokeWidthMiddle;

        // 2：计算大小
        ElementUpdate.resetViewBoxByStrokeWidth(strokeWidthOuter, material, $curElem);

        // 3：插入克隆元素
        let $svgInner = $svg.cloneNode(true);
        $svgInner.setAttribute('stroke', strokeInnerFill);
        $svgInner.setAttribute('stroke-width', strokeWidthInner);
        $svgInner.setAttribute('data-textspecialcolor', strokeInnerFill);
        $svg.insertAdjacentElement('beforebegin', $svgInner);
        let $svgMiddle = $svg.cloneNode(true);
        $svgMiddle.setAttribute('stroke', '#ffffff');
        $svgMiddle.setAttribute('stroke-width', strokeWidthMiddle);
        $svgInner.insertAdjacentElement('beforebegin', $svgMiddle);
        let $svgOuter = $svg.cloneNode(true);
        $svgOuter.setAttribute('stroke', strokeOuterFill);
        $svgOuter.setAttribute('stroke-width', strokeWidthOuter);
        $svgOuter.setAttribute('data-textspecialcolor', strokeOuterFill);
        $svgMiddle.insertAdjacentElement('beforebegin', $svgOuter);
    }
    // 文字特效_5：stroke-4
    // 文字特效_6：stroke-5：重复叠加实现3D效果，叠加距离 12 对应 字体 30pt
    static setTextStroke_5(material, $curElem) {
        let $gInner = $curElem.querySelector('g');
        let $$svg = Z($gInner).children('svg');
        let svgListLength = $$svg.length;
        let $svg = $$svg[svgListLength - 1];
        // 1：定义变量
        if (svgListLength === 0)
            return;
        let strokeFill = '#777777';
        let stepWidth = .25;
        let textSize = material.fontSize;
        if (parseFloat({}.createMode) === 1)
            textSize = Exchange.px2pt(textSize);
        let spaceWidth = 10/30 * textSize;
        let num = Math.round(spaceWidth / stepWidth);

        // 2：重设大小
        ElementUpdate.resetViewBoxByStrokeWidth(spaceWidth, material, $curElem);

        // 3：插入特效节点
        let $svgClone = $svg.cloneNode(true);
        let $$path = $svgClone.querySelectorAll('.font-path>path');
        [].forEach.call($$path, ($path)=> $path.setAttribute('fill', strokeFill));
        let $svgStep;
        for (let i = 1;i <= num;i++) {
            $svgStep = $svgClone.cloneNode(true);
            let viewBoxObj = $svgStep.viewBox.baseVal;
            let setView = (viewBoxObj.x - i * stepWidth) + ' ' + (viewBoxObj.y - i * stepWidth) +
                ' ' + viewBoxObj.width + ' ' + viewBoxObj.height;
            $svgStep.setAttribute('viewBox', setView);
            $svg.insertAdjacentElement('beforebegin', $svgStep);
        }
        $svgStep.setAttribute('data-textspecialcolor', strokeFill);
    }
    // 文字特效_7：cartoon-1
    // 文字特效_8：cartoon-2
    // 文字特效_9：gradient-1
    static setTextGradient_1(material, $curElem) {
        let $rect = $curElem.querySelector('rect');
        let $gInner = $curElem.querySelector('g');
        let $$svg = Z($gInner).children('svg');
        let svgListLength = $$svg.length;
        let $svg = $$svg[svgListLength - 1];
        let gradientId = 'textSpecialLinear_' + new Date().getTime();
        let maskId = 'textSpecialMask_' + new Date().getTime();
        let maskStr = '<defs data-targetType="gradient-1">' +
            '    <linearGradient id=' + gradientId + ' x1="0%" y1="0%" x2="0%" y2="100%">' +
            '        <stop offset="40%" stop-color="#fff"></stop>\n' +
            '        <stop offset="95%" stop-color="#000"></stop>\n' +
            '    </linearGradient>\n' +
            '    <mask id="' + maskId + '">\n' +
            '        <rect x="0" y="0" width="' + $rect.getAttribute('width') + '" height="' + $rect.getAttribute('height') + '" fill="url(#' + gradientId + ')"></rect>\n' +
            '    </mask>' +
            '</defs>';
        $gInner.insertAdjacentHTML('afterbegin', maskStr);
        $svg.setAttribute('mask', 'url(#' + maskId + ')');
    }
    // 文字特效_10：gradient-2：默认颜色为 #0088dd （蓝色）
    static setTextGradient_2(material, $curElem) {
        let $rect = $curElem.querySelector('rect');
        let $gInner = $curElem.querySelector('g');
        let $$svg = Z($gInner).children('svg');
        let svgListLength = $$svg.length;
        let $svg = $$svg[svgListLength - 1];
        let textColor = material.color;
        let gradientFill = material.textSpecialColor.split(',')[0];
        if (textColor === gradientFill){
            material.textSpecialColor = '#0088dd';
            gradientFill = material.textSpecialColor;
        }

        let dateTime = new Date().getTime();
        let gradientId = 'textSpecialGradient_' + dateTime;
        let maskId = 'textSpecialMask_' + dateTime;
        let maskStr = '<defs data-targetType="gradient-2">' +
            '    <linearGradient id=' + gradientId + '>' +
            '        <stop offset="0%" stop-color="#ffffff"></stop>\n' +
            '        <stop offset="100%" stop-color="#000000"></stop>\n' +
            '    </linearGradient>\n' +
            '    <mask id="' + maskId + '">\n' +
            '        <rect x="0" y="0" width="' + $rect.getAttribute('width') + '" height="' + $rect.getAttribute('height') + '" fill="url(#' + gradientId + ')"></rect>\n' +
            '    </mask>' +
            '</defs>';
        $gInner.insertAdjacentHTML('afterbegin', maskStr);

        let $svgMask = $svg.cloneNode(true);
        let $$path = $svgMask.querySelectorAll('.font-path>path');
        [].forEach.call($$path, ($path) => $path.setAttribute('fill', gradientFill));
        $svgMask.setAttribute('data-textspecialcolor', gradientFill);
        $svg.insertAdjacentElement('beforebegin', $svgMask);
        $svg.setAttribute('mask', 'url(#' + maskId + ')');
    }
    // 文字特效_11：gradient-3：默认颜色为 #0088dd（蓝色）, #00cc00（绿色）
    static setTextGradient_3(material, $curElem) {
        let $rect = $curElem.querySelector('rect');
        let $gInner = $curElem.querySelector('g');
        let $$svg = Z($gInner).children('svg');
        let svgListLength = $$svg.length;
        let $svg = $$svg[svgListLength - 1];
        let getMaskStr = (color1,color2,color3) => {
            return '<defs data-targetType="gradient-3">' +
                '    <linearGradient id=' + gradientId + '>' +
                '        <stop offset="0%" stop-color="'+color1+'"></stop>\n' +
                '        <stop offset="50%" stop-color="'+color2+'"></stop>\n' +
                '        <stop offset="100%" stop-color="'+color3+'"></stop>\n' +
                '    </linearGradient>\n' +
                '    <mask id="' + maskId + '">\n' +
                '        <rect x="0" y="0" width="' + $rect.getAttribute('width') + '" ' +
                'height="' + $rect.getAttribute('height') + '" fill="url(#' + gradientId + ')"></rect>\n' +
                '    </mask>' +
                '</defs>';
        };

        let specialArr = material.textSpecialColor.split(',');
        let middleColor = specialArr[0];
        let rightColor = specialArr[1];
        if (!middleColor || !rightColor){
            middleColor = '#0088dd';
            rightColor = '#00cc00';
        }
        let $svgMiddle = $svg.cloneNode(true);
        let $svgRight = $svg.cloneNode(true);

        let dateTime = new Date().getTime();
        let gradientId = 'textSpecialGradient_' + dateTime;
        let maskId = 'textSpecialMask_' + dateTime;
        let maskStr = getMaskStr('#ffffff', '#000000', '#000000');
        $gInner.insertAdjacentHTML('afterbegin', maskStr);
        $svg.setAttribute('mask', 'url(#' + maskId + ')');

        //中间段插入
        let $$middlePath = $svgMiddle.querySelectorAll('.font-path>path');
        [].forEach.call($$middlePath, ($path) => $path.setAttribute('fill', middleColor));
        $svgMiddle.setAttribute('data-textspecialcolor', middleColor);
        $svg.insertAdjacentElement('beforebegin', $svgMiddle);

        //结尾段插入
        let $$rightPath = $svgRight.querySelectorAll('.font-path>path');
        [].forEach.call($$rightPath, ($path) => $path.setAttribute('fill', rightColor));
        $svgRight.setAttribute('data-textspecialcolor', rightColor);
        $svg.insertAdjacentElement('beforebegin', $svgRight);
        //结尾段mask
        gradientId = 'textSpecialGradient_' + (dateTime + 1);
        maskId = 'textSpecialMask_' + (dateTime + 1);
        maskStr = getMaskStr('#000000', '#000000', '#ffffff');
        $gInner.insertAdjacentHTML('afterbegin', maskStr);
        $svgRight.setAttribute('mask', 'url(#' + maskId + ')');
    }
    // 文字特效_12：gradient-4：描边+蒙版
    static setTextGradient_4(material, $curElem) {
        let $rect = $curElem.querySelector('rect');
        let $gInner = $curElem.querySelector('g');
        let $$svg = Z($gInner).children('svg');
        let svgListLength = $$svg.length;
        let $svg = $$svg[svgListLength - 1];
        let textColor = material.color;
        let gradientFill = material.textSpecialColor.split(',')[0];
        if (textColor === gradientFill){
            material.textSpecialColor = '#ffffff';
            gradientFill = material.textSpecialColor;
        }

        let dateTime = new Date().getTime();
        let maskId = 'textSpecialMask_' + dateTime;
        let rectWidth = $rect.getAttribute('width');
        let rectHeight = parseFloat($rect.getAttribute('height')) / 2;
        let maskStr = '<defs data-targetType="gradient-4">' +
            '    <mask id="' + maskId + '">\n' +
            '        <rect x="0" y="0" width="' + rectWidth + '" height="' + rectHeight + '" fill="#000000"></rect>\n' +
            '        <rect x="0" y="' + rectHeight + '" width="' + rectWidth + '" height="' + rectHeight + '" fill="#ffffff"></rect>\n' +
            '    </mask>' +
            '</defs>';
        $gInner.insertAdjacentHTML('afterbegin', maskStr);

        //颜色段插入
        let $svgMask = $svg.cloneNode(true);
        let $$path = $svgMask.querySelectorAll('.font-path>path');
        [].forEach.call($$path, ($path) => $path.setAttribute('fill', gradientFill));
        $svgMask.setAttribute('data-textspecialcolor', gradientFill);
        $svg.insertAdjacentElement('beforebegin', $svgMask);

        //插入描边段
        let $svgStroke = $svg.cloneNode(true);
        let textSize = material.fontSize;
        if (parseFloat({}.createMode) === 1)
            textSize = Exchange.px2pt(textSize);
        let strokeWidth = 2/20 * textSize;
        $svgStroke.setAttribute('stroke', '#000000');
        $svgStroke.setAttribute('stroke-width', strokeWidth);
        $svgMask.insertAdjacentElement('beforebegin', $svgStroke);

        //原svg属性设置
        $svg.setAttribute('mask', 'url(#' + maskId + ')');
    }
    // 文字特效_13：pattern-1：图片背景填充
    static setTextPattern_1(material, $curElem) {
        let $gInner = $curElem.querySelector('g');
        let $$svg = Z($gInner).children('svg');
        let svgListLength = $$svg.length;
        let $svg = $$svg[svgListLength - 1];
        let dateTime = new Date().getTime();
        let patternId = 'textSpecialPattern_' + dateTime;
        let patternStr = '<defs data-targetType="pattern-1">' +
            '    <pattern id="' + patternId + '" patternUnits="userSpaceOnUse" width="300" height="150">\n' +
            '        <image xlink:href="https://st-gdx.dancf.com/www/8/design/20180404-195855-1.png" x="0" y="0" width="300" height="150"/>\n' +
            '    </pattern>' +
            '</defs>';
        $gInner.insertAdjacentHTML('afterbegin', patternStr);

        let $$path = $svg.querySelectorAll('.font-path>path');
        [].forEach.call($$path, ($path) => $path.removeAttribute('fill'));
        $svg.setAttribute('fill', 'url(#' + patternId + ')');
    }
    // 文字特效：描边大小计算
    static resetViewBoxByStrokeWidth(exWidth, material, $curElem) {
        let $svg = Z($curElem)[0].querySelector("svg");
        let $rect = Z($curElem)[0].querySelector("rect");
        let svgViewBox = $svg.viewBox.baseVal;
        let zoomData = material.textZoom.split(' ');
        let originWidth = svgViewBox.width + 2 * svgViewBox.x;
        let originHeight = svgViewBox.height + 2 * svgViewBox.y;
        let setWidth = originWidth + 2 * exWidth;
        let setHeight = originHeight + 2 * exWidth;
        let setViewBox = - exWidth + ' ' + ( - exWidth) + ' ' + setWidth + ' ' + setHeight;
        setWidth *= parseFloat(zoomData[0]);
        setHeight *= parseFloat(zoomData[1]);
        $svg.setAttribute('viewBox', setViewBox);
        $svg.setAttribute('width', setWidth + '');
        $svg.setAttribute('height', setHeight + '');
        $rect.setAttribute('width', setWidth + '');
        $rect.setAttribute('height', setHeight + '');
    }
    // 校验表格单元格文字内容的大小和偏移
    static resetTdTextSizeTrans($gTd) {
        if (!$gTd.getAttribute("data-text"))
            return;

        let $rectText = $gTd.querySelector("rect");
        let $gTextWrap = $gTd.querySelector("g");
        let $svgText = $gTextWrap.querySelector("svg");
        let tdWidth = parseFloat($rectText.getAttribute("width"));
        let tdHeight = parseFloat($rectText.getAttribute("height"));

        // 1：校准大小
        $svgText.removeAttribute("width");
        $svgText.removeAttribute("height");
        $svgText.removeAttribute("viewBox");
        let svgBox = $svgText.getBBox();
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
        $svgText.setAttribute("width", svgWidth + "");
        $svgText.setAttribute("height", svgHeight + "");
        $svgText.setAttribute("viewBox", svgBox.x + " " + svgBox.y + " " + svgBox.width + " " + svgBox.height);

        // 2：校准偏移
        let textBox = $gTextWrap.getBBox();
        let setX = tdWidth - svgWidth;
        switch ($gTd.getAttribute("data-textalign")){
            case "left": setX =  -textBox.x; break;
            case "center": setX = (setX - textBox.x)/2;break;
        }
        $gTextWrap.setAttribute("transform", "translate(" + setX + " " + ((tdHeight - textBox.height) / 2) + ")");
    }
    // 更新单个文字，填充颜色
    static updateTextColor(material, $curElem, setColor) {
        material.color = setColor;
        // 更新到画布
        let $gInner = $curElem.querySelector('g');
        let $$svgInner = Z($gInner).children('svg');
        let $svg = $$svgInner[$$svgInner.length - 1];
        Z($svg).find("g.font-path>path").attr("fill", setColor);
        // 下划线
        if (material.textDecoration) {
            let $$line = $svg.querySelectorAll(".font-path>line");
            [].forEach.call($$line, ($line) => $line.setAttribute("stroke", setColor));
        }
        // wordsList
        for (let word of material.wordsList) {
            word.color = material.color;
        }
        // 判断是否是特殊文字
        ElementUpdate.setTextMaterialData(material, $curElem);
    }
    // 设置每个文字的 data 属性，并依据 wordsList 判断文本特殊性
    static setTextMaterialData (material, $curElem) {
        let list = material.wordsList;
        let paths = Z($curElem).find("g>svg:last-child>g>.font-path");
        if (list.length !== paths.length)
            return;

        let special = false;
        for (let i = 0;i < list.length;i++) {
            let $word = list[i];
            for (let item in $word) {
                if (!$word.hasOwnProperty(item))
                    continue;
                if (item === "index")
                    continue;
                let val = $word[item];
                if (item === "text") {
                    paths[i].setAttribute("data-text", val.replace(/</g, '-%6-%-%0-'));
                    continue;
                }
                paths[i].setAttribute("data-" + item.toLowerCase(), val);
                if (!special && val !== material[item]) {
                    special = true;
                }
            }
        }
        special ?  $curElem.setAttribute("data-special","1")
            : $curElem.removeAttribute("data-special");
    }
    // 更新文字行间距
    static updateFontLineHeight(newLineHeight) {
        // 1：主方法，定义变量
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        if (!material)
            return;

        newLineHeight = parseFloat(newLineHeight);
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        let $gWrap = $curElem.querySelector('g');
        let $svg = [...$gWrap.children].pop();

        if (material.targetType === 5) {
            if ($svg.getAttribute("data-targetType") === "shape-table")
                return ElementUpdate.updateTableFontLineHeight(newLineHeight);
        }

        let $gSvg = $curElem.querySelector("g");
        let $$svg = $gSvg.children;
        while ($$svg.length > 1)
            $gSvg.removeChild($$svg[0]);
        let $rect = $curElem.querySelector("rect");
        let $$gLine = Z($curElem.querySelector("svg")).children("g");

        // 2：取消宽高设置
        $svg.removeAttribute("viewBox");
        $svg.removeAttribute("width");
        $svg.removeAttribute("height");
        $rect.setAttribute("width",1);
        $rect.setAttribute("height",1);

        // 3：计算 mathHeight、lineHeight
        material.singleHeight = parseFloat(material.singleHeight);
        let gLength = $$gLine.length;
        let mathHeight = newLineHeight - material.singleHeight;
        if (gLength === 1) {
            mathHeight = mathHeight > 0 ? mathHeight : 0;
        }
        material.mathHeight = mathHeight;
        material.lineHeight = material.singleHeight + material.mathHeight;

        // 4：设置每个 tspan 的偏移量
        let underlineSpace = parseFloat(material.underlineOffset) + parseFloat(material.underlineThickness);
        let setLineTransX = 0, setLineTransY = 0;
        // 竖排的行间距设置
        let setVerticalTrans = (i) => {
            let $line = $$gLine[i];
            let lineTrans = $line.getAttribute("transform");
            let lineTransData = /translate\(([^)\s]+)\s([^)\s]+)\)/.exec(lineTrans);
            setLineTransY = parseFloat(lineTransData[2]);
            setLineTransX += underlineSpace + material.mathHeight;

            lineTrans = lineTrans.replace(/translate\([^)]+\)/,
                'translate(' + (setLineTransX - $line.getBBox().x) + ' ' + setLineTransY + ')');
            $line.setAttribute("transform", lineTrans);
            setLineTransX += $line.getBBox().width;
        };
        if (material.textVertical === 'right') {
            for (let i = gLength - 1;i > -1;i--)
                setVerticalTrans(i);
        } else {
            for (let i = 0;i < gLength;i++) {
                if (material.textVertical === 'left') {
                    setVerticalTrans(i);
                    continue;
                }
                let $line = $$gLine[i];
                let lineTrans = $line.getAttribute("transform");
                let lineTransData = /translate\(([^)\s]+)\s([^)\s]+)\)/.exec(lineTrans);
                setLineTransX = parseFloat(lineTransData[1]);
                setLineTransY = material.textY + material.lineHeight * i;
                lineTrans = lineTrans.replace(/translate\([^)]+\)/, 'translate(' + setLineTransX + ' ' + setLineTransY + ')');
                $line.setAttribute("transform", lineTrans);
            }
        }

        // 5：计算 setWidth、setHeight
        let setWidth =  $curElem.getBBox().width;
        let setHeight =  $curElem.getBBox().height;
        if (material.textVertical === 'normal') {
            setWidth += parseFloat(material.fontSize);
            if (!material.width){
                material.width =  setWidth;
            }
            let singleMax = Math.max(material.lineHeight, material.singleHeight);
            material.height = material.lineHeight * ($$gLine.length - 1) + singleMax;
            setHeight = material.height;
        }

        // 6：设置 svg 属性
        $svg.setAttribute("viewBox","0 0 " + setWidth + " " + setHeight);
        $svg.setAttribute("width", setWidth + '');
        $svg.setAttribute("height", setHeight + '');
        $rect.setAttribute("width", setWidth + '');
        $rect.setAttribute("height", setHeight + '');
        $curElem.setAttribute("data-mathheight", material.mathHeight);
        $curElem.setAttribute("data-lineheight", material.lineHeight);

        // 7：缩放、定位处理
        // 文字缩放处理
        ElementUpdate.setTextZoom();
        // 文字特效
        ElementUpdate.doTextSpecialSet();
        // 位置较准
        Const.editOverSet($curElem);
        // 选择框定位
        SelectionTool.setToolStaticLoc();
    }
    // 更新表格行间距
    static updateTableFontLineHeight(newLineHeight) {
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        if (!material || material.targetType !== 5)
            return;

        newLineHeight = parseFloat(newLineHeight + "");
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        let $gWrap = $curElem.querySelector('g');
        let $svg = $gWrap.querySelector("svg");
        let $$svg = $gWrap.children;
        while ($$svg.length > 1)
            $gWrap.removeChild($$svg[$$svg.length - 1]);
        let dataType = $svg.getAttribute("data-targetType");
        if (dataType !== "shape-table")
            return;

        let $activeElem = document.activeElement;
        if ($activeElem.className.includes("tableText-editArea")) {
            $activeElem.style.lineHeight = newLineHeight + "px";
        } else {
            material.lineHeight = newLineHeight;
            let $$gTd = $svg.querySelectorAll("g[data-colspan]");
            for (let $gTd of $$gTd) {
                $gTd.setAttribute("data-lineheight", newLineHeight);
                let $gPathSvg = $gTd.querySelector("g");
                let $svgText = $gPathSvg.querySelector("svg");
                let $$line = $svgText.children;
                let allLineLength = $$line.length;
                // 遍历每行
                for (let i = 0;i < allLineLength;i++) {
                    let $line = $$line[j];
                    let lineTrans = $line.getAttribute("transform");
                    lineTrans = lineTrans.replace(/\s[^)]+\)/, " " + newLineHeight * j + ")");
                    $line.setAttribute("transform", lineTrans);
                }
                // 尺寸校准
                let svgTextBox = $svgText.getBBox();
                let svgTextView = $svgText.viewBox.baseVal;
                $svgText.setAttribute("width", svgTextBox.width);
                $svgText.setAttribute("height", svgTextBox.height);
                $svgText.setAttribute("viewBox", svgTextView.x + " " + svgTextView.y + " " + svgTextBox.width + " " + svgTextBox.height);
                // 位置较准
                ElementUpdate.resetTdTextSizeTrans($gTd);
            }
            // 更新素材source
            ElementUpdate.updateMaterialSource();
        }
    }
    // 更新线条虚线间隔
    static updateShapeLineDasharray(val1,val2) {
        val1 = parseFloat(val1); val2 = parseFloat(val2);
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        let svgType = $curElem.querySelector("svg").getAttribute("data-targetType");
        let $line = $curElem.querySelector("line");
        if (material.targetType !== 5 || svgType !== "shape-line" || !$line)
            return;

        let oldDash = $line.getAttribute("stroke-dasharray").split(" ");
        if (val1 !== 0)
            val1 = val1 || oldDash[0];
        if (val2 !== 0)
            val2 = val2 || oldDash[1];
        $line.setAttribute("stroke-dasharray",val1 + " " + val2);
    }
    // 更新形状圆角角度,矩形框圆角
    static updateShapeRectRadius(nw_r,ne_r,sw_r,se_r) {
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        let $svg = $curElem.querySelector("svg");
        let svgType = $svg.getAttribute("data-targetType");
        if (material.targetType !== 5 || (svgType !== "shape-rect" && svgType !== "shape-rectStroke"))
            return;

        let absX = Math.abs($svg.viewBox.baseVal.width+"");
        let absY = Math.abs($svg.viewBox.baseVal.height+"");
        let mL = Const.getMinNum([absX,absY])/200;
        if (nw_r != null) $svg.querySelector("path.nw").setAttribute("data-radius",nw_r * mL);
        if (ne_r != null) $svg.querySelector("path.ne").setAttribute("data-radius",ne_r * mL);
        if (sw_r != null) $svg.querySelector("path.sw").setAttribute("data-radius",sw_r * mL);
        if (se_r != null) $svg.querySelector("path.se").setAttribute("data-radius",se_r * mL);

        if (svgType === "shape-rect")
            media.event.drawRectResize($svg,absX,absY);
        else if (svgType === "shape-rectStroke")
            media.event.drawRectStrokeResize($svg,absX,absY);

        //同步展示
        let onlyMore = [nw_r,ne_r,sw_r,se_r].indexOf(null) > -1;
        EditBtnTool.showRectRadiusValue(onlyMore);
        // 更新并保存
        ElementUpdate.updateMaterialSource(material, $curElem);
        SelectionTool.setToolStaticLoc();
        PrototypeHistory.saveHistory();
    }
    // 更新旋转度
    static updateSvgRotate(angle) {
        if (media.selectedList.length === 0) {//不存在选中素材，返回
            return;
        }
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        material.angle = angle;
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        let trans = $curElem.getAttribute('transform');
        trans = trans.replace(/rotate\s*\(\s*\d+(\.\d+)?/, 'rotate(' + angle);
        $curElem.setAttribute("transform",trans);
        //更新缩放框位置
        SelectionTool.setToolStaticLoc();
    }
    // 设置文本对齐
    static switchTextAlign(event) {
        // 主方法，定义变量
        let selectedLength = media.selectedList.length;
        if (selectedLength === 0)
            return;

        let $btn = Z.E.current(event);
        let $toolBtn = Z('#tool_fontAlign .textAlign-btn');
        let alignType = $btn.getAttribute('data-targetType');
        let $activeElem = document.activeElement;
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();

        // 1：展示状态修改
        Z($btn).addClass("active").siblings(".textAlign_box_btn").removeClass("active");
        $toolBtn[0].className = "textAlign-btn " + alignType;
        Z("#sideTextEditor").css("text-align", alignType);     // 侧边文字编辑器修改样式

        // 2：分情况处理
        if (material.targetType === 1) {
            if ($activeElem === Z.D.id("textEditor")) {
                Z("#textEditor").css("text-align",alignType);
            } else {
                for (let i = 0;i < selectedLength;i++) {
                    let m = media.tool.getCurMaterial(i);
                    let $elem = media.tool.getCurSvgElement(i);
                    if (m.textAlign === alignType)
                        continue;
                    // 执行对齐操作
                    ElementUpdate.setElementAlign(alignType, m, $elem);
                    // 更新文本，保存历史
                    ElementUpdate.updateMaterialSource(m, $elem);
                }
                // 选择框定位，保存
                SelectionTool.selectTheElement_group();
                PrototypeHistory.saveHistory();
            }
        } else if (material.targetType === 5) {
            let $svg = $curElem.querySelector("svg");
            let dataType = $svg.getAttribute("data-targetType");
            if (dataType !== "shape-table")
                return;
            if ($activeElem.className.includes("tableText-editArea")) {
                $activeElem.style.textAlign = alignType;
            } else {
                if (material.textAlign === alignType)
                    return;
                material.textAlign = alignType;
                $curElem.setAttribute("data-textalign", alignType);
                // 1：循环执行
                let $$td = $svg.querySelectorAll("g[data-rowspan]");
                for (let $td of $$td) {
                    $td.setAttribute("data-textalign", alignType);
                    let $gText = $td.querySelector("g[transform]");
                    let $svgLine = $gText.querySelector("svg");
                    let $$line = $svgLine.children;
                    let lineNum = $$line.length;
                    if (lineNum <= 0)
                        continue;
                    let textTrans = $gText.transform.baseVal[0].matrix;
                    let tdWidth = $td.getBBox().width;
                    let textWidth = $gText.getBBox().width;
                    let setTrans;
                    switch(alignType) {
                        case "left": setTrans = 0; break;
                        case "center": setTrans = (tdWidth - textWidth)/2; break;
                        case "right": setTrans = tdWidth - textWidth; break;
                    }
                    setTrans = "translate(" + setTrans + " " + textTrans.f + ")";
                    $gText.setAttribute("transform", setTrans);
                    // 多行处理
                    if (lineNum <= 1)
                        continue;
                    let svgLineWidth = $svgLine.getBBox().width;
                    for (let $line of $$line) {
                        let lineBoxWidth = $line.getBBox().width;
                        let lineTransX;
                        switch(alignType) {
                            case "left": lineTransX = 0; break;
                            case "center": lineTransX = (svgLineWidth - lineBoxWidth)/2; break;
                            case "right": lineTransX = svgLineWidth - lineBoxWidth; break;
                        }
                        let lineTransY = $line.transform.baseVal[0].matrix.f;
                        let setLineTrans = "translate(" + lineTransX + " " + lineTransY +")";
                        $line.setAttribute("transform", setLineTrans);
                    }
                    // 位置较准
                    ElementUpdate.resetTdTextSizeTrans($td);
                }

                // 2：选中
                SelectionTool.selectTheElement(material, $curElem);

                // 3：更新保存
                ElementUpdate.updateMaterialSource();
                PrototypeHistory.saveHistory();
            }
        }
    }
    // 修改选中颜色
    static updateColor(setColor) {
        // 主方法，基本参数
        return;
        let selectedLength = media.selectedList.length;
        let pickerData = ColorPicker.data;
        let colorType = pickerData.colorType;
        let colorId = pickerData.colorId;
        if (selectedLength === 0 && colorType !== 'bgFill') {
            return;
        }
        let material, $curElem, $svg;
        if (selectedLength === 1){
            material = media.tool.tempMaterial || media.tool.getCurMaterial();
            $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
            $svg = [...$curElem.querySelector('g').children].pop();
        }

        // 更新，线条，颜色
        let updateShapeLineStroke = ($tempElem)=> {
            $tempElem = $tempElem || $curElem;
            let $line = $tempElem.querySelector("line");
            if (!$line){
                return;
            }
            $line.setAttribute("stroke",setColor);
        };
        // 更新，矩形，填充色
        let updateShapeRectFill = ($tempElem)=> {
            $tempElem = $tempElem || $curElem;
            $tempElem.querySelector('svg').querySelectorAll(".shape-rect-path").forEach(function($elem){
                if ($elem.hasAttribute("fill")) $elem.setAttribute("fill",setColor);
                if ($elem.hasAttribute("stroke")) $elem.setAttribute("stroke",setColor);
            })
        };
        // 更新形状，圆形，填充色
        let updateShapeEllipseFill = ($tempElem)=> {
            $tempElem = $tempElem || $curElem;
            $tempElem.querySelector('svg').querySelector("ellipse").setAttribute("fill",setColor);
        };
        // 更新形状，表格，文字填充色
        let updateShapeTableTextFill = ()=> {
            let $activeElem = document.activeElement;
            if ($activeElem.className.includes("tableText-editArea")) {
                $activeElem.style.color = setColor.toLowerCase() === "none" ? "transparent" : setColor;
            } else {
                [].forEach.call($svg.parentElement.querySelectorAll("svg path"),
                    ($path) => $path.setAttribute("fill",setColor));
            }
        };
        switch (colorType) {
            case "bgFill": media.tool.setFillColor(setColor); break;
            case "textColor": {
                let activeEle = document.activeElement;
                if (activeEle.tagName.toLowerCase() === "texter"){
                    let sl = window.getSelection();
                    let selectAll = Const.isSelectAll();

                    if (!sl.isCollapsed && !selectAll) { // 非全选、选区操作
                        //设置选取索引
                        Const.setSlIndex(material);
                        //定义素材颜色，取第一个字的颜色
                        let firstWord = material.wordsList[0];
                        material.color = firstWord.color;
                    } else { // 全选操作
                        material.color = setColor;
                        activeEle = document.activeElement;
                        Z(activeEle).focus();
                        document.execCommand("selectAll");
                    }
                    let setRichColor;
                    if (setColor === 'none'){
                        setRichColor = 'rgba(0,0,0,0)';
                    } else {
                        setRichColor = setColor;
                    }
                    document.execCommand("foreColor", false, setRichColor);
                } else {
                    ElementUpdate.updateTextColor(material, $curElem, setColor);
                }
            } break;
            case "svgFill": {
                // 1：定义变量
                let items = $curElem.querySelectorAll("[fill]");
                let listLength = items.length;
                let indexStr = colorId.replace("tool_svgColor_","");
                let indexArr = [];
                // 2：定义有效索引数组
                if (indexStr === 'all') {
                    indexArr.length = listLength;
                    for (i;i < listLength;i++){
                        indexArr[i] = i + 1;
                    }
                } else {
                    let tempArr = indexStr.split('_');
                    tempArr = tempArr.map(parseFloat);
                    for (let i = tempArr[0];i <= tempArr[tempArr.length - 1];i++)
                        indexArr[i] = i;
                }
                // 3：循环赋值
                for(let i = 0;i < listLength;i++) {
                    if (indexArr.indexOf(i) === -1)
                        continue;

                    let $item = items[i];
                    if ($item.hasAttribute('opacity') && $item.getAttribute('opacity') !== '1'){
                        continue;
                    }
                    let itemFill = $item.getAttribute("fill").toLowerCase();
                    if (itemFill === "rgba(0,0,0,0)" || itemFill === "none" || itemFill === "transparent")
                        continue;
                    $item.setAttribute('fill', setColor);
                }
                // 4：按钮颜色
                if (indexStr === 'all') {
                    let $$btn = Z('#tool_insertAttr').find('.tool-colorPicker:not(#tool_svgColor_all)');
                    $$btn.css('background-color', setColor);
                } else {
                    let $btn = Z('#' + colorId);
                    $btn.css('background-color', setColor);
                    let $space = $btn[0].previousElementSibling;
                    // 如果是第一个按钮，则同步改变“全部”按钮
                    if ($space && $space.colorId === 'tool_svgColor_space')
                        Z('#tool_svgColor_all').css('background-color', setColor);
                }
            } break;
            case "groupColor": {
                if (selectedLength < 2) {
                    EditBtnTool.hideEditSelected();
                    media.tool.setTempCurrent();
                } else {
                    for (let i = 0;i < selectedLength;i++) {
                        let tempMaterial = media.tool.getCurMaterial(i);
                        let $tempElem = media.tool.getCurSvgElement(i);
                        tempMaterial.type = parseFloat(tempMaterial.type);

                        if (tempMaterial.type === 1) {// 文字处理
                            ElementUpdate.updateTextColor(tempMaterial, $tempElem, setColor);
                        } else if (tempMaterial.type === 3) {// 普通素材
                            let items = $tempElem.querySelectorAll("[fill]");
                            for (let j = 0;j < items.length;j++) {
                                let itemFill = Z(items[j]).attr("fill").toLowerCase();
                                if (itemFill === "rgba(0,0,0,0)" || itemFill === "none" || itemFill === "transparent")
                                    continue;
                                Z(items[j]).attr("fill", setColor);
                            }
                            ElementUpdate.updateMaterialSource(tempMaterial, $tempElem);
                        } else if (tempMaterial.type === 5) {// 形状素材
                            let $tempSvg = $tempElem.querySelector("svg");
                            let tempType = Z($tempSvg).attr("data-targetType");
                            switch (tempType) {
                                case "shape-line": updateShapeLineStroke($tempElem);break;
                                case "shape-rect":
                                case "shape-rectStroke": updateShapeRectFill($tempElem);break;
                                case "shape-ellipse": updateShapeEllipseFill($tempElem);break;
                                case "shape-table": updateShapeTableTextFill($tempElem);break;
                            }
                        }
                        ElementUpdate.updateMaterialSource(tempMaterial, $tempElem);
                    }
                }
            } break;
            case "lineFill": updateShapeLineStroke(); break;
            case "rectFill": updateShapeRectFill(); break;
            case "rectStrokeFill": updateShapeRectFill(); break;
            case "ellipseFill": updateShapeEllipseFill(); break;
            case "ellipseStroke": {
                $curElem.querySelector("svg").querySelector("ellipse").setAttribute("stroke",setColor);
            } break;
            case "penFill": {
                $curElem.querySelector("path").setAttribute("fill",setColor);
            } break;
            case "penStroke": {
                $curElem.querySelector("path").setAttribute("stroke",setColor);
            } break;
            case "tableText": updateShapeTableTextFill(); break;
            case "tableStroke": {
                let $gWrap = $curElem.querySelector("g");
                let $$svg = $gWrap.children;
                while ($$svg.length > 1)
                    $gWrap.removeChild($$svg[1]);
                $svg = $$svg[0];
                [].forEach.call($svg.querySelectorAll("line"),
                    ($tdLine) => $tdLine.setAttribute("stroke",setColor));
                // 校准边框样式，复制一个svg
                let $svgClone = $svg.cloneNode(true);
                $svgClone.querySelectorAll("g[data-row]").forEach(($dTd) => {
                    $dTd.removeChild($dTd.querySelector("rect"));
                    if (($dTd.querySelector("g[transform]")))
                        $dTd.removeChild($dTd.querySelector("g[transform]"));
                });
                $gWrap.appendChild($svgClone);
            } break;
            case "tableFill": {
                let $gWrap = $curElem.querySelector("g");
                let $$svg = $gWrap.children;
                while ($$svg.length > 1)
                    $gWrap.removeChild($$svg[1]);
                $svg = $$svg[0];
                let $activeElem = document.activeElement;
                if ($activeElem.className.includes("tableText-editArea")) {
                    if (setColor.toLowerCase() === "none")
                        $activeElem.parentElement.className = "bgNone";
                    else
                        Z($activeElem.parentElement).removeClass('bgNone').css("backgroundColor", setColor);
                } else {
                    [].forEach.call($svg.querySelectorAll("rect"),
                        ($tdRect) => $tdRect.setAttribute("fill",setColor));
                }
                // 复制一个svg
                let $svgClone = $svg.cloneNode(true);
                $svgClone.querySelectorAll("g[data-row]").forEach(($dTd) => {
                    $dTd.removeChild($dTd.querySelector("rect"));
                    if (($dTd.querySelector("g[transform]")))
                        $dTd.removeChild($dTd.querySelector("g[transform]"));
                });
                $gWrap.appendChild($svgClone);
            } break;
            case 'stroke-1':
            case 'stroke-2': {
                let $$svgStroke = $curElem.querySelectorAll('[data-textspecialcolor]');
                let listLength = $$svgStroke.length;
                if (listLength === 0)
                    return;
                for (let i = 0;i < listLength;i++) {
                    let $svgStroke = $$svgStroke[i];
                    $svgStroke.setAttribute('stroke', setColor);
                    $svgStroke.setAttribute('data-textspecialcolor', setColor);
                }
                material.textSpecialColor = setColor;
                $curElem.setAttribute('data-textspecialcolor', material.textSpecialColor);
            } break;
            case 'stroke-3': {
                let $$svgStroke = $curElem.querySelectorAll('[data-textspecialcolor]');
                let idIndex = parseFloat(colorId.replace(/[^\d]/g, ''));
                let $svgStroke = $$svgStroke[idIndex];
                $svgStroke.setAttribute('stroke', setColor);
                $svgStroke.setAttribute('data-textspecialcolor', setColor);
                var textSpecialColor = '';
                for (let i = 0;i < $$svgStroke.length;i++) {
                    if (i > 0) textSpecialColor += ',';
                    textSpecialColor += $$svgStroke[i].getAttribute('stroke');
                }
                $curElem.setAttribute('data-textspecialcolor', textSpecialColor);
                material.textSpecialColor = textSpecialColor;
            } break;
            case 'stroke-5': {
                let $gInner = $curElem.querySelector('g');
                let $$svgStroke = Z($gInner).children('svg');
                let listLength = $$svgStroke.length;
                for (let i = 0;i < listLength - 1;i++) {
                    Z($$svgStroke[i]).find('.font-path>path').attr('fill', setColor);
                }
                $curElem.querySelector('[data-textspecialcolor]').setAttribute('data-textspecialcolor', setColor);
                $curElem.setAttribute('data-textspecialcolor', setColor);
                material.textSpecialColor = setColor;
            } break;
            case 'gradient-2':
            case 'gradient-4': {
                let $gInner = $curElem.querySelector('g');
                let $svgGradient = Z($gInner).find('svg[data-textspecialcolor]');
                $svgGradient.find('.font-path>path').attr('fill', setColor);
                $svgGradient.attr('data-textspecialcolor', setColor);
                material.textSpecialColor = setColor;
            } break;
            case 'gradient-3': {
                let $gInner = $curElem.querySelector('g');
                let pickerIndex = /_(\d+)$/.exec(colorId);
                pickerIndex = pickerIndex && pickerIndex[1];
                if (!pickerIndex)
                    return;
                let $$svgGradient = Z($gInner).find('svg[data-textspecialcolor]');
                if (!pickerIndex)
                    return;
                let $svgGradient = Z($$svgGradient[pickerIndex]);
                $svgGradient.find('.font-path>path').attr('fill', setColor);
                $svgGradient.attr('data-textspecialcolor', setColor);

                //定义material.textSpecialColor
                let textSpecialColor = '';
                for (let i = 0;i < $$svgGradient.length;i++) {
                    textSpecialColor += $$svgGradient[i].getAttribute('data-textspecialcolor');
                    if (i !== $$svgGradient.length - 1) textSpecialColor += ',';
                }
                material.textSpecialColor = textSpecialColor;
            } break;
        }

        // 颜色选择器，已选颜色
        if (setColor === 'none') {
            Z("#"+ colorId).addClass('bgNone');
        } else {
            Z("#"+ colorId).removeClass('bgNone').css("background", setColor);
        }
        ColorPicker.setPickerValue(setColor);

        // 更新保存
        if (selectedLength === 1) {
            ElementUpdate.updateMaterialSource(material, $curElem);
        }
        PrototypeHistory.saveHistory();
    }
    // 修改字体类型
    static changeMaterialFontFamily(fontFamily) {
        // 展示方法
        let setValShow = ()=> {
            EditBtnTool.setFontSelectVal(fontFamily, 'tool_fontFamily');
            Z("#tool_fontFamily .fontFamily-value").attr("value", fontFamily);
            Z("#tool_fontFamily .fontFamily_inputWrap > .z-input").addClass("invisible").blur();
        }

        // 分情况调用
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let activeEle = document.activeElement;
        let activeTag = activeEle.tagName.toLowerCase();
        if (material.targetType === 1) {
            if (activeTag !== "texter")
                return ElementUpdate.changeTextMaterialFontSet(fontFamily, 'fontFamily', null, setValShow);
            let doTexterEditorChange = (material)=> {
                let sl = window.getSelection();
                let selectAll = Const.isSelectAll();
                if (!sl.isCollapsed && !selectAll) {// 部分选择
                    //设置选取索引
                    Const.setSlIndex(material);
                    let slStart = media.tool.tempSelStart;
                    let slEnd = media.tool.tempSelEnd;
                    //修改选区素材
                    for (let i = 0; i < material.wordsList.length; i++) {
                        if (slStart <= i && i < slEnd) {
                            material.wordsList[i].fontFamily = fontFamily;
                        }
                    }
                    //定义素材字体
                    let firstWord = material.wordsList[0];
                    material.fontFamily = firstWord.fontFamily;
                } else {//全选
                    material.fontFamily = fontFamily;
                    for (let i = 0; i < material.wordsList.length; i++) {
                        material.wordsList[i].fontFamily = fontFamily;
                    }
                    Z(activeEle).focus();
                    document.execCommand("selectAll");
                }
                document.execCommand("fontName", false, fontFamily);
            };
            ElementUpdate.changeTextMaterialFontSet(fontFamily, 'fontFamily', doTexterEditorChange, setValShow);
        } else if (material.targetType === 5) {
            let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
            let dataType =  $curElem.querySelector("svg").getAttribute("data-targetType");
            if (dataType === "shape-table") {
                let setEditor = null
                if (activeEle.className.includes("tableText-editArea"))
                    setEditor = function () {
                        let activeEle = document.activeElement;
                        if (activeEle.className.includes("tableText-editArea"))
                            activeEle.style.fontFamily = fontFamily;
                    };
                ElementUpdate.changeTableMaterialFontSet(fontFamily, 'fontFamily', setEditor, setValShow);
            }
        }
    }
    // 设置文字类型：字体、大小方法
    static changeTextMaterialFontSet(setValue, setType, doEditorChange, valShowFun) {
        // 1：主方法，定义变量
        let selectedLength = media.selectedList.length;
        if (selectedLength === 0)
            return;
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        if (material.targetType !== 1)
            return;

        // 2：执行选中，输入框隐藏
        Z.T.isFunction(valShowFun) && valShowFun();

        // 2：分情况处理
        let activeEle = document.activeElement;
        if (activeEle.tagName.toLowerCase() === "texter"){
            Z.T.isFunction(doEditorChange) && doEditorChange(material);
        } else {
            // 主方法
            let updateFontSet_loader, finishedNum = 0;
            // 1：显示加载框
            if (selectedLength > 2) {
                updateFontSet_loader = Z.loading({
                    shadow: true,
                    text:"正在加载..."
                });
            }
            // 2：循环处理
            let doneCheck = (tempMaterial, $tempElem)=> {
                finishedNum++;
                ElementUpdate.allTextPathDoneCheck(tempMaterial, $tempElem, finishedNum, updateFontSet_loader);
            };
            for (let i = 0;i < selectedLength;i++) {
                let material = media.tool.getCurMaterial(i);
                let $curElem = media.tool.getCurSvgElement(i);
                // 1：验证是否有修改
                let validate = (material[setType] + '') === (setValue + '');
                if (material.wordsList) {
                    for (let word of material.wordsList) {
                        if (word[setType] + '' !== setValue + ''){
                            validate = false;
                            break;
                        }
                    }
                }
                if (validate)
                    return doneCheck();

                // 2：为素材赋值新的 setValue
                material[setType] = setValue;
                if (material.wordsList) {
                    for (let word of material.wordsList)
                        word[setType] = setValue;
                }
                // 3：绘制文字
                MaterialTool.getPathAjax(material, $curElem, 1, 1, doneCheck);
            }
        }
    }
    // 设置表格类型：字体路径重生成方法
    static changeTableMaterialFontSet(setValue, setType, doEditorChange, valShowFun) {
        // 1：主方法，定义变量
        let selectedLength = media.selectedList.length;
        if (selectedLength !== 1) {
            return;
        }
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        if (material.targetType !== 5)
            return;
        let $svg = $curElem.querySelector("svg");
        let dataType = $svg.getAttribute("data-targetType");
        if (dataType !== "shape-table")
            return;

        // 2：执行选中，输入框隐藏
        if (typeof valShowFun === 'function')
            valShowFun();

        // 3：分情况处理
        if (typeof doEditorChange === 'function') {
            doEditorChange(material);
        } else{
            // 1：定义和判断
            let $svgMain = $curElem.querySelector("g").querySelector("svg");
            let $$gTd = $svgMain.querySelectorAll("g[data-rowspan]");
            let listLength = $$gTd.length;
            let textTdNum = 0;
            let textTdIndexArr = [];
            let textTdStrArr = [];
            for (let i = 0;i < listLength;i++) {
                let $gTd = $$gTd[i];
                let textStr = $gTd.getAttribute("data-text");
                textStr = textStr && textStr.trim();
                if (textStr) {
                    textTdIndexArr.push(i);
                    textTdStrArr.push(textStr);
                    textTdNum++;
                }
            }
            if (textTdNum === 0)
                return;

            // 2：生成svg代码
            for (let i = 0;i <textTdIndexArr.length;i++) {
                let arrIndex = textTdIndexArr[i];
                let $gTd = $$gTd[arrIndex];
                let textStr = textTdStrArr[i];

                // 清除老数据
                let $gTextWrap = $gTd.querySelector("g");
                let $gText = $gTextWrap.querySelector("g");
                let $svgText = $gText.querySelector("svg");
                let textDecoration = $svgText.querySelector("line") ? 1 : 0;
                let fontColor = $svgText.querySelector("path").getAttribute("fill");
                $gText.removeChild($svgText);

                // 生成新数据
                let textObj = {
                    fontSize: $gTd.getAttribute("data-fontsize") + "pt",
                    fontFamily: $gTd.getAttribute("data-fontfamily"),
                    fontWeight: parseFloat($gTd.getAttribute("data-fontweight")),
                    textDecoration: textDecoration,
                    fontColor: fontColor,
                    mathHeight: parseFloat($gTd.getAttribute("data-mathheight")),
                    letterSpacing: parseFloat($gTd.getAttribute("data-letterspacing")),
                };
                textObj[setType] = (setType === "fontSize") ? setValue + "pt" : setValue;
                $svgText = Const.getPathSvgFromText(textStr,textObj);
                $gText.appendChild($svgText);

                // 设置属性
                $gTd.setAttribute("data-" + setType.toLowerCase(), setValue);
                material[setType] = setValue;

                // 单元格大小/偏移校验
                ElementUpdate.resetTdTextSizeTrans($gTd);
            }

            // 3：更新保存
            ElementUpdate.updateMaterialSource(material, $curElem);
            PrototypeHistory.saveHistory();
        }
    }
    // 检查是否所有文字处理完成
    static allTextPathDoneCheck(tempMaterial, $tempElem, finishedNum, updateFontSet_loader) {
        Const.editOverSet ($tempElem);
        ElementUpdate.updateMaterialSource(tempMaterial, $tempElem);
        if (finishedNum === media.selectedList.length) {
            setTimeout(()=> {
                if (updateFontSet_loader && updateFontSet_loader.close) {
                    updateFontSet_loader.close();
                    updateFontSet_loader = null;
                }
            },800);
            // 选择框定位，保存历史
            SelectionTool.selectTheElement_group();
            PrototypeHistory.saveHistory();
        }
    }
    // 修改字体大小
    static changeMaterialFontSize(fontSize) {
        // 展示方法
        let setValShow = ()=> {
            EditBtnTool.setFontSelectVal(fontSize, 'tool_fontSize');
            Z("#tool_fontSize .fontSet_inputWrap > .z-input").val(fontSize).blur();
        };
        // 分情况调用
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        if (material.targetType === 1) {
            ElementUpdate.changeTextMaterialFontSet(fontSize, 'fontSize', null, setValShow);
        } else if (material.targetType === 5) {
            let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
            let dataType =  $curElem.querySelector("svg").getAttribute("data-targetType");
            if (dataType === "shape-table") {
                let setEditor = null;
                if (document.activeElement.className.includes("tableText-editArea")) {
                    setEditor = function () {
                        let activeEle = document.activeElement;
                        let fontSizePx = Exchange.pt2px(fontSize);
                        if (activeEle.className.includes("tableText-editArea"))
                            activeEle.style.fontSize = fontSizePx + "px";
                    };
                }
                ElementUpdate.changeTableMaterialFontSet(fontSize, 'fontSize', setEditor, setValShow);
            }
        }
    }
    // 素材替换图片，完整方法：initUploaderImage2
    static imageMaterialReplace(fileId,fileUrl) {
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        let $image = $curElem.querySelector("svg image");
        material.fileId = fileId;

        $image.setAttribute("xlink:href",fileUrl);
        $image.setAttribute("href",fileUrl);

        // 保存
        ElementUpdate.updateMaterialSource(material, $curElem);
        PrototypeHistory.saveHistory();
    }
    // 容器图片换图，完整方法：initUploaderFrameImg
    static frameImageReplace(fileId,fileUrl) {
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        let $frameImage = $curElem.querySelector(".svgFrame-img image");
        let $frameRect = $curElem.querySelector(".svgFrame-img rect");
        let rect_width = $frameRect.width.baseVal.value;
        let rect_height = $frameRect.height.baseVal.value;
        let rect_x = $frameRect.x.baseVal.value;
        let rect_y = $frameRect.y.baseVal.value;
        let rectRatio = rect_width / rect_height;

        // 计算宽高
        let thumbRect = Z("#imgUploadProgress .img")[0].getBoundingClientRect();
        let thumbRatio = thumbRect.width / thumbRect.height;
        let image_width , image_height;
        if (thumbRatio > rectRatio) {
            image_height = rect_height;
            image_width = image_height * thumbRatio;
        } else {
            image_width = rect_width;
            image_height = image_width / thumbRatio;
        }

        let trans_x = (rect_width - image_width) / 2 + rect_x;
        let trans_y = (rect_height - image_height) / 2 + rect_y;
        let image_trans = "translate("+ trans_x +" "+ trans_y +")";

        // 写入参数
        material.fileId = fileId;
        $frameImage.setAttribute("xlink:href",fileUrl);
        $frameImage.setAttribute("href",fileUrl);
        $frameImage.setAttribute("width",image_width);
        $frameImage.setAttribute("height",image_height);
        $frameImage.setAttribute("transform",image_trans);
        // 保存
        ElementUpdate.updateMaterialSource(material, $curElem);
        PrototypeHistory.saveHistory();
    }
    // 上下左右，单一方向对齐
    static alignLocation(attrType) {
        // 主方法，定义变量
        let array_loc = [];                                                    //需要对齐的对象，距离的集合
        let workList = [];                                                     //用于计算排列的对象 mid
        let midList = Z.clone(media.selectedList);                             //选中列表的复制对象
        let removeList = [];                                                   //属于编组对象的 mid 集合，排除的 mid

        // 1：得到素材数据
        for (let i = 0;i < midList.length;i++) {
            let tMid = midList[i];
            if (removeList.indexOf(tMid) >= 0) {                               //编组成员，跳过
                continue;
            }
            let $curElem = media.tool.getSvgElementByMid(tMid);
            let groupId = $curElem.getAttribute("data-groupid");

            // 存在编组
            if (!!groupId) {
                let $$groupElems = Z("g[id^=\"svgElementSon_\"][data-groupid=\"" + groupId + "\"]");
                let groupData = [];
                let group_loc;

                //遍历所有的编组成员
                for (let j = 0;j < $$groupElems.length;j++) {
                    let $groupItem = $$groupElems[j];
                    let itemData = SelectionTool.getEleClientRect($groupItem);
                    let itemMid = parseInt($groupItem.getAttribute("data-mid"));
                    //需要排除的编组对象 mid
                    removeList.push(itemMid);
                    //所有编组对象的位置数据
                    groupData.push(itemData[attrType]);
                }
                if (attrType === "left" || attrType === "top") {
                    group_loc = Const.getMinNum(groupData);
                } else {
                    group_loc = Const.getMaxNum(groupData);
                }
                let group_index = groupData.indexOf(group_loc);
                let group_mid = parseInt($$groupElems[group_index].getAttribute("data-mid"));
                array_loc.push(group_loc / media.tool.showRatio);
                workList.push(group_mid);
            } else {
                let elemData = SelectionTool.getEleClientRect($curElem);
                array_loc.push(elemData[attrType] / media.tool.showRatio);
                workList.push(tMid);
            }
        }
        if (array_loc.length <= 1)
            return;

        // 2：计算得到计算基数 base_loc
        let base_loc =  (attrType === "left" || attrType === "top") ?
            Const.getMinNum(array_loc) : Const.getMaxNum(array_loc);

        // 3：处理每个素材的偏移
        for (let i = 0;i < array_loc.length;i++) {
            let d = Math.round(base_loc - array_loc[i]);
            if (d === 0) {
                continue;
            }
            let workMid = workList[i];
            ElementUpdate.setEachAlignLoc(workMid, attrType, d);
        }
        // 4：保存历史
        PrototypeHistory.saveHistory();
        SelectionTool.selectionToolsShow_group();
    }
    // 轴对齐、分布，获取有效列表 **/
    static alignMultiActiveList (removeList, array_loc, workList, attrType, tMid) {
        // 主方法
        let $curElem = media.tool.getSvgElementByMid(tMid);
        let groupId = $curElem.getAttribute("data-groupid");
        let resultMin = 0;
        let resultMax = 0;
        if (!!groupId) {
            let $$groupElems = Z("g[id^=\"svgElementSon_\"][data-groupid=\"" + groupId + "\"]");
            let groupMinList = [];
            let groupMaxList = [];

            //遍历所有的编组成员
            for (let j = 0;j < $$groupElems.length;j++) {
                let $groupItem = $$groupElems[j];
                let itemData = SelectionTool.getEleClientRect($groupItem);
                let itemMid = parseInt($groupItem.getAttribute("data-mid"));
                //需要排除的编组对象 mid
                removeList.push(itemMid);
                //所有编组对象的位置数据
                if (attrType === "center" || attrType === "level") {
                    groupMinList.push(itemData.left);
                    groupMaxList.push(itemData.left_right);
                } else if (attrType === "middle" || attrType === "vertical") {
                    groupMinList.push(itemData.top);
                    groupMaxList.push(itemData.top_bottom);
                }
            }
            resultMin = Const.getMinNum(groupMinList) / media.tool.showRatio;
            resultMax = Const.getMaxNum(groupMaxList) / media.tool.showRatio;
        } else {
            let elemData = SelectionTool.getEleClientRect($curElem);
            if (attrType === "center" || attrType === "level") {
                resultMin = elemData.left;
                resultMax = elemData.left_right;
            } else if (attrType === "middle" || attrType === "vertical") {
                resultMin = elemData.top;
                resultMax = elemData.top_bottom;
            }
            resultMin /= media.tool.showRatio;
            resultMax /= media.tool.showRatio;
        }

        // 添加结果到 array_loc 数组
        if (attrType === "center" || attrType === "middle") {
            array_loc.push((resultMin + resultMax) / 2);
        } else if (attrType === "level" || attrType === "vertical") {
            array_loc.push({
                'min' : resultMin,
                'max' : resultMax,
                'rect' : resultMax - resultMin,
            });
        }
        workList.push(tMid);
    }
    // 对齐每个数据
    static setEachAlignLoc(workMid, attrType, d) {
        // 主方法
        workMid = parseInt(workMid);
        let material = media.tool.getMaterialByMid(workMid);
        let getElemAlignLoc = ($curElem, attrType, d)=> {
            let x = $curElem.transform.baseVal[0].matrix.e;
            let y = $curElem.transform.baseVal[0].matrix.f;
            switch (attrType){
                case "left": x = x - Math.abs(d); break;
                case "top": y = y - Math.abs(d); break;
                case "left_right": x = x + Math.abs(d); break;
                case "top_bottom": y = y + Math.abs(d); break;
                case "center":
                case "level": x = x + d; break;
                case "middle":
                case "vertical": y = y + d; break;
            }
            return {"x": x,"y":y}
        };
        let setElemTransform = (material, $elem)=> {
            let alignLoc = getElemAlignLoc($elem, attrType, d);
            let trans = $elem.getAttribute("transform");
            trans = trans.replace(/translate\s?\([^)]+\)/, "translate(" + alignLoc.x + " " + alignLoc.y + ")");
            $elem.setAttribute("transform",trans);
            //保存素材
            ElementUpdate.updateMaterialSource(material, $elem);
        };
        if (!!material.groupId) {
            let $$groupElems = Z("g[id^=\"svgElementSon_\"][data-groupid=\"" + material.groupId + "\"]");
            // 遍历所有的编组成员
            for (let j = 0;j < $$groupElems.length;j++) {
                let $elem = $$groupElems[j];
                let itemMid = parseInt($elem.getAttribute("data-mid"));
                let material = media.tool.getMaterialByMid(itemMid);
                setElemTransform(material, $elem);
            }
        } else {
            setElemTransform(material, media.tool.getSvgElementByMid(workMid));
        }
    }
    // 垂直、水平对齐
    static alignByaxis(attrType) {
        // 主方法，定义变量
        let array_loc = [];                                  //需要对齐的对象，距离的集合
        let workList = [];                                   //用于计算排列的对象 mid
        let midList = Z.clone(media.selectedList);           //选中列表的复制对象
        let removeList = [];                                 //属于编组对象的 mid 集合，排除的 mid

        // 1：得到所有素材的数据
        for (let i = 0;i < midList.length;i++) {
            let tMid = midList[i];
            if (removeList.indexOf(tMid) >= 0) {              //编组成员，跳过
                continue;
            }
            ElementUpdate.alignMultiActiveList (removeList, array_loc, workList, attrType, tMid);
        }

        // 2：计算得到基数 base_loc
        if (array_loc.length <= 1) {
            return;
        }
        let base_loc;
        let groupToolRect = SelectionTool.getEleClientRect(Z("#selection_tool")[0]);
        if (attrType === "center") {
            base_loc = (groupToolRect.left + groupToolRect.left_right) / (2 * media.tool.showRatio);
        } else if (attrType === "middle") {
            base_loc = (groupToolRect.top + groupToolRect.top_bottom) / (2 * media.tool.showRatio);
        }

        // 3：循环处理每个偏移
        for (let i = 0;i < array_loc.length;i++) {
            let d = Math.round(base_loc - array_loc[i]);
            if (d === 0) {
                continue;
            }
            ElementUpdate.setEachAlignLoc(workList[i], attrType, d);
        }

        // 4：保存历史
        PrototypeHistory.saveHistory();
        SelectionTool.selectionToolsShow_group();
    }
    // 形状线条的端点形状修改
    static switchLineCap(capStyle) {
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        let $svg = $curElem.querySelector("svg");
        let svgType = $svg.getAttribute("data-targetType");
        let $line = $curElem.querySelector("line");
        if (material.targetType !== 5 || svgType !== "shape-line" || !$line){
            return;
        }
        $line.setAttribute("stroke-linecap",capStyle);
        let lineWidth = $svg.viewBox.baseVal.width;
        let setX1, setX2;
        switch (capStyle) {
            // 方角
            case "butt": setX1 = 0; setX2 = lineWidth; break;
            // 圆角
            case "round": setX1 = parseFloat($line.getAttribute("y1")); setX2 = lineWidth - setX1; break;
        }
        $line.setAttribute("x1",setX1);
        $line.setAttribute("x2",setX2);
    }
    // 素材翻转
    static setReversal(material, $curElem, reversal) {
        //获取素材，节点
        material = material || media.tool.tempMaterial || media.tool.getCurMaterial();
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();

        if (!material || !$curElem)
            return;

        //处理
        reversal = reversal || material.reversal;        //reversal = "1 1"
        if (!reversal) {
            return;
        }

        let reversalData = reversal.split(" ");
        let doHType = parseInt(reversalData[0]);
        let doVType = parseInt(reversalData[1]);

        let $gSvg = $curElem.querySelector("g");
        let $svg = $gSvg.querySelector("svg");
        let svgWidth = $svg.width.baseVal.value;
        let svgHeight = $svg.height.baseVal.value;

        let setX = doHType > 0 ? 0 : svgWidth;
        let setY = doVType > 0 ? 0 : svgHeight;

        let trans = "translate(" + setX + " " + setY + ") " + "scale(" + reversal + ")";
        $gSvg.setAttribute("transform", trans);
    }
    // 竖版排列文字
    static setTextVerticalLine(setType, material, $curElem) {
        // left/right -> right/left
        let switchLine = (i)=> {
            let $line = $$line[i];
            let lineBox = $line.getBBox();
            lineTransX += underlineSpace + material.mathHeight;
            $line.setAttribute('transform', 'translate(' + (lineTransX - lineBox.x) + ' 0)');
            lineTransX += lineBox.width;
        };
        // normal -> left/right
        let normalTo = (i)=> {
            let $line = $$line[i];
            let $$gPath = $line.querySelectorAll('.font-path');
            for (let j = 0; j < $$gPath.length; j++) {
                let $gPath = $$gPath[j];
                let pathBox = $gPath.getBBox();
                let pathText = $gPath.getAttribute('data-text').replace(/-%6-%-%0-/g, '<');
                let pathTrans = $gPath.getAttribute('transform');
                let pathTransData = /translate\(([^)\s]+)(?:\s|,)([^)\s]+)/.exec(pathTrans);
                let pathTransY = parseFloat(pathTransData[1]);
                let pathTransX = parseFloat(pathTransData[2]);
                // 除：汉字，其他字符都要旋转
                if (!/[\u4e00-\u9fa5]/.test(pathText)) {
                    if (pathTrans.indexOf('rotate') === -1) {
                        pathTrans += ' rotate(90 0 0)';
                    }
                    if (/skewX/.test(pathTrans)) {
                        let skew = 'skewY(' + (-parseFloat(/skewX\(([^)]+)\)/.exec(pathTrans)[1])) + ')';
                        pathTrans = pathTrans.replace(/skew[^)]+\)/, skew);
                    }
                } else {
                    pathTransY -= pathBox.y;
                    pathTransY += (pathBox.width - pathBox.height) / 2;
                }
                pathTrans = pathTrans.replace(/translate\([^)]+\)/, 'translate(' + pathTransX + ' ' + pathTransY + ')');
                $gPath.setAttribute('transform', pathTrans);
            }
            let lineBox = $line.getBBox();
            lineTransX += underlineSpace + material.mathHeight;
            $line.setAttribute('transform', 'translate(' + (lineTransX - lineBox.x) + ' 0)');
            $line.removeAttribute('data-justify');
            lineTransX += lineBox.width;
        };

        // 1：定义变量
        if (material.textVertical === setType)
            return;
        material.letterSpacing = parseFloat(material.letterSpacing);
        material.mathHeight = parseFloat(material.mathHeight);
        material.underlineOffset = parseFloat(material.underlineOffset);
        material.underlineThickness = parseFloat(material.underlineThickness);
        let underlineSpace = material.underlineOffset + material.underlineThickness;
        let $gSvg = $curElem.querySelector("g");
        let $$svg = $gSvg.children;
        while ($$svg.length > 1)
            $gSvg.removeChild($$svg[0]);
        let $svg = $$svg[0];
        let $rect = $curElem.querySelector('rect');
        let $$line = $svg.children;

        // 2：去除宽高设置属性
        $rect.setAttribute('width', '1');
        $rect.setAttribute('height', '1');
        $svg.removeAttribute('viewBox');
        $svg.removeAttribute('width');
        $svg.removeAttribute('heihgt');

        // 3：执行文字排版转换
        let lineTransX = 0;
        let lineIndex = 0;

        if (setType === 'normal'){// left/right -> normal
            for (let $line of $$line) {
                let $$gPath = $line.querySelectorAll('.font-path');
                for (let i = 0; i < $$gPath.length; i++) {
                    let $gPath = $$gPath[i];
                    let pathTrans = $gPath.getAttribute('transform');
                    pathTrans = pathTrans.replace(/rotate\([^)]+\)/, '').trim();
                    let pathTransX = parseFloat($gPath.getAttribute('data-x'));
                    pathTransX += i * material.letterSpacing;
                    pathTrans = pathTrans.replace(/translate\([^)]+\)/, 'translate(' + pathTransX + ' 0)');
                    if (/skewY/.test(pathTrans)) {
                        let skew = 'skewX(' + (-parseFloat(/skewY\(([^)]+)\)/.exec(pathTrans)[1])) + ')';
                        pathTrans = pathTrans.replace(/skew[^)]+\)/, skew);
                    }
                    $gPath.setAttribute('transform', pathTrans);
                }
                let lineTransY = lineIndex * material.lineHeight + material.textY;
                lineTransX = $line.getAttribute('data-dx');
                lineTransX = lineTransX < 0 ? 0 : lineTransX;
                $line.setAttribute('transform', 'translate(' + lineTransX + ' ' + lineTransY + ')');
                lineIndex++;
            }
        }else if (setType === 'right') {// normal/left -> right
            if (material.textVertical === 'normal') {
                for (let i = $$line.length - 1; i > -1; i--) {
                    normalTo(i);
                }
            } else if (material.textVertical === 'left') {
                for (let i = $$line.length - 1; i > -1; i--)
                    switchLine(i);
            }
        } else if (setType === 'left') {// normal/right -> left
            if (material.textVertical === 'normal') {
                for (let i = 0; i < $$line.length; i++) {
                    normalTo(i);
                }
            } else if (material.textVertical === 'right') {
                for (let i = 0; i < $$line.length; i++)
                    switchLine(i);
            }
        }

        // 4：重设文字特殊编辑
        //

        // 5：重设大小
        let setSvgWidth = $curElem.getBBox().width + '';
        let setSvgHeight = $curElem.getBBox().height;
        if (setType === 'normal') {
            let singleMax = Math.max(material.lineHeight, material.singleHeight);
            setSvgHeight = Math.max(material.lineHeight * ($$line.length - 1) + singleMax, setSvgHeight);
        }
        setSvgHeight = setSvgHeight + '';
        $rect.setAttribute('width', setSvgWidth);
        $rect.setAttribute('height', setSvgHeight);
        $svg.setAttribute('viewBox', '0 0 ' + setSvgWidth + ' ' + setSvgHeight);
        $svg.setAttribute('width', setSvgWidth);
        $svg.setAttribute('height', setSvgHeight);

        // 6：完成切换，赋值
        material.textVertical = setType;
        $curElem.setAttribute('data-textvertical', setType);

        // 7：文字特效
        ElementUpdate.doTextSpecialSet();
    }
    // 文字执行斜体操作
    static setTextItalic(material, $curElem) {
        // 获取参数，节点
        material = material || media.tool.tempMaterial || media.tool.getCurMaterial();
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem)
            return;
        // 执行操作
        ElementUpdate.textItalicFunction(material, $curElem, '-18', 1);
    }
    // 文字取消斜体操作
    static cancelTextItalic(material, $curElem) {
        // 获取参数，节点
        material = material || media.tool.tempMaterial || media.tool.getCurMaterial();
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem)
            return;
        // 执行操作
        ElementUpdate.textItalicFunction(material, $curElem, '0', 0);
    }
    // 文本斜体实现方法
    static textItalicFunction(material, $curElem, skewVal, italicVal) {
        // 1：定义变量
        let $gSvg = $curElem.querySelector("g");
        let $$svg = $gSvg.children;
        while ($$svg.length > 1)
            $gSvg.removeChild($$svg[0]);
        let $svg = $$svg[0];
        let $$lines = $svg.children;

        // 2：遍历每一行，执行处理
        // 根据是否存在横竖版，判断文字的偏移
        for (let i = 0;i < $$lines.length;i++) {
            let $$gPath = $$lines[i].querySelectorAll(".font-path");
            for (let j = 0;j < $$gPath.length;j++) {
                let $gPath = $$gPath[j];
                // 设置斜体参数
                let pathText = $gPath.getAttribute('data-text').replace(/-%6-%-%0-/g, '<');
                let italicStr;
                if (material.textVertical !== 'normal' && !/[\u4e00-\u9fa5]/.test(pathText))
                    italicStr = ' skewY(' + (0 - skewVal) + ')';
                else
                    italicStr = ' skewX(' + skewVal + ')';
                let italicReg = new RegExp(italicStr);
                let pathTrans = $gPath.getAttribute("transform");
                if (italicReg.test(pathTrans))
                    continue;
                if (/\s?skew[XY]\(-?\d+\)/.test(pathTrans))
                    pathTrans = pathTrans.replace(/\s?skew[XY]\([^)]+\)/, italicStr);
                else
                    pathTrans += italicStr;
                $gPath.setAttribute("transform",pathTrans);
            }
        }

        // 3：定义 material 属性，如果存在wordsList
        material.fontItalic = italicVal;
        for (let i = 0;i < material.wordsList.length;i++) {
            material.wordsList[i].fontItalic = material.fontItalic;
        }
        // 判断是否是特殊文字
        ElementUpdate.setTextMaterialData(material, $curElem);

        // 4：重新计算宽高
        let $rect = $curElem.querySelector("rect");
        let lineLength = $$lines.length;

        // 去除翻转设置
        $gSvg.setAttribute('transform', 'translate(0 0) scale(1 1)');
        // 去除宽高设置
        $rect.setAttribute("width", "1");
        $rect.setAttribute("height", "1");
        $svg.removeAttribute("viewBox");
        $svg.removeAttribute("width");
        $svg.removeAttribute("height");

        // 获取最新的宽高
        let set_width, set_height, set_view;
        if (material.textVertical === 'normal') {
            let widthArr = [];
            // 每一行的宽度
            for (let i = 0;i < $$lines.length;i++) {
                let lineWidth = $$lines[i].getBBox().width;
                $$lines[i].setAttribute('data-oldwidth', lineWidth);
                widthArr.push(lineWidth);
            }
            set_width = Math.max($curElem.getBBox().width, Const.getMaxNum(widthArr));     // 素材宽度
            let singleMax = Const.getMaxNum([material.lineHeight, material.singleHeight]);
            set_height = material.lineHeight * (lineLength - 1) + singleMax;         // 素材高度
            set_view = "0 0 " + set_width + " " + set_height;
            material.width = set_width;
            material.height = set_height;
        } else {
            set_width = $curElem.getBBox().width;
            set_height = $curElem.getBBox().height;
        }
        $rect.setAttribute("width", set_width + "");
        $rect.setAttribute("height", set_height + "");
        $svg.setAttribute("viewBox", set_view + "");
        $svg.setAttribute("width", set_width + "");
        $svg.setAttribute("height", set_height + "");

        // 5：执行文字特效处理
        // 缩放
        if (material.textZoom !== '1 1')
            ElementUpdate.setTextZoom(null, material, $curElem);
        // 翻转
        ElementUpdate.setReversal(material, $curElem);
        // 特效
        ElementUpdate.doTextSpecialSet();
        // 校准
        Const.editOverSet($curElem);
    }
    // 添加文字下划线
    static setTextDecoration(material, $curElem) {
        // 获取参数，节点
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();
        material = material || media.tool.tempMaterial || media.tool.getCurMaterial();
        if (!$curElem  || !material)
            return;
        // 执行操作
        ElementUpdate.textDecorationFunction(material, $curElem, 1);
    }
    // 取消文字下划线
    static cancelTextDecoration(material, $curElem) {
        // 获取参数，节点
        material = material || media.tool.tempMaterial || media.tool.getCurMaterial();
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();
        if (!material || !$curElem)
            return;

        // 执行操作
        ElementUpdate.textDecorationFunction(material, $curElem, 0);
    }
    // 文本下划线实现方法
    static textDecorationFunction(material, $curElem, decorationVal) {
        let $gSvg = $curElem.querySelector("g");
        let $$svg = $gSvg.children;
        while ($$svg.length > 1)
            $gSvg.removeChild($$svg[0]);
        let $svg = $$svg[0];
        let $$fontPaths = $svg.querySelectorAll(".font-path");
        for (let i = 0;i < $$fontPaths.length;i++) {
            let $gPath = $$fontPaths[i];
            // 创建线条
            let $line = $gPath.querySelector("line");
            if ($line) {
                $line.parentNode.removeChild($line);
            }
            if (!decorationVal){
                continue;
            }
            $line = document.createElementNS(Const.xmlns, "line");
            let setX2 = parseFloat($gPath.getAttribute("data-width")) + parseFloat(material.letterSpacing);
            let stroke = material.wordsList[i].color;
            $line.setAttribute("x1", '0');
            $line.setAttribute("y1", material.underlineOffset);
            $line.setAttribute("x2", setX2);
            $line.setAttribute("y2", material.underlineOffset);
            $line.setAttribute("stroke", stroke);
            $line.setAttribute("stroke-width", material.underlineThickness);
            $gPath.appendChild($line);
        }

        // 定义 material 属性，如果存在wordsList
        material.textDecoration = decorationVal;
        for (let i = 0;i < material.wordsList.length;i++) {
            material.wordsList[i].textDecoration = material.textDecoration;
        }
        // 判断是否是特殊文字
        ElementUpdate.setTextMaterialData(material, $curElem);
        // 特效
        ElementUpdate.doTextSpecialSet();
    }
    // 设置特殊文字效果大小
    static setTextSpecialSize(per, $curElem, material) {
        // 1：获取素材，节点
        $curElem = $curElem || media.tool.tempElement || media.tool.getCurSvgElement();
        material = material || media.tool.tempMaterial || media.tool.getCurMaterial();
        if (!$curElem  || !material)
            return;
        let $$svg = Z($curElem).children('g').children('svg');
        let listLength = $$svg.length;
        let $svg = $$svg[listLength - 1];
        let $rect = $curElem.querySelector('rect');
        let fontSize = material.fontSize;
        if (parseFloat({}.createMode) === 1)
            fontSize = Exchange.px2pt(fontSize);

        // 2：分类处理
        let setSpecialSize = -1;
        switch (material.textSpecial) {
            case 'stroke-1': {// 文字特效大小：stroke-1
                if (listLength !== 2)
                    return;
                let $strokeSvg = $$svg[0];
                let baseStroke = 30/20 * fontSize;
                setSpecialSize = per * baseStroke;
                // 重计算素材大小
                ElementUpdate.resetViewBoxByStrokeWidth(setSpecialSize, material, $curElem);
                // 设置描边
                $strokeSvg.setAttribute('stroke-width', setSpecialSize);
                $strokeSvg.setAttribute('viewBox', $svg.getAttribute('viewBox'));
                $strokeSvg.setAttribute('width', $svg.getAttribute('width'));
                $strokeSvg.setAttribute('height', $svg.getAttribute('height'));
                // 设置描边属性
                let textSize = material.fontSize;
                if (parseFloat({}.createMode) === 1)
                    textSize = Exchange.px2pt(textSize);
                material.textSpecialSize = setSpecialSize / textSize;
                $curElem.setAttribute("data-textspecialsize", material.textSpecialSize);
            } break;
            default:
                return;
        }
        // 3：选中更新
        SelectionTool.selectTheElement_group();
    }
    // 媒体重命名完成
    static renameDone(event) {
        if (event.keyCode && event.keyCode !== 13) {
            return;
        }
        let $thisInput = Z(Z.E.target(event));
        let val = $thisInput.val();
        if (/^\s*$/.test(val)){
            val = '未命名';
            $thisInput.val(val);
        }
        $thisInput.parent().parent().removeClass('texting');
        $thisInput.parent().hide().siblings().show().html(val);
        // {}.mediaName = val;
    }
    // 新建版面
    static doNewPage() {
        // 去除编辑工具
        EditBtnTool.removeAllEditTool();
        Const.loadingList.newPage =  Z.loading({text:"处理中···",shadow:true});
        PrototypeHistory.doAutoSaveMedia(()=> {
            // 新建 coverMaterial，字符串传参
            let lastBgObj = media.bgList[media.bgList.length - 1];
            let newBid = lastBgObj.bid + 1;
            let bgObj = new PageBg({$media: media});
            bgObj.bid = newBid;
            media.bgList.push(bgObj);
            let newCMList = MaterialTool.setCoverMaterial(bgObj, {}.widthMm, {}.heightMm);

            // ajax 执行数据库插入
            let ajax = new Z.Ajax();
            ajax.setClassName("MediaPresenter");
            ajax.setMethodName("doNewPage");
            ajax.addParam("mediaId", media.id);
            ajax.addParam("bid", bgObj.bid);
            ajax.addParam("coverMaterialList", Z.AR.toString(newCMList));
            ajax.setFailure(()=> {
                media.bgList.pop();
                Const.loadingList.newPage && Const.loadingList.newPage.close && Const.loadingList.newPage.close();
            });
            ajax.setSuccess((responseText)=> {
                // 定义 media
                let newMedia = Z.J.toObject(responseText);
                media = new Media({canvas: newMedia.canvasModel, bgList: newMedia.bgList, materialList: newMedia.materialList, coverMaterialList: newMedia.coverMaterialList});
                media.curPage = media.bgList[media.bgList.length - 1].bid;
                // 刷新画布
                Const.loadCanvas();
                // 刷新版面
                Const.refreshPageList();
                // 清除加载框
                Const.loadingList.newPage && Const.loadingList.newPage.close && Const.loadingList.newPage.close();
            });
            ajax.execute();
        }, null, false);
    }
    // 复制版面
    static doCopyPage(bid,event) {
        Z.E.forbidden(event);
        //去除编辑工具
        EditBtnTool.removeAllEditTool();

        Const.loadingList.copyPage =  Z.loading({text:"处理中···",shadow:true});
        PrototypeHistory.doAutoSaveMedia(()=> {
            let ajax = new Z.Ajax();
            ajax.setClassName("MediaPresenter");
            ajax.setMethodName("doCopyPage");
            ajax.addParam("mediaId", media.id);
            ajax.addParam("bid", bid);
            ajax.setFailure((responseText)=> {
                Z.failure(responseText, ()=>
                    Const.loadingList.copyPage && Const.loadingList.copyPage.close && Const.loadingList.copyPage.close()
                );
            });
            ajax.setSuccess((responseText)=> {
                // 定义 media
                let newMedia = Z.J.toObject(responseText);
                media = new Media({
                    canvas: newMedia.canvasModel,
                    bgList: newMedia.bgList,
                    materialList: newMedia.materialList,
                    coverMaterialList: newMedia.coverMaterialList
                });
                media.curPage = media.bgList[media.bgList.length - 1].bid;
                // 刷新画布
                Const.loadCanvas();
                // 刷新版面
                Const.refreshPageList();
                // 清除加载框
                Const.loadingList.copyPage && Const.loadingList.copyPage.close && Const.loadingList.copyPage.close();
            });
            ajax.execute();
        }, bid, false);
    }
    // 删除版面
    static doDelPage(bid,event) {
        Z.E.forbidden(event);
        //去除编辑工具
        EditBtnTool.removeAllEditTool();
        bid = parseFloat(bid);
        let isDelCurPage = (bid === media.curPage) ? 0 : media.curPage;

        Z.confirm("请确定是否删除该版面，删除后不可恢复", ()=> {
            Const.loadingList.delPage = Z.loading({text:"处理中···",shadow:true});
            PrototypeHistory.doAutoSaveMedia(()=> {
                let ajax = new Z.Ajax();
                ajax.setClassName("MediaPresenter");
                ajax.setMethodName("doDelPage");
                ajax.addParam("mediaId", media.id);
                ajax.addParam("bid", bid);
                ajax.setFailure((responseText)=> {
                    Z.failure(responseText, ()=>
                        Const.loadingList.delPage && Const.loadingList.delPage.close && Const.loadingList.delPage.close()
                    );
                });
                ajax.setSuccess((responseText)=> {
                    // 定义 media
                    let newMedia = Z.J.toObject(responseText);
                    media = new Media({
                        canvas: newMedia.canvasModel,
                        bgList: newMedia.bgList,
                        materialList: newMedia.materialList,
                        coverMaterialList: newMedia.coverMaterialList
                    });
                    media.curPage = isDelCurPage;
                    // 刷新画布
                    Const.loadCanvas();
                    // 刷新版面
                    Const.refreshPageList();
                    // 清除加载框
                    Const.loadingList.delPage && Const.loadingList.delPage.close && Const.loadingList.delPage.close();
                });
                ajax.execute();
            }, bid, false);
        });
    }
}





/*******************************************
 ********** media 素材属性值变化 ***********
 ********************************************/
class MediaListen {
    // 1：画布尺寸-输入框修改-等比变化
    static canvasSizeInput(event) {
        Z.E.forbidden(event);
        let radio = 4;
        let powRadio = Math.pow(10, radio);
        // 重定义输入值
        MediaListen.inputNumberFixed(event, radio);

        let $targetInput = Z.E.target(event);
        let $lockWrap = $targetInput.parentElement.parentElement.querySelector('.scaleLockWrap');
        let $widthInput = Z.D.id('canvas_width');
        let $heightInput = Z.D.id('canvas_height');

        let setWidth = $widthInput.value;
        let setHeight = $heightInput.value;
        let sizeScale = parseFloat(Z($lockWrap).attr('data-scale') || 0);

        // 判断是否存在锁定宽高s
        if (!Z($lockWrap).hasClass('active'))
            return;
        if (!sizeScale)
            return Z($lockWrap).removeClass('active');
        if ($targetInput === $widthInput) {
            setHeight = Math.floor((setWidth / sizeScale) * powRadio) / powRadio;
            $heightInput.value = setHeight;
        } else {
            setWidth = Math.floor((setHeight * sizeScale) * powRadio) / powRadio;
            $widthInput.value = setWidth;
        }
    }
    // 1.1：输入框（尺寸大小）内容限制
    static inputNumberFixed(event, radio) {
        Z.E.forbidden(event);
        let $input = Z(Z.E.target(event));
        let val = $input.val();
        radio = parseInt(radio || 4);

        val = val.replace(/[^\d+-.]/g,'');

        // 去除多余+
        if (/\+/.test(val) && !/^\+/.test(val))
            val = val.replace(/\+/g,'');
        // 去除多余-
        if (/\-/.test(val) && !/^\-/.test(val))
            val = val.replace(/\-/g,'');
        // 前置0
        if (/^\./.test(val))
            val = '0' + val;
        // 去除多余.
        if (/\.[^.]*\./.test(val))
            val = /^[^.]+\.[^.]*/.exec(val)[0];
        // 保留有效位
        let radioReg = new RegExp('^[^.]+\\.[^.]{'+ (radio + 1)+'}');
        let radioReg2 = new RegExp('^[^.]+\\.[^.]{'+ (radio)+'}');
        if (radioReg.test(val))
            val = radioReg2.exec(val)[0];
        // 定义新值
        $input.val(val);
    }
    //素材指定/特殊位置点设置
    static materialSpecialLocation(event) {
        let $targ = Z.E.current(event);
        let type = Z($targ).attr("data-targetType");
        Z($targ).addClass('active').siblings('span').removeClass('active');
        ElementUpdate.doSetMaterialPos(type);
    }
    // 填写位置输入框
    static setPoxBoxValueInput(x, y) {
        // 主方法
        // {}.createMode = parseFloat({}.createMode);
        // 1：取值 x，y
        if (!x || !y) {
            let selectedLength = media.selectedList.length;
            let leftArr = [], topArr= [];
            for (let i = 0;i < selectedLength;i++) {
                let tempLeft, tempTop;
                let $curElem = media.tool.getCurSvgElement(i);
                if (selectedLength === 1) {
                    let transformList = $curElem.transform.baseVal;
                    for (let j = 0;j < transformList.length;j++){
                        if (transformList[j].targetType === 2){
                            tempLeft = transformList[j].matrix.e;
                            tempTop = transformList[j].matrix.f;
                            break;
                        }
                    }
                } else {
                    let showRatio = media.tool.showRatio;
                    let canvasRect = media.tool.$canvasBg.getBoundingClientRect();
                    let elemRect = $curElem.getBoundingClientRect();
                    tempLeft = (elemRect.left - canvasRect.left) / showRatio;
                    tempTop = (elemRect.top - canvasRect.top) / showRatio;
                }
                leftArr.push(tempLeft);
                topArr.push(tempTop);
            }
            x = Const.getMinNum(leftArr);
            y = Const.getMinNum(topArr);
            if({}.createMode === 0) {
                x = Exchange.px2mm(x, {}.dpi);
                y = Exchange.px2mm(y, {}.dpi);
            }
        }
        x = parseFloat(x.toFixed(4));
        y = parseFloat(y.toFixed(4));
        // 2：赋值
        Z("#material_x").val(x);
        Z("#material_y").val(y);
    }
    // 位置设置---输入框变化
    static doChangeMaterialPos() {
        // 主方法
        let selectedLength = media.selectedList.length;
        // 1：取得 x，y 的像数值
        let x = Z("#material_x").val();
        let y = Z("#material_y").val();
        if({}.createMode === 0) {//毫米
            x = Exchange.mm2px(x, {}.dpi);
            y = Exchange.mm2px(y, {}.dpi);
        }
        x = parseFloat(x.toFixed(4));
        y = parseFloat(y.toFixed(4));

        // 2：分情况赋值
        if (selectedLength === 1) {
            ElementUpdate.updateMaterialPos(x, y);
        } else if (selectedLength > 1) {
            let targetData = media.event.startData.targData;
            let elemDataArr = media.event.startData.elemsData;
            let mx = x - targetData.x;
            let my = y - targetData.y;
            for (let i=0;i<elemDataArr.length;i++) {
                let material = media.tool.getCurMaterial(i);
                let $curElem = media.tool.getCurSvgElement(i);
                material.x += mx;
                material.y += my;
                let trans = $curElem.getAttribute("transform");
                trans = trans.replace(/translate\([^)]+\)/,"translate(" + material.x + " " + material.y + ")");
                $curElem.setAttribute("transform",trans);
                ElementUpdate.updateMaterialSource(material, $curElem);
            }
            SelectionTool.saveGroupElemData();
            // 刷新选中框
            SelectionTool.selectionToolsShow_group();
        }
        // 3：校验特殊按钮
        EditBtnTool.setPoxBoxSpecialBtn();
        // 4：保存
        PrototypeHistory.saveHistory();
    }
    // 尺寸设置---输入框变化
    static doChangeSvgSize(event) {
        // 主方法
        let material = media.tool.tempMaterial || media.tool.getCurMaterial();
        // 1：常量获取
        if (material.status !== 0)
            return;

        // 1：判断是否存在锁定宽高
        let $targetInput = Z.E.target(event);
        let $widthInput = Z.D.id('svgSize_width');
        let $heightInput = Z.D.id('svgSize_height');
        let $lockWrap = $targetInput.parentElement.parentElement.querySelector('.scaleLockWrap');
        let sizeScale = parseFloat(Z($lockWrap).attr('data-scale') || 0);
        let setWidth = $widthInput.value;
        let setHeight = $heightInput.value;
        if (Z($lockWrap).hasClass('active') && sizeScale) {
            if ($targetInput === $widthInput) {
                setHeight = parseFloat((setWidth / sizeScale).toFixed(4));
                $heightInput.value = setHeight;
            } else {
                setWidth = parseFloat((setHeight * sizeScale).toFixed(4));
                $widthInput.value = setWidth;
            }
        }

        // 2：单位转换
        if (parseFloat({}.createMode) === 0) {
            setWidth = Exchange.mm2px(setWidth, {}.dpi);
            setHeight = Exchange.mm2px(setHeight, {}.dpi);
        }

        // 4：赋值素材
        let $curElem = media.tool.tempElement || media.tool.getCurSvgElement();
        let $rect = $curElem.querySelector("rect");
        let $svg = $curElem.querySelector("svg");

        let materialType = media.tool.$toolsWrap.attr('data-targetType');
        let secondType = media.tool.$toolsWrap.attr('data-second');
        // 设置 rect、svg 的宽高
        let setRectSize = function() {
            let textZoom = material.textZoom.split(" ");
            material.width = setWidth / parseFloat(textZoom[0]);
            material.height = setHeight / parseFloat(textZoom[1]);
            $svg.setAttribute("width", setWidth);
            $svg.setAttribute("height", setHeight);
            $rect.setAttribute("width", setWidth);
            $rect.setAttribute("height", setHeight);
        };
        // 形状分类
        if (materialType === 'shape' && secondType) {
            let viewWidth = $svg.viewBox.baseVal.width;
            let viewHeight = $svg.viewBox.baseVal.height;
            let svgWidth = $svg.width.baseVal.value;
            let svgHeight = $svg.height.baseVal.value;
            let viewRatio = (viewWidth / svgWidth + viewHeight / svgHeight) / 2;
            switch (secondType) {
                case 'shape-line': {
                    let $line = $curElem.querySelector("line");
                    $line.setAttribute("x2", setWidth);
                    $line.setAttribute("stroke-width", setHeight);
                    $line.setAttribute("y1", setHeight / 2 + '');
                    $line.setAttribute("y2", setHeight / 2 + '');

                    // rect、svg 宽高
                    $svg.setAttribute("viewBox", "0 0 " + setWidth + " " + setHeight);
                    setRectSize();
                } break;
                case 'shape-rect': {
                    viewWidth = viewRatio * setWidth;
                    viewHeight = viewRatio * setHeight;
                    // 绘制矩形
                    if (media.event["drawRectResize"]($svg, viewWidth, viewHeight)){
                        $svg.setAttribute("viewBox","0 0 " + viewWidth + " " + viewHeight);
                        setRectSize();
                    } else {
                        Z.alert("输入有误！");
                        if({}.createMode === 0) {
                            svgWidth = Exchange.px2mm(svgWidth, {}.dpi);
                            svgHeight = Exchange.px2mm(svgHeight, {}.dpi);
                        }
                        $widthInput.value = svgWidth;
                        $heightInput.value = svgHeight;
                    }
                } break;
                case 'shape-rectStroke': {
                    viewWidth = viewRatio * setWidth;
                    viewHeight = viewRatio * setHeight;
                    let mL = Const.getMinNum([viewWidth, viewHeight]) / 2;
                    let stroke_width = parseFloat($svg.getAttribute("data-rectstroke") || 5);
                    stroke_width = stroke_width > mL ? mL : stroke_width;
                    $svg.setAttribute("data-rectstroke", stroke_width + "");

                    // 绘制矩形
                    if (media.event["drawRectStrokeResize"]($svg, viewWidth, viewHeight)){
                        $svg.setAttribute("viewBox","0 0 " + viewWidth + " " + viewHeight);
                        setRectSize();
                    } else {
                        Z.alert("输入有误！");
                        if({}.createMode === 0) {
                            svgWidth = Exchange.px2mm(svgWidth, {}.dpi);
                            svgHeight = Exchange.px2mm(svgHeight, {}.dpi);
                        }
                        $widthInput.value = svgWidth;
                        $heightInput.value = svgHeight;
                    }
                } break;
                case 'shape-ellipse': {
                    let $ellipse = $curElem.querySelector("ellipse");
                    let stroke = parseFloat($ellipse.getAttribute("stroke-width"));
                    viewWidth = viewRatio * setWidth;
                    viewHeight = viewRatio * setHeight;

                    $ellipse.setAttribute("cx", viewWidth / 2 - stroke + '');
                    $ellipse.setAttribute("cy", viewHeight / 2 - stroke + '');
                    $ellipse.setAttribute("rx", viewWidth / 2 - stroke * 2 + '');
                    $ellipse.setAttribute("ry", viewHeight / 2 - stroke * 2 + '');

                    // rect、svg 宽高
                    $svg.setAttribute("viewBox","0 0 " + viewWidth + " " + viewHeight);
                    setRectSize();
                } break;
                case 'shape-table': {
                    $rect.setAttribute("width", setWidth);
                    $rect.setAttribute("height", setHeight);
                    let $$svgTable = $curElem.querySelector("g").children;
                    [].forEach.call($$svgTable, $svg => {
                        if ($svg.tagName.toLowerCase() !== "svg")
                            return;
                        $svg.setAttribute("width", setWidth);
                        $svg.setAttribute("height", setHeight);
                    })
                } break;
            }
        } else {
            if (materialType === 'text') {
            } else {
                setRectSize();
            }
        }

        // 5：刷新选中框，保存
        ElementUpdate.updateMaterialSource(material, $curElem);
        SelectionTool.selectionTool_show();
        PrototypeHistory.saveHistory();
    }
    // 表格边框大小设置
    static inputStrokeTableStrokeSize(event) {
        let $input = Z.E.current(event);
        let val = $input.value.trim();
        val = val === "" ? 0 : val;
        $input.value = val;
        ElementUpdate.updateStrokeStrokeSize(val, $input);
    }
    // 滑块操作
    static rangeWrapMouseDown(event) {
        if (event.button !== 0)
            return;
        Z.E.forbidden(event);
        let $elem = Z.E.current(event);
        let $itemWrap = $elem.parentNode.parentNode;
        $itemWrap.isCanRange = true;
        $itemWrap.eleOldLeft = Z($elem).offsetLeft();
        $itemWrap.mouseOldLocationt = Const.getMouseLocation(event);
        Z($elem).addClass("active");
    }
    static rangeWrapMouseMove(event) {
        Z.E.forbidden(event);
        let itemWraps = Z.E.current(event).querySelectorAll(".itemWrap");
        for (let $itemWrap of itemWraps) {
            if (!$itemWrap.isCanRange)
                continue;

            let changeLeft = Const.getMouseLocation(event).x - $itemWrap.mouseOldLocationt.x;
            let oldLeft = $itemWrap.eleOldLeft;
            let wrapWidth = $itemWrap.querySelector(".range").offsetWidth;

            // 计算滑块偏移距离
            let leftPercent = Math.round((oldLeft + changeLeft) / wrapWidth * 100) ;
            if (leftPercent <= 0) leftPercent = 0;
            if (leftPercent >= 100) leftPercent = 100;
            $itemWrap.querySelector(".range>i").style.left = leftPercent + "%";

            // 依据滑块类型（id），执行方法
            let showValue = leftPercent;
            switch ($itemWrap.id){
                case "imageRadius": // 图片圆角
                    showValue = Math.round(leftPercent / 2);
                    ElementUpdate.setImageEffectRadius(showValue);
                    break;
                case "materialOpacity": // 透明度
                    ElementUpdate.updateSvgTransparency(showValue);
                    break;
                case "textLetterSpacing": // 字间距
                    let rangeLimitWidth = Z.D.id("textLetterSpacing").rangeLimitWidth || 0;
                    if (leftPercent <= 50)
                        showValue = rangeLimitWidth * leftPercent / 50 - rangeLimitWidth;
                    else
                        showValue = leftPercent * 4 - 200;
                    ElementUpdate.updateFontLetterSpacing(showValue);
                    break;
                case "textLineHeight": // 行间距
                    showValue = leftPercent * 10;
                    ElementUpdate.updateFontLineHeight(showValue);
                    break;
                case "shapeLine_dasharray1": // 线条虚线大小
                    showValue = leftPercent * 2;
                    ElementUpdate.updateShapeLineDasharray(showValue, null);
                    break;
                case "shapeLine_dasharray2": // 线条虚线间隔
                    showValue = leftPercent * 2;
                    ElementUpdate.updateShapeLineDasharray(null,showValue);
                    break;
                case "shapeRectRadius": // 矩形圆角
                    ElementUpdate.updateShapeRectRadius(showValue,showValue,showValue,showValue);
                    break;
                case "shapeRectRadius_nw": // 矩形圆角——nw
                    ElementUpdate.updateShapeRectRadius(showValue,null,null,null);
                    break;
                case "shapeRectRadius_ne": // 矩形圆角——ne
                    ElementUpdate.updateShapeRectRadius(null,showValue,null,null);
                    break;
                case "shapeRectRadius_sw": // 矩形圆角——sw
                    ElementUpdate.updateShapeRectRadius(null,null,showValue,null);
                    break;
                case "shapeRectRadius_se": // 矩形圆角——se
                    ElementUpdate.updateShapeRectRadius(null,null,null,showValue);
                    break;
                case "shapeStroke_strokeRange": // 形状边框大小
                    ElementUpdate.updateStrokeStrokeSize(showValue);
                    break;
            }
            $itemWrap.querySelector(".num>input").value = showValue;
        }
    }
    static rangeWrapMouseLeave(event) {// 滑块范围内松开
        Z.E.forbidden(event);
        let itemWraps = Z.E.current(event).querySelectorAll(".itemWrap");
        for (let $itemWrap of itemWraps) {//循环所有滑块条
            if ($itemWrap.isCanRange) {// 滑动过的滑块
                ElementUpdate.updateMaterialSource();
                PrototypeHistory.saveHistory();
            }
            Z($itemWrap).find(".range>i").removeClass("active");
            $itemWrap.isCanRange = $itemWrap.eleOldLeft = $itemWrap.mouseOldLocationt = null;
        }
    }
    // 数值输入框，键盘增减、input、blur
    static numberInputKeyControl(event) {
        Z.E.stop(event);
        let keyCode = event["keyCode"];
        if (keyCode !== 38 && keyCode !== 40 && keyCode !== 13)
            return;

        Z.E.cancel(event);
        let $input = Z.E.current(event);
        if (keyCode === 13) {
            $input.blur();
            ElementUpdate.updateMaterialSource();
            PrototypeHistory.saveHistory();
            return;
        }
        MediaListen.rangeInputChange($input, keyCode);
    }
    static numberInputEventInput(event) {
        Z.E.cancel(event);
        let $input = Z.E.current(event);
        MediaListen.rangeInputChange($input, event.keyCode);
    }
    static numberInputEventBlur(event) {
        let $input = Z.E.current(event);
        let $wrapPopup = Const.closetParentByClass($input,"miniPopup");
        if (!$wrapPopup)
            return;

        let material = $wrapPopup.targMaterial;
        let $curElem = $wrapPopup.targElement;
        if (!material || !$curElem)
            return;

        ElementUpdate.updateMaterialSource(material,$curElem);
        PrototypeHistory.saveHistory();
    }
    // 滑块输入框数值变化
    static rangeInputChange($input, keyCode) {
        let $wrap = $input.parentNode.parentNode;
        let $btn = $wrap.querySelector(".range>i");
        let val = ($input.value)?(parseInt($input.value)):(0);
        let setLeft;
        //输入框数值变化
        if (keyCode === 38) {                             //上 键
            val++;
        } else if (keyCode === 40) {                      //下 键
            val--;
        }
        //依据父级不同的ID，来执行不同的方法
        switch ($wrap.id) {
            case "imageRadius":                             // 图片圆角
                val = (val > 0)?val:0;
                val = (val <= 50)?val:50;
                ElementUpdate.setImageEffectRadius(val);
                setLeft = val * 2;
                break;
            case "textLetterSpacing":                        // 字间距
                let rangeLimitWidth = Z.D.id("textLetterSpacing").rangeLimitWidth || 0;
                val = (val > -rangeLimitWidth) ? val : -rangeLimitWidth;
                val = (val <= 200) ? val : 200;
                ElementUpdate.updateFontLetterSpacing(val);
                setLeft = (val + 200) / 4;
                break;
            case "textLineHeight":                           // 行间距
                val = (val > 0)?val:0;
                val = (val <= 1000)?val:1000;
                ElementUpdate.updateFontLineHeight(val);
                setLeft = val / 10;
                break;
            case "materialOpacity":                          // 透明度
                val = (val > 0)?val:0;
                val = (val <= 100)?val:100;
                ElementUpdate.updateSvgTransparency(val / 100);
                setLeft = val;
                break;
            case "materialRotate":                           // 旋转度
                val = (val >= 0)?val:359;
                val = (val <= 360)?val:1;
                ElementUpdate.updateSvgRotate(val);
                break;
            case "shapeLine_dasharray1":                      // 线条虚线大小
                val = (val >= 0)?val:0;
                val = (val <= 200)?val:200;
                ElementUpdate.updateShapeLineDasharray(val,null);
                setLeft = val / 2;
                break;
            case "shapeLine_dasharray2":                      // 线条虚线间隔
                val = (val >= 0)?val:0;
                val = (val <= 200)?val:200;
                ElementUpdate.updateShapeLineDasharray(null,val);
                setLeft = val / 2;
                break;
            case "shapeRectRadius":                          // 矩形圆角
                val = (val >= 0)?val:0;
                val = (val <= 100)?val:100;
                ElementUpdate.updateShapeRectRadius(val,val,val,val);
                setLeft = val;
                break;
            case "shapeRectRadius_nw":                       // 矩形圆角——nw
                val = (val >= 0)?val:0;
                val = (val <= 100)?val:100;
                ElementUpdate.updateShapeRectRadius(val,null,null,null);
                setLeft = val;
                break;
            case "shapeRectRadius_ne":                       // 矩形圆角——ne
                val = (val >= 0)?val:0;
                val = (val <= 100)?val:100;
                ElementUpdate.updateShapeRectRadius(null,val,null,null);
                setLeft = val;
                break;
            case "shapeRectRadius_sw":                       //矩形圆角——sw
                val = (val >= 0)?val:0;
                val = (val <= 100)?val:100;
                ElementUpdate.updateShapeRectRadius(null,null,val,null);
                setLeft = val;
                break;
            case "shapeRectRadius_se":                       // 矩形圆角——se
                val = (val >= 0)?val:0;
                val = (val <= 100)?val:100;
                ElementUpdate.updateShapeRectRadius(null,null,null,val);
                setLeft = val;
                break;
            case "shapeStroke_strokeRange":                  // 形状边框大小
                val = (val >= 0)?val:0;
                val = (val <= 100)?val:100;
                ElementUpdate.updateStrokeStrokeSize(val);
                setLeft = val;
                break;
        }
        $input.value = val;
        if ($btn && setLeft !== undefined){
            Z($btn).css("left", setLeft + "%");
        }
    }
    // 文字特效点击
    static doTextSpecialSetClick(event) {
        Z.E.forbidden(event);
        let textSpecial = event.currentTarget.getAttribute('data-targetType');
        if (!textSpecial)
            return;
        ElementUpdate.doTextSpecialSet(textSpecial, null, true);
        PrototypeHistory.saveHistory();
    }
    // 文字特效“大小”滑块
    static textSpecialSizeMouseDown(event) {
        let $btn = event.currentTarget;
        let $range = Z.D.id('textSpecial_sizeRange');
        $range.startLoc = {
            'x': event.pageX,
            'left': $btn.offsetLeft,
            'all': $range.offsetWidth,
        };
    }
    static textSpecialSizeMouseMove(event) {
        let $range = Z.D.id('textSpecial_sizeRange');
        if (!$range.startLoc)
            return;
        let baseLoc = $range.startLoc;
        let newLeft = event.pageX - baseLoc.x + baseLoc.left;
        if (newLeft < 0 )
            newLeft = 0;
        if (newLeft > baseLoc.all )
            newLeft = baseLoc.all;
        Z('#textSpecial_sizeRange>.z-pointer').css('left', newLeft);

        ElementUpdate.setTextSpecialSize(newLeft / baseLoc.all);
    }
    static textSpecialSizeMouseUp() {
        Z.D.id('textSpecial_sizeRange').startLoc = null;
    }
    // 多素材选中状态，双击编辑
    static dblClickEditGroup(event) {
        return;
        let selectedLength = media.selectedList.length;
        if (selectedLength < 2)
            return;

        let $selectionTool = Z(this);
        if (!$selectionTool.hasClass('groupTool'))
            return;

        Z.E.forbidden(event);
        // 1：隐藏编辑框
        SelectionTool.selectionAll_hide();
        EditBtnTool.hideToolbar();

        // 2：选中素材可编辑
        for(let i = 0;i < selectedLength;i++) {
        }
    }
    // 文字大小输入框-变化
    static fontSizeInputChange($elem) {
        ElementUpdate.changeMaterialFontSize($elem.value);
    }
    // 文字字体输入框-变化
    static fontSetInputInput($elem) {
        let $input = $elem;
        let inputVal = $input.value.toLowerCase();
        let $dropDown = Z($input).parent().parent().find(".z-dropdown");
        let $list = $dropDown.find(".z-list");
        let $$span = $dropDown.find(".z-list > span");
        $$span.each(function($item){
            let spanVal = Z($item).attr("value").toLowerCase();
            if (spanVal.indexOf(inputVal) === -1) {
                Z($item).addClass("zi-hide").removeClass("zi-show-ib");
            } else {
                Z($item).addClass("zi-show-ib").removeClass("zi-hide");
            }
        });
        if (!$dropDown.find(".z-list > span.zi-show-ib")[0]) {
            $list.addClass("emptyTip");
        } else {
            $list.removeClass("emptyTip");
        }
    }
    // 媒体重命名*/
    static rename(event) {
        let $thisTitle = Z(Z.E.target(event));
        let $input = $thisTitle.hide().siblings().show().find('input');
        let oldVal = $input.val();
        $thisTitle.parent().addClass('texting');
        if (/^未命名$/.test(oldVal.trim()))
            $input.val('');
        $input.focus();
    }
    /** 改变画布尺寸 */
    static changeCanvas(createMode) {
        // 设置“背景素材”
        function setBgMaterial()
        {
        }
        // 设置“遮罩素材”
        function setCanvasCover()
        {
        }

        // 1：定义变量
        let bleedSize = {}.bleedSize || 0;
        let newWidth = parseFloat(Z("#canvas_width").val());
        let newHeight = parseFloat(Z("#canvas_height").val());
        let newWidthMm = newWidth;
        let newHeightMm = newHeight;
        if(createMode ===  0) {
            newWidth = Exchange.mm2px(newWidthMm);
            newHeight = Exchange.mm2px(newHeightMm);
        } else {
            newWidthMm = Exchange.px2mm(newWidthMm);
            newHeightMm = Exchange.px2mm(newHeightMm);
        }
        if (newWidthMm <= 2 || newHeightMm <= 2)
            return Z.failure('尺寸大小输入有误，请重新输入！');

        // 2：隐藏尺寸框
        Z("#canvas_size_box").removeAttr("style");

        // 3：根据设置大小，重设画布宽高属性
        // 补出血长度
        newWidthMm += bleedSize;
        newHeightMm += bleedSize;
        newWidth = Exchange.mm2px(newWidthMm);
        newHeight = Exchange.mm2px(newHeightMm);
        // 切换横竖版，减少用纸单位
        let getAreaTimes = (widthMm, heightMm)=> {
            let fullWidthMm = Math.ceil(widthMm / Const.cardBaseData.baseWidthMm);
            let fullHeightMm = Math.ceil(heightMm / Const.cardBaseData.baseHeightMm);
            return fullWidthMm * fullHeightMm;
        };
        if (getAreaTimes(newHeightMm, newWidthMm) < getAreaTimes(newWidthMm, newHeightMm)) {
            // width、height 对调
            let setWidth = newWidth;
            newWidth = newHeight*1;
            newHeight = setWidth*1;
            let setWidthMm = newWidthMm;
            newWidthMm = newHeightMm*1;
            newHeightMm = setWidthMm*1;

            // 修改输入框内容
            let widthInput = Z("#canvas_width").val();
            Z("#canvas_width").val(Z("#canvas_height").val());
            Z("#canvas_height").val(widthInput);
        }

        // {}.widthMm = newWidthMm;
        // {}.heightMm = newHeightMm;
        // {}.width = newWidth;
        // {}.height = newHeight;
        // {}.fullWidthMm = Const.cardBaseData.baseWidthMm * Math.ceil(newWidthMm / Const.cardBaseData.baseWidthMm);
        // {}.fullHeightMm = Const.cardBaseData.baseHeightMm * Math.ceil(newHeightMm / Const.cardBaseData.baseHeightMm);
        // {}.fullWidth = Exchange.mm2px({}.fullWidthMm);
        // {}.fullHeight = Exchange.mm2px({}.fullHeightMm);

        for(let i = 0;i < media.bgList.length;i++) {
            media.tool.initBgSize(media.bgList[i]);
            media.tool.updateBgSize(media.bgList[i].bid);
        }

        // 4：设置 cover 素材，并加载
        let bgObj = media.tool.getCurBg();
        let $bgElem = media.tool.$canvasMaterial.querySelector('g[id^="svgElementSon_"][data-bgmaterial]');
        if ($bgElem){
            let mid = parseInt($bgElem.getAttribute('data-mid'));
            let bgMaterial = media.tool.getMaterialByMid(mid);
            if (bgMaterial.bgMaterial){
                let $svg = $bgElem.querySelector('svg');
                $svg.setAttribute('width', bgObj.width);
                $svg.setAttribute('height', bgObj.height);
                ElementUpdate.updateMaterialSource(bgMaterial, $bgElem);
            }
        }
        let widthSpace = Math.abs({}.fullWidthMm - {}.widthMm);
        let heightSpace = Math.abs({}.fullHeightMm - {}.heightMm);
        media.coverMaterialList.length = 0;
        if (widthSpace <= Const.deviationSizeMm && heightSpace <= Const.deviationSizeMm) {
            media.tool.$canvasCover.innerHTML = '';
        } else {
            for (let bgObj of media.bgList) {
                MaterialTool.setCoverMaterial(bgObj, newWidthMm, newHeightMm);
            }
        }
        MaterialTool.insertCoverMaterial();

        // 4：刷新版面
        Const.refreshPageList();
        media.tool.updateCurBgSize();
        media.tool.createSvgCanvas();

        // 5：cover 素材加载
        MaterialTool.insertCoverMaterial();

        // 6：添加到历史记录
        PrototypeHistory.saveHistory();

        // 7：隐藏所有框
        SelectionTool.selectionAll_hide();
    }
    /** 选择svg背景 */
    static selBgSvgCode(svgId) {
        let ajax = new Z.Ajax();
        ajax.setClassName("MediaPresenter");
        ajax.setMethodName("getMediaSvg");
        ajax.addParam(svgId);
        ajax.setFailure((responseText)=> Z.failure(responseText));
        ajax.setSuccess((responseText)=> {
            let mediaSvg = Z.J.toObject(responseText);
            media.tool.setBgSvgCode(mediaSvg.svgCode);
            PrototypeHistory.saveHistory();
        });
        ajax.execute();
    }
}