import * as oflo from './node.js';

// -------------- Step 0 --------------
console.time('Add fonts');
await Promise.all([
  oflo.registerFont('assets/Arimo/Arimo-Bold.ttf'),
  oflo.registerFont('assets/Arimo/Arimo-Regular.ttf'),
  oflo.registerFont('assets/Cousine/Cousine-Regular.ttf')
]);
console.timeEnd('Add fonts');
console.log();

// -------------- Step 1 --------------
console.time('Element Tree');
const rootElement = oflo.parse(`
  <div style="font-family: Arimo; font-size: 16px; line-height: 1.4;">
    <span style="background-color: #eee;">
      I <span style="font-family: Cousine;">like</span> to write
      <span style="font-size: 3em;">layout code</span>
    </span>
    <span style="background-color: #ddd;">
      because it is
      <span style="color: #999;">equal parts</span>
      <span style="font-weight: bold;">challenging</span>,
      <span style="font-weight: bold;">fun</span>, and
      <span style="font-weight: bold;">arcane</span>.
    </span>
  </div>
`);
console.timeEnd('Element Tree');
console.log(rootElement.repr(0, 'backgroundColor'));
console.log();

// -------------- Step 2 --------------
console.time('Box Tree');
const blockContainer = oflo.generate(rootElement);
console.timeEnd('Box Tree');
console.log(blockContainer.repr());
console.log();

// -------------- Step 3 --------------
console.time('Layout');
await oflo.layout(blockContainer, 300, 500);
console.timeEnd('Layout');
console.log(blockContainer.repr(0, {containingBlocks: true}));
console.log();

// -------------- Step 4 --------------
console.log('Paint');
console.log(await oflo.paintToHtml(blockContainer));
