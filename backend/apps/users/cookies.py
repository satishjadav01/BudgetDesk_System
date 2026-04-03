from django.conf import settings


def set_auth_cookies(response, access, refresh):
    response.set_cookie(
        "access_token",
        str(access),
        httponly=True,
        secure=settings.JWT_COOKIE_SECURE,
        samesite=settings.JWT_COOKIE_SAMESITE,
        max_age=60 * 30,
        path="/",
    )
    response.set_cookie(
        "refresh_token",
        str(refresh),
        httponly=True,
        secure=settings.JWT_COOKIE_SECURE,
        samesite=settings.JWT_COOKIE_SAMESITE,
        max_age=60 * 60 * 24 * 7,
        path="/",
    )


def clear_auth_cookies(response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
