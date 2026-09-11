export function replaceBlock(text, name, body) {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!pattern.test(text)) {
    throw new Error(`README has no "${name}" block — expected ${start} … ${end}`);
  }
  return text.replace(pattern, `${start}\n${body}\n${end}`);
}
