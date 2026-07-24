
export function incrementScrambleKey(n) {
  return n + 1;
}

export function incrementRotationCount(n) {
  return n + 1;
}

export function toCompactItem(caseStudy) {
  return {
    _id: caseStudy._id,
    title: caseStudy.title,
    mainImage: caseStudy.mainImage?.type === 'image' ? { type: 'image', image: caseStudy.mainImage.image } : null,
  };
}

export function toFullItem(caseStudy) {
  return {
    _id: caseStudy._id,
    title: caseStudy.title,
    uri: caseStudy.uri,
    tags: caseStudy.tags,
    mainImage: caseStudy.mainImage,
  };
}
