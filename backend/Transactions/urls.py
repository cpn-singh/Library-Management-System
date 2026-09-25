from django.urls import path
from . import views

urlpatterns = [
    path('transactions/loans/', views.api_loans_list, name='api_loans_list'),
    path('transactions/borrow/', views.api_borrow_book, name='api_borrow_book'),
    path('transactions/loans/<int:pk>/return/', views.api_return_book, name='api_return_book'),
    path('transactions/loans/<int:pk>/renew/', views.api_renew_loan, name='api_renew_loan'),
    path('transactions/fines/', views.api_fines_list, name='api_fines_list'),
    path('transactions/fines/<int:pk>/pay/', views.api_pay_fine, name='api_pay_fine'),
    path('transactions/fines/<int:pk>/waive/', views.api_waive_fine, name='api_waive_fine'),
    path('transactions/logs/', views.api_activity_logs, name='api_activity_logs'),
]
