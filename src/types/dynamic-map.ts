// this exists to stop TypeScript bitching about adding properties to objects
// which is what I thought programming was mainly about

type DynamicMap = {
  [key: string]: string;
};

export default DynamicMap;
