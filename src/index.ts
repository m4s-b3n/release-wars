import express from 'express';
import axios from 'axios';
import semver from 'semver';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const REPO = process.env.REPO; // Format: owner/repo

if (!REPO) {
  throw new Error('Environment variable REPO is required.');
}

const [owner, repo] = REPO.split('/');
if (!owner || !repo) {
  throw new Error('Environment variable REPO must be in the format owner/repo.');
}

const fetchCommits = async () => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`);
    return response.data;
  } catch (error) {
    console.error('Error fetching commits:', error);
    return [];
  }
};

const fetchValidTags = async () => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/tags`);
    return response.data.filter((tag: any) => semver.valid(tag.name)); // Filter only valid semantic version tags
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

const determineChangeType = (currentVersion: string, previousVersion: string) => {
  if (semver.diff(currentVersion, previousVersion) === 'major') return 'Major';
  if (semver.diff(currentVersion, previousVersion) === 'minor') return 'Minor';
  if (semver.diff(currentVersion, previousVersion) === 'patch') return 'Patch';
  return 'Unknown';
};

// Extract shared logic into a reusable function
const fetchReleaseData = async () => {
  const commits = await fetchCommits();
  const tags = await fetchValidTags();

  if (commits.length === 0) {
    return { commits, tags, currentVersion: '', previousVersion: '', changeType: null };
  }

  const lastCommitSha = commits[0].sha;
  const lastTag = lastCommitSha ? tags.find((tag: any) => tag.commit.sha === lastCommitSha) : undefined;

  let currentVersion = '';
  let previousVersion = '';
  let changeType: string | null = null;

  if (lastTag) {
    currentVersion = lastTag.name;
    const previousTag = tags.find((tag: any) => semver.lt(tag.name, currentVersion));

    if (previousTag) {
      previousVersion = previousTag.name;
      changeType = determineChangeType(currentVersion, previousVersion);
    }
  }

  return { commits, tags, currentVersion, previousVersion, changeType };
};

// Set up EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Update app.get to render an EJS template
app.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const { commits, currentVersion, previousVersion, changeType } = await fetchReleaseData();

    // Shorten commit messages to only the first line before passing them to the template
    const shortenedCommits = commits.map((commit: any) => {
      const firstLine = commit.commit.message.split('\n')[0];
      return { ...commit, commit: { ...commit.commit, message: firstLine } };
    });

    // Pass the repo variable to the EJS template
    res.render('index', {
      commits: shortenedCommits.slice(0, 5),
      currentVersion,
      previousVersion,
      changeType,
      repo: REPO
    });
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});