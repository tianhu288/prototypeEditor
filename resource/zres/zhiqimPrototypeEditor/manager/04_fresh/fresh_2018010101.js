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
        Z("#mainbody").css("margin-left", 200);
    }
    else
    {
        $sidebar.hide();
        Z("#logo").hide();
        Z("#mainbody").css("margin-left", 0);
    }
    
    Z.ajax().setClassName("sessionUser").setMethodName("setSidebar").addParam(!$sidebar.isHide()).execute();
};

Zmr.addTopMenuClick = function()
{//增加顶级栏目点击事件
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
    Z(elem).parent().parent().find("li").removeClass("active");
    Z(elem).addClass("active");
    Z.L.href(menuUrl, window.mainFrame);
};

Zmr.calcMainbodyHeight = function()
{//计算主体高度
    var height = Z(document).clientHeight()-55;//-55为topnav的高度
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


/**************************************************/
//定义初始化滑动菜单
/**************************************************/
Z.onload(function()
{//菜单隐藏展开
    Zmr.addTopMenuClick();
});

//END
})(zhiqim);