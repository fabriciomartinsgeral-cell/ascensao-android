# ASCENSÃO V12 — Guia rápido para GitHub

Este ZIP contém o projeto Android Capacitor, **organizado na raiz de um repositório**.

## IMPORTANTE: não envie o ZIP fechado como único arquivo!

O GitHub Actions só reconhece o projeto se `.github/workflows/gerar-apk.yml`, `package.json`, `scripts/` e `www/` estiverem na **raiz** do repositório.

### Publicar pelo site do GitHub

1. Acesse https://github.com/new e crie o repositório privado `ascensao-android` com branch `main`. Se possível, **não marque** as opções para criar README, `.gitignore` ou licença (o pacote já tem documentação).
2. No computador, **extraia o ZIP** recebido.
3. Abra o repositório no GitHub e clique em **Add file → Upload files**.
4. Arraste para a página **todos os arquivos e pastas extraídos**, inclusive a pasta oculta **`.github`**. Não arraste o ZIP fechado e não crie uma pasta extra envolvendo o projeto.
5. Confirme a inclusão dos arquivos (Commit changes).
6. Verifique que há um arquivo no endereço `.github/workflows/gerar-apk.yml` e um `package.json` diretamente na raiz.
7. Abra **Actions → Gerar APK Android (teste) → Run workflow**. Aguarde a execução terminar.
8. Na execução finalizada, baixe o artefato `ASCENSAO-V12-Android-APK`. Extraia o `app-debug.apk` e transfira-o ao celular Android para instalar.

### Alternativa: enviar via Git no computador

Abra um terminal dentro da pasta extraída e execute:

```bash
git init -b main
git add .
git commit -m "ASCENSÃO V12: projeto Android com Capacitor"
git remote add origin https://github.com/SEU-USUARIO/ascensao-android.git
git push -u origin main
```

Substitua `SEU-USUARIO` pelo seu usuário do GitHub. A autenticação pode ser solicitada pelo Git Credential Manager ou por um token; **não** grave senhas ou tokens dentro do repositório.

### Importante sobre o APK

- O APK gerado é **debug**, para testes, e não é apropriado para publicação na Play Store.
- Cada compilação pode ser assinada com uma chave debug diferente. **Faça backup dos dados antes de desinstalar ou atualizar**, porque a atualização pode exigir reinstalação.
- O Google Drive do Android não está sincronizando automaticamente: use o compartilhamento do backup JSON para salvar uma cópia.
- O build depende da execução no GitHub; a compilação não pôde ser executada neste ambiente.

Para detalhes e compilação no computador, leia `README.md`.
