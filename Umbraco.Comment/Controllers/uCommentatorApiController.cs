using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.ModelBinding;
using System.Web.Management;
using umbraco;
using umbraco.cms.businesslogic.web;
using Umbraco.Comment.Models;
using Umbraco.Core.Models;
using umbraco.NodeFactory;
using Umbraco.Web.WebApi;
using Umbraco.Web;

namespace Umbraco.Comment.Controllers
{
    public class uCommentatorApiController : UmbracoApiController
    {
        private CommentCollection GetReplies(Node comment, int level = 0)
        {
            var replies = new CommentCollection();
            if (comment.ChildrenAsList.Any(x => x.NodeTypeAlias == "CommentItem" && x.GetProperty<bool>("isSpam") == false))
            {
                var counter = 0;
                replies.Comments = new Models.Comment[comment.ChildrenAsList.Count(x => x.NodeTypeAlias == "CommentItem" && x.GetProperty<bool>("isSpam") == false)];
                foreach (var item in comment.ChildrenAsList.Where(x => x.NodeTypeAlias == "CommentItem" && x.GetProperty<bool>("isSpam") == false))
                {
                    replies.Comments[counter] = new Models.Comment
                    {
                        Content = item.GetProperty("message").Value,
                        Email = item.GetProperty("email").Value,
                        Website = item.HasProperty("website") ? item.GetProperty("website").Value : "",
                        Name = item.GetProperty("name").Value,
                        ParentId = item.Parent.Id,
                        Id = item.Id,
                        CreateDate = item.CreateDate,
                        IsAdmin = item.GetProperty<bool>("isBackOffice"),
                        IsShow = item.GetProperty<bool>("showComment"),
                        IsSpam = item.GetProperty<bool>("isSpam"),
                        ParentName = item.Parent.HasProperty("title") ? item.Parent.GetProperty("title").Value : item.Parent.Name,
                        ParentUrl = item.Parent.GetFullNiceUrl(),
                        Replies = GetReplies((Node)item, level++)
                    };
                    counter++;
                }
                return replies;
            }
            else
            {
                return null;
            }
        }

        [Umbraco.Web.WebApi.UmbracoAuthorize]
        public CommentCollection GetAllComments(int page, int take)
        {
            var homepage = umbraco.uQuery.GetNodeByUrl("/");

            var comments = homepage.GetDescendantNodesByType("CommentItem")
                .Where(x => x.Parent.NodeTypeAlias != "CommentItem" && x.GetProperty<bool>("isSpam") == false);

            var result = new CommentCollection();

            result.TotalPages = comments.Count();

            comments = comments
                .OrderByDescending(x => x.CreateDate)
                .Skip((page - 1) * take).Take(take);

            result.Comments = new Models.Comment[comments.Count()];

            for (int i = 0; i < comments.Count(); i++)
            {
                var temp = new Models.Comment();

                temp.Id = comments.ToArray()[i].Id;
                temp.Name = comments.ToArray()[i].GetProperty("name").Value;
                temp.Email = comments.ToArray()[i].GetProperty("email").Value;
                temp.Website = comments.ToArray()[i].HasProperty("website") ? comments.ToArray()[i].GetProperty("website").Value : "";
                temp.Content = comments.ToArray()[i].GetProperty("message").Value;
                temp.CreateDate = comments.ToArray()[i].CreateDate;
                temp.ParentId = comments.ToArray()[i].Parent.Id;
                temp.ParentName = comments.ToArray()[i].Parent.HasProperty("title")
                    ? comments.ToArray()[i].Parent.GetProperty("title").Value
                    : comments.ToArray()[i].Parent.Name;
                temp.ParentUrl = comments.ToArray()[i].Parent.GetFullNiceUrl();
                temp.Replies = GetReplies(comments.ToArray()[i]);
                temp.IsAdmin = comments.ToArray()[i].GetProperty<bool>("isBackOffice");
                temp.IsShow = comments.ToArray()[i].GetProperty<bool>("showComment");
                temp.IsSpam = comments.ToArray()[i].GetProperty<bool>("isSpam");

                result.Comments[i] = temp;
            }

            return result;
        }

