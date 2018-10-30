export const mapCloudWordsPerYear = (wordData) => {
  return Object.keys(wordData).map(word => ({text: word, value: wordData[word]}))
}

/*
const sortByPopularity = wordData => {
  const sortedArray = Object.keys(wordData)
    .sort((a, b) => wordData[b] - wordData[a])
    .map(key => ( {[key]: wordData[key]} ))
    .slice(0, 20)
  return sortedArray
}
*/