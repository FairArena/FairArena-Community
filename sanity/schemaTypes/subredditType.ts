import { defineField, defineType } from "sanity";
import { TagIcon } from "lucide-react";

export const subredditType = defineType({
  name: "subreddit",
  title: "Subreddit",
  type: "document",
  icon: TagIcon,
  description: "A community where users can post and engage with content",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Name of the subreddit",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description: "A brief description of what this subreddit is about",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "The unique URL-friendly identifier for this subreddit",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description: "Icon or banner image for the subreddit",
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alt Text",
          description: "Alternative text for screen readers and SEO",
        },
      ],
    }),
    defineField({
      name: "moderator",
      title: "Moderator",
      type: "reference",
      description:
        "The user who created this subreddit and has admin privileges",
      to: [{ type: "user" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      description: "When this subreddit was created",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "rules",
      title: "Community Rules",
      type: "array",
      description: "Rules that members must follow in this community",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Rule Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "description",
              title: "Rule Description",
              type: "text",
            }),
            defineField({
              name: "order",
              title: "Order",
              type: "number",
              hidden: true,
            }),
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "description",
            },
          },
        },
      ],
    }),
    defineField({
      name: "communityType",
      title: "Community Type",
      type: "string",
      description: "Public, Restricted, or Private community",
      options: {
        list: [
          { title: "Public", value: "public" },
          { title: "Restricted", value: "restricted" },
          { title: "Private", value: "private" },
        ],
      },
      initialValue: "public",
    }),
    defineField({
      name: "isNSFW",
      title: "NSFW Community",
      type: "boolean",
      description: "Mark community as Not Safe For Work",
      initialValue: false,
    }),
    defineField({
      name: "icon",
      title: "Community Icon",
      type: "image",
      description: "Community avatar/icon",
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alt Text",
        },
      ],
    }),
    defineField({
      name: "banner",
      title: "Community Banner",
      type: "image",
      description: "Community header banner",
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alt Text",
        },
      ],
    }),
    defineField({
      name: "primaryColor",
      title: "Primary Color",
      type: "string",
      description: "Hex color for community theming",
      initialValue: "#FF4500",
    }),
    defineField({
      name: "moderators",
      title: "Moderators",
      type: "array",
      description: "Team of moderators managing this community",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "user",
              title: "User",
              type: "reference",
              to: [{ type: "user" }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "role",
              title: "Role",
              type: "string",
              options: {
                list: [
                  { title: "Admin", value: "admin" },
                  { title: "Moderator", value: "moderator" },
                ],
              },
              initialValue: "moderator",
            }),
            defineField({
              name: "addedAt",
              title: "Added At",
              type: "datetime",
              initialValue: () => new Date().toISOString(),
            }),
          ],
          preview: {
            select: {
              title: "user.username",
              subtitle: "role",
            },
          },
        },
      ],
    }),
    defineField({
      name: "bannedUsers",
      title: "Banned Users",
      type: "array",
      description: "Users banned from this community",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "user",
              title: "User",
              type: "reference",
              to: [{ type: "user" }],
            }),
            defineField({
              name: "reason",
              title: "Ban Reason",
              type: "string",
            }),
            defineField({
              name: "bannedAt",
              title: "Banned At",
              type: "datetime",
            }),
            defineField({
              name: "expiresAt",
              title: "Expires At",
              type: "datetime",
              description: "Leave empty for permanent ban",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "allowedFlairs",
      title: "Allowed Post Flairs",
      type: "array",
      description: "Flairs users can choose from",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "allowImages",
      title: "Allow Images",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "allowVideos",
      title: "Allow Videos",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "allowText",
      title: "Allow Text Posts",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "allowLinks",
      title: "Allow Link Posts",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "postApprovalRequired",
      title: "Post Approval Required",
      type: "boolean",
      description: "All posts must be approved by mods",
      initialValue: false,
    }),
    defineField({
      name: "archiveTime",
      title: "Archive Time (days)",
      type: "number",
      description: "Days until posts are locked",
      initialValue: 180,
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
    },
  },
});
