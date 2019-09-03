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

import java.util.HashMap;
import java.util.List;

import org.zhiqim.httpd.HttpRequest;
import org.zhiqim.httpd.context.extend.StdSwitchAction;
import org.zhiqim.kernel.paging.PageResult;
import org.zhiqim.kernel.util.Arrays;
import org.zhiqim.kernel.util.Ids;
import org.zhiqim.orm.ORM;
import org.zhiqim.orm.ZTable;
import org.zhiqim.orm.dbo.Selector;
import org.zhiqim.orm.dbo.Updater;

import com.zhiqim.prototype.dbo.ElementClassification;

/**
 * 元素分类列表
 *
 * @version v1.0.0 @author wxh 2019-5-28 新建与整理
 */
public class ElementClassificationListAction extends StdSwitchAction
{

    @Override
    protected void list(HttpRequest request) throws Exception
    {
        // 元素分类
        Selector sel = new Selector();
        sel.addOrderbyAsc("pid");
        List<ElementClassification> eleClsList = ORM.get(ZTable.class).list(ElementClassification.class, sel);
        
        // 重组为 code->eleCls hashMap
        HashMap<String, ElementClassification> clsCodeMap = new HashMap<String, ElementClassification>();
        for (int i=0;i<eleClsList.size();i++)
        {
            ElementClassification eleCls = eleClsList.get(i);
            clsCodeMap.put(eleCls.getClsCode(), eleCls);
        }
        
        // 列表
        int page = request.getParameterInt("page", 1);
        Selector sel2 = new Selector();
        sel2.addOrderbyAsc("pid");
        PageResult<ElementClassification> pageResult = ORM.get(ZTable.class).page(ElementClassification.class, page, 15, sel2);
        pageResult.addConditionMap(request.getParameterMap());
        
        request.setAttribute("eleClsList", eleClsList);
        request.setAttribute("clsCodeMap", clsCodeMap);
        request.setAttribute("pageResult", pageResult);
    }
    
    @Override
    protected void add(HttpRequest request) throws Exception
    {
        long id = Ids.longId();
        String parent = request.getParameter("parent", "");
        String clsName = request.getParameter("clsName");
        String clsCode = request.getParameter("clsCode");
        int clsStatus = request.getParameterInt("clsStatus", 1);
        String clsIcon = request.getParameterNoFileterOnCNT("clsIcon");
        String clsKeys = request.getParameter("clsKeys");
        
        // 同code报错
        Selector sel = new Selector();
        sel.addMust("clsCode", clsCode);
        ElementClassification eleClsCode = ORM.get(ZTable.class).item(ElementClassification.class, sel);
        if (eleClsCode != null)
        {
            request.setResponseError("不能插入相同“代码”的分类！");
            return;
        }
                
        // 计算 pid
        Selector sel2 = new Selector();
        sel2.addOrderbyDesc("pid");
        long pid = ORM.get(ZTable.class).item(ElementClassification.class,sel2).getPid() + 1;
                
        ElementClassification newEleCls = new ElementClassification();
        newEleCls.setClsName(clsName);
        newEleCls.setId(id);
        newEleCls.setPid(pid);
        newEleCls.setParent(parent);
        newEleCls.setClsCode(clsCode);
        newEleCls.setClsStatus(clsStatus);
        newEleCls.setClsIcon(clsIcon);
        newEleCls.setClsKeys(clsKeys);
        
        ORM.get(ZTable.class).insert(newEleCls);
    }

    @Override
    protected void delete(HttpRequest request) throws Exception
    {
        String[] idList = request.getParameterValues("idList");
        if (idList == null || idList.length == 0)
            return;
        
        Selector sel = new Selector();
        sel.addMustInLong("id", Arrays.toLongArray(idList));
        ORM.get(ZTable.class).delete(ElementClassification.class, sel);
    }

    @Override
    protected void update(HttpRequest request) throws Exception
    {
        long id = request.getParameterLong("id");
        long parent = request.getParameterLong("parent", 0);
        String clsName = request.getParameter("clsName");
        String clsCode = request.getParameter("clsCode");
        int clsStatus = request.getParameterInt("clsStatus", 1);
        String clsIcon = request.getParameterNoFileterOnCNT("clsIcon");
        String clsKeys = request.getParameter("clsKeys");
        
        // 同code报错
        Selector sel = new Selector();
        sel.addMust("clsCode", clsCode);
        ElementClassification eleClsCode = ORM.get(ZTable.class).item(ElementClassification.class, sel);
        if (eleClsCode != null)
        {
            if (eleClsCode.getId() != id)
            {
                request.setResponseError("不能插入相同“代码”的分类！");
                return; 
            }
        }
        
        Updater updater = new Updater();
        updater.addMust("id", id);
        updater.addField("parent", parent);
        updater.addField("clsName", clsName);
        updater.addField("clsCode", clsCode);
        updater.addField("clsStatus", clsStatus);
        updater.addField("clsIcon", clsIcon);
        updater.addField("clsKeys", clsKeys);
        ORM.get(ZTable.class).update(ElementClassification.class, updater);
    }
    
    /**
     * 
     */
    public ElementClassificationListAction()
    {
        // TODO Auto-generated constructor stub
    }

    /**
     * @param args
     */
    public static void main(String[] args)
    {
        // TODO Auto-generated method stub

    }

    @Override
    protected void insert(HttpRequest arg0) throws Exception
    {
        // TODO Auto-generated method stub
        
    }

    @Override
    protected void modify(HttpRequest arg0) throws Exception
    {
        // TODO Auto-generated method stub
        
    }

    @Override
    protected void validateForm(HttpRequest arg0) throws Exception
    {
        // TODO Auto-generated method stub
        
    }

    @Override
    protected void validateId(HttpRequest arg0) throws Exception
    {
        // TODO Auto-generated method stub
        
    }

}
