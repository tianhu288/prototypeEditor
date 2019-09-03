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
{//BEGIN

/**************************************************/
//定义全局的对象，便于所有的页面调用
/**************************************************/
var Zmr = window.Zmr = {};

Zmr.sidebar = function()
{//打开&关闭边导航
    var $sidebar = Z("#sidebar");
    if ($sidebar.isHide())
    {
        $sidebar.show();
        Z("#logo").show();
        Z("#iframenav").css("margin-left", 200);
        Z("#mainbody").css("margin-left", 200);
    }
    else
    {
        $sidebar.hide();
        Z("#logo").hide();
        Z("#iframenav").css("margin-left", 0);
        Z("#mainbody").css("margin-left", 0);
    }
    
    Z.ajax().setClassName("sessionUser").setMethodName("setSidebar").addParam(!$sidebar.isHide()).execute();
};

Zmr.calcMainbodyHeight = function()
{//计算主体高度
    var height = Z(document).clientHeight()-95;//55为topnav的高度,40为iframenav高度
    Z("#container").css("height", height);
    Z("#mainbody").css("height", height);
}

Zmr.treeExpand = function(code)
{//树菜单展开和关闭
    var $menu = Z("#menu-"+code);
    var $ico = Z("#ico-"+code);
    
    if (!$menu.isHide())
    {
        $menu.hide();
        if ($ico.hasClass("z-mlastnode"))
            $ico.removeClass("z-mlastnode").addClass("z-plastnode");
        else
            $ico.removeClass("z-mnode").addClass("z-pnode");
    }
    else
    {
        $menu.show();
        if ($ico.hasClass("z-plastnode"))
            $ico.removeClass("z-plastnode").addClass("z-mlastnode");
        else
            $ico.removeClass("z-pnode").addClass("z-mnode");
    }
};

Zmr.addTopMenuClick = function()
{//增加顶级栏目点击事件，先定义两个开关，防止并发时导致数据混乱
    Zmr.doClickTopMenuUp = false;
    Zmr.doClickTopMenuDw = false;
    
    Z(".sidebar p").click(function()
    {
        if (Zmr.doClickTopMenuUp || Zmr.doClickTopMenuDw)
            return;
        
        Zmr.doClickTopMenuUp = true;Zmr.doClickTopMenuDw = true;
        Z(this).next("ul").slideToggle(200, function(){Zmr.doClickTopMenuDw = false;})
                .siblings("ul").slideUp(200, function(){Zmr.doClickTopMenuUp = false;});
    });
};

Zmr.doClickChildMenu = function(elem, menuUrl)
{//点击二级栏目
    var $elem = Z(elem);
    
    //1.清除边导航中活动状态，置选中的为活动状态
    $elem.parent().parent().find("li").removeClass("active");
    $elem.addClass("active");
    
    //2.判断是否已存在，存在则置为显示并切换该框架导航选项卡置为活动
    var elemId = $elem[0].id || "click_" + Z.Ids.uuid();
    $elem.attr("id", elemId);
    
    var tabId = "tab_" + elemId;
    var iframeId = "iframe_" + elemId;
    var $tab = Z("#" + tabId);
    var $iframe = Z("#" + iframeId);
    
    if ($tab[0] && $iframe[0])
    {
        $tab.addClass("active").siblings("li").removeClass("active");
        $iframe.addClass("active").siblings("div").removeClass("active");
        Zmr.setTranslateForShowActive();
        return;
    }
    
    //3.不存在则创建该框架导航选项卡
    var $tabList = Z(".iframenav-tab");
    var clickText = $elem.text() || $elem.attr("data-text") || "未命名";
    Z(".iframenav-tab-item").removeClass("active");
    $tab = Z('<li class="iframenav-tab-item active" id="'+ tabId +'"><span>'+ clickText +'</span><i class="z-font z-error"></i></li>')
        .appendTo($tabList);
    $tab.on("click", Zmr.selectIframeTabEvent);
    $tab.find(".z-refresh").on("click", Zmr.refreshIframeTabClick);
    $tab.find(".z-error").on("click", Zmr.closeIframeTabClick);

    Z(".iframenav-cont-item").removeClass("active");
    $iframe = Z('<div id="'+ iframeId +'" class="iframenav-cont-item active"><iframe src="'+ menuUrl +'" name="'+iframeId+'"></iframe></div>')
        .appendTo(".iframenav-cont");

    //4.调整位置偏移，显示完整选项卡
    Zmr.setTranslateForShowActive();
};

Zmr.turnToTabListNext = function(doNext)
{// 选项卡翻页，左右按钮
    var wrapWidth = Z(".iframenav-tab-wrap")[0].getBoundingClientRect().width;
    var $tabList = Z(".iframenav-tab");
    var tabTransX = parseFloat($tabList.css("transform").replace(/^[^\d]+/,"") || 0);
    tabTransX = tabTransX >= 0 ? tabTransX : 0;
    var $$tab = Z(".iframenav-tab-item");
    var listWidth = 0, fillWidth = 0;
    var i=0, j=0, $tab=null, tabWidth=null, fillArray=[];
    
    for (i;i < $$tab.length;i++)
    {
        $tab = $$tab[i];
        tabWidth = $tab.getBoundingClientRect().width;
        listWidth += tabWidth;
        if (doNext)
        {
            if (listWidth - tabTransX > wrapWidth)
            {
                tabTransX = listWidth - tabWidth;
                break;
            }
        }
        else
        {
            fillArray.unshift(tabWidth);
            if (listWidth >= tabTransX)
            {
                while(fillWidth < wrapWidth)
                {
                    fillWidth += fillArray[j++];
                }
                tabTransX = listWidth - fillWidth;
                break;
            }
        }
    }
    $tabList.css("transform", "translate(-" + (tabTransX >= 0 ? tabTransX : 0) + "px,0)");
}

// 选项卡选择
Zmr.selectIframeTabEvent = function(event)
{// 点击选择
    var $tab = Z.E.current(event);
    var tabId = $tab.id;
    Zmr.selectIframeTab(tabId.replace("tab_", ""));
}

Zmr.selectIframeTabActive = function()
{// 当前选择
    var $active = Z(".iframenav-tab-item.active");
    var tabId = $active[0].id;
    Zmr.selectIframeTab(tabId.replace("tab_", ""));
    
    Zmr.toggleIframeCtrlWrap();
}

Zmr.selectIframeTab = function(id)
{// 选项卡选择
    Z("#tab_"+id).addClass("active").siblings(".iframenav-tab-item").removeClass("active");
    Z("#iframe_"+id).addClass("active").siblings(".iframenav-cont-item").removeClass("active");
    Zmr.setTranslateForShowActive();
}

// 点击刷新
Zmr.refreshIframeTabClick = function(event)
{
    var $refresh = Z(Z.E.current(event));
    var tabId = $refresh.parent()[0].id;
    var clearId = tabId.replace("tab_", "");
    Zmr.refreshIframeTab(clearId);
};

Zmr.refreshIframeTab = function(id)
{
    Z("#iframe_" + id).find("iframe")[0].contentWindow.location.reload(true);
};

Zmr.closeIframeTabClick = function(event)
{// 点击关闭
    var $close = Z(Z.E.current(event));
    var tabId = $close.parent()[0].id;
    var clearId = tabId.replace("tab_", "");
    Zmr.closeIframeTab(clearId);
};

Zmr.closeIframeTab = function(id)
{
    // 待删除tab、前一个tab、iframe
    var $delTab = Z("#tab_" + id);
    var $prevTab = Z($delTab[0].previousElementSibling || Z(".iframenav-tab-item:first-child")[0]);
    var $prevIframe = Z(Z.D.id($prevTab[0].id.replace("tab_","iframe_")));
    
    // 执行删除操作
    $delTab.remove();
    Z("#iframe_" + id).remove();

    // 默认显示前一个标签页
    if (!Z(".iframenav-tab-item.active")[0])
    {
        $prevTab.addClass("active");
        $prevIframe.addClass("active");
    }
};

Zmr.setTranslateForShowActive = function()
{// 调整位置偏移，显示完整选项卡

    // 1.校准宽度
    var $tabList = Z(".iframenav-tab");
    var $$tab = Z(".iframenav-tab-item");
    var wrapRect = Z(".iframenav-tab-wrap")[0].getBoundingClientRect();
    var fillWidth = 0;
    [].forEach.call($$tab, function($tab){
        fillWidth += $tab.getBoundingClientRect().width;
    });
    fillWidth = Math.ceil(fillWidth);
    $tabList.css("width", fillWidth > wrapRect.width ? fillWidth : wrapRect.width);
    if (fillWidth < wrapRect.width)
        $tabList.css("transform", "translate(0,0)");

    // 2.当前标签、前后两个标签，宽度信息
    var $active = Z(".iframenav-tab-item.active");
    var activeRect = $active[0].getBoundingClientRect();
    // 前一个标签
    var $prev = $active[0].previousElementSibling;
    var prevWidth = !!$prev ? $prev.getBoundingClientRect().width : 0;
    // 后一个标签
    var $next = $active[0].nextElementSibling;
    var nextWidth = !!$next ? $next.getBoundingClientRect().width : 0;
    
    // 3.标签容器，宽度信息
    
    // 4.计算理论偏移量
    var mLeft = activeRect.left - prevWidth - wrapRect.left;
    var mRight = activeRect.right + nextWidth - wrapRect.right;
    var tabTransX = parseFloat($tabList.css("transform").replace(/^[^\d]+/,"") || 0);
    tabTransX = tabTransX >= 0 ? tabTransX : 0;
    if (mLeft < 0 && mRight > 0)
        return;
        
    if (mLeft < 0)
        tabTransX += mLeft;
        
    if (mRight > 0)
        tabTransX += mRight;
        
    $tabList.css("transform", "translate(-" + tabTransX + "px,0)");
};

/**************************************************/
//外部调用
/**************************************************/

Zmr.toggleIframeCtrlWrap = function()
{//切换关闭操作界面
    Z(".iframenav-ctrl-wrap").toggle();
};

Zmr.closeIframeTabActive = function(typeNum)
{//关闭当前、其他、所有
    var $$tab = Z(".iframenav-tab-item:not(:first-child)");
    var $first = Z(".iframenav-tab-item:first-child");
    var $active = Z(".iframenav-tab-item.active");
    var idList = [];
    if (typeNum > 0)  
    {//当前
        if ($active[0] !== $first[0]){idList.push($active[0].id.replace("tab_", ""));}
    }
    else if (typeNum === 0)
    {//所有
        $$tab.each(function($tab){idList.push($tab.id.replace("tab_", ""));});
    }
    else
    {//其他
        $$tab.each(function($tab){if ($active[0] !== $tab){idList.push($tab.id.replace("tab_",""));}});
    }
    idList.forEach(Zmr.closeIframeTab);
    
    Zmr.setTranslateForShowActive();
    Zmr.toggleIframeCtrlWrap();
};

Zmr.refreshIframeTabActive = function(typeNum)
{//刷新当前、所有
    var $$tab = Z(".iframenav-tab-item");
    var $active = Z(".iframenav-tab-item.active");
    var idList = [];
    if (typeNum)
    {//当前
        idList.push($active[0].id.replace("tab_",""));
    }
    else
    {//所有
        $$tab.each(function($tab){idList.push($tab.id.replace("tab_",""));});
    }
    
    idList.forEach(Zmr.refreshIframeTab);
};

/**************************************************/
//定义初始化滑动菜单
/**************************************************/
Z.onload(function()
{//菜单隐藏展开
    Zmr.addTopMenuClick();
});

//END
})(zhiqim);