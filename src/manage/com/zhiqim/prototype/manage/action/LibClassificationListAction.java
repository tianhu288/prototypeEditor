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

import org.zhiqim.httpd.HttpRequest;
import org.zhiqim.httpd.context.extend.StdSwitchAction;
import org.zhiqim.kernel.paging.PageResult;
import org.zhiqim.kernel.util.Arrays;
import org.zhiqim.kernel.util.Ids;
import org.zhiqim.orm.ORM;
import org.zhiqim.orm.ZTable;
import org.zhiqim.orm.dbo.Selector;
import org.zhiqim.orm.dbo.Updater;

import com.zhiqim.prototype.dbo.LibClassification;

/**
 * TODO：组件分类列表
 *
 * @version v1.0.0 @author wxh 2019-6-28 新建与整理
 */
public class LibClassificationListAction extends StdSwitchAction
{

    @Override
    protected void list(HttpRequest request) throws Exception
    {
        int page = request.getParameterInt("page", 1);
        
        Selector sel = new Selector();
        sel.addOrderbyDesc("id");
        
        long idMax;
        LibClassification eleCls = ORM.get(ZTable.class).item(LibClassification.class, sel);
        if (eleCls != null)
            idMax = eleCls.getId();
        else
            idMax = 0;
        
        Selector sel2 = new Selector();
        sel2.addOrderbyAsc("pid");
        PageResult<LibClassification> pageResult = ORM.get(ZTable.class).page(LibClassification.class, page, 15, sel2);
        pageResult.addConditionMap(request.getParameterMap());
        
        request.setAttribute("idMax", idMax);
        request.setAttribute("pageResult", pageResult);
    }

    @Override
    protected void add(HttpRequest request) throws Exception
    {
        long id = Ids.longId();
        String clsName = request.getParameter("clsName");
        String clsCode = request.getParameter("clsCode");
        int clsStatus = request.getParameterInt("clsStatus", 1);
        String clsKeys = request.getParameter("clsKeys");

        // 同code报错
        Selector sel = new Selector();
        sel.addMust("clsCode", clsCode);
        LibClassification eleClsCode = ORM.get(ZTable.class).item(LibClassification.class, sel);
        if (eleClsCode != null)
        {
            request.setResponseError("不能插入相同“代码”的分类！");
            return;
        }

        // 计算 pid
        Selector sel2 = new Selector();
        sel2.addOrderbyDesc("pid");
        long pid = ORM.get(ZTable.class).item(LibClassification.class,sel2).getPid() + 1;
        
        LibClassification eleCls = new LibClassification();
        eleCls.setId(id);
        eleCls.setPid(pid);
        eleCls.setClsName(clsName);
        eleCls.setClsCode(clsCode);
        eleCls.setClsStatus(clsStatus);
        eleCls.setClsKeys(clsKeys);
        
        ORM.get(ZTable.class).insert(eleCls);
    }

    @Override
    protected void delete(HttpRequest request) throws Exception
    {
        String[] idList = request.getParameterValues("idList");
        if (idList == null || idList.length == 0)
            return;
        
        Selector sel = new Selector();
        sel.addMustInLong("id", Arrays.toLongArray(idList));
        ORM.get(ZTable.class).delete(LibClassification.class, sel);
    }

    @Override
    protected void update(HttpRequest request) throws Exception
    {
        long id = request.getParameterLong("id");
        String clsName = request.getParameter("clsName");
        String clsCode = request.getParameter("clsCode");
        int clsStatus = request.getParameterInt("clsStatus", 1);
        String clsKeys = request.getParameter("clsKeys");
        if (id == 1)
        {
            clsCode = "root";
            clsStatus = 1;
        }

        // 同code报错
        Selector sel = new Selector();
        sel.addMust("clsCode", clsCode);
        LibClassification eleClsCode = ORM.get(ZTable.class).item(LibClassification.class, sel);
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
        updater.addField("clsName", clsName);
        updater.addField("clsCode", clsCode);
        updater.addField("clsStatus", clsStatus);
        updater.addField("clsKeys", clsKeys);
        ORM.get(ZTable.class).update(LibClassification.class, updater);
    }


    /**
     * 
     */
    public LibClassificationListAction()
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
