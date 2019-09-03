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

import org.zhiqim.orm.ORM;
import org.zhiqim.orm.ZTable;
import org.zhiqim.orm.dbo.Selector;

import com.zhiqim.prototype.dbo.ElementClassification;
import com.zhiqim.prototype.dbo.SystemElement;

/**
 * TODO：元素分类模型
 * 单个分类的元素列表
 *
 * @version v1.0.0 @author wxh 2019-7-4 新建与整理
 */
public class ElementTypeModel
{
    private String code;
    private String name;
    private List<SystemElement> elementList;

    /**
     * 
     */
    public ElementTypeModel()
    {
        this.code = "";
        this.name = "";
        this.elementList = new ArrayList<SystemElement>();
    }

    public ElementTypeModel(String type) throws Exception
    {
        this.code = type;
        
        Selector sel = new Selector();
        sel.addMust("clsCode", type);
        ElementClassification eleCls = ORM.get(ZTable.class).item(ElementClassification.class, sel);
        this.name = eleCls.getClsName();

        Selector sel2 = new Selector();
        sel2.addMaybe("type", type);
        sel2.addMaybe("secType", type);
        sel2.addMust("eleStatus", 1);
        sel2.addOrderbyAsc("id");
        this.elementList = ORM.get(ZTable.class).list(SystemElement.class, sel2);
    }

    public String getCode()
    {
        return code;
    }

    public void setCode(String code)
    {
        this.code = code;
    }

    public String getName()
    {
        return name;
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public List<SystemElement> getElementList()
    {
        return elementList;
    }

    public void setElementList(List<SystemElement> elementList)
    {
        this.elementList = elementList;
    }

}
