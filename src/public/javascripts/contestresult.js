// thead の deploy ボタン: 全行の記録を一括横開き
var headButton = document.querySelector('thead .contestresult-table-deploy-button');
if (headButton) {
  var animatingTimer = null;
  headButton.addEventListener('click', function() {
    // 開閉アニメーション中は画面外の行を隠してレイアウト計算を軽くする
    var table = this.closest('table');
    table.classList.add('animating');
    clearTimeout(animatingTimer);
    animatingTimer = setTimeout(function() {
      table.classList.remove('animating');
    }, 350);

    var img = this.querySelector('img');
    var isDeployed = img.src.includes('deploy.png') && !img.src.includes('undeploy.png');
    if (isDeployed) {
      img.src = '/assets/images/icons/undeploy.png';
      img.title = 'undeploy';
      img.alt = 'undeploy';
    } else {
      img.src = '/assets/images/icons/deploy.png';
      img.title = 'deploy';
      img.alt = 'deploy';
    }
    document.querySelectorAll('.contestresult-table-detail-records').forEach(function(el) {
      el.classList.toggle('deploy');
    });
    table.classList.toggle('deployed');
  });
}

// フローティングのスクランブル: 元のスクランブルが見えたら (最下部) 非表示にする
var inflowScramble = document.querySelector('.contestresult-scramble-section:not(.contestresult-scramble-section-floating)');
var floatingScramble = document.querySelector('.contestresult-scramble-section-floating');
if (inflowScramble && floatingScramble && 'IntersectionObserver' in window) {
  var scrambleObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      floatingScramble.classList.toggle('contestresult-scramble-hidden', entry.isIntersecting);
    });
  });
  scrambleObserver.observe(inflowScramble);
}

// tbody の detail ボタン (333fm): アイコン切り替え
document.querySelectorAll('tbody .contestresult-table-deploy-button').forEach(function(button) {
  button.addEventListener('click', function() {
    var img = this.querySelector('img');
    var isOpen = img.src.includes('detail.png') && !img.src.includes('undetail.png');
    if (isOpen) {
      img.src = '/assets/images/icons/undetail.png';
      img.title = 'undetail';
      img.alt = 'undetail';
    } else {
      img.src = '/assets/images/icons/detail.png';
      img.title = 'detail';
      img.alt = 'detail';
    }
  });
});
