Hot-to publish webapp to Chrome Web Store:
---

To publish new app version need to go to Chrome webstore developer dashboard https://chrome.google.com/webstore/developer/dashboard.
1. Create zip package with manifest and icon:
```
{
    "manifest_version": 2,
    "name": "PICS.IO | Digital Asset Management",
    "description": "PICS.IO | Digital Asset Management built on top of Google Drive",
    "version": "1.80.1.0",
    "icons": {
        "128": "icon_128.png"
    },
    "app": {
        "urls": [
            "https://pics.io/digital-asset-management"
        ],
        "launch": {
            "web_url": "https://pics.io/digital-asset-management"
        }
    }
}
```
NOTE: Each new uploading package should have version more that previous.
2. Add cool images https://developer.chrome.com/webstore/images
3. Click publish.

In one hour app will be available in webstore.

Further reading: https://www.reliablesoft.net/how-to-add-your-web-site-to-the-chrome-web-store/

