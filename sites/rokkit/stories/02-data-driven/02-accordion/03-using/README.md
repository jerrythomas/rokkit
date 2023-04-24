---
title: Using
---

# {title}

Let's add some additional functionality. As you know by now, the Accordion uses Text component to display items.
However, we can change this behavior by changing the item rendering component.

The images for this example have been taken from [Pexels](https://pexels.com), resized and cropped to a smaller
size. Let's make it so that clicking on any item takes the user to the artist's profile page. This information
is already available in the data.

The components [Link](../item-link), [Text](../item-link) adapt to the user's data based on the data in the
`fields` property.

In this example, we are using both `fields` and the `using` property together.

- _fields_ : The follwing additional mappings are required
  - isOpen: Used for identifying the open/close state of a section
  - url: Used for identifying any urls
  - target: Used for specifyin where to open (default is to open in current window)
- _using_ : This tells the Accordion to use the `Link` component for representing items.

Note that we did not configure the `target` attribute. This was already matching the expected attribute.
