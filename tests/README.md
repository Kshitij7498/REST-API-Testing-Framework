# Test strategy

The Postman collection includes assertions for:
- status codes and JSON response content
- response shape and primitive data types
- unauthenticated and invalid-token requests
- missing/invalid request fields
- create → read → update → delete workflow
- not-found behavior after deletion
- malformed JSON body handling

The collection is deliberately ordered because later requests reuse the item ID created earlier.
