# Export retry proposal

Export a customer's records to a downloadable file. On a transient storage failure, retry at most twice after the first attempt, waiting one second between attempts. On the third failure, mark the export failed and show a retry button. Each user retry creates a new export request. Authorization failures are terminal and are not retried.

Scope excludes scheduled exports. Acceptance checks cover initial success, transient recovery, exhausted retries and authorization failure. The existing export API accepts a request ID and already supports idempotent writes within one request.
