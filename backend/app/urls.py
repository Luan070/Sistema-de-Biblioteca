from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LivroViewSet, EmprestimoViewSet, register

router = DefaultRouter()
router.register(r'livros', LivroViewSet, basename='livro')
router.register(r'emprestimos', EmprestimoViewSet, basename='emprestimo')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register, name='register'),
]

