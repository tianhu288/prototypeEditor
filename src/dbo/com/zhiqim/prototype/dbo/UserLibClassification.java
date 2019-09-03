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
 * 用户组件分类表 对应表《USER_LIB_CLASSIFICATION》
 */
@AnAlias("UserLibClassification")
@AnNew
@AnTable(table="USER_LIB_CLASSIFICATION", key="USER_ID,", type="InnoDB")
public class UserLibClassification implements Serializable
{
    private static final long serialVersionUID = 1L;

    @AnTableField(column="USER_ID", type="long", notNull=true)    private long userId;    //1.用户id
    @AnTableField(column="ID", type="long", notNull=true)    private long id;    //2.分类id，从1开始
    @AnTableField(column="PID", type="long", notNull=true)    private long pid;    //3.分类索引，连续排序
    @AnTableField(column="CLS_CODE", type="string,16", notNull=true)    private String clsCode;    //4.分类标识，可以是字符、中文

    public String toString()
    {
        return Jsons.toString(this);
    }

    public long getUserId()
    {
        return userId;
    }

    public void setUserId(long userId)
    {
        this.userId = userId;
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

    public String getClsCode()
    {
        return clsCode;
    }

    public void setClsCode(String clsCode)
    {
        this.clsCode = clsCode;
    }

}
