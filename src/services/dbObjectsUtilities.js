export function extractAllWithId(query) {
  return _.map(query.docs, $ => ({id: $.id, ...$.data()}));
}

export function extractWithId(query) {
  return {id: query.id, ...query.data()};
}

export function omitId(object) {
  return _.omit(object, "id");
}