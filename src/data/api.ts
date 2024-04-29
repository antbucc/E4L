import axiosCreate, { AxiosResponse } from 'axios';

export type UserFlowBody = {
  userId: string;
  flowId: string;
};
export type NextBody = {
  userId: string;
  flowId: string;
  satisfiedConditions: string[];
};

//the next 3 type are temporary, the next implementation will not use "ctxId", the APIs will use only the userId and the flowId
export type FlowBody = {
  flowId: string;
};
export type CtxBody = { ctxId: string };
export type NextCtxBody = { ctxId: string; satisfiedConditions: string[] };

export type PolyglotNode = {
  _id: string;
  type: string;
  title: string;
  description: string;
  difficulty: number;
  runtimeData: any;
  platform: string;
  data: any;
  reactFlow: any;
};

export type PolyglotNodeValidation = PolyglotNode & {
  validation: {
    id: string;
    title: string;
    code: string;
    data: any;
    type: string;
  }[];
};

const execution = axiosCreate.create({
  //@ts-ignore
  baseURL: import.meta.env.VITE_BACK_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const API = {
  getLPList: (): Promise<AxiosResponse> => {
    return execution.get<{}, AxiosResponse, {}>(`/api/flows/`);
  },
  getActualNode: (body: CtxBody /*UserFlowBody*/): Promise<AxiosResponse> => {
    return execution.post<{}, AxiosResponse, {}>(`/api/execution/actual`, body);
  },
  //The next API won't be necessary after the implementation of userId-flowId body
  getFirstNode: (body: FlowBody): Promise<AxiosResponse> => {
    return execution.post<{}, AxiosResponse, {}>(`/api/execution/first`, body);
  },
  getNextNode: (body: NextCtxBody /*NextBody*/): Promise<AxiosResponse> => {
    return execution.post<{}, AxiosResponse, {}>(`/api/execution/next`, body);
  },
};
