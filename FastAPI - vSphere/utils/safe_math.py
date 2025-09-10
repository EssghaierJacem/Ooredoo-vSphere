def safe_div(a, b, default=0.0):
    a = 0 if a is None else a
    b = 0 if b is None else b
    return default if b == 0 else a / b
