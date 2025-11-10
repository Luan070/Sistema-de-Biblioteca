from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

User = get_user_model()

class LivroViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        from .serializers import LivroSerializer
        return LivroSerializer

    def get_queryset(self):
        from .models import Livro
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return Livro.objects.all()

        livros_disponiveis = Livro.objects.filter(status='disponivel')
        livros_emprestados_por_mim = Livro.objects.filter(emprestimos__usuario=user)

        return (livros_disponiveis | livros_emprestados_por_mim).distinct()

from rest_framework.decorators import action
from rest_framework.response import Response

class EmprestimoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        from .serializers import EmprestimoSerializer
        return EmprestimoSerializer

    def get_queryset(self):
        from .models import Emprestimo
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Emprestimo.objects.all()
        return Emprestimo.objects.filter(usuario=user)

    def perform_create(self, serializer):
        from .models import Livro
        livro = serializer.validated_data.get('livro')

        if livro.status != 'disponivel':
            raise ValidationError({'livro': 'Livro já está emprestado.'})

        livro.status = 'emprestado'
        livro.save()
        serializer.save(usuario=self.request.user)

    # ✅ NOVA FUNÇÃO DE DEVOLVER
    @action(detail=True, methods=['POST'])
    def devolver(self, request, pk=None):
        from .models import Emprestimo
        emprestimo = self.get_object()  # pega só do usuário
        livro = emprestimo.livro

        livro.status = "disponivel"
        livro.save()
        emprestimo.delete()

        return Response({"status": "Livro devolvido com sucesso!"})

@api_view(['POST'])
@permission_classes([AllowAny])   # <- LIBERA CADASTRO
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'status': 'Usuário criado com sucesso!'})
    return Response(serializer.errors, status=400)
