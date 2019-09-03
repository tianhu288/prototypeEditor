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
 * 组件表 对应表《PROTOTYPE_LIB》
 */
@AnAlias("PrototypeLib")
@AnNew
@AnTable(table="PROTOTYPE_LIB", key="PROTOTYPE_ID,SCREEN_ID,ID", type="InnoDB")
public class PrototypeLib implements Serializable
{
    private static final long serialVersionUID = 1L;

    @AnTableField(column="PROTOTYPE_ID", type="long", notNull=true)    private long prototypeId;    //1.原型编号
    @AnTableField(column="SCREEN_ID", type="long", notNull=true)    private long screenId;    //2.页面编号
    @AnTableField(column="ID", type="long", notNull=true)    private long id;    //3.组件ID，编组唯一标识
    @AnTableField(column="PID", type="long", notNull=true)    private long pid;    //4.组件索引
    @AnTableField(column="TITLE", type="string,32", notNull=true)    private String title;    //5.组件名称，编组名称
    @AnTableField(column="TYPE", type="string,16", notNull=true)    private String type;    //6.组件类型：
    @AnTableField(column="SEC_TYPE", type="string,16", notNull=false)    private String secType;    //7.自定义类型，自定义源码的组件
    @AnTableField(column="LIB_STATUS", type="byte", notNull=true)    private int libStatus;    //8.组件状态：1表示正常，2表示已删除，3表示已隐藏，4表示已锁定
    @AnTableField(column="THUMB_URL", type="string,20000", notNull=true)    private String thumbUrl;    //9.封面缩略图
    @AnTableField(column="EDITABLE", type="byte", notNull=true)    private int editable;    //10.可编辑：0：正常，1：不可编辑，2：仅大小，3：仅位置，4：仅基础样式
    @AnTableField(column="LIB_KEYS", type="string,5000", notNull=false)    private String libKeys;    //11.关键词
    @AnTableField(column="WIDTH", type="decimal,16,8", notNull=true)    private double width;    //12.元素宽度
    @AnTableField(column="HEIGHT", type="decimal,16,8", notNull=true)    private double height;    //13.元素高度
    @AnTableField(column="X", type="decimal,16,8", notNull=true)    private double x;    //14.水平偏移
    @AnTableField(column="X_RIGHT", type="boolean", notNull=true)    private boolean xRight;    //15.偏移标准：true：right，false：left，默认false
    @AnTableField(column="Y", type="decimal,16,8", notNull=true)    private double y;    //16.垂直偏移
    @AnTableField(column="Y_BOTTOM", type="boolean", notNull=true)    private boolean yBottom;    //17.偏移标准：true：bottom，false：top，默认false
    @AnTableField(column="ROTATION", type="int", notNull=true)    private int rotation;    //18.旋转角度
    @AnTableField(column="OPACITY", type="decimal,8,4", notNull=true)    private double opacity;    //19.不透明度
    @AnTableField(column="LOCKED", type="boolean", notNull=true)    private boolean locked;    //20.是否锁定
    @AnTableField(column="VISIBLE", type="boolean", notNull=true)    private boolean visible;    //21.是否显示
    @AnTableField(column="ACTION", type="string,10000", notNull=false)    private String action;    //22.事件列表，对象字符串
    @AnTableField(column="ENABLE_SHADOW", type="boolean", notNull=true)    private boolean enableShadow;    //23.开启阴影
    @AnTableField(column="SHADOW_COLOR", type="string,16", notNull=false)    private String shadowColor;    //24.阴影颜色
    @AnTableField(column="SHADOW_X", type="int", notNull=false)    private int shadowX;    //25.阴影x偏移
    @AnTableField(column="SHADOW_Y", type="int", notNull=false)    private int shadowY;    //26.阴影y偏移
    @AnTableField(column="SHADOW_BLUR", type="int", notNull=false)    private int shadowBlur;    //27.阴影模糊大小

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

    public long getScreenId()
    {
        return screenId;
    }

    public void setScreenId(long screenId)
    {
        this.screenId = screenId;
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

    public String getType()
    {
        return type;
    }

    public void setType(String type)
    {
        this.type = type;
    }

    public String getSecType()
    {
        return secType;
    }

    public void setSecType(String secType)
    {
        this.secType = secType;
    }

    public int getLibStatus()
    {
        return libStatus;
    }

    public void setLibStatus(int libStatus)
    {
        this.libStatus = libStatus;
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

    public String getLibKeys()
    {
        return libKeys;
    }

    public void setLibKeys(String libKeys)
    {
        this.libKeys = libKeys;
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

    public double getX()
    {
        return x;
    }

    public void setX(double x)
    {
        this.x = x;
    }

    public boolean isXRight()
    {
        return xRight;
    }

    public void setXRight(boolean xRight)
    {
        this.xRight = xRight;
    }

    public double getY()
    {
        return y;
    }

    public void setY(double y)
    {
        this.y = y;
    }

    public boolean isYBottom()
    {
        return yBottom;
    }

    public void setYBottom(boolean yBottom)
    {
        this.yBottom = yBottom;
    }

    public int getRotation()
    {
        return rotation;
    }

    public void setRotation(int rotation)
    {
        this.rotation = rotation;
    }

    public double getOpacity()
    {
        return opacity;
    }

    public void setOpacity(double opacity)
    {
        this.opacity = opacity;
    }

    public boolean isLocked()
    {
        return locked;
    }

    public void setLocked(boolean locked)
    {
        this.locked = locked;
    }

    public boolean isVisible()
    {
        return visible;
    }

    public void setVisible(boolean visible)
    {
        this.visible = visible;
    }

    public String getAction()
    {
        return action;
    }

    public void setAction(String action)
    {
        this.action = action;
    }

    public boolean isEnableShadow()
    {
        return enableShadow;
    }

    public void setEnableShadow(boolean enableShadow)
    {
        this.enableShadow = enableShadow;
    }

    public String getShadowColor()
    {
        return shadowColor;
    }

    public void setShadowColor(String shadowColor)
    {
        this.shadowColor = shadowColor;
    }

    public int getShadowX()
    {
        return shadowX;
    }

    public void setShadowX(int shadowX)
    {
        this.shadowX = shadowX;
    }

    public int getShadowY()
    {
        return shadowY;
    }

    public void setShadowY(int shadowY)
    {
        this.shadowY = shadowY;
    }

    public int getShadowBlur()
    {
        return shadowBlur;
    }

    public void setShadowBlur(int shadowBlur)
    {
        this.shadowBlur = shadowBlur;
    }

}
