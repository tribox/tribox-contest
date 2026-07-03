// thead の deploy ボタン: 全行の記録を一括横開き
var headButton = document.querySelector('thead .contestresult-table-deploy-button');
if (headButton) {
  headButton.addEventListener('click', function() {
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


// ==========================================================================
// パズル名の展開/格納 (見出しのキューブアイコン / ><ボタン)
// ==========================================================================
(function () {
  var table = document.querySelector('.contestresult-table');
  if (!table) return;

  var puzzleIcon = document.querySelector('th.contestresult-table-col-puzzle img.contestresult-table-show-mobile');
  var headButton = document.querySelector('thead .contestresult-table-deploy-button');

  function isRecordsDeployed() {
    var detailTh = document.querySelector('th.contestresult-table-detail-records');
    return !!(detailTh && detailTh.classList.contains('deploy'));
  }

  function openPuzzle() {
    if (isRecordsDeployed() && headButton) {
      headButton.click();
    }
    if (window.innerWidth <= 768) {
      table.classList.add('puzzle-deploy');
    }
  }

  function closePuzzle() {
    table.classList.remove('puzzle-deploy');
  }

  if (puzzleIcon) {
    puzzleIcon.style.cursor = 'pointer';
    puzzleIcon.addEventListener('click', function () {
      if (table.classList.contains('puzzle-deploy')) {
        closePuzzle();
      } else {
        openPuzzle();
      }
    });
  }

  var collapseBtn = document.querySelector('.contestresult-puzzle-collapse-button');
  if (collapseBtn) {
    collapseBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closePuzzle();
    });
  }

  if (headButton) {
    headButton.addEventListener('click', function () {
      setTimeout(function () {
        if (isRecordsDeployed() && table.classList.contains('puzzle-deploy')) {
          closePuzzle();
        }
      }, 0);
    });
  }
})();

// ==========================================================================
// 個々の記録カルーセル: 全行を横スクロール同期
// ==========================================================================
(function () {
  var carousels = document.querySelectorAll('.contestresult-table-records');
  if (!carousels.length) return;
  var syncing = false;
  carousels.forEach(function (carousel) {
    carousel.addEventListener('scroll', function () {
      if (syncing) return;
      syncing = true;
      var scrollLeft = carousel.scrollLeft;
      carousels.forEach(function (other) {
        if (other !== carousel) other.scrollLeft = scrollLeft;
      });
      syncing = false;
    });
  });
})();
