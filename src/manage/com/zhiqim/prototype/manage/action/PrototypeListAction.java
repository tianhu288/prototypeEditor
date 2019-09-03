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
import org.zhiqim.orm.ORM;
import org.zhiqim.orm.ZTable;
import org.zhiqim.orm.dbo.Selector;

import com.zhiqim.prototype.dbo.PrototypeCanvas;
import com.zhiqim.prototype.dbo.PrototypeElement;
import com.zhiqim.prototype.dbo.PrototypeScreen;


/**
 * 原型
 *
 * @version v1.0.0 @author wxh 2019-5-28 新建与整理
 */
public class PrototypeListAction extends StdSwitchAction
{

    @Override
    protected void list(HttpRequest request) throws Exception
    {
        int page = request.getParameterInt("page", 1);
        
        Selector sel = new Selector();
        sel.addOrderbyDesc("createTime");

        PageResult<PrototypeCanvas> pageResult = ORM.get(ZTable.class).page(PrototypeCanvas.class, page, 20, sel);
        pageResult.addConditionMap(request.getParameterMap());

        request.setAttribute("pageResult", pageResult);
    }

    @Override
    protected void delete(HttpRequest request) throws Exception
    {
        String[] idList = request.getParameterValues("idList");
        if (idList == null || idList.length == 0)
            return;
        
        Selector sel = new Selector();
        sel.addMustInLong("prototypeId", Arrays.toLongArray(idList));
        ORM.get(ZTable.class).delete(PrototypeCanvas.class, sel);
        ORM.get(ZTable.class).delete(PrototypeScreen.class, sel);
        ORM.get(ZTable.class).delete(PrototypeElement.class, sel);
    }

    /**
     * @param args
     */
    public static void main(String[] args)
    {
        // TODO Auto-generated method stub

    }

    @Override
    protected void add(HttpRequest arg0) throws Exception
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
    protected void update(HttpRequest arg0) throws Exception
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
