from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Livro, Emprestimo

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"]
        )

class LivroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Livro
        fields = ["id", "titulo", "autor", "ano", "status"]
        read_only_fields = ["status"]  # usuário não pode alterar direto

class EmprestimoSerializer(serializers.ModelSerializer):
    livro_titulo = serializers.CharField(source="livro.titulo", read_only=True)
    livro_autor = serializers.CharField(source="livro.autor", read_only=True)
    livro_ano = serializers.IntegerField(source="livro.ano", read_only=True)

    class Meta:
        model = Emprestimo
        fields = [
            'id',
            'livro',
            'livro_titulo',
            'livro_autor',
            'livro_ano',
            'data_emprestimo',
            'prazo_dias',
            'usuario'
        ]
        read_only_fields = ['usuario']
