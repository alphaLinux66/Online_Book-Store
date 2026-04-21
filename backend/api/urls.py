from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, BookViewSet, CartItemViewSet, ReviewViewSet,
    CustomTokenObtainPairView, UserViewSet, ChatInteractionViewSet, AdminAnalyticsView, CheckoutView
)

router = DefaultRouter()
router.register(r'books', BookViewSet)
router.register(r'cart', CartItemViewSet, basename='cart')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'users', UserViewSet, basename='user')
router.register(r'chat/log', ChatInteractionViewSet, basename='chat-log')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin_analytics'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('', include(router.urls)),
]
