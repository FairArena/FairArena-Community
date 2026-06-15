import { type SchemaTypeDefinition } from "sanity";
import { userType } from "./userType";
import { postType } from "./postType";
import { commentType } from "./commentType";
import { voteType } from "./voteType";
import { subredditType } from "./subredditType";
import { bookmarkType } from "./bookmarkType";
import { membershipType } from "./membershipType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [userType, postType, commentType, voteType, subredditType, bookmarkType, membershipType],
};
