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
 * 画布表 对应表《PROTOTYPE_CANVAS》
 */
@AnAlias("PrototypeCanvas")
@AnNew
@AnTable(table="PROTOTYPE_CANVAS", key="PROTOTYPE_ID", type="InnoDB")
public class PrototypeCanvas implements Serializable
{
    private static final long serialVersionUID = 1L;

    @AnTableField(column="PROTOTYPE_ID", type="long", notNull=true)    private long prototypeId;    //1.原型编号
    @AnTableField(column="PROTOTYPE_NAME", type="string,32", notNull=true)    private String prototypeName;    //2.原型名称
    @AnTableField(column="PROTOTYPE_TYPE", type="byte", notNull=true)    private int prototypeType;    //3.原型类型：0：通用、1：后台管理、
    @AnTableField(column="THUMB_URL", type="string,20000", notNull=true)    private String thumbUrl;    //4.封面缩略图
    @AnTableField(column="APP_ICON_URL", type="string,20000", notNull=false)    private String appIconUrl;    //5.客户端启动图标
    @AnTableField(column="CREATE_TIME", type="string,19,char", notNull=true)    private String createTime;    //6.创建时间
    @AnTableField(column="UPDATE_TIME", type="string,19,char", notNull=true)    private String updateTime;    //7.更新时间
    @AnTableField(column="WIDTH", type="decimal,16,8", notNull=true)    private double width;    //8.页面缺省宽度
    @AnTableField(column="HEIGHT", type="decimal,16,8", notNull=true)    private double height;    //9.页面缺省高度
    @AnTableField(column="CANVAS_LEFT", type="decimal,16,8", notNull=true)    private double canvasLeft;    //10.当前页面偏移left
    @AnTableField(column="CANVAS_TOP", type="decimal,16,8", notNull=true)    private double canvasTop;    //11.当前页面偏移top
    @AnTableField(column="SCALE", type="decimal,8,4", notNull=true)    private double scale;    //12.当前页面缩放
    @AnTableField(column="SCREEN_ID", type="long", notNull=true)    private long screenId;    //13.当前页面编号
    @AnTableField(column="SHOW_RULER", type="boolean", notNull=true)    private boolean showRuler;    //14.是否显示标尺
    @AnTableField(column="SHOW_LEFT_PANEL", type="boolean", notNull=true)    private boolean showLeftPanel;    //15.是否显示左侧编辑
    @AnTableField(column="SHOW_RIGHT_PANEL", type="boolean", notNull=true)    private boolean showRightPanel;    //16.是否显示右侧编辑
    @AnTableField(column="SHOW_GRID", type="boolean", notNull=true)    private boolean showGrid;    //17.是否显示网格
    @AnTableField(column="SHOW_LAYOUT", type="boolean", notNull=true)    private boolean showLayout;    //18.是否显示布局
    @AnTableField(column="LAYOUT_ROW_SPACE", type="decimal,8,4", notNull=true)    private double layoutRowSpace;    //19.布局行间隔
    @AnTableField(column="LAYOUT_ROW_HEIGHT", type="decimal,8,4", notNull=true)    private double layoutRowHeight;    //20.布局行高度
    @AnTableField(column="LAYOUT_ROW_NUM", type="int", notNull=true)    private int layoutRowNum;    //21.布局行数
    @AnTableField(column="LAYOUT_COLUMN_NUM", type="int", notNull=true)    private int layoutColumnNum;    //22.布局列数
    @AnTableField(column="LAYOUT_COLUMN_SPACE", type="decimal,8,4", notNull=true)    private double layoutColumnSpace;    //23.布局列间隔
    @AnTableField(column="LAYOUT_COLUMN_WIDTH", type="decimal,8,4", notNull=true)    private double layoutColumnWidth;    //24.布局列宽度
    @AnTableField(column="INIT_DONE", type="boolean", notNull=true)    private boolean initDone;    //25.是否完成初始化，首次页面加载设置画布属性

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

