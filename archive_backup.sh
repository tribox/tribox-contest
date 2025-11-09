#!/bin/bash
set -euxo pipefail

# Usage: ./archive_backup.sh 202501

# 引数チェック
if [ $# -ne 1 ]; then
    echo "Usage: $0 YYYYMM"
    exit 1
fi

TARGET=$1

# 1. アーカイブ先ディレクトリを作成
mkdir -p backup.archives/${TARGET}

# 2. backupディレクトリ内の該当ファイルを移動
mv backup/tribox-contest-curl.${TARGET}* backup.archives/${TARGET}/

# 3. 圧縮アーカイブを作成
cd backup.archives
tar czf ${TARGET}.tar.gz ${TARGET}

# 4. 元ディレクトリを削除
rm -rf ${TARGET}

# 5. 元のディレクトリに戻る
cd ..

echo "✅ Backup archive created: backup.archives/${TARGET}.tar.gz"
