// Moved utility functions from index.ts to utils.ts
import axios from 'axios';
import semver from 'semver';

const fetchCommits = async (owner: string, repo: string) => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`);
    return response.data;
  } catch (error) {
    console.error('Error fetching commits:', error);
    return [];
  }
};

const fetchValidTags = async (owner: string, repo: string) => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/tags`);
    return response.data.filter((tag: any) => semver.valid(tag.name)); // Filter only valid semantic version tags
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

const determineChangeType = (currentVersion: string | null, previousVersion: string | null) => {
  if (!currentVersion || !previousVersion) return null; // Handle null inputs

  if (semver.diff(currentVersion, previousVersion) === 'major') return 'Major';
  if (semver.diff(currentVersion, previousVersion) === 'minor') return 'Minor';
  if (semver.diff(currentVersion, previousVersion) === 'patch') return 'Patch';
  return 'Unknown';
};

const fetchReleaseData = async (owner: string, repo: string) => {
  const commits = (await fetchCommits(owner, repo)) || [];
  const tags = (await fetchValidTags(owner, repo)) || [];

  let currentVersion = '';
  let previousVersion = '';
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