    public String getPrototypeName()
    {
        return prototypeName;
    }

    public void setPrototypeName(String prototypeName)
    {
        this.prototypeName = prototypeName;
    }

    public int getPrototypeType()
    {
        return prototypeType;
    }

    public void setPrototypeType(int prototypeType)
    {
        this.prototypeType = prototypeType;
    }

    public String getThumbUrl()
    {
        return thumbUrl;
    }

    public void setThumbUrl(String thumbUrl)
    {
        this.thumbUrl = thumbUrl;
    }

    public String getAppIconUrl()
    {
        return appIconUrl;
    }

    public void setAppIconUrl(String appIconUrl)
    {
        this.appIconUrl = appIconUrl;
    }

    public String getCreateTime()
    {
        return createTime;
    }

    public void setCreateTime(String createTime)
    {
        this.createTime = createTime;
    }

    public String getUpdateTime()
    {
        return updateTime;
    }

    public void setUpdateTime(String updateTime)
    {
        this.updateTime = updateTime;
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

    public double getCanvasLeft()
    {
        return canvasLeft;
    }

    public void setCanvasLeft(double canvasLeft)
    {
        this.canvasLeft = canvasLeft;
    }

    public double getCanvasTop()
    {
        return canvasTop;
    }

    public void setCanvasTop(double canvasTop)
    {
        this.canvasTop = canvasTop;
    }

    public double getScale()
    {
        return scale;
    }

    public void setScale(double scale)
    {
        this.scale = scale;
    }

    public long getScreenId()
    {
        return screenId;
    }

    public void setScreenId(long screenId)
    {
        this.screenId = screenId;
    }

    public boolean isShowRuler()
    {
        return showRuler;
    }

    public void setShowRuler(boolean showRuler)
    {
        this.showRuler = showRuler;
    }

    public boolean isShowLeftPanel()
    {
        return showLeftPanel;
    }

    public void setShowLeftPanel(boolean showLeftPanel)
    {
        this.showLeftPanel = showLeftPanel;
    }

    public boolean isShowRightPanel()
    {
        return showRightPanel;
    }

    public void setShowRightPanel(boolean showRightPanel)
    {
        this.showRightPanel = showRightPanel;
    }

    public boolean isShowGrid()
    {
        return showGrid;
    }

    public void setShowGrid(boolean showGrid)
    {
        this.showGrid = showGrid;
    }

    public boolean isShowLayout()
    {
        return showLayout;
    }

    public void setShowLayout(boolean showLayout)
    {
        this.showLayout = showLayout;
    }

    public double getLayoutRowSpace()
    {
        return layoutRowSpace;
    }

    public void setLayoutRowSpace(double layoutRowSpace)
    {
        this.layoutRowSpace = layoutRowSpace;
    }

    public double getLayoutRowHeight()
    {
        return layoutRowHeight;
    }

    public void setLayoutRowHeight(double layoutRowHeight)
    {
        this.layoutRowHeight = layoutRowHeight;
    }

    public int getLayoutRowNum()
    {
        return layoutRowNum;
    }

    public void setLayoutRowNum(int layoutRowNum)
    {
        this.layoutRowNum = layoutRowNum;
    }

    public int getLayoutColumnNum()
    {
        return layoutColumnNum;
    }

    public void setLayoutColumnNum(int layoutColumnNum)
    {
        this.layoutColumnNum = layoutColumnNum;
    }

    public double getLayoutColumnSpace()
    {
        return layoutColumnSpace;
    }

    public void setLayoutColumnSpace(double layoutColumnSpace)
    {
        this.layoutColumnSpace = layoutColumnSpace;
    }

    public double getLayoutColumnWidth()
    {
        return layoutColumnWidth;
    }

    public void setLayoutColumnWidth(double layoutColumnWidth)
    {
        this.layoutColumnWidth = layoutColumnWidth;
    }

    public boolean isInitDone()
    {
        return initDone;
    }

    public void setInitDone(boolean initDone)
    {
        this.initDone = initDone;
    }

}
