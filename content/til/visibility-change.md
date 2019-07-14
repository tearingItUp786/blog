---
title: "Don't use the unload event!"
date: "2019-07-14"
tag: "Web API"
---

The `unload` event that is available to use web developers isn't consistent across browsers (but we already know that many things arent 😂)
Really, if you want to have predictable behavior and need to fire off some event/code when a user leaves/closes your page 
you should be listening to a page `visbility change`. [Read more about it here](https://developers.google.com/web/updates/2018/07/page-lifecycle-api#the-unload-event)
