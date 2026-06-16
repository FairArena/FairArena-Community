import { defineField, defineType } from "sanity";
import { FileText } from "lucide-react";

export const postType = defineType({
  name: "post",
  title: "Post",
  type: "document",
  icon: FileText,
  description: "A user-submitted post in a subreddit",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The title of the post",
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: "originalTitle",
      title: "Original Title",
      type: "string",
      description: "Stores the original title if the post is deleted",
      hidden: true,
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      description: "The user who created this post",
      to: [{ type: "user" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subreddit",
      title: "Subreddit",
      type: "reference",
      description: "The subreddit this post belongs to",
      to: [{ type: "subreddit" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      description: "The main content of the post",
      of: [{ type: "block" }, { type: "image" }],
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description: "Optional image for the post",
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
      name: "isReported",
      title: "Is Reported",
      type: "boolean",
      description: "Indicates if this post has been reported by users",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      description: "When this post was published",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "isDeleted",
      title: "Is Deleted",
      type: "boolean",
      description: "Indicates if this post has been deleted",
      initialValue: false,
    }),
    defineField({
      name: "flair",
      title: "Flair",
      type: "string",
      description: "Optional tag/label for the post",
      options: {
        list: [
          { title: "Discussion", value: "Discussion" },
          { title: "Question", value: "Question" },
          { title: "News", value: "News" },
          { title: "Announcement", value: "Announcement" },
          { title: "Media", value: "Media" },
          { title: "Meme", value: "Meme" },
          { title: "Meta", value: "Meta" },
        ],
      },
    }),
    defineField({
      name: "isNSFW",
      title: "NSFW",
      type: "boolean",
      description: "Mark post as Not Safe For Work",
      initialValue: false,
    }),
    defineField({
      name: "isSpoiler",
      title: "Spoiler",
      type: "boolean",
      description: "Mark post as spoiler",
      initialValue: false,
    }),
    defineField({
      name: "postType",
      title: "Post Type",
      type: "string",
      description: "Type of post",
      options: {
        list: [
          { title: "Text", value: "text" },
          { title: "Link", value: "link" },
        ],
      },
      initialValue: "text",
    }),
    defineField({
      name: "linkUrl",
      title: "Link URL",
      type: "url",
      description: "URL for link posts",
    }),
    defineField({
      name: "keywords",
      title: "Keywords/Tags",
      type: "array",
      of: [{ type: "string" }],
      description: "Tags/keywords for SEO and finding related posts",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "author.username",
      media: "image",
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle,
        media,
      };
    },
  },
});
