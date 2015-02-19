import parseQueryParams from 'utils/parse-query-params';

export default function() {
    return parseQueryParams(window.location.search);
}
