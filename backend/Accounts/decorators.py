from django.shortcuts import redirect

def librarian_required(view_func):
    def wrapper(request,*args,**kwargs):
        if request.user.is_authenticated and (request.user.is_librarian or request.user.is_superuser):
            return view_func(request,*args,**kwargs)
        else:
            return redirect('accounts:login') # Redirect to login if not a librarian
    return wrapper

def member_required(view_func):
    def wrapper(request,*args,**kwargs):
        if request.user.is_authenticated and request.user.is_member:
            return view_func(request,*args,**kwargs)
        else:
            return redirect('accounts:login') # Redirect to login if not a member
    return wrapper