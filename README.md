# uCommentator
uCommentator is Disqus comment management for Umbraco.
This package will adding new section in your backoffice with "Comment" name to manage your disqus comment.

How to use:

- After installation, if the "Comment" section doesn't show up, you have to configure user section access manually at the user section.

- Add your disqus api settings in uCommentator Settings at content area and publish

- Refresh page to get your settings cache refreshed

- Enjoy your disqus management

- To render disqus comment, just add @Umbraco.RenderMacro("UCommentator") to your template, it will automatically called shortname from the settings