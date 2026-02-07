type StrokeData = {
  strokes: string[];
};

interface StrokeDataFile {
  dimensions: {
    width: number;
    height: number;
  };
  kanji: Record<string, StrokeData>;
}

declare const file: StrokeDataFile;
export default file;
