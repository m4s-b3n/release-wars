import axios from "axios";
import semver from "semver";

// Utility functions for interacting with the GitHub API and processing release data

const fetchCommits = async (
  owner: string,
  repo: string,
  token?: string,
): Promise<Array<{ sha: string; commit: { message: string } }>> => {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        headers,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching commits:", error);
    return [];
  }
};

const fetchValidTags = async (owner: string, repo: string, token?: string) => {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/tags`,
      {
        headers,
      },
    );
    // Filter tags to include only valid semantic versions
    return response.data.filter((tag: { name: string }) =>
      semver.valid(tag.name),
    );
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
};

const determineChangeType = (
  currentVersion: string | null,
  previousVersion: string | null,
) => {
  if (!currentVersion || !previousVersion) return null; // Return null if either version is missing

  // Determine the type of change (major, minor, patch) between two versions
  if (semver.diff(currentVersion, previousVersion) === "major") return "Major";
  if (semver.diff(currentVersion, previousVersion) === "minor") return "Minor";
  if (semver.diff(currentVersion, previousVersion) === "patch") return "Patch";
  return "None";
};

const fetchReleaseData = async (
  owner: string,
  repo: string,
  token?: string,
) => {
  const commits = (await fetchCommits(owner, repo, token)) || [];
  const tags = (await fetchValidTags(owner, repo, token)) || [];

  let currentVersion = "";
  let previousVersion = "";
  let changeType: string | null = null;

  if (tags.length > 0) {
    currentVersion = tags[0].name; // Use the latest tag as the current version

    if (tags.length > 1) {
      previousVersion = tags[1].name; // Use the second latest tag as the previous version
      changeType = determineChangeType(currentVersion, previousVersion);
    }
  }

  return { commits, tags, currentVersion, previousVersion, changeType };
};

export { fetchCommits, fetchValidTags, determineChangeType, fetchReleaseData };
