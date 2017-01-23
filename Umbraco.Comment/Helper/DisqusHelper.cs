using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web.Script.Serialization;
using umbraco.NodeFactory;
using Umbraco.Comment.Models;
using Umbraco.Core;
using Umbraco.Core.Models;

namespace Umbraco.Comment.Helper
{
    public static class DisqusHelper
    {
        public static DisqusSetting GetSetting()
        {
            var root = new Node(-1);
            var settings = root.ChildrenAsList.FirstOrDefault(x => x.NodeTypeAlias == "UcommentatorSettings");

            if (settings != null)
            {
                IContent doc = ApplicationContext.Current.Services.ContentService.GetById(settings.Id);

                var result = new DisqusSetting()
                {
                    ApiKey = settings.GetProperty("api_key").Value,
                    ApiSecret = settings.GetProperty("api_secret").Value,
                    AccessToken = settings.GetProperty("access_token").Value,
                    Shortname = settings.GetProperty("shortname").Value,
                    Category = settings.GetProperty("category").Value,
                    Limit = settings.GetProperty("itemPerPage").Value,
                    EnableSSO = int.Parse(settings.GetProperty("enableSSO").Value) == 1
                };

                if (result.EnableSSO)
                {
                    result.SSOName = settings.GetProperty("ssoName").Value;
                    result.SSOButton = settings.GetProperty("ssoButton").Value;
                    result.SSOIcon = settings.GetProperty("ssoIcon").Value;
                    result.SSOLogin = settings.GetProperty("ssoLogin").Value;
                    result.SSOLogout = settings.GetProperty("ssoLogout").Value;
                }

                return result;
            }

            return null;
        }

        /// <summary>
        /// Gets the Disqus SSO payload to authenticate users
        /// </summary>
        /// <param name="user_id">The unique ID to associate with the user</param>
        /// <param name="user_name">Non-unique name shown next to comments.</param>
        /// <param name="user_email">User's email address, defined by RFC 5322</param>
        /// <param name="avatar_url">URL of the avatar image</param>
        /// <param name="website_url">Website, blog or custom profile URL for the user, defined by RFC 3986</param>
        /// <returns>A string containing the signed payload</returns>
        public static string GetPayload(string user_id, string user_name, string user_email, string avatar_url = "", string website_url = "")
        {
            var userdata = new
            {
                id = user_id,
                username = user_name,
                email = user_email,
                avatar = avatar_url,
                url = website_url
            };

            string serializedUserData = new JavaScriptSerializer().Serialize(userdata);
            return GeneratePayload(serializedUserData);
        }

        /// <summary>
        /// Method to log out a user from SSO
        /// </summary>
        /// <returns>A signed, empty payload string</returns>
        public static string LogoutUser()
        {
            var userdata = new { };
            string serializedUserData = new JavaScriptSerializer().Serialize(userdata);
            return GeneratePayload(serializedUserData);
        }

        private static string GeneratePayload(string serializedUserData)
        {
            var settings = GetSetting();

            byte[] userDataAsBytes = Encoding.ASCII.GetBytes(serializedUserData);

            // Base64 Encode the message
            string Message = System.Convert.ToBase64String(userDataAsBytes);

            // Get the proper timestamp
            TimeSpan ts = (DateTime.UtcNow - new DateTime(1970, 1, 1, 0, 0, 0));
            string Timestamp = Convert.ToInt32(ts.TotalSeconds).ToString();

            // Convert the message + timestamp to bytes
            byte[] messageAndTimestampBytes = Encoding.ASCII.GetBytes(Message + " " + Timestamp);

            // Convert Disqus API key to HMAC-SHA1 signature
            byte[] apiBytes = Encoding.ASCII.GetBytes(settings.ApiSecret);
            HMACSHA1 hmac = new HMACSHA1(apiBytes);
            byte[] hashedMessage = hmac.ComputeHash(messageAndTimestampBytes);

            // Put it all together into the final payload
            return Message + " " + ByteToString(hashedMessage) + " " + Timestamp;
        }

        private static string ByteToString(byte[] buff)
        {
            string sbinary = "";

            for (int i = 0; i < buff.Length; i++)
            {
                sbinary += buff[i].ToString("X2"); // hex format
            }
            return (sbinary);
        }
    }
}