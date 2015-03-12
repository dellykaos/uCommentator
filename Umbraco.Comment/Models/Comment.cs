using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Umbraco.Comment.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Website { get; set; }
        public string Content { get; set; }
        public DateTime CreateDate { get; set; }
        public int ParentId { get; set; }
        public string ParentName { get; set; }
        public string ParentUrl { get; set; }
        public bool IsAdmin { get; set; }
        public bool IsSpam { get; set; }
        public bool IsShow { get; set; }
        public CommentCollection Replies { get; set; }
    }

    public class CommentCollection
    {
        public Comment[] Comments;
        public int TotalPages { get; set; }
    }
}