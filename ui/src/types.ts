export type Material = { name: string; notes?: string; url?: string };

export type Size = {
  alias: string;
  dimensions: number[];
};

export type Product = {
  id: string;
  name: string;
  date: number; // date designed in epoch ms.
  introduction?: string;
  keywords: string[];
  duration: number; // minutes
  files?: string[];
  thumbnails?: string[];
  materials?: Material[];
  sizes: Size[];
  stitches: {
    [alias: string]: number;
  };
  tutorialLink: string;
  containsNotches: boolean;
  numMissingSeamAllowances: number;
  tips: string;
};

export type Inch = {
  decimal: number;
  fraction: string; // ex. 1-1/4" Note the value will include the quotation mark.
};

export type ChatLogEntry = { role: string; content: string };
