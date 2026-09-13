import fs from 'fs';
const c = fs.readFileSync('public/test_avatar_scaled.svg', 'utf8');
const paths = [...c.matchAll(/<path([^>]+)\/>/g)].map(m => m[1]);
console.log('Total paths:', paths.length);
paths.forEach((p, idx) => {
  const fill = p.match(/fill="([^"]+)"/)?.[1];
  const trans = p.match(/transform="([^"]+)"/)?.[1];
  console.log(idx, fill, trans);
});
