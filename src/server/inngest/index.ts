import { reviewPR } from "./functions/review-pr";

export { inngest } from "./client";
export type { Events } from "./types";
export { reviewPR };
export const functions = [reviewPR];
