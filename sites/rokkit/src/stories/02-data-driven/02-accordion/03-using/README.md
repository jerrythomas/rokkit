---
title: Using
---

## {title}

Let's add some additional functionality. As you know by now, the Accordion uses the `Text` component to display items. We can change this behavior by changing the item rendering component.

The images for this example have been taken from [Pexels](https://pexels.com), resized and cropped to a smaller size. Let's make it so that clicking on any item takes the user to the artist's profile page. This information is already available in the data.

The components Link & Text adapt to the user's data based on the data in the
`fields` property.

In this example, we are using both `fields` and the `using` property together.

- _fields_ : The following additional mappings are required
- _isOpen_: Used for identifying the open/closed state of a section
- _url_: Used for identifying any URLs
- _target_: Used for specifying where to open (default is to open in current window)
- _using_ : This tells the Accordion to use the `Link` component for representing items.

Note that we did not configure the `target` attribute. This was already matching the expected attribute.
