# Design

Use POST /exports with a unique request ID per logical export request, reused unchanged for all timeout retries of that request. Retry timeouts twice with one second between attempts, then show a terminal failure and a retry button. User retry creates a new logical request with a new request ID. Authentication failures are terminal. JSON fields are customer ID and display name, access restricted to the requesting customer; links expire after one hour and files are deleted then. Synchronous response returns the link on success.
