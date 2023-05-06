---
title: Custom Component
---

We'll explore how to create a custom List component that mimics the preview of email items, similar to Outlook. The List component is highly extensible, allowing you to pass custom components to render each email item, providing a flexible and visually appealing email preview.

To achieve this, we'll first create a custom EmailItem component that takes email data as a prop and renders the sender's avatar, name, email, subject, and a snippet of the message. The EmailItem component will be styled to give the appearance of an email preview in Outlook.

Next, we'll pass our custom EmailItem component to the List component, along with the email data we want to display. The List component will use the custom EmailItem component to render each email.

This approach allows you to quickly and easily create a custom email list that closely resembles the Outlook interface, while still benefiting from the flexibility and extensibility offered by the List component. You can easily customize the appearance and behavior of the email previews by modifying the EmailItem component or creating additional custom components. This makes the List component an ideal choice for creating a rich and interactive email preview experience in your application.
