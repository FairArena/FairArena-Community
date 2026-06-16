import { defineField, defineType } from "sanity";
import { Bell } from "lucide-react";

export const notificationType = defineType({
  name: "notification",
  title: "Notification",
  type: "document",
  icon: Bell,
  fields: [
    defineField({
      name: "recipient",
      title: "Recipient",
      type: "reference",
      to: [{ type: "user" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sender",
      title: "Sender",
      type: "reference",
      to: [{ type: "user" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Comment", value: "comment" },
          { title: "Reply", value: "reply" },
          { title: "Upvote", value: "upvote" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "post",
      title: "Post",
      type: "reference",
      to: [{ type: "post" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "comment",
      title: "Comment",
      type: "reference",
      to: [{ type: "comment" }],
    }),
    defineField({
      name: "read",
      title: "Read",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
});
