const TRANSACTIONAL_TYPES = new Set(['LIKE', 'COMMENT', 'MENTION']);

function getPriority(eventType) {
  return TRANSACTIONAL_TYPES.has(eventType) ? 'transactional' : 'promotional';
}

export {
    getPriority
}