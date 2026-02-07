import stroke_data from './stroke_data.json';

export type WriterOptions = {
  kanji: string;
  strokeStyle?: string;
  lineWidth?: number;
  lineJoin?: CanvasLineJoin;
  lineCap?: CanvasLineCap;
  strokeDelay?: number;
  strokeDuration?: number;
  loop?: boolean;
};

const sourceDimensions = stroke_data.dimensions;

export const createWriter = (canvas: HTMLCanvasElement, options: WriterOptions) => {
  const {kanji, lineWidth, lineJoin, lineCap, strokeStyle, strokeDelay, strokeDuration, loop} = {
    strokeStyle: 'black',
    lineWidth: 5,
    lineJoin: 'round',
    lineCap: 'round',
    strokeDelay: 200,
    strokeDuration: 500,
    loop: true,
    ...options,
  } satisfies WriterOptions;

  const strokes = getKanjiStrokes(kanji);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D context not available on this browser');
  }
  const paths = strokes.map(stroke => new Path2D(stroke));
  const svgPaths = strokes.map(stroke => {
    const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svgPath.setAttribute('d', stroke);
    return svgPath;
  });

  let nextStrokeTime = 0;
  let currentStroke = 0;
  let currentStrokeStartTime = 0;

  const renderLoop = (ctx: CanvasRenderingContext2D, timestamp: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (nextStrokeTime <= timestamp) {
      currentStroke++;

      if (currentStroke >= strokes.length) {
        if (loop) {
          currentStroke = 0;
        } else {
          return;
        }
      }
      nextStrokeTime = timestamp + strokeDuration + strokeDelay;
      currentStrokeStartTime = timestamp;
    }
    ctx.save();
    ctx.scale(ctx.canvas.width / sourceDimensions.width, ctx.canvas.height / sourceDimensions.height);
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = lineJoin;
    ctx.lineCap = lineCap;
    for (let i = 0; i < currentStroke; i++) {
      ctx.stroke(paths[i]!);
    }
    ctx.save();
    ctx.beginPath();
    const svgPath = svgPaths[currentStroke]!;
    const totalDistance = svgPath.getTotalLength();
    const strokeProgress = Math.min((timestamp - currentStrokeStartTime) / strokeDuration, 1.0);
    if (strokeProgress < 1) {
      for (let i = 0; i < 20; i++) {
        const pointDistance = totalDistance * strokeProgress * (i / 20);
        const {x, y} = svgPath.getPointAtLength(pointDistance);
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
      }
      ctx.clip();
    }

    ctx.stroke(paths[currentStroke]!);

    ctx.restore();
    ctx.restore();

    requestAnimationFrame(timestamp => renderLoop(ctx, timestamp));
  };

  renderLoop(ctx, 0);
};

const getKanjiStrokes = (kanji: string): string[] => {
  if (!(kanji in stroke_data.kanji)) {
    throw new Error(`Kanji ${kanji} is not supported`);
  }
  const strokes = stroke_data.kanji[kanji]!.strokes;
  return strokes;
};
