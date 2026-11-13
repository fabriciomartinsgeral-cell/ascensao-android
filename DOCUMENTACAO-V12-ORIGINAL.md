# ASCENSÃO V12 — Organização, Tutorial e Backups

Atualização **incremental da V11**. Mantém missões, personagem, níveis, títulos, medalhas, hábitos, calendário, portais, academia, finanças, históricos, fotos/GIFs e os temas claro e escuro.

## O que mudou

- Menu lateral: **Dados locais e Drive**, **Tutorial**, **Sair / fazer backup**.
- Cópias JSON completas de dados locais, histórico e imagens/GIFs no IndexedDB.
- Integração opcional com Google Drive via OAuth 2.0 (Google Identity Services) e API do Drive. Os backups ficam em `appDataFolder`, a área privada do aplicativo.
- Envio manual, restauração manual, envio automático enquanto a sessão está conectada e proteção contra conflito de cópias.
- Confirmação personalizada ao usar o botão **Sair / fazer backup**; alerta genérico do navegador quando houver alterações não exportadas, desativável em Configurações e na área de dados.
- Botão separado e acessível para dados locais, sem precisar navegar pelas configurações.
- Calendário: filtro de prioridade, status e tipo de missão; controles de visibilidade para tarefas, hábitos, treinos/metas, indicadores, detalhes e gráficos; tamanho das células; botão de restaurar os filtros.
- Tutorial ilustrado pela interface com passos, atalhos e guias detalhados de personagem, imagens a cada 10 níveis, conquistas, missão diária e semanal, Kanban, hábitos, portais, academia, finanças, calendário e proteção dos dados.

## Como abrir

**Sem nuvem:** abra `ASCENSAO-V12-ABRIR.html` pelo navegador no computador. O HTML único foi feito para não precisar de bibliotecas externas para as funções locais. Em navegadores que bloquearem armazenamento no esquema `file://`, use um servidor local.

**Para usar Google Drive ou instalar como PWA:** abra a pasta do projeto em um servidor localhost ou hospede-a com HTTPS. Exemplo:

```bash
cd ASCENSAO-V12
python -m http.server 8000
```

Abra http://localhost:8000 no Chrome ou Edge. Coloque todos os arquivos do ZIP na mesma pasta para o PWA funcionar corretamente.

## Configurar Google Drive (necessário uma única vez por origem)

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/) e crie um projeto.
2. Em **APIs e serviços**, habilite a **Google Drive API**.
3. Configure o **OAuth consent screen / Tela de consentimento OAuth**. Se o aplicativo permanecer em modo de teste, adicione sua conta em usuários de teste.
4. Crie uma credencial **OAuth Client ID → Web application / Aplicativo da Web**. Nas **Authorized JavaScript origins / Origens JavaScript autorizadas**, cadastre o endereço EXATO de onde abre a aplicação (por exemplo `http://localhost:8000` ou `https://meudominio.com`). *Não adicione um caminho ao final da origem.*
5. Copie o **Client ID** (`...apps.googleusercontent.com`). **Não** copie nem armazene client secret/segredo no arquivo HTML.
6. No aplicativo, abra **Dados locais e Drive**, cole o ID e salve. Clique em **Conectar Google** e autorize o escopo `drive.appdata`.
7. Use **Enviar backup** para gerar a primeira cópia e **Restaurar do Drive** no aparelho onde quiser resgatá-la. Opcionalmente, marque **Enviar automaticamente quando eu alterar dados**.

Os arquivos ficam em uma área especial e oculta do Drive chamada **appDataFolder**, não na pasta visível Meu Drive. A permissão concedida não dá acesso aos demais arquivos do usuário. É necessário estar online para sincronizar.

**Importante:** a autorização Google dura somente durante a sessão e precisa ser renovada quando expirar. O envio automático funciona com o app aberto, internet e autorização ativa. **Esta versão sincroniza snapshots completos, não combina alterações simultâneas entre aparelhos.** Se um dispositivo ou outra sessão modificar a cópia do Drive, o envio automático para e uma decisão manual é solicitada. Em geral, exporte uma cópia local antes de restaurar do Drive.

## Aviso de fechamento: limitação do navegador

O usuário pediu a pergunta: “Atenção, os dados foram salvos no cache do navegador. Deseja salvar as alterações como backup no seu computador?”

Navegadores modernos **não deixam sites mostrar essa frase ou iniciar um download ao fechar a aba**. O botão do menu **Sair / fazer backup** exibe a pergunta exata e, se o usuário escolher **Sim**, gera o download. O evento `beforeunload` pode mostrar apenas uma confirmação **genérica** e não funciona em todos os navegadores, especialmente no celular. A preferência de alerta pode ser desligada.

## Segurança e privacidade

Os dados principais ficam no armazenamento local do navegador e as mídias no IndexedDB. O backup JSON exportado contém informações pessoais **sem criptografia por padrão** (exceto dados antigos que já haviam sido criptografados na área de diário descontinuada). Guarde os arquivos de backup em local seguro. A pasta privada do app no Google Drive é protegida pelas permissões da sua conta Google, mas **não significa criptografia ponta a ponta por este aplicativo**.

Se você já utilizava a V11, exporte seu backup JSON antes de testar a V12. Para restaurar, acesse **Dados locais e Drive → Restaurar backup JSON**. O importador continua aceitando backups do ASCENSÃO das versões anteriores compatíveis.

## Validação

- Verificação de sintaxe JavaScript.
- Testes de interface com Chromium, renderização das novas páginas, formulário de preferências, download JSON, filtros do calendário e layout móvel de 390px.
- Testes de backend **simulado** da Google Drive API: criar backup, atualizar, recuperar uma tarefa previamente removida e bloquear sobrescrita automática após mudança remota.

Não foi possível validar uma autorização Google real sem um ID OAuth autorizado, nem a persistência de arquivos `file://` no navegador do usuário. Para sincronização real, siga a configuração acima.

## Referências

- Google Drive `appDataFolder`: https://developers.google.com/workspace/drive/api/guides/appdata
- Google Identity Services (navegadores): https://developers.google.com/identity/oauth2/web/guides/overview
- Restrição para mensagens de fechar página: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
