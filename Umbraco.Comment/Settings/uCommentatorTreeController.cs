using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Formatting;
using System.Web;
using umbraco.businesslogic;
using umbraco.BusinessLogic.Actions;
using umbraco.interfaces;
using umbraco.NodeFactory;
using Umbraco.Web.Models.Trees;
using Umbraco.Web.Mvc;
using Umbraco.Web.Trees;

namespace Umbraco.Comment.Settings
{
    [Application("uCommentator", "uCommentator", "icon-quote", 15)]
    public class uCommentatorTreeController : IApplication
    {
    }

    [Umbraco.Web.Trees.Tree("uCommentator", "uCommentatorSection", "Comment", "icon-quote")]
    [PluginController("uCommentator")]
    public class uCommentatorTreeSectionController : TreeController
    {
        protected override TreeNodeCollection GetTreeNodes(string id, FormDataCollection queryStrings)
        {
            if (id == "-1")
            {
                var nodes = new TreeNodeCollection();

                var allComments = this.CreateTreeNode("dashboard", id, queryStrings, "All Comments", "icon-list", false);
                var approvedComments = this.CreateTreeNode("approved", id, queryStrings, "Approved", "icon-check", false);
                var pendingComments = this.CreateTreeNode("pending", id, queryStrings, "Pending", "icon-time", false);
                var spamComments = this.CreateTreeNode("spam", id, queryStrings, "Spam", "icon-squiggly-line", false);
                var deletedComments = this.CreateTreeNode("deleted", id, queryStrings, "Deleted", "icon-trash", false);
                var whitelistUsers = this.CreateTreeNode("whitelist", id, queryStrings, "Whitelist", "icon-thumb-up", false);
                var blacklistUsers = this.CreateTreeNode("blacklist", id, queryStrings, "Blacklist", "icon-block", false);

                approvedComments.RoutePath = "/uCommentator/uCommentatorSection/approved/0";
                pendingComments.RoutePath = "/uCommentator/uCommentatorSection/pending/0";
                spamComments.RoutePath = "/uCommentator/uCommentatorSection/spam/0";
                deletedComments.RoutePath = "/uCommentator/uCommentatorSection/deleted/0";
                whitelistUsers.RoutePath = "/uCommentator/uCommentatorSection/whitelist/0";
                blacklistUsers.RoutePath = "/uCommentator/uCommentatorSection/blacklist/0";

                nodes.Add(allComments);
                nodes.Add(approvedComments);
                nodes.Add(pendingComments);
                nodes.Add(spamComments);
                nodes.Add(deletedComments);
                nodes.Add(whitelistUsers);
                nodes.Add(blacklistUsers);

                return nodes;
            }

            throw new NotImplementedException();
        }

        protected override MenuItemCollection GetMenuForNode(string id, FormDataCollection queryStrings)
        {
            var menu = new MenuItemCollection();
            menu.DefaultMenuAlias = ActionNull.Instance.Alias;

            return menu;
        }
    }
}