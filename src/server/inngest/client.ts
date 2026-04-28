import { eventType, Inngest, staticSchema } from "inngest";
import type { Events } from "./types";

export const prReviewRequested = eventType("review/pr.requested", {
  schema: staticSchema<Events["review/pr.requested"]["data"]>(),
});

export const inngest = new Inngest({ id: "aicodereviewer" });
