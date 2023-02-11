import fs from 'node:fs';
import http from 'node:http';
import { Builder } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox';

interface Options {
  height: number;
  pngPath: string;
  svgPath: string;
  width: number;
}

const getPNG = (pngDataUrl: string): string => {
  return pngDataUrl.substring('data:image/png;base64,'.length);
};

// data:image/png;base64,...
const getPNGDataURL = (
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
  }).then((v) => {
    if (typeof v === 'undefined') {
      throw new Error();
    } else {
      return v;
    }
  });
};

// data:image/svg+xml;base64,...
const getSVGDataURL = async (svg: string): Promise<string> => {
  const svgEncoded = Buffer.from(svg, 'utf8').toString('base64');
  return await Promise.resolve('data:image/svg+xml;base64,' + svgEncoded);
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

const runServer = (
  callback: (port: number) => Promise<string>
): Promise<string | undefined> => {
  return new Promise((resolve, reject) => {
    const server = http.createServer((_, res) => res.end());
    const close = (v?: string): void => {
      server.close((error) => {
        if (typeof error !== 'undefined') reject(error);
        else resolve(v);
      });
    };
    server.listen(() => {
      const address = server.address();
      if (typeof address === 'string') {
        return close();
      } else if (address === null) {
        return close();
      } else {
        return callback(address.port).then((v) => close(v), () => close());
      }
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
  fs.writeFileSync(options.pngPath, png, { encoding: 'base64' });
};

main();
