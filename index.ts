import fs from 'fs';
import { Builder } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox';
import http from 'http';

interface Options {
  height: number;
  pngPath: string;
  svgPath: string;
  width: number;
}

const getPNG = (pngDataUrl: string): Buffer => {
  const pngEncoded = pngDataUrl.substring('data:image/png;base64,'.length);
  const png = Buffer.from(pngEncoded, 'base64');
  return png;
};

// data:image/png;base64,...
const getPNGDataURL = async (
  svgDataUrl: string,
  width: number,
  height: number
): Promise<string> => {
  return runServer(async (port) => {
    const driver =
      new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(new firefox.Options().headless())
        .build();
    await driver.get('http://localhost:' + port);
    const pngDataUrl = await driver.executeAsyncScript(
      [
        'const svgDataUrl = "' + svgDataUrl + '";',
        'const callback = arguments[arguments.length - 1];',
        'const canvas = document.createElement("canvas");',
        'const image = new Image();',
        'image.onload = () => {',
        '  canvas.height = ' + height + ';',
        '  canvas.width = ' + width + ';',
        '  context = canvas.getContext("2d");',
        '  context.drawImage(image, 0, 0, canvas.width, canvas.height);',
        '  callback(canvas.toDataURL("image/png"))',
        '};',
        'image.src = svgDataUrl;'
      ].join('\n')
    );
    if (
      typeof pngDataUrl !== 'string' ||
      !pngDataUrl.startsWith('data:image/png;base64,')
    ) throw new Error('unknown format');
    return pngDataUrl;
  });
};

// data:image/svg+xml;base64,...
const getSVGDataURL = async (svg: string): Promise<string> => {
  const svgEncoded = Buffer.from(svg, 'utf8').toString('base64');
  return 'data:image/svg+xml;base64,' + svgEncoded;
};

const parseOptions = (): Options => {
  const args = process.argv.slice(2);
  if (args.length < 4) throw new Error('<svg> <width> <height> <png>');
  const svgPath = args[0];
  const width = parseInt(args[1], 10);
  const height = parseInt(args[2], 10);
  const pngPath = args[3];
  if (Number.isNaN(height)) throw new Error('height is NaN');
  if (Number.isNaN(width)) throw new Error('width is NaN');
  return { height, pngPath, svgPath, width };
};

const runServer = <T>(
  callback: (port: number) => Promise<T>
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const server = http.createServer((_, res) => res.end());
    const close = (v?: T): void => {
      server.close((error) => {
        if (typeof error !== 'undefined') reject(error);
        else resolve(v);
      });
    };
    server.listen(() => {
      const port = (server.address() as any).port;
      Promise.resolve()
        .then(() => callback(port))
        .then((v) => close(v), () => close());
    });
  });
};

const main = async (): Promise<void> => {
  const options = parseOptions();
  const svg = fs.readFileSync(options.svgPath, { encoding: 'utf8' });
  const svgDataUrl = await getSVGDataURL(svg);
  const pngDataUrl = await getPNGDataURL(
    svgDataUrl, options.width, options.height
  );
  const png = getPNG(pngDataUrl);
  fs.writeFileSync(options.pngPath, png, { encoding: 'buffer' });
};

main();
