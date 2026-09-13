import { createParser } from "nuqs";

export const parseAsSet = createParser({
  parse(queryValue) {
    return new Set(queryValue.split(",").filter((item) => item !== ""));
  },
  serialize(value) {
    return Array.from(value)
      .filter((item) => item !== "")
      .join(",");
  },
});
