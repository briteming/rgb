import { createContext, FC, useCallback, useEffect, useState } from "react";
import { number } from "zod";
import { api } from "../../services/api";
import {
  IIssues,
  IProfile,
  IProfileContextType,
  ProfileProviderProps,
} from "./types";

const GITHUB_BLOG_PROFILE_STORAGE_KEY = "@githubBlog:profile";
const gitHubUser = import.meta.env.VITE_GITHUB_USERNAME;
const gitHubRepo = import.meta.env.VITE_GITHUB_REPONAME;

export const GithubDataContext = createContext<IProfileContextType>({
  profile: {} as IProfile,
  issues: {} as IIssues,
  totalPosts: 0,
  getProfileInfo: async () => undefined,
  getIssues: async (query: string) => undefined,
});

export const GithubDataProvider: FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<IProfile>(() => {
    const storedProfileData = localStorage.getItem(
      GITHUB_BLOG_PROFILE_STORAGE_KEY
    );
    if (storedProfileData) return JSON.parse(storedProfileData) as IProfile;
    return {} as IProfile;
  });
  const [issues, setIssues] = useState<IIssues>({} as IIssues);
  const totalPosts = issues.total_count > 0 ? issues.total_count : 0;

  const getProfileInfo = useCallback(async () => {
    const { data } = await api.get(`/users/${gitHubUser}`);

    setProfile(data);
    localStorage.setItem(GITHUB_BLOG_PROFILE_STORAGE_KEY, JSON.stringify(data));
  }, []);

  const getIssues = useCallback(async (query: string = "") => {
    const { data } = await api.get(
      `/search/issues?q=${query}%20repo:${gitHubUser}/${gitHubRepo}`
    );

    setIssues(data);
  }, []);

  useEffect(() => {
    getIssues();
    const storedProfileData = localStorage.getItem(
      GITHUB_BLOG_PROFILE_STORAGE_KEY
    );

    if (storedProfileData) {
      const { login } = JSON.parse(storedProfileData) as IProfile;
      if (login === gitHubUser) return;
    }
    getProfileInfo();
  }, []);

  return (
    <GithubDataContext.Provider
      value={{
        profile,
        issues,
        totalPosts,
        getProfileInfo,
        getIssues,
      }}
    >
      {children}
    </GithubDataContext.Provider>
  );
};
