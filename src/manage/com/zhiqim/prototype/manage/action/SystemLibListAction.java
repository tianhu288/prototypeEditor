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

import com.zhiqim.prototype.dbo.LibClassification;
import com.zhiqim.prototype.dbo.SystemElement;
import com.zhiqim.prototype.dbo.SystemLib;

/**
 * 原素组件
 *
 * @version v1.0.0 @author wxh 2019-5-28 新建与整理
 */
public class SystemLibListAction extends StdSwitchAction
{

    @Override
    protected void list(HttpRequest request) throws Exception
    {
        // 分类
        Selector sel = new Selector();
        sel.addOrderbyAsc("pid");
        List<LibClassification> libClsList = ORM.get(ZTable.class).list(LibClassification.class, sel);
        // 重组为 code->eleCls hashMap
        HashMap<String, LibClassification> clsCodeMap = new HashMap<String, LibClassification>();
        for (int i=0;i<libClsList.size();i++)
        {
            LibClassification eleCls = libClsList.get(i);
            clsCodeMap.put(eleCls.getClsCode(), eleCls);
        }
        
        // 列表
        int page = request.getParameterInt("page", 1);
        Selector sel2 = new Selector();
        sel2.addOrderbyAsc("pid");
        PageResult<SystemLib> pageResult = ORM.get(ZTable.class).page(SystemLib.class, page, 15, sel2);
        pageResult.addConditionMap(request.getParameterMap());
        
        request.setAttribute("libClsList", libClsList);
        request.setAttribute("clsCodeMap", clsCodeMap);
        request.setAttribute("pageResult", pageResult);
    }

    @Override
    protected void add(HttpRequest request) throws Exception
    {
        long id = Ids.longId();
        String title = request.getParameter("title");
        byte prototypeType = (byte)request.getParameterInt("prototypeType");
        int libStatus = request.getParameterInt("libStatus");
        byte editable = (byte)request.getParameterInt("editable");
        String type = request.getParameter("type");
        String libKeys = request.getParameter("libKeys");
        String secType = request.getParameter("secType");
        String htmlSource = request.getParameter("htmlSource");
        
        // 同title报错
        Selector sel = new Selector();
        sel.addMaybe("title", title);
        SystemLib sysLib = ORM.get(ZTable.class).item(SystemLib.class, sel);
        if (sysLib != null)
        {
            request.setResponseError("不能输入相同“名称”！");
            return;
        }

        // 计算 pid，同类型
        Selector sel2 = new Selector();
        sel2.addMaybe("type", type);
        sel2.addOrderbyDesc("pid");
        SystemLib lib = ORM.get(ZTable.class).item(SystemLib.class,sel2);
        long pid = 1;
        if (lib != null)
            pid += ORM.get(ZTable.class).item(SystemLib.class,sel2).getPid() + 1;
        
        // 插入组件数据
        SystemLib newSysLib = new SystemLib();
        // 参数
        newSysLib.setId(id);
        newSysLib.setTitle(title);
        newSysLib.setPid(pid);
        newSysLib.setPrototypeType(prototypeType);
        newSysLib.setLibStatus(libStatus);
        newSysLib.setEditable(editable);
        newSysLib.setType(type);
        newSysLib.setSecType(secType);
        newSysLib.setLibKeys(libKeys);
        // 缺省值
        newSysLib.setOpacity(100);
        newSysLib.setVisible(true);
        newSysLib.setThumbUrl("");
        
        // 插入元素数据
        SystemElement newSysElement = new SystemElement();
        // 参数
        newSysElement.setId(Ids.longId());
        newSysElement.setTitle(title);
        newSysElement.setType(secType);
        newSysElement.setLibId(id);
        newSysElement.setLibTitle(title);
        newSysElement.setEleStatus(libStatus);
        newSysElement.setZIndex(1);
        newSysElement.setHtmlSource(htmlSource);
        // 缺省值
        newSysElement.setOpacity(100);
        newSysElement.setVisible(true);
        newSysElement.setThumbUrl("");
        
        // 执行插入
        ORM.get(ZTable.class).insert(newSysLib);
        ORM.get(ZTable.class).insert(newSysElement);
        
    }

    @Override
    protected void update(HttpRequest request) throws Exception
    {
        
    }

    @Override
    protected void delete(HttpRequest request) throws Exception
    {
        String[] idList = request.getParameterValues("idList");
        if (idList == null || idList.length == 0)
            return;
        
        Selector sel = new Selector();
        sel.addMustInLong("id", Arrays.toLongArray(idList));
        ORM.get(ZTable.class).delete(SystemLib.class, sel);

        Selector sel2 = new Selector();
        sel2.addMustInLong("libId", Arrays.toLongArray(idList));
        ORM.get(ZTable.class).delete(SystemElement.class, sel2);
    }

    /**
     * 
     */
    public SystemLibListAction()
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
