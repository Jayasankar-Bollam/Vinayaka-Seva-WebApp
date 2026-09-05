// server/utils/slugify.js
function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')  // replace any non-alphanumeric run with a single hyphen
    .replace(/(^-|-$)+/g, '');    // trim leading/trailing hyphens
}

module.exports = slugify;