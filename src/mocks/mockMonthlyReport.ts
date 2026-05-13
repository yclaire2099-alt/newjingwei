import { Timestamp } from "firebase/firestore";

export interface MockReading {
  id: string;
  question: string;
  hexagramName: string;
  createdAt: any;
  coreReflection: string;
  changingLines: number[];
  tags: string[];
}

export interface MockMonthlyPatternReport {
  month: string;
  coreTheme: {
    title: string;
    description: string;
    keywords: string[];
  };
  emotionalTone: {
    tone: string;
    description: string;
    color: string;
  };
  monthlyLetter: string;
  repeatedPatterns: {
    title: string;
    description: string;
    examples: string[];
  }[];
  changeObservation: {
    title: string;
    observation: string;
  };
  mirrorQuestion: string;
  nextMonthInvitation: {
    theme: string;
    invitation: string;
  };
}

export const mockUser = {
  uid: "mock-user-123",
  displayName: "林深",
  email: "linshen@example.com",
};

export const mockMembershipState = {
  isPaidUser: false, // Default to false for testing recruitment logic
  tierName: "观" as const,
  canViewFullMonthlyReport: false,
  canViewPatternAnalysis: false,
  canViewNextMonthInvitations: false,
};

export const mockReadings: MockReading[] = [
  {
    id: "r1",
    question: "如何面对当下的职业转型期？",
    hexagramName: "地天泰",
    createdAt: Timestamp.fromDate(new Date(2026, 4, 2)),
    coreReflection: "通达之时，需守正不阿。",
    changingLines: [1, 1, 1, 0, 0, 0],
    tags: ["职业", "迷茫"],
  },
  {
    id: "r2",
    question: "与家人的沟通总是陷入死循环，该怎么办？",
    hexagramName: "山水蒙",
    createdAt: Timestamp.fromDate(new Date(2026, 4, 10)),
    coreReflection: "启蒙之初，需有耐性与诚意。",
    changingLines: [0, 1, 0, 0, 0, 1],
    tags: ["家庭", "沟通"],
  },
  {
    id: "r3",
    question: "想开始新的创作计划，但总是自我怀疑。",
    hexagramName: "水天需",
    createdAt: Timestamp.fromDate(new Date(2026, 4, 15)),
    coreReflection: "等待不是停滞，是积蓄力量的过程。",
    changingLines: [0, 1, 0, 1, 1, 1],
    tags: ["创作", "自我"],
  },
  {
    id: "r4",
    question: "为何最近总觉得精力匮乏，无法集中？",
    hexagramName: "坎为水",
    createdAt: Timestamp.fromDate(new Date(2026, 4, 22)),
    coreReflection: "重重险难中，守持内心之诚。",
    changingLines: [0, 1, 0, 0, 1, 0],
    tags: ["情绪", "健康"],
  },
];

export const mockMonthlyPatternReport: MockMonthlyPatternReport = {
  month: "2026年5月",
  coreTheme: {
    title: "潜流中的静候",
    description: "本月你的照见频率集中在「新旧更替」的缝隙中。你正在告别一种旧的稳定性，却尚未锚定新的港湾。",
    keywords: ["等待", "积蓄", "沟通壁垒", "自我重建"],
  },
  emotionalTone: {
    tone: "深邃的黛蓝",
    description: "带有冷静的思考，但也藏着一丝不易察觉的焦虑与沉重。",
    color: "#1a365d",
  },
  monthlyLetter: `亲爱的林深：

在这个月里，你一共开启了 4 次镜像对照。

镜微默默记住了你关于「职业」、「家庭」与「创作力」的每一次发问。在这些看似散乱的线索中，我看见了一个正在试图穿过迷雾、寻找支点的你。

当你问起转换期时，你其实是在问：我是否值得更好的？
当你问起沟通死循环时，你其实是在问：我是否被看见了？

你正在经历的并非停滞，而是一场深刻的内部重组。那些你认为的「卡点」，恰恰是你长期运行模式中最坚硬、也最需要光照进去的地方。

镜微不会替你定义自己，
但它会持续记得你留下的每一次照见，
并帮你把那些反复出现的线索连起来。`,
  repeatedPatterns: [
    {
      title: "回避型冲突处理",
      description: "在职业与家庭关系中，你习惯用「等待」来替代「直接对话」。这种等待有时并非耐心，而是对结果未知的恐惧。",
      examples: ["对职业转型的迟疑", "对家庭沟通的死循环"],
    },
    {
      title: "完美主义的借口",
      description: "你在开始新创作时的「自我怀疑」，本质上是想跳过「不完美」的草稿期。这让你在很多时候因无法快速获得反馈而产生精力损耗。",
      examples: ["创作计划中的停滞"],
    },
  ],
  changeObservation: {
    title: "从「外求」转向「内省」",
    observation: "相比上个月频繁询问「结果」，这个月你的问题更多关注「起因」和「我的状态」。这种视角的转换是成长最清晰的标志。",
  },
  mirrorQuestion: "如果你不需要向任何人证明自己的正确，你现在最想把精力浪费在哪里？",
  nextMonthInvitation: {
    theme: "显露与发声",
    invitation: "下个月，尝试在感到不确定时，依然选择表达。不是表达完美的结论，而是表达此刻的真实。",
  },
};
