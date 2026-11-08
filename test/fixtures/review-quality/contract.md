# Existing export API

The export API is POST /exports. It requires a unique request ID. Reusing a request ID returns the same export and does not create another write. The API does not support GET /exports/create.
