import { FlowerTheme, Language, AgentConfig } from './types';

export const FLOWER_THEMES: FlowerTheme[] = [
  { id: 'rose', nameEn: 'Red Rose', nameZh: '紅玫瑰', primaryColor: '#e11d48', secondaryColor: '#fda4af', accentColor: '#be123c', bgColor: '#fff1f2', darkBgColor: '#4c0519' },
  { id: 'sunflower', nameEn: 'Sunflower', nameZh: '向日葵', primaryColor: '#ca8a04', secondaryColor: '#fde047', accentColor: '#a16207', bgColor: '#fefce8', darkBgColor: '#422006' },
  { id: 'lavender', nameEn: 'Lavender', nameZh: '薰衣草', primaryColor: '#7c3aed', secondaryColor: '#d8b4fe', accentColor: '#6d28d9', bgColor: '#f3e8ff', darkBgColor: '#2e1065' },
  { id: 'lily', nameEn: 'White Lily', nameZh: '百合', primaryColor: '#059669', secondaryColor: '#6ee7b7', accentColor: '#047857', bgColor: '#ecfdf5', darkBgColor: '#022c22' },
  { id: 'cherry', nameEn: 'Cherry Blossom', nameZh: '櫻花', primaryColor: '#db2777', secondaryColor: '#f9a8d4', accentColor: '#be185d', bgColor: '#fdf2f8', darkBgColor: '#500724' },
  { id: 'orchid', nameEn: 'Orchid', nameZh: '蘭花', primaryColor: '#9333ea', secondaryColor: '#e9d5ff', accentColor: '#7e22ce', bgColor: '#faf5ff', darkBgColor: '#3b0764' },
  { id: 'tulip', nameEn: 'Tulip', nameZh: '鬱金香', primaryColor: '#ea580c', secondaryColor: '#fdba74', accentColor: '#c2410c', bgColor: '#fff7ed', darkBgColor: '#431407' },
  { id: 'daisy', nameEn: 'Daisy', nameZh: '雛菊', primaryColor: '#65a30d', secondaryColor: '#bef264', accentColor: '#4d7c0f', bgColor: '#f7fee7', darkBgColor: '#1a2e05' },
  { id: 'hydrangea', nameEn: 'Hydrangea', nameZh: '繡球花', primaryColor: '#2563eb', secondaryColor: '#93c5fd', accentColor: '#1d4ed8', bgColor: '#eff6ff', darkBgColor: '#172554' },
  { id: 'peony', nameEn: 'Peony', nameZh: '牡丹', primaryColor: '#be123c', secondaryColor: '#fecdd3', accentColor: '#9f1239', bgColor: '#fff1f2', darkBgColor: '#881337' },
  { id: 'lotus', nameEn: 'Lotus', nameZh: '蓮花', primaryColor: '#db2777', secondaryColor: '#fbcfe8', accentColor: '#be185d', bgColor: '#fdf2f8', darkBgColor: '#831843' },
  { id: 'marigold', nameEn: 'Marigold', nameZh: '萬壽菊', primaryColor: '#d97706', secondaryColor: '#fcd34d', accentColor: '#b45309', bgColor: '#fffbeb', darkBgColor: '#451a03' },
  { id: 'iris', nameEn: 'Iris', nameZh: '鳶尾花', primaryColor: '#4f46e5', secondaryColor: '#a5b4fc', accentColor: '#4338ca', bgColor: '#eef2ff', darkBgColor: '#312e81' },
  { id: 'poppy', nameEn: 'Poppy', nameZh: '罌粟花', primaryColor: '#dc2626', secondaryColor: '#fca5a5', accentColor: '#b91c1c', bgColor: '#fef2f2', darkBgColor: '#450a0a' },
  { id: 'daffodil', nameEn: 'Daffodil', nameZh: '水仙', primaryColor: '#eab308', secondaryColor: '#fde047', accentColor: '#ca8a04', bgColor: '#fefce8', darkBgColor: '#713f12' },
  { id: 'violet', nameEn: 'Violet', nameZh: '紫羅蘭', primaryColor: '#7c3aed', secondaryColor: '#c4b5fd', accentColor: '#6d28d9', bgColor: '#f5f3ff', darkBgColor: '#4c1d95' },
  { id: 'jasmine', nameEn: 'Jasmine', nameZh: '茉莉', primaryColor: '#10b981', secondaryColor: '#6ee7b7', accentColor: '#059669', bgColor: '#ecfdf5', darkBgColor: '#064e3b' },
  { id: 'camellia', nameEn: 'Camellia', nameZh: '山茶花', primaryColor: '#e11d48', secondaryColor: '#fda4af', accentColor: '#9f1239', bgColor: '#fff1f2', darkBgColor: '#881337' },
  { id: 'magnolia', nameEn: 'Magnolia', nameZh: '木蘭', primaryColor: '#be185d', secondaryColor: '#fbcfe8', accentColor: '#9d174d', bgColor: '#fdf2f8', darkBgColor: '#500724' },
  { id: 'hibiscus', nameEn: 'Hibiscus', nameZh: '扶桑花', primaryColor: '#b91c1c', secondaryColor: '#fca5a5', accentColor: '#991b1b', bgColor: '#fef2f2', darkBgColor: '#7f1d1d' },
];

