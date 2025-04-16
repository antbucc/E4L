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
  { key: 'keyLP', cases: ['learningPath'], generalPoints: 100 },
  { key: 'codingKey', cases: ['VSCode'], generalPoints: 100 },
  { key: 'collaborativeKey', cases: ['Eraser'], generalPoints: 100 },
  { key: 'demo2024event', cases: ['PapyrusWeb'], generalPoints: 100 },
  { key: 'knowledgeKey', cases: ['WebApp'], generalPoints: 100 },
  { key: 'generalKey', cases: [], generalPoints: 100 },
  { key: 'challenge45Aquila2025', cases: [], generalPoints: 100 },
  { key: 'challenge23Aquila2025', cases: [], generalPoints: 100 },
];

export type layerType = {
  draworder: string;
  id: Number;
  name: string;
  objects: objTile[];
  opacity: Number;
  type: string;
  visible: boolean;
  x: Number;
  y: Number;
};

export type objTile = {
  height: Number;
  id: Number;
  name: string;
  properties: any[];
  rotation: Number;
  type: string;
  visible: true;
  width: Number;
  x: Number;
  y: Number;
  class: string;
};

export enum Platform {
  PolyGloT,
  VirtualStudio,
  Papyrus,
  WebApp,
  WorkAdventure,
}

export enum ZoneId {
  FreeZone,
  OutsideZone,
  SilentZone,
  LearningPathSelectionZone,
  InstructionWebpageZone,
  WebAppZone,
  MeetingRoomZone,
  PolyGlotLearningZone,
  PolyGlotLearningPathCreationZone,
  PapyrusWebZone,
  VirtualStudioZone,
}

//Action Body
export type AnalyticsActionBody = {
  timestamp: Date;
  userId: string;
  actionType: string;
  zoneId: ZoneId;
  platform: Platform;
  action: any;
};

export type GradeAction = AnalyticsActionBody & {
  action: {
    flow: string;
    grade: number;
  };
};
