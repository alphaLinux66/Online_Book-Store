from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, BookViewSet, CartItemViewSet, ReviewViewSet,
    CustomTokenObtainPairView, UserViewSet, ChatInteractionViewSet, AdminAnalyticsView, CheckoutView,
    RegisterSupplierView, StoreOwnerProfileViewSet, SupplierBookViewSet, BulkOrderViewSet, BulkCheckoutView,
    OrderViewSet, RegisterWriterView, WriterBookViewSet, ChatbotQueryView, ResetPasswordView, WriterAnalyticsView
)

router = DefaultRouter()
router.register(r'books', BookViewSet)
router.register(r'cart', CartItemViewSet, basename='cart')
router.register(r'my-orders', OrderViewSet, basename='my-orders')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'users', UserViewSet, basename='user')
router.register(r'chat/log', ChatInteractionViewSet, basename='chat-log')
# B2B Router Ends
router.register(r'suppliers', StoreOwnerProfileViewSet, basename='supplier')
router.register(r'supplier-books', SupplierBookViewSet, basename='supplier-book')
router.register(r'bulk-orders', BulkOrderViewSet, basename='bulk-order')
# Writer Router
router.register(r'writer-books', WriterBookViewSet, basename='writer-book')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/register-supplier/', RegisterSupplierView.as_view(), name='auth_register_supplier'),
    path('auth/register-writer/', RegisterWriterView.as_view(), name='auth_register_writer'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin_analytics'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('bulk-checkout/', BulkCheckoutView.as_view(), name='bulk-checkout'),
    path('chatbot/ask/', ChatbotQueryView.as_view(), name='chatbot_ask'),
    path('writer-analytics/', WriterAnalyticsView.as_view(), name='writer_analytics'),
    path('', include(router.urls)),
]
