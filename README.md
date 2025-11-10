
Projeto: Biblioteca (Frontend + Backend Django)

Estrutura:
- frontend/: HTML/CSS/JS (consome a API)
- backend/: Django project com app configurado

IMPORTANTE:
- O arquivo backend/biblioteca_api/settings.py está configurado com:
    USER = 'Luan'
    PASSWORD = 'SENHA_DO_BANCO_AQUI'
  Substitua 'SENHA_DO_BANCO_AQUI' pela sua senha real antes de rodar.

Como rodar (backend):
1) Crie o banco PostgreSQL 'biblioteca_db' (ou ajuste o nome em settings.py)
2) No ambiente virtual: pip install -r backend/requirements.txt
3) python manage.py makemigrations
4) python manage.py migrate
5) python manage.py createsuperuser  # opcional
6) python manage.py runserver

Frontend:
- Abra frontend/index.html no navegador.

Observação de segurança:
- Por segurança o arquivo foi gerado com a senha placeholder. Substitua localmente.
