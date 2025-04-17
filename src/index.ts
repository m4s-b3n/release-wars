import express from 'express';
import axios from 'axios';
import semver from 'semver';
import path from 'path';

// Import utility functions from utils.ts
import { fetchCommits, fetchValidTags, determineChangeType, fetchReleaseData } from './utils';

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

// Set up EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Update app.get to use owner and repo variables
app.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const { commits, tags, currentVersion, previousVersion, changeType } = await fetchReleaseData(owner, repo);

    // Ensure commits and tags are valid arrays
    const validCommits = Array.isArray(commits) ? commits : [];
    const validTags = Array.isArray(tags) ? tags : [];

    const shortenedCommits = validCommits.map((commit: any) => {
      const firstLine = commit.commit.message.split('\n')[0];
      return { ...commit, commit: { ...commit.commit, message: firstLine } };
    });

    res.render('index', {
      commits: shortenedCommits.slice(0, 5),
      currentVersion: currentVersion || 'N/A',
      previousVersion: previousVersion || 'N/A',
      changeType: changeType || 'N/A',
      repo: REPO,
      tags: validTags
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(200).render('index', {
      commits: [],
      currentVersion: 'N/A',
      previousVersion: 'N/A',
      changeType: 'N/A',
      repo: REPO,
      tags: []
    });
  }
});

// Validate REPO when the server starts instead of during import
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;