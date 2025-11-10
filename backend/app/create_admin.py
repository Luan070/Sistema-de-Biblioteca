from django.contrib.auth.models import User
from django.db.utils import OperationalError, ProgrammingError

def create_admin_user():
    try:
        # Verifica se o admin já existe
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser(
                username="admin",
                email="admin@biblioteca.com",
                password="admin123"
            )
            print("✅ Usuário admin criado com sucesso (admin / admin123)!")
        else:
            print("⚙️ Usuário admin já existe.")
    except (OperationalError, ProgrammingError):
        # Ignora erros se o banco ainda não estiver migrado
        pass