export const TRANSLATIONS = {
  [Language.EN]: {
    title: "FDA 510(k) Multi-Agent Review Studio",
    subtitle: "Professional Regulatory AI Orchestrator",
    theme: "Theme",
    language: "Language",
    flowerStyle: "Flower Style",
    health: "Compliance Health",
    mana: "AI Capacity",
    level: "Maturity Lvl",
    apiKeys: "API Keys",
    input: "Case Inputs",
    pipeline: "Pipeline",
    smartReplace: "Smart Edit",
    notes: "AI Note Keeper",
    dashboard: "Dashboard",
    spinWheel: "Spin Lucky Wheel",
    settings: "Settings",
    close: "Close",
    save: "Save",
    run: "Run Pipeline",
    processing: "Processing...",
    completed: "Completed",
    failed: "Failed",
    apiKeyHint: "Key loaded from environment"
  },
  [Language.ZH]: {
    title: "FDA 510(k) 多代理審查工作室",
    subtitle: "專業醫療器材法規 AI 協作平台",
    theme: "主題模式",
    language: "語言",
    flowerStyle: "花卉風格",
    health: "合規健康度",
    mana: "AI 資源容量",
    level: "成熟度等級",
    apiKeys: "API 金鑰",
    input: "案件輸入",
    pipeline: "審查流程",
    smartReplace: "智能編輯",
    notes: "AI 筆記",
    dashboard: "儀表板",
    spinWheel: "轉動幸運輪盤",
    settings: "設定",
    close: "關閉",
    save: "儲存",
    run: "執行流程",
    processing: "處理中...",
    completed: "已完成",
    failed: "失敗",
    apiKeyHint: "已從環境變數載入"
  }
};

export const AI_PROMPTS = {
  TRANSFORM_MD: `Convert the following text into well-structured Markdown. 
  Rules:
  1. Use appropriate headers (#, ##, ###).
  2. Use lists for items.
  3. Identify key regulatory terms, risk factors, or medical definitions and wrap them in HTML spans with color 'coral': <span style='color: coral'>KEYWORD</span>.
  4. Keep the content accurate to the source.`,

  ENTITY_EXTRACTION: `Analyze the provided text and:
  1. Write a comprehensive summary of the content (approx 150 words).
  2. Extract exactly 20 key entities (concepts, regulations, devices, tests, organizations, etc.).
  3. For each entity, provide a brief context from the text.
  
  Return ONLY valid JSON in the following format:
  {
    "summary": "...",
    "entities": [
      { "name": "Entity Name", "context": "Context from text..." },
      ...
    ]
  }`,

  AI_FORMATTING: `Reorganize the following text to improve readability and flow while strictly preserving all original information. 
  - Do not summarize; keep all details.
  - Use clear headings and bullet points where appropriate.
  - Format as Markdown.`,

  MAGIC_MINDMAP: `Create a Mermaid.js mindmap syntax based on the following text.
  - Start with 'mindmap'
  - Use the main topic as the root.
  - Branch out into key categories (e.g., Regulatory, Clinical, Performance, Risk).
  - Return ONLY the mermaid code block.`,

  MAGIC_QUIZ: `Generate a 5-question multiple-choice quiz based on the text to test understanding of the FDA 510(k) requirements mentioned.
  - Provide the question, 4 options, and the correct answer with a short explanation.
  - Return as Markdown.`,
};

// Updated model list with provider information
export const AI_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', provider: 'gemini' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'openai' },
];

export const DEFAULT_PIPELINE_CONFIG: AgentConfig[] = [
  {
    id: 'AG-01',
    name: 'Compliance Check',
    description: 'Verifies the input against general 510(k) content requirements (21 CFR 807.87).',
    model: 'gemini-2.5-flash',
    provider: 'gemini',
    maxTokens: 4096,
    temperature: 0.2,
    systemPrompt: `You are an FDA Regulatory Affairs Specialist. Review the provided device description and 510(k) strategy. 
    1. Identify the regulation number and product code.
    2. Check for missing administrative elements (Truthful and Accurate statement, Financial Certification, etc.).
    3. Output a checklist of compliant vs missing items.`
  },
  {
    id: 'AG-02',
    name: 'Risk Analysis',
    description: 'Evaluates potential risks and suggests mitigation strategies (ISO 14971).',
    model: 'gemini-2.5-flash',
    provider: 'gemini',
    maxTokens: 4096,
    temperature: 0.5,
    systemPrompt: `You are a Risk Management Expert (ISO 14971). Based on the previous compliance check and device description:
    1. Identify top 5 hazards (Thermal, Electrical, Biological, etc.).
    2. Suggest mitigation measures for each.
    3. Determine if the risk profile suggests a different classification.`
  },
  {
    id: 'AG-03',
    name: 'Clinical Review',
    description: 'Assesses the need for clinical data vs bench testing.',
    model: 'gpt-4o-mini',
    provider: 'openai',
    maxTokens: 2048,
    temperature: 0.3,
    systemPrompt: `You are a Clinical Reviewer. Analyze the device indications and risk analysis.
    1. Determine if clinical data is likely required or if bench testing (non-clinical) is sufficient.
    2. Suggest specific performance tests (biocompatibility, electrical safety, software validation).
    3. Cite relevant guidance documents.`
  },
  {
    id: 'AG-04',
    name: 'Final Summary',
    description: 'Compiles all findings into a deficiency letter or clearance memo.',
    model: 'gpt-4o-mini',
    provider: 'openai',
    maxTokens: 4096,
    temperature: 0.7,
    systemPrompt: `You are a Lead Reviewer. Synthesize the findings from Compliance, Risk, and Clinical reviews.
    1. Draft a summary memo.
    2. Highlight the "Weakest Link" in the submission.
    3. Provide a probability of clearance (Low/Medium/High) with reasoning.`
  }
];
