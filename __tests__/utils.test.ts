import axios from 'axios';
import { fetchCommits, fetchValidTags, determineChangeType, fetchReleaseData } from '../src/utils';
import { vi } from 'vitest';

vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

describe('Utility Functions', () => {
  it('fetchCommits should return an array of commits', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [{ sha: '123', commit: { message: 'Initial commit' } }] });

    const commits = await fetchCommits('owner', 'repo');
    expect(Array.isArray(commits)).toBe(true);
    expect(commits[0].sha).toBe('123');
    expect(commits[0].commit.message).toBe('Initial commit');
  });

  it('fetchValidTags should return an array of valid tags', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [{ name: 'v1.0.0' }, { name: 'invalid-tag' }] });

    const tags = await fetchValidTags('owner', 'repo');
    expect(Array.isArray(tags)).toBe(true);
    expect(tags.length).toBe(1);
    expect(tags[0].name).toBe('v1.0.0');
  });

  it('determineChangeType should return the correct change type', () => {
    expect(determineChangeType('2.0.0', '1.0.0')).toBe('Major');
    expect(determineChangeType('1.1.0', '1.0.0')).toBe('Minor');
    expect(determineChangeType('1.0.1', '1.0.0')).toBe('Patch');
  });

  it('fetchReleaseData should return release data', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: [{ sha: '123', commit: { message: 'Initial commit' } }] }) // Commits
      .mockResolvedValueOnce({ data: [{ name: 'v1.0.0', commit: { sha: '123' } }] }); // Tags

    const releaseData = await fetchReleaseData('owner', 'repo');

    expect(releaseData.commits.length).toBe(1);
    expect(releaseData.commits[0].sha).toBe('123');
    expect(releaseData.tags.length).toBe(1);
    expect(releaseData.tags[0].name).toBe('v1.0.0');
    expect(releaseData.currentVersion).toBe('v1.0.0');
    expect(releaseData.previousVersion).toBe('');
    expect(releaseData.changeType).toBe(null);
  });

  it('fetchReleaseData should handle no tags', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: [{ sha: '123', commit: { message: 'Initial commit' } }] }) // Commits
      .mockResolvedValueOnce({ data: [] }); // No Tags

    const releaseData = await fetchReleaseData('owner', 'repo');

    expect(releaseData.commits.length).toBe(1);
    expect(releaseData.tags.length).toBe(0);
    expect(releaseData.currentVersion).toBe('');
    expect(releaseData.previousVersion).toBe('');
    expect(releaseData.changeType).toBe(null);
  });

  it('fetchReleaseData should handle a single tag', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: [{ sha: '123', commit: { message: 'Initial commit' } }] }) // Commits
      .mockResolvedValueOnce({ data: [{ name: 'v1.0.0', commit: { sha: '123' } }] }); // Single Tag

    const releaseData = await fetchReleaseData('owner', 'repo');

    expect(releaseData.commits.length).toBe(1);
    expect(releaseData.tags.length).toBe(1);
    expect(releaseData.currentVersion).toBe('v1.0.0');
    expect(releaseData.previousVersion).toBe('');
    expect(releaseData.changeType).toBe(null);
  });

  it('fetchReleaseData should handle no commits', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: [] }) // No Commits
      .mockResolvedValueOnce({ data: [{ name: 'v1.0.0', commit: { sha: '123' } }] }); // Tags

    const releaseData = await fetchReleaseData('owner', 'repo');

    expect(releaseData.commits.length).toBe(0);
    expect(releaseData.tags.length).toBe(1);
    expect(releaseData.currentVersion).toBe('v1.0.0');
    expect(releaseData.previousVersion).toBe('');
    expect(releaseData.changeType).toBe(null);
  });

  it('fetchReleaseData should handle one or two commits', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: [
        { sha: '123', commit: { message: 'Initial commit' } },
      ] }) // One Commit
      .mockResolvedValueOnce({ data: [{ name: 'v1.0.0', commit: { sha: '123' } }] }); // Tags

    const releaseDataOneCommit = await fetchReleaseData('owner', 'repo');

    expect(releaseDataOneCommit.commits.length).toBe(1);

    mockedAxios.get
      .mockResolvedValueOnce({ data: [
        { sha: '123', commit: { message: 'Initial commit' } },
        { sha: '456', commit: { message: 'Second commit' } },
      ] }) // Two Commits
      .mockResolvedValueOnce({ data: [{ name: 'v1.0.0', commit: { sha: '123' } }] }); // Tags

    const releaseDataTwoCommits = await fetchReleaseData('owner', 'repo');

    expect(releaseDataTwoCommits.commits.length).toBe(2);
  });

  it('determineChangeType should handle null versions', () => {
    expect(determineChangeType(null, '1.0.0')).toBe(null);
    expect(determineChangeType('1.0.0', null)).toBe(null);
    expect(determineChangeType(null, null)).toBe(null);
  });
});