        [Umbraco.Web.WebApi.UmbracoAuthorize]
        public CommentCollection GetSpam(int page, int take)
        {
            var homepage = umbraco.uQuery.GetNodeByUrl("/");
            var comments = homepage.GetDescendantNodesByType("CommentItem")
                .Where(x => x.GetProperty<bool>("isSpam") == true);

            var result = new CommentCollection();
            result.TotalPages = comments.Count();

            comments = comments
                .OrderByDescending(x => x.CreateDate)
                .Skip((page - 1) * take).Take(take);

            result.Comments = new Models.Comment[comments.Count()];

            for (int i = 0; i < comments.Count(); i++)
            {
                var temp = new Models.Comment();

                temp.Id = comments.ToArray()[i].Id;
                temp.Name = comments.ToArray()[i].GetProperty("name").Value;
                temp.Email = comments.ToArray()[i].GetProperty("email").Value;
                temp.Website = comments.ToArray()[i].HasProperty("website") ? comments.ToArray()[i].GetProperty("website").Value : "";
                temp.Content = comments.ToArray()[i].GetProperty("message").Value;
                temp.CreateDate = comments.ToArray()[i].CreateDate;
                temp.ParentId = comments.ToArray()[i].Parent.Id;
                temp.ParentName = comments.ToArray()[i].Parent.HasProperty("title")
                    ? comments.ToArray()[i].Parent.GetProperty("title").Value
                    : comments.ToArray()[i].Parent.Name;
                temp.ParentUrl = comments.ToArray()[i].Parent.GetFullNiceUrl();
                temp.IsAdmin = comments.ToArray()[i].GetProperty<bool>("isBackOffice");
                temp.IsShow = comments.ToArray()[i].GetProperty<bool>("showComment");
                temp.IsSpam = comments.ToArray()[i].GetProperty<bool>("isSpam");

                result.Comments[i] = temp;
            }

            return result;
        }

        [Umbraco.Web.WebApi.UmbracoAuthorize]
        public Models.Comment SendToSpamComment(int id)
        {
            try
            {
                var result = new Models.Comment();

                IContent doc = ApplicationContext.Services.ContentService.GetById(id);

                if (doc != null)
                {
                    doc.SetValue("isSpam", true);

                    ApplicationContext.Services.ContentService.SaveAndPublishWithStatus(doc);

                    if (doc.Descendants().Any(x => x.ContentType.Alias == "CommentItem"))
                    {
                        foreach (IContent child in doc.Descendants().Where(x => x.ContentType.Alias == "CommentItem"))
                        {
                            child.SetValue("isSpam", true);

                            ApplicationContext.Services.ContentService.SaveAndPublishWithStatus(child);
                        }
                    }

                    result.Id = doc.Id;
                    result.Name = doc.GetValue<string>("name");
                    result.Email = doc.GetValue<string>("email");
                    result.Content = doc.GetValue<string>("message");
                    result.IsAdmin = doc.GetValue<bool>("isBackOffice");
                    result.IsShow = doc.GetValue<bool>("showComment");
                    result.IsSpam = doc.GetValue<bool>("isSpam");
                    result.CreateDate = doc.CreateDate;
                }
                else
                {
                    result.Name = "~notfound~";
                }
                return result;

            }
            catch (Exception e)
            {
                return null;
            }
        }
        
        [Umbraco.Web.WebApi.UmbracoAuthorize]
        public Models.Comment UnSpamComment(int id)
        {
            try
            {
                var result = new Models.Comment();

                IContent doc = ApplicationContext.Services.ContentService.GetById(id);

                if (doc != null)
                {
                    doc.SetValue("isSpam", false);

                    ApplicationContext.Services.ContentService.SaveAndPublishWithStatus(doc);

                    if (doc.Ancestors().Any(x => x.ContentType.Alias == "CommentItem"))
                    {
                        foreach (IContent child in doc.Ancestors().Where(x => x.ContentType.Alias == "CommentItem"))
                        {
                            child.SetValue("isSpam", false);

                            ApplicationContext.Services.ContentService.SaveAndPublishWithStatus(child);
                        }
                    }

                    result.Id = doc.Id;
                    result.Name = doc.GetValue<string>("name");
                    result.Email = doc.GetValue<string>("email");
                    result.Content = doc.GetValue<string>("message");
                    result.IsAdmin = doc.GetValue<bool>("isBackOffice");
                    result.IsShow = doc.GetValue<bool>("showComment");
                    result.IsSpam = doc.GetValue<bool>("isSpam");
                    result.CreateDate = doc.CreateDate;
                }
                else
                {
                    result.Name = "~notfound~";
                }
                return result;

            }
            catch (Exception e)
            {
                return null;
            }
        }

