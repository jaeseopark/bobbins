export type Material = { name: string; notes?: string; url?: string };

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
  sizes: {
    alias: string;
    dimensions: number[];
  }[];
  stitches: {
    [alias: string]: number;
  };
  tutorialLink: string;
  containsNotches: boolean;
  numMissingSeamAllowances: number;
  seamAllowance: number;
  topStitch: number;
  basteStitch: number;
};

export type Inch = {
  decimal: number;
  fraction: string; // ex. 1-1/4" Note the value will include the quotation mark.
};

export type ChatLogEntry = { role: string; content: string };
