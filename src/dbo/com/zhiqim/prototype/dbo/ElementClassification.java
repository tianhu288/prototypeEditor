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
 * 元素分类表 对应表《ELEMENT_CLASSIFICATION》
 */
@AnAlias("ElementClassification")
@AnNew
@AnTable(table="ELEMENT_CLASSIFICATION", key="ID,PID", type="InnoDB")
public class ElementClassification implements Serializable
{
    private static final long serialVersionUID = 1L;

    @AnTableField(column="ID", type="long", notNull=true)    private long id;    //1.分类id，从1开始
    @AnTableField(column="PID", type="long", notNull=true)    private long pid;    //2.分类索引，连续排序
    @AnTableField(column="PARENT", type="string,16", notNull=false)    private String parent;    //3.所属分类code
    @AnTableField(column="CLS_CODE", type="string,16", notNull=true)    private String clsCode;    //4.分类标识
    @AnTableField(column="CLS_NAME", type="string,16", notNull=true)    private String clsName;    //5.分类名
    @AnTableField(column="CLS_STATUS", type="byte", notNull=true)    private int clsStatus;    //6.分类状态，0：正常，1：停用
    @AnTableField(column="CLS_ICON", type="string,20000", notNull=false)    private String clsIcon;    //7.分类图标，svg源码
    @AnTableField(column="CLS_KEYS", type="string,500", notNull=false)    private String clsKeys;    //8.分类关键词

    public String toString()
    {
        return Jsons.toString(this);
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

    public String getParent()
    {
        return parent;
    }

    public void setParent(String parent)
    {
        this.parent = parent;
    }

    public String getClsCode()
    {
        return clsCode;
    }

    public void setClsCode(String clsCode)
    {
        this.clsCode = clsCode;
    }

    public String getClsName()
    {
        return clsName;
    }

    public void setClsName(String clsName)
    {
        this.clsName = clsName;
    }

    public int getClsStatus()
    {
        return clsStatus;
    }

    public void setClsStatus(int clsStatus)
    {
        this.clsStatus = clsStatus;
    }

    public String getClsIcon()
    {
        return clsIcon;
    }

    public void setClsIcon(String clsIcon)
    {
        this.clsIcon = clsIcon;
    }

    public String getClsKeys()
    {
        return clsKeys;
    }

    public void setClsKeys(String clsKeys)
    {
        this.clsKeys = clsKeys;
    }

}