        [Umbraco.Web.WebApi.UmbracoAuthorize]
        public Models.Comment ShowComment(int id)
        {
            try
            {
                var result = new Models.Comment();

                IContent doc = ApplicationContext.Services.ContentService.GetById(id);

                if (doc != null)
                {
                    doc.SetValue("showComment", true);

                    ApplicationContext.Services.ContentService.SaveAndPublishWithStatus(doc);

                    if (doc.Ancestors().Any(x => x.ContentType.Alias == "CommentItem"))
                    {
                        foreach (IContent child in doc.Ancestors().Where(x => x.ContentType.Alias == "CommentItem"))
                        {
                            child.SetValue("showComment", true);
                            child.SetValue("isSpam", false);

                            ApplicationContext.Services.ContentService.SaveAndPublishWithStatus(child);
                        }
                    }

                    result.Id = doc.Id;
                    result.Name = doc.GetValue<string>("name");
                    result.Email = doc.GetValue<string>("email");
                    result.Content = doc.GetValue<string>("message");
                    result.IsAdmin = doc.GetValue<bool>("isBackOffice");
                    result.IsShow = doc.GetValue<bool>("showComment");
                    result.IsSpam = doc.GetValue<bool>("isSpam");
                    result.CreateDate = doc.CreateDate;
                }
                else
                {
                    result.Name = "~notfound~";
                }
                return result;

            }
            catch (Exception e)
            {
                return null;
            }
        }

        [Umbraco.Web.WebApi.UmbracoAuthorize]
        public Models.Comment UnShowComment(int id)
        {
            try
            {
                var result = new Models.Comment();

                IContent doc = ApplicationContext.Services.ContentService.GetById(id);

                if (doc != null)
                {
                    doc.SetValue("showComment", false);

                    ApplicationContext.Services.ContentService.SaveAndPublishWithStatus(doc);

                    if (doc.Descendants().Any(x => x.ContentType.Alias == "CommentItem"))
                    {
                        foreach (IContent child in doc.Descendants().Where(x => x.ContentType.Alias == "CommentItem"))
                        {
                            child.SetValue("showComment", false);

                            ApplicationContext.Services.ContentService.SaveAndPublishWithStatus(child);
                        }
                    }


                    result.Id = doc.Id;
                    result.Name = doc.GetValue<string>("name");
                    result.Email = doc.GetValue<string>("email");
                    result.Content = doc.GetValue<string>("message");
                    result.IsAdmin = doc.GetValue<bool>("isBackOffice");
                    result.IsShow = doc.GetValue<bool>("showComment");
                    result.IsSpam = doc.GetValue<bool>("isSpam");
                    result.CreateDate = doc.CreateDate;
                }
                else
                {
                    result.Name = "~notfound~";
                }
                return result;

            }
            catch (Exception e)
            {
                return null;
            }
        }

        [Umbraco.Web.WebApi.UmbracoAuthorize]
        public Models.Comment DeleteComment(int id)
        {
            try
            {
                var result = new Models.Comment();

                IContent doc = ApplicationContext.Services.ContentService.GetById(id);

                if (doc.Descendants().Any(x => x.ContentType.Alias == "CommentItem"))
                {
                    foreach (IContent child in doc.Descendants().Where(x => x.ContentType.Alias == "CommentItem"))
                    {
                        ApplicationContext.Services.ContentService.Delete(child, umbraco.helper.GetCurrentUmbracoUser().Id);
                    }
                }

                if (doc != null)
                {
                    ApplicationContext.Services.ContentService.Delete(doc, umbraco.helper.GetCurrentUmbracoUser().Id);

                    result.Name = "~deleted~";
                }
                else
                {
                    result.Name = "~notfound~";
                }
                return result;

            }
            catch (Exception e)
            {
                return null;
            }
        }

        [Umbraco.Web.WebApi.UmbracoAuthorize]
        public Models.Comment ReplyComment(int parentId, string message, bool isAdmin)
        {
            try
            {
                var result = new Models.Comment();

                var user = umbraco.helper.GetCurrentUmbracoUser();

                IContent doc = ApplicationContext.Services.ContentService.CreateContent("Comment", parentId,
                    "CommentItem");

                doc.Name = "Reply: " + parentId + " " + DateTime.Now.Ticks.ToString();
                doc.SetValue("name", user.Name);
                doc.SetValue("email", user.Email);
                doc.SetValue("website", "");
                doc.SetValue("message", message);
                doc.SetValue("isBackOffice", isAdmin);
                doc.SetValue("showComment", true);
                doc.SetValue("isSpam", false);
                doc.CreateDate = DateTime.Now;

                ApplicationContext.Services.ContentService.SaveAndPublishWithStatus(doc);

                result.Id = doc.Id;
                result.Name = doc.GetValue<string>("name");
                result.Email = doc.GetValue<string>("email");
                result.Content = doc.GetValue<string>("message");
                result.IsAdmin = doc.GetValue<bool>("isBackOffice");
                result.IsShow = doc.GetValue<bool>("showComment");
                result.IsSpam = doc.GetValue<bool>("isSpam");
                result.CreateDate = doc.CreateDate;

                return result;
            }
            catch (Exception e)
            {
                return null;
            }
        }
    }
}