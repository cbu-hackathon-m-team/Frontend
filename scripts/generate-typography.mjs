import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(root,'src/styles/typography.css'),'utf8');
const metadata = {

  'type-display-md': 'Display M',
  'type-landing-hero': 'Landing Hero',
  'type-landing-heading': 'Landing Heading',
  'type-landing-title': 'Landing Title',
  'type-landing-lead': 'Landing Lead',
  'type-landing-body': 'Landing Body',
  'type-heading-xl': 'Heading XL',
  'type-heading-lg': 'Heading L',
  'type-heading-md': 'Heading M',
  'type-heading-sm': 'Heading S',
  'type-heading-xs': 'Heading XS',
  'type-body-md': 'Body M',
  'type-body-md-medium': 'Body M Medium',
  'type-body-sm': 'Body S',
  'type-body-xs': 'Body XS',
  'type-body-xs-medium': 'Body XS Medium',
  'type-label-xl': 'Label XL',
  'type-label-lg': 'Label L',
  'type-label-md': 'Label M',
  'type-label-sm': 'Label S',
  'type-label-xs': 'Label XS',
  'type-eyebrow-xs': 'Eyebrow XS',
  'type-caption-xs': 'Caption XS',
  'type-metric-lg': 'Metric L',
  'type-metric-lg-semibold': 'Metric L Semibold',
  'type-metric-md': 'Metric M',
  'type-metric-sm': 'Metric S',
  'type-metric-sm-tight': 'Metric S Tight',
  'type-code-md': 'Code M',
  'type-code-sm': 'Code S',
};
const tokens=[];
const declarations = body => Object.fromEntries([...body.matchAll(/([\w-]+):\s*([^;]+);/g)].map(m=>[m[1],m[2].trim()]));
const format = props => `${props['font-size'].replace('px','')} / ${props['line-height'].replace('px','')} · ${props['font-weight']} · ${props['letter-spacing'] ?? '0'}`;
for (const match of css.matchAll(/@utility (type-[\w-]+)\s*\{/g)) {
  const className=match[1];
  const start=match.index+match[0].length;
  let end=start, depth=1;
  for (; end<css.length && depth; end++) {
    if(css[end]==='{') depth++;
    if(css[end]==='}') depth--;
  }
  if(depth) throw new Error('Unclosed typography utility: '+className);
  const body=css.slice(start,end-1);
  if(!metadata[className]) throw new Error('Missing typography metadata: '+className);
  // Typography supports base declarations and one-level media overrides.
  const mediaPattern=/@media\s+([^{}]+)\{([^{}]*)\}/g;
  const base=body.replace(mediaPattern,'');
  if(/[{}]/.test(base)) throw new Error('Unsupported typography nesting: '+className);
  const props=declarations(base);
  const responsive=[...body.matchAll(mediaPattern)].map(([,query,overrides])=>({
    query:query.trim(), value:format({...props,...declarations(overrides)}),
  }));
  const name=metadata[className];
  const sample=name;
  tokens.push({name,value:format(props),responsive,sample,className,previewClassName:`${className} text-interface-default`});
}
if(tokens.length!==Object.keys(metadata).length) throw new Error('Missing CSS typography definitions');
// Catalog and documentation follow the role hierarchy, independent of CSS declaration order.
const order = Object.keys(metadata);
tokens.sort((a, b) => order.indexOf(a.className) - order.indexOf(b.className));
// Reviewed TableCell default: font weight 400 is inherited in the product.
// Document this as Body M (400), separate from Body M Medium (500).
const tableSource = fs.readFileSync(path.join(root, 'src/components/ui/table.tsx'), 'utf8');
const tableCellSource = tableSource.slice(tableSource.indexOf('function TableCell('), tableSource.indexOf('function TableCaption('));
if (!tableCellSource.includes('text-[13px] leading-5 text-interface-secondary')) {
  throw new Error('TableCell typography changed; review the Body M specimen.');
}
const output='// Generated from CSS for typography roles: pnpm typography:generate.\n'
  +'export const typeTokens = '+JSON.stringify(tokens,null,2)+' as const\n';
const target=path.join(root,'src/pages/design-system/_data/typography.generated.ts');
const designPath = path.join(root, 'DESIGN.md');
const design = fs.readFileSync(designPath, 'utf8').replace(/\r\n/g, '\n');
const tablePattern = /<!-- typography:start -->[\s\S]*?<!-- typography:end -->/;
if (!tablePattern.test(design)) throw new Error('DESIGN.md is missing its generated typography block.');
const markdown = ['<!-- typography:start -->', '| Role | Class | Size / line height · weight · tracking |', '| --- | --- | --- |',
  ...tokens.map(token => `| ${token.name} | \`${token.className}\` | ${[token.value,...token.responsive.map(item=>`${item.query}: ${item.value}`)].join('<br>')} |`), '<!-- typography:end -->'].join('\n');
const updatedDesign = design.replace(tablePattern, markdown);
if(process.argv.includes('--check')) {
  if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==output) throw new Error('Typography inventory is stale. Run pnpm typography:generate.');
  if (design !== updatedDesign) throw new Error('DESIGN.md typography is stale. Run pnpm typography:generate.');
} else {
  fs.writeFileSync(target,output);
  if (design !== updatedDesign) fs.writeFileSync(designPath, updatedDesign);
}
console.log(`Typography: ${tokens.length} roles. CSS, catalog and DESIGN.md verified.`);
