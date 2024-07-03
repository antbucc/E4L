export type PolyglotFlowInfo = {
  _id?: string;
  title: string;
  author?: {
    _id?: string;
    username?: string;
  };
  description: string;
  tags: { name: string; color: string }[];
  learningContext: string;
  duration: string;
  topics: string[];
  publish: boolean;
  /* to be discussed: do we want to save in the database the last summarized material of the professor? Or we give the tool to be live usage?
  sourceMaterial?: string;
  levelMaterial?: string;
  generatedMaterial?: string;
  noW?: number;*/
};

export type PolyglotFlow = PolyglotFlowInfo & {
  nodes: any[];
  edges: any[];
};

export type AIQuestionType = {
  language: string;
  text: string;
  type: number;
  level: number;
  category: number;
  temperature: number;
};

export const keyMapping = [
  { key: 'keyLP', cases: ['learningPath'] },
  { key: 'codingKey', cases: ['VSCode'] },
  { key: 'collaborativeKey', cases: ['Eraser', 'PapyrusWeb'] },
  { key: 'knowledgeKey', cases: ['WebApp'] },
];
