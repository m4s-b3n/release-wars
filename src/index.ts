import express from "express";
import path from "path";
import { fetchReleaseData } from "./utils";

const app = express();
const PORT = process.env.PORT || 3000;
const REPO = process.env.REPO; // Format: owner/repo
const CACHE_REFRESH_PERIOD =
  parseInt(process.env.CACHE_REFRESH_PERIOD || "30", 10) * 1000; // Default to 30 seconds
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!REPO) {
  throw new Error("Environment variable REPO is required.");
}

const [owner, repo] = REPO.split("/");
if (!owner || !repo) {
  throw new Error(
    "Environment variable REPO must be in the format owner/repo.",
  );
}

// Set up EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Cache for release data
let cachedData: {
  commits: Array<{ sha: string; commit: { message: string } }>;
  currentVersion: string;
  previousVersion: string;
  changeType: string;
} | null = null;

// Function to refresh the cache
const refreshCache = async () => {
  try {
    console.log("Refreshing cache...");
    cachedData = await fetchReleaseData(owner, repo, GITHUB_TOKEN);
    console.log("Cache refreshed successfully.");
  } catch (error) {
    console.error("Error refreshing cache:", error);
  }
};

// Initial cache refresh
refreshCache();

// Set up periodic cache refresh
setInterval(refreshCache, CACHE_REFRESH_PERIOD);

// Function to render cached data
const renderCachedData = (res: express.Response): void => {
  if (!cachedData) {
    res.status(503).send("Service unavailable: data is not yet cached.");
    return;
  }

  const {
    commits = [],
    currentVersion = "N/A",
    previousVersion = "No previous version available",
    changeType = "N/A",
  } = cachedData;

  // Ensure default values are applied consistently
  const sanitizedData = {
    commits,
    currentVersion: currentVersion || "N/A",
    previousVersion: previousVersion || "No previous version available",
    changeType: changeType || "N/A",
  };

  // Shorten commit messages to only the first line before passing them to the template
  const shortenedCommits = sanitizedData.commits.map(
    (commit: { commit: { message: string } }) => {
      const firstLine = commit.commit.message.split("\n")[0];
      return { ...commit, commit: { ...commit.commit, message: firstLine } };
    },
  );

  res.render("index", {
    commits: shortenedCommits.slice(0, 5),
    currentVersion: sanitizedData.currentVersion,
    previousVersion: sanitizedData.previousVersion,
    changeType: sanitizedData.changeType,
    repo: REPO,
  });
};

// Update app.get to use the dedicated function
app.get(
  "/",
  async (req: express.Request, res: express.Response): Promise<void> => {
    renderCachedData(res);
  },
);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { refreshCache, renderCachedData };

export default app;
