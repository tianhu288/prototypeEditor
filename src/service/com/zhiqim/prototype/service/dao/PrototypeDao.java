/*
 * 版权所有 (C) 2015 知启蒙(ZHIQIM) 保留所有权利。
 * 
 * 指定登记&发行网站： https://www.zhiqim.com/ 欢迎加盟知启蒙，[编程有你，知启蒙一路随行]。
 *
 * 本文采用《知启蒙许可证》，除非符合许可证，否则不可使用该文件！
 * 1、您可以免费使用、修改、合并、出版发行和分发，再授权软件、软件副本及衍生软件；
 * 2、您用于商业用途时，必须在原作者指定的登记网站，按原作者要求进行登记；
 * 3、您在使用、修改、合并、出版发行和分发时，必须包含版权声明、许可声明，及保留原作者的著作权、商标和专利等知识产权；
 * 4、您在互联网、移动互联网等大众网络下发行和分发再授权软件、软件副本及衍生软件时，必须在原作者指定的发行网站进行发行和分发；
 * 5、您可以在以下链接获取一个完整的许可证副本。
 * 
 * 许可证链接：http://zhiqim.org/licenses/zhiqim_register_publish_license.htm
 * 
 * 除非法律需要或书面同意，软件由原始码方式提供，无任何明示或暗示的保证和条件。详见完整许可证的权限和限制。
 */
package com.zhiqim.prototype.service.dao;

import java.util.ArrayList;
import java.util.List;

import org.zhiqim.kernel.util.DateTimes;
import org.zhiqim.kernel.util.Ids;
import org.zhiqim.orm.ORM;
import org.zhiqim.orm.ZTable;
import org.zhiqim.orm.dbo.Selector;

import com.zhiqim.prototype.dbo.PrototypeCanvas;
import com.zhiqim.prototype.dbo.PrototypeElement;
import com.zhiqim.prototype.dbo.PrototypeLib;
import com.zhiqim.prototype.dbo.PrototypeScreen;
import com.zhiqim.prototype.service.model.PrototypeModel;

/**
 * TODO：原型操作类
 *
 * @version v1.0.0 @author wxh 2019-6-14 新建与整理
 */
public class PrototypeDao
{

    /**
     * 
     */
    public PrototypeDao()
    {
        // TODO Auto-generated constructor stub
    }
    
    /**
     * 获取原型
     * @param width
     * @param height
     */
    public static PrototypeModel getPrototype(long prototypeId) throws Exception
    {
        if (prototypeId == -1)
            return null;

        PrototypeCanvas canvas = ORM.get(ZTable.class).item(PrototypeCanvas.class, prototypeId);
        if (canvas == null)
            return null;

        Selector sel = new Selector("prototypeId", prototypeId).addOrderbyAsc("pid");
        List<PrototypeScreen> screenList = ORM.get(ZTable.class).list(PrototypeScreen.class, sel); // 升序
        Selector sel2 = new Selector("prototypeId", prototypeId).addOrderbyAsc("zIndex");
        List<PrototypeElement> elementList = ORM.get(ZTable.class).list(PrototypeElement.class, sel2);
        List<PrototypeLib> libList = ORM.get(ZTable.class).list(PrototypeLib.class, sel);

        PrototypeModel prototype = new PrototypeModel(canvas, screenList, elementList, libList);
        return prototype;
    }

    /**
     * 创建空白原型
     * @param width
     * @param height
     * @throws Exception 
     */
    public static PrototypeModel createPrototype(String prototypeName, byte prototypeType, double width, double height) throws Exception
    {
        long prototypeId = Ids.longId();
        String creatTime = DateTimes.getDateTimeString();

        // 画布属性
        PrototypeCanvas canvas = new PrototypeCanvas();
        canvas.setPrototypeId(prototypeId);
        canvas.setPrototypeName(prototypeName);
        canvas.setPrototypeType(prototypeType);
        canvas.setWidth(width);
        canvas.setHeight(height);
        canvas.setCreateTime(creatTime);
        canvas.setUpdateTime(creatTime);

        long screenId = Ids.longId();
        canvas.setThumbUrl("");
        canvas.setScreenId(screenId);
        canvas.setCanvasLeft(0);
        canvas.setCanvasTop(0);
        canvas.setScale(0);
        canvas.setShowRuler(true);
        canvas.setShowLeftPanel(true);
        canvas.setShowRightPanel(true);
        canvas.setShowGrid(false);
        canvas.setShowLayout(false);
        canvas.setLayoutRowNum((int) Math.round(height/(200)));
        canvas.setLayoutRowSpace(20);
        canvas.setLayoutRowHeight(180);
        canvas.setLayoutColumnNum(3);
        canvas.setLayoutColumnSpace(20);
        canvas.setLayoutColumnWidth((width - 40)/3);

        // 页面列表
        List<PrototypeScreen> screenList = new ArrayList<PrototypeScreen>();
        if (prototypeType == 1)
        {// 后台管理
            screenList = createManagerIndex(prototypeId, screenId, width, height);
        }
        else
        {// 通用空白页面
            screenList = createBlankIndex(prototypeId, screenId, prototypeName, width, height);
        }

        PrototypeModel prototype = new PrototypeModel(canvas, screenList, new ArrayList<PrototypeElement>(), new ArrayList<PrototypeLib>());

        ORM.get(ZTable.class).insert(prototype.getCanvas());
        ORM.get(ZTable.class).insertBatch(prototype.getScreenList());
        ORM.get(ZTable.class).insertBatch(prototype.getElementList());
        
        return prototype;
        
    }

    /**
     * 创建后台管理“首页”、“主页”
     * @param prototypeId
     * @param width
     * @param height
     * @throws Exception 
     */
    public static List<PrototypeScreen> createManagerIndex(long prototypeId, long screenId, double width, double height)
    {
        List<PrototypeScreen> screenList = new ArrayList<PrototypeScreen>();

        PrototypeScreen screen = new PrototypeScreen();
        screen.setPrototypeId(prototypeId);
        screen.setThumbUrl("");
        screen.setId(screenId);
        screen.setPid(1);
        screen.setTitle("首页");
        screen.setFileName("index");
        screen.setWidth(width);
        screen.setHeight(height);
        screen.setHeightAuto(false);
        screenList.add(screen);
        

        PrototypeScreen screen2 = new PrototypeScreen();
        screen2.setPrototypeId(prototypeId);
        screen2.setThumbUrl("");
        screen2.setId(Ids.longId());
        screen2.setPid(2);
        screen2.setTitle("主页");
        screen2.setFileName("main");
        screen2.setWidth(width);
        screen2.setHeight(height);
        screen2.setHeightAuto(false);
        screenList.add(screen2);
        
        return screenList;
    }

    /**
     * 创建后空白“首页”
     * @param prototypeId
     * @param prototypeName
     * @param width
     * @param height
     * @throws Exception 
     */
    public static List<PrototypeScreen> createBlankIndex(long prototypeId, long screenId, String prototypeName, double width, double height)
    {
        List<PrototypeScreen> screenList = new ArrayList<PrototypeScreen>();

        PrototypeScreen screen = new PrototypeScreen();
        screen.setPrototypeId(prototypeId);
        screen.setThumbUrl("");
        screen.setId(screenId);
        screen.setPid(1);
        screen.setTitle(prototypeName);
        screen.setFileName("index");
        screen.setWidth(width);
        screen.setHeight(height);
        screen.setHeightAuto(false);
        screenList.add(screen);
        
        return screenList;
    }
}
