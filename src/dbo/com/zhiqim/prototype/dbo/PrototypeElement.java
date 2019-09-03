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
 * 元素表 对应表《PROTOTYPE_ELEMENT》
 */
@AnAlias("PrototypeElement")
@AnNew
@AnTable(table="PROTOTYPE_ELEMENT", key="PROTOTYPE_ID,SCREEN_ID,ID", type="InnoDB")
public class PrototypeElement implements Serializable
{
    private static final long serialVersionUID = 1L;

    @AnTableField(column="PROTOTYPE_ID", type="long", notNull=true)    private long prototypeId;    //1.原型编号
    @AnTableField(column="SCREEN_ID", type="long", notNull=true)    private long screenId;    //2.页面编号
    @AnTableField(column="ID", type="long", notNull=true)    private long id;    //3.元素id，可用于查找页面dom
    @AnTableField(column="Z_INDEX", type="long", notNull=true)    private long zIndex;    //4.元素层级
    @AnTableField(column="TITLE", type="string,32", notNull=true)    private String title;    //5.元素名称
    @AnTableField(column="TYPE", type="string,16", notNull=true)    private String type;    //6.元素类型：text、image、shape、rect、audio、video、html、frame、dateTime、
    @AnTableField(column="SEC_TYPE", type="string,16", notNull=false)    private String secType;    //7.元素次级类型，某些类型元素拥有
    @AnTableField(column="ELE_STATUS", type="byte", notNull=true)    private int eleStatus;    //8.元素状态：1表示正常，2表示已删除，3表示已隐藏，4表示已锁定
    @AnTableField(column="THUMB_URL", type="string,20000", notNull=true)    private String thumbUrl;    //9.封面缩略图
    @AnTableField(column="EDITABLE", type="byte", notNull=true)    private int editable;    //10.可编辑：0：正常，1：不可编辑，2：仅大小，3：仅位置，4：基础样式，5：仅文字内容
    @AnTableField(column="ELE_KEYS", type="string,5000", notNull=false)    private String eleKeys;    //11.关键词
    @AnTableField(column="HTML_SOURCE", type="string,20000", notNull=false)    private String htmlSource;    //12.特殊类型的素材，只能用源码表示
    @AnTableField(column="WIDTH", type="decimal,16,8", notNull=true)    private double width;    //13.元素宽度
    @AnTableField(column="HEIGHT", type="decimal,16,8", notNull=true)    private double height;    //14.元素高度
    @AnTableField(column="X", type="decimal,16,8", notNull=true)    private double x;    //15.水平偏移
    @AnTableField(column="X_RIGHT", type="boolean", notNull=true)    private boolean xRight;    //16.偏移标准：true：right，false：left，默认false
    @AnTableField(column="Y", type="decimal,16,8", notNull=true)    private double y;    //17.垂直偏移
    @AnTableField(column="Y_BOTTOM", type="boolean", notNull=true)    private boolean yBottom;    //18.偏移标准：true：bottom，false：top，默认false
    @AnTableField(column="ROTATION", type="int", notNull=true)    private int rotation;    //19.旋转角度
    @AnTableField(column="OPACITY", type="decimal,8,4", notNull=true)    private double opacity;    //20.不透明度
    @AnTableField(column="AUTO_SIZE", type="boolean", notNull=true)    private boolean autoSize;    //21.是否自动大小
    @AnTableField(column="LOCKED", type="boolean", notNull=true)    private boolean locked;    //22.是否锁定
    @AnTableField(column="VISIBLE", type="boolean", notNull=true)    private boolean visible;    //23.是否显示
    @AnTableField(column="PROPAGATE_EVENTS", type="boolean", notNull=true)    private boolean propagateEvents;    //24.是否事件穿透
    @AnTableField(column="LIB_ID", type="long", notNull=false)    private long libId;    //25.组件ID
    @AnTableField(column="LIB_TITLE", type="string,32", notNull=false)    private String libTitle;    //26.组件名称
    @AnTableField(column="BACKGROUND_COLOR", type="string,16", notNull=false)    private String backgroundColor;    //27.背景颜色
    @AnTableField(column="BORDER_WIDTH", type="int", notNull=false)    private int borderWidth;    //28.边框大小
    @AnTableField(column="BORDER_STYLE", type="string,16", notNull=false)    private String borderStyle;    //29.边框类型
    @AnTableField(column="BORDER_COLOR", type="string,16", notNull=false)    private String borderColor;    //30.边框颜色
    @AnTableField(column="RADIUS_TOP_LEFT", type="int", notNull=false)    private int radiusTopLeft;    //31.左上圆角
    @AnTableField(column="RADIUS_TOP_RIGHT", type="int", notNull=false)    private int radiusTopRight;    //32.右上圆角
    @AnTableField(column="RADIUS_BOTTOM_LEFT", type="int", notNull=false)    private int radiusBottomLeft;    //33.左下圆角
    @AnTableField(column="RADIUS_BOTTOM_RIGHT", type="int", notNull=false)    private int radiusBottomRight;    //34.右下圆角
    @AnTableField(column="ACTION", type="string,20000", notNull=false)    private String action;    //35.事件列表:数组列表{id:"",type:"",sort:"",title:"",callback:"",delay:"",animation:"",animationEasing:"",duration:""}
    @AnTableField(column="ENABLE_MASK", type="boolean", notNull=true)    private boolean enableMask;    //36.开启蒙版
    @AnTableField(column="MASK", type="string,10000", notNull=false)    private String mask;    //37.蒙版，对象字符串
    @AnTableField(column="ENABLE_SHADOW", type="boolean", notNull=true)    private boolean enableShadow;    //38.开启阴影
    @AnTableField(column="SHADOW_COLOR", type="string,16", notNull=false)    private String shadowColor;    //39.阴影颜色
    @AnTableField(column="SHADOW_X", type="int", notNull=false)    private int shadowX;    //40.阴影x偏移
    @AnTableField(column="SHADOW_Y", type="int", notNull=false)    private int shadowY;    //41.阴影y偏移
    @AnTableField(column="SHADOW_BLUR", type="int", notNull=false)    private int shadowBlur;    //42.阴影模糊大小
    @AnTableField(column="ENABLE_FILTER", type="boolean", notNull=true)    private boolean enableFilter;    //43.开启滤镜
    @AnTableField(column="FILTER_BLUR", type="decimal,8,4", notNull=false)    private double filterBlur;    //44.模糊
    @AnTableField(column="FILTER_SATURATION", type="decimal,8,4", notNull=false)    private double filterSaturation;    //45.饱和
    @AnTableField(column="FILTER_BRIGHTNESS", type="decimal,8,4", notNull=false)    private double filterBrightness;    //46.亮度
    @AnTableField(column="FILTER_CONTRAST", type="decimal,8,4", notNull=false)    private double filterContrast;    //47.对比
    @AnTableField(column="FILTER_GRAYSCALE", type="decimal,8,4", notNull=false)    private double filterGrayscale;    //48.灰度
    @AnTableField(column="FILTER_SEPIA", type="decimal,8,4", notNull=false)    private double filterSepia;    //49.加深
    @AnTableField(column="FILTER_HUE", type="decimal,8,4", notNull=false)    private double filterHue;    //50.色相
    @AnTableField(column="FILTER_INVERT", type="decimal,8,4", notNull=false)    private double filterInvert;    //51.反相
    @AnTableField(column="ENABLE_TRANSITION", type="boolean", notNull=true)    private boolean enableTransition;    //52.开启动态特效
    @AnTableField(column="TEXT", type="string,20000", notNull=false)    private String text;    //53.文字内容
    @AnTableField(column="TEXT_HEIGHT_AUTO", type="boolean", notNull=false)    private boolean textHeightAuto;    //54.文字高度自动
    @AnTableField(column="TEXT_FONT", type="string,100", notNull=false)    private String textFont;    //55.文字字体
    @AnTableField(column="TEXT_SIZE", type="int", notNull=false)    private int textSize;    //56.字体大小
    @AnTableField(column="TEXT_COLOR", type="string,16", notNull=false)    private String textColor;    //57.字体颜色
    @AnTableField(column="LINE_HEIGHT", type="decimal,8,4", notNull=false)    private double lineHeight;    //58.行高
    @AnTableField(column="LINE_HEIGHT_AUTO", type="boolean", notNull=false)    private boolean lineHeightAuto;    //59.行高自动
    @AnTableField(column="LETTER_SPACE", type="decimal,8,4", notNull=false)    private double letterSpace;    //60.字距
    @AnTableField(column="TEXT_ALIGN", type="string,16", notNull=false)    private String textAlign;    //61.水平对齐：
    @AnTableField(column="VERTICAL_ALIGN", type="string,16", notNull=false)    private String verticalAlign;    //62.垂直对齐：
    @AnTableField(column="TEXT_BOLD", type="boolean", notNull=false)    private boolean textBold;    //63.文字加粗
    @AnTableField(column="TEXT_ITALIC", type="boolean", notNull=false)    private boolean textItalic;    //64.文字斜体
    @AnTableField(column="TEXT_UNDERLINE", type="boolean", notNull=false)    private boolean textUnderline;    //65.文字下划线
    @AnTableField(column="TEXT_SHADOW_X", type="int", notNull=false)    private int textShadowX;    //66.文字投影偏移x
    @AnTableField(column="TEXT_SHADOW_Y", type="int", notNull=false)    private int textShadowY;    //67.文字投影偏移y
    @AnTableField(column="TEXT_SHADOW_BLUR", type="int", notNull=false)    private int textShadowBlur;    //68.文字投影模糊
    @AnTableField(column="ICON_CLASS", type="string,32", notNull=false)    private String iconClass;    //69.图标样式
    @AnTableField(column="IMAGE_FILE", type="string,20000", notNull=false)    private String imageFile;    //70.图片源:数组列表{url:"",type:"",name:"",fileId:""}
    @AnTableField(column="IMAGE_REPEAT", type="boolean", notNull=false)    private boolean imageRepeat;    //71.是否重复平铺
    @AnTableField(column="ASPECT_RATIO", type="decimal,16,8", notNull=false)    private double aspectRatio;    //72.源图片纵横比
    @AnTableField(column="SHAPE_TYPE_NAME", type="string,16", notNull=false)    private String shapeTypeName;    //73.形状类型：
    @AnTableField(column="URL", type="string,200", notNull=false)    private String url;    //74.内嵌网页地址
    @AnTableField(column="SCROLLABLE", type="boolean", notNull=false)    private boolean scrollable;    //75.内嵌网页可滚动
    @AnTableField(column="HTML", type="string,20000", notNull=false)    private String html;    //76.自定义源码
    @AnTableField(column="AUDIO_WAV", type="string,20000", notNull=false)    private String audioWav;    //77.音频文件WAV:数组列表{url:"",type:"",name:"",fileId:""}
    @AnTableField(column="AUDIO_MP3", type="string,20000", notNull=false)    private String audioMp3;    //78.音频文件MP3:数组列表{url:"",type:"",name:"",fileId:""}
    @AnTableField(column="AUDIO_OGG", type="string,20000", notNull=false)    private String audioOgg;    //79.音频文件OGG:数组列表{url:"",type:"",name:"",fileId:""}
    @AnTableField(column="AUDIO_AAC", type="string,20000", notNull=false)    private String audioAac;    //80.音频文件AAC:数组列表{url:"",type:"",name:"",fileId:""}
    @AnTableField(column="VIDEO_TYPE", type="string,16", notNull=false)    private String videoType;    //81.视频引用方式：
    @AnTableField(column="VIDEO_MP4", type="string,20000", notNull=false)    private String videoMp4;    //82.视频文件MP4:数组列表{id:"",url:"",type:"",name:"",fileId:""}
    @AnTableField(column="VIDEO_OGG", type="string,20000", notNull=false)    private String videoOgg;    //83.视频文件OGG:数组列表{id:"",url:"",type:"",name:"",fileId:""}
    @AnTableField(column="VIDEO_WEBM", type="string,20000", notNull=false)    private String videoWebm;    //84.视频文件WEBM:数组列表{id:"",url:"",type:"",name:"",fileId:""}
    @AnTableField(column="VIDEO_PLACEHOLDER", type="string,20000", notNull=false)    private String videoPlaceholder;    //85.视频封面文件源:数组列表{id:"",url:"",type:"",name:"",fileId:""}
    @AnTableField(column="CONTROLS", type="boolean", notNull=false)    private boolean controls;    //86.是否显示控制条
    @AnTableField(column="PRELOAD", type="boolean", notNull=false)    private boolean preload;    //87.是否预加载
    @AnTableField(column="AUTOPLAY", type="boolean", notNull=false)    private boolean autoplay;    //88.是否自动播放
    @AnTableField(column="AUTOPLAY_OFF", type="boolean", notNull=false)    private boolean autoplayOff;    //89.是否自动停止
    @AnTableField(column="DO_LOOP", type="boolean", notNull=false)    private boolean doLoop;    //90.是否循环播放
    @AnTableField(column="DATE_GENERAL_FORMAT", type="string,16", notNull=false)    private String dateGeneralFormat;    //91.显示内容：dateTime、timeDate、data、time
    @AnTableField(column="DATE_FORMAT", type="string,16", notNull=false)    private String dateFormat;    //92.日期显示格式：dayMonthYear、monthDayYear、yearMonthDay
    @AnTableField(column="DAY_FORMAT", type="string,16", notNull=false)    private String dayFormat;    //93.日显示格式：
    @AnTableField(column="MONTH_FORMAT", type="string,16", notNull=false)    private String monthFormat;    //94.月显示格式：
    @AnTableField(column="YEAR_FORMAT", type="string,16", notNull=false)    private String yearFormat;    //95.年显示格式：
    @AnTableField(column="TIME_FORMAT", type="string,16", notNull=false)    private String timeFormat;    //96.时间显示格式：
    @AnTableField(column="DAY_NAME_FORMAT", type="string,16", notNull=false)    private String dayNameFormat;    //97.星期显示格式：
    @AnTableField(column="DATE_SEPARATOR", type="string,16", notNull=false)    private String dateSeparator;    //98.显示分隔符

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

