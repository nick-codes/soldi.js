export function mergeTags(string = '', tags) {
  for (const tag in tags) {
    string = string.replace(`{{${tag}}}`, tags[tag]);
  }
  return string;
}

export function getPath(data, path) {
  const paths = path.split('.');
  let exchange = data;
  // Provide a more helpful error to developers when this fails
  try {
    paths.forEach(p => {
      exchange = exchange[p];
    });
  } catch(err) {
    throw new Error(`Unable to read ${path} from ${JSON.stringify(data)} : ${err}`);
  }
  return exchange;
}

// Work around lack of mocking support in jest with ESM modules
// https://github.com/facebook/jest/issues/10025
let mockResult;
export const getJSON = function(from, to, options) {
  if (mockResult) {
    return Promise.resolve(mockResult);
  }
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.addEventListener('load', function() {
      resolve(JSON.parse(request.responseText));
    });
    request.addEventListener('abort', function(err) {
      reject(new Error('Request aborted: ' + err));
    });
    request.addEventListener('error', function(err) {
      reject(new Error('Unknown network error: ' + err));
    });
    Object.keys(options.headers).forEach(header => {
      const value = options.headers[header];
      request.setRequestHeader(header, value);
    });
    request.open('GET', mergeTags(options.endpoint, { from, to }), true);
    request.send();
  });
};
getJSON.mockResolvedValue = (value) => mockResult = value;
