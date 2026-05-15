import { act, renderHook, waitFor } from '@testing-library/react';
import type { JobSearchResult } from '../api/jobSearchApi';
import { searchJobs } from '../api/jobSearchApi';
import { useJobSearch } from './useJobSearch';

jest.mock('../api/jobSearchApi', () => ({
  __esModule: true,
  searchJobs: jest.fn(),
}));

const mockedSearchJobs = jest.mocked(searchJobs);

describe('useJobSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedSearchJobs.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not call the API until the debounce window elapses', async () => {
    mockedSearchJobs.mockResolvedValue([]);

    const { result } = renderHook(() => useJobSearch(400));

    act(() => {
      result.current.setQuery('react');
    });

    expect(mockedSearchJobs).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(399);
    });
    expect(mockedSearchJobs).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockedSearchJobs).toHaveBeenCalledTimes(1);
    expect(mockedSearchJobs).toHaveBeenCalledWith('react');
  });

  it('returns results with the expected shape and clears loading after success', async () => {
    const payload: JobSearchResult[] = [
      { id: '1', title: 'Engineer', companyName: 'Co', location: 'NYC' },
    ];
    mockedSearchJobs.mockResolvedValue(payload);

    const { result } = renderHook(() => useJobSearch(200));

    act(() => {
      result.current.setQuery('eng');
    });

    await act(async () => {
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.results).toEqual(payload);
    expect(result.current.results[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      companyName: expect.any(String),
      location: expect.any(String),
    });
  });

  it('debounces rapid input changes so only the latest query is searched', async () => {
    mockedSearchJobs.mockResolvedValue([]);

    const { result } = renderHook(() => useJobSearch(300));

    act(() => {
      result.current.setQuery('a');
    });
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    act(() => {
      result.current.setQuery('ab');
    });
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    act(() => {
      result.current.setQuery('abc');
    });

    await act(async () => {
      jest.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(mockedSearchJobs).toHaveBeenCalledTimes(1);
    expect(mockedSearchJobs).toHaveBeenCalledWith('abc');
  });

  it('exposes loading and error when the API rejects', async () => {
    mockedSearchJobs.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useJobSearch(150));

    act(() => {
      result.current.setQuery('fail');
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(150);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('network down');
    expect(result.current.results).toEqual([]);
  });

  it('resets state when the query is cleared', async () => {
    mockedSearchJobs.mockResolvedValue([
      { id: '1', title: 'T', companyName: 'C', location: 'L' },
    ]);

    const { result } = renderHook(() => useJobSearch(100));

    act(() => {
      result.current.setQuery('x');
    });
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.results).toHaveLength(1);
    });

    act(() => {
      result.current.setQuery('   ');
    });

    await waitFor(() => {
      expect(result.current.results).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