    public long getZIndex()
    {
        return zIndex;
    }

    public void setZIndex(long zIndex)
    {
        this.zIndex = zIndex;
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

    public int getEleStatus()
    {
        return eleStatus;
    }

    public void setEleStatus(int eleStatus)
    {
        this.eleStatus = eleStatus;
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

    public String getEleKeys()
    {
        return eleKeys;
    }

    public void setEleKeys(String eleKeys)
    {
        this.eleKeys = eleKeys;
    }

    public String getHtmlSource()
    {
        return htmlSource;
    }

    public void setHtmlSource(String htmlSource)
    {
        this.htmlSource = htmlSource;
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

    public boolean isAutoSize()
    {
        return autoSize;
    }

    public void setAutoSize(boolean autoSize)
    {
        this.autoSize = autoSize;
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

    public boolean isPropagateEvents()
    {
        return propagateEvents;
    }

    public void setPropagateEvents(boolean propagateEvents)
    {
        this.propagateEvents = propagateEvents;
    }

    public long getLibId()
    {
        return libId;
    }

    public void setLibId(long libId)
    {
        this.libId = libId;
    }

    public String getLibTitle()
    {
        return libTitle;
    }

    public void setLibTitle(String libTitle)
    {
        this.libTitle = libTitle;
    }

    public String getBackgroundColor()
    {
        return backgroundColor;
    }

    public void setBackgroundColor(String backgroundColor)
    {
        this.backgroundColor = backgroundColor;
    }

    public int getBorderWidth()
    {
        return borderWidth;
    }

    public void setBorderWidth(int borderWidth)
    {
        this.borderWidth = borderWidth;
    }

    public String getBorderStyle()
    {
        return borderStyle;
    }

    public void setBorderStyle(String borderStyle)
    {
        this.borderStyle = borderStyle;
    }

    public String getBorderColor()
    {
        return borderColor;
    }

    public void setBorderColor(String borderColor)
    {
        this.borderColor = borderColor;
    }

    public int getRadiusTopLeft()
    {
        return radiusTopLeft;
    }

    public void setRadiusTopLeft(int radiusTopLeft)
    {
        this.radiusTopLeft = radiusTopLeft;
    }

    public int getRadiusTopRight()
    {
        return radiusTopRight;
    }

    public void setRadiusTopRight(int radiusTopRight)
    {
        this.radiusTopRight = radiusTopRight;
    }

    public int getRadiusBottomLeft()
    {
        return radiusBottomLeft;
    }

    public void setRadiusBottomLeft(int radiusBottomLeft)
    {
        this.radiusBottomLeft = radiusBottomLeft;
    }

    public int getRadiusBottomRight()
    {
        return radiusBottomRight;
    }

    public void setRadiusBottomRight(int radiusBottomRight)
    {
        this.radiusBottomRight = radiusBottomRight;
    }

    public String getAction()
    {
        return action;
    }

    public void setAction(String action)
    {
        this.action = action;
    }

    public boolean isEnableMask()
    {
        return enableMask;
    }

    public void setEnableMask(boolean enableMask)
    {
        this.enableMask = enableMask;
    }

    public String getMask()
    {
        return mask;
    }

    public void setMask(String mask)
    {
        this.mask = mask;
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

    public boolean isEnableFilter()
    {
        return enableFilter;
    }

    public void setEnableFilter(boolean enableFilter)
    {
        this.enableFilter = enableFilter;
    }

    public double getFilterBlur()
    {
        return filterBlur;
    }

    public void setFilterBlur(double filterBlur)
    {
        this.filterBlur = filterBlur;
    }

    public double getFilterSaturation()
    {
        return filterSaturation;
    }

    public void setFilterSaturation(double filterSaturation)
    {
        this.filterSaturation = filterSaturation;
    }

    public double getFilterBrightness()
    {
        return filterBrightness;
    }

    public void setFilterBrightness(double filterBrightness)
    {
        this.filterBrightness = filterBrightness;
    }

    public double getFilterContrast()
    {
        return filterContrast;
    }

    public void setFilterContrast(double filterContrast)
    {
        this.filterContrast = filterContrast;
    }

    public double getFilterGrayscale()
    {
        return filterGrayscale;
    }

    public void setFilterGrayscale(double filterGrayscale)
    {
        this.filterGrayscale = filterGrayscale;
    }

    public double getFilterSepia()
    {
        return filterSepia;
    }

    public void setFilterSepia(double filterSepia)
    {
        this.filterSepia = filterSepia;
    }

    public double getFilterHue()
    {
        return filterHue;
    }

    public void setFilterHue(double filterHue)
    {
        this.filterHue = filterHue;
    }

    public double getFilterInvert()
    {
        return filterInvert;
    }

    public void setFilterInvert(double filterInvert)
    {
        this.filterInvert = filterInvert;
    }

    public boolean isEnableTransition()
    {
        return enableTransition;
    }

    public void setEnableTransition(boolean enableTransition)
    {
        this.enableTransition = enableTransition;
    }

    public String getText()
    {
        return text;
    }

    public void setText(String text)
    {
        this.text = text;
    }

    public boolean isTextHeightAuto()
    {
        return textHeightAuto;
    }

    public void setTextHeightAuto(boolean textHeightAuto)
    {
        this.textHeightAuto = textHeightAuto;
    }

    public String getTextFont()
    {
        return textFont;
    }

    public void setTextFont(String textFont)
    {
        this.textFont = textFont;
    }

    public int getTextSize()
    {
        return textSize;
    }

    public void setTextSize(int textSize)
    {
        this.textSize = textSize;
    }

    public String getTextColor()
    {
        return textColor;
    }

    public void setTextColor(String textColor)
    {
        this.textColor = textColor;
    }

    public double getLineHeight()
    {
        return lineHeight;
    }

    public void setLineHeight(double lineHeight)
    {
        this.lineHeight = lineHeight;
    }

    public boolean isLineHeightAuto()
    {
        return lineHeightAuto;
    }

    public void setLineHeightAuto(boolean lineHeightAuto)
    {
        this.lineHeightAuto = lineHeightAuto;
    }

    public double getLetterSpace()
    {
        return letterSpace;
    }

    public void setLetterSpace(double letterSpace)
    {
        this.letterSpace = letterSpace;
    }

    public String getTextAlign()
    {
        return textAlign;
    }

    public void setTextAlign(String textAlign)
    {
        this.textAlign = textAlign;
    }

    public String getVerticalAlign()
    {
        return verticalAlign;
    }

    public void setVerticalAlign(String verticalAlign)
    {
        this.verticalAlign = verticalAlign;
    }

    public boolean isTextBold()
    {
        return textBold;
    }

    public void setTextBold(boolean textBold)
    {
        this.textBold = textBold;
    }

    public boolean isTextItalic()
    {
        return textItalic;
    }

    public void setTextItalic(boolean textItalic)
    {
        this.textItalic = textItalic;
    }

    public boolean isTextUnderline()
    {
        return textUnderline;
    }

    public void setTextUnderline(boolean textUnderline)
    {
        this.textUnderline = textUnderline;
    }

    public int getTextShadowX()
    {
        return textShadowX;
    }

    public void setTextShadowX(int textShadowX)
    {
        this.textShadowX = textShadowX;
    }

    public int getTextShadowY()
    {
        return textShadowY;
    }

    public void setTextShadowY(int textShadowY)
    {
        this.textShadowY = textShadowY;
    }

    public int getTextShadowBlur()
    {
        return textShadowBlur;
    }

    public void setTextShadowBlur(int textShadowBlur)
    {
        this.textShadowBlur = textShadowBlur;
    }

    public String getIconClass()
    {
        return iconClass;
    }

    public void setIconClass(String iconClass)
    {
        this.iconClass = iconClass;
    }

    public String getImageFile()
    {
        return imageFile;
    }

    public void setImageFile(String imageFile)
    {
        this.imageFile = imageFile;
    }

    public boolean isImageRepeat()
    {
        return imageRepeat;
    }

    public void setImageRepeat(boolean imageRepeat)
    {
        this.imageRepeat = imageRepeat;
    }

    public double getAspectRatio()
    {
        return aspectRatio;
    }

    public void setAspectRatio(double aspectRatio)
    {
        this.aspectRatio = aspectRatio;
    }

    public String getShapeTypeName()
    {
        return shapeTypeName;
    }

    public void setShapeTypeName(String shapeTypeName)
    {
        this.shapeTypeName = shapeTypeName;
    }

    public String getUrl()
    {
        return url;
    }

    public void setUrl(String url)
    {
        this.url = url;
    }

    public boolean isScrollable()
    {
        return scrollable;
    }

    public void setScrollable(boolean scrollable)
    {
        this.scrollable = scrollable;
    }

    public String getHtml()
    {
        return html;
    }

    public void setHtml(String html)
    {
        this.html = html;
    }

    public String getAudioWav()
    {
        return audioWav;
    }

    public void setAudioWav(String audioWav)
    {
        this.audioWav = audioWav;
    }

    public String getAudioMp3()
    {
        return audioMp3;
    }

    public void setAudioMp3(String audioMp3)
    {
        this.audioMp3 = audioMp3;
    }

    public String getAudioOgg()
    {
        return audioOgg;
    }

    public void setAudioOgg(String audioOgg)
    {
        this.audioOgg = audioOgg;
    }

    public String getAudioAac()
    {
        return audioAac;
    }

    public void setAudioAac(String audioAac)
    {
        this.audioAac = audioAac;
    }

    public String getVideoType()
    {
        return videoType;
    }

    public void setVideoType(String videoType)
    {
        this.videoType = videoType;
    }

    public String getVideoMp4()
    {
        return videoMp4;
    }

    public void setVideoMp4(String videoMp4)
    {
        this.videoMp4 = videoMp4;
    }

    public String getVideoOgg()
    {
        return videoOgg;
    }

    public void setVideoOgg(String videoOgg)
    {
        this.videoOgg = videoOgg;
    }

    public String getVideoWebm()
    {
        return videoWebm;
    }

    public void setVideoWebm(String videoWebm)
    {
        this.videoWebm = videoWebm;
    }

    public String getVideoPlaceholder()
    {
        return videoPlaceholder;
    }

    public void setVideoPlaceholder(String videoPlaceholder)
    {
        this.videoPlaceholder = videoPlaceholder;
    }

    public boolean isControls()
    {
        return controls;
    }

    public void setControls(boolean controls)
    {
        this.controls = controls;
    }

    public boolean isPreload()
    {
        return preload;
    }

    public void setPreload(boolean preload)
    {
        this.preload = preload;
    }

    public boolean isAutoplay()
    {
        return autoplay;
    }

    public void setAutoplay(boolean autoplay)
    {
        this.autoplay = autoplay;
    }

    public boolean isAutoplayOff()
    {
        return autoplayOff;
    }

    public void setAutoplayOff(boolean autoplayOff)
    {
        this.autoplayOff = autoplayOff;
    }

    public boolean isDoLoop()
    {
        return doLoop;
    }

    public void setDoLoop(boolean doLoop)
    {
        this.doLoop = doLoop;
    }

    public String getDateGeneralFormat()
    {
        return dateGeneralFormat;
    }

    public void setDateGeneralFormat(String dateGeneralFormat)
    {
        this.dateGeneralFormat = dateGeneralFormat;
    }

    public String getDateFormat()
    {
        return dateFormat;
    }

    public void setDateFormat(String dateFormat)
    {
        this.dateFormat = dateFormat;
    }

    public String getDayFormat()
    {
        return dayFormat;
    }

    public void setDayFormat(String dayFormat)
    {
        this.dayFormat = dayFormat;
    }

    public String getMonthFormat()
    {
        return monthFormat;
    }

    public void setMonthFormat(String monthFormat)
    {
        this.monthFormat = monthFormat;
    }

    public String getYearFormat()
    {
        return yearFormat;
    }

    public void setYearFormat(String yearFormat)
    {
        this.yearFormat = yearFormat;
    }

    public String getTimeFormat()
    {
        return timeFormat;
    }

    public void setTimeFormat(String timeFormat)
    {
        this.timeFormat = timeFormat;
    }

    public String getDayNameFormat()
    {
        return dayNameFormat;
    }

    public void setDayNameFormat(String dayNameFormat)
    {
        this.dayNameFormat = dayNameFormat;
    }

    public String getDateSeparator()
    {
        return dateSeparator;
    }

    public void setDateSeparator(String dateSeparator)
    {
        this.dateSeparator = dateSeparator;
    }

}
