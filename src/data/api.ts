import axiosCreate, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

export type PolyglotBody = {
  ctx: string;
  userId: string;
  flowId: string;
};

const axios = axiosCreate.create({
  baseURL: process.env.BACK_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const API = {
  summarizerAI: (body: PolyglotBody): Promise<AxiosResponse> => {
    return axios.post<{}, AxiosResponse, {}>(
      `/Summarizer/summarizelesson`,
      body
    );
  },
};
