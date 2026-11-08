# Design

Use POST /exports for export creation; do not use GET /exports/create. Create a unique request ID for each logical export request and reuse that same ID for all timeout retries; a user retry creates a new logical request and ID. Retry timeouts twice with one second between attempts, then show a terminal failure and a retry button. Authentication failures are terminal. JSON fields are customer ID and display name, access restricted to the requesting customer; links expire after one hour and files are deleted then. Synchronous response returns the link on success.
