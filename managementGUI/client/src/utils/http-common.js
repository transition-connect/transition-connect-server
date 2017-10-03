import axios from 'axios';

// disable IE ajax request caching
axios.defaults.headers.get['If-Modified-Since'] = '0';

export const HTTP = axios.create({
});
