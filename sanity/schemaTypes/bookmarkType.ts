import { defineField, defineType } from "sanity";

export const bookmarkType = defineType({
  name: "bookmark",
  title: "Bookmark",
  type: "document",
  fields: [
    defineField({
      name: "user",
      title: "User",
      type: "reference",
      to: [{ type: "user" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "post",
      title: "Post",
      type: "reference",
      to: [{ type: "post" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "savedAt",
      title: "Saved At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
});
