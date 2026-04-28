export type Events = {
  "review/pr.requested": {
    data: {
      reviewId: string;
      repositoryId: string;
      prNumber: number;
      userId: string;
    };
  };
};
