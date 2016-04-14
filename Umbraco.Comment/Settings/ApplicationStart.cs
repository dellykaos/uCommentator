using System.Collections.Generic;
using System.Linq;
using Umbraco.Core;
using Umbraco.Web.UI.JavaScript;
using umbraco.NodeFactory;
using Umbraco.Core.Models;

namespace Umbraco.Comment.Settings
{
    public class ApplicationStart : ApplicationEventHandler
    {
        private static LanguageInstaller installer;

        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            var ct = applicationContext.Services.ContentTypeService
                .GetAllContentTypes().FirstOrDefault(x => x.Alias == "UcommentatorSettings");

            if (ct == null)
            {
                var textstring = applicationContext.Services.DataTypeService.GetDataTypeDefinitionByPropertyEditorAlias("umbraco.Textbox")
                    .FirstOrDefault(x => x.Name.ToLower() == "textstring");
                var trueFalse =
                    applicationContext.Services.DataTypeService.GetDataTypeDefinitionByPropertyEditorAlias(
                        "Umbraco.TrueFalse")
                        .FirstOrDefault(x => x.Name.ToLower() == "true/false");

                ContentType uCommentatorType = new ContentType(-1);
                uCommentatorType.Name = "uCommentatorSettings";
                uCommentatorType.Alias = "UcommentatorSettings";
                uCommentatorType.AllowedAsRoot = true;
                uCommentatorType.Icon = "icon-wrench";

                var propGroup = new PropertyGroup()
                {
                    Name = "Settings"
                };

                uCommentatorType.AddPropertyGroup("Settings");

                var api_key = new PropertyType(textstring)
                {
                    Alias = "api_key",
                    Name = "API_KEY",
                    Mandatory = true
                };

                var api_secret = new PropertyType(textstring)
                {
                    Alias = "api_secret",
                    Name = "API_SECRET",
                    Mandatory = true
                };

                var access_token = new PropertyType(textstring)
                {
                    Alias = "access_token",
                    Name = "ACCESS_TOKEN",
                    Mandatory = true
                };

                var shortname = new PropertyType(textstring)
                {
                    Alias = "shortname",
                    Name = "Shortname",
                    Mandatory = true
                };

                var category = new PropertyType(textstring)
                {
                    Alias = "category",
                    Name = "Category",
                    Mandatory = true
                };

                var limit = new PropertyType(textstring)
                {
                    Alias = "itemPerPage",
                    Name = "Item per Page",
                    Mandatory = true
                };

                var enableSSO = new PropertyType(trueFalse)
                {
                    Alias = "enableSSO",
                    Name = "Enable SSO?",
                    Mandatory = false
                };

                var ssoName = new PropertyType(textstring)
                {
                    Alias = "ssoName",
                    Name = "SSO Name",
                    Description = "Fill this if you enable SSO.",
                    Mandatory = false
                };

                var ssoButton = new PropertyType(textstring)
                {
                    Alias = "ssoButton",
                    Name = "SSO Button URL",
                    Description = "Fill this if you enable SSO.",
                    Mandatory = false
                };

                var ssoIcon = new PropertyType(textstring)
                {
                    Alias = "ssoIcon",
                    Name = "SSO Icon URL",
                    Description = "Fill this if you enable SSO.",
                    Mandatory = false
                };

                var ssoLogin = new PropertyType(textstring)
                {
                    Alias = "ssoLogin",
                    Name = "SSO Login URL",
                    Description = "Fill this if you enable SSO.",
                    Mandatory = false
                };

                var ssoLogout = new PropertyType(textstring)
                {
                    Alias = "ssoLogout",
                    Name = "SSO Logout URL",
                    Description = "Fill this if you enable SSO.",
                    Mandatory = false
                };

                uCommentatorType.AddPropertyType(api_key, "Settings");
                uCommentatorType.AddPropertyType(api_secret, "Settings");
                uCommentatorType.AddPropertyType(access_token, "Settings");
                uCommentatorType.AddPropertyType(shortname, "Settings");
                uCommentatorType.AddPropertyType(category, "Settings");
                uCommentatorType.AddPropertyType(limit, "Settings");
                uCommentatorType.AddPropertyType(enableSSO, "Settings");
                uCommentatorType.AddPropertyType(ssoName, "Settings");
                uCommentatorType.AddPropertyType(ssoButton, "Settings");
                uCommentatorType.AddPropertyType(ssoIcon, "Settings");
                uCommentatorType.AddPropertyType(ssoLogin, "Settings");
                uCommentatorType.AddPropertyType(ssoLogout, "Settings");
                
                ApplicationContext.Current.Services.ContentTypeService.Save(uCommentatorType);
            }

            var root = new Node(-1);
            var settings = root.ChildrenAsList.FirstOrDefault(x => x.NodeTypeAlias == "UcommentatorSettings");

            if (settings == null)
            {
                IContent doc = ApplicationContext.Current.Services.ContentService.CreateContent("uCommentator Settings", -1,
                    "UcommentatorSettings");

                doc.SetValue("api_key", "your api_key");
                doc.SetValue("api_secret", "your api_secret");
                doc.SetValue("access_token", "your access_token");
                doc.SetValue("shortname", "your shortname");
                doc.SetValue("category", "your category");
                doc.SetValue("itemPerPage", 10);
                doc.SetValue("enableSSO", 0);
                doc.SetValue("ssoName", "Example SSO");
                doc.SetValue("ssoButton", "http://example.com/images/samplenews.gif");
                doc.SetValue("ssoIcon", "http://example.com/favicon.png");
                doc.SetValue("ssoLogout", "http://example.com/login/");
                doc.SetValue("ssoLogout", "http://example.com/logout/");

                applicationContext.Services.ContentService.SaveAndPublishWithStatus(doc);
            }

            installer = new LanguageInstaller();
            installer.CheckAndInstallLanguageActions();
            ServerVariablesParser.Parsing += ServerVariablesParser_Parsing;

            var us = applicationContext.Services.UserService;
            var user = us.GetByProviderKey(0);
            if (!user.AllowedSections.Any(x => x == "uCommentator"))
            {
                user.AddAllowedSection("uCommentator");
                us.Save(user);
            }
        }

        private void ServerVariablesParser_Parsing(object sender, Dictionary<string, object> e)
        {
            var root = new Node(-1);
            var settings = root.ChildrenAsList.FirstOrDefault(x => x.NodeTypeAlias == "UcommentatorSettings");

            e.Remove("uCommentator");

            if (settings != null)
            {
                IContent doc = ApplicationContext.Current.Services.ContentService.GetById(settings.Id);

                ApplicationContext.Current.Services.ContentService.SaveAndPublishWithStatus(doc);

                var api_key = settings.GetProperty("api_key").Value;
                var api_secret = settings.GetProperty("api_secret").Value;
                var access_token = settings.GetProperty("access_token").Value;
                var shortname = settings.GetProperty("shortname").Value;
                var category = settings.GetProperty("category").Value;
                var limit = settings.GetProperty("itemPerPage").Value;
                var enableSSO = settings.GetProperty("enableSSO").Value;

                e.Add("uCommentator", new Dictionary<string, object>
                {
                    { "uCommentatorApiKey", api_key},
                    { "uCommentatorApiSecret", api_secret},
                    { "uCommentatorAccessToken", access_token},
                    { "uCommentatorShortname", shortname},
                    { "uCommentatorCategory", category},
                    { "uCommentatorLimit", limit},
                    { "uCommentatorEnableSSO", enableSSO},
                });

            }
        }
    }
}