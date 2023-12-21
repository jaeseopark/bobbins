export type Product = {
  id: string;
  name: string;
  date: number; // date designed in epoch ms.
  introduction?: string;
  keywords: string[];
  duration: number; // minutes
  files?: string[];
  thumbnails?: string[];
  materials?: [{ name: string; notes?: string; url?: string }];
  sizes: {
    [key: string]: number[]
  };
  tutorialLink: string;
};

export type Inch = {
  decimal: number;
  fraction: string; // ex. 1-1/4" Note the value will include the quotation mark.
};
