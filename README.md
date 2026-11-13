# ASCENSÃO V12 — Projeto Android (Capacitor 8)

Este pacote aproveita o **HTML original da V12**, adicionando um adaptador Android para backups e um processo de compilação. A interface e as regras de XP, missões, hábitos, portais e academia não foram reconstruídas.

## Estado atual

- **Projeto de build:** preparado. O projeto `android/` é criado pelo Capacitor após instalar dependências.
- **APK:** não incluído. Este ambiente não dispõe de Android SDK nem acesso ao npm para compilá-lo. Você gera o APK seguindo as instruções abaixo ou pelo GitHub Actions.
- **APK de teste (`debug`):** adequado para instalação manual, **não** para envio à Play Store.
- **Armazenamento:** local na WebView do APK, diferente do navegador onde você usava a V12.
- **Backup Android:** o botão de backup usa Capacitor Filesystem + Share. Ao tocar, escolha **Arquivos**, **Google Drive** ou outra opção na tela de compartilhamento. Não feche essa tela antes de salvar.
- **Google Drive automático:** não funciona no APK nesta etapa. O OAuth para web da V12 não é aceito em WebViews nativas. Requer um fluxo OAuth nativo específico ou backend. A interface do APK explica isso, e o login web fica desativado.

## Caminho A — Compilar online com GitHub Actions (sem Android Studio)

1. Crie um repositório **privado** no https://github.com/.
2. Extraia este ZIP e envie **o conteúdo da pasta do projeto** para a raiz do repositório (incluindo a pasta oculta `.github`). A pasta `www` deve ficar na raiz.
3. Acesse a aba **Actions** do repositório e ative os workflows, se solicitado.
4. Selecione **Gerar APK Android (teste)** e clique em **Run workflow**. Se o workflow não aparecer, confirme que o arquivo `.github/workflows/gerar-apk.yml` está na branch `main`.
5. Após o build terminar, abra a execução e baixe o artefato **ASCENSAO-V12-Android-APK**. Ele virá em ZIP; extraia o arquivo `app-debug.apk`.
6. Transfira o APK para o Android e abra para instalar. Se o Android pedir, habilite instalar aplicativos desta origem. Confira o nome e a origem do arquivo.

**Atenção às atualizações:** cada compilação `debug` no GitHub pode ser assinada com uma chave de teste diferente. Por isso, um APK novo pode não instalar por cima do anterior. **Antes de desinstalar ou trocar o APK, exporte um backup JSON para fora do aplicativo.** Para atualizações futuras sem perda de dados, será necessário configurar uma chave de assinatura persistente e protegida.

**Nota:** o workflow usa Internet para obter dependências e Android SDK. Falhas por atualização de ferramentas podem exigir ajustes. O projeto foi verificado estruturalmente, mas o build real depende da execução no GitHub ou Android Studio.

## Caminho B — Compilar no computador

### Pré-requisitos

- Node.js **22 ou superior** e npm.
- Android Studio compatível com Capacitor 8; Android SDK e uma plataforma Android instalada.
- JDK 21 (o Android Studio oferece um JDK integrado).

Na pasta extraída, execute:

```bash
npm install
npm run android:init
npm run android:apk
```

O APK resultante estará em:

`android/app/build/outputs/apk/debug/app-debug.apk`

Para trabalhar visualmente no Android Studio:

```bash
npm run android:open
```

Você pode executar `npm run android:sync` após editar arquivos em `www/` para copiá-los ao projeto Android. O ícone do ASCENSÃO é aplicado na inicialização e sincronização. A aparência exata do ícone adaptativo pode variar com o launcher.

## Arquivos do projeto

- `www/index.html` — aplicativo V12, com registro de service worker desativado **somente para o APK**.
- `www/android-backup.js` — adaptador de exportação do backup para o compartilhamento Android.
- `www/icon-192.png`, `www/icon-512.png` — ícones originais.
- `capacitor.config.json` — identificador e configuração do aplicativo Android.
- `scripts/` — comandos de geração, sincronização, ícone e build.
- `.github/workflows/gerar-apk.yml` — compilação em nuvem de APK de teste.
- `DOCUMENTACAO-V12-ORIGINAL.md` — documentação do app anterior.

## Importar os dados da V12 do navegador

**Instalar o APK não importa os dados do Chrome automaticamente.** No HTML V12 antigo, acesse **Dados locais e Drive → Salvar backup** e guarde o JSON. Depois de instalar o APK, abra **Dados locais e Drive → Restaurar backup JSON** e selecione o arquivo. O JSON contém dados pessoais; evite compartilhá-lo publicamente.

**Atenção:** é importante guardar o arquivo JSON fora do armazenamento do app, pois apagar/desinstalar o aplicativo pode apagar os dados locais. O backup é uma ação do usuário: selecione um destino e confirme que o arquivo foi salvo. O APK de teste é assinado com chave de desenvolvimento, não use para distribuir na Play Store.

## Para publicar na Google Play no futuro

Será necessário criar uma assinatura de produção, configurar versão e ID de pacote definitivos, gerar um **AAB** assinado e preparar política de privacidade e formulário de segurança de dados. Atualmente o `appId` é `com.ascensao.pessoal` (substitua por um identificador exclusivo antes de publicar).

## Segurança e conectividade

- Nenhum servidor próprio foi adicionado.
- O conteúdo local não é criptografado automaticamente pela V12 (exceto dados que já eram criptografados). O JSON de backup deve ser protegido.
- O login Google feito dentro de Android WebView não é suportado pelas políticas OAuth. Use o compartilhamento de backup para Drive enquanto preparamos uma implementação nativa.
- O pacote mantém o escopo de Internet do app para links/documentação e futuras integrações; isso não significa sincronização automática.

## Fontes oficiais

- https://capacitorjs.com/docs/getting-started
- https://capacitorjs.com/docs/android
- https://capacitorjs.com/docs/apis/filesystem
- https://capacitorjs.com/docs/apis/share
- https://developers.google.com/identity/siwg/best-practices
