from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    if isinstance(response.data, dict):
        message = response.data.get("detail", "Request could not be processed.")
        errors = response.data
    else:
        message = "Request could not be processed."
        errors = {"detail": response.data}

    response.data = {
        "success": False,
        "message": str(message),
        "errors": errors,
    }
    return response
