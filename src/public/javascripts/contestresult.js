var animatingTimer = null;
function markTableAnimating(table) {
  table.classList.add('animating');
  clearTimeout(animatingTimer);
  animatingTimer = setTimeout(function() {
    table.classList.remove('animating');
  }, 350);
}

// thead の deploy ボタン: 全行の記録を一括横開き
var headButton = document.querySelector('thead .contestresult-table-deploy-button:not(.contestresult-table-puzzle-toggle)');
if (headButton) {
  headButton.addEventListener('click', function() {
    var table = this.closest('table');
    markTableAnimating(table);

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

// thead のパズルボタン (スマホ): パズル名の列を一括横開き
var puzzleButton = document.querySelector('thead .contestresult-table-puzzle-toggle');
if (puzzleButton) {
  var pinRightTimer = null;
  puzzleButton.addEventListener('click', function() {
    var table = this.closest('table');
    var wrapper = table.closest('.contestresult-table-scroll');
    markTableAnimating(table);
    var opening = !table.classList.contains('puzzle-deployed');
    table.classList.toggle('puzzle-deployed');
    var img = this.querySelector('img');
    if (opening) {
      img.src = '/assets/images/icons/puzzle_name_close.png';
      img.title = '閉じる';
      img.alt = '閉じる';
    } else {
      img.src = '/assets/images/icons/cube_empty.png';
      img.title = 'パズル';
      img.alt = 'パズル';
    }
    clearTimeout(pinRightTimer);
    if (opening) {
      wrapper.classList.add('contestresult-table-scroll-pin-right');
    } else {
      // 閉じるアニメーションが終わってから rtl を外す (途中で外すと左端にジャンプする)
      pinRightTimer = setTimeout(function() {
        // rtl では scrollLeft が右端基準 (0 〜 負値) なので、外す前に見た目の位置を控えて復元する
        var maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
        var target = maxScroll + wrapper.scrollLeft;
        wrapper.classList.remove('contestresult-table-scroll-pin-right');
        wrapper.scrollLeft = target;
      }, 350);
    }
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
