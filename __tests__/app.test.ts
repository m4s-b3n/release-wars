import express from "express";
import { fetchReleaseData } from "../src/utils";
import { vi } from "vitest";
import app, { refreshCache, renderCachedData } from "../src/index";

// Replace jest with vi for mocking
const mockedFetchReleaseData = fetchReleaseData as ReturnType<typeof vi.fn>;

vi.mock("../src/utils", () => ({
  fetchReleaseData: vi.fn(),
}));

// Replace 'any' with specific types for better type safety
vi.spyOn(app, "listen").mockImplementation(
  () => vi.fn() as jest.MockInstance<() => void, []>,
);

describe("App Endpoints", () => {
  beforeEach(() => {});

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("environment variable is set", () => {
    expect(process.env.REPO).toBe("owner/repo");
  });

  it("should call utility function with the right parameters", async () => {
    mockedFetchReleaseData.mockResolvedValueOnce({
      commits: [
        { sha: "123", commit: { message: "Initial commit" } },
        { sha: "456", commit: { message: "Second commit" } },
        { sha: "789", commit: { message: "Third commit" } },
        { sha: "abc", commit: { message: "Fourth commit" } },
        { sha: "def", commit: { message: "Fifth commit" } },
        { sha: "ghi", commit: { message: "Sixth commit" } },
        { sha: "jkl", commit: { message: "Seventh commit" } },
        { sha: "mno", commit: { message: "Eighth commit" } },
        { sha: "pqr", commit: { message: "Ninth commit" } },
        { sha: "stu", commit: { message: "Tenth commit" } },
      ],
      tags: [
        { name: "v1.0.0", commit: { sha: "123" } },
        { name: "v0.9.0", commit: { sha: "456" } },
      ],
      currentVersion: "v1.0.0",
      previousVersion: "v0.9.0",
      changeType: "Minor",
    });

    await refreshCache();

    const mockRes = {
      render: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as express.Response;

    renderCachedData(mockRes);

    expect(mockRes.status).not.toHaveBeenCalledWith(503); // Ensure no 503 error
    expect(mockRes.render).toHaveBeenCalled();
    expect(mockRes.render).toHaveBeenCalledWith("index", {
      commits: [
        { sha: "123", commit: { message: "Initial commit" } },
        { sha: "456", commit: { message: "Second commit" } },
        { sha: "789", commit: { message: "Third commit" } },
        { sha: "abc", commit: { message: "Fourth commit" } },
        { sha: "def", commit: { message: "Fifth commit" } },
      ],
      currentVersion: "v1.0.0",
      previousVersion: "v0.9.0",
      changeType: "Minor",
      repo: "owner/repo",
    });
  });

  it("should handle no data at all", async () => {
    mockedFetchReleaseData.mockResolvedValueOnce({});

    await refreshCache();

    const mockRes = {
      render: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as express.Response;

    renderCachedData(mockRes);

    expect(mockRes.status).not.toHaveBeenCalledWith(503); // Ensure no 503 error
    expect(mockRes.render).toHaveBeenCalled();
    expect(mockRes.render).toHaveBeenCalledWith("index", {
      commits: [],
      currentVersion: "N/A",
      previousVersion: "No previous version available",
      changeType: "N/A",
      repo: "owner/repo",
    });
  });

  it("should handle no commits fetched", async () => {
    mockedFetchReleaseData.mockResolvedValueOnce({
      commits: [],
      tags: [{ name: "v1.0.0", commit: { sha: "123" } }],
      currentVersion: "v1.0.0",
      previousVersion: "",
      changeType: null,
    });

    await refreshCache();

    const mockRes = {
      render: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as express.Response;

    renderCachedData(mockRes);

    expect(mockRes.status).not.toHaveBeenCalledWith(503); // Ensure no 503 error
    expect(mockRes.render).toHaveBeenCalled();
    expect(mockRes.render).toHaveBeenCalledWith("index", {
      commits: [],
      currentVersion: "v1.0.0",
      previousVersion: "No previous version available",
      changeType: "N/A",
      repo: "owner/repo",
    });
  });

  it("should handle no tags fetched", async () => {
    mockedFetchReleaseData.mockResolvedValueOnce({
      commits: [{ sha: "123", commit: { message: "Initial commit" } }],
      tags: [],
      currentVersion: "",
      previousVersion: "",
      changeType: null,
    });

    await refreshCache();

    const mockRes = {
      render: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as express.Response;

    renderCachedData(mockRes);

    expect(mockRes.status).not.toHaveBeenCalledWith(503); // Ensure no 503 error
    expect(mockRes.render).toHaveBeenCalled();
    expect(mockRes.render).toHaveBeenCalledWith("index", {
      commits: [{ sha: "123", commit: { message: "Initial commit" } }],
      currentVersion: "N/A",
      previousVersion: "No previous version available",
      changeType: "N/A",
      repo: "owner/repo",
    });
  });

  it("should handle only one commit", async () => {
    mockedFetchReleaseData.mockResolvedValueOnce({
      commits: [{ sha: "123", commit: { message: "Initial commit" } }],
      tags: [{ name: "v1.0.0", commit: { sha: "123" } }],
      currentVersion: "v1.0.0",
      previousVersion: "",
      changeType: null,
    });

    await refreshCache();

    const mockRes = {
      render: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as express.Response;

    renderCachedData(mockRes);

    expect(mockRes.status).not.toHaveBeenCalledWith(503); // Ensure no 503 error
    expect(mockRes.render).toHaveBeenCalled();
    expect(mockRes.render).toHaveBeenCalledWith("index", {
      commits: [{ sha: "123", commit: { message: "Initial commit" } }],
      currentVersion: "v1.0.0",
      previousVersion: "No previous version available",
      changeType: "N/A",
      repo: "owner/repo",
    });
  });

  it("should handle only one tag", async () => {
    mockedFetchReleaseData.mockResolvedValueOnce({
      commits: [
        { sha: "123", commit: { message: "Initial commit" } },
        { sha: "456", commit: { message: "Second commit" } },
      ],
      tags: [{ name: "v1.0.0", commit: { sha: "123" } }],
      currentVersion: "v1.0.0",
      previousVersion: "",
      changeType: null,
    });

    await refreshCache();

    const mockRes = {
      render: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as express.Response;

    renderCachedData(mockRes);

    expect(mockRes.status).not.toHaveBeenCalledWith(503); // Ensure no 503 error
    expect(mockRes.render).toHaveBeenCalled();
    expect(mockRes.render).toHaveBeenCalledWith("index", {
      commits: [
        { sha: "123", commit: { message: "Initial commit" } },
        { sha: "456", commit: { message: "Second commit" } },
      ],
      currentVersion: "v1.0.0",
      previousVersion: "No previous version available",
      changeType: "N/A",
      repo: "owner/repo",
    });
  });

  it("should handle undefined tags gracefully", async () => {
    mockedFetchReleaseData.mockResolvedValueOnce({
      commits: [{ sha: "123", commit: { message: "Initial commit" } }],
      tags: undefined, // Simulate undefined tags
      currentVersion: "v1.0.0",
      previousVersion: "",
      changeType: null,
    });

    await refreshCache();

    const mockRes = {
      render: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as express.Response;

    renderCachedData(mockRes);

    expect(mockRes.status).not.toHaveBeenCalledWith(503); // Ensure no 503 error
    expect(mockRes.render).toHaveBeenCalled();
    expect(mockRes.render).toHaveBeenCalledWith("index", {
      commits: [{ sha: "123", commit: { message: "Initial commit" } }],
      currentVersion: "v1.0.0",
      previousVersion: "No previous version available",
      changeType: "N/A",
      repo: "owner/repo",
    });
  });
});
