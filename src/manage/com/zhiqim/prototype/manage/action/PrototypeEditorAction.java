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
package com.zhiqim.prototype.manage.action;

import java.util.ArrayList;
import java.util.List;

import org.zhiqim.httpd.HttpRequest;
import org.zhiqim.httpd.context.core.Action;
import org.zhiqim.kernel.annotation.AnFilterNot;
import org.zhiqim.orm.ORM;
import org.zhiqim.orm.ZTable;
import org.zhiqim.orm.dbo.Selector;

import com.zhiqim.prototype.dbo.ElementClassification;
import com.zhiqim.prototype.dbo.LibClassification;
import com.zhiqim.prototype.dbo.UserLibClassification;
import com.zhiqim.prototype.service.dao.PrototypeDao;
import com.zhiqim.prototype.service.model.ElementTypeModel;
import com.zhiqim.prototype.service.model.LibTypeModel;
import com.zhiqim.prototype.service.model.PrototypeModel;

/**
 * 原型编辑
 *
 * @version v1.0.0 @author wxh 2019-5-29 新建与整理
 */
public class PrototypeEditorAction implements Action
{
    @AnFilterNot
    public void execute(HttpRequest request) throws Exception
    {
        // 原型模型
        long prototypeId = request.getParameterLong("prototypeId", -1);
        PrototypeModel prototype = PrototypeDao.getPrototype(prototypeId);
        if (prototype == null)
            return;
        long userId = request.getParameterLong("userId", 0);
            
        // 分类列表
        Selector sel = new Selector();
        sel.addMust("clsStatus", 1);
        List<ElementClassification> eleClsList = ORM.get(ZTable.class).list(ElementClassification.class, sel);
        List<LibClassification> libClsList = ORM.get(ZTable.class).list(LibClassification.class,sel);
        List<UserLibClassification> userLibClsList = ORM.get(ZTable.class).list(UserLibClassification.class);
        
        // 系统元素列表
        List<ElementTypeModel> sysEleTypeList = new ArrayList<ElementTypeModel>();
        for(int i=0;i<eleClsList.size();i++)
        {
            sysEleTypeList.add(new ElementTypeModel(eleClsList.get(i).getClsCode()));
        }
        
        // 系统组件列表
        List<LibTypeModel> sysLibTypeList = new ArrayList<LibTypeModel>();
        for(int i=0;i<libClsList.size();i++)
        {
            sysLibTypeList.add(new LibTypeModel(libClsList.get(i).getClsCode()));
        }

        // 系统图标列表
        List<ElementTypeModel> sysIconTypeList = new ArrayList<ElementTypeModel>();
        for(int i=0;i<eleClsList.size();i++)
        {
            if (eleClsList.get(i).getParent() == "icon")
            {
                sysIconTypeList.add(new ElementTypeModel(eleClsList.get(i).getClsCode()));
            }
        }
        
        // 系统图片列表，按secType展示，key:type,value:list<SystemLib>
        List<ElementTypeModel> sysImageTypeList = new ArrayList<ElementTypeModel>();
        for(int i=0;i<eleClsList.size();i++)
        {
            if (eleClsList.get(i).getParent() == "image")
            {
                sysImageTypeList.add(new ElementTypeModel(eleClsList.get(i).getClsCode()));
            }
        }
        
        // 用户组件列表，按type展示
        List<LibTypeModel> userLibTypeList = new ArrayList<LibTypeModel>();
        for(int i=0;i<userLibClsList.size();i++)
        {
            userLibTypeList.add(new LibTypeModel(userLibClsList.get(i).getClsCode(), userId));
        }
        
        request.setAttribute("prototype", prototype);
        request.setAttribute("eleClsList", eleClsList);
        request.setAttribute("libClsList", libClsList);
        request.setAttribute("sysEleTypeList", sysEleTypeList);
        request.setAttribute("sysLibTypeList", sysLibTypeList);
        request.setAttribute("sysIconTypeList", sysIconTypeList);
        request.setAttribute("sysImageTypeList", sysImageTypeList);
        request.setAttribute("userLibTypeList", userLibTypeList);
    }
}
