if (!process.env.CLERK_ISSUE_URL) {
  throw new Error("Clerk issue URL not set");
}

const authConfig = {
    providers: [
      {
        domain: process.env.CLERK_ISSUE_URL,
        applicationID: "convex",
      },
    ]
  };

  export default authConfig;