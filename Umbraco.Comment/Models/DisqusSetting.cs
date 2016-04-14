using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Umbraco.Comment.Models
{
    public class DisqusSetting
    {
        public string ApiKey { get; set; }
        public string ApiSecret { get; set; }
        public string AccessToken { get; set; }
        public string Shortname { get; set; }
        public string Category { get; set; }
        public string Limit { get; set; }
        public bool EnableSSO { get; set; }
        public string SSOName { get; set; }
        public string SSOButton { get; set; }
        public string SSOIcon { get; set; }
        public string SSOLogin { get; set; }
        public string SSOLogout { get; set; }
    }
}