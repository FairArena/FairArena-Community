import { defineField, defineType } from "sanity";

export const membershipType = defineType({
  name: "membership",
  title: "Membership",
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
      name: "subreddit",
      title: "Subreddit",
      type: "reference",
      to: [{ type: "subreddit" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "joinedAt",
      title: "Joined At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
});
