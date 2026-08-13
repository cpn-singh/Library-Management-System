def success_response(data,message='Success', code=200):
    return {
        'success': True,
        'message': message,
        'data': data,
    },code

def error_response(message='Error', code=400):
    return {
        'success': False,
        'message': message,
    },code

