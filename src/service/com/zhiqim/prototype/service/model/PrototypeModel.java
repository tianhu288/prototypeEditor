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
package com.zhiqim.prototype.service.model;

import java.util.ArrayList;
import java.util.List;

import com.zhiqim.prototype.dbo.PrototypeCanvas;
import com.zhiqim.prototype.dbo.PrototypeElement;
import com.zhiqim.prototype.dbo.PrototypeLib;
import com.zhiqim.prototype.dbo.PrototypeScreen;


/**
 * 原型对象
 *
 * @version v1.0.0 @author wxh 2019-6-14 新建与整理
 */
public class PrototypeModel
{

    private PrototypeCanvas canvasModel;
    private List<PrototypeScreen> screenList;
    private List<PrototypeElement> elementList;
    private List<PrototypeLib> libList;

    public PrototypeModel()
    {
        this.canvasModel = new PrototypeCanvas();
        this.screenList = new ArrayList<PrototypeScreen>();
        this.elementList = new ArrayList<PrototypeElement>();
        this.libList = new ArrayList<PrototypeLib>();
    }
    
    /**
     * 
     */
    public PrototypeModel(PrototypeCanvas canvas, List<PrototypeScreen> screenList, List<PrototypeElement> elementList, List<PrototypeLib> libList)
    {
        this.canvasModel = canvas;
        setScreenList(screenList);
        setElementList(elementList);
        setLibList(libList);
    }

    public PrototypeCanvas getCanvas()
    {
        return canvasModel;
    }
    
    /**
     * @param List<PrototypeScreen> screenList
     */
    public void setCanvas(PrototypeCanvas canvas)
    {
        this.canvasModel = canvas;
    }

    /**
     * @param List<PrototypeScreen> screenList
     */
    public List<PrototypeScreen> getScreenList()
    {
        return screenList;
    }
        
    /**
     * @param List<PrototypeScreen> screenList
     */
    public void setScreenList(List<PrototypeScreen> screenList)
    {
        this.screenList = screenList;
    }
    

    /**
     * @param List<PrototypeScreen> elementList
     */
    public List<PrototypeElement> getElementList()
    {
        return elementList;
    }
        
    /**
     * @param List<PrototypeElement> elementList
     */
    public void setElementList(List<PrototypeElement> elementList)
    {
        this.elementList = elementList;
    }

    public List<PrototypeLib> getLibList()
    {
        return libList;
    }

    public void setLibList(List<PrototypeLib> libList)
    {
        this.libList = libList;
    }

}
