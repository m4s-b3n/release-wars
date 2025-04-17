import request from 'supertest';
import app from '../src/index';
import { fetchReleaseData } from '../src/utils';
import { vi } from 'vitest';

// Replace jest with vi for mocking
const mockedFetchReleaseData = fetchReleaseData as ReturnType<typeof vi.fn>;

vi.mock('../src/utils', () => ({
  fetchReleaseData: vi.fn(),
}));

vi.spyOn(app, 'listen').mockImplementation(() => vi.fn() as any);

describe('App Endpoints', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('environment variable is set', () => {
    expect(process.env.REPO).toBe('owner/repo');
  });

  it('should call utility function with the right parameters', async () => {
    mockedFetchReleaseData.mockResolvedValueOnce({
      commits: [
        { sha: '123', commit: { message: 'Initial commit' } },
        { sha: '456', commit: { message: 'Second commit' } },
        { sha: '789', commit: { message: 'Third commit' } },
        { sha: 'abc', commit: { message: 'Fourth commit' } },
        { sha: 'def', commit: { message: 'Fifth commit' } },
        { sha: 'ghi', commit: { message: 'Sixth commit' } },
        { sha: 'jkl', commit: { message: 'Seventh commit' } },
        { sha: 'mno', commit: { message: 'Eighth commit' } },
        { sha: 'pqr', commit: { message: 'Ninth commit' } },
        { sha: 'stu', commit: { message: 'Tenth commit' } }
      ],
      tags: [
        { name: 'v1.0.0', commit: { sha: '123' } },
        { name: 'v0.9.0', commit: { sha: '456' } }
      ],
      currentVersion: 'v1.0.0',
      previousVersion: 'v0.9.0',
      changeType: 'Minor',
    });

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Last Version: v1.0.0');
    expect(response.text).toContain('Previous Version: v0.9.0');
    expect(response.text).toContain('Change Type: Minor');
    expect(response.text).toContain('Initial commit');
    expect(response.text).toContain('Second commit');
    expect(response.text).toContain('Third commit');
    expect(response.text).toContain('Fourth commit');
    expect(response.text).toContain('Fifth commit');
    expect(response.text).not.toContain('Sixth commit'); // Only 5 commits are shown
    expect(response.text).not.toContain('Seventh commit'); // Only 5 commits are shown
    expect(response.text).not.toContain('Eighth commit'); // Only 5 commits are shown
    expect(response.text).not.toContain('Ninth commit'); // Only 5 commits are shown
    expect(response.text).not.toContain('Tenth commit'); // Only 5 commits are shown
  });

  it('should handle no data at all', async () => {
    mockedFetchReleaseData.mockResolvedValueOnce({});

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Last Version: N/A');
    expect(response.text).toContain('No previous version available');
    expect(response.text).toContain('Change Type: N/A');
    expect(response.text).toContain('No commits available');
  });

  it('should handle no commits fetched', async () => {
    mockedFetchReleaseData.mockResolvedValueOnce({
      commits: [],
      tags: [
        { name: 'v1.0.0', commit: { sha: '123' } }
      ],
      currentVersion: 'v1.0.0',
      previousVersion: '',
      changeType: null,
    });

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Last Version: v1.0.0');
    expect(response.text).toContain('No previous version available');
    expect(response.text).toContain('Change Type: N/A');
    expect(response.text).toContain('No commits available');
  });

  it('should handle no tags fetched', async () => {
    mockedFetchReleaseData.mockResolvedValueOnce({
      commits: [
        { sha: '123', commit: { message: 'Initial commit' } }
      ],
      tags: [],
      currentVersion: '',
      previousVersion: '',
      changeType: null,
    });

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Last Version: N/A');
    expect(response.text).toContain('No previous version available');
    expect(response.text).toContain('Change Type: N/A');
    expect(response.text).toContain('Initial commit');
  });

  it('should handle only one commit', async () => {
    mockedFetchReleaseData.mockResolvedValueOnce({
      commits: [
        { sha: '123', commit: { message: 'Initial commit' } }
      ],
      tags: [
        { name: 'v1.0.0', commit: { sha: '123' } }
      ],
      currentVersion: 'v1.0.0',
      previousVersion: '',
      changeType: null,
    });

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Last Version: v1.0.0');
    expect(response.text).toContain('No previous version available');
    expect(response.text).toContain('Change Type: N/A');
    expect(response.text).toContain('Initial commit');
  });

  it('should handle only one tag', async () => {
    mockedFetchReleaseData.mockResolvedValueOnce({
      commits: [
        { sha: '123', commit: { message: 'Initial commit' } },
        { sha: '456', commit: { message: 'Second commit' } }
      ],
      tags: [
        { name: 'v1.0.0', commit: { sha: '123' } }
      ],
      currentVersion: 'v1.0.0',
      previousVersion: '',
      changeType: null,
    });

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Last Version: v1.0.0');
    expect(response.text).toContain('No previous version available');
    expect(response.text).toContain('Change Type: N/A');
    expect(response.text).toContain('Initial commit');
    expect(response.text).toContain('Second commit');
  });

  it('should handle undefined tags gracefully', async () => {
    mockedFetchReleaseData.mockResolvedValueOnce({
      commits: [
        { sha: '123', commit: { message: 'Initial commit' } }
      ],
      tags: undefined, // Simulate undefined tags
      currentVersion: 'v1.0.0',
      previousVersion: '',
      changeType: null,
    });

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Last Version: v1.0.0');
    expect(response.text).toContain('No previous version available');
    expect(response.text).toContain('Change Type: N/A');
    expect(response.text).toContain('Initial commit');
  });
});