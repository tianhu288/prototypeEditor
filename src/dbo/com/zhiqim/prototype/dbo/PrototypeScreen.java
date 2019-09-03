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
package com.zhiqim.prototype.dbo;

import java.io.Serializable;

import org.zhiqim.kernel.annotation.AnAlias;
import org.zhiqim.kernel.annotation.AnNew;
import org.zhiqim.kernel.json.Jsons;
import org.zhiqim.orm.annotation.*;

/**
 * 页面表 对应表《PROTOTYPE_SCREEN》
 */
@AnAlias("PrototypeScreen")
@AnNew
@AnTable(table="PROTOTYPE_SCREEN", key="PROTOTYPE_ID,ID", type="InnoDB")
public class PrototypeScreen implements Serializable
{
    private static final long serialVersionUID = 1L;

    @AnTableField(column="PROTOTYPE_ID", type="long", notNull=true)    private long prototypeId;    //1.原型编号
    @AnTableField(column="ID", type="long", notNull=true)    private long id;    //2.页面编号，从1开始
    @AnTableField(column="PID", type="long", notNull=true)    private long pid;    //3.页面索引
    @AnTableField(column="TITLE", type="string,32", notNull=true)    private String title;    //4.页面标题
    @AnTableField(column="FILE_NAME", type="string,32", notNull=true)    private String fileName;    //5.页面文件名
    @AnTableField(column="THUMB_URL", type="string,20000", notNull=true)    private String thumbUrl;    //6.页面缩略图
    @AnTableField(column="EDITABLE", type="byte", notNull=true)    private int editable;    //7.页面属性可编辑，不影响页面内元素：0：正常，1：不可编辑，2：仅大小可编辑
    @AnTableField(column="WIDTH", type="decimal,16,8", notNull=true)    private double width;    //8.页面宽度
    @AnTableField(column="HEIGHT", type="decimal,16,8", notNull=true)    private double height;    //9.页面高度
    @AnTableField(column="HEIGHT_AUTO", type="boolean", notNull=true)    private boolean heightAuto;    //10.高度自动
    @AnTableField(column="LINES_HORIZONTAL", type="string,5000", notNull=false)    private String linesHorizontal;    //11.水平辅助线，对象字符串
    @AnTableField(column="LINES_VERTICAL", type="string,5000", notNull=false)    private String linesVertical;    //12.垂直辅助线，对象字符串
    @AnTableField(column="ACTION", type="string,5000", notNull=false)    private String action;    //13.事件列表，对象字符串

    public String toString()
    {
        return Jsons.toString(this);
    }

    public long getPrototypeId()
    {
        return prototypeId;
    }

    public void setPrototypeId(long prototypeId)
    {
        this.prototypeId = prototypeId;
    }

    public long getId()
    {
        return id;
    }

    public void setId(long id)
    {
        this.id = id;
    }

    public long getPid()
    {
        return pid;
    }

    public void setPid(long pid)
    {
        this.pid = pid;
    }

    public String getTitle()
    {
        return title;
    }

    public void setTitle(String title)
    {
        this.title = title;
    }

    public String getFileName()
    {
        return fileName;
    }

    public void setFileName(String fileName)
    {
        this.fileName = fileName;
    }

    public String getThumbUrl()
    {
        return thumbUrl;
    }

    public void setThumbUrl(String thumbUrl)
    {
        this.thumbUrl = thumbUrl;
    }

    public int getEditable()
    {
        return editable;
    }

    public void setEditable(int editable)
    {
        this.editable = editable;
    }

    public double getWidth()
    {
        return width;
    }

    public void setWidth(double width)
    {
        this.width = width;
    }

    public double getHeight()
    {
        return height;
    }

    public void setHeight(double height)
    {
        this.height = height;
    }

    public boolean isHeightAuto()
    {
        return heightAuto;
    }

    public void setHeightAuto(boolean heightAuto)
    {
        this.heightAuto = heightAuto;
    }

    public String getLinesHorizontal()
    {
        return linesHorizontal;
    }

    public void setLinesHorizontal(String linesHorizontal)
    {
        this.linesHorizontal = linesHorizontal;
    }

    public String getLinesVertical()
    {
        return linesVertical;
    }

    public void setLinesVertical(String linesVertical)
    {
        this.linesVertical = linesVertical;
    }

    public String getAction()
    {
        return action;
    }

    public void setAction(String action)
    {
        this.action = action;
    }

}
