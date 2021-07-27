module.exports = {
  "packages/core/src/**/*.js": ["cd packages/core && yarn lint"],
  "packages/dinero/src/**/*.js": ["cd packages/dinero && yarn lint"],
  "packages/locale/src/**/*.js": ["cd packages/locale && yarn lint"],
  "packages/format-dinero/src/**/*.js": ["cd packages/format-dinero && yarn lint"],
};