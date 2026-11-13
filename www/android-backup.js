/* ASCENSÃO V12 - adaptador Android Capacitor.
 * Só atua quando o app é executado na WebView nativa do Capacitor.
 * Não envia dados para servidores e não altera o formato do backup.
 */
(function () {
  'use strict';
  const cap = window.Capacitor;
  if (!cap || typeof cap.isNativePlatform !== 'function' || !cap.isNativePlatform()) return;

  // OAuth GIS para web não pode ser executado dentro do Android WebView.
  // A integração nativa com Drive requer uma futura etapa usando login externo.
  const driveNotice = 'No aplicativo Android, o login Google da versão web não é compatível com WebView. ' +
    'Use "Salvar backup" e escolha Google Drive (ou Arquivos) na tela de compartilhamento. ' +
    'A sincronização automática do Drive necessita de integração OAuth nativa.';

  if (typeof window.v12DataPage === 'function') {
    const originalDataPage = window.v12DataPage;
    window.v12DataPage = function () {
      const html = originalDataPage.apply(this, arguments);
      return html.replace(
        '<h2>Google Drive <span class="v12-badge">Opcional</span></h2>',
        '<h2>Google Drive <span class="v12-badge">Modo Android</span></h2>' +
        '<div class="v12-warning" role="note"><b>Backup pelo Android:</b> salve o backup e escolha Google Drive no menu de compartilhamento. ' +
        'O botão Conectar Google é apenas para a versão web; a sincronização automática ainda não funciona no APK.</div>'
      ).replace('data-action="v12-drive-connect">Conectar Google',
        'data-action="v12-drive-connect" disabled>Conectar Google');
    };
  }
  document.addEventListener('click', function (event) {
    const btn = event.target.closest && event.target.closest('[data-action="v12-drive-connect"]');
    if (btn) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (typeof window.toast === 'function') window.toast(driveNotice, 'negative');
      else window.alert(driveNotice);
    }
  }, true);

  // O HTML web baixa JSON por <a download>, algo não confiável no Android WebView.
  // A versão APK cria o JSON em cache e abre o compartilhamento do Android.
  window.v12Export = async function () {
    const Filesystem = cap.Plugins && cap.Plugins.Filesystem;
    const Share = cap.Plugins && cap.Plugins.Share;
    if (!Filesystem || !Share) {
      throw new Error('Plugins de backup Android não encontrados. Execute npm install e npx cap sync android.');
    }
    if (typeof window.v12BuildBackup !== 'function') {
      throw new Error('A rotina de backup da V12 não está disponível.');
    }
    const backup = await window.v12BuildBackup();
    const date = typeof window.TODAY === 'function' ? window.TODAY() : new Date().toISOString().slice(0, 10);
    const name = 'ascensao-v12-backup-' + date + '-' + Date.now() + '.json';
    const file = await Filesystem.writeFile({
      path: name,
      data: JSON.stringify(backup),
      directory: 'CACHE',
      encoding: 'utf8'
    });
    await Share.share({
      title: 'Backup do ASCENSÃO',
      text: 'Escolha um destino para salvar o backup JSON do ASCENSÃO.',
      url: file.uri,
      dialogTitle: 'Salvar backup do ASCENSÃO'
    });
    // A tela de compartilhamento pode ser fechada sem realmente salvar o arquivo.
    // Por segurança, não declaramos o backup como concluído automaticamente.
    if (typeof window.toast === 'function')
      window.toast('Escolha um destino e confirme o salvamento do backup JSON.', 'positive');
    return true;
  };
  window.exportV3 = window.v12Export;

  document.documentElement.classList.add('app-capacitor-android');
  console.info('ASCENSÃO V12: integração Android ativa; dados locais mantidos na WebView.');
})();
