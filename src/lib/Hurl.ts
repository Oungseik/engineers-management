export function hurl(strings: TemplateStringsArray, ...expressions: (string | number | boolean)[]) {
  return strings.reduce((acc, str, i) => acc + str + (expressions.at(i) ?? ""), "");
}

