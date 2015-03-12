using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Umbraco.Comment.Models;
using Umbraco.Core.Models;
using Umbraco.Web.Mvc;

namespace Umbraco.Comment.Controllers
{
    public class CommentController : SurfaceController
    {
        public ActionResult RenderCommentForm()
        {
            return PartialView("commentForm", new CommentFormModel());
        }

        public ActionResult RenderReplyForm()
        {
            return PartialView("replyForm", new CommentFormModel());
        }

        [HttpPost]
        public ActionResult HandleCommentForm(CommentFormModel comment)
        {
            if (!ModelState.IsValid)
            {
                return CurrentUmbracoPage();
            }

            IContent doc = ApplicationContext.Services.ContentService.CreateContent("Comment", CurrentPage.Id,
                "CommentItem");

            doc.Name = comment.Name + " " + comment.Email + DateTime.Now.Ticks.ToString();
            doc.SetValue("name", comment.Name);
            doc.SetValue("email", comment.Email);
            doc.SetValue("website", string.IsNullOrEmpty(comment.Website) ? "" : comment.Website);
            doc.SetValue("message", comment.Message);
            doc.SetValue("showComment", false);
            doc.SetValue("isSpam", false);
            doc.SetValue("isBackOffice", false);
            doc.CreateDate = DateTime.Now;

            ApplicationContext.Services.ContentService.SaveAndPublishWithStatus(doc);

            TempData["IsSuccessful"] = true;

            return RedirectToCurrentUmbracoPage();
        }

        [HttpPost]
        public ActionResult HandleReplyForm(CommentFormModel comment, int parentId)
        {
            if (!ModelState.IsValid)
            {
                return CurrentUmbracoPage();
            }

            IContent doc = ApplicationContext.Services.ContentService.CreateContent("Comment", parentId,
                "CommentItem");

            doc.Name = comment.Name + " " + comment.Email + DateTime.Now.Ticks.ToString();
            doc.SetValue("name", comment.Name);
            doc.SetValue("email", comment.Email);
            doc.SetValue("website", string.IsNullOrEmpty(comment.Website) ? "" : comment.Website);
            doc.SetValue("message", comment.Message);
            doc.SetValue("showComment", false);
            doc.SetValue("isSpam", false);
            doc.SetValue("isBackOffice", false);
            doc.CreateDate = DateTime.Now;

            ApplicationContext.Services.ContentService.SaveAndPublishWithStatus(doc);

            TempData["IsSuccessful"] = true;

            return RedirectToCurrentUmbracoPage();
        }
    }
